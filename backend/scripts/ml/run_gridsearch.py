"""
YETRIA Career Prediction Model - GridSearch Optimization Script

This script runs GridSearch optimization for CatBoost and LightGBM models
and finds the best hyperparameters to solve overfitting problems.

GridSearch optimization:
1. Comprehensive hyperparameter grids for CatBoost and LightGBM
2. Fast optimization with RandomizedSearchCV (instead of GridSearch)
3. Fast and robust evaluation with 3-fold cross-validation
4. Binary and multi-class classification support
5. Overfitting control and model comparison
6. Saving and reporting of best models

Usage:
Run this script from inside the 'backend' folder:
python run_gridsearch.py

Requirements:
- model_training_data.csv file must exist
- Required Python packages must be installed (lightgbm, catboost, scikit-learn)

Adding New Occupations:
This script automatically detects all occupations in the data file.
To add new occupations, simply add new samples to the data file.
Binary (2 classes) or multi-class (3+ classes) are automatically detected.
"""

import sys
from pathlib import Path

# Add backend root to Python path
backend_path = Path(__file__).resolve().parents[2]  # scripts/ml/run_gridsearch.py -> backend/
sys.path.insert(0, str(backend_path))

from app.ml.gridsearch_optimization import run_gridsearch_optimization

def main():
    """Starts the GridSearch optimization process."""
    print("=" * 60)
    print("YETRIA Career Prediction Model - GridSearch Optimization")
    print("=" * 60)
    print("This process will perform comprehensive hyperparameter")
    print("optimization for CatBoost and LightGBM models.")
    print("Designed to solve overfitting problems.")
    print("=" * 60)
    
    # Data file path
    data_path = backend_path / "data" / "model_training_data.csv"
    
    # Check if data file exists
    if not data_path.exists():
        print(f"\nERROR: Data file not found: {data_path}")
        print("Please make sure you have run 'run_pipeline.py' script first.")
        return
    
    print(f"\nData file found: {data_path}")
    print("Starting GridSearch optimization...")
    print("\nNOTE: This process may take several minutes.")
    print("Please wait...")
    
    try:
        # Run GridSearch optimization
        run_gridsearch_optimization(
            data_path=data_path,
            test_size=0.4,
            random_state=42
        )
        
        print("\n" + "=" * 60)
        print("GridSearch optimization completed successfully!")
        print("=" * 60)
        print("Results:")
        print("- Best models saved in 'artifacts/' directory")
        print("- Detailed reports created in 'reports/' directory")
        print("- Overfitting analysis completed")
        print("\nYou can now use the optimized models.")
        
    except Exception as e:
        print(f"\nERROR: An error occurred during GridSearch optimization:")
        print(f"Error: {str(e)}")
        print("\nPlease:")
        print("1. Make sure required packages are installed")
        print("2. Check that the data file is in the correct format")
        print("3. Verify that sufficient system resources are available")
        return

if __name__ == "__main__":
    main()