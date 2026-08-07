from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session
from ..schemas import TeacherResponse,SubjectResponse,SubjectCreate
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
