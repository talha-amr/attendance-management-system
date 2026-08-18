"use client";

import { useContext, useEffect, useState } from "react";
import { AdminContext } from "@/context/AdminContext";
import TimetableModal from "@/components/admin/TimetableModal";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function AdminTimetable() {
  const {
    courseSections,
    fetchTimetable,
    createTimetable,
    deleteTimetable,
    actionLoading,
    error,
    setError,

  } = useContext(AdminContext);

  const [selectedSection, setSelectedSection] = useState("");
  const [timetable, setTimetable] = useState([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
useEffect(() => {
  setError(null);
}, [setError]);
  useEffect(() => {
    if (courseSections.length > 0 && !selectedSection) {
      setSelectedSection(String(courseSections[0].course_section_id));
    }
  }, [courseSections, selectedSection]);

  useEffect(() => {
    if (!selectedSection) {
      setTimetable([]);
      return;
    }

    const loadTimetable = async () => {
      setLoadingTimetable(true);

      try {
        const data = await fetchTimetable(Number(selectedSection));
        setTimetable(data);
      } catch (err) {
        setTimetable([]);
      } finally {
        setLoadingTimetable(false);
      }
    };

    loadTimetable();
  }, [selectedSection, fetchTimetable]);

  const selectedCourse = courseSections.find(
    (course) =>
      course.course_section_id === Number(selectedSection)
  );

  const handleCreate = async (formData) => {
    await createTimetable({
      course_section_id: Number(selectedSection),
      day_of_week: formData.day_of_week,
      start_time: formData.start_time,
      end_time: formData.end_time,
    });

    const data = await fetchTimetable(Number(selectedSection));

    setTimetable(data);

    setIsModalOpen(false);
  };

  const handleDelete = async (timetableId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this timetable entry?"
    );

    if (!confirmed) {
      return;
    }

    await deleteTimetable(timetableId);

    const data = await fetchTimetable(Number(selectedSection));

    setTimetable(data);
  };

  const formatTime = (time) => {
    if (!time) {
      return "—";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDay = (day) => {
    if (!day) {
      return "—";
    }

    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const sortedTimetable = [...timetable].sort((a, b) => {
    const dayA = DAYS.indexOf(a.day_of_week);
    const dayB = DAYS.indexOf(b.day_of_week);

    if (dayA !== dayB) {
      return dayA - dayB;
    }

    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Timetable
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage timetable entries for course sections.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={!selectedSection || actionLoading}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add Class
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Course Section Selector */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <label
          htmlFor="course-section"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Course Section
        </label>

        <select
          id="course-section"
          value={selectedSection}
          onChange={(event) =>
            setSelectedSection(event.target.value)
          }
          className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
        >
          <option value="">Select a course section</option>

          {courseSections.map((course) => (
            <option
              key={course.course_section_id}
              value={course.course_section_id}
            >
              {course.subject_code} - Section {course.section_name}
              {" | "}
              {course.teacher_name}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Course Information */}
      {selectedCourse && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Subject
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {selectedCourse.subject_name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Code
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {selectedCourse.subject_code}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Section
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {selectedCourse.section_name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Teacher
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {selectedCourse.teacher_name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timetable */}
      <div className="mt-6">
        {loadingTimetable ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">
              Loading timetable...
            </p>
          </div>
        ) : !selectedSection ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">
              Select a course section to view its timetable.
            </p>
          </div>
        ) : sortedTimetable.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-gray-900">
              No timetable entries
            </p>

            <p className="mt-1 text-sm text-gray-500">
              This course section does not have any classes
              scheduled yet.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Day
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Start Time
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      End Time
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Subject
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Teacher
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {sortedTimetable.map((entry) => (
                    <tr
                      key={entry.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatDay(entry.day_of_week)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatTime(entry.start_time)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatTime(entry.end_time)}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.subject_code}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {entry.subject_name}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {entry.teacher_name}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          disabled={actionLoading}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <TimetableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        actionLoading={actionLoading}
      />
    </div>
  );
}