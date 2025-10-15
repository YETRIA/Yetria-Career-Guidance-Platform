"""
YETRIA Career Prediction Model - Data Preparation Pipeline

This script fetches raw data from database, cleans it and prepares it for model training.

Usage:
From backend folder:
python scripts/ml/run_pipeline.py

or directly:
python -m scripts.ml.run_pipeline
"""

import sys
import argparse
from pathlib import Path

# Add backend root to Python path
backend_path = Path(__file__).resolve().parents[2]  # scripts/ml/run_pipeline.py -> backend/
sys.path.insert(0, str(backend_path))

from app.services import database_service as db
from app.ml import data_preprocessing as dp
from app.ml import feature_engineering as fe

def save_dataframe_to_csv(df, path_str):
    """Saves DataFrame as CSV."""
    # Create absolute path relative to backend root
    if not Path(path_str).is_absolute():
        out_path = backend_path / path_str
    else:
        out_path = Path(path_str)
    
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False, encoding="utf-8")
    print(f"CSV file saved: {out_path}")

def main(args):
    """Runs the data preparation pipeline step by step."""
    
    print("--- Data Preparation Pipeline Started ---")
    
    print("\n[1/5] Fetching raw data from database...")
    raw_df = db.fetch_professionaldatastaging_df()
    print(f"-> {len(raw_df)} rows of raw data fetched.")

    print("\n[2/5] Data preprocessing: Filling missing values...")
    imputed_df = dp.impute_missing_values_smart(raw_df)

    print("\n[3/5] Data preprocessing: Capping outliers (Percentile Range %1-%99)...")
    capped_df, outlier_log = dp.cap_outliers_percentile(imputed_df, lower_quantile=0.01, upper_quantile=0.99)

    # Log only columns that were processed (values were capped)
    processed_outliers = outlier_log[outlier_log['cap_low'] + outlier_log['cap_high'] > 0]
    if not processed_outliers.empty:
        print("Outlier capping summary:")
        print(processed_outliers)
    else:
        print("No outliers found within the specified limits.")
    
    save_dataframe_to_csv(capped_df, args.imputed_output_path)
    
    print(f"\n[4/5] Writing cleaned data to '{args.temp_db_table}' temporary table...")
    # Write the final version with outliers also cleaned to DB
    db.write_dataframe_to_table(capped_df, args.temp_db_table, if_exists="replace")

    print("\n[5/5] Running feature engineering via SQL...")
    model_ready_df = fe.create_model_ready_features_from_sql(source_table_name=args.temp_db_table)
    save_dataframe_to_csv(model_ready_df, args.final_output_path)

    print("\n--- Pipeline completed successfully! ---")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="YETRIA Career Platform - Data Preparation Pipeline")
    parser.add_argument("--imputed-output-path", type=str, default="data/imputed_data.csv")
    parser.add_argument("--final-output-path", type=str, default="data/model_training_data.csv")
    parser.add_argument("--temp-db-table", type=str, default="professionaldatastaging_imputed_temp")
    args = parser.parse_args()
    main(args)