import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile
from core.config import settings

def upload_file(file: UploadFile, sub_folder: str) -> str:
    """
    Saves a file to local storage.
    Creates directories if they don't exist.
    Generates a unique filename.
    Returns the relative path from UPLOAD_ROOT.
    """
    # Define absolute path for the folder
    folder_path = Path(settings.UPLOAD_ROOT) / sub_folder
    folder_path.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = folder_path / unique_filename

    # Save the file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Return relative path for DB storage
    return str(Path(sub_folder) / unique_filename)

def get_file_path(relative_path: str) -> str:
    """Returns the absolute path for a given relative path."""
    return str(Path(settings.UPLOAD_ROOT) / relative_path)

def get_file_stream(relative_path: str):
    """
    Returns a generator to stream the file for download.
    """
    file_path = Path(settings.UPLOAD_ROOT) / relative_path
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {relative_path}")
    
    def iterfile():
        with open(file_path, mode="rb") as f:
            yield from f
            
    return iterfile

def delete_file(relative_path: str) -> bool:
    """
    Deletes a file from local storage.
    """
    file_path = Path(settings.UPLOAD_ROOT) / relative_path
    if file_path.exists():
        file_path.unlink()
        return True
    return False