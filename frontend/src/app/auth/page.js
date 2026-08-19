import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function HomePage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}