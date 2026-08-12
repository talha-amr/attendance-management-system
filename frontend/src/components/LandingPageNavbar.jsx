import Link from "next/link";

export default function LandingPageNavbar() {
  return (
    <header className=" w-full">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="group">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            School <span className="text-indigo-600">Attendance</span>
          </h1>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
            Attendance Tracking System
          </p>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            Features
          </a>

          <a
            href="#roles"
            className="text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            For Everyone
          </a>

          <Link
            href="/auth"
            className="text-sm font-semibold text-slate-700 transition hover:text-indigo-600"
          >
            Sign In
          </Link>

          <Link
            href="/auth?mode=signup"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Get Started
          </Link>
        </nav>

        <Link
          href="/auth"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white md:hidden"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}