import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  return (
    <main>
      <Spline
        scene="https://prod.spline.design/h7PJKAlBWNMyS8wt/scene.splinecode" 
      />
    </main>
  );
}
