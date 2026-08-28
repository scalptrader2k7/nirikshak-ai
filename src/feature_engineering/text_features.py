import re
import pandas as pd
import numpy as np

def clean_text_for_features(text):
    if pd.isnull(text):
        return ""
    # Lowercase and strip punctuation/accidental symbols, collapse whitespace
    s = str(text).lower().strip()
    s = re.sub(r'[^\w\s]', ' ', s) # replace punctuation with space
    s = " ".join(s.split())
    return s

def compute_text_features(df):
    """
    Computes text-based features on the 'work' column of the dataframe.
    Adjustments applied: Independent keyword flags are preserved.
    """
    # 1. Normalized work text
    normalized_texts = df["work"].apply(clean_text_for_features)
    
    # 2. Basic text metrics
    work_text_length = df["work"].astype(str).str.len()
    
    def get_word_counts(text):
        words = text.split()
        return len(words), len(set(words))
        
    counts = [get_word_counts(t) for t in normalized_texts]
    work_word_count = [c[0] for c in counts]
    work_unique_word_count = [c[1] for c in counts]
    
    # 3. Independent keyword matching flags
    # We define a map of key: list of keywords matching that concept
    keywords_map = {
        "road": ["road", "pathway", "culvert", "bridge", "ghat", "stair"],
        "building": ["building", "hall", "community center", "shed", "room", "crematorium", "structure", "anganwadi", "crèche", "cremation"],
        "water": ["water", "drinking", "pump", "well", "tube", "borewell", "tank", "pond", "lake"],
        "electrical": ["light", "lighting", "electricity", "energy", "solar"],
        "school": ["school", "college", "educational", "smart board", "projector", "furniture", "it system", "library"],
        "health": ["health", "hospital", "prosthetic", "wheel chair", "tricycle", "ambulance", "aid", "disabled", "abled"],
        "drainage": ["drain", "drainage", "gutter"],
        "repair": ["repair", "renovation", "improvement"]
    }
    
    # Pre-compile regex with optional plural s
    patterns = {category: re.compile(r'\b(' + '|'.join(words) + r')s?\b') for category, words in keywords_map.items()}
    
    # Compute independent boolean flags
    flags = {}
    for category, pattern in patterns.items():
        flags[f"work_has_{category}_keyword"] = normalized_texts.apply(
            lambda x: bool(pattern.search(x))
        )
        
    # 4. Primary convenience classification 'work_type'
    # Priority order for primary assignment:
    priority = ["water", "road", "building", "drainage", "electrical", "school", "health", "repair"]
    
    def determine_primary_type(row_idx):
        text = normalized_texts.iloc[row_idx]
        for cat in priority:
            if flags[f"work_has_{cat}_keyword"].iloc[row_idx]:
                return cat
        return "other"
        
    work_type = [determine_primary_type(i) for i in range(len(df))]
    
    # Combine into a new features DataFrame
    text_feat_df = pd.DataFrame({
        "normalized_work_text": normalized_texts,
        "work_text_length": work_text_length,
        "work_word_count": work_word_count,
        "work_unique_word_count": work_unique_word_count,
        "work_type": work_type
    })
    
    for flag_name, flag_series in flags.items():
        text_feat_df[flag_name] = flag_series
        
    return text_feat_df
