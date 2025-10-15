"""
Yetria Career Guidance Platform - Model Evaluation Module

This module comprehensively evaluates machine learning model performance.
It calculates and visualizes all necessary metrics according to professional
ML engineering standards.

Features:
- Detailed classification metrics (accuracy, precision, recall, F1, ROC-AUC)
- Confusion matrix analysis and visualization
- ROC and PR curves
- Overfitting/Underfitting detection
- Feature importance analysis
- Detailed cross-validation reporting
- Training and test metrics comparison

SOLID Principles:
- Single Responsibility: Each class and function performs a single task
- Open/Closed: Extensible for adding new metrics
- Interface Segregation: Separate functions for specific purposes
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Tuple, Optional, List
from dataclasses import dataclass, field

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, precision_recall_curve,
    confusion_matrix, classification_report,
    average_precision_score, matthews_corrcoef,
    cohen_kappa_score, balanced_accuracy_score
)
from sklearn.model_selection import learning_curve
import warnings
warnings.filterwarnings('ignore')


@dataclass
class ModelMetrics:
    """Data class holding model performance metrics."""
    
    # Basic metrics
    accuracy: float
    balanced_accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    
    # Advanced metrics
    average_precision: float  # PR-AUC
    matthews_corr_coef: float  # MCC
    cohen_kappa: float
    
    # Confusion matrix values
    true_positives: int
    true_negatives: int
    false_positives: int
    false_negatives: int
    
    # Additional information
    specificity: float  # True Negative Rate
    sensitivity: float  # True Positive Rate (same as Recall)
    
    # Meta information
    n_samples: int
    n_classes: int
    class_names: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        """Converts metrics to dictionary."""
        return {
            'accuracy': self.accuracy,
            'balanced_accuracy': self.balanced_accuracy,
            'precision': self.precision,
            'recall': self.recall,
            'f1_score': self.f1_score,
            'roc_auc': self.roc_auc,
            'average_precision': self.average_precision,
            'matthews_corr_coef': self.matthews_corr_coef,
            'cohen_kappa': self.cohen_kappa,
            'true_positives': self.true_positives,
            'true_negatives': self.true_negatives,
            'false_positives': self.false_positives,
            'false_negatives': self.false_negatives,
            'specificity': self.specificity,
            'sensitivity': self.sensitivity,
            'n_samples': self.n_samples,
            'n_classes': self.n_classes,
        }


@dataclass
class OverfittingAnalysis:
    """Class holding overfitting/underfitting analysis results."""
    
    train_metrics: ModelMetrics
    test_metrics: ModelMetrics
    
    # Differences (test - train)
    accuracy_gap: float
    roc_auc_gap: float
    f1_gap: float
    
    # Diagnosis
    diagnosis: str  # "No Overfitting", "Mild Overfitting", "Severe Overfitting", "Underfitting"
    recommendation: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Converts analysis to dictionary."""
        return {
            'accuracy_gap': self.accuracy_gap,
            'roc_auc_gap': self.roc_auc_gap,
            'f1_gap': self.f1_gap,
            'diagnosis': self.diagnosis,
            'recommendation': self.recommendation,
        }


