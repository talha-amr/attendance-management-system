"use client";

import Navbar from "@/components/Navbar";
import { TeacherProvider } from "@/context/TeacherContext";

export default function TeacherLayout({ children }) {
  return (
    <TeacherProvider>
      <Navbar role="teacher" />
      {children}
    </TeacherProvider>
  );
}