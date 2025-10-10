// app/dashboard/layout.tsx
import ProtectedLayout from "@/components/Layout/ProtectedLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
