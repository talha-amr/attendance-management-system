from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session
from ..schemas import StudentResponse,EnrollmentCreate,EnrollmentResponse
from .. import models
from .. dependencies import require_student,require_student_profile
from .. enums import UserRoles

router=APIRouter(prefix='/students')
@router.get('/me',response_model=StudentResponse)
def get_student(curr_student:models.Student= Depends(require_student_profile)):
    return curr_student

@router.post('/me/enrollments',response_model=EnrollmentResponse)
def enroll_student(payload:EnrollmentCreate,db:Session=Depends(get_db),curr_student:models.Student= Depends(require_student_profile),):
    course_section= db.query(models.CourseSection).filter(models.CourseSection.id==payload.course_section_id).first()
    if not course_section: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Course At this Section Not Found! ")
    enrollment_check=db.query(models.Enrollment).filter(models.Enrollment.student_id==curr_student.id,models.Enrollment.course_section_id==payload.course_section_id).first()
    if enrollment_check:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Already Enrolled")
    new_enrollment= models.Enrollment(student_id=curr_student.id,course_section_id=payload.course_section_id)
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment