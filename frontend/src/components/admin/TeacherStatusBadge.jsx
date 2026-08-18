export default function TeacherStatusBadge({ status }) {
  const normalizedStatus = status?.toUpperCase();

  const styles = {
    APPROVED: "bg-emerald-50 text-emerald-600",
    PENDING: "bg-amber-50 text-amber-600",
    REJECTED: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
        styles[normalizedStatus] || "bg-slate-100 text-slate-500"
      }`}
    >
      {normalizedStatus || "UNKNOWN"}
    </span>
  );
}