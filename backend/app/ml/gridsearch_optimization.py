"""
Yetria Career Guidance Platform - GridSearch Optimization Module

This module manages the optimized hyperparameter search process for
career prediction models. It automatically detects binary and multi-class
classification and optimizes accordingly.

Features:
- Automatic class count detection (binary or multi-class)
- Mac CPU multi-threading support
- Fast optimization with RandomizedSearchCV
- Smart training with early stopping
- Overfitting control
- Detailed reporting

Adding New Professions:
This module automatically detects all professions (persona) in the data file.
To add new professions, simply add new examples to the data file.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV, StratifiedKFold, cross_validate
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import roc_auc_score, classification_report
import joblib
import json
from datetime import datetime
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')


class OptimizationConfig:
    """Optimization configuration."""
    
    # Target variable column (profession/persona column in data file)
    TARGET_COLUMN = 'persona'
    
    # Columns to exclude (such as ID)
    COLUMNS_TO_EXCLUDE = ['id']
    
    # GPU/CPU Settings
    # NOTE: CUDA GPU is not supported on Mac, so keep False
    USE_GPU = False  # False for Mac (True for Windows/Linux NVIDIA GPU)
    GPU_DEVICE_ID = 0  # GPU ID to use (0, 1, 2...)
    
    # RandomizedSearchCV parameters
    N_ITER = 150  # Number of trials (150 combinations - more comprehensive to prevent underfitting)
    N_FOLDS = 5   # Cross-validation fold count (more reliable CV)
    SCORING = 'roc_auc'  # Metric
    
    # CatBoost hyperparameter grid (expanded to prevent underfitting)
    CATBOOST_PARAMS = {
        # More training iterations
        'iterations': [1000, 1500, 2000, 2500, 3000],
        
        # Higher learning rate (to prevent underfitting)
        'learning_rate': [0.05, 0.1, 0.15, 0.2, 0.25, 0.3],
        
        # Deeper trees (increase complexity)
        'depth': [6, 8, 10, 12, 14, 16],
        
        # Less regularization (increase model complexity)
        'l2_leaf_reg': [0.1, 1, 3, 5],
        'border_count': [32, 64, 128, 254],
        
        # Bagging parameters
        'bagging_temperature': [0.5, 0.7, 1.0, 1.2],
        'random_strength': [0, 1, 2],
        
        # Categorical features
        'one_hot_max_size': [2, 5, 10],
        
        # For model complexity
        'grow_policy': ['SymmetricTree', 'Depthwise', 'Lossguide'],
        'boosting_type': ['Plain', 'Ordered'],
        'bootstrap_type': ['Bayesian', 'Bernoulli', 'MVS'],
    }
    
    # LightGBM hyperparameter grid (expanded to prevent underfitting)
    LIGHTGBM_PARAMS = {
        # More complex tree structures
        'num_leaves': [50, 100, 150, 200, 300, 400, 500],
        'max_depth': [-1, 15, 20, 25, 30, 35, 40],
        
        # More training iterations
        'n_estimators': [1000, 1500, 2000, 2500, 3000],
        
        # Higher learning rate (to prevent underfitting)
        'learning_rate': [0.05, 0.1, 0.15, 0.2, 0.25, 0.3],
        
        # Less regularization (increase model complexity)
        'min_child_samples': [5, 10, 15, 20],
        'min_child_weight': [0.1, 1, 3, 5],
        
        # Sampling parameters (use more data)
        'subsample': [0.8, 0.9, 0.95, 1.0],
        'colsample_bytree': [0.8, 0.9, 0.95, 1.0],
        'colsample_bylevel': [0.8, 0.9, 1.0],
        
        # Regularization (less, increase model complexity)
        'reg_alpha': [0, 0.01, 0.1],
        'reg_lambda': [0, 0.01, 0.1],
        
        # Boosting parametreleri
        'boosting_type': ['gbdt', 'dart'],
        'objective': ['binary'],
        'metric': ['auc'],
    }


def load_and_prepare_data(data_path, test_size=0.3, random_state=42):
    """
    Loads and prepares data.
    
    Automatically:
    - Detects target variable (persona)
    - Removes unnecessary columns (id)
    - Performs label encoding
    - Performs train-test split
    
    Args:
        data_path: Data file path
        test_size: Test data ratio
        random_state: Random seed
        
    Returns:
        X_train, X_test, y_train, y_test, label_encoder, n_classes
    """
    print(f"\n[1/5] Loading and preparing data...")
    
    df = pd.read_csv(data_path)
    print(f"Data size: {df.shape}")
    
    # Check target variable
    if OptimizationConfig.TARGET_COLUMN not in df.columns:
        raise ValueError(
            f"Column '{OptimizationConfig.TARGET_COLUMN}' not found!\n"
            f"Available columns: {df.columns.tolist()}"
        )
    
    # Determine columns to remove
    columns_to_drop = [OptimizationConfig.TARGET_COLUMN]
    for col in OptimizationConfig.COLUMNS_TO_EXCLUDE:
        if col in df.columns:
            columns_to_drop.append(col)
    
    # Features and target
    X = df.drop(columns_to_drop, axis=1)
    y = df[OptimizationConfig.TARGET_COLUMN]
    
    # Label encoding
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    n_classes = len(le.classes_)
    
    print(f"Class count: {n_classes}")
    print(f"Classes: {le.classes_.tolist()}")
    print(f"Feature count: {X.shape[1]}")
    
    # Determine classification type
    if n_classes == 2:
        print("Type: Binary Classification")
    else:
        print(f"Type: Multi-class Classification ({n_classes} classes)")
    
    # Train-test split with indices to track original data
    indices = np.arange(len(df))
    X_train, X_test, y_train, y_test, train_indices, _ = train_test_split(
        X, y_encoded, indices, test_size=test_size, random_state=random_state, stratify=y_encoded
    )
    
    # Sample weights: Give 3x weight to first 66 "real" data points
    NUM_REAL_DATA_POINTS = 66
    REAL_DATA_WEIGHT_MULTIPLIER = 3.0
    sample_weight = np.ones(len(y_train))
    real_data_mask = train_indices < NUM_REAL_DATA_POINTS
    sample_weight[real_data_mask] *= REAL_DATA_WEIGHT_MULTIPLIER
    
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    print(f"⚠️  {np.sum(real_data_mask)} out of first 66 real data points are in training set")
    print(f"✅ {REAL_DATA_WEIGHT_MULTIPLIER}x weight applied to these {np.sum(real_data_mask)} data points")
    
    return X_train, X_test, y_train, y_test, le, n_classes, sample_weight


def calculate_roc_auc(y_true, y_pred_proba, n_classes):
    """
    Calculates ROC-AUC for binary or multi-class classification.
    
    Args:
        y_true: True labels
        y_pred_proba: Prediction probabilities
        n_classes: Number of classes
        
    Returns:
        ROC-AUC score
    """
    if n_classes == 2:
        # Binary classification - only positive class probability
        return roc_auc_score(y_true, y_pred_proba[:, 1])
    else:
        # Multi-class classification
        return roc_auc_score(y_true, y_pred_proba, multi_class='ovr')


def calculate_cv_scores(model, X_train, y_train, n_classes, cv_folds=5):
    """
    Calculates cross-validation scores for all metrics.
    
    Args:
        model: Trained model
        X_train: Training features
        y_train: Training labels
        n_classes: Number of classes
        cv_folds: Cross-validation fold count
        
    Returns:
        CV scores dictionary (accuracy, precision, recall, f1, roc_auc)
    """
    print(f"\n  → Calculating {cv_folds}-fold CV scores for all metrics...")
    
    # Scoring for binary classification
    if n_classes == 2:
        scoring = {
            'accuracy': 'accuracy',
            'precision': 'precision',
            'recall': 'recall',
            'f1': 'f1',
            'roc_auc': 'roc_auc'
        }
    else:
        # Weighted scoring for multi-class
        scoring = {
            'accuracy': 'accuracy',
            'precision': 'precision_weighted',
            'recall': 'recall_weighted',
            'f1': 'f1_weighted',
            'roc_auc': 'roc_auc_ovr_weighted'
        }
    
    # Cross-validation
    cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
    cv_results = cross_validate(
        model, X_train, y_train,
        cv=cv,
        scoring=scoring,
        n_jobs=-1,
        return_train_score=False
    )
    
    # Ortalama skorlar
    cv_scores = {
        'accuracy': cv_results['test_accuracy'].mean(),
        'precision': cv_results['test_precision'].mean(),
        'recall': cv_results['test_recall'].mean(),
        'f1': cv_results['test_f1'].mean(),
        'roc_auc': cv_results['test_roc_auc'].mean()
    }
    
    print(f"  ✓ CV Accuracy: {cv_scores['accuracy']:.4f}")
    print(f"  ✓ CV Precision: {cv_scores['precision']:.4f}")
    print(f"  ✓ CV Recall: {cv_scores['recall']:.4f}")
    print(f"  ✓ CV F1-Score: {cv_scores['f1']:.4f}")
    print(f"  ✓ CV ROC-AUC: {cv_scores['roc_auc']:.4f}")
    
    return cv_scores


def check_gpu_availability():
    """Checks GPU availability."""
    gpu_available = False
    gpu_info = []
    
    # CUDA check
    try:
        import torch
        if torch.cuda.is_available():
            gpu_available = True
            gpu_count = torch.cuda.device_count()
            gpu_info.append(f"✓ CUDA GPU found: {gpu_count} device")
            for i in range(gpu_count):
                gpu_name = torch.cuda.get_device_name(i)
                gpu_info.append(f"  GPU {i}: {gpu_name}")
        else:
            gpu_info.append("✗ CUDA GPU not found")
    except ImportError:
        gpu_info.append("✗ PyTorch not installed (CUDA check failed)")
    
    # CatBoost GPU support
    try:
        from catboost import CatBoostClassifier
        # Test GPU
        test_model = CatBoostClassifier(task_type='GPU', devices='0', iterations=1, verbose=False)
        gpu_info.append("✓ CatBoost GPU support active")
    except Exception as e:
        gpu_info.append(f"✗ CatBoost GPU support not available: {str(e)}")
    
    return gpu_available, gpu_info


def optimize_catboost(X_train, y_train, X_test, y_test, n_classes, sample_weight=None):
    """
    Optimizes CatBoost model (GPU or CPU).
    
    Args:
        X_train, y_train: Training data
        X_test, y_test: Test data
        n_classes: Number of classes
        sample_weight: Sample weights (optional)
        
    Returns:
        best_model, best_params, cv_score, test_score
    """
    from catboost import CatBoostClassifier
    
    print("\n" + "="*60)
    if OptimizationConfig.USE_GPU:
        print("=== CatBoost GPU Optimization Starting ===")
    else:
        print("=== CatBoost CPU Multi-Threading Optimization Starting ===")
    print("="*60)
    
    # Base model - GPU veya CPU
    if OptimizationConfig.USE_GPU:
        try:
            base_model = CatBoostClassifier(
                task_type='GPU',
                devices=str(OptimizationConfig.GPU_DEVICE_ID),
                gpu_ram_part=0.95,  # GPU RAM'in %95'ini kullan
                verbose=False,
                random_state=42,
                early_stopping_rounds=100,  # Longer patience (to prevent underfitting)
            )
            print(f"✓ Using GPU {OptimizationConfig.GPU_DEVICE_ID}")
        except Exception as e:
            print(f"⚠ GPU not available, switching to CPU: {str(e)}")
            base_model = CatBoostClassifier(
                task_type='CPU',
                thread_count=-1,
                verbose=False,
                random_state=42,
                early_stopping_rounds=100,  # Longer patience (to prevent underfitting)
            )
    else:
        base_model = CatBoostClassifier(
            task_type='CPU',
            thread_count=-1,  # Use all cores
            verbose=False,
            random_state=42,
            early_stopping_rounds=50,
        )
        print("✓ Using CPU multi-threading")
    
    # RandomizedSearchCV
    cv = StratifiedKFold(
        n_splits=OptimizationConfig.N_FOLDS, 
        shuffle=True, 
        random_state=42
    )
    
    # Use n_jobs=1 with GPU, -1 with CPU
    n_jobs = 1 if OptimizationConfig.USE_GPU else -1
    
    random_search = RandomizedSearchCV(
        estimator=base_model,
        param_distributions=OptimizationConfig.CATBOOST_PARAMS,
        n_iter=OptimizationConfig.N_ITER,
        cv=cv,
        scoring=OptimizationConfig.SCORING,
        n_jobs=n_jobs,
        verbose=2,
        random_state=42
    )
    
    print(f"CatBoost hiperparametreleri test ediliyor...")
    print(f"Toplam deneme: {OptimizationConfig.N_ITER} kombinasyon × {OptimizationConfig.N_FOLDS} fold = {OptimizationConfig.N_ITER * OptimizationConfig.N_FOLDS} fit")
    print("Training starting...\n")
    
    # Fit with sample_weight if provided
    if sample_weight is not None:
        print(f"✅ Training with weights applied to first 66 real data points...")
        random_search.fit(X_train, y_train, sample_weight=sample_weight)
    else:
        random_search.fit(X_train, y_train)
    
    # En iyi model
    best_model = random_search.best_estimator_
    
    # Test skoru
    y_pred = best_model.predict(X_test)
    y_pred_proba = best_model.predict_proba(X_test)
    test_score = calculate_roc_auc(y_test, y_pred_proba, n_classes)
    
    # CV scores for all metrics
    cv_scores = calculate_cv_scores(best_model, X_train, y_train, n_classes, cv_folds=5)
    
    # Overfitting check (ROC-AUC based)
    overfitting_diff = cv_scores['roc_auc'] - test_score
    if overfitting_diff < 0.005:
        overfitting_risk = "Low"
    elif overfitting_diff < 0.1:
        overfitting_risk = "Medium"
    else:
        overfitting_risk = "High"
    
    print("\n" + "="*60)
    print("CatBoost Results:")
    print("="*60)
    print(f"En iyi parametreler: {random_search.best_params_}")
    print(f"CV ROC-AUC: {cv_scores['roc_auc']:.4f}")
    print(f"Test ROC-AUC: {test_score:.4f}")
    print(f"Overfitting riski: {overfitting_risk}")
    print("="*60)
    
    return best_model, random_search.best_params_, cv_scores, test_score


def optimize_lightgbm(X_train, y_train, X_test, y_test, n_classes, sample_weight=None):
    """
    LightGBM modelini optimize eder (GPU veya CPU).
    
    Args:
        X_train, y_train: Eğitim verileri
        X_test, y_test: Test verileri
        n_classes: Sınıf sayısı
        sample_weight: Örnek ağırlıkları (optional)
        
    Returns:
        best_model, best_params, cv_score, test_score
    """
    import lightgbm as lgb
    
    print("\n" + "="*60)
    if OptimizationConfig.USE_GPU:
        print("=== LightGBM GPU Optimization Starting ===")
    else:
        print("=== LightGBM CPU Multi-Threading Optimization Starting ===")
    print("="*60)
    
    # Base model - GPU veya CPU
    if OptimizationConfig.USE_GPU:
        try:
            base_model = lgb.LGBMClassifier(
                device='gpu',
                gpu_platform_id=0,
                gpu_device_id=OptimizationConfig.GPU_DEVICE_ID,
                verbose=-1,
                random_state=42,
            )
            print(f"✓ Using GPU {OptimizationConfig.GPU_DEVICE_ID}")
        except Exception as e:
            print(f"⚠ GPU not available, switching to CPU: {str(e)}")
            base_model = lgb.LGBMClassifier(
                device='cpu',
                n_jobs=-1,
                verbose=-1,
                random_state=42,
            )
    else:
        base_model = lgb.LGBMClassifier(
            device='cpu',
            n_jobs=-1,
            verbose=-1,
            random_state=42,
        )
        print("✓ Using CPU multi-threading")
    
    # RandomizedSearchCV
    cv = StratifiedKFold(
        n_splits=OptimizationConfig.N_FOLDS, 
        shuffle=True, 
        random_state=42
    )
    
    # Use n_jobs=1 with GPU, -1 with CPU
    n_jobs = 1 if OptimizationConfig.USE_GPU else -1
    
    random_search = RandomizedSearchCV(
        estimator=base_model,
        param_distributions=OptimizationConfig.LIGHTGBM_PARAMS,
        n_iter=OptimizationConfig.N_ITER,
        cv=cv,
        scoring=OptimizationConfig.SCORING,
        n_jobs=n_jobs,
        verbose=2,
        random_state=42
    )
    
    print(f"LightGBM hiperparametreleri test ediliyor...")
    print(f"Toplam deneme: {OptimizationConfig.N_ITER} kombinasyon × {OptimizationConfig.N_FOLDS} fold = {OptimizationConfig.N_ITER * OptimizationConfig.N_FOLDS} fit")
    print("Training starting...\n")
    
    # Fit with sample_weight if provided
    if sample_weight is not None:
        print(f"✅ Training with weights applied to first 66 real data points...")
        random_search.fit(X_train, y_train, sample_weight=sample_weight)
    else:
        random_search.fit(X_train, y_train)
    
    # En iyi model
    best_model = random_search.best_estimator_
    
    # Test skoru
    y_pred = best_model.predict(X_test)
    y_pred_proba = best_model.predict_proba(X_test)
    test_score = calculate_roc_auc(y_test, y_pred_proba, n_classes)
    
    # CV scores for all metrics
    cv_scores = calculate_cv_scores(best_model, X_train, y_train, n_classes, cv_folds=5)
    
    # Overfitting check (ROC-AUC based)
    overfitting_diff = cv_scores['roc_auc'] - test_score
    if overfitting_diff < 0.005:
        overfitting_risk = "Low"
    elif overfitting_diff < 0.1:
        overfitting_risk = "Medium"
    else:
        overfitting_risk = "High"
    
    print("\n" + "="*60)
    print("LightGBM Results:")
    print("="*60)
    print(f"En iyi parametreler: {random_search.best_params_}")
    print(f"CV ROC-AUC: {cv_scores['roc_auc']:.4f}")
    print(f"Test ROC-AUC: {test_score:.4f}")
    print(f"Overfitting riski: {overfitting_risk}")
    print("="*60)
    
    return best_model, random_search.best_params_, cv_scores, test_score


def save_results(catboost_model, lightgbm_model, label_encoder, 
                 catboost_params, lightgbm_params,
                 catboost_cv, catboost_test, lightgbm_cv, lightgbm_test,
                 backend_path, n_classes):
    """Saves results."""
    print("\n[5/5] Saving results...")
    
    # Artifacts directory
    artifacts_dir = backend_path / "artifacts"
    artifacts_dir.mkdir(exist_ok=True)
    
    # Save models
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    catboost_path = artifacts_dir / f"catboost_optimized_{timestamp}.pkl"
    lightgbm_path = artifacts_dir / f"lightgbm_optimized_{timestamp}.pkl"
    encoder_path = artifacts_dir / f"label_encoder_{timestamp}.pkl"
    
    joblib.dump(catboost_model, catboost_path)
    joblib.dump(lightgbm_model, lightgbm_path)
    joblib.dump(label_encoder, encoder_path)
    
    # Metadata dosyası (CV skorları ve parametreleri içerir)
    metadata_path = artifacts_dir / f"model_metadata_{timestamp}.json"
    metadata = {
        "timestamp": timestamp,
        "catboost": {
            "model_file": catboost_path.name,
            "cv_scores": {
                "accuracy": float(catboost_cv['accuracy']),
                "precision": float(catboost_cv['precision']),
                "recall": float(catboost_cv['recall']),
                "f1": float(catboost_cv['f1']),
                "roc_auc": float(catboost_cv['roc_auc'])
            },
            "test_score": float(catboost_test),
            "best_params": catboost_params
        },
        "lightgbm": {
            "model_file": lightgbm_path.name,
            "cv_scores": {
                "accuracy": float(lightgbm_cv['accuracy']),
                "precision": float(lightgbm_cv['precision']),
                "recall": float(lightgbm_cv['recall']),
                "f1": float(lightgbm_cv['f1']),
                "roc_auc": float(lightgbm_cv['roc_auc'])
            },
            "test_score": float(lightgbm_test),
            "best_params": lightgbm_params
        },
        "encoder_file": encoder_path.name,
        "n_classes": int(n_classes)
    }
    
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Modeller ve metadata kaydedildi:")
    print(f"  - {catboost_path.name}")
    print(f"  - {lightgbm_path.name}")
    print(f"  - {encoder_path.name}")
    print(f"  - {metadata_path.name}")
    
    # Rapor oluştur
    reports_dir = backend_path / "reports"
    reports_dir.mkdir(exist_ok=True)
    
    report_path = reports_dir / f"optimization_report_{timestamp}.txt"
    
    classification_type = "Binary Classification" if n_classes == 2 else f"Multi-class Classification ({n_classes} sınıf)"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("="*60 + "\n")
        f.write("YETRIA Optimizasyon Raporu\n")
        f.write("="*60 + "\n\n")
        f.write(f"Tarih: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Classification Tipi: {classification_type}\n")
        f.write(f"Sınıflar: {label_encoder.classes_.tolist()}\n\n")
        
        f.write("CatBoost Sonuçları:\n")
        f.write("-"*60 + "\n")
        f.write(f"En iyi parametreler: {catboost_params}\n\n")
        f.write("CV Skorları (5-Fold):\n")
        f.write(f"  Accuracy:  {catboost_cv['accuracy']:.4f}\n")
        f.write(f"  Precision: {catboost_cv['precision']:.4f}\n")
        f.write(f"  Recall:    {catboost_cv['recall']:.4f}\n")
        f.write(f"  F1-Score:  {catboost_cv['f1']:.4f}\n")
        f.write(f"  ROC-AUC:   {catboost_cv['roc_auc']:.4f}\n\n")
        f.write(f"Test ROC-AUC: {catboost_test:.4f}\n")
        f.write(f"Fark (CV - Test): {catboost_cv['roc_auc'] - catboost_test:+.4f}\n\n")
        
        f.write("LightGBM Sonuçları:\n")
        f.write("-"*60 + "\n")
        f.write(f"En iyi parametreler: {lightgbm_params}\n\n")
        f.write("CV Skorları (5-Fold):\n")
        f.write(f"  Accuracy:  {lightgbm_cv['accuracy']:.4f}\n")
        f.write(f"  Precision: {lightgbm_cv['precision']:.4f}\n")
        f.write(f"  Recall:    {lightgbm_cv['recall']:.4f}\n")
        f.write(f"  F1-Score:  {lightgbm_cv['f1']:.4f}\n")
        f.write(f"  ROC-AUC:   {lightgbm_cv['roc_auc']:.4f}\n\n")
        f.write(f"Test ROC-AUC: {lightgbm_test:.4f}\n")
        f.write(f"Fark (CV - Test): {lightgbm_cv['roc_auc'] - lightgbm_test:+.4f}\n\n")
        
        f.write("Kazanan Model:\n")
        f.write("-"*60 + "\n")
        if catboost_test > lightgbm_test:
            f.write(f"CatBoost (Test skoru: {catboost_test:.4f})\n")
        else:
            f.write(f"LightGBM (Test skoru: {lightgbm_test:.4f})\n")
    
    print(f"✓ Report created: {report_path.name}")


def run_gridsearch_optimization(data_path, test_size=0.3, random_state=42):
    """
    Main optimization function.
    
    Automatically:
    - Checks GPU status
    - Loads data
    - Detects binary or multi-class
    - Optimizes both models
    - Saves results
    
    Args:
        data_path: Data file path (model_training_data.csv)
        test_size: Test data ratio
        random_state: Random seed
    """
    # Backend path
    backend_path = Path(data_path).parent.parent.parent
    
    # GPU check
    print("\n" + "="*60)
    print("GPU/CPU Check")
    print("="*60)
    
    if OptimizationConfig.USE_GPU:
        gpu_available, gpu_info = check_gpu_availability()
        for info in gpu_info:
            print(info)
        
        if not gpu_available:
            print("\n⚠ GPU not found or unavailable.")
            print("Switching to CPU mode...")
            OptimizationConfig.USE_GPU = False
    else:
        print("✓ CPU mode selected (config)")
    
    print("="*60)
    
    # Load and prepare data
    X_train, X_test, y_train, y_test, label_encoder, n_classes, sample_weight = load_and_prepare_data(
        data_path, test_size, random_state
    )
    
    # CatBoost optimization
    catboost_model, catboost_params, catboost_cv, catboost_test = optimize_catboost(
        X_train, y_train, X_test, y_test, n_classes, sample_weight
    )
    
    # LightGBM optimization
    lightgbm_model, lightgbm_params, lightgbm_cv, lightgbm_test = optimize_lightgbm(
        X_train, y_train, X_test, y_test, n_classes, sample_weight
    )
    
    # Save results
    save_results(
        catboost_model, lightgbm_model, label_encoder,
        catboost_params, lightgbm_params,
        catboost_cv, catboost_test, lightgbm_cv, lightgbm_test,
        backend_path, n_classes
    )
    
    print("\n" + "="*60)
    print("✓ Optimization Successfully Completed!")
    print("="*60)
    print("\nSummary:")
    print(f"  Working Mode: {'GPU' if OptimizationConfig.USE_GPU else 'CPU'}")
    print(f"  Classification Type: {'Binary' if n_classes == 2 else 'Multi-class'}")
    print(f"  Class Count: {n_classes}")
    print(f"  CatBoost Test Score: {catboost_test:.4f}")
    print(f"  LightGBM Test Score: {lightgbm_test:.4f}")
    
    if catboost_test > lightgbm_test:
        print(f"\n🏆 Winner: CatBoost ({catboost_test:.4f})")
    else:
        print(f"\n🏆 Winner: LightGBM ({lightgbm_test:.4f})")
    
    print("\nFiles:")
    print("  - Models: in artifacts/ directory")
    print("  - Report: in reports/ directory")
    print("\nFor detailed metric analysis:")
    print("  python scripts/ml/evaluate_saved_models.py")