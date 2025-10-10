import ProtectedLayout from "@/components/Layout/ProtectedLayout";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
