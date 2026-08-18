from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session,joinedload
from ..schemas import StudentResponse,EnrollmentCreate,EnrollmentResponse,StudentEnrollmentResponse,TimeTableResponse,StudentAttendanceResponse,StudentTimeTableResponse,StudentCourseSectionResponse
from .. import models
from .. dependencies import require_student,require_student_profile
from .. enums import UserRoles,DaysOfWeek
from sqlalchemy import case

router=APIRouter(prefix='/students')
@router.get('/me',response_model=StudentResponse)
def get_student(curr_student:models.Student= Depends(require_student_profile)):
    return curr_student

@router.post('/me/enrollments',response_model=EnrollmentResponse)
def enroll_student(
    payload:EnrollmentCreate,
    db:Session=Depends(get_db),
    curr_student:models.Student=Depends(require_student_profile),
):
    course_section=(
        db.query(models.CourseSection)
        .filter(models.CourseSection.id==payload.course_section_id)
        .first()
    )

    if not course_section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course At this Section Not Found!"
        )

    enrollment_check=(
        db.query(models.Enrollment)
        .join(models.Enrollment.course_section)
        .filter(
            models.Enrollment.student_id==curr_student.id,
            models.CourseSection.subject_id==course_section.subject_id
        )
        .first()
    )

    if enrollment_check:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already enrolled in this course"
        )

    student_timetable=(
        db.query(models.TimeTable)
        .join(models.TimeTable.course_section)
        .join(models.CourseSection.enrollments)
        .filter(
            models.Enrollment.student_id==curr_student.id,
            models.TimeTable.course_section_id!=payload.course_section_id
        )
        .all()
    )

    new_course_timetable=(
        db.query(models.TimeTable)
        .filter(
            models.TimeTable.course_section_id==payload.course_section_id
        )
        .all()
    )

    for new_time in new_course_timetable:
        for existing_time in student_timetable:
            if (
                new_time.day_of_week==existing_time.day_of_week
                and new_time.start_time<existing_time.end_time
                and new_time.end_time>existing_time.start_time
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Course schedule conflicts with an already enrolled course"
                )

    new_enrollment=models.Enrollment(
        student_id=curr_student.id,
        course_section_id=payload.course_section_id
    )

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
@router.get(  '/timetables', response_model=list[StudentTimeTableResponse])
def get_timetable( db: Session = Depends(get_db), curr_student: models.Student = Depends(require_student_profile)):
    timetables = ( db.query(models.TimeTable).join(models.TimeTable.course_section ) .join(models.CourseSection.subject).join(    models.CourseSection.teacher).join( models.Teacher.user
        ).join(
            models.Enrollment,
            models.Enrollment.course_section_id
            == models.CourseSection.id
        )
        .filter(
            models.Enrollment.student_id == curr_student.id
        )
        .all()
    )

    return [
        StudentTimeTableResponse(
            id=item.id,
            course_section_id=item.course_section_id,

            subject_id=item.course_section.subject.id,
            subject_name=item.course_section.subject.name,
            subject_code=item.course_section.subject.code,

            teacher_id=item.course_section.teacher.id,
            teacher_name=item.course_section.teacher.user.name,

            section_name=item.course_section.section_name,
            semester=item.course_section.semester,
            academic_year=item.course_section.academic_year,

            day_of_week=item.day_of_week,
            start_time=item.start_time,
            end_time=item.end_time,
        )
        for item in timetables
    ]

@router.get('/attendance',response_model=list[StudentAttendanceResponse]
)
def get_attendance( section_id: int | None = None,db: Session = Depends(get_db),curr_student: models.Student = Depends(require_student_profile)):
    query = (
        db.query(models.Attendance)
        .join(
            models.Attendance.course_section
        )
        .join(
            models.CourseSection.subject
        )
        .join(
            models.CourseSection.teacher
        )
        .join(
            models.Teacher.user
        )
        .filter(
            models.Attendance.student_id == curr_student.id
        )
    )

    if section_id:
        course_check = (
            db.query(models.CourseSection)
            .filter(
                models.CourseSection.id == section_id
            )
            .first()
        )

        if not course_check:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course Section not found"
            )

        query = query.filter(
            models.Attendance.course_section_id == section_id
        )

    attendance = query.all()

    return [
        StudentAttendanceResponse(
            id=record.id,
            student_id=record.student_id,
            course_section_id=record.course_section_id,

            subject_id=record.course_section.subject.id,
            subject_name=record.course_section.subject.name,
            subject_code=record.course_section.subject.code,

            teacher_id=record.course_section.teacher.id,
            teacher_name=record.course_section.teacher.user.name,

            section_name=record.course_section.section_name,
            semester=record.course_section.semester,
            academic_year=record.course_section.academic_year,

            date=record.date,
            status=record.status,
            marked_at=record.marked_at,
        )
        for record in attendance
    ]

@router.get( "/course-sections", response_model=list[StudentCourseSectionResponse])
def get_available_course_sections( db: Session = Depends(get_db), curr_student: models.Student = Depends(require_student_profile)):
    enrolled_section_ids = {enrollment.course_section_id 
                            for enrollment in db.query(models.Enrollment)
        .filter(
            models.Enrollment.student_id == curr_student.id
        )
        .all()
    }

    course_sections = (db.query(models.CourseSection).options(  joinedload(models.CourseSection.subject),  joinedload(models.CourseSection.teacher).joinedload(models.Teacher.user), ).all()
    )

    return [
        StudentCourseSectionResponse(
            course_section_id=course_section.id,
            subject_id=course_section.subject.id,
            subject_name=course_section.subject.name,
            subject_code=course_section.subject.code,
            teacher_id=course_section.teacher.id,
            teacher_name=course_section.teacher.user.name,
            section_name=course_section.section_name,
            semester=course_section.semester,
            academic_year=course_section.academic_year,
            is_enrolled=course_section.id in enrolled_section_ids,
        )
        for course_section in course_sections
    ]