class MetricsCalculator:
    """
    Class for calculating model metrics.
    
    Single Responsibility: Only performs metric calculation.
    """
    
    @staticmethod
    def calculate_binary_metrics(
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_pred_proba: np.ndarray,
        class_names: List[str]
    ) -> ModelMetrics:
        """
        Calculates all metrics for binary classification.
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            y_pred_proba: Prediction probabilities (2 columns)
            class_names: Class names
            
        Returns:
            ModelMetrics object
        """
        # Confusion matrix values
        cm = confusion_matrix(y_true, y_pred)
        tn, fp, fn, tp = cm.ravel()
        
        # Basic metrics
        accuracy = accuracy_score(y_true, y_pred)
        balanced_acc = balanced_accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, zero_division=0)
        recall = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        
        # ROC-AUC (positive class probability)
        roc_auc = roc_auc_score(y_true, y_pred_proba[:, 1])
        
        # PR-AUC
        avg_precision = average_precision_score(y_true, y_pred_proba[:, 1])
        
        # Advanced metrics
        mcc = matthews_corrcoef(y_true, y_pred)
        kappa = cohen_kappa_score(y_true, y_pred)
        
        # Specificity ve Sensitivity
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
        sensitivity = recall  # Same as recall (TPR)
        
        return ModelMetrics(
            accuracy=accuracy,
            balanced_accuracy=balanced_acc,
            precision=precision,
            recall=recall,
            f1_score=f1,
            roc_auc=roc_auc,
            average_precision=avg_precision,
            matthews_corr_coef=mcc,
            cohen_kappa=kappa,
            true_positives=int(tp),
            true_negatives=int(tn),
            false_positives=int(fp),
            false_negatives=int(fn),
            specificity=specificity,
            sensitivity=sensitivity,
            n_samples=len(y_true),
            n_classes=2,
            class_names=class_names,
        )
    
    @staticmethod
    def calculate_multiclass_metrics(
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_pred_proba: np.ndarray,
        class_names: List[str]
    ) -> ModelMetrics:
        """
        Calculates all metrics for multi-class classification.
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            y_pred_proba: Prediction probabilities (n_classes columns)
            class_names: Class names
            
        Returns:
            ModelMetrics object
        """
        # Basic metrics (weighted average)
        accuracy = accuracy_score(y_true, y_pred)
        balanced_acc = balanced_accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_true, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)
        
        # ROC-AUC (OvR - One vs Rest)
        roc_auc = roc_auc_score(y_true, y_pred_proba, multi_class='ovr', average='weighted')
        
        # PR-AUC (weighted average)
        avg_precision = average_precision_score(
            y_true, y_pred_proba, average='weighted'
        )
        
        # Advanced metrics
        mcc = matthews_corrcoef(y_true, y_pred)
        kappa = cohen_kappa_score(y_true, y_pred)
        
        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        
        # Multi-class TP, TN, FP, FN totals
        tp = np.diag(cm).sum()
        fp = cm.sum(axis=0).sum() - tp
        fn = cm.sum(axis=1).sum() - tp
        tn = cm.sum() - tp - fp - fn
        
        # Specificity ve Sensitivity hesaplama
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
        sensitivity = recall  # Weighted recall
        
        return ModelMetrics(
            accuracy=accuracy,
            balanced_accuracy=balanced_acc,
            precision=precision,
            recall=recall,
            f1_score=f1,
            roc_auc=roc_auc,
            average_precision=avg_precision,
            matthews_corr_coef=mcc,
            cohen_kappa=kappa,
            true_positives=int(tp),
            true_negatives=int(tn),
            false_positives=int(fp),
            false_negatives=int(fn),
            specificity=specificity,
            sensitivity=sensitivity,
            n_samples=len(y_true),
            n_classes=len(class_names),
            class_names=class_names,
        )


