"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const StudentContext = createContext();

export function StudentProvider({ children }) {
  const router = useRouter();

  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // REFRESH STUDENT DATA
  // ==========================================
  // Refreshes data affected by enrollment changes:
  // - Enrollments
  // - Available course sections
  // - Timetable

  async function refreshStudentData() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/auth");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        enrollmentResponse,
        coursesResponse,
        timetableResponse,
      ] = await Promise.all([
        fetch("http://127.0.0.1:8000/students/me/enrollments", {
          method: "GET",
          headers,
        }),

        fetch("http://127.0.0.1:8000/students/course-sections", {
          method: "GET",
          headers,
        }),

        fetch("http://127.0.0.1:8000/students/timetables", {
          method: "GET",
          headers,
        }),
      ]);

      const enrollmentData = await enrollmentResponse.json();
      const coursesData = await coursesResponse.json();
      const timetableData = await timetableResponse.json();

      if (!enrollmentResponse.ok) {
        throw new Error(
          enrollmentData.detail || "Failed to load enrollments"
        );
      }

      if (!coursesResponse.ok) {
        throw new Error(
          coursesData.detail || "Failed to load available courses"
        );
      }

      if (!timetableResponse.ok) {
        throw new Error(
          timetableData.detail || "Failed to load timetable"
        );
      }

      setEnrollments(enrollmentData);
      setAvailableCourses(coursesData);
      setTimetable(timetableData);
    } catch (err) {
      setError(err.message || "Unable to load student data.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // REFRESH ATTENDANCE
  // ==========================================

  async function refreshAttendance() {
    try {
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/auth");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/students/attendance",
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
          data.detail || "Failed to load attendance"
        );
      }

      setAttendance(data);
    } catch (err) {
      setError(err.message || "Failed to refresh attendance");
    }
  }

  // ==========================================
  // GET ATTENDANCE BY COURSE SECTION
  // ==========================================
  // Used when the student opens a specific
  // course's attendance details.

  async function getAttendanceBySection(sectionId) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/auth");
      return;
    }

    const response = await fetch(
      `http://127.0.0.1:8000/students/attendance?section_id=${sectionId}`,
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
        data.detail || "Failed to load course attendance"
      );
    }

    return data;
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    async function loadStudentData() {
      await Promise.all([
        refreshStudentData(),
        refreshAttendance(),
      ]);
    }

    loadStudentData();
  }, []);

  return (
    <StudentContext.Provider
      value={{
        // Student data
        enrollments,
        availableCourses,
        timetable,
        attendance,

        // State
        loading,
        error,

        // Refresh functions
        refreshStudentData,
        refreshAttendance,
        getAttendanceBySection,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================

export function useStudent() {
  const context = useContext(StudentContext);

  if (!context) {
    throw new Error(
      "useStudent must be used inside StudentProvider"
    );
  }

  return context;
}