"use client";
import React, { Suspense } from "react";

const LazySpline = React.lazy(() => import("@splinetool/react-spline/next"));

export default function Home() {
  return (
    <main>
      <div style={{ 
        overflow: 'hidden',
        clipPath: 'inset(0 0 80px 0)',
        position: 'relative'
      }}>
         <Suspense>
          <LazySpline
            scene="https://prod.spline.design/h7PJKAlBWNMyS8wt/scene.splinecode"
          />
        </Suspense>
      </div>
    </main>
  );
}
