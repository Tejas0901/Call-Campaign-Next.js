import { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { RequireRole } from "@/components/auth/ProtectedRoute";
import { ROLES } from "@/context/auth-context";

export default function CreateUserLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <RequireRole requiredRole={ROLES.ADMIN}>{children}</RequireRole>
    </AuthProvider>
  );
}
