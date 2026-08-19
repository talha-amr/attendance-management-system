"use client";

import { createContext, useCallback, useEffect, useState } from "react";

export const AdminContext = createContext();

export default function AdminProvider({ children }) {
  const [teachers, setTeachers] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courseSections, setCourseSections] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [sectionStudents, setSectionStudents] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleResponse = async (response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.detail || "Something went wrong. Please try again."
      );
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  // -----------------------------
  // TEACHERS
  // -----------------------------

  const fetchTeachers = useCallback(async () => {
    const response = await fetch(`${API_URL}/admin/teachers`, {
      headers: getHeaders(),
    });

    return handleResponse(response);
  }, [API_URL]);

  const fetchPendingTeachers = useCallback(async () => {
    const response = await fetch(`${API_URL}/admin/teachers/pending`, {
      headers: getHeaders(),
    });

    return handleResponse(response);
  }, [API_URL]);

  const approveTeacher = async (teacherId) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/admin/teachers/${teacherId}/approve`,
        {
          method: "PATCH",
          headers: getHeaders(),
        }
      );

      await handleResponse(response);

      await Promise.all([
        refreshTeachers(),
        refreshPendingTeachers(),
      ]);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const rejectTeacher = async (teacherId) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/admin/teachers/${teacherId}/reject`,
        {
          method: "PATCH",
          headers: getHeaders(),
        }
      );

      await handleResponse(response);

      await Promise.all([
        refreshTeachers(),
        refreshPendingTeachers(),
      ]);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------
  // STUDENTS
  // -----------------------------

  const fetchStudents = useCallback(async () => {
    const response = await fetch(`${API_URL}/admin/students`, {
      headers: getHeaders(),
    });

    return handleResponse(response);
  }, [API_URL]);

  const refreshStudents = useCallback(async () => {
    const data = await fetchStudents();

    setStudents(data);

    return data;
  }, [fetchStudents]);

  // -----------------------------
  // SUBJECTS
  // -----------------------------

  const fetchSubjects = useCallback(async () => {
    const response = await fetch(`${API_URL}/admin/subjects`, {
      headers: getHeaders(),
    });

    return handleResponse(response);
  }, [API_URL]);

  const createSubject = async (subjectData) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/admin/subjects`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(subjectData),
      });

      const data = await handleResponse(response);

      setSubjects((prev) => [...prev, data]);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------
  // COURSE SECTIONS
  // -----------------------------

  const fetchCourseSections = useCallback(async () => {
    const response = await fetch(`${API_URL}/admin/course-sections`, {
      headers: getHeaders(),
    });

    return handleResponse(response);
  }, [API_URL]);

  const refreshCourseSections = useCallback(async () => {
    const data = await fetchCourseSections();

    setCourseSections(data);

    return data;
  }, [fetchCourseSections]);

  const createCourseSection = async (courseData) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/admin/course-sections`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(courseData),
      });

    const data = await handleResponse(response);

    await refreshCourseSections();

    return data;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------
  // SECTION STUDENTS
  // -----------------------------

  const fetchSectionStudents = async (sectionId) => {
    setActionLoading(true);
    setError(null);
    setSelectedSection(sectionId);

    try {
      const response = await fetch(
        `${API_URL}/admin/course-sections/${sectionId}/students`,
        {
          headers: getHeaders(),
        }
      );

      const data = await handleResponse(response);

      setSectionStudents(data);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------
  // ENROLLMENTS
  // -----------------------------

  const enrollStudent = async (enrollmentData) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/admin/enrollments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(enrollmentData),
      });

      const data = await handleResponse(response);

      await Promise.all([
        refreshCourseSections(),
        fetchSectionStudents(enrollmentData.course_section_id),
      ]);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteEnrollment = async (studentId, courseSectionId) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/admin/enrollments/${studentId}/${courseSectionId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      await handleResponse(response);

      await Promise.all([
        refreshCourseSections(),
        fetchSectionStudents(courseSectionId),
      ]);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------
  // TIMETABLE
  // -----------------------------

  const createTimetable = async (timetableData) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/admin/timetables`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(timetableData),
      });

      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const fetchTimetable = async (sectionId) => {
    const response = await fetch(
      `${API_URL}/admin/course-sections/${sectionId}/timetables`,
      {
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

  const deleteTimetable = async (timetableId) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/admin/timetables/${timetableId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------
  // ATTENDANCE
  // -----------------------------

  const fetchAttendance = useCallback(async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.section_id) {
      params.append("section_id", filters.section_id);
    }

    if (filters.student_id) {
      params.append("student_id", filters.student_id);
    }

    if (filters.teacher_id) {
      params.append("teacher_id", filters.teacher_id);
    }

    if (filters.attendance_date) {
      params.append("attendance_date", filters.attendance_date);
    }

    if (filters.status) {
      params.append("status", filters.status);
    }

    const query = params.toString();

    const response = await fetch(
      `${API_URL}/admin/attendance${query ? `?${query}` : ""}`,
      {
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  }, [API_URL]);

  const refreshAttendance = useCallback(
    async (filters = {}) => {
      const data = await fetchAttendance(filters);

      setAttendance(data);

      return data;
    },
    [fetchAttendance]
  );

  const updateAttendance = async (attendanceId, attendanceStatus) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/admin/attendance/${attendanceId}`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            status: attendanceStatus,
          }),
        }
      );

      const data = await handleResponse(response);

      setAttendance((prev) =>
        prev.map((record) =>
          record.id === attendanceId ? data : record
        )
      );

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------
  // REFRESH FUNCTIONS
  // -----------------------------

  const refreshTeachers = useCallback(async () => {
    const data = await fetchTeachers();

    setTeachers(data);

    return data;
  }, [fetchTeachers]);

  const refreshPendingTeachers = useCallback(async () => {
    const data = await fetchPendingTeachers();

    setPendingTeachers(data);

    return data;
  }, [fetchPendingTeachers]);

  const refreshSubjects = useCallback(async () => {
    const data = await fetchSubjects();

    setSubjects(data);

    return data;
  }, [fetchSubjects]);

  const refreshAdminData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        teachersData,
        pendingTeachersData,
        studentsData,
        subjectsData,
        courseSectionsData,
      ] = await Promise.all([
        fetchTeachers(),
        fetchPendingTeachers(),
        fetchStudents(),
        fetchSubjects(),
        fetchCourseSections(),
      ]);

      setTeachers(teachersData);
      setPendingTeachers(pendingTeachersData);
      setStudents(studentsData);
      setSubjects(subjectsData);
      setCourseSections(courseSectionsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    fetchTeachers,
    fetchPendingTeachers,
    fetchStudents,
    fetchSubjects,
    fetchCourseSections,
  ]);

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  return (
    <AdminContext.Provider
      value={{
        // Data
        teachers,
        pendingTeachers,
        students,
        subjects,
        courseSections,
        attendance,
        sectionStudents,
        selectedSection,

        // State
        loading,
        actionLoading,
        error,

        // Refresh
        refreshAdminData,
        refreshTeachers,
        refreshPendingTeachers,
        refreshStudents,
        refreshSubjects,
        refreshCourseSections,
        refreshAttendance,

        // Teachers
        approveTeacher,
        rejectTeacher,

        // Subjects
        createSubject,

        // Courses
        createCourseSection,

        // Students / Sections
        fetchSectionStudents,

        // Enrollments
        enrollStudent,
        deleteEnrollment,

        // Timetable
        createTimetable,
        fetchTimetable,
        deleteTimetable,

        // Attendance
        fetchAttendance,
        updateAttendance,

        // Error
        setError,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
