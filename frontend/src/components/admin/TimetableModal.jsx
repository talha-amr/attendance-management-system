"use client";

import { useEffect, useState } from "react";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function TimetableModal({
  isOpen,
  onClose,
  onSubmit,
  actionLoading,
}) {
  const [formData, setFormData] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        day_of_week: "",
        start_time: "",
        end_time: "",
      });

      setError("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.day_of_week) {
      setError("Please select a day.");
      return;
    }

    if (!formData.start_time) {
      setError("Please select a start time.");
      return;
    }

    if (!formData.end_time) {
      setError("Please select an end time.");
      return;
    }

    if (formData.start_time >= formData.end_time) {
      setError("End time must be after start time.");
      return;
    }

    setError("");

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(
        err.message || "Failed to create timetable entry."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add Timetable Entry
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Schedule a class for the selected course section.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Day */}
          <div>
            <label
              htmlFor="day_of_week"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Day
            </label>

            <select
              id="day_of_week"
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              disabled={actionLoading}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 disabled:bg-gray-100"
            >
              <option value="">Select a day</option>

              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div>
            <label
              htmlFor="start_time"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Start Time
            </label>

            <input
              id="start_time"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleChange}
              disabled={actionLoading}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 disabled:bg-gray-100"
            />
          </div>

          {/* End Time */}
          <div>
            <label
              htmlFor="end_time"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              End Time
            </label>

            <input
              id="end_time"
              name="end_time"
              type="time"
              value={formData.end_time}
              onChange={handleChange}
              disabled={actionLoading}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 disabled:bg-gray-100"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}