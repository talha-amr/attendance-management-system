"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
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
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/students/me/enrollments`,
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/students/course-sections`,
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/students/timetables`,
          {
            method: "GET",
            headers,
          }
        ),
      ]);

      const enrollmentData =
        await enrollmentResponse.json();

      const coursesData =
        await coursesResponse.json();

      const timetableData =
        await timetableResponse.json();

      if (!enrollmentResponse.ok) {
        throw new Error(
          enrollmentData.detail ||
            "Failed to load enrollments"
        );
      }

      if (!coursesResponse.ok) {
        throw new Error(
          coursesData.detail ||
            "Failed to load available courses"
        );
      }

      if (!timetableResponse.ok) {
        throw new Error(
          timetableData.detail ||
            "Failed to load timetable"
        );
      }

      setEnrollments(enrollmentData);
      setAvailableCourses(coursesData);
      setTimetable(timetableData);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load student data."
      );
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

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        router.replace("/auth");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/students/attendance`,
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
          data.detail ||
            "Failed to load attendance"
        );
      }

      setAttendance(data);
    } catch (err) {
      setError(
        err.message ||
          "Failed to refresh attendance"
      );
    }
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
