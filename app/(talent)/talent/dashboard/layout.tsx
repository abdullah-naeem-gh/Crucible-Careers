import Chatbot from '@/components/talent/ai/Chatbot'
import DashboardThemeProvider from '@/components/shared/theme/DashboardThemeProvider'

export default function TalentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardThemeProvider defaultTheme="light" storageKey="crucible-talent-dashboard-theme">
      {children}
      <Chatbot />
    </DashboardThemeProvider>
  )
}
