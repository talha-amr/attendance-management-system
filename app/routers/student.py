from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session,joinedload
from ..schemas import StudentResponse,EnrollmentCreate,EnrollmentResponse,StudentEnrollmentResponse,TimeTableResponse,AttendanceResponse
from .. import models
from .. dependencies import require_student,require_student_profile
from .. enums import UserRoles,DaysOfWeek
from sqlalchemy import case

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

    student_timetable=db.query(models.TimeTable).join(models.TimeTable.course_section).join(models.CourseSection.enrollments).filter(
        models.Enrollment.student_id==curr_student.id,
        models.TimeTable.course_section_id!=payload.course_section_id
    ).all()

    new_course_timetable=db.query(models.TimeTable).filter(
        models.TimeTable.course_section_id==payload.course_section_id
    ).all()

    for new_time in new_course_timetable:
        for existing_time in student_timetable:
            if (new_time.day_of_week==existing_time.day_of_week and
                new_time.start_time<existing_time.end_time and
                new_time.end_time>existing_time.start_time):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Course schedule conflicts with an already enrolled course")

    new_enrollment= models.Enrollment(student_id=curr_student.id,course_section_id=payload.course_section_id)
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment

    
@router.get("/me/enrollments",response_model=list[StudentEnrollmentResponse])
def get_my_enrollments( db: Session = Depends(get_db),curr_student: models.Student = Depends(require_student_profile),):
    enrollments = ( db.query(models.Enrollment) .options( joinedload(models.Enrollment.course_section) .joinedload(models.CourseSection.subject),
             joinedload(models.Enrollment.course_section)
            .joinedload(models.CourseSection.teacher)
            .joinedload(models.Teacher.user),
        ).filter(models.Enrollment.student_id == curr_student.id).all()
    )

    return [
        StudentEnrollmentResponse(
            course_section_id=enrollment.course_section.id,
            subject_id=enrollment.course_section.subject.id,
            subject_name=enrollment.course_section.subject.name,
            subject_code=enrollment.course_section.subject.code,
            teacher_id=enrollment.course_section.teacher.id,
            teacher_name=enrollment.course_section.teacher.user.name,
            section_name=enrollment.course_section.section_name,
            semester=enrollment.course_section.semester,
            academic_year=enrollment.course_section.academic_year,
            enrolled_at=enrollment.enrolled_at,
        )
        for enrollment in enrollments
    ]
@router.get('/timetables',response_model=list[TimeTableResponse])
def get_timetable(db: Session = Depends(get_db),curr_student: models.Student = Depends(require_student_profile)):
    student_timetables=db.query(models.TimeTable).join(models.TimeTable.course_section).join(models.CourseSection.enrollments).filter(models.Enrollment.student_id==curr_student.id).order_by(case(
        (models.TimeTable.day_of_week == DaysOfWeek.MONDAY, 1),
        (models.TimeTable.day_of_week == DaysOfWeek.TUESDAY, 2),
        (models.TimeTable.day_of_week == DaysOfWeek.WEDNESDAY, 3),
        (models.TimeTable.day_of_week == DaysOfWeek.THURSDAY, 4),
        (models.TimeTable.day_of_week == DaysOfWeek.FRIDAY, 5),
        (models.TimeTable.day_of_week == DaysOfWeek.SATURDAY, 6),
        (models.TimeTable.day_of_week == DaysOfWeek.SUNDAY, 7),
    ),models.TimeTable.start_time).all()
    return student_timetables

@router.get('/attendance',response_model=list[AttendanceResponse])
def get_attendance(section_id:int|None=None,db:Session=Depends(get_db),curr_student:models.Student=Depends(require_student_profile)):
    list_attendance_query=db.query(models.Attendance).filter(models.Attendance.student_id==curr_student.id)
    if section_id:
        course_check=db.query(models.CourseSection).filter(models.CourseSection.id==section_id).first()
        if not course_check:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Course not Found")
        enrollment_check=db.query(models.Enrollment).filter(models.Enrollment.student_id==curr_student.id,models.Enrollment.course_section_id==section_id).first()
        if not enrollment_check:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Student Not Found")
        list_attendance_query=db.query(models.Attendance).filter(models.Attendance.student_id==curr_student.id,models.Attendance.course_section_id==section_id)
    attendance_list=list_attendance_query.all()
    return attendance_list