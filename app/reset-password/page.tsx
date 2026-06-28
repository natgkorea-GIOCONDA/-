'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('재설정 링크를 확인하는 중입니다.');
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function prepareRecoverySession() {
      const code = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash');

      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
        if (!mounted) return;

        if (error) {
          setMessage('재설정 링크가 만료되었거나 올바르지 않습니다. 다시 요청해 주세요.');
          setIsReady(false);
          return;
        }
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!mounted) return;

        if (error) {
          setMessage('재설정 링크가 만료되었거나 올바르지 않습니다. 다시 요청해 주세요.');
          setIsReady(false);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) {
        setMessage('비밀번호 재설정 메일의 링크로 다시 접속해 주세요.');
        setIsReady(false);
        return;
      }

      setMessage('새 비밀번호를 입력해 주세요.');
      setIsReady(true);
    }

    prepareRecoverySession();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');

    if (password.length < 6) {
      setMessage('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await createClient().auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.');
    setTimeout(() => router.replace('/login'), 1200);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-md">
        <Link href="/login" className="text-sm text-slate-500">← 로그인으로</Link>
        <form onSubmit={submit} className="mt-10 rounded-3xl bg-white p-6 shadow-card">
          <h1 className="text-3xl font-extrabold text-navy">비밀번호 재설정</h1>
          <p className="mt-2 text-slate-500">새 비밀번호를 설정하면 기존 비밀번호는 사용할 수 없습니다.</p>
          <label className="mt-8 block font-semibold">
            새 비밀번호
            <input className="mt-2 w-full rounded-2xl border p-4" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={!isReady || isSubmitting} minLength={6} />
          </label>
          <label className="mt-4 block font-semibold">
            새 비밀번호 확인
            <input className="mt-2 w-full rounded-2xl border p-4" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={!isReady || isSubmitting} minLength={6} />
          </label>
          {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
          <button className="mt-6 w-full rounded-2xl bg-navy py-4 font-bold text-white disabled:bg-slate-300" disabled={!isReady || isSubmitting}>
            {isSubmitting ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </main>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50 px-5 py-10"><div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-card">재설정 링크를 확인하는 중입니다.</div></main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
