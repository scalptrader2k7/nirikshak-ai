import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from src.anomaly_detection.config import (
    SIMILARITY_THRESHOLD,
    NEAR_DUPLICATE_CONTEXT_SCORE_THRESHOLD,
    WEIGHT_ND_TEXT,
    WEIGHT_ND_LOCATION,
    WEIGHT_ND_CONSTITUENCY,
    WEIGHT_ND_AMOUNT,
    WEIGHT_ND_WORK_TYPE,
    WEIGHT_ND_DATE,
    WEIGHT_ND_CROSS_MP
)
from src.anomaly_detection.evidence import create_evidence

def get_location_similarity_loo(row_a, row_b):
    """
    Calculates fraction of populated matching location fields between two records.
    Avoids treating missing-vs-missing as a match.
    """
    loc_cols = ["state", "constituency", "city", "ward", "block", "village"]
    matches = 0
    comparable = 0
    
    for col in loc_cols:
        val_a = str(row_a.get(col, "")).strip().lower()
        val_b = str(row_b.get(col, "")).strip().lower()
        
        a_pop = (val_a != "" and val_a != "nan" and val_a != "none")
        b_pop = (val_b != "" and val_b != "nan" and val_b != "none")
        
        if a_pop or b_pop:
            comparable += 1
            if a_pop and b_pop and val_a == val_b:
                matches += 1
                
    return float(matches / comparable) if comparable > 0 else 0.0

