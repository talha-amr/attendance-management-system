from enum import Enum


class UserRoles(str,Enum):
    ADMIN="admin"
    TEACHER="teacher"
    STUDENT="student"


class TeacherApprovalStatus(str,Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class DaysOfWeek(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"

class AttendanceStatus(str,Enum):
    PRESENT="present"
    ABSENT="absent"