import TeacherManagement from "@/components/TeacherManagement";
import Navbar from "@/components/Navbar";

export default function AdminDashboardPage() {
  return (
    <>
    <Navbar/>
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <TeacherManagement />
      </div>
    </main>
    </>
  );
}