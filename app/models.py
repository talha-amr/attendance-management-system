from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy import DateTime, func,ForeignKey,String
from sqlalchemy import Time,Enum as SQLEnum,Date,UniqueConstraint
from datetime import datetime,time,date as DateType
from app.enums import UserRoles,TeacherApprovalStatus,DaysOfWeek,AttendanceStatus
from typing import Optional


class User(Base):
    __tablename__="users"
    id: Mapped[int]=mapped_column(primary_key=True,nullable=False)
    name: Mapped[str]=mapped_column(nullable=False)
    email:Mapped[str]=mapped_column(nullable=False,unique=True)
    password:Mapped[str]=mapped_column(nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    role:Mapped[UserRoles]=mapped_column(SQLEnum(UserRoles,name="user_roles"),default=UserRoles.STUDENT,nullable=False,server_default=UserRoles.STUDENT.name)
    teacher: Mapped[Optional["Teacher"]] = relationship(
    back_populates="user",
    uselist=False)
    student: Mapped[Optional["Student"]] = relationship(
    back_populates="user",
    uselist=False)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"),primary_key=True)
    token_hash:Mapped[str]=mapped_column(String(64),unique=True,nullable=False)
    expires_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),nullable=False)
    used_at:Mapped[datetime | None]=mapped_column(DateTime(timezone=True),nullable=True)
    issued_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)

class Teacher(Base):
    __tablename__="teachers"
    id:Mapped[int]=mapped_column(primary_key=True,nullable=False)
    user_id:Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"),unique=True,nullable=False)
    approval_status:Mapped[TeacherApprovalStatus]=mapped_column(SQLEnum(TeacherApprovalStatus,name="approval_status"),default=TeacherApprovalStatus.PENDING,nullable=False,server_default=TeacherApprovalStatus.PENDING.name)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)

    user: Mapped["User"] = relationship(
    back_populates="teacher") 
    course_sections: Mapped[list["CourseSection"]] = relationship(
    back_populates="teacher"
    )


class Student(Base):
    __tablename__="students"
    id:Mapped[int]=mapped_column(primary_key=True,nullable=False)
    user_id:Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"),unique=True,nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    user: Mapped["User"] = relationship(
    back_populates="student")
    enrollments: Mapped[list["Enrollment"]] = relationship(
    back_populates="student"
    )
    attendance: Mapped[list["Attendance"]] = relationship(
    back_populates="student")

class Subject(Base):
    __tablename__="subjects"
    id:Mapped[int]=mapped_column(primary_key=True,nullable=False)
    name:Mapped[str]=mapped_column(nullable=False,unique=True)
    code: Mapped[str] = mapped_column(nullable=False, unique=True)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    course_sections: Mapped[list["CourseSection"]] = relationship(
    back_populates="subject" )   

class CourseSection(Base):
    __tablename__="course_sections"
    id:Mapped[int]=mapped_column(primary_key=True,nullable=False)
    subject_id:Mapped[int] = mapped_column(ForeignKey("subjects.id"),nullable=False)
    teacher_id:Mapped[int]= mapped_column(ForeignKey("teachers.id"),nullable=False)
    section_name:Mapped[str]=mapped_column(nullable=False)
    semester:Mapped[int]=mapped_column(nullable=False)
    academic_year:Mapped[int]=mapped_column(nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    subject: Mapped["Subject"] = relationship(
    back_populates="course_sections"
    )

    teacher: Mapped["Teacher"] = relationship(
    back_populates="course_sections"
    )

    enrollments: Mapped[list["Enrollment"]] = relationship(
    back_populates="course_section"
    )
    timetables: Mapped[list["TimeTable"]] = relationship(back_populates="course_section" )
    attendance: Mapped[list["Attendance"]] = relationship(back_populates="course_section")

class Enrollment(Base):
    __tablename__="enrollments"
    student_id:Mapped[int] = mapped_column(ForeignKey("students.id",ondelete="CASCADE"),primary_key=True,nullable=False)
    course_section_id:Mapped[int] = mapped_column(ForeignKey("course_sections.id",ondelete="CASCADE"),primary_key=True,nullable=False)
    enrolled_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    student: Mapped["Student"] = relationship(
    back_populates="enrollments"
    )

    course_section: Mapped["CourseSection"] = relationship(
    back_populates="enrollments"
    )

class TimeTable(Base):
    __tablename__="timetables"
    id:Mapped[int]=mapped_column(primary_key=True,nullable=False)
    course_section_id:Mapped[int] = mapped_column(ForeignKey("course_sections.id",ondelete="CASCADE"),nullable=False)
    day_of_week: Mapped[DaysOfWeek] = mapped_column(SQLEnum(DaysOfWeek, name="days_of_week"), nullable=False )
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)

    course_section: Mapped["CourseSection"] = relationship(back_populates="timetables")


class Attendance(Base):
    __tablename__="attendance"
    __table_args__ = ( UniqueConstraint("student_id","course_section_id","date",name="uq_attendance_student_section_date" ),)
    id:Mapped[int]=mapped_column(primary_key=True,nullable=False)
    student_id:Mapped[int] = mapped_column(ForeignKey("students.id",ondelete="CASCADE"),nullable=False)
    course_section_id:Mapped[int] = mapped_column(ForeignKey("course_sections.id",ondelete="CASCADE"),nullable=False)
    date: Mapped[DateType] = mapped_column(Date, nullable=False)
    status: Mapped[AttendanceStatus] = mapped_column(SQLEnum(AttendanceStatus, name="attendance_status"), nullable=False )
    marked_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)

    student:Mapped["Student"] = relationship(back_populates="attendance")
    course_section: Mapped["CourseSection"] = relationship(back_populates="attendance")
