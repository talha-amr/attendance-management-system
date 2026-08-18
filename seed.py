from datetime import date, datetime, timedelta, time

from app.database import SessionLocal
from app import models, security
from app.enums import UserRoles, TeacherApprovalStatus, DaysOfWeek, AttendanceStatus


db = SessionLocal()


def get_or_create_user(name, email, password, role):
    user = db.query(models.User).filter(models.User.email == email).first()

    if user:
        return user

    user = models.User(
        name=name,
        email=email,
        password=security.hash_password(password),
        role=role,
    )

    db.add(user)
    db.flush()

    return user


def get_or_create_teacher(name, email):
    user = get_or_create_user(
        name=name,
        email=email,
        password="Demo@12345",
        role=UserRoles.TEACHER,
    )

    teacher = (
        db.query(models.Teacher)
        .filter(models.Teacher.user_id == user.id)
        .first()
    )

    if not teacher:
        teacher = models.Teacher(
            user_id=user.id,
            approval_status=TeacherApprovalStatus.APPROVED,
        )
        db.add(teacher)
        db.flush()

    return teacher


def get_or_create_pending_teacher(name, email):
    user = get_or_create_user(
        name=name,
        email=email,
        password="Demo@12345",
        role=UserRoles.TEACHER,
    )

    teacher = (
        db.query(models.Teacher)
        .filter(models.Teacher.user_id == user.id)
        .first()
    )

    if not teacher:
        teacher = models.Teacher(
            user_id=user.id,
            approval_status=TeacherApprovalStatus.PENDING,
        )
        db.add(teacher)
        db.flush()

    return teacher


def get_or_create_student(name, email):
    user = get_or_create_user(
        name=name,
        email=email,
        password="Demo@12345",
        role=UserRoles.STUDENT,
    )

    student = (
        db.query(models.Student)
        .filter(models.Student.user_id == user.id)
        .first()
    )

    if not student:
        student = models.Student(user_id=user.id)
        db.add(student)
        db.flush()

    return student


def get_or_create_subject(name, code):
    subject = (
        db.query(models.Subject)
        .filter(models.Subject.code == code)
        .first()
    )

    if subject:
        return subject

    subject = models.Subject(
        name=name,
        code=code,
    )

    db.add(subject)
    db.flush()

    return subject


def get_or_create_section(subject, teacher, section_name, semester, academic_year):
    section = (
        db.query(models.CourseSection)
        .filter(
            models.CourseSection.subject_id == subject.id,
            models.CourseSection.section_name == section_name,
            models.CourseSection.semester == semester,
            models.CourseSection.academic_year == academic_year,
        )
        .first()
    )

    if section:
        return section

    section = models.CourseSection(
        subject_id=subject.id,
        teacher_id=teacher.id,
        section_name=section_name,
        semester=semester,
        academic_year=academic_year,
    )

    db.add(section)
    db.flush()

    return section


def get_or_create_enrollment(student, section):
    enrollment = (
        db.query(models.Enrollment)
        .filter(
            models.Enrollment.student_id == student.id,
            models.Enrollment.course_section_id == section.id,
        )
        .first()
    )

    if enrollment:
        return enrollment

    enrollment = models.Enrollment(
        student_id=student.id,
        course_section_id=section.id,
    )

    db.add(enrollment)
    db.flush()

    return enrollment


def get_or_create_timetable(section, day, start, end):
    timetable = (
        db.query(models.TimeTable)
        .filter(
            models.TimeTable.course_section_id == section.id,
            models.TimeTable.day_of_week == day,
        )
        .first()
    )

    if timetable:
        return timetable

    timetable = models.TimeTable(
        course_section_id=section.id,
        day_of_week=day,
        start_time=start,
        end_time=end,
    )

    db.add(timetable)
    db.flush()

    return timetable


def get_or_create_attendance(student, section, attendance_date, status):
    attendance = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.student_id == student.id,
            models.Attendance.course_section_id == section.id,
            models.Attendance.date == attendance_date,
        )
        .first()
    )

    if attendance:
        return attendance

    attendance = models.Attendance(
        student_id=student.id,
        course_section_id=section.id,
        date=attendance_date,
        status=status,
    )

    db.add(attendance)
    db.flush()

    return attendance


