export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sunset-50 via-bg-primary to-ocean-50 text-text-primary">
      {children}
    </div>
  )
}
