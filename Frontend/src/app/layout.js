import './globals.css';

export const metadata = {
  title: 'Arrow Puzzle Game',
  description: 'Addictive directional maze puzzle game with arrows',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <div className="app-viewport-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
