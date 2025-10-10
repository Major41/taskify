import ProtectedLayout from "@/components/Layout/ProtectedLayout";

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
