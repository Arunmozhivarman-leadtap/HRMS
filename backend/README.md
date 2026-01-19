# HRMS Backend

FastAPI backend for the HRMS application.

## Setup

1.  **Environment Variables**:
    Ensure `.env` exists in this directory. See `.env.example`.

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run Server**:
    ```bash
    uvicorn main:app --reload
    ```
    Server runs at: `http://localhost:8000`

## Scripts

Run scripts as modules from this directory:

*   **Initialize Users**:
    ```bash
    python -m scripts.initialize_users
    ```

*   **Manual Migration**:
    ```bash
    python -m scripts.db_migration_manual
    ```

## Structure
*   `api/`: API Routes
*   `core/`: Configuration & DB
*   `models/`: SQLAlchemy Models
*   `services/`: Business Logic
*   `scripts/`: Utility scripts
*   `uploads/`: Local file storage
