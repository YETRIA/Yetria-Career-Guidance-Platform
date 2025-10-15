"""
YETRIA - Saved Model Evaluation Script

This script loads optimized models saved in artifacts/ folder
and performs detailed performance analysis. It does not retrain, only evaluates.

Usage:
    cd backend
    python scripts/ml/evaluate_saved_models.py

Features:
- Loads saved CatBoost and LightGBM models
- Calculates all performance metrics
- Creates confusion matrix, ROC curve, PR curve
- Performs overfitting analysis
- Generates detailed reports
"""

import sys
from pathlib import Path
import joblib
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# Backend root'u Python path'e ekle
backend_path = Path(__file__).resolve().parents[2]  # scripts/ml/evaluate_saved_models.py -> backend/
sys.path.insert(0, str(backend_path))

from app.ml.model_evaluation import ModelEvaluator


def find_latest_models(artifacts_dir):
    """
    Finds the latest saved models and metadata in artifacts folder.
    
    Returns:
        (catboost_path, lightgbm_path, encoder_path, metadata_path)
    """
    artifacts_path = Path(artifacts_dir)
    
    if not artifacts_path.exists():
        return None, None, None, None
    
    # Find latest CatBoost model
    catboost_files = sorted(artifacts_path.glob("catboost_optimized_*.pkl"), reverse=True)
    catboost_path = catboost_files[0] if catboost_files else None
    
    # Find latest LightGBM model
    lightgbm_files = sorted(artifacts_path.glob("lightgbm_optimized_*.pkl"), reverse=True)
    lightgbm_path = lightgbm_files[0] if lightgbm_files else None
    
    # Find latest label encoder
    encoder_files = sorted(artifacts_path.glob("label_encoder_*.pkl"), reverse=True)
    encoder_path = encoder_files[0] if encoder_files else None
    
    # Find latest metadata file
    metadata_files = sorted(artifacts_path.glob("model_metadata_*.json"), reverse=True)
    metadata_path = metadata_files[0] if metadata_files else None
    
    return catboost_path, lightgbm_path, encoder_path, metadata_path


def load_and_prepare_data(data_path, test_size=0.4, random_state=42):
    """
    Loads data and performs test split.
    
    Returns:
        X_test, y_test, label_encoder, class_names
    """
    print(f"\n[1/3] Loading data: {data_path.name}")
    df = pd.read_csv(data_path)
    
    # Remove ID column
    if 'id' in df.columns:
        df = df.drop('id', axis=1)
    
    # Features and target
    X = df.drop('persona', axis=1)
    y = df['persona']
    
    # Label encoding
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    print(f"Data size: {df.shape}")
    print(f"Classes: {le.classes_.tolist()}")
    print(f"Number of features: {X.shape[1]}")
    
    # Train-test split (same split with same random_state)
    # Note: Only test set will be used, train set is only for split consistency
    _, X_test, _, y_test = train_test_split(
        X, y_encoded, test_size=test_size, random_state=random_state, stratify=y_encoded
    )
    
    print(f"Test set: {X_test.shape[0]} samples (test_size={test_size})")
    print(f"Note: Train set not used, only CV scores will be used")
    
    return X_test, y_test, le, le.classes_.tolist()


