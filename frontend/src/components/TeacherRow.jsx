
export default function TeacherRow({
  teacher,
  onStatusChange,
  processing,
}) {
  const registeredDate = new Date(
    teacher.created_at
  ).toLocaleDateString();

  const status = teacher.approval_status.toUpperCase();

  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const statusClass =
    statusStyles[status] ?? "bg-slate-100 text-slate-700";

  const handleChange = (event) => {
    const newStatus = event.target.value;

    if (newStatus !== status) {
      onStatusChange(teacher.id, newStatus);
    }
  };
  return (
    <tr  className="text-sm">
      <td className="px-5 py-4">
        <div>
          <p className="font-semibold text-slate-900">
            {teacher.user.name}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Teacher ID: {teacher.id}
          </p>
        </div>
      </td>

      <td className="px-5 py-4 text-slate-600">
        {teacher.user.email}
      </td>

      <td className="px-5 py-4 text-slate-600">
        {registeredDate}
      </td>

      <td className="px-5 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          {status}
        </span>
      </td>

      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {processing && (
            <span className="text-xs text-slate-500">
              Updating...
            </span>
          )}

          <select
            value={status}
            disabled={processing}
            onChange={handleChange}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="PENDING" disabled>
              Pending
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </select>
        </div>
      </td>
    </tr>
  );
}