import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-[#f8f9fc] py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          
          <div className="flex items-center gap-3">
            <span className="h-4 w-4 rounded-full bg-indigo-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              CampusFlow
            </span>
          </div>

          <nav className="flex gap-8">
            <Link href="#" className="text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
              Features
            </Link>
            <Link href="#" className="text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
              Pricing
            </Link>
            <Link href="#" className="text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
              Support
            </Link>
            <Link href="#" className="text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
              Privacy Policy
            </Link>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} CampusFlow Academic Management Platform. All rights reserved.
          </p>
          <p className="text-sm font-medium text-slate-400">
            Built for modern educators.
          </p>
        </div>
      </div>
    </footer>
  );
}