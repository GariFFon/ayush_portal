// The sidebar/header shell now lives in the root layout (components/shell-gate.tsx)
// so it stays mounted across all signed-in pages.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
