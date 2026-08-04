from fastapi.security.oauth2 import OAuth2PasswordBearer
from fastapi import Depends,HTTPException,status
from sqlalchemy.orm import Session
from .database import get_db
from . import security,models
from .enums import UserRoles

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
