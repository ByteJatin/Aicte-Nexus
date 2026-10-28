"""Start the complete local demo: python run.py (install backend requirements first)."""
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT / 'backend')
sys.path.insert(0, str(ROOT / 'backend'))

if __name__ == '__main__':
    subprocess.run([sys.executable, '-m', 'alembic', 'upgrade', 'head'], check=True)
    subprocess.run([sys.executable, '-m', 'app.seed_demo'], check=True)
    import uvicorn
    port = int(os.getenv('PORT', '8001'))
    print(f'\nAICTE NEXUS is ready at http://127.0.0.1:{port}\n', flush=True)
    uvicorn.run('app.main:app', host='127.0.0.1', port=port)
