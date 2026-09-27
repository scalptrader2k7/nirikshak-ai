import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from src.api.data_loader import get_clean_df, get_duplicate_pairs_df

DUPLICATE_DISCLAIMER = "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption. Duplicate signals identify textual, financial, or contextual recurrence for administrative verification."

_ALL_DUPLICATE_PAIRS_CACHE: Optional[List[Dict[str, Any]]] = None

def _calculate_date_gap(d1: Any, d2: Any) -> Optional[int]:
    if pd.isnull(d1) or pd.isnull(d2):
        return None
    try:
        dt1 = pd.to_datetime(d1)
        dt2 = pd.to_datetime(d2)
        return abs((dt1 - dt2).days)
    except Exception:
        return None

def _build_all_duplicate_pairs() -> List[Dict[str, Any]]:
    global _ALL_DUPLICATE_PAIRS_CACHE
    if _ALL_DUPLICATE_PAIRS_CACHE is not None:
        return _ALL_DUPLICATE_PAIRS_CACHE

    clean_df = get_clean_df()
    if clean_df.empty:
        return []

    rec_dict = clean_df.set_index("original_row_index").to_dict(orient="index")
    pairs_list: List[Dict[str, Any]] = []
    seen_pairs = set()

    # 1. Exact duplicates from exact_duplicate_group_id
    groups = clean_df.groupby("exact_duplicate_group_id")
    for group_id, grp in groups:
        if pd.isnull(group_id) or str(group_id).strip() == "" or len(grp) < 2:
            continue
        ids = sorted(grp["original_row_index"].tolist())
        for i in range(len(ids)):
            for j in range(i + 1, len(ids)):
                id_a, id_b = ids[i], ids[j]
                seen_pairs.add((id_a, id_b))
                r_a = rec_dict.get(id_a, {})
                r_b = rec_dict.get(id_b, {})
                amt_a = float(r_a["allocation_amount"]) if pd.notnull(r_a.get("allocation_amount")) else None
                amt_b = float(r_b["allocation_amount"]) if pd.notnull(r_b.get("allocation_amount")) else None
                amt_diff = round(abs(amt_a - amt_b), 2) if (amt_a is not None and amt_b is not None) else None
                amt_ratio = round(amt_a / amt_b, 3) if (amt_a is not None and amt_b is not None and amt_b > 0) else 1.0

                pairs_list.append({
                    "record_id": id_a,
                    "matched_record_id": id_b,
                    "duplicate_type": "EXACT_DUPLICATE",
                    "classification": "EXACT_DUPLICATE_RECORD",
                    "similarity_score": 1.0,
                    "exact_group_id": str(group_id),
                    "amount_difference": amt_diff,
                    "amount_ratio": amt_ratio,
                    "date_gap_days": _calculate_date_gap(r_a.get("recommended_date"), r_b.get("recommended_date")),
                    "same_state": bool(str(r_a.get("state", "")).strip().lower() == str(r_b.get("state", "")).strip().lower()),
                    "same_constituency": bool(str(r_a.get("constituency", "")).strip().lower() == str(r_b.get("constituency", "")).strip().lower()),
                    "same_ida": bool(str(r_a.get("ida", "")).strip().lower() == str(r_b.get("ida", "")).strip().lower()),
                    "reason": f"Project record shares identical text description, categorical tags, and financial properties with record #{id_b} (Exact Group: {group_id})."
                })

    # 2. Near duplicates from pairs_df
    pairs_df = get_duplicate_pairs_df()
    if not pairs_df.empty:
        for _, pair in pairs_df.iterrows():
            ra = int(pair["record_a"])
            rb = int(pair["record_b"])
            id_a, id_b = min(ra, rb), max(ra, rb)
            if (id_a, id_b) in seen_pairs:
                continue
            seen_pairs.add((id_a, id_b))
            r_a = rec_dict.get(id_a, {})
            r_b = rec_dict.get(id_b, {})
            amt_a = float(r_a.get("allocation_amount")) if pd.notnull(r_a.get("allocation_amount")) else None
            amt_b = float(r_b.get("allocation_amount")) if pd.notnull(r_b.get("allocation_amount")) else None
            amt_diff = round(abs(amt_a - amt_b), 2) if (amt_a is not None and amt_b is not None) else None
            amt_ratio = float(pair.get("amount_ratio")) if pd.notnull(pair.get("amount_ratio")) else None
            context_score = float(pair.get("near_duplicate_context_score", 0.0))
            text_sim = float(pair.get("text_similarity", 1.0))
            pair_type = str(pair.get("pair_type", "contextual_near_duplicate"))

            freq_a = float(pair.get("work_template_frequency_a", 0))
            freq_b = float(pair.get("work_template_frequency_b", 0))
            if "template" in pair_type.lower() or freq_a > 5 or freq_b > 5:
                classification = "TEMPLATE_SIMILARITY"
                reason = f"Standardized administrative work template recurring across recommendations with project #{id_b}."
            elif context_score >= 0.7 or pair_type == "potentially_suspicious":
                classification = "POTENTIAL_NEAR_DUPLICATE"
                reason = f"High contextual similarity ({round(context_score, 2)}) and text match ({round(text_sim, 2)}) with project #{id_b}."
            else:
                classification = "CONTEXTUAL_SIMILARITY"
                reason = f"Contextual textual similarity ({round(text_sim, 2)}) with project #{id_b} requiring administrative review."

            pairs_list.append({
                "record_id": id_a,
                "matched_record_id": id_b,
                "duplicate_type": "NEAR_DUPLICATE",
                "classification": classification,
                "similarity_score": round(context_score if context_score > 0 else text_sim, 3),
                "exact_group_id": None,
                "amount_difference": amt_diff,
                "amount_ratio": amt_ratio,
                "date_gap_days": _calculate_date_gap(r_a.get("recommended_date"), r_b.get("recommended_date")),
                "same_state": bool(pair.get("same_state", False)),
                "same_constituency": bool(pair.get("same_constituency", False)),
                "same_ida": bool(str(r_a.get("ida", "")).strip().lower() == str(r_b.get("ida", "")).strip().lower()),
                "reason": reason
            })

    _ALL_DUPLICATE_PAIRS_CACHE = pairs_list
    return pairs_list

def get_duplicates_for_project(record_id: int) -> Dict[str, Any]:
    """
    Retrieves all exact and near duplicate relationships for a given project record.
    Reuses pre-computed exact duplicate groupings and NLP near-duplicate pair outputs.
    """
    all_pairs = _build_all_duplicate_pairs()
    matches_list = []

    for p in all_pairs:
        if p["record_id"] == record_id:
            matches_list.append(p)
        elif p["matched_record_id"] == record_id:
            # Invert perspective so record_id is the primary requested ID
            inv = dict(p)
            inv["record_id"] = record_id
            inv["matched_record_id"] = p["record_id"]
            if inv["amount_ratio"] is not None and inv["amount_ratio"] > 0:
                inv["amount_ratio"] = round(1.0 / inv["amount_ratio"], 3)
            matches_list.append(inv)

    exact_count = sum(1 for m in matches_list if m["duplicate_type"] == "EXACT_DUPLICATE")
    near_count = sum(1 for m in matches_list if m["duplicate_type"] == "NEAR_DUPLICATE")

    return {
        "record_id": record_id,
        "total_matches": len(matches_list),
        "exact_duplicate_count": exact_count,
        "near_duplicate_count": near_count,
        "matches": matches_list,
        "disclaimer": DUPLICATE_DISCLAIMER
    }

def get_paginated_duplicates(
    page: int = 1,
    page_size: int = 20,
    duplicate_type: Optional[str] = None,
    classification: Optional[str] = None,
    allowed_record_ids: Optional[List[int]] = None
) -> Tuple[List[Dict[str, Any]], int, int]:
    """
    Returns a paginated list of duplicate relationship entries across authorized scope.
    """
    all_pairs = _build_all_duplicate_pairs()
    filtered: List[Dict[str, Any]] = []
    allowed_set = set(allowed_record_ids) if allowed_record_ids is not None else None

    for p in all_pairs:
        if allowed_set is not None:
            if p["record_id"] not in allowed_set and p["matched_record_id"] not in allowed_set:
                continue
        if duplicate_type and p["duplicate_type"].upper() != duplicate_type.upper().strip():
            continue
        if classification and p["classification"].upper() != classification.upper().strip():
            continue
        filtered.append(p)

    total_records = len(filtered)
    total_pages = max(1, (total_records + page_size - 1) // page_size) if total_records > 0 else 0

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    sliced = filtered[start_idx:end_idx]

    return sliced, total_records, total_pages
