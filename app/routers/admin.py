from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session,joinedload,aliased
from ..schemas import AdminStudentResponse, AdminTeacherResponse, SubjectResponse, SubjectCreate, CourseSectionCreate, CourseSectionResponse, AdminCourseSectionResponse, AdminStudentEnrollmentResponse, AdminEnrollmentCreate, EnrollmentResponse, AdminEnrollmentResponse, TimeTableCreate, TimeTableResponse, AdminTimeTableResponse, UpdateAttendance, AttendanceResponse, AdminAttendanceResponse
from .. import models
from .. dependencies import require_admin
from ..enums import TeacherApprovalStatus,AttendanceStatus
from datetime import date,timedelta

router=APIRouter(prefix='/admin')


@router.get('/teachers',response_model=list[AdminTeacherResponse])
def get_teachers(db:Session=Depends(get_db),current_user=Depends(require_admin)):
    teachers=(db.query(models.Teacher)
        .join(models.Teacher.user)
        .all())

    return [
        AdminTeacherResponse(
            teacher_id=teacher.id,
            user_id=teacher.user_id,
            name=teacher.user.name,
            email=teacher.user.email,
            approval_status=teacher.approval_status,
            created_at=teacher.created_at
        )
        for teacher in teachers
    ]


@router.get('/teachers/pending',response_model=list[AdminTeacherResponse])
def get_pending_teachers(db:Session=Depends(get_db),current_user=Depends(require_admin)):
    teachers=(db.query(models.Teacher)
        .join(models.Teacher.user)
        .filter(models.Teacher.approval_status==TeacherApprovalStatus.PENDING)
        .all())

    return [
        AdminTeacherResponse(
            teacher_id=teacher.id,
            user_id=teacher.user_id,
            name=teacher.user.name,
            email=teacher.user.email,
            approval_status=teacher.approval_status,
            created_at=teacher.created_at
        )
        for teacher in teachers
    ]

@router.patch('/teachers/{teacher_id}/approve',status_code=status.HTTP_200_OK)
def approve_teacher(teacher_id:int,db:Session=Depends(get_db),current_user=Depends(require_admin)):
    teacher=db.query(models.Teacher).filter(models.Teacher.id==teacher_id).first()
    if teacher:
        teacher.approval_status=TeacherApprovalStatus.APPROVED
        db.commit()
        return {"detail": "Teacher Approved Successfully"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="teacher not found")

@router.patch('/teachers/{teacher_id}/reject',status_code=status.HTTP_200_OK)
def reject_teacher(teacher_id:int,db:Session=Depends(get_db),current_user=Depends(require_admin)):
    teacher=db.query(models.Teacher).filter(models.Teacher.id==teacher_id).first()
    if teacher:
        teacher.approval_status=TeacherApprovalStatus.REJECTED
        db.commit()
        return {"detail": "Teacher Rejected Successfully"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="teacher not found")


@router.post('/subjects',response_model=SubjectResponse,status_code=status.HTTP_201_CREATED)
def create_subject(payload:SubjectCreate,db:Session=Depends(get_db),current_user=Depends(require_admin)):
    subject_name=payload.name.strip()
    subject_code=payload.code.strip().upper()

    subject_check=db.query(models.Subject).filter( (models.Subject.code==subject_code) | (models.Subject.name==subject_name)).first()

    if subject_check:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Subject with this name or code already exists")

    new_subject=models.Subject(name=subject_name,code=subject_code)
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    return new_subject

@router.get('/subjects',response_model=list[SubjectResponse])
def get_subjects(db:Session=Depends(get_db),current_user=Depends(require_admin)):
    return db.query(models.Subject).order_by(models.Subject.code).all()


