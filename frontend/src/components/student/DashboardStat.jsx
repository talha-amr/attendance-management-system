export default function DashboardStat({
  label,
  value,
  description,
  highlight = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${
          highlight ? "text-indigo-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-slate-400">
        {description}
      </p>
    </div>
  );
}