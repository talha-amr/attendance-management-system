import Navbar from "@/components/Navbar";
import { StudentProvider } from "@/context/StudentContext";

export default function StudentLayout({ children }) {
  return (
    <StudentProvider>
      <Navbar role="student" />
      {children}
    </StudentProvider>
  );
}