import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'강남구상공회 CEO과정 회원검색', description:'Private Gangnam CEO course member directory', manifest:'/manifest.json', appleWebApp:{capable:true,title:'CEO Directory',statusBarStyle:'black-translucent'} };
export const viewport: Viewport = { themeColor:'#0b1f3a', width:'device-width', initialScale:1 };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body className="min-h-screen font-sans antialiased">{children}</body></html>}
