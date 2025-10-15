"""
Yetria Career Guidance Platform - Visualization Utilities

This module provides visualization functions for data analysis, model evaluation,
and reporting purposes.
"""
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from pathlib import Path
import numpy as np
from sklearn.metrics import confusion_matrix, roc_curve, auc

def ensure_reports_dir(base: str = "backend/reports") -> Path:
    path = Path(base)
    path.mkdir(parents=True, exist_ok=True)
    return path

def visualize_distributions(df: pd.DataFrame, out_dir: Path) -> None:
    num_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    for col in num_cols:
        plt.figure(figsize=(6, 4))
        sns.histplot(df[col], kde=True, stat="density", bins=30, color="#4C78A8")
        plt.title(f"Distribution: {col}")
        plt.tight_layout()
        plt.savefig(out_dir / f"hist_{col}.png", dpi=150)
        plt.close()

def plot_correlations_by_persona(df: pd.DataFrame, persona_col: str = "persona") -> None:
    """Create correlation heatmaps per persona and a point-biserial bar chart.

    Expects a wide table with `persona` and 8 competency numeric columns.
    Saves plots into backend/reports/.
    """
    reports = ensure_reports_dir()
    # Prefer the canonical 8 competency names if present; otherwise fallback to
    # all numeric columns except id/persona
    canonical_cols = [
        "Analitik Düşünme",
        "Sayısal Zeka",
        "Stres Yönetimi",
        "Empati",
        "Takım Çalışması",
        "Hızlı ve Soğukkanlı Karar Alma",
        "Duygusal Dayanıklılık",
        "Teknoloji Adaptasyonu",
    ]
    if all(col in df.columns for col in canonical_cols):
        feature_cols = canonical_cols
    else:
        feature_cols = [
            c for c in df.columns
            if c not in {persona_col, "id"} and pd.api.types.is_numeric_dtype(df[c])
        ]

    # 1) Heatmaps per persona
    for group_name, sub in df.groupby(persona_col):
        if sub[feature_cols].empty or len(sub) < 2:
            print(f"Skipped: {group_name} group has insufficient data")
            continue
        corr = sub[feature_cols].corr(numeric_only=True)
        if corr.empty or corr.isna().all().all():
            print(f"Skipped: Cannot calculate correlation for {group_name} group")
            continue
        plt.figure(figsize=(8, 6))
        sns.heatmap(corr, annot=True, cmap="YlGnBu", fmt=".2f", square=True)
        plt.title(f"Correlation Heatmap – {group_name}")
        plt.tight_layout()
        safe = str(group_name).replace(" ", "_")
        plt.savefig(reports / f"corr_heatmap_{safe}.png", dpi=150)
        plt.close()

def plot_radar_chart(df: pd.DataFrame, reports_dir: Path):
    """
    Creates and saves a radar chart comparing average competency profiles
    of two profession groups.
    """
    feature_cols = df.drop(columns=['id', 'persona']).columns
    labels = [col.replace(" ", "\n") for col in feature_cols]
    num_vars = len(labels)

    angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))

    personas = df['persona'].unique()
    for i, persona in enumerate(personas):
        mean_scores = df[df['persona'] == persona][feature_cols].mean().values.flatten().tolist()
        mean_scores += mean_scores[:1]
        ax.plot(angles, mean_scores, label=persona, linewidth=2)
        ax.fill(angles, mean_scores, alpha=0.25)
    
    ax.set_yticklabels([])
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(labels)
    plt.title('Average Competency Profiles by Profession Groups', size=16, y=1.1)
    plt.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
    plt.tight_layout()
    plt.savefig(reports_dir / "competency_radar_chart.png", dpi=150)
    plt.close()
    print("Radar chart created: competency_radar_chart.png")

def plot_box_plots(df: pd.DataFrame, reports_dir: Path):
    """
    Compares score distributions of profession groups for each competency
    using box plots and saves them.
    """
    df_long = pd.melt(df, id_vars=['persona'], value_vars=df.drop(columns=['id', 'persona']).columns,
                      var_name='Competency', value_name='Score')
    
    plt.figure(figsize=(12, 8))
    sns.boxplot(data=df_long, x='Score', y='Competency', hue='persona', orient='h')
    plt.title('Competency Score Distributions by Profession Groups', size=16)
    plt.xlabel('Competency Score')
    plt.ylabel('')
    plt.legend(title='Profession Group')
    plt.tight_layout()
    plt.savefig(reports_dir / "competency_box_plots.png", dpi=150)
    plt.close()
    print("Box plots created: competency_box_plots.png")

def plot_model_comparison(results_df: pd.DataFrame, reports_dir: Path):
    """Creates a bar chart comparing Test ROC AUC scores of models."""
    plt.figure(figsize=(10, 6))
    sns.barplot(x='model_name', y='test_roc_auc', data=results_df.sort_values('test_roc_auc', ascending=False))
    plt.title('Model Comparison: Test Set ROC AUC Scores')
    plt.xlabel('Model')
    plt.ylabel('ROC AUC Score')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig(reports_dir / "model_comparison_roc_auc.png", dpi=150)
    plt.close()
    print("Model comparison chart created: model_comparison_roc_auc.png")

