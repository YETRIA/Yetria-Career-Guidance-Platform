import logging
import pandas as pd
from sqlalchemy import text
from typing import Any
import sys
from pathlib import Path

# Add backend root to Python path for standalone execution
if __name__ == "__main__":
    backend_path = Path(__file__).resolve().parents[2]  # services/database_service.py -> backend/
    sys.path.insert(0, str(backend_path))
    from app.core.database import SessionLocal, engine as db_engine
else:
    from ..core.database import SessionLocal, engine as db_engine

logger = logging.getLogger(__name__)

def fetch_dataframe(query: str, params: dict[str, Any] = None) -> pd.DataFrame:
    """Executes the given SQL query and returns the result as a pandas DataFrame."""
    if params is None:
        params = {}
    with SessionLocal() as session:
        result = session.execute(text(query), params)
        rows = result.mappings().all()
        return pd.DataFrame(rows)

def fetch_professionaldatastaging_df() -> pd.DataFrame:
    """Returns ALL data from `professionaldatastaging` table as a DataFrame."""
    return fetch_dataframe("SELECT * FROM professionaldatastaging")

def write_dataframe_to_table(df: pd.DataFrame, table_name: str, if_exists: str = "replace") -> None:
    """Writes the given DataFrame to a table in the database."""
    df.to_sql(
        name=table_name,
        con=db_engine,
        if_exists=if_exists,
        index=False
    )
    logger.info(f"Successfully wrote {len(df)} rows to '{table_name}' table.")


if __name__ == "__main__":
    """Test the database service functions"""
    print("Testing database service...")
    
    try:
        # Test database connection
        print("Testing database connection...")
        df = fetch_professionaldatastaging_df()
        print(f"✓ Database connection successful. Found {len(df)} rows in professionaldatastaging table.")
        
        if len(df) > 0:
            print(f"✓ Sample data preview:")
            print(df.head())
        else:
            print("⚠ Table is empty")
            
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        print("Please check your database configuration and ensure the database is running.")