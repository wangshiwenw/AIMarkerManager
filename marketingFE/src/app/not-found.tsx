'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className='grid min-h-dvh place-items-center bg-[#07111f] px-6 text-center text-white'>
      <div>
        <span className='text-[8rem] leading-none font-black text-emerald-300'>404</span>
        <h2 className='mt-2 text-2xl font-black'>页面不存在</h2>
        <p className='mt-3 text-sm font-semibold text-slate-400'>这个地址已经被清理，返回 AI 市场经理工作台继续操作。</p>
      <div className='mt-8 flex justify-center gap-2'>
          <button onClick={() => router.back()} className='rounded-xl border border-slate-700 px-5 py-3 text-sm font-black text-slate-200'>
            返回上一页
          </button>
          <button onClick={() => router.push('/')} className='rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950'>
            回到首页
          </button>
        </div>
      </div>
    </div>
  );
}
