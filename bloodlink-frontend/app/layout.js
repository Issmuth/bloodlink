import '../styles/globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { DarkModeProvider } from '../contexts/DarkModeContext'

export const metadata = {
  title: 'Bloodlink - Blood Donor Platform | Donate Blood, Save Lives',
  description: 'Connect hospitals with nearby donors in seconds. Join our mission to make blood donation faster, easier, and more impactful than ever before.',
  keywords: 'blood donation, donate blood, blood donor, hospital, emergency, save lives, blood bank',
  authors: [{ name: 'Bloodlink Blood Donor Platform' }],

  // Open Graph / Facebook
  openGraph: {
    type: 'website',
    url: 'https://Bloodlink.org/',
    title: 'Bloodlink - Blood Donor Platform | Donate Blood, Save Lives',
    description: 'Connect hospitals with nearby donors in seconds. Join our mission to make blood donation faster, easier, and more impactful.',
    images: ['/og-image.jpg'],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    url: 'https://Bloodlink.org/',
    title: 'Bloodlink - Blood Donor Platform | Donate Blood, Save Lives',
    description: 'Connect hospitals with nearby donors in seconds. Join our mission to make blood donation faster, easier, and more impactful.',
    images: ['/twitter-image.jpg'],
  },

  // Icons and manifest
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen">
        <DarkModeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  )
} 
