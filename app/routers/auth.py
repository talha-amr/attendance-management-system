from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from ..schemas import UserLogin
from fastapi import APIRouter,Depends,HTTPException,status
from ..database import get_db
from sqlalchemy.orm import Session
from .. import models,security
router=APIRouter(prefix='/login')

@router.post('/')
def login(db:Session=Depends(get_db),payload:OAuth2PasswordRequestForm=Depends()):
    user_check=db.query(models.User).filter(models.User.email==payload.username).first()
    if user_check:
        password_verify=security.verify_password(payload.password,user_check.password)
        if password_verify:
            create_token= "token create"
            return create_token
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="password doesn't match")

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Email is not Registered")
