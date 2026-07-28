from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.orm import Mapped
from sqlalchemy import DateTime, func,ForeignKey,String
from sqlalchemy import Enum as SQLEnum
from datetime import datetime,timedelta
from app.enums import UserRoles

class User(Base):
    __tablename__="users"
    id: Mapped[int]=mapped_column(primary_key=True,nullable=False)
    name: Mapped[str]=mapped_column(nullable=False)
    email:Mapped[str]=mapped_column(nullable=False,unique=True)
    password:Mapped[str]=mapped_column(nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    role:Mapped[UserRoles]=mapped_column(SQLEnum(UserRoles,name="user_roles"),default=UserRoles.STUDENT,nullable=False,server_default=UserRoles.STUDENT.name)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"),primary_key=True)
    token_hash:Mapped[str]=mapped_column(String(64),unique=True,nullable=False)
    expires_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),nullable=False)
    used_at:Mapped[datetime | None]=mapped_column(DateTime(timezone=True),nullable=True)
    issued_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
  