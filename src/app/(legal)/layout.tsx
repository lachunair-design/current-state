export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      {children}
    </div>
  )
}
