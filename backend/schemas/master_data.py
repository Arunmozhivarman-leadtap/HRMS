from pydantic import BaseModel
from typing import Optional

class MasterDataBase(BaseModel):
    name: str


class DepartmentResponse(MasterDataBase):
    id: int

    class Config:
        from_attributes = True

class DesignationResponse(MasterDataBase):
    id: int

    class Config:
        from_attributes = True
