'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LostPass() {
  const [email, setEmail] = useState('');
  const [thong_bao, setThongbao] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/api/quenpass', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setThongbao(data.thong_bao);
    // if (res.status === 200) router.push('/');
  }

  return (
    <form onSubmit={handleSubmit} className='w-[50%] m-auto border-1 rounded'>
      <h2 className='bg-emerald-500 p-2 font-bold text-center text-white'>Quên mật khẩu</h2>
      <div className='m-3'>Email:
        <input type="email" className='w-full border p-1'
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className='m-3'>
        <button className='bg-emerald-400 px-4 py-2' type="submit">Gửi mật khẩu mới</button>
        {thong_bao && <p style={{ color: 'red' }}>{thong_bao}</p>}
      </div>
    </form>
  );
}
