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

class StudentResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    user: UserResponse

    model_config = {"from_attributes": True}

class SubjectCreate(BaseModel):
    name:str
    code:str

class SubjectResponse(BaseModel):
    id: int
    name: str
    code: str
    created_at: datetime

    model_config = {"from_attributes": True}

class CourseSectionCreate(BaseModel):
    subject_id:int=Field(gt=0)
    teacher_id:int=Field(gt=0)
    section_name:str=Field(min_length=1,max_length=20)
    semester:int=Field(ge=1,le=8)
    academic_year:int=Field(ge=2000,le=2100)

    
class CourseSectionResponse(BaseModel):
    id:int
    subject_id:int
    teacher_id:int
    section_name:str
    semester:int
    academic_year:int
    created_at:datetime
    subject:SubjectResponse
    teacher:TeacherResponse

    model_config={"from_attributes":True}

class EnrollmentCreate(BaseModel):
    course_section_id: int = Field(gt=0)

class UserBasicResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}
class EnrollmentTeacherResponse(BaseModel):
    id: int
    user: UserBasicResponse

    model_config = {"from_attributes": True}



class EnrollmentCourseSectionResponse(BaseModel):
    id: int
    section_name: str
    semester: int
    academic_year: int
    subject: SubjectResponse
    teacher: EnrollmentTeacherResponse

    model_config = {"from_attributes": True}
class EnrollmentResponse(BaseModel):
    student_id: int
    course_section_id: int
    enrolled_at: datetime
    course_section: EnrollmentCourseSectionResponse

    model_config = {"from_attributes": True}

class StudentEnrollmentResponse(BaseModel):
    course_section_id: int
    subject_id: int
    subject_name: str
    subject_code: str
    teacher_id: int
    teacher_name: str
    section_name: str
    semester: int
    academic_year: int
    enrolled_at: datetime


class TeacherCourseSectionResponse(BaseModel):
    course_section_id: int
    subject_id: int
    subject_name: str
    subject_code: str
    section_name: str
    semester:int
    academic_year: int