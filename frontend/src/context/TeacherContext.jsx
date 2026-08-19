"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export const TeacherContext = createContext();

export function TeacherProvider({ children }) {
  const router = useRouter();

  const [teacher, setTeacher] = useState(null);
  const [courseSections, setCourseSections] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // Students loaded for the currently selected course section.
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function getToken() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/auth");
      return null;
    }

    return token;
  }

  /*
   * ==========================================
   * TEACHER PROFILE
   * ==========================================
   */

  async function refreshTeacher() {
    const token = getToken();

    if (!token) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/teachers/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      router.replace("/auth");
      return;
    }

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to load teacher information."
      );
    }

    setTeacher(data);

    return data;
  }

  /*
   * ==========================================
   * COURSE SECTIONS
   * ==========================================
   */

  async function refreshCourseSections() {
    const token = getToken();

    if (!token) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/teachers/me/course-sections`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to load course sections."
      );
    }

    setCourseSections(data);

    return data;
  }

  /*
   * ==========================================
   * TIMETABLE
   * ==========================================
   */

  async function refreshTimetable() {
    const token = getToken();

    if (!token) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/teachers/timetables`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to load timetable."
      );
    }

    setTimetable(data);

    return data;
  }

  /*
   * ==========================================
   * ATTENDANCE
   * ==========================================
   */

  async function refreshAttendance(sectionId = null) {
    const token = getToken();

    if (!token) return;

    const url = sectionId
      ? `${process.env.NEXT_PUBLIC_API_URL}/teachers/attendance?section_id=${sectionId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/teachers/attendance`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to load attendance."
      );
    }

    setAttendance(data);

    return data;
  }

  /*
   * ==========================================
   * STUDENTS OF A COURSE SECTION
   * ==========================================
   */

  async function fetchStudents(sectionId) {
    const token = getToken();

    if (!token) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/teachers/me/course-sections/${sectionId}/students`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to load students."
      );
    }

    setStudents(data);

    return data;
  }

  /*
   * ==========================================
   * MARK ATTENDANCE
   * ==========================================
   */

  async function markAttendance(payload) {
    const token = getToken();

    if (!token) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/teachers/attendance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      let message = "Failed to mark attendance.";

      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail
          .map((error) => {
            if (typeof error === "string") {
              return error;
            }

            return error.msg || "Invalid attendance data.";
          })
          .join(", ");
      }

      throw new Error(message);
    }

    setAttendance((current) => [
      ...current,
      data,
    ]);

    return data;
  }

  /*
   * ==========================================
   * UPDATE ATTENDANCE
   * ==========================================
   */

  async function updateAttendance(attendanceId, payload) {
    const token = getToken();

    if (!token) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/teachers/attendance/${attendanceId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to update attendance."
      );
    }

    /*
     * The PATCH endpoint returns the complete
     * TeacherAttendanceResponse.
     *
     * Replace only the updated record.
     */
    setAttendance((current) =>
      current.map((item) =>
        item.id === attendanceId
          ? data
          : item
      )
    );

    return data;
  }

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  async function fetchTeacherData() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      await Promise.all([
        refreshTeacher(),
        refreshCourseSections(),
        refreshTimetable(),
        refreshAttendance(),
      ]);
    } catch (err) {
      setError(
        err.message || "Unable to load teacher data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeacherData();
  }, []);

  return (
    <TeacherContext.Provider
      value={{
        teacher,
        courseSections,
        timetable,
        attendance,
        students,

        loading,
        error,

        fetchTeacherData,
        refreshTeacher,
        refreshCourseSections,
        refreshTimetable,
        refreshAttendance,
        fetchStudents,
        markAttendance,
        updateAttendance,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
}

/*
 * ==========================================
 * CUSTOM HOOK
 * ==========================================
 */

export function useTeacher() {
  const context = useContext(TeacherContext);

  if (!context) {
    throw new Error(
      "useTeacher must be used inside TeacherProvider"
    );
  }

  return context;
}
