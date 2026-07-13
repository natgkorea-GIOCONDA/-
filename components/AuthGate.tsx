'use client';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function AuthGate({children, admin=false}:{children:ReactNode;admin?:boolean}){
  const r=useRouter();
  const [ok,setOk]=useState(false);

  useEffect(()=>{
    let active=true;
    const s=createClient();

    async function check(){
      const {data:{session}}=await s.auth.getSession();
      const user=session?.user;
      if(!active)return;
      if(!user){r.replace('/login');return}
      if(admin){
        const {data:p}=await s.from('profiles').select('is_admin').eq('id',user.id).single();
        if(!active)return;
        if(!p?.is_admin){r.replace('/dashboard');return}
      }
      setOk(true);
    }

    check();
    const {data:{subscription}}=s.auth.onAuthStateChange((event:any,session:any)=>{
      if(!active)return;
      if(event==='SIGNED_OUT'||!session){r.replace('/login')}
    });

    return()=>{active=false;subscription.unsubscribe()};
  },[r,admin]);

  return ok?<>{children}</>:<div className="grid min-h-screen place-items-center text-navy">확인 중...</div>
}
