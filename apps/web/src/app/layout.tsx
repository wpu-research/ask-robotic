import type { ReactNode } from 'react'

export const metadata = {
  title: 'ASK Robotic',
  description: "0'dan AI Robotik Mühendisliğine",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <style>{`
          .lesson-md pre { background: #f4f4f5; padding: 12px; overflow-x: auto; border-radius: 6px; font-size: 15px; line-height: 1.45; }
          .lesson-md code { font-family: ui-monospace, monospace; }
          .lesson-md :not(pre) > code { background: #f4f4f5; padding: 1px 4px; border-radius: 4px; }
          .lesson-md table { border-collapse: collapse; margin: 12px 0; display: block; overflow-x: auto; }
          .lesson-md th, .lesson-md td { border: 1px solid #d4d4d8; padding: 6px 10px; text-align: left; }
          .lesson-md th { background: #fafafa; }
        `}</style>
      </head>
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>{children}</body>
    </html>
  )
}