class OverfittingDetector:
    """
    Class for detecting overfitting/underfitting.
    
    Single Responsibility: Only performs overfitting analysis.
    """
    
    # Threshold values
    MILD_OVERFITTING_THRESHOLD = 0.05  # %5
    SEVERE_OVERFITTING_THRESHOLD = 0.10  # %10
    UNDERFITTING_THRESHOLD = 0.75  # Below 75% accuracy
    
    @staticmethod
    def analyze(
        cv_scores: Dict[str, float],
        test_metrics: ModelMetrics
    ) -> OverfittingAnalysis:
        """
        Performs overfitting analysis by comparing CV scores and test metrics.
        
        Args:
            cv_scores: Cross-validation scores (accuracy, precision, recall, f1, roc_auc)
            test_metrics: Test data metrics
            
        Returns:
            OverfittingAnalysis object
        """
        # If no CV scores, use old method (with warning)
        if not cv_scores:
            return OverfittingAnalysis(
                train_metrics=None,
                test_metrics=test_metrics,
                accuracy_gap=0.0,
                roc_auc_gap=0.0,
                f1_gap=0.0,
                diagnosis="Warning: No CV scores, overfitting analysis cannot be performed",
                recommendation="Model should be retrained to calculate CV scores."
            )
        
        # Calculate differences (CV - test)
        # Positive value: CV better (normal, mild overfitting)
        # Large positive value: Severe overfitting
        # Negative value: Test better (good generalization or data leakage)
        accuracy_gap = cv_scores['accuracy'] - test_metrics.accuracy
        roc_auc_gap = cv_scores['roc_auc'] - test_metrics.roc_auc
        f1_gap = cv_scores['f1'] - test_metrics.f1_score
        
        # Diagnosis
        diagnosis, recommendation = OverfittingDetector._diagnose_cv(
            cv_scores, test_metrics, accuracy_gap, roc_auc_gap, f1_gap
        )
        
        return OverfittingAnalysis(
            train_metrics=None,  # No longer using
            test_metrics=test_metrics,
            accuracy_gap=accuracy_gap,
            roc_auc_gap=roc_auc_gap,
            f1_gap=f1_gap,
            diagnosis=diagnosis,
            recommendation=recommendation,
        )
    
    @staticmethod
    def _diagnose_cv(
        cv_scores: Dict[str, float],
        test_metrics: ModelMetrics,
        acc_gap: float,
        roc_gap: float,
        f1_gap: float
    ) -> Tuple[str, str]:
        """
        Makes overfitting diagnosis based on CV scores and provides recommendations.
        
        Returns:
            (diagnosis, recommendation) tuple
        """
        # Underfitting check (both CV and test performance low)
        if (cv_scores['accuracy'] < OverfittingDetector.UNDERFITTING_THRESHOLD and
            test_metrics.accuracy < OverfittingDetector.UNDERFITTING_THRESHOLD):
            return (
                "Underfitting (Model hasn't learned enough)",
                "Increase model complexity, add more features, "
                "or try a more complex model."
            )
        
        # Calculate average gap
        avg_gap = (acc_gap + roc_gap + f1_gap) / 3
        
        # Severe overfitting (CV >> Test)
        if avg_gap > OverfittingDetector.SEVERE_OVERFITTING_THRESHOLD:
            return (
                "Severe Overfitting (CV scores much higher than test scores)",
                "Increase regularization (L1/L2), reduce model complexity, "
                "collect more data, or add dropout."
            )
        
        # Mild overfitting (CV > Test, acceptable)
        if avg_gap > OverfittingDetector.MILD_OVERFITTING_THRESHOLD:
            return (
                "Mild Overfitting (Controllable level)",
                "Adjust regularization parameters, "
                "use early stopping. Model shows good performance overall."
            )
        
        # Negative gap - test better (usually a good sign)
        if avg_gap < -0.05:
            return (
                "Perfect Generalization (Test > CV)",
                "Model shows better performance on test set than CV. "
                "This is usually a good sign. Keep current configuration."
            )
        
        # Ideal situation - CV ≈ Test
        return (
            "No Overfitting (Model generalizes well)",
            "CV and test scores are balanced. Model shows good performance. "
            "Keep current configuration."
        )


