from pydantic import BaseModel,EmailStr
from .enums import UserRoles
from datetime import datetime

class UserCreate(BaseModel):
    name:str
    email:EmailStr
    password:str

class UserResponse(BaseModel):
    email:EmailStr
    id:int
    created_at:datetime
    name:str
    role: UserRoles
    model_config = {"from_attributes": True}

class UserLogin(BaseModel):
    email:EmailStr
    password:str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: int


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str