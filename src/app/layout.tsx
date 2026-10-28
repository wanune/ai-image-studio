import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Image Studio - AI 图片生成',
  description: '通过文字描述生成高质量图片，AI 驱动的创作工具',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
