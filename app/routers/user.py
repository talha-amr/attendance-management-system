from fastapi import APIRouter,Depends,status,HTTPException
from ..database import get_db
from sqlalchemy.orm import Session
from ..schemas import UserCreate,UserResponse
from .. import security
router = APIRouter(prefix='/user')
from .. import models
from .. dependencies import get_current_user
from ..dependencies import require_admin

@router.post('/',status_code=status.HTTP_201_CREATED,response_model=UserResponse)
def signup(payload: UserCreate ,db:Session=Depends(get_db)):
    user_check= db.query(models.User).filter(models.User.email==payload.email).first()
    if not user_check:
        hashed_password= security.hash_password(payload.password)
        user_dict=payload.model_dump()
        user_dict["password"]=hashed_password
        new_user=models.User(**user_dict)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="User Email is already Registered")

@router.get("/me", response_model=UserResponse)
def get_current_user_details( current_user = Depends(get_current_user)):
    return current_user

@router.post('/admin/test')
def admin_test(current_user = Depends(require_admin)):
    return current_user
    
