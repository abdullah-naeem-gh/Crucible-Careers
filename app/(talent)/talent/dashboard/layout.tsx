import Chatbot from '@/components/talent/ai/Chatbot'

export default function TalentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Chatbot />
    </>
  )
}
