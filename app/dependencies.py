from fastapi.security.oauth2 import OAuth2PasswordBearer
from fastapi import Depends,HTTPException,status
from sqlalchemy.orm import Session
from .database import get_db
from . import security,models
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
        