def plot_confusion_matrix(y_true, y_pred, class_names, reports_dir: Path, model_name: str):
    """Visualizes and saves confusion matrix as a heatmap."""
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names)
    plt.title(f'Confusion Matrix - {model_name}')
    plt.ylabel('True Value')

    plt.xlabel('Predicted Value')
    plt.tight_layout()
    plt.savefig(reports_dir / f"model_confusion_matrix_{model_name}.png", dpi=150)
    plt.close()
    print(f"Confusion matrix chart ({model_name}) created.")

def plot_roc_curve(model, X_test, y_test, reports_dir: Path, model_name: str):
    """Plots ROC curve and shows AUC score."""
    y_probs = model.predict_proba(X_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_probs)
    roc_auc = auc(fpr, tpr)
    
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f'ROC Curve - {model_name}')
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(reports_dir / f"model_roc_curve_{model_name}.png", dpi=150)
    plt.close()
    print(f"ROC curve chart ({model_name}) created.")

def plot_feature_importance(model, feature_names: list, reports_dir: Path, model_name: str):
    """
    Visualizes model feature importance.
    Works separately for tree-based and linear models.
    """
    if hasattr(model, 'feature_importances_'): # LGBM, CatBoost
        importances = model.feature_importances_
    elif hasattr(model, 'coef_'): # Logistic Regression
        importances = np.abs(model.coef_[0])
    else:
        print(f"Warning: Cannot extract feature importance for {model_name}.")
        return

    importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
    importance_df = importance_df.sort_values(by='Importance', ascending=False)
    
    plt.figure(figsize=(10, 8))
    sns.barplot(x='Importance', y='Feature', data=importance_df, palette='viridis')
    plt.title(f'Feature Importance Ranking - {model_name}')
    plt.xlabel('Importance Score')
    plt.ylabel('Competency')
    plt.tight_layout()
    plt.savefig(reports_dir / f"model_feature_importance_{model_name}.png", dpi=150)
    plt.close()
    print(f"Feature importance ranking chart ({model_name}) created.")

def plot_learning_curves(curve_data: dict, reports_dir: Path, model_name: str):
    """
    Draws appropriate learning curves based on model type.
    
    Args:
        curve_data: Model learning data
        reports_dir: Directory to save charts
        model_name: Model name
    """
    plt.figure(figsize=(12, 8))
    
    if model_name == "LGBMClassifier":
        # LightGBM iteration-based logloss chart
        iterations = range(1, len(curve_data['train_logloss']) + 1)
        
        plt.plot(iterations, curve_data['train_logloss'], 
                label='Train LogLoss', color='blue', linewidth=2)
        plt.plot(iterations, curve_data['test_logloss'], 
                label='Test LogLoss', color='red', linewidth=2, linestyle='--')
        
        plt.xlabel('Iteration', fontsize=12)
        plt.ylabel('LogLoss', fontsize=12)
        plt.title(f'{model_name}: Learning Curves (LogLoss)', fontsize=14, fontweight='bold')
        
    elif model_name == "CatBoostClassifier":
        # CatBoost iteration-based logloss chart
        if 'learn' in curve_data and 'validation' in curve_data:
            learn_data = curve_data['learn']['Logloss']
            validation_data = curve_data['validation']['Logloss']
            iterations = range(1, len(learn_data) + 1)
            
            plt.plot(iterations, learn_data, 
                    label='Train LogLoss', color='blue', linewidth=2)
            plt.plot(iterations, validation_data, 
                    label='Test LogLoss', color='red', linewidth=2, linestyle='--')
            
            plt.xlabel('Iteration', fontsize=12)
            plt.ylabel('LogLoss', fontsize=12)
            plt.title(f'{model_name}: Learning Curves (LogLoss)', fontsize=14, fontweight='bold')
        
    elif model_name == "LogisticRegression":
        # LogisticRegression validation curve (C parameter)
        C_values = curve_data['C_values']
        train_mean = curve_data['train_scores_mean']
        train_std = curve_data['train_scores_std']
        test_mean = curve_data['test_scores_mean']
        test_std = curve_data['test_scores_std']
        
        plt.semilogx(C_values, train_mean, 'o-', color='blue', 
                    label='Train Accuracy', linewidth=2, markersize=6)
        plt.fill_between(C_values, train_mean - train_std, train_mean + train_std, 
                        alpha=0.1, color='blue')
        
        plt.semilogx(C_values, test_mean, 's--', color='red', 
                    label='Test Accuracy', linewidth=2, markersize=6)
        plt.fill_between(C_values, test_mean - test_std, test_mean + test_std, 
                        alpha=0.1, color='red')
        
        plt.xlabel('C (Regularization Parameter)', fontsize=12)
        plt.ylabel('Accuracy', fontsize=12)
        plt.title(f'{model_name}: Validation Curve (C Parameter)', fontsize=14, fontweight='bold')
    
    plt.legend(fontsize=11)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(reports_dir / f'learning_curves_{model_name}.png', dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Learning curve chart ({model_name}) created.")