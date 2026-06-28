import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
export const metadata: Metadata = { title:'강남구상공회 회원사', description:'Private Gangnam Chamber member company directory', manifest:'/manifest.json', appleWebApp:{capable:true,title:'강남구상공회 회원사',statusBarStyle:'black-translucent'} };
export const viewport: Viewport = { themeColor:'#0b1f3a', width:'device-width', initialScale:1 };
export default function RootLayout({children}:{children:ReactNode}){return <html lang="ko"><body className="min-h-screen font-sans antialiased">{children}</body></html>}
