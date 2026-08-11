from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session,joinedload
from ..schemas import TeacherResponse,SubjectResponse,SubjectCreate,CourseSectionCreate,CourseSectionResponse,AdminStudentEnrollmentResponse,AdminEnrollmentCreate,EnrollmentResponse,TimeTableCreate,TimeTableResponse
from .. import models
from .. dependencies import require_admin
from ..enums import TeacherApprovalStatus


router=APIRouter(prefix='/admin')
@router.get('/teachers',response_model=list[TeacherResponse])
def get_teachers(db:Session=Depends(get_db),current_user=Depends(require_admin)):
    teachers=db.query(models.Teacher).all()
    return teachers


@router.get('/teachers/pending',response_model=list[TeacherResponse])
def get_pending_teachers(db:Session=Depends(get_db),current_user=Depends(require_admin)):
    teachers=db.query(models.Teacher).filter(models.Teacher.approval_status==TeacherApprovalStatus.PENDING).all()
    return teachers

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

@router.get('/course-sections',response_model=list[CourseSectionResponse])
def get_course_sections(db:Session=Depends(get_db),current_user=Depends(require_admin)):
    courses=db.query(models.CourseSection).options(
        joinedload(models.CourseSection.subject),
        joinedload(models.CourseSection.teacher).joinedload(models.Teacher.user)
    ).all()
    return courses

@router.get("/course-sections/{section_id}/students", response_model=list[AdminStudentEnrollmentResponse])
def get_section_students(section_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    enrollments = (db.query(models.Enrollment).join(models.Enrollment.course_section)
        .options(joinedload(models.Enrollment.student).joinedload(models.Student.user))
        .filter(models.Enrollment.course_section_id == section_id).all())

    return [
        AdminStudentEnrollmentResponse(
            student_id=enrollment.student.id,
            name=enrollment.student.user.name,
            email=enrollment.student.user.email,
            enrolled_at=enrollment.enrolled_at
        )
        for enrollment in enrollments
    ]

@router.post('/enrollments',response_model=EnrollmentResponse)
def enroll_student(payload:AdminEnrollmentCreate,db: Session = Depends(get_db), current_user=Depends(require_admin)):
    student_check=db.query(models.Student).filter(models.Student.id==payload.student_id).first()
    course_section_check=db.query(models.CourseSection).filter(models.CourseSection.id==payload.course_section_id).first()
    if not student_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="student not found")
    if not course_section_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Course not found")
    enrollment_check=db.query(models.Enrollment).filter(models.Enrollment.course_section_id==payload.course_section_id,models.Enrollment.student_id==payload.student_id).first()
    if enrollment_check:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Student Already Enrolled")
    new_enrollment=models.Enrollment(course_section_id=payload.course_section_id,student_id=payload.student_id)
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment
      
@router.delete('/enrollments/{student_id}/{course_section_id}',status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(student_id:int,course_section_id:int,db: Session = Depends(get_db), current_user=Depends(require_admin)):
    enrollment_check=db.query(models.Enrollment).filter(models.Enrollment.course_section_id==course_section_id,models.Enrollment.student_id==student_id).first()
    if not enrollment_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Enrollment not found")
    db.delete(enrollment_check)
    db.commit()
    return

@router.post('/timetables',response_model=TimeTableResponse)
def create_timetable(payload:TimeTableCreate,db: Session = Depends(get_db), current_user=Depends(require_admin)):
    course=db.query(models.CourseSection).filter(models.CourseSection.id==payload.course_section_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Course not found")
    time_table = db.query(models.TimeTable).filter(models.TimeTable.course_section_id == payload.course_section_id,models.TimeTable.day_of_week == payload.day_of_week,
    models.TimeTable.start_time < payload.end_time,
    models.TimeTable.end_time > payload.start_time
    ).first()
    if time_table:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Time-Table Overlap")
    teacher_time_table = db.query(models.TimeTable).join(
            models.TimeTable.course_section
        ).filter(
            models.CourseSection.teacher_id == course.teacher_id,
            models.TimeTable.day_of_week == payload.day_of_week,
            models.TimeTable.start_time < payload.end_time,
            models.TimeTable.end_time > payload.start_time
        ).first()
    if teacher_time_table:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Teacher already has a class at this time")
    new_time_table=models.TimeTable(**payload.model_dump())
    db.add(new_time_table)
    db.commit()
    db.refresh(new_time_table)
    return new_time_table