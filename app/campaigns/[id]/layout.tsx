import { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { RequireAuth } from "@/components/auth/ProtectedRoute";

export default function CampaignDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <RequireAuth>{children}</RequireAuth>
    </AuthProvider>
  );
}