class VisualizationEngine:
    """
    Class for creating model evaluation visualizations.
    
    Single Responsibility: Only performs visualization tasks.
    """
    
    @staticmethod
    def plot_confusion_matrix(
        y_true: np.ndarray,
        y_pred: np.ndarray,
        class_names: List[str],
        title: str,
        save_path: Optional[Path] = None
    ) -> None:
        """
        Creates confusion matrix visualization.
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            class_names: Class names
            title: Chart title
            save_path: File path to save (optional)
        """
        cm = confusion_matrix(y_true, y_pred)
        
        plt.figure(figsize=(10, 8))
        sns.heatmap(
            cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=class_names,
            yticklabels=class_names,
            cbar_kws={'label': 'Count'}
        )
        plt.title(title, fontsize=14, fontweight='bold')
        plt.ylabel('True Label', fontsize=12)
        plt.xlabel('Predicted Label', fontsize=12)
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"✓ Confusion matrix saved: {save_path.name}")
        plt.close()
    
    @staticmethod
    def plot_roc_curve(
        y_true: np.ndarray,
        y_pred_proba: np.ndarray,
        model_name: str,
        save_path: Optional[Path] = None
    ) -> None:
        """
        ROC curve visualization (for binary classification).
        
        Args:
            y_true: True labels
            y_pred_proba: Prediction probabilities (2 columns)
            model_name: Model name
            save_path: File path to save (optional)
        """
        fpr, tpr, thresholds = roc_curve(y_true, y_pred_proba[:, 1])
        roc_auc = roc_auc_score(y_true, y_pred_proba[:, 1])
        
        plt.figure(figsize=(10, 8))
        plt.plot(fpr, tpr, color='darkorange', lw=2,
                 label=f'{model_name} (AUC = {roc_auc:.4f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--',
                 label='Random Classifier (AUC = 0.50)')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate (1 - Specificity)', fontsize=12)
        plt.ylabel('True Positive Rate (Sensitivity)', fontsize=12)
        plt.title(f'ROC Curve - {model_name}', fontsize=14, fontweight='bold')
        plt.legend(loc="lower right", fontsize=10)
        plt.grid(alpha=0.3)
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"✓ ROC curve saved: {save_path.name}")
        plt.close()
    
    @staticmethod
    def plot_precision_recall_curve(
        y_true: np.ndarray,
        y_pred_proba: np.ndarray,
        model_name: str,
        save_path: Optional[Path] = None
    ) -> None:
        """
        Precision-Recall curve visualization (for binary classification).
        
        Args:
            y_true: True labels
            y_pred_proba: Prediction probabilities (2 columns)
            model_name: Model name
            save_path: File path to save (optional)
        """
        precision, recall, thresholds = precision_recall_curve(
            y_true, y_pred_proba[:, 1]
        )
        avg_precision = average_precision_score(y_true, y_pred_proba[:, 1])
        
        plt.figure(figsize=(10, 8))
        plt.plot(recall, precision, color='darkorange', lw=2,
                 label=f'{model_name} (AP = {avg_precision:.4f})')
        plt.xlabel('Recall (Sensitivity)', fontsize=12)
        plt.ylabel('Precision', fontsize=12)
        plt.title(f'Precision-Recall Curve - {model_name}',
                  fontsize=14, fontweight='bold')
        plt.legend(loc="lower left", fontsize=10)
        plt.grid(alpha=0.3)
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"✓ PR curve saved: {save_path.name}")
        plt.close()
    
    @staticmethod
    def plot_cv_vs_test_comparison(
        cv_scores: Dict[str, float],
        test_metrics: ModelMetrics,
        model_name: str,
        save_path: Optional[Path] = None
    ) -> None:
        """
        Bar plot comparing CV and test metrics.
        
        Args:
            cv_scores: CV scores dictionary
            test_metrics: Test metrics
            model_name: Model name
            save_path: File path to save (optional)
        """
        metrics_names = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC']
        cv_values = [
            cv_scores['accuracy'],
            cv_scores['precision'],
            cv_scores['recall'],
            cv_scores['f1'],
            cv_scores['roc_auc'],
        ]
        test_values = [
            test_metrics.accuracy,
            test_metrics.precision,
            test_metrics.recall,
            test_metrics.f1_score,
            test_metrics.roc_auc,
        ]
        
        x = np.arange(len(metrics_names))
        width = 0.35
        
        fig, ax = plt.subplots(figsize=(12, 7))
        bars1 = ax.bar(x - width/2, cv_values, width, label='Cross-Validation',
                       color='steelblue', alpha=0.8)
        bars2 = ax.bar(x + width/2, test_values, width, label='Test',
                       color='coral', alpha=0.8)
        
        ax.set_ylabel('Score', fontsize=12)
        ax.set_title(f'CV vs Test Performance Comparison - {model_name}',
                     fontsize=14, fontweight='bold')
        ax.set_xticks(x)
        ax.set_xticklabels(metrics_names, fontsize=11)
        ax.legend(fontsize=11)
        ax.set_ylim([0, 1.1])
        ax.grid(axis='y', alpha=0.3)
        
        # Write values above bars
        def autolabel(bars):
            for bar in bars:
                height = bar.get_height()
                ax.annotate(f'{height:.3f}',
                           xy=(bar.get_x() + bar.get_width() / 2, height),
                           xytext=(0, 3),
                           textcoords="offset points",
                           ha='center', va='bottom', fontsize=9)
        
        autolabel(bars1)
        autolabel(bars2)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"✓ CV vs Test comparison chart saved: {save_path.name}")
        plt.close()


