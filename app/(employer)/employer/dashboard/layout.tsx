import DashboardThemeProvider from '@/components/shared/theme/DashboardThemeProvider'

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardThemeProvider defaultTheme="dark" storageKey="crucible-employer-dashboard-theme">
      {children}
    </DashboardThemeProvider>
  )
}
