from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session,joinedload
from ..schemas import TeacherCreate,UserResponse,TeacherResponse,TeacherCourseSectionResponse,TeacherStudentResponse,TeacherTimeTableResponse,AttendanceCreate,TeacherAttendanceResponse,UpdateAttendance,AttendanceResponse
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
    courses=db.query(models.CourseSection).options(joinedload(models.CourseSection.subject),joinedload(models.CourseSection.enrollments)).filter(models.CourseSection.teacher_id==curr_teacher.id).all()
    return [
        TeacherCourseSectionResponse(
            course_section_id=course.id,
            subject_id=course.subject.id,
            subject_name=course.subject.name,
            subject_code=course.subject.code,
            section_name=course.section_name,
            semester=course.semester,
            academic_year=course.academic_year,
            student_count=len(course.enrollments)
        )
        for course in courses
    ]

@router.get('/me/course-sections/{section_id}/students',response_model=list[TeacherStudentResponse])
def get_student_in_course(section_id:int,db:Session=Depends(get_db),curr_teacher:models.Teacher=Depends(require_approved_teacher)):
    enrollments=(db.query(models.Enrollment).join(models.Enrollment.course_section).options(joinedload(models.Enrollment.student).joinedload(models.Student.user)).filter(models.Enrollment.course_section_id==section_id,models.CourseSection.teacher_id==curr_teacher.id).all())
    return [
        TeacherStudentResponse(
            student_id=enrollment.student.id,
            name=enrollment.student.user.name,
            email=enrollment.student.user.email,
            enrolled_at=enrollment.enrolled_at
        )
        for enrollment in enrollments
    ]

@router.get('/timetables', response_model=list[TeacherTimeTableResponse])
def get_timetable(db:Session=Depends(get_db), curr_teacher:models.Teacher=Depends(require_approved_teacher)):
    timetables=db.query(models.TimeTable).join(models.TimeTable.course_section).join(models.CourseSection.subject).filter(models.CourseSection.teacher_id==curr_teacher.id).all()

    return [
        TeacherTimeTableResponse(
            id=item.id,
            course_section_id=item.course_section_id,
            subject_id=item.course_section.subject.id,
            subject_name=item.course_section.subject.name,
            subject_code=item.course_section.subject.code,
            section_name=item.course_section.section_name,
            semester=item.course_section.semester,
            academic_year=item.course_section.academic_year,
            day_of_week=item.day_of_week,
            start_time=item.start_time,
            end_time=item.end_time,
        )
        for item in timetables
    ]

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

@router.patch('/attendance/{attendance_id}',response_model=TeacherAttendanceResponse)
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

    student=db.query(models.Student).filter(models.Student.id==attendance.student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Student not found")

    user=db.query(models.User).filter(models.User.id==student.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Student user not found")

    subject=db.query(models.Subject).filter(models.Subject.id==course_section.subject_id).first()
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Subject not found")

    return TeacherAttendanceResponse(
        id=attendance.id,
        student_id=attendance.student_id,
        student_name=user.name,
        student_email=user.email,
        course_section_id=attendance.course_section_id,
        subject_id=subject.id,
        subject_name=subject.name,
        subject_code=subject.code,
        section_name=course_section.section_name,
        date=attendance.date,
        status=attendance.status,
        marked_at=attendance.marked_at
    )


@router.get('/attendance',response_model=list[TeacherAttendanceResponse])
def get_attendance(section_id:int|None=None,db:Session=Depends(get_db),curr_teacher:models.Teacher=Depends(require_approved_teacher)):
    query=(db.query(models.Attendance).join(models.Attendance.course_section).join(models.Attendance.student).join(models.Student.user).join(models.CourseSection.subject).filter(models.CourseSection.teacher_id==curr_teacher.id))

    if section_id:
        course_check=db.query(models.CourseSection).filter(models.CourseSection.id==section_id,models.CourseSection.teacher_id==curr_teacher.id).first()
        if not course_check:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Course not Found")
        query=query.filter(models.Attendance.course_section_id==section_id)

    attendance=query.all()

    return [
        TeacherAttendanceResponse(
            id=record.id,
            student_id=record.student_id,
            student_name=record.student.user.name,
            student_email=record.student.user.email,
            course_section_id=record.course_section_id,
            subject_id=record.course_section.subject.id,
            subject_name=record.course_section.subject.name,
            subject_code=record.course_section.subject.code,
            section_name=record.course_section.section_name,
            date=record.date,
            status=record.status,
            marked_at=record.marked_at
        )
        for record in attendance
    ]