class ReportGenerator:
    """
    Class for creating detailed text reports.
    
    Single Responsibility: Only performs report generation.
    """
    
    @staticmethod
    def generate_evaluation_report(
        model_name: str,
        test_metrics: ModelMetrics,
        overfitting_analysis: OverfittingAnalysis,
        best_params: Dict[str, Any],
        cv_scores: Dict[str, float],
        output_path: Path
    ) -> None:
        """
        Creates detailed evaluation report and saves to file.
        
        Args:
            model_name: Model name
            test_metrics: Test metrics
            overfitting_analysis: Overfitting analysis
            best_params: Best hyperparameters
            cv_scores: Cross-validation scores dictionary
            output_path: Report file path
        """
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        with open(output_path, 'w', encoding='utf-8') as f:
            # Header
            f.write("=" * 80 + "\n")
            f.write(f"YETRIA Model Evaluation Report - {model_name}\n")
            f.write("=" * 80 + "\n\n")
            f.write(f"Date: {timestamp}\n")
            f.write(f"Model: {model_name}\n")
            f.write(f"Class Count: {test_metrics.n_classes}\n")
            f.write(f"Classes: {', '.join(test_metrics.class_names)}\n")
            f.write("\n")
            
            # Cross-Validation Results
            f.write("-" * 80 + "\n")
            f.write("CROSS-VALIDATION SONUÇLARI (5-Fold)\n")
            f.write("-" * 80 + "\n")
            if cv_scores:
                f.write(f"CV Accuracy:     {cv_scores['accuracy']:.4f}\n")
                f.write(f"CV Precision:    {cv_scores['precision']:.4f}\n")
                f.write(f"CV Recall:       {cv_scores['recall']:.4f}\n")
                f.write(f"CV F1-Score:     {cv_scores['f1']:.4f}\n")
                f.write(f"CV ROC-AUC:      {cv_scores['roc_auc']:.4f}\n")
            else:
                f.write("CV Skorları: Bilinmiyor (Model önceden eğitilmiş)\n")
            f.write("\n")
            
            # Test Set Performansı
            f.write("-" * 80 + "\n")
            f.write("TEST SETİ PERFORMANSI (Ana Metrikler)\n")
            f.write("-" * 80 + "\n")
            f.write(f"Accuracy:               {test_metrics.accuracy:.4f}\n")
            f.write(f"Balanced Accuracy:      {test_metrics.balanced_accuracy:.4f}\n")
            f.write(f"Precision:              {test_metrics.precision:.4f}\n")
            f.write(f"Recall (Sensitivity):   {test_metrics.recall:.4f}\n")
            f.write(f"Specificity:            {test_metrics.specificity:.4f}\n")
            f.write(f"F1-Score:               {test_metrics.f1_score:.4f}\n")
            f.write(f"ROC-AUC:                {test_metrics.roc_auc:.4f}\n")
            f.write(f"PR-AUC:                 {test_metrics.average_precision:.4f}\n")
            f.write("\n")
            
            # İleri Seviye Metrikler
            f.write("-" * 80 + "\n")
            f.write("İLERİ SEVİYE METRİKLER (Test Set)\n")
            f.write("-" * 80 + "\n")
            f.write(f"Matthews Correlation:   {test_metrics.matthews_corr_coef:.4f}\n")
            f.write(f"Cohen's Kappa:          {test_metrics.cohen_kappa:.4f}\n")
            f.write("\n")
            
            # Confusion Matrix
            f.write("-" * 80 + "\n")
            f.write("CONFUSION MATRIX (Test Set)\n")
            f.write("-" * 80 + "\n")
            f.write(f"True Positives:         {test_metrics.true_positives}\n")
            f.write(f"True Negatives:         {test_metrics.true_negatives}\n")
            f.write(f"False Positives:        {test_metrics.false_positives}\n")
            f.write(f"False Negatives:        {test_metrics.false_negatives}\n")
            f.write(f"Total Samples:          {test_metrics.n_samples}\n")
            f.write("\n")
            
            # Overfitting Analizi (CV vs Test)
            f.write("-" * 80 + "\n")
            f.write("OVERFITTING ANALİZİ (CV vs Test)\n")
            f.write("-" * 80 + "\n")
            if cv_scores:
                f.write(f"Metrik         CV Skoru    Test Skoru   Fark (CV-Test)\n")
                f.write("-" * 80 + "\n")
                f.write(f"Accuracy:      {cv_scores['accuracy']:.4f}      {test_metrics.accuracy:.4f}       {overfitting_analysis.accuracy_gap:+.4f}\n")
                f.write(f"Precision:     {cv_scores['precision']:.4f}      {test_metrics.precision:.4f}       {cv_scores['precision'] - test_metrics.precision:+.4f}\n")
                f.write(f"Recall:        {cv_scores['recall']:.4f}      {test_metrics.recall:.4f}       {cv_scores['recall'] - test_metrics.recall:+.4f}\n")
                f.write(f"F1-Score:      {cv_scores['f1']:.4f}      {test_metrics.f1_score:.4f}       {overfitting_analysis.f1_gap:+.4f}\n")
                f.write(f"ROC-AUC:       {cv_scores['roc_auc']:.4f}      {test_metrics.roc_auc:.4f}       {overfitting_analysis.roc_auc_gap:+.4f}\n")
                f.write("\n")
            f.write(f"TANI: {overfitting_analysis.diagnosis}\n")
            f.write(f"\nÖNERİ: {overfitting_analysis.recommendation}\n")
            f.write("\n")
            
            # En İyi Hiperparametreler
            f.write("-" * 80 + "\n")
            f.write("EN İYİ HİPERPARAMETRELER\n")
            f.write("-" * 80 + "\n")
            for param, value in best_params.items():
                f.write(f"{param:30s}: {value}\n")
            f.write("\n")
            
            # Özet ve Yorumlar
            f.write("-" * 80 + "\n")
            f.write("ÖZET VE YORUMLAR\n")
            f.write("-" * 80 + "\n")
            ReportGenerator._write_interpretation(f, test_metrics, overfitting_analysis)
            
            f.write("\n")
            f.write("=" * 80 + "\n")
            f.write("Rapor sonu\n")
            f.write("=" * 80 + "\n")
        
        print(f"✓ Detailed evaluation report saved: {output_path.name}")
    
    @staticmethod
    def _write_interpretation(
        f,
        metrics: ModelMetrics,
        overfitting_analysis: OverfittingAnalysis
    ) -> None:
        """Metriklerin yorumunu yazar."""
        f.write("\n1. MODEL PERFORMANSI:\n")
        
        # Accuracy yorumu
        if metrics.accuracy >= 0.90:
            f.write("   ✓ Mükemmel accuracy (≥90%)\n")
        elif metrics.accuracy >= 0.80:
            f.write("   ✓ İyi accuracy (80-90%)\n")
        elif metrics.accuracy >= 0.70:
            f.write("   • Kabul edilebilir accuracy (70-80%)\n")
        else:
            f.write("   ✗ Düşük accuracy (<70%) - İyileştirme gerekli\n")
        
        # ROC-AUC yorumu
        if metrics.roc_auc >= 0.90:
            f.write("   ✓ Mükemmel ayırt etme gücü (ROC-AUC ≥0.90)\n")
        elif metrics.roc_auc >= 0.80:
            f.write("   ✓ İyi ayırt etme gücü (ROC-AUC 0.80-0.90)\n")
        elif metrics.roc_auc >= 0.70:
            f.write("   • Orta ayırt etme gücü (ROC-AUC 0.70-0.80)\n")
        else:
            f.write("   ✗ Zayıf ayırt etme gücü (ROC-AUC <0.70)\n")
        
        # Precision-Recall dengesi
        pr_diff = abs(metrics.precision - metrics.recall)
        if pr_diff < 0.05:
            f.write("   ✓ Precision ve Recall dengeli\n")
        else:
            if metrics.precision > metrics.recall:
                f.write(f"   • Precision > Recall: Model daha muhafazakar (FP düşük, FN yüksek)\n")
            else:
                f.write(f"   • Recall > Precision: Model daha agresif (FN düşük, FP yüksek)\n")
        
        f.write("\n2. OVERFITTING DURUMU:\n")
        if "Yok" in overfitting_analysis.diagnosis:
            f.write("   ✓ Model iyi genelleme yapıyor\n")
        elif "Hafif" in overfitting_analysis.diagnosis:
            f.write("   • Hafif overfitting mevcut ama kabul edilebilir\n")
        elif "Ciddi" in overfitting_analysis.diagnosis:
            f.write("   ✗ Ciddi overfitting - Acil müdahale gerekli\n")
        elif "Underfitting" in overfitting_analysis.diagnosis:
            f.write("   ✗ Model yeterince öğrenememiş - Karmaşıklık artırılmalı\n")
        
        f.write("\n3. SINIFLAMA KALİTESİ:\n")
        # Matthews Correlation Coefficient yorumu
        if metrics.matthews_corr_coef >= 0.70:
            f.write("   ✓ Çok yüksek kaliteli sınıflama (MCC ≥0.70)\n")
        elif metrics.matthews_corr_coef >= 0.50:
            f.write("   ✓ İyi kaliteli sınıflama (MCC 0.50-0.70)\n")
        elif metrics.matthews_corr_coef >= 0.30:
            f.write("   • Orta kaliteli sınıflama (MCC 0.30-0.50)\n")
        else:
            f.write("   ✗ Düşük kaliteli sınıflama (MCC <0.30)\n")


