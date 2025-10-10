import ProtectedLayout from "@/components/Layout/ProtectedLayout";

export default function TaskerssLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
