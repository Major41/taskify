import ProtectedLayout from "@/components/Layout/ProtectedLayout";

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