class ModelEvaluator:
    """
    Main class managing the model evaluation process.
    
    This class coordinates the entire evaluation process:
    - Metric calculation
    - Overfitting detection
    - Visualization
    - Reporting
    
    Open/Closed Principle: Extensible for adding new metrics.
    """
    
    def __init__(self, reports_dir: Path):
        """
        Args:
            reports_dir: Directory to save reports
        """
        self.reports_dir = Path(reports_dir)
        self.reports_dir.mkdir(exist_ok=True, parents=True)
        
        self.metrics_calculator = MetricsCalculator()
        self.overfitting_detector = OverfittingDetector()
        self.visualizer = VisualizationEngine()
        self.report_generator = ReportGenerator()
    
    def evaluate_model(
        self,
        model,
        model_name: str,
        X_test: np.ndarray,
        y_test: np.ndarray,
        class_names: List[str],
        best_params: Dict[str, Any],
        cv_scores: Dict[str, float] = None,
    ) -> Tuple[ModelMetrics, OverfittingAnalysis]:
        """
        Comprehensively evaluates the model.
        
        Args:
            model: Trained model
            model_name: Model name (e.g., "CatBoost", "LightGBM")
            X_test: Test features
            y_test: Test labels
            class_names: Class names
            best_params: Best hyperparameters
            cv_scores: Cross-validation scores (accuracy, precision, recall, f1, roc_auc)
            
        Returns:
            (test_metrics, overfitting_analysis)
        """
        print(f"\n{'='*80}")
        print(f"Model Evaluation Starting: {model_name}")
        print(f"{'='*80}")
        
        n_classes = len(class_names)
        
        # Test predictions
        print("[1/4] Making test predictions...")
        y_test_pred = model.predict(X_test)
        y_test_proba = model.predict_proba(X_test)
        
        # Test metric calculation
        print("[2/4] Calculating test metrics...")
        if n_classes == 2:
            test_metrics = self.metrics_calculator.calculate_binary_metrics(
                y_test, y_test_pred, y_test_proba, class_names
            )
        else:
            test_metrics = self.metrics_calculator.calculate_multiclass_metrics(
                y_test, y_test_pred, y_test_proba, class_names
            )
        
        # Overfitting analysis (if CV scores available)
        print("[3/4] Performing overfitting analysis...")
        overfitting_analysis = self.overfitting_detector.analyze(
            cv_scores, test_metrics
        )
        
        # Visualizations
        print("[4/4] Creating visualizations and report...")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Test Confusion matrix
        self.visualizer.plot_confusion_matrix(
            y_test, y_test_pred, class_names,
            f"Confusion Matrix (Test) - {model_name}",
            self.reports_dir / f"{model_name.lower()}_confusion_matrix_test_{timestamp}.png"
        )
        
        # ROC and PR curves (only for binary classification)
        if n_classes == 2:
            self.visualizer.plot_roc_curve(
                y_test, y_test_proba, model_name,
                self.reports_dir / f"{model_name.lower()}_roc_curve_{timestamp}.png"
            )
            self.visualizer.plot_precision_recall_curve(
                y_test, y_test_proba, model_name,
                self.reports_dir / f"{model_name.lower()}_pr_curve_{timestamp}.png"
            )
        
        # CV vs Test comparison (if CV scores available)
        if cv_scores:
            self.visualizer.plot_cv_vs_test_comparison(
                cv_scores, test_metrics, model_name,
                self.reports_dir / f"{model_name.lower()}_cv_vs_test_comparison_{timestamp}.png"
            )
        
        # Create report
        self.report_generator.generate_evaluation_report(
            model_name,
            test_metrics,
            overfitting_analysis,
            best_params,
            cv_scores,
            self.reports_dir / f"{model_name.lower()}_evaluation_report_{timestamp}.txt"
        )
        
        print(f"{'='*80}")
        print(f"✓ Model evaluation completed: {model_name}")
        print(f"{'='*80}\n")
        
        return test_metrics, overfitting_analysis