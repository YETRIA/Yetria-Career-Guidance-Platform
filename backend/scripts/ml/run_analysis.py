"""
YETRIA Career Prediction Model - Phase 1: Visual Analysis Script

This script reads preprocessed data converted to competency scores
and generates visualizations analyzing relationships between career groups
(persona) and competency scores.

Generated visualizations are saved to 'backend/reports/' folder.

Usage:
From backend folder:
python scripts/ml/run_analysis.py

or directly:
python -m scripts.ml.run_analysis
"""

import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

# Add backend root to Python path
backend_path = Path(__file__).resolve().parents[2]  # scripts/ml/run_analysis.py -> backend/
sys.path.insert(0, str(backend_path))

from app.ml.visualization import plot_correlations_by_persona, ensure_reports_dir, plot_radar_chart, plot_box_plots, plot_feature_importance
import joblib

# --- Constants ---
DATA_FILE_PATH = backend_path / "data" / "aggregated_scores.csv"
REPORTS_DIR_PATH = backend_path / "reports"

def analyze_correlations(data_path: Path):
    """
    Loads data, creates reports directory and visualizes
    occupation-competency correlations.
    """
    print(f"[1/3] Loading '{data_path}' data for analysis...")
    try:
        df = pd.read_csv(data_path)
        print(f"Data loaded successfully. Rows: {df.shape[0]}, Columns: {df.shape[1]}")
    except FileNotFoundError:
        print(f"ERROR: '{data_path}' file not found. Please make sure you have run 'run_pipeline.py' script.")
        return

    print(f"[2/4] Creating persona-based correlation visualizations...")
    plot_correlations_by_persona(df, persona_col="persona")
    
    print("\n[+] Creating radar chart for occupation profiles...")
    plot_radar_chart(df, REPORTS_DIR_PATH)

    print("\n[+] Creating box plots for competency distributions...")
    plot_box_plots(df, REPORTS_DIR_PATH)
    print("Original analysis visualizations created.")

    print("[3/4] Creating symmetric analysis chart for Computer Engineer=1...")
    df['persona_ce'] = df['persona'].apply(lambda x: 1 if x == 'Computer Engineer' else 0)

    # Calculate correlation between features and new target (point-biserial via Pearson)
    # Take all numeric columns except identifiers/target; robust to missing columns
    numeric_cols = df.select_dtypes(include=np.number).columns
    feature_cols = [c for c in numeric_cols if c not in ['id', 'persona_ce']]
    correlations_ce = df[feature_cols].corrwith(df['persona_ce']).dropna()
    # Sort by absolute strength and limit to top 30 for readability
    correlations_ce = correlations_ce.reindex(correlations_ce.abs().sort_values(ascending=False).index)
    top_n = min(30, len(correlations_ce))
    correlations_ce = correlations_ce.iloc[:top_n]
    
    print("\nPersona (Computer Engineer=1) vs Competency Correlation Values:")
    print(correlations_ce)

    # Visualization
    if correlations_ce.empty:
        print("Warning: No valid correlations to plot (all NaN or insufficient data). Skipping symmetric chart.")
    else:
        plt.figure(figsize=(10, max(6, 0.3 * len(correlations_ce))))
        sns.barplot(x=correlations_ce.values, y=correlations_ce.index, palette="viridis_r") # Reversed color palette
        plt.title("Persona (Computer Engineer=1) vs Competency Correlation (Symmetric Chart)")
        plt.xlabel("Correlation (r)")
        plt.ylabel("Competency")
        plt.axvline(0, color="black", linewidth=1)
        plt.tight_layout()
    
    # Ensure reports directory exists
    ensure_reports_dir(str(REPORTS_DIR_PATH))
    symmetric_chart_path = REPORTS_DIR_PATH / "corr_persona_pointbiserial_CE.png"
    if not correlations_ce.empty:
        plt.savefig(symmetric_chart_path, dpi=150)
        print(f"Symmetric analysis chart saved to: {symmetric_chart_path}")

    # --- Feature Importance (using latest optimized model) ---
    print("\n[4/4] Generating feature importance chart using latest optimized model...")
    artifacts_dir = backend_path / "artifacts"
    if artifacts_dir.exists():
        optimized_models = sorted(
            [p for p in artifacts_dir.glob("*_optimized_*.pkl") if p.is_file()],
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )
        if len(optimized_models) > 0:
            model_path = optimized_models[0]
            try:
                model = joblib.load(model_path)
                # Derive feature names from numeric columns excluding identifiers/targets
                numeric_cols = df.select_dtypes(include=np.number).columns
                candidate_exclusions = [c for c in ["id", "persona_ce"] if c in numeric_cols]
                feature_names = [c for c in numeric_cols if c not in candidate_exclusions]
                model_name = model_path.stem
                ensure_reports_dir(str(REPORTS_DIR_PATH))
                plot_feature_importance(model, feature_names, REPORTS_DIR_PATH, model_name)
                print(f"Feature importance chart saved for model: {model_name}")
            except Exception as e:
                print(f"Warning: Could not generate feature importance chart. Error: {e}")
        else:
            print("Warning: No optimized model found in 'artifacts' directory. Skipping feature importance.")
    else:
        print("Warning: 'artifacts' directory does not exist. Skipping feature importance.")

    print("\n--- ANALYSIS COMPLETED ---")
    print(f"Please examine the visualizations in '{REPORTS_DIR_PATH.name}' directory.")


if __name__ == "__main__":
    analyze_correlations(data_path=DATA_FILE_PATH)