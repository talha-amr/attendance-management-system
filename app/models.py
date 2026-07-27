from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.orm import Mapped

class User(Base):
    __tablename__="users"
    id: Mapped[int]=mapped_column(primary_key=True,nullable=False)
    name: Mapped[str]=mapped_column(nullable=False)