try:
    # ---------------------------------------------------------
    # APPROVED TEACHERS
    # ---------------------------------------------------------

    teachers = {}

    teachers["ali"] = get_or_create_teacher(
        "Dr. Ali Raza",
        "ali.raza@gmail.com",
    )

    teachers["sara"] = get_or_create_teacher(
        "Dr. Sara Ahmed",
        "sara.ahmed@gmail.com",
    )

    teachers["hamza"] = get_or_create_teacher(
        "Hamza Malik",
        "hamza.malik@gmail.com",
    )

    teachers["ayesha"] = get_or_create_teacher(
        "Ayesha Khan",
        "ayesha.khan@gmail.com",
    )

    teachers["usman"] = get_or_create_teacher(
        "Usman Tariq",
        "usman.tariq@gmail.com",
    )

    # ---------------------------------------------------------
    # PENDING TEACHERS
    # ---------------------------------------------------------

    pending_teachers = {}

    pending_teachers["usman_farooq"] = get_or_create_pending_teacher(
        "Usman Farooq",
        "usman.farooq@gmail.com",
    )

    pending_teachers["maryam_ali"] = get_or_create_pending_teacher(
        "Maryam Ali",
        "maryam.ali@gmail.com",
    )

    pending_teachers["hassan_ahmed"] = get_or_create_pending_teacher(
        "Hassan Ahmed",
        "hassan.ahmed@gmail.com",
    )

    pending_teachers["noor_fatima"] = get_or_create_pending_teacher(
        "Noor Fatima",
        "noor.fatima@gmail.com",
    )

    # ---------------------------------------------------------
    # STUDENTS
    # ---------------------------------------------------------

    students = {}

    students["talha"] = get_or_create_student(
        "Ahmed Hassan",
        "ahmed.hassan@gmail.com",
    )

    students["hamza"] = get_or_create_student(
        "Bilal Shah",
        "bilal.shah@gmail.com",
    )

    students["fatima"] = get_or_create_student(
        "Fatima Noor",
        "fatima.noor@gmail.com",
    )

    students["usman"] = get_or_create_student(
        "Usman Ali",
        "usman.ali@gmail.com",
    )

    students["zainab"] = get_or_create_student(
        "Zainab Iqbal",
        "zainab.iqbal@gmail.com",
    )

    students["hassan"] = get_or_create_student(
        "Hassan Raza",
        "hassan.raza@gmail.com",
    )

    students["maha"] = get_or_create_student(
        "Maha Faisal",
        "maha.faisal@gmail.com",
    )

    students["danish"] = get_or_create_student(
        "Danish Ahmed",
        "danish.ahmed@gmail.com",
    )

    # ---------------------------------------------------------
    # SUBJECTS
    # ---------------------------------------------------------

    subjects = {}

    subjects["CS101"] = get_or_create_subject(
        "Programming Fundamentals",
        "CS-101",
    )

    subjects["CS102"] = get_or_create_subject(
        "OOP",
        "CS-102",
    )

    subjects["CS201"] = get_or_create_subject(
        "Object Oriented Programming",
        "CS-201",
    )

    subjects["CS301"] = get_or_create_subject(
        "Data Structures and Algorithms",
        "CS-301",
    )

    subjects["CS302"] = get_or_create_subject(
        "Database Systems",
        "CS-302",
    )

    subjects["SE301"] = get_or_create_subject(
        "Software Engineering",
        "SE-301",
    )

    # ---------------------------------------------------------
    # COURSE SECTIONS
    # ---------------------------------------------------------

    sections = {}

    sections["CS101_A"] = get_or_create_section(
        subjects["CS101"],
        teachers["ali"],
        "A",
        2,
        2026,
    )

    sections["CS102_A"] = get_or_create_section(
        subjects["CS102"],
        teachers["sara"],
        "A",
        2,
        2026,
    )

    sections["CS201_A"] = get_or_create_section(
        subjects["CS201"],
        teachers["hamza"],
        "A",
        3,
        2026,
    )

    sections["CS301_A"] = get_or_create_section(
        subjects["CS301"],
        teachers["ayesha"],
        "A",
        4,
        2026,
    )

    sections["CS302_A"] = get_or_create_section(
        subjects["CS302"],
        teachers["usman"],
        "A",
        4,
        2026,
    )

    sections["SE301_A"] = get_or_create_section(
        subjects["SE301"],
        teachers["ali"],
        "A",
        5,
        2026,
    )

    # ---------------------------------------------------------
    # TIMETABLES
    # ---------------------------------------------------------

    # Monday
    get_or_create_timetable(
        sections["CS101_A"],
        DaysOfWeek.MONDAY,
        time(8, 0),
        time(9, 0),
    )

    get_or_create_timetable(
        sections["CS301_A"],
        DaysOfWeek.MONDAY,
        time(10, 0),
        time(11, 0),
    )

    # Tuesday
    get_or_create_timetable(
        sections["CS102_A"],
        DaysOfWeek.TUESDAY,
        time(9, 0),
        time(10, 0),
    )

    get_or_create_timetable(
        sections["CS302_A"],
        DaysOfWeek.TUESDAY,
        time(11, 0),
        time(12, 0),
    )

    # Wednesday
    get_or_create_timetable(
        sections["CS201_A"],
        DaysOfWeek.WEDNESDAY,
        time(8, 0),
        time(9, 0),
    )

    get_or_create_timetable(
        sections["SE301_A"],
        DaysOfWeek.WEDNESDAY,
        time(10, 0),
        time(11, 0),
    )

    # Thursday
    get_or_create_timetable(
        sections["CS101_A"],
        DaysOfWeek.THURSDAY,
        time(8, 0),
        time(9, 0),
    )

    get_or_create_timetable(
        sections["CS301_A"],
        DaysOfWeek.THURSDAY,
        time(10, 0),
        time(11, 0),
    )

    # Friday
    get_or_create_timetable(
        sections["CS102_A"],
        DaysOfWeek.FRIDAY,
        time(9, 0),
        time(10, 0),
    )

    get_or_create_timetable(
        sections["CS302_A"],
        DaysOfWeek.FRIDAY,
        time(11, 0),
        time(12, 0),
    )

    # Saturday
    get_or_create_timetable(
        sections["CS201_A"],
        DaysOfWeek.SATURDAY,
        time(9, 0),
        time(10, 0),
    )

    get_or_create_timetable(
        sections["SE301_A"],
        DaysOfWeek.SATURDAY,
        time(11, 0),
        time(12, 0),
    )

    # ---------------------------------------------------------
    # ENROLLMENTS
    # ---------------------------------------------------------

    # Ahmed - 5 courses
    get_or_create_enrollment(students["talha"], sections["CS101_A"])
    get_or_create_enrollment(students["talha"], sections["CS102_A"])
    get_or_create_enrollment(students["talha"], sections["CS201_A"])
    get_or_create_enrollment(students["talha"], sections["CS301_A"])
    get_or_create_enrollment(students["talha"], sections["SE301_A"])

    # Bilal - 4 courses
    get_or_create_enrollment(students["hamza"], sections["CS101_A"])
    get_or_create_enrollment(students["hamza"], sections["CS201_A"])
    get_or_create_enrollment(students["hamza"], sections["CS302_A"])
    get_or_create_enrollment(students["hamza"], sections["SE301_A"])

    # Fatima - 5 courses
    get_or_create_enrollment(students["fatima"], sections["CS101_A"])
    get_or_create_enrollment(students["fatima"], sections["CS102_A"])
    get_or_create_enrollment(students["fatima"], sections["CS301_A"])
    get_or_create_enrollment(students["fatima"], sections["CS302_A"])
    get_or_create_enrollment(students["fatima"], sections["SE301_A"])

    # Usman - 4 courses
    get_or_create_enrollment(students["usman"], sections["CS102_A"])
    get_or_create_enrollment(students["usman"], sections["CS201_A"])
    get_or_create_enrollment(students["usman"], sections["CS301_A"])
    get_or_create_enrollment(students["usman"], sections["CS302_A"])

    # Zainab - 5 courses
    get_or_create_enrollment(students["zainab"], sections["CS101_A"])
    get_or_create_enrollment(students["zainab"], sections["CS201_A"])
    get_or_create_enrollment(students["zainab"], sections["CS301_A"])
    get_or_create_enrollment(students["zainab"], sections["CS302_A"])
    get_or_create_enrollment(students["zainab"], sections["SE301_A"])

    # Hassan - 3 courses
    get_or_create_enrollment(students["hassan"], sections["CS101_A"])
    get_or_create_enrollment(students["hassan"], sections["CS102_A"])
    get_or_create_enrollment(students["hassan"], sections["CS201_A"])

    # Maha - 4 courses
    get_or_create_enrollment(students["maha"], sections["CS102_A"])
    get_or_create_enrollment(students["maha"], sections["CS301_A"])
    get_or_create_enrollment(students["maha"], sections["CS302_A"])
    get_or_create_enrollment(students["maha"], sections["SE301_A"])

    # Danish - 4 courses
    get_or_create_enrollment(students["danish"], sections["CS101_A"])
    get_or_create_enrollment(students["danish"], sections["CS201_A"])
    get_or_create_enrollment(students["danish"], sections["CS301_A"])
    get_or_create_enrollment(students["danish"], sections["SE301_A"])

    # ---------------------------------------------------------
    # ATTENDANCE
    # ---------------------------------------------------------

    attendance_data = [
        # Ahmed
        (students["talha"], sections["CS101_A"], date(2026, 8, 17), AttendanceStatus.PRESENT),
        (students["talha"], sections["CS101_A"], date(2026, 8, 13), AttendanceStatus.PRESENT),
        (students["talha"], sections["CS102_A"], date(2026, 8, 14), AttendanceStatus.ABSENT),
        (students["talha"], sections["CS102_A"], date(2026, 8, 18), AttendanceStatus.PRESENT),
        (students["talha"], sections["CS201_A"], date(2026, 8, 12), AttendanceStatus.PRESENT),
        (students["talha"], sections["CS201_A"], date(2026, 8, 15), AttendanceStatus.PRESENT),
        (students["talha"], sections["CS301_A"], date(2026, 8, 17), AttendanceStatus.PRESENT),
        (students["talha"], sections["CS301_A"], date(2026, 8, 13), AttendanceStatus.ABSENT),
        (students["talha"], sections["SE301_A"], date(2026, 8, 12), AttendanceStatus.PRESENT),
        (students["talha"], sections["SE301_A"], date(2026, 8, 15), AttendanceStatus.PRESENT),

        # Bilal
        (students["hamza"], sections["CS101_A"], date(2026, 8, 17), AttendanceStatus.PRESENT),
        (students["hamza"], sections["CS101_A"], date(2026, 8, 13), AttendanceStatus.ABSENT),
        (students["hamza"], sections["CS201_A"], date(2026, 8, 12), AttendanceStatus.PRESENT),
        (students["hamza"], sections["CS201_A"], date(2026, 8, 15), AttendanceStatus.PRESENT),
        (students["hamza"], sections["CS302_A"], date(2026, 8, 18), AttendanceStatus.PRESENT),
        (students["hamza"], sections["CS302_A"], date(2026, 8, 14), AttendanceStatus.PRESENT),
        (students["hamza"], sections["SE301_A"], date(2026, 8, 12), AttendanceStatus.ABSENT),
        (students["hamza"], sections["SE301_A"], date(2026, 8, 15), AttendanceStatus.PRESENT),

        # Fatima
        (students["fatima"], sections["CS101_A"], date(2026, 8, 17), AttendanceStatus.PRESENT),
        (students["fatima"], sections["CS101_A"], date(2026, 8, 13), AttendanceStatus.PRESENT),
        (students["fatima"], sections["CS102_A"], date(2026, 8, 14), AttendanceStatus.PRESENT),
        (students["fatima"], sections["CS102_A"], date(2026, 8, 18), AttendanceStatus.PRESENT),
        (students["fatima"], sections["CS301_A"], date(2026, 8, 17), AttendanceStatus.PRESENT),
        (students["fatima"], sections["CS301_A"], date(2026, 8, 13), AttendanceStatus.PRESENT),
        (students["fatima"], sections["CS302_A"], date(2026, 8, 18), AttendanceStatus.ABSENT),
        (students["fatima"], sections["CS302_A"], date(2026, 8, 14), AttendanceStatus.PRESENT),
        (students["fatima"], sections["SE301_A"], date(2026, 8, 12), AttendanceStatus.PRESENT),
        (students["fatima"], sections["SE301_A"], date(2026, 8, 15), AttendanceStatus.ABSENT),

        # Usman
        (students["usman"], sections["CS102_A"], date(2026, 8, 14), AttendanceStatus.PRESENT),
        (students["usman"], sections["CS102_A"], date(2026, 8, 18), AttendanceStatus.ABSENT),
        (students["usman"], sections["CS201_A"], date(2026, 8, 12), AttendanceStatus.PRESENT),
        (students["usman"], sections["CS201_A"], date(2026, 8, 15), AttendanceStatus.PRESENT),
        (students["usman"], sections["CS301_A"], date(2026, 8, 17), AttendanceStatus.PRESENT),
        (students["usman"], sections["CS301_A"], date(2026, 8, 13), AttendanceStatus.PRESENT),
        (students["usman"], sections["CS302_A"], date(2026, 8, 18), AttendanceStatus.PRESENT),
        (students["usman"], sections["CS302_A"], date(2026, 8, 14), AttendanceStatus.PRESENT),

        # Zainab
        (students["zainab"], sections["CS101_A"], date(2026, 8, 17), AttendanceStatus.PRESENT),
        (students["zainab"], sections["CS101_A"], date(2026, 8, 13), AttendanceStatus.ABSENT),
        (students["zainab"], sections["CS201_A"], date(2026, 8, 12), AttendanceStatus.PRESENT),
        (students["zainab"], sections["CS201_A"], date(2026, 8, 15), AttendanceStatus.PRESENT),
        (students["zainab"], sections["CS301_A"], date(2026, 8, 17), AttendanceStatus.PRESENT),
        (students["zainab"], sections["CS301_A"], date(2026, 8, 13), AttendanceStatus.PRESENT),
        (students["zainab"], sections["CS302_A"], date(2026, 8, 18), AttendanceStatus.PRESENT),
        (students["zainab"], sections["CS302_A"], date(2026, 8, 14), AttendanceStatus.ABSENT),
        (students["zainab"], sections["SE301_A"], date(2026, 8, 12), AttendanceStatus.PRESENT),
        (students["zainab"], sections["SE301_A"], date(2026, 8, 15), AttendanceStatus.PRESENT),

        # Hassan
        (students["hassan"], sections["CS101_A"], date(2026, 8, 17), AttendanceStatus.ABSENT),
        (students["hassan"], sections["CS101_A"], date(2026, 8, 13), AttendanceStatus.PRESENT),
        (students["hassan"], sections["CS102_A"], date(2026, 8, 14), AttendanceStatus.PRESENT),
        (students["hassan"], sections["CS102_A"], date(2026, 8, 18), AttendanceStatus.PRESENT),
        (students["hassan"], sections["CS201_A"], date(2026, 8, 12), AttendanceStatus.PRESENT),
        (students["hassan"], sections["CS201_A"], date(2026, 8, 15), AttendanceStatus.ABSENT),

        # Maha
        (students["maha"], sections["CS102_A"], date(2026, 8, 14), AttendanceStatus.PRESENT),
        (students["maha"], sections["CS102_A"], date(2026, 8, 18), AttendanceStatus.PRESENT),
        (students["maha"], sections["CS301_A"], date(2026, 8, 17), AttendanceStatus.PRESENT),
        (students["maha"], sections["CS301_A"], date(2026, 8, 13), AttendanceStatus.PRESENT),
        (students["maha"], sections["CS302_A"], date(2026, 8, 18), AttendanceStatus.ABSENT),
        (students["maha"], sections["CS302_A"], date(2026, 8, 14), AttendanceStatus.PRESENT),
        (students["maha"], sections["SE301_A"], date(2026, 8, 12), AttendanceStatus.PRESENT),
        (students["maha"], sections["SE301_A"], date(2026, 8, 15), AttendanceStatus.PRESENT),

        # Danish
        (students["danish"], sections["CS101_A"], date(2026, 8, 17), AttendanceStatus.PRESENT),
        (students["danish"], sections["CS101_A"], date(2026, 8, 13), AttendanceStatus.PRESENT),
        (students["danish"], sections["CS201_A"], date(2026, 8, 12), AttendanceStatus.ABSENT),
        (students["danish"], sections["CS201_A"], date(2026, 8, 15), AttendanceStatus.PRESENT),
        (students["danish"], sections["CS301_A"], date(2026, 8, 17), AttendanceStatus.PRESENT),
        (students["danish"], sections["CS301_A"], date(2026, 8, 13), AttendanceStatus.ABSENT),
        (students["danish"], sections["SE301_A"], date(2026, 8, 12), AttendanceStatus.PRESENT),
        (students["danish"], sections["SE301_A"], date(2026, 8, 15), AttendanceStatus.PRESENT),
    ]

    for student, section, attendance_date, attendance_status in attendance_data:
        get_or_create_attendance(
            student,
            section,
            attendance_date,
            attendance_status,
        )

    db.commit()

    print("Seed completed successfully.")
    print()
    print("Demo password for all seeded accounts: Demo@12345")
    print()
    print("Approved Teachers:")
    print("ali.raza@gmail.com")
    print("sara.ahmed@gmail.com")
    print("hamza.malik@gmail.com")
    print("ayesha.khan@gmail.com")
    print("usman.tariq@gmail.com")
    print()
    print("Pending Teachers:")
    print("usman.farooq@gmail.com")
    print("maryam.ali@gmail.com")
    print("hassan.ahmed@gmail.com")
    print("noor.fatima@gmail.com")
    print()
    print("Students:")
    print("ahmed.hassan@gmail.com")
    print("bilal.shah@gmail.com")
    print("fatima.noor@gmail.com")
    print("usman.ali@gmail.com")
    print("zainab.iqbal@gmail.com")
    print("hassan.raza@gmail.com")
    print("maha.faisal@gmail.com")
    print("danish.ahmed@gmail.com")

except Exception:
    db.rollback()
    raise

finally:
    db.close()