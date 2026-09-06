import './globals.css';
import PwaRegister from '../components/PwaRegister';

export const metadata = {
  title: 'Arrow Puzzle Game',
  description: 'Addictive directional maze puzzle game with arrows. Play online or offline.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Arrow Puzzle'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#236ff4'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#236ff4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Arrow Puzzle" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="192x192" />
      </head>
      <body>
        <div className="app-viewport-wrapper">
          <PwaRegister />
          {children}
        </div>
      </body>
    </html>
  );
}
