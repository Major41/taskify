import ProtectedLayout from "@/components/Layout/ProtectedLayout";

export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
