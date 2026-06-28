'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
export function AuthGate({children, admin=false}:{children:React.ReactNode;admin?:boolean}){const r=useRouter();const [ok,setOk]=useState(false);useEffect(()=>{const s=createClient();s.auth.getUser().then(async({data})=>{if(!data.user){r.replace('/login');return} if(admin){const {data:p}=await s.from('profiles').select('is_admin').eq('id',data.user.id).single(); if(!p?.is_admin){r.replace('/dashboard');return}} setOk(true)})},[r,admin]);return ok?<>{children}</>:<div className="grid min-h-screen place-items-center text-navy">확인 중...</div>}
