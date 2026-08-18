"use client";

import { useContext, useMemo, useState ,useEffect} from "react";
import { AdminContext } from "@/context/AdminContext";

export default function AdminStudents() {
  const {
    students,
    loading,
    error,
    setError
  } = useContext(AdminContext);
useEffect(() => {

    return () => {

        setError(null);

    };

}, []); 
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    if (!search.trim()) {
      return students;
    }

    const query = search.toLowerCase().trim();

    return students.filter((student) => {
      return (
        String(student.student_id ?? "")
          .toLowerCase()
          .includes(query) ||
        student.name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query)
      );
    });
  }, [students, search]);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Students
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View all registered students.
          </p>
        </div>

        <p className="text-sm text-gray-500">
          Total Students:{" "}
          <span className="font-semibold text-gray-900">
            {students.length}
          </span>
        </p>
      </div>

      {/* Search */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="Search by name, email or student ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 sm:max-w-md"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            Loading students...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Students Table */}
      {!loading && !error && (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
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
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      {search
                        ? "No students match your search."
                        : "No students found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}