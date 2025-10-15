"""
Start the FastAPI server for testing
"""

import sys
from pathlib import Path
import uvicorn

# Add backend root to Python path
backend_path = Path(__file__).resolve().parents[1]  # scripts/start_server.py -> backend/
sys.path.insert(0, str(backend_path))

from app.main import app

if __name__ == "__main__":
    print("🚀 Starting Yetria Career Guidance Platform API Server...")
    print("📖 Swagger UI: http://localhost:8000/docs")
    print("📚 ReDoc: http://localhost:8000/redoc")
    print("🔍 Health Check: http://localhost:8000/health")
    print("\n" + "="*50)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )