"""
Yetria Career Guidance Platform - Prediction Service

This module provides a PredictionService class that uses trained models
and related components to make predictions and analysis for new user data.
"""
import logging
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class PredictionService:
    """Loads model components and manages prediction logic."""

    def __init__(self, artifacts_path: Path = None):
        """Loads all required model components (artifacts)."""
        if artifacts_path is None:
            # Navigate to backend/artifacts from current file location
            self.artifacts_path = Path(__file__).resolve().parents[2] / "artifacts"
        else:
            self.artifacts_path = artifacts_path

        logger.info("Initializing PredictionService, loading components...")
        try:
            # Try to load optimized LightGBM model first
            lightgbm_files = list(self.artifacts_path.glob('lightgbm_optimized_*.pkl'))
            if lightgbm_files:
                # Use the latest LightGBM model
                latest_lightgbm = max(lightgbm_files, key=lambda x: x.stat().st_mtime)
                self.model = joblib.load(latest_lightgbm)
                logger.info(f"✓ Optimized LightGBM model loaded: {latest_lightgbm.name}")
            else:
                # Fallback: use legacy model
                self.model = joblib.load(self.artifacts_path / 'best_model.joblib')
                logger.warning("⚠ Optimized model not found, using legacy model")
            
            self.scaler = joblib.load(self.artifacts_path / 'scaler.joblib')
            
            # Load label encoder from optimized model
            encoder_files = list(self.artifacts_path.glob('label_encoder_*.pkl'))
            if encoder_files:
                latest_encoder = max(encoder_files, key=lambda x: x.stat().st_mtime)
                self.le = joblib.load(latest_encoder)
                logger.info(f"✓ Optimized label encoder loaded: {latest_encoder.name}")
            else:
                self.le = joblib.load(self.artifacts_path / 'label_encoder.joblib')
                logger.warning("⚠ Optimized encoder not found, using legacy encoder")
            
            self.grup_ortalamalari = joblib.load(self.artifacts_path / 'grup_ortalamalari.joblib')
            self.feature_names = list(list(self.grup_ortalamalari.values())[0].keys())
            logger.info("All components loaded successfully.")
            logger.debug(f"Feature names from model: {self.feature_names}")
        except FileNotFoundError as e:
            logger.error(f"Required model file not found: {e.filename}")
            logger.error("Please ensure you have run the model training script (gridsearch or baseline) first.")
            raise

    def _validate_input(self, user_scores: Dict[str, float]) -> List[float]:
        """Validates input user scores and orders them as expected by the model."""
        if not isinstance(user_scores, dict):
            raise TypeError("Input must be in 'dict' format.")
        
        logger.debug("_validate_input called")
        logger.debug(f"User scores keys: {list(user_scores.keys())}")
        logger.debug(f"Expected features: {self.feature_names}")
        
        ordered_scores = []
        missing_keys = []
        
        # Handle missing or mismatched competency names
        for feature in self.feature_names:
            score = user_scores.get(feature)
            
            # If exact match not found, try cleaning and matching
            if score is None:
                # Try to find similar key (case-insensitive, stripped)
                feature_clean = feature.strip().lower()
                for user_key, user_val in user_scores.items():
                    user_key_clean = str(user_key).strip().lower()
                    if user_key_clean == feature_clean:
                        score = user_val
                        logger.debug(f"Matched '{feature}' with '{user_key}'")
                        break
            
            if score is None:
                missing_keys.append(feature)
                # Use default score instead of raising error
                score = 0.5
                logger.debug(f"Missing feature '{feature}', using default 0.5")
            elif not isinstance(score, (int, float)):
                raise ValueError(f"'{feature}' score must be numeric.")
            
            ordered_scores.append(score)
            
        if missing_keys:
            logger.warning(f"⚠️  Missing keys: {missing_keys}")
            logger.warning("⚠️  This will cause identical results for all users!")
        
        logger.debug(f"Ordered scores: {ordered_scores}")
        return ordered_scores

    def predict_and_analyze(self, user_scores: Dict[str, float]) -> Dict[str, Any]:
        """Performs complete prediction and analysis using user scores."""
        try:
            scores_array = np.array(self._validate_input(user_scores)).reshape(1, -1)
        except (ValueError, TypeError) as e:
            logger.error(f"Error in _validate_input: {e}")
            return {"error": str(e)}

        try:
            scores_scaled = self.scaler.transform(scores_array)
            probabilities = self.model.predict_proba(scores_scaled)[0]
        except Exception as e:
            logger.error(f"Error in model prediction: {e}")
            return {"error": f"Model prediction error: {str(e)}"}
        
        uyum_skorlari = [
            {"meslek": class_name, "uyum": round(prob * 100)}
            for class_name, prob in zip(self.le.classes_, probabilities)
        ]
        
        try:
            winner_index = int(np.argmax(probabilities))
            kazanan_meslek = self.le.classes_[winner_index]
            meslek_ortalamalari = self.grup_ortalamalari[kazanan_meslek]

            # Build competency comparison with safe key lookup
            yetkinlik_karsilastirmasi = []
            for feature in self.feature_names:
                try:
                    # Try to find matching key in user_scores (case-insensitive)
                    user_score = user_scores.get(feature)
                    if user_score is None:
                        feature_clean = feature.strip().lower()
                        for user_key, user_val in user_scores.items():
                            if str(user_key).strip().lower() == feature_clean:
                                user_score = user_val
                                break
                    
                    # If still not found, use default
                    if user_score is None:
                        user_score = 0.5
                        logger.debug(f"Using default score 0.5 for feature '{feature}' in comparison")
                    
                    # Safe access to profession averages
                    grup_ort = meslek_ortalamalari.get(feature, 0.5)
                    
                    yetkinlik_karsilastirmasi.append({
                        "yetkinlik": feature,
                        "kullanici_skoru": round(float(user_score), 1),
                        "grup_ortalamasi": round(float(grup_ort), 1),
                        "fark": round(float(user_score) - float(grup_ort), 1)
                    })
                except Exception as e:
                    logger.error(f"Error processing feature '{feature}': {e}")
                    # Add with default values
                    yetkinlik_karsilastirmasi.append({
                        "yetkinlik": feature,
                        "kullanici_skoru": 0.5,
                        "grup_ortalamasi": 0.5,
                        "fark": 0.0
                    })
        except Exception as e:
            logger.error(f"Error building yetkinlik_karsilastirmasi: {e}")
            return {"error": f"Error building comparison: {str(e)}"}

        return {
            "uyum_skorlari": sorted(uyum_skorlari, key=lambda x: x['uyum'], reverse=True),
            "kazanan_meslek": kazanan_meslek,
            "yetkinlik_karsilastirmasi": yetkinlik_karsilastirmasi
        }

if __name__ == '__main__':
    pass