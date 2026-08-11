from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session,joinedload
from ..schemas import TeacherResponse,SubjectResponse,SubjectCreate,CourseSectionCreate,CourseSectionResponse,AdminStudentEnrollmentResponse
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
