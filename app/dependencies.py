from fastapi.security.oauth2 import OAuth2PasswordBearer
from fastapi import Depends,HTTPException,status
from sqlalchemy.orm import Session
from .database import get_db
from . import security,models
from .enums import UserRoles,TeacherApprovalStatus

data_format=OAuth2PasswordBearer(tokenUrl='/login')

def get_current_user(token:str= Depends(data_format),db: Session=Depends(get_db)):
    credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},)

    verification= security.verify_token(token)
    user=db.query(models.User).filter(models.User.id==verification.user_id).first()
    if  not (user):
        raise credentials_exception
    return user
        

def require_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != UserRoles.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user

def require_teacher(current_user: models.User = Depends(get_current_user)):
    if current_user.role != UserRoles.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher access required"
        )

    return current_user

def require_teacher_profile(current_user: models.User = Depends(require_teacher)):
    if not current_user.teacher :
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher profile not found"
        )

    return current_user.teacher

def require_approved_teacher(current_user: models.Teacher = Depends(require_teacher_profile)):
  
    if current_user.approval_status != TeacherApprovalStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher approval required"
        )

    return current_user
    
