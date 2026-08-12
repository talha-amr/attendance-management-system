from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session,joinedload
from ..schemas import TeacherCreate,UserResponse,TeacherResponse,TeacherCourseSectionResponse,TeacherStudentResponse,TimeTableResponse,AttendanceCreate,AttendanceResponse,UpdateAttendance
from .. import security
from .. import models
from .. dependencies import require_approved_teacher,require_teacher_profile
from .. enums import UserRoles,AttendanceStatus
from datetime import date, timedelta


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
@router.get('/me/course-sections/{section_id}/students',response_model=list[TeacherStudentResponse])
def get_student_in_course(section_id:int,db:Session=Depends(get_db),curr_teacher:models.Teacher=Depends(require_approved_teacher)):
    enrollments= (db.query(models.Enrollment).join(models.Enrollment.course_section)
    .options(joinedload(models.Enrollment.student).joinedload(models.Student.user)).filter(models.Enrollment.course_section_id==section_id,models.CourseSection.teacher_id == curr_teacher.id).all())
    return [
    TeacherStudentResponse(
        student_id=enrollment.student.id,
        name=enrollment.student.user.name,
        email=enrollment.student.user.email,
    )
    for enrollment in enrollments
    ]
@router.get('/timetables',response_model=list[TimeTableResponse])
def get_timetable(db:Session=Depends(get_db),curr_teacher:models.Teacher=Depends(require_approved_teacher)):
    timetables=db.query(models.TimeTable).join(models.TimeTable.course_section).filter(models.CourseSection.teacher_id==curr_teacher.id).all()
    return timetables

@router.post('/attendance',response_model=AttendanceResponse)
def mark_attendance(payload:AttendanceCreate,db:Session=Depends(get_db),curr_teacher:models.Teacher=Depends(require_approved_teacher)):
    course_section=db.query(models.CourseSection).filter(models.CourseSection.id==payload.course_section_id,models.CourseSection.teacher_id==curr_teacher.id).first()
    if not course_section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Course Section Does not Exist or teacher doesnt teach this course")
    enrollment_check=db.query(models.Enrollment).filter(models.Enrollment.student_id==payload.student_id,models.Enrollment.course_section_id==payload.course_section_id).first()
    if not enrollment_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Student is not Enrolled in this Course")
    if payload.date>date.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Cannot mark Attendance of Future Dates")
    seven_days_ago = date.today() - timedelta(days=7)
    if payload.date<seven_days_ago:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Attendance can only be marked within 7 days")
    day=payload.date.strftime("%A").upper()
    course_day_check=db.query(models.TimeTable).filter(models.TimeTable.course_section_id==payload.course_section_id,models.TimeTable.day_of_week==day).first()
    if not course_day_check:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="There is not TimeTable for this Course Today")
    attendance_check=db.query(models.Attendance).filter(models.Attendance.student_id == payload.student_id,models.Attendance.course_section_id == payload.course_section_id,models.Attendance.date == payload.date).first()
    if attendance_check:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Attendance is already marked")
    attendance=models.Attendance(**payload.model_dump())
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance

@router.patch('/attendance/{attendance_id}',response_model=AttendanceResponse)
def update_attendance(attendance_id:int,payload:UpdateAttendance,db:Session=Depends(get_db),curr_teacher:models.Teacher=Depends(require_approved_teacher)):
    attendance=db.query(models.Attendance).filter(models.Attendance.id==attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Attendance Record not Found")
    
    course_section=db.query(models.CourseSection).filter(models.CourseSection.id==attendance.course_section_id,models.CourseSection.teacher_id==curr_teacher.id).first()
    if not course_section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Course Section Does not Exist or teacher doesnt teach this course")
    seven_days_ago = date.today() - timedelta(days=7)
    if attendance.date<seven_days_ago:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Attendance can only be updated within 7 days")
    attendance.status = payload.status
    db.commit()
    db.refresh(attendance)
    return attendance

@router.get('/attendance',response_model=list[AttendanceResponse])
def get_attendance(section_id:int|None=None,db:Session=Depends(get_db),curr_teacher:models.Teacher=Depends(require_approved_teacher)):
    query=db.query(models.Attendance).join(models.Attendance.course_section).filter(models.CourseSection.teacher_id==curr_teacher.id)
    if section_id:
        course_check=db.query(models.CourseSection).filter(models.CourseSection.id==section_id,models.CourseSection.teacher_id==curr_teacher.id).first()
        if not course_check:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Course not Found")
        query=query.filter(models.CourseSection.id==section_id)
    attendance=query.all()
    return attendance