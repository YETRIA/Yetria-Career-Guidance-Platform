"""
Yetria Career Guidance Platform - Baseline Model Training

This module trains the project's initial baseline model.
Used for performance comparison before GridSearch optimization.

PURPOSE:
This script is the starting point of the model development process. It trains
different machine learning models (LGBM, CatBoost, Logistic Regression) with
simple hyperparameters and compares their performance.

NOTE: gridsearch_optimization.py is used in production.
This script is kept for the following purposes:
1. To see baseline model performance and document the improvement process
2. To generate scaler.joblib and grup_ortalamalari.joblib files (required for PredictionService)
3. To show the difference between GridSearch optimization and baseline model

Process Steps:
1. Data Loading: 70% training, 30% test split (high weight for first 66 real data points)
2. Model Tournament: Training and comparison of multiple models
3. Evaluation: Accuracy, Precision, Recall, F1-Score, ROC AUC metrics
4. Saving: Best model and components saved to artifacts/ folder

Usage:
    python backend/app/ml/train_model_baseline.py
"""
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from typing import Dict, Tuple

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import validation_curve
from lightgbm import LGBMClassifier
import lightgbm as lgb
from catboost import CatBoostClassifier

from . import visualization as viz

PROJ_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = PROJ_ROOT / "data/model_training_data.csv"
ARTIFACTS_PATH = PROJ_ROOT / "artifacts"
ARTIFACTS_PATH.mkdir(exist_ok=True)

NUM_REAL_DATA_POINTS = 66
REAL_DATA_WEIGHT_MULTIPLIER = 3.0

def load_and_prepare_data(
    data_path: Path, test_size: float = 0.3, random_state: int = 42
) -> Tuple:
    print(f"\n[1/4] Loading and preparing data (Test size: {test_size*100}%) ...")
    df = pd.read_csv(data_path)
    X = df.drop(columns=['id', 'persona'])
    y = df['persona']

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    indices = np.arange(len(df))
    X_train, X_test, y_train, y_test, train_indices, _ = train_test_split(
        X, y_encoded, indices, test_size=test_size, random_state=random_state, stratify=y_encoded
    )

    sample_weight = np.ones(len(y_train))
    real_data_mask = train_indices < NUM_REAL_DATA_POINTS
    sample_weight[real_data_mask] *= REAL_DATA_WEIGHT_MULTIPLIER
    print(f"Applied {REAL_DATA_WEIGHT_MULTIPLIER}x weight to {np.sum(real_data_mask)} real data points in training set.")

    scaler = StandardScaler()
    X_train_scaled_df = pd.DataFrame(scaler.fit_transform(X_train), columns=X_train.columns)
    X_test_scaled_df = pd.DataFrame(scaler.transform(X_test), columns=X_test.columns)
    print("Data preparation completed.")
    return X_train_scaled_df, X_test_scaled_df, y_train, y_test, scaler, le, sample_weight

def evaluate_model(model, X_train, y_train, X_test, y_test, le) -> Dict[str, float]:
    y_train_pred = model.predict(X_train)
    y_train_proba = model.predict_proba(X_train)[:, 1]
    train_accuracy = accuracy_score(y_train, y_train_pred)
    train_roc_auc = roc_auc_score(y_train, y_train_proba)

    y_test_pred = model.predict(X_test)
    y_test_proba = model.predict_proba(X_test)[:, 1]
    test_accuracy = accuracy_score(y_test, y_test_pred)
    test_roc_auc = roc_auc_score(y_test, y_test_proba)
    
    print(f"--- Model: {type(model).__name__} ---")
    print(f"Training Set Accuracy: {train_accuracy:.4f}, ROC AUC: {train_roc_auc:.4f}")
    print(f"Test Set Accuracy: {test_accuracy:.4f}, ROC AUC: {test_roc_auc:.4f}")
    if train_roc_auc > test_roc_auc + 0.1:
        print("WARNING: Potential overfitting risk!")
    print("\nTest Set Classification Report:")
    print(classification_report(y_test, y_test_pred, target_names=le.classes_))
    return {
        "model_name": type(model).__name__,
        "train_accuracy": train_accuracy,
        "train_roc_auc": train_roc_auc,
        "test_accuracy": test_accuracy,
        "test_roc_auc": test_roc_auc,
    }