@router.post('/course-sections',response_model=CourseSectionResponse,status_code=status.HTTP_201_CREATED)
def create_course_section(payload:CourseSectionCreate,db:Session=Depends(get_db),current_user=Depends(require_admin)):
    section_name=payload.section_name.strip().upper()

    if not section_name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,detail="Section name is required")

    subject=db.query(models.Subject).filter(models.Subject.id==payload.subject_id).first()
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Subject not found")

    teacher=db.query(models.Teacher).filter(models.Teacher.id==payload.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Teacher not found")

    if teacher.approval_status!=TeacherApprovalStatus.APPROVED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Teacher must be approved")

    section_check=db.query(models.CourseSection).filter(
        models.CourseSection.subject_id==payload.subject_id,
        models.CourseSection.section_name==section_name,
        models.CourseSection.semester==payload.semester,
        models.CourseSection.academic_year==payload.academic_year
    ).first()

    if section_check:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Course section already exists")

    section_dict=payload.model_dump()
    section_dict["section_name"]=section_name

    new_section=models.CourseSection(**section_dict)
    db.add(new_section)
    db.commit()
    db.refresh(new_section)

    return new_section

@router.get('/course-sections',response_model=list[AdminCourseSectionResponse])
def get_course_sections(db:Session=Depends(get_db),current_user=Depends(require_admin)):
    courses=(db.query(models.CourseSection)
        .join(models.CourseSection.subject)
        .join(models.CourseSection.teacher)
        .join(models.Teacher.user)
        .all())

    return [
        AdminCourseSectionResponse(
            course_section_id=course.id,
            subject_id=course.subject.id,
            subject_name=course.subject.name,
            subject_code=course.subject.code,
            teacher_id=course.teacher.id,
            teacher_name=course.teacher.user.name,
            teacher_email=course.teacher.user.email,
            section_name=course.section_name,
            semester=course.semester,
            academic_year=course.academic_year,
            created_at=course.created_at,
            student_count=len(course.enrollments)
        )
        for course in courses
    ]

@router.get("/course-sections/{section_id}/students",response_model=list[AdminStudentEnrollmentResponse])
def get_section_students(section_id:int,db:Session=Depends(get_db),current_user=Depends(require_admin)):
    enrollments=(db.query(models.Enrollment)
        .join(models.Enrollment.course_section)
        .options(joinedload(models.Enrollment.student).joinedload(models.Student.user))
        .filter(models.Enrollment.course_section_id==section_id)
        .all())

    return [
        AdminStudentEnrollmentResponse(
            student_id=enrollment.student.id,
            name=enrollment.student.user.name,
            email=enrollment.student.user.email,
            enrolled_at=enrollment.enrolled_at
        )
        for enrollment in enrollments
    ]

@router.post('/enrollments',response_model=AdminEnrollmentResponse,status_code=status.HTTP_201_CREATED)
def enroll_student(payload:AdminEnrollmentCreate,db:Session=Depends(get_db),current_user=Depends(require_admin)):
    student_check=db.query(models.Student).filter(models.Student.id==payload.student_id).first()

    course_section_check=(db.query(models.CourseSection)
        .options(
            joinedload(models.CourseSection.subject),
            joinedload(models.CourseSection.teacher).joinedload(models.Teacher.user)
        )
        .filter(models.CourseSection.id==payload.course_section_id)
        .first())

    if not student_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="student not found")

    if not course_section_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Course not found")

    enrollment_check=(db.query(models.Enrollment)
        .join(models.Enrollment.course_section)
        .filter(
            models.Enrollment.student_id==payload.student_id,
            models.CourseSection.subject_id==course_section_check.subject_id
        )
        .first())

    if enrollment_check:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Student is already enrolled in this course")

    new_enrollment=models.Enrollment(
        course_section_id=payload.course_section_id,
        student_id=payload.student_id
    )

    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    return AdminEnrollmentResponse(
        student_id=student_check.id,
        student_name=student_check.user.name,
        student_email=student_check.user.email,
        course_section_id=course_section_check.id,
        subject_name=course_section_check.subject.name,
        subject_code=course_section_check.subject.code,
        section_name=course_section_check.section_name,
        teacher_id=course_section_check.teacher.id,
        teacher_name=course_section_check.teacher.user.name,
        semester=course_section_check.semester,
        academic_year=course_section_check.academic_year,
        enrolled_at=new_enrollment.enrolled_at
    )
      