def detect_near_duplicates(df, similarity_threshold=None, use_blocking=True):
    """
    Upgraded Near-Duplicate Detector implementing Step 3.1 contextual suspicion.
    
    Calculates template frequency, discounts text similarity for common templates,
    computes contextual metrics, and assigns a contextual score to classify pairs.
    """
    if similarity_threshold is None:
        similarity_threshold = SIMILARITY_THRESHOLD
        
    evidence_list = [[] for _ in range(len(df))]
    anomaly_triggered = [False] * len(df)
    duplicate_pairs = []
    
    n_records = len(df)
    
    # 1. Calculate Template Frequencies for each record
    norm_texts = df["normalized_work_text"].fillna("").astype(str)
    template_freqs = norm_texts.value_counts().to_dict()
    df_calc = df.copy()
    df_calc["work_template_frequency"] = norm_texts.apply(lambda x: template_freqs.get(x, 1))
    
    # 2. Vectorize texts
    texts_list = norm_texts.tolist()
    if not any(t.strip() for t in texts_list):
        return evidence_list, anomaly_triggered, duplicate_pairs
        
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(texts_list)
    
    # 3. Candidate Generation (Blocking)
    compare_pairs = []
    if use_blocking:
        block_keys_1 = df["blocking_key_work_type_state"].fillna("").astype(str).tolist()
        block_keys_2 = df["blocking_key_work_type_constituency"].fillna("").astype(str).tolist()
        
        map_1 = {}
        map_2 = {}
        for idx in range(n_records):
            key1 = block_keys_1[idx]
            key2 = block_keys_2[idx]
            if key1 != "":
                map_1.setdefault(key1, []).append(idx)
            if key2 != "":
                map_2.setdefault(key2, []).append(idx)
                
        seen_pairs = set()
        for idx_list in list(map_1.values()) + list(map_2.values()):
            if len(idx_list) > 1:
                for i in range(len(idx_list)):
                    for j in range(i+1, len(idx_list)):
                        idx_a = idx_list[i]
                        idx_b = idx_list[j]
                        if idx_a > idx_b:
                            idx_a, idx_b = idx_b, idx_a
                        if (idx_a, idx_b) not in seen_pairs:
                            seen_pairs.add((idx_a, idx_b))
                            compare_pairs.append((idx_a, idx_b))
    else:
        for i in range(n_records):
            for j in range(i+1, n_records):
                compare_pairs.append((i, j))
                
    # 4. Pairwise Analysis
    for i, j in compare_pairs:
        # Exclude exact duplicates
        if df.loc[i, "exact_duplicate_group_id"] == df.loc[j, "exact_duplicate_group_id"]:
            continue
            
        # Text similarity (Cosine similarity)
        sim = float(cosine_similarity(tfidf_matrix[i], tfidf_matrix[j])[0][0])
        
        # Check threshold
        if sim < similarity_threshold:
            continue
            
        row_i = df_calc.iloc[i]
        row_j = df_calc.iloc[j]
        
        # Template frequency metrics
        freq_a = int(row_i["work_template_frequency"])
        freq_b = int(row_j["work_template_frequency"])
        max_freq = max(freq_a, freq_b)
        
        # Bounded Template Frequency Discount
        freq_discount = max(0.0, min(1.0, 1.0 - (max_freq - 1) / 50.0))
        text_contribution = sim * freq_discount
        
        # Location checks
        same_state = bool(row_i["state"] == row_j["state"])
        same_const = bool(row_i["constituency"] == row_j["constituency"])
        same_block = bool(str(row_i.get("block", "")).strip().lower() == str(row_j.get("block", "")).strip().lower() and pd.notnull(row_i.get("block")) and str(row_i.get("block")).strip() != "")
        same_village = bool(str(row_i.get("village", "")).strip().lower() == str(row_j.get("village", "")).strip().lower() and pd.notnull(row_i.get("village")) and str(row_i.get("village")).strip() != "")
        same_city = bool(str(row_i.get("city", "")).strip().lower() == str(row_j.get("city", "")).strip().lower() and pd.notnull(row_i.get("city")) and str(row_i.get("city")).strip() != "")
        same_ward = bool(str(row_i.get("ward", "")).strip().lower() == str(row_j.get("ward", "")).strip().lower() and pd.notnull(row_i.get("ward")) and str(row_i.get("ward")).strip() != "")
        
        loc_sim = get_location_similarity_loo(row_i, row_j)
        same_wtype = bool(row_i["work_type"] == row_j["work_type"])
        
        # Amount ratio
        amt_a = row_i["allocation_amount"]
        amt_b = row_j["allocation_amount"]
        if pd.notnull(amt_a) and pd.notnull(amt_b) and amt_a > 0 and amt_b > 0:
            amt_ratio = float(min(amt_a, amt_b) / max(amt_a, amt_b))
        else:
            amt_ratio = 0.0
            
        # MP
        same_mp = bool(row_i["mp_name"] == row_j["mp_name"])
        diff_mp = not same_mp
        
        # Date Gap & Date Proximity
        date_a = pd.to_datetime(row_i["recommended_date"], errors="coerce")
        date_b = pd.to_datetime(row_j["recommended_date"], errors="coerce")
        
        if pd.notnull(date_a) and pd.notnull(date_b):
            date_gap = float(abs((date_a - date_b).days))
            date_prox = max(0.0, 1.0 - date_gap / 365.0)
        else:
            date_gap = np.nan
            date_prox = 0.0
            
        # Cross-MP signal
        if diff_mp and same_const and (loc_sim >= 0.5 or amt_ratio >= 0.8 or date_prox >= 0.8):
            cross_mp = 1.0
        else:
            cross_mp = 0.0
            
        # Weighted context score
        context_score = (
            WEIGHT_ND_TEXT * text_contribution +
            WEIGHT_ND_LOCATION * loc_sim +
            WEIGHT_ND_CONSTITUENCY * (1.0 if same_const else 0.0) +
            WEIGHT_ND_AMOUNT * amt_ratio +
            WEIGHT_ND_WORK_TYPE * (1.0 if same_wtype else 0.0) +
            WEIGHT_ND_DATE * date_prox +
            WEIGHT_ND_CROSS_MP * cross_mp
        )
        context_score = float(round(context_score, 4))
        
        # Classify Pair
        if context_score >= NEAR_DUPLICATE_CONTEXT_SCORE_THRESHOLD:
            ptype = "potentially_suspicious"
            sev = "high"
        elif context_score >= 0.40:
            ptype = "contextual_near_duplicate"
            sev = "medium"
        else:
            ptype = "template_match"
            sev = "low"
            
        # Duplicate pair entry
        duplicate_pairs.append({
            "record_a": int(row_i["original_row_index"]),
            "record_b": int(row_j["original_row_index"]),
            "text_similarity": sim,
            "work_template_frequency_a": freq_a,
            "work_template_frequency_b": freq_b,
            "same_state": same_state,
            "same_constituency": same_const,
            "same_block": same_block,
            "same_village": same_village,
            "same_city": same_city,
            "same_ward": same_ward,
            "location_similarity": loc_sim,
            "same_work_type": same_wtype,
            "amount_ratio": amt_ratio,
            "same_mp": same_mp,
            "different_mp": diff_mp,
            "date_gap_days": date_gap if pd.notnull(date_gap) else None,
            "near_duplicate_context_score": context_score,
            "pair_type": ptype,
            "evidence": f"Text similarity {sim:.2f}, context score {context_score:.2f} ({ptype})."
        })
        
        # Add Evidence Objects
        msg = f"Near-duplicate match: {ptype} (Index: {row_j['original_row_index']}, score: {context_score:.2f}, text sim: {sim:.2f})."
        if ptype == "potentially_suspicious":
            msg = f"Suspicious near-duplicate overlap: Same constituency, similar amount, and date proximity (Index: {row_j['original_row_index']}, score: {context_score:.2f})."
            
        evidence_i = create_evidence("near_duplicate", "contextual_near_duplicate", sev, msg, context_score, row_j["original_row_index"], "score")
        # Attach meta data to evidence dictionary directly (useful for audit tracking)
        evidence_i["record_a"] = int(row_i["original_row_index"])
        evidence_i["record_b"] = int(row_j["original_row_index"])
        
        msg_j = f"Near-duplicate match: {ptype} (Index: {row_i['original_row_index']}, score: {context_score:.2f}, text sim: {sim:.2f})."
        if ptype == "potentially_suspicious":
            msg_j = f"Suspicious near-duplicate overlap: Same constituency, similar amount, and date proximity (Index: {row_i['original_row_index']}, score: {context_score:.2f})."
            
        evidence_j = create_evidence("near_duplicate", "contextual_near_duplicate", sev, msg_j, context_score, row_i["original_row_index"], "score")
        evidence_j["record_a"] = int(row_j["original_row_index"])
        evidence_j["record_b"] = int(row_i["original_row_index"])
        
        evidence_list[i].append(evidence_i)
        evidence_list[j].append(evidence_j)
        
        # ONLY potentially_suspicious relationships trigger record-level anomaly flag
        if ptype == "potentially_suspicious":
            anomaly_triggered[i] = True
            anomaly_triggered[j] = True
            
    return evidence_list, anomaly_triggered, duplicate_pairs
