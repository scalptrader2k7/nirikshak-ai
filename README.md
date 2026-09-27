# nirikshak-ai
Explainable project-risk intelligence and human-review platform for MPLAD scheme implementation.

## Backend Setup (Windows PowerShell)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Run Tests

```powershell
python -m pytest -v
```

### Start Backend API

```powershell
python -m uvicorn src.api.main:app --reload
```