def load_metadata(metadata_path):
    """
    Loads metadata file.
    
    Args:
        metadata_path: Metadata JSON file path
        
    Returns:
        Metadata dictionary or None
    """
    if not metadata_path or not metadata_path.exists():
        return None
    
    try:
        with open(metadata_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠ Metadata could not be read: {str(e)}")
        return None


def evaluate_model_from_file(
    model_path,
    model_name,
    X_test,
    y_test,
    class_names,
    evaluator,
    metadata=None
):
    """
    Loads and evaluates a saved model.
    
    Args:
        model_path: Model file path
        model_name: Model name
        X_test, y_test: Test data
        class_names: Class names
        evaluator: ModelEvaluator instance
        metadata: Model metadata (for CV scores and parameters)
        
    Returns:
        (test_metrics, overfitting_analysis) or None
    """
    if not model_path or not model_path.exists():
        print(f"⚠ {model_name} model not found: {model_path}")
        return None
    
    print(f"\n{'='*80}")
    print(f"Loading model: {model_name}")
    print(f"Dosya: {model_path.name}")
    print(f"{'='*80}")
    
    try:
        # Load model
        model = joblib.load(model_path)
        
        # Get CV scores and parameters from metadata
        cv_scores = None
        best_params = {}
        
        if metadata:
            model_key = model_name.lower()
            if model_key in metadata:
                # New metadata structure (all CV scores)
                if 'cv_scores' in metadata[model_key]:
                    cv_scores = metadata[model_key]['cv_scores']
                    print(f"✓ CV scores read from metadata:")
                    print(f"  - Accuracy: {cv_scores['accuracy']:.4f}")
                    print(f"  - ROC-AUC: {cv_scores['roc_auc']:.4f}")
                # Old metadata structure (only ROC-AUC)
                elif 'cv_score' in metadata[model_key]:
                    cv_roc_auc = metadata[model_key]['cv_score']
                    print(f"⚠ Old metadata format, only ROC-AUC available: {cv_roc_auc:.4f}")
                    cv_scores = None
                
                best_params = metadata[model_key].get('best_params', {})
        
        # Evaluate
        test_metrics, overfitting = evaluator.evaluate_model(
            model=model,
            model_name=model_name,
            X_test=X_test,
            y_test=y_test,
            class_names=class_names,
            best_params=best_params,
            cv_scores=cv_scores,
        )
        
        return test_metrics, overfitting
        
    except Exception as e:
        print(f"❌ Error occurred while evaluating {model_name}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def main():
    """Main evaluation function."""
    print("=" * 80)
    print("YETRIA - Saved Model Evaluation")
    print("=" * 80)
    print("\nThis script loads saved models and performs detailed analysis.")
    print("It does not retrain, only evaluates existing models.")
    print("=" * 80)
    
    # Find artifacts and data folders
    artifacts_dir = backend_path / "artifacts"
    data_path = backend_path / "data" / "model_training_data.csv"
    reports_dir = backend_path / "reports"
    
    # Check data file
    if not data_path.exists():
        print(f"\n❌ ERROR: Data file not found: {data_path}")
        print("Please run 'run_pipeline.py' script first.")
        return
    
    # Find models and metadata
    print("\n[Searching for models...]")
    catboost_path, lightgbm_path, encoder_path, metadata_path = find_latest_models(artifacts_dir)
    
    if not catboost_path and not lightgbm_path:
        print(f"\n❌ ERROR: No models found in artifacts folder: {artifacts_dir}")
        print("\nPlease train models first:")
        print("  python scripts/ml/run_gridsearch.py")
        return
    
    print(f"\n✓ Found files:")
    if catboost_path:
        print(f"  - CatBoost: {catboost_path.name}")
    if lightgbm_path:
        print(f"  - LightGBM: {lightgbm_path.name}")
    if encoder_path:
        print(f"  - Encoder: {encoder_path.name}")
    if metadata_path:
        print(f"  - Metadata: {metadata_path.name}")
    
    # Load metadata
    metadata = load_metadata(metadata_path)
    if metadata:
        print("  ✓ CV scores and parameters will be read from metadata")
    else:
        print("  ⚠ Metadata not found, CV scores will be shown as 'Unknown'")
    
    # Prepare data
    X_test, y_test, label_encoder, class_names = load_and_prepare_data(
        data_path, test_size=0.4, random_state=42
    )
    
    # Create evaluator
    print(f"\n[2/3] Preparing model evaluator...")
    evaluator = ModelEvaluator(reports_dir)
    
    print(f"\n[3/3] Evaluating models...")
    
    # Evaluate CatBoost
    catboost_result = None
    if catboost_path:
        catboost_result = evaluate_model_from_file(
            catboost_path, "CatBoost",
            X_test, y_test,
            class_names, evaluator, metadata
        )
    
    # Evaluate LightGBM
    lightgbm_result = None
    if lightgbm_path:
        lightgbm_result = evaluate_model_from_file(
            lightgbm_path, "LightGBM",
            X_test, y_test,
            class_names, evaluator, metadata
        )
    
    # Summarize results
    print("\n" + "=" * 80)
    print("EVALUATION SUMMARY")
    print("=" * 80)
    
    if catboost_result:
        test_metrics, overfitting = catboost_result
        print(f"\n✓ CatBoost:")
        print(f"  Test Accuracy:    {test_metrics.accuracy:.4f}")
        print(f"  Test ROC-AUC:     {test_metrics.roc_auc:.4f}")
        print(f"  Test F1-Score:    {test_metrics.f1_score:.4f}")
        print(f"  Overfitting:      {overfitting.diagnosis}")
    
    if lightgbm_result:
        test_metrics, overfitting = lightgbm_result
        print(f"\n✓ LightGBM:")
        print(f"  Test Accuracy:    {test_metrics.accuracy:.4f}")
        print(f"  Test ROC-AUC:     {test_metrics.roc_auc:.4f}")
        print(f"  Test F1-Score:    {test_metrics.f1_score:.4f}")
        print(f"  Overfitting:      {overfitting.diagnosis}")
    
    # Kazanan belirle
    if catboost_result and lightgbm_result:
        catboost_auc = catboost_result[0].roc_auc
        lightgbm_auc = lightgbm_result[0].roc_auc
        
        if catboost_auc > lightgbm_auc:
            print(f"\n🏆 Best Model: CatBoost (ROC-AUC: {catboost_auc:.4f})")
        else:
            print(f"\n🏆 Best Model: LightGBM (ROC-AUC: {lightgbm_auc:.4f})")
    
    print("\n" + "=" * 80)
    print("GENERATED FILES")
    print("=" * 80)
    print(f"\n📊 Raporlar ve Grafikler: {reports_dir}/")
    print("\nFor each model:")
    print("  ✓ Detailed evaluation report (.txt) - CV vs Test analysis")
    print("  ✓ Test Confusion matrix")
    print("  ✓ ROC curve (binary classification)")
    print("  ✓ Precision-Recall curve (binary classification)")
    print("  ✓ CV vs Test comparison chart")
    
    print("\n" + "=" * 80)
    print("✓ Evaluation completed!")
    print("=" * 80)
    print(f"\nPlease examine the files in '{reports_dir.name}/' folder.")


if __name__ == "__main__":
    main()