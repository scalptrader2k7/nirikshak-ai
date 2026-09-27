import pandas as pd
from typing import Dict, Any, List, Optional
from src.api.data_loader import get_clean_df, get_features_df

CONCENTRATION_DISCLAIMER = "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption. Concentration indicators describe administrative distribution patterns across categories, authorities, and timeframes to assist oversight review."

def get_concentration_analytics(allowed_record_ids: Optional[List[int]] = None) -> Dict[str, Any]:
    """
    Computes concentration indicators and pattern metrics using existing clean and engineered features.
    Provides statistical aggregation across categories, IDAs, constituencies, temporal clusters, and financial shares.
    """
    clean_df = get_clean_df()
    if clean_df.empty:
        return {
            "total_projects": 0,
            "total_allocation": 0.0,
            "category_concentration": [],
            "ida_concentration": [],
            "constituency_concentration": [],
            "temporal_bursts": [],
            "allocation_concentration": {},
            "disclaimer": CONCENTRATION_DISCLAIMER
        }

    feat_df = get_features_df()
    
    # Merge rolling 30-day pattern features if present
    cols_to_merge = ["original_row_index", "constituency_recommendations_rolling_30d", "mp_recommendations_rolling_30d"]
    if not feat_df.empty and "constituency_recommendations_rolling_30d" in feat_df.columns:
        merged = pd.merge(
            clean_df,
            feat_df[[c for c in cols_to_merge if c in feat_df.columns]],
            on="original_row_index",
            how="left"
        )
    else:
        merged = clean_df.copy()

    if allowed_record_ids is not None:
        merged = merged[merged["original_row_index"].isin(allowed_record_ids)]

    total_projects = len(merged)
    total_alloc = float(merged["allocation_amount"].dropna().sum()) if not merged.empty else 0.0

    if total_projects == 0:
        return {
            "total_projects": 0,
            "total_allocation": 0.0,
            "category_concentration": [],
            "ida_concentration": [],
            "constituency_concentration": [],
            "temporal_bursts": [],
            "allocation_concentration": {},
            "disclaimer": CONCENTRATION_DISCLAIMER
        }

    # 1. Category Concentration
    cat_groups = merged.groupby("category")
    cat_list = []
    for cat_name, grp in cat_groups:
        if pd.isnull(cat_name):
            continue
        c_count = len(grp)
        c_alloc = float(grp["allocation_amount"].dropna().sum())
        share_alloc = round((c_alloc / total_alloc * 100), 2) if total_alloc > 0 else 0.0
        share_proj = round((c_count / total_projects * 100), 2)
        cat_list.append({
            "category": str(cat_name),
            "project_count": c_count,
            "total_allocation": round(c_alloc, 2),
            "allocation_share_percent": share_alloc,
            "project_share_percent": share_proj,
            "indicator": "concentration indicator" if share_alloc > 25.0 else "standard distribution"
        })
    cat_list.sort(key=lambda x: x["total_allocation"], reverse=True)

    # 2. IDA Concentration (Top 10)
    ida_groups = merged.groupby("ida")
    ida_list = []
    for ida_name, grp in ida_groups:
        if pd.isnull(ida_name) or str(ida_name).strip() == "":
            continue
        i_count = len(grp)
        i_alloc = float(grp["allocation_amount"].dropna().sum())
        share_alloc = round((i_alloc / total_alloc * 100), 2) if total_alloc > 0 else 0.0
        ida_list.append({
            "ida_name": str(ida_name).strip(),
            "project_count": i_count,
            "total_allocation": round(i_alloc, 2),
            "allocation_share_percent": share_alloc,
            "indicator": "concentration indicator" if share_alloc > 15.0 else "standard distribution"
        })
    ida_list.sort(key=lambda x: x["total_allocation"], reverse=True)
    top_idas = ida_list[:10]

    # 3. Constituency Concentration (Top 10)
    const_groups = merged.groupby("constituency")
    const_list = []
    for const_name, grp in const_groups:
        if pd.isnull(const_name) or str(const_name).strip() == "":
            continue
        cn_count = len(grp)
        cn_alloc = float(grp["allocation_amount"].dropna().sum())
        share_alloc = round((cn_alloc / total_alloc * 100), 2) if total_alloc > 0 else 0.0
        const_list.append({
            "constituency": str(const_name).strip(),
            "project_count": cn_count,
            "total_allocation": round(cn_alloc, 2),
            "allocation_share_percent": share_alloc,
            "indicator": "concentration indicator" if share_alloc > 15.0 else "standard distribution"
        })
    const_list.sort(key=lambda x: x["total_allocation"], reverse=True)
    top_const = const_list[:10]

    # 4. Temporal Bursts (Clusters of recommendations within 30 days)
    temporal_bursts: List[Dict[str, Any]] = []
    if "constituency_recommendations_rolling_30d" in merged.columns:
        burst_df = merged[merged["constituency_recommendations_rolling_30d"] > 50].sort_values(
            by="constituency_recommendations_rolling_30d", ascending=False
        )
        seen_const_bursts = set()
        for _, b_row in burst_df.iterrows():
            c_name = str(b_row.get("constituency", ""))
            r_date = str(b_row.get("recommended_date", ""))
            b_key = f"{c_name}_{r_date[:7]}"  # cluster by constituency + month
            if b_key in seen_const_bursts:
                continue
            seen_const_bursts.add(b_key)
            rolling_val = int(b_row.get("constituency_recommendations_rolling_30d", 0))
            temporal_bursts.append({
                "constituency": c_name,
                "state": str(b_row.get("state", "")),
                "mp_name": str(b_row.get("mp_name", "")),
                "time_window": r_date[:10] if r_date else "Snapshot Period",
                "rolling_30d_recommendation_count": rolling_val,
                "pattern_classification": "pattern requiring contextual review",
                "note": f"Constituency registered {rolling_val} project recommendations within an observed 30-day window."
            })
            if len(temporal_bursts) >= 10:
                break

    # 5. Financial Allocation Concentration (Top decile and quintile shares)
    allocs = merged["allocation_amount"].dropna().sort_values(ascending=False)
    top_10pct_count = max(1, int(len(allocs) * 0.1))
    top_10pct_sum = float(allocs.iloc[:top_10pct_count].sum()) if not allocs.empty else 0.0
    top_10pct_share = round((top_10pct_sum / total_alloc * 100), 2) if total_alloc > 0 else 0.0

    allocation_summary = {
        "total_allocation": round(total_alloc, 2),
        "total_projects": total_projects,
        "top_10_percent_projects_count": top_10pct_count,
        "top_10_percent_allocation_share": top_10pct_share,
        "largest_single_allocation": float(allocs.iloc[0]) if not allocs.empty else 0.0,
        "smallest_single_allocation": float(allocs.iloc[-1]) if not allocs.empty else 0.0,
        "median_allocation": float(allocs.median()) if not allocs.empty else 0.0,
        "indicator": "pattern requiring contextual review" if top_10pct_share > 50.0 else "moderate concentration"
    }

    return {
        "total_projects": total_projects,
        "total_allocation": round(total_alloc, 2),
        "category_concentration": cat_list,
        "ida_concentration": top_idas,
        "constituency_concentration": top_const,
        "temporal_bursts": temporal_bursts,
        "allocation_concentration": allocation_summary,
        "interpretation": "Concentration indicators identify clusters or patterns requiring contextual review. They do not indicate wrongdoing or corruption.",
        "disclaimer": CONCENTRATION_DISCLAIMER
    }
