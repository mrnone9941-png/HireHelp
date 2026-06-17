import type { Metadata } from "next";
import "./globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata: Metadata = {
  title: "HireHelp",
  description: "Practice interviews, get thoughtful feedback, and build confidence with HireHelp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Replace with real client ID from env or placeholders if not available
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id';

  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={clientId}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
