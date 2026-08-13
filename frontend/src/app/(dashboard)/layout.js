import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <main>{children}</main>
    </AuthProvider>
  );
}