// src/components/MediaGallery.tsx
'use client';
import { useState, useEffect } from 'react';

export default function MediaGallery({ media }: { media: any[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [media.length]);

  return (
    <div className="relative w-full h-[400px] md:h-[600px] bg-black overflow-hidden border border-black">
      <img src={media[current].url} className="w-full h-full object-cover" key={current} />
      <div className="absolute bottom-0 right-0 flex">
        <button onClick={() => setCurrent(current === 0 ? media.length -1 : current - 1)} className="bg-black text-white p-6 hover:bg-gray-800 border-r border-white/10 text-xs">PREV</button>
        <button onClick={() => setCurrent(current === media.length - 1 ? 0 : current + 1)} className="bg-black text-white p-6 hover:bg-gray-800 text-xs">NEXT</button>
      </div>
      <div className="absolute top-6 left-6 bg-black text-white px-4 py-1 text-[10px] font-bold">
        {current + 1} / {media.length}
      </div>
    </div>
  );
}