@router.delete('/enrollments/{student_id}/{course_section_id}',status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(student_id:int,course_section_id:int,db: Session = Depends(get_db), current_user=Depends(require_admin)):
    enrollment_check=db.query(models.Enrollment).filter(models.Enrollment.course_section_id==course_section_id,models.Enrollment.student_id==student_id).first()
    if not enrollment_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Enrollment not found")
    db.delete(enrollment_check)
    db.commit()
    return

@router.post('/timetables',response_model=AdminTimeTableResponse,status_code=status.HTTP_201_CREATED)
def create_timetable(payload:TimeTableCreate,db:Session=Depends(get_db),current_user=Depends(require_admin)):
    course=(db.query(models.CourseSection)
        .options(
            joinedload(models.CourseSection.subject),
            joinedload(models.CourseSection.teacher).joinedload(models.Teacher.user)
        )
        .filter(models.CourseSection.id==payload.course_section_id)
        .first())

    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Course not found")

    time_table=db.query(models.TimeTable).filter(
        models.TimeTable.course_section_id==payload.course_section_id,
        models.TimeTable.day_of_week==payload.day_of_week,
        models.TimeTable.start_time<payload.end_time,
        models.TimeTable.end_time>payload.start_time
    ).first()

    if time_table:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Time-Table Overlap")

    teacher_time_table=(db.query(models.TimeTable)
        .join(models.TimeTable.course_section)
        .filter(
            models.CourseSection.teacher_id==course.teacher_id,
            models.TimeTable.day_of_week==payload.day_of_week,
            models.TimeTable.start_time<payload.end_time,
            models.TimeTable.end_time>payload.start_time
        )
        .first())

    if teacher_time_table:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Teacher already has a class at this time")

    new_time_table=models.TimeTable(**payload.model_dump())

    db.add(new_time_table)
    db.commit()
    db.refresh(new_time_table)

    return AdminTimeTableResponse(
        id=new_time_table.id,
        course_section_id=course.id,
        subject_name=course.subject.name,
        subject_code=course.subject.code,
        section_name=course.section_name,
        teacher_id=course.teacher.id,
        teacher_name=course.teacher.user.name,
        day_of_week=new_time_table.day_of_week,
        start_time=new_time_table.start_time,
        end_time=new_time_table.end_time,
        created_at=new_time_table.created_at
    )


@router.get('/course-sections/{section_id}/timetables',response_model=list[AdminTimeTableResponse])
def get_timetable(section_id:int,db:Session=Depends(get_db),current_user=Depends(require_admin)):
    course_section_check=(db.query(models.CourseSection)
        .options(
            joinedload(models.CourseSection.subject),
            joinedload(models.CourseSection.teacher).joinedload(models.Teacher.user)
        )
        .filter(models.CourseSection.id==section_id)
        .first())

    if not course_section_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Course Section not found")

    courses_list=db.query(models.TimeTable).filter(
        models.TimeTable.course_section_id==section_id
    ).all()

    return [
        AdminTimeTableResponse(
            id=timetable.id,
            course_section_id=course_section_check.id,
            subject_name=course_section_check.subject.name,
            subject_code=course_section_check.subject.code,
            section_name=course_section_check.section_name,
            teacher_id=course_section_check.teacher.id,
            teacher_name=course_section_check.teacher.user.name,
            day_of_week=timetable.day_of_week,
            start_time=timetable.start_time,
            end_time=timetable.end_time,
            created_at=timetable.created_at
        )
        for timetable in courses_list
    ]

@router.delete('/timetables/{timetable_id}',status_code=status.HTTP_204_NO_CONTENT)
def delete_timetable(timetable_id:int,db: Session = Depends(get_db), current_user=Depends(require_admin)):
    timetable=db.query(models.TimeTable).filter(models.TimeTable.id==timetable_id).first()
    if not timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Time Table not found")
    db.delete(timetable)
    db.commit()
    return

@router.get("/attendance", response_model=list[AdminAttendanceResponse])
def get_all_attendance(section_id: int | None = None, student_id: int | None = None, teacher_id: int | None = None, attendance_date: date | None = None, status: AttendanceStatus | None = None, db: Session = Depends(get_db), curr_admin: models.User = Depends(require_admin)):
    student_user = aliased(models.User)
    teacher_user = aliased(models.User)

    attendance_query = (db.query(models.Attendance) .join(models.Attendance.course_section) .join(models.Attendance.student) .join(student_user, models.Student.user) .join(models.CourseSection.subject) .join(models.CourseSection.teacher) .join(teacher_user, models.Teacher.user))

    if section_id:
        attendance_query = attendance_query.filter(models.Attendance.course_section_id == section_id)

    if student_id:
        attendance_query = attendance_query.filter(models.Attendance.student_id == student_id)

    if teacher_id:
        attendance_query = attendance_query.filter(models.CourseSection.teacher_id == teacher_id)

    if attendance_date:
        attendance_query = attendance_query.filter(models.Attendance.date == attendance_date)

    if status:
        attendance_query = attendance_query.filter(models.Attendance.status == status)

    attendance = attendance_query.all()

    return [
        AdminAttendanceResponse(
            id=record.id,
            student_id=record.student_id,
            student_name=record.student.user.name,
            student_email=record.student.user.email,
            course_section_id=record.course_section_id,
            subject_id=record.course_section.subject.id,
            subject_name=record.course_section.subject.name,
            subject_code=record.course_section.subject.code,
            section_name=record.course_section.section_name,
            teacher_id=record.course_section.teacher.id,
            teacher_name=record.course_section.teacher.user.name,
            date=record.date,
            status=record.status,
            marked_at=record.marked_at
        )
        for record in attendance
    ]


@router.patch("/attendance/{attendance_id}", response_model=AdminAttendanceResponse)
def update_attendance(attendance_id: int, payload: UpdateAttendance, db: Session = Depends(get_db), curr_admin: models.User = Depends(require_admin)):
    student_user = aliased(models.User)
    teacher_user = aliased(models.User)

    attendance = (
        db.query(models.Attendance) .join(models.Attendance.course_section) .join(models.Attendance.student) .join(student_user, models.Student.user) .join(models.CourseSection.subject) .join(models.CourseSection.teacher) .join(teacher_user, models.Teacher.user)
        .filter(models.Attendance.id == attendance_id)
        .first()
    )

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance Record not Found"
        )

    seven_days_ago = date.today() - timedelta(days=7)

    if attendance.date < seven_days_ago:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance can only be updated within 7 days"
        )

    attendance.status = payload.status

    db.commit()
    db.refresh(attendance)

    return AdminAttendanceResponse(
        id=attendance.id,
        student_id=attendance.student_id,
        student_name=attendance.student.user.name,
        student_email=attendance.student.user.email,
        course_section_id=attendance.course_section_id,
        subject_id=attendance.course_section.subject.id,
        subject_name=attendance.course_section.subject.name,
        subject_code=attendance.course_section.subject.code,
        section_name=attendance.course_section.section_name,
        teacher_id=attendance.course_section.teacher.id,
        teacher_name=attendance.course_section.teacher.user.name,
        date=attendance.date,
        status=attendance.status,
        marked_at=attendance.marked_at
    )

@router.get("/students",response_model=list[AdminStudentResponse])
def get_students(db:Session=Depends(get_db),current_user=Depends(require_admin)):
    students=(db.query(models.Student)
        .join(models.Student.user)
        .all())

    return [
        AdminStudentResponse(
            student_id=student.id,
            name=student.user.name,
            email=student.user.email
        )
        for student in students
    ]