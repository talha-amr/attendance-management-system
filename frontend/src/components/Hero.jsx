import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-8 lg:px-10">
        
        {/* Left Side: Copy & Calls to Action */}
        <div className="flex flex-col justify-center">
          
          {/* Eyebrow Label */}
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#5B45FF]" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#5B45FF]">
              Attendance Tracking System
            </p>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl font-black leading-[1.1] text-slate-900 sm:text-6xl lg:text-[4.5rem]">
            Your Institution.
            <br />
            <span className="text-[#5B45FF]">One system.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-500 sm:text-lg">
            Manage students, teachers, courses, enrollments, timetables,
            and attendance from one straightforward academic platform.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/auth?mode=signup"
              className="flex items-center justify-center rounded-xl bg-[#5B45FF] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#4f3bea]"
            >
              Get Started
            </Link>

            <Link
              href="/auth"
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Side: Mock UI Presentation */}
        <div className="hidden w-full items-center justify-end lg:flex">
          <div className="w-full max-w-[420px]">
            
            {/* Main Blue Presentation Container */}
            <div className="rounded-[2.5rem] bg-[#5B45FF] p-6 shadow-2xl shadow-[#5B45FF]/10">
              
              {/* Inner White Dashboard Card */}
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Overview
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Today's Attendance
                    </h2>
                  </div>

                  <div className="rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-[#5B45FF]">
                    Today
                  </div>
                </div>

                {/* Attendance Stats Section */}
                <div className="mt-6 flex items-center gap-6">
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-indigo-50">
                    <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="42%"
                        className="fill-none stroke-[#5B45FF] stroke-[10px]"
                        strokeDasharray="100 100"
                        strokeDashoffset="14"
                      />
                    </svg>

                    <div className="z-10 text-center">
                      <p className="text-xl font-black text-slate-900">
                        86%
                      </p>

                      <p className="text-[9px] font-semibold text-slate-400">
                        Present
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400">
                        Total Students
                      </p>

                      <p className="text-lg font-bold text-slate-900">
                        248
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-400">
                        Absent Today
                      </p>

                      <p className="text-lg font-bold text-slate-900">
                        35
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subject List */}
                <div className="mt-6 space-y-2">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <p className="text-xs font-bold text-slate-600">
                      Course Attendance
                    </p>

                    <p className="text-[10px] font-semibold text-slate-400">
                      This week
                    </p>
                  </div>

                  {[
                    ["Software Engineering", "94%"],
                    ["Database Systems", "88%"],
                    ["Web Engineering", "81%"],
                  ].map(([subject, percentage]) => (
                    <div
                      key={subject}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <span className="text-xs font-semibold text-slate-700">
                        {subject}
                      </span>

                      <span className="text-xs font-bold text-[#5B45FF]">
                        {percentage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}