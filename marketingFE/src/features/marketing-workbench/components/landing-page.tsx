'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function LandingPage() {
  const router = useRouter();

  return (
    <section className='landing-page'>
      <header className='landing-nav'>
        <div className='landing-brand'>
          <div className='brand-logo'>
            <Image src='/current-demo/assets/zhuketong-logo.png' alt='筑客通' width={38} height={38} />
          </div>
          <div>
            <h1>筑客通 AI市场经理</h1>
          </div>
        </div>
        <nav className='landing-links'>
          <button type='button'>系统能力</button>
          <button type='button'>系统预览</button>
          <button type='button'>使用流程</button>
        </nav>
      </header>
      <div className='landing-hero'>
        <h2>
          <span>装修公司专属的</span>
          <strong>AI 市场经理</strong>
        </h2>
        <p>自动接入巨量引擎，帮你完成抖音投放、素材测试、成本优化和每日汇报。</p>
        <button className='landing-cta' onClick={() => router.push('/cockpit')} type='button'>
          开始使用
        </button>
      </div>
    </section>
  );
}
