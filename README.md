# HR-System

This project contains a Human Resource Management System (HRMS) with a Next.js frontend and a FastAPI backend.

## Project Structure

- `frontend/`: Contains the Next.js application.
- `backend/`: Contains the FastAPI application.
- `docs/`: Contains project documentation, including `instructions.md`.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (for frontend package management)
- Python 3.11+
- pip (for backend package management)

### Frontend Setup

1. Navigate to the `frontend/` directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run the development server:

   ```bash
   pnpm dev
   ```

   The frontend will be accessible at `http://localhost:3000`.

### Backend Setup

1. Navigate to the `backend/` directory:

   ```bash
   cd backend
   ```

2. Create a Python virtual environment (recommended):

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI application:

   ```bash
   uvicorn main:app --reload
   ```

   The backend API will be accessible at `http://localhost:8000`.
