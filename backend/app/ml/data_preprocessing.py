"""
Yetria Career Guidance Platform - Data Preprocessing Utilities

This module provides functions for missing value imputation, outlier detection,
and winsorization (IQR capping) to be applied to data fetched from the database
via `fetch_data.py`. It also generates basic EDA output.

This file is designed to be called via `fetch_data.py --impute --use-dp`
without modification.
"""

from __future__ import annotations

from pathlib import Path
from typing import List, Tuple, Any, Optional

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt


# Optional: previously used schema constants for training data
# If these columns don't exist, functions will automatically work with available columns
TARGET_COLUMN = "meslek_grubu"
FEATURE_COLUMNS: List[str] = [
    "sayisal_zeka_skor",
    "analitik_dusunme_skor",
    "stres_yonetimi_skor",
    "empati_skor",
    "takim_calismasi_skor",
    "hizli_karar_alma_skor",
    "duygusal_dayaniklilik_skor",
    "teknoloji_adaptasyonu_skor",
]


def _numeric_columns(df: pd.DataFrame) -> List[str]:
    return [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]


def run_basic_eda(df: pd.DataFrame) -> None:
    print("\n=== First 5 Observations (head) ===")
    print(df.head())

    print("\n=== Data Information (info) ===")
    df.info()

    num_cols = _numeric_columns(df)
    if num_cols:
        print("\n=== Descriptive Statistics (describe) ===")
        print(df[num_cols].describe().T)

    print("\n=== Missing Value Counts (isnull.sum) ===")
    print(df.isnull().sum().sort_values(ascending=False))


def summarize_missing(df: pd.DataFrame) -> pd.DataFrame:
    total = len(df) if len(df) > 0 else 1
    null_counts = df.isnull().sum()
    summary = (
        pd.DataFrame({
            "null_count": null_counts,
            "null_ratio": (null_counts / total).round(4),
        })
        .query("null_count > 0")
        .sort_values("null_count", ascending=False)
    )
    summary.index.name = "column"
    return summary


def impute_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Simple imputation: median for numeric, mode for categorical, 'Unknown' otherwise."""
    filled = df.copy()
    for col in df.columns:
        if not filled[col].isnull().any():
            continue
        s = filled[col]
        if pd.api.types.is_numeric_dtype(s):
            val = s.median()
        else:
            mode_series = s.mode(dropna=True)
            val = mode_series.iloc[0] if len(mode_series) > 0 else "Unknown"
        filled[col] = s.fillna(val)
    return filled


def impute_missing_values_smart(df: pd.DataFrame) -> pd.DataFrame:
    """Advanced imputation: median for numeric, mode for text/bool; general purpose."""
    return impute_missing_values(df)


def cap_outliers_percentile(df: pd.DataFrame, lower_quantile: float = 0.01, upper_quantile: float = 0.99) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Applies percentile-based capping to numeric columns and returns logs.
    This method caps the extreme 1% lower and upper portions of the data to
    reduce the impact of outliers on the model.
    """
    capped = df.copy()
    logs = []
    
    for col in _numeric_columns(df):
        s = capped[col]
        if s.dropna().empty:
            continue
        
        lower_bound = s.quantile(lower_quantile)
        upper_bound = s.quantile(upper_quantile)
        
        before = s.copy()
        capped[col] = s.clip(lower=lower_bound, upper=upper_bound)
        
        logs.append({
            "column": col,
            "cap_low": int((before < lower_bound).sum()),
            "cap_high": int((before > upper_bound).sum()),
            "lower_bound": round(lower_bound, 4),
            "upper_bound": round(upper_bound, 4),
        })
        
    log_df = pd.DataFrame(logs).set_index("column") if logs else pd.DataFrame(
        columns=["cap_low", "cap_high", "lower_bound", "upper_bound"]
    )
    return capped, log_df