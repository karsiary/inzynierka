import "./globals.css"

export const metadata = {
  title: "AudioPlan",
  description: "Zarządzanie projektami muzycznymi",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans&family=Roboto&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

