import './styles/globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BSSA Media Portal',
  description: 'Media upload and download portal for BSSA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 