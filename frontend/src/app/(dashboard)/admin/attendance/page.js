"use client";

import { useContext, useEffect, useState } from "react";
import { AdminContext } from "@/context/AdminContext";

const ATTENDANCE_STATUSES = ["present", "absent"];

export default function AdminAttendance() {
  const {
    students,
    teachers,
    courseSections,
    attendance,
    refreshAttendance,
    updateAttendance,
    actionLoading,
    error,
    setError,
  } = useContext(AdminContext);

  const [filters, setFilters] = useState({
    student_id: "",
    section_id: "",
    teacher_id: "",
    attendance_date: "",
    status: "",
  });

  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [attendanceError, setAttendanceError] = useState(null);

  useEffect(() => {
    loadAttendance();
  }, []);

  const getErrorMessage = (err) => {
    if (!err) {
      return "Something went wrong.";
    }

    if (typeof err === "string") {
      return err;
    }

    if (err instanceof Error) {
      return err.message;
    }

    if (typeof err === "object") {
      if (typeof err.detail === "string") {
        return err.detail;
      }

      if (Array.isArray(err.detail)) {
        return err.detail
          .map((item) => item.msg || "Invalid request")
          .join(", ");
      }

      if (typeof err.message === "string") {
        return err.message;
      }

      return "Something went wrong. Please try again.";
    }

    return String(err);
  };

  const loadAttendance = async (currentFilters = filters) => {
    setLoadingAttendance(true);
    setAttendanceError(null);
    setError(null);

    try {
      await refreshAttendance(currentFilters);
    } catch (err) {
      setAttendanceError(getErrorMessage(err));
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = async () => {
    await loadAttendance(filters);
  };

  const handleResetFilters = async () => {
    const emptyFilters = {
      student_id: "",
      section_id: "",
      teacher_id: "",
      attendance_date: "",
      status: "",
    };

    setFilters(emptyFilters);

    await loadAttendance(emptyFilters);
  };

  const isOlderThanSevenDays = (attendanceDate) => {
    const today = new Date();
    const date = new Date(attendanceDate);

    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const difference =
      (today - date) / (1000 * 60 * 60 * 24);

    return difference > 7;
  };

  const handleStatusChange = async (attendanceId, newStatus) => {
    setEditingId(attendanceId);
    setAttendanceError(null);
    setError(null);

    try {
      await updateAttendance(attendanceId, newStatus);
    } catch (err) {
      setAttendanceError(getErrorMessage(err));
    } finally {
      setEditingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    return new Date(dateTime).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatStatus = (status) => {
    if (!status) {
      return "—";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    );
  };

  const getStatusClass = (status) => {
    if (status === "present") {
      return "border-green-200 bg-green-50 text-green-700";
    }

    if (status === "absent") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-gray-200 bg-gray-50 text-gray-700";
  };

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage student attendance records.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label
              htmlFor="student_id"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Student
            </label>

            <select
              id="student_id"
              name="student_id"
              value={filters.student_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400"
            >
              <option value="">All Students</option>

              {students.map((student) => (
                <option
                  key={student.student_id ?? student.id}
                  value={student.student_id ?? student.id}
                >
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="section_id"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Course Section
            </label>

            <select
              id="section_id"
              name="section_id"
              value={filters.section_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400"
            >
              <option value="">All Course Sections</option>

              {courseSections.map((course) => (
                <option
                  key={course.course_section_id}
                  value={course.course_section_id}
                >
                  {course.subject_code} - Section{" "}
                  {course.section_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="teacher_id"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Teacher
            </label>

            <select
              id="teacher_id"
              name="teacher_id"
              value={filters.teacher_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400"
            >
              <option value="">All Teachers</option>

              {teachers.map((teacher) => (
                <option
                  key={teacher.teacher_id}
                  value={teacher.teacher_id}
                >
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="attendance_date"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Date
            </label>

            <input
              id="attendance_date"
              name="attendance_date"
              type="date"
              value={filters.attendance_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400"
            >
              <option value="">All Statuses</option>

              {ATTENDANCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loadingAttendance}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={loadingAttendance}
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAttendance ? "Loading..." : "Apply Filters"}
          </button>
        </div>
      </div>

      {attendanceError && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to update attendance
            </p>

            <p className="mt-1 text-sm text-red-600">
              {attendanceError}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAttendanceError(null)}
            className="ml-4 text-sm font-medium text-red-700 hover:text-red-900"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loadingAttendance ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500">
              Loading attendance...
            </p>
          </div>
        ) : attendance.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-gray-900">
              No attendance records found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Course
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Teacher
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Marked At
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {attendance.map((record) => {
                  const isOld = isOlderThanSevenDays(record.date);

                  return (
                    <tr
                      key={record.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {record.student_name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {record.student_email}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {record.subject_code}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {record.subject_name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Section {record.section_name}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {record.teacher_name}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(record.date)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDateTime(record.marked_at)}
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <select
                            value={record.status}
                            onChange={(event) =>
                              handleStatusChange(
                                record.id,
                                event.target.value
                              )
                            }
                            disabled={
                              isOld ||
                              (actionLoading &&
                                editingId === record.id)
                            }
                            title={
                              isOld
                                ? "Attendance can only be updated within 7 days"
                                : ""
                            }
                            className={`rounded-full border px-3 py-1.5 text-sm font-medium outline-none transition ${getStatusClass(
                              record.status
                            )} ${
                              isOld
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            }`}
                          >
                            {ATTENDANCE_STATUSES.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {formatStatus(status)}
                                </option>
                              )
                            )}
                          </select>

                          {isOld && (
                            <p className="mt-1 text-xs text-gray-400">
                              Locked after 7 days
                            </p>
                          )}

                          {editingId === record.id &&
                            actionLoading && (
                              <p className="mt-1 text-xs text-gray-500">
                                Updating...
                              </p>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}