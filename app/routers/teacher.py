from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session,joinedload
from ..schemas import TeacherCreate,UserResponse,TeacherResponse,TeacherCourseSectionResponse
from .. import security
from .. import models
from .. dependencies import require_approved_teacher,require_teacher_profile
from .. enums import UserRoles
router=APIRouter(prefix='/teachers')

@router.post('/signup',response_model=UserResponse,status_code=status.HTTP_201_CREATED)
def teacher_signup(payload :TeacherCreate,db:Session=Depends(get_db)):
    user_check= db.query(models.User).filter(models.User.email==payload.email).first()
    if not user_check:
        hashed_password= security.hash_password(payload.password) 
        user_dict=payload.model_dump()
        user_dict["role"]=UserRoles.TEACHER
        user_dict["password"]=hashed_password
        new_user=models.User(**user_dict)
        db.add(new_user)
        db.flush()
        new_teacher = models.Teacher(user_id=new_user.id)
        db.add(new_teacher)
        db.commit()
        return new_user
    raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="User with this email is already registered")


@router.get('/test-access',response_model=TeacherResponse)
def get_approved_teacher(approved=Depends(require_approved_teacher)):
    return approved

@router.get('/me',response_model=TeacherResponse)
def get_current_teacher(teacher=Depends(require_teacher_profile)):
    return teacher

@router.get('/me/course-sections',response_model=list[TeacherCourseSectionResponse])
def get_course_sections(db:Session=Depends(get_db),curr_teacher:models.Teacher=Depends(require_approved_teacher)):
    courses = ( db.query(models.CourseSection).options(joinedload(models.CourseSection.subject) ).filter(models.CourseSection.teacher_id == curr_teacher.id).all())
    return [
        TeacherCourseSectionResponse(
            course_section_id=course.id,
            subject_id=course.subject.id,
            subject_name=course.subject.name,
            subject_code=course.subject.code,
            section_name=course.section_name,
            semester=course.semester,
            academic_year=course.academic_year,
        )
        for course in courses
    ]