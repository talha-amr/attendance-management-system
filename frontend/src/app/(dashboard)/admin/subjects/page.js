"use client";

import { useContext, useMemo, useState ,useEffect} from "react";
import { AdminContext } from "@/context/AdminContext";
import SubjectModal from "@/components/admin/SubjectModal";

export default function AdminSubjects() {
  const {
    subjects,
    loading,
    actionLoading,
    error,
    createSubject,
    setError
  } = useContext(AdminContext);
useEffect(() => {

    return () => {

        setError(null);

    };

}, []); 
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSubjects = useMemo(() => {
    if (!search.trim()) {
      return subjects;
    }

    const query = search.toLowerCase().trim();

    return subjects.filter((subject) => {
      return (
        subject.name?.toLowerCase().includes(query) ||
        subject.code?.toLowerCase().includes(query)
      );
    });
  }, [subjects, search]);

  const handleCreateSubject = async (subjectData) => {
    await createSubject(subjectData);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Subjects
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the subjects available in the system.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + Add Subject
        </button>
      </div>

      {/* Search and Count */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by subject name or code..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 sm:max-w-md"
        />

        <p className="text-sm text-gray-500">
          Total Subjects:{" "}
          <span className="font-semibold text-gray-900">
            {subjects.length}
          </span>
        </p>
      </div>

      {/* Error */}
      {!loading && error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            Loading subjects...
          </p>
        </div>
      ) : (
        /* Subjects Table */
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Code
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Subject Name
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => (
                    <tr
                      key={subject.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {subject.code}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {subject.name}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      {search
                        ? "No subjects match your search."
                        : "No subjects found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Subject Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubject}
        actionLoading={actionLoading}
      />
    </div>
  );
}