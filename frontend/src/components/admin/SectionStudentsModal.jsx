"use client";

export default function SectionStudentsModal({
  isOpen,
  onClose,
  course,
  students,
  selectedSection,
  onDelete,
  actionLoading,
}) {
  if (!isOpen || !course) {
    return null;
  }

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Remove ${student.name} from ${course.subject_code} - Section ${course.section_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await onDelete(
        student.student_id,
        course.course_section_id
      );
    } catch (err) {
      // Error is already handled by AdminContext.
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-xl bg-white shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {course.subject_code} - Section {course.section_name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {course.subject_name} · {course.teacher_name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="text-xl text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
          >
            ×
          </button>
        </div>

        {/* Student Count */}
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-500">
            Enrolled Students:{" "}
            <span className="font-semibold text-gray-900">
              {students.length}
            </span>
          </p>
        </div>

        {/* Students */}
        <div className="max-h-[60vh] overflow-y-auto">
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Student ID
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Enrolled At
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr
                      key={student.student_id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {student.student_id}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.name}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.email}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(student.enrolled_at)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(student)}
                          disabled={
                            actionLoading ||
                            selectedSection !==
                              course.course_section_id
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">
                No students are enrolled in this section.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}