def main():
    X_train, X_test, y_train, y_test, scaler, le, sample_weight = load_and_prepare_data(DATA_PATH)

    print("\n[2/4] Starting model tournament...")
    models = {
        "LogisticRegression": LogisticRegression(random_state=42, max_iter=1000),
        "LGBMClassifier": LGBMClassifier(random_state=42, verbose=-1),
        "CatBoostClassifier": CatBoostClassifier(random_state=42, verbose=0)
    }
    results = []
    learning_curves_data = {}  # Store learning curves
    
    for name, model in models.items():
        print(f"\n--- Training {name} model ---")
        
        if name == "LGBMClassifier":
            # LightGBM real learning curve with eval_set
            model.fit(X_train, y_train,
                     eval_set=[(X_train, y_train), (X_test, y_test)],
                     eval_names=['train', 'test'],
                     eval_metric='binary_logloss',
                     callbacks=[lgb.early_stopping(50), lgb.log_evaluation(0)])
            
            # Get learning curve from evals_result_ property
            if hasattr(model, 'evals_result_'):
                learning_curves_data[name] = {
                    'train_logloss': model.evals_result_['train']['binary_logloss'],
                    'test_logloss': model.evals_result_['test']['binary_logloss']
                }
            
        elif name == "CatBoostClassifier":
            # CatBoost real learning curve with eval_set
            model.fit(X_train, y_train,
                     eval_set=(X_test, y_test),
                     verbose=False,
                     plot=False)  # We will draw our own chart
            
            # Get learning curve from CatBoost evals_result_ property
            if hasattr(model, 'evals_result_'):
                learning_curves_data[name] = model.evals_result_
            
        elif name == "LogisticRegression":
            # LogisticRegression validation curve (C parameter)
            C_range = [0.001, 0.01, 0.1, 1, 10, 100, 1000]
            train_scores, test_scores = validation_curve(
                model, X_train, y_train, param_name='C', param_range=C_range,
                cv=5, scoring='accuracy', n_jobs=-1)
            
            learning_curves_data[name] = {
                'C_values': C_range,
                'train_scores_mean': train_scores.mean(axis=1),
                'train_scores_std': train_scores.std(axis=1),
                'test_scores_mean': test_scores.mean(axis=1),
                'test_scores_std': test_scores.std(axis=1)
            }
            
            # Normal training
            model.fit(X_train, y_train, sample_weight=sample_weight)
        else:
            # Normal training for other models
            model.fit(X_train, y_train, sample_weight=sample_weight)
        
        model_performance = evaluate_model(model, X_train, y_train, X_test, y_test, le)
        results.append(model_performance)

    results_df = pd.DataFrame(results)
    print("\n[3/4] Model Comparison Results:")
    print(results_df.to_string(index=False))
    reports_dir = ARTIFACTS_PATH.parent / "reports"
    reports_dir.mkdir(exist_ok=True)
    viz.plot_model_comparison(results_df, reports_dir)
    
    # Draw learning curves
    print("\n[3.5/4] Creating learning curves...")
    for model_name, curve_data in learning_curves_data.items():
        viz.plot_learning_curves(curve_data, reports_dir, model_name)
    best_model_name = results_df.loc[results_df['test_roc_auc'].idxmax()]['model_name']
    print(f"\nBest model selected: {best_model_name} (based on Test ROC AUC)")
    final_model = models[best_model_name]
    final_model.fit(X_train, y_train, sample_weight=sample_weight)

    print(f"\n[3.5/4] Creating detailed analysis charts for best model ({best_model_name})...")
    y_test_pred = final_model.predict(X_test)
    viz.plot_confusion_matrix(y_test, y_test_pred, class_names=le.classes_, reports_dir=reports_dir, model_name=best_model_name)
    viz.plot_roc_curve(final_model, X_test, y_test, reports_dir=reports_dir, model_name=best_model_name)
    feature_names = X_train.columns.tolist()
    viz.plot_feature_importance(final_model, feature_names=feature_names, reports_dir=reports_dir, model_name=best_model_name)

    print(f"\n[4/4] Saving best model ({best_model_name}) and components...")
    joblib.dump(final_model, ARTIFACTS_PATH / 'best_model.joblib')
    joblib.dump(scaler, ARTIFACTS_PATH / 'scaler.joblib')
    joblib.dump(le, ARTIFACTS_PATH / 'label_encoder.joblib')
    
    # Calculate and save group averages for prediction service
    print("\nCalculating group averages for prediction service...")
    df_original = pd.read_csv(DATA_PATH) 
    grup_ortalamalari = df_original.groupby('persona').mean(numeric_only=True).drop(columns='id').to_dict('index')
    joblib.dump(grup_ortalamalari, ARTIFACTS_PATH / 'grup_ortalamalari.joblib')
    print("Group averages saved as 'grup_ortalamalari.joblib'.")
    print(f"All components successfully saved to '{ARTIFACTS_PATH}' directory.")
    print("\n--- TRAINING PROCESS COMPLETED ---")

if __name__ == "__main__":
    main()