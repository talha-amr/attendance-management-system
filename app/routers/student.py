from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session
from ..schemas import StudentResponse
from .. import models
from .. dependencies import require_student,require_student_profile
from .. enums import UserRoles

router=APIRouter(prefix='/students')
@router.get('/me',response_model=StudentResponse)
def get_student(curr_student:models.Student= Depends(require_student_profile)):
    return curr_student