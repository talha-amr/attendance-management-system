from pydantic import BaseModel,EmailStr
from .enums import UserRoles,TeacherApprovalStatus
from datetime import datetime
from typing import Optional,Annotated
from pydantic import AfterValidator,Field


def validate_password(value:str)->str:
    if not any(character.islower() for character in value):
        raise ValueError("Password must contain at least one lowercase letter")
    if not any(character.isupper() for character in value):
        raise ValueError("Password must contain at least one uppercase letter")
    if not any(not character.isalnum() and not character.isspace() for character in value):
        raise ValueError("Password must contain at least one special character")
    return value

PlainPassword=Annotated[str,Field(min_length=8,max_length=128),AfterValidator(validate_password)]
class UserCreate(BaseModel):
    name:str
    email:EmailStr
    password:PlainPassword

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
    new_password: PlainPassword


class TeacherCreate(BaseModel):
    name:str
    email:EmailStr
    password:PlainPassword

class TeacherResponse(BaseModel):
    id: int
    user_id:int
    created_at:datetime
    approval_status:TeacherApprovalStatus
    user:UserResponse
    model_config = {"from_attributes": True}
