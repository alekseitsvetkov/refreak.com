'use client';
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  return (
    <main>
      <div style={{ 
        overflow: 'hidden',
        clipPath: 'inset(0 0 80px 0)',
        position: 'relative'
      }}>
        <Spline
          scene="https://prod.spline.design/h7PJKAlBWNMyS8wt/scene.splinecode"
        />
      </div>
    </main>
  );
}
