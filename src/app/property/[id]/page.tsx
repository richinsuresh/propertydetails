'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      const { data } = await supabase.from('assets').select('*').eq('id', id).single();
      if (data) setAsset(data);
      setLoading(false);
    };
    fetchAsset();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("PERMANENTLY REMOVE THIS ASSET FROM RECORDS?")) return;
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (!error) window.location.href = '/';
  };

  if (loading) return <div className="p-20 font-black uppercase">Initialising Data...</div>;
  if (!asset) notFound();

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(asset.price);

  return (
    <main className="min-h-screen bg-white text-black uppercase">
      <nav className="border-b-4 border-black p-6 flex justify-between items-center sticky top-0 bg-white z-50">
        <Link href="/" className="text-[10px] font-black tracking-widest hover:underline">← INDEX</Link>
        <div className="flex gap-4">
          <Link href={`/admin/edit/${id}`} className="bg-black text-white px-6 py-2 text-[10px] font-black tracking-widest">EDIT</Link>
          <button onClick={handleDelete} className="border-2 border-red-600 text-red-600 px-6 py-2 text-[10px] font-black tracking-widest hover:bg-red-600 hover:text-white transition-all">DELETE</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-12 lg:grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7">
          <div className="border-4 border-black p-2 bg-gray-50">
            {asset.main_image?.match(/\.(mp4|mov|webm)$/i) ? (
              <video src={asset.main_image} controls autoPlay muted loop className="w-full h-auto border-2 border-black" />
            ) : (
              <img src={asset.main_image} className="w-full h-auto object-cover border-2 border-black" alt={asset.title} />
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-12">
          <div className="border-b-4 border-black pb-8">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">{asset.title}</h1>
            <p className="text-xs font-black tracking-[0.4em] text-blue-600">{asset.city}, {asset.country}</p>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 tracking-widest block mb-2">Market Valuation</label>
            <p className="text-6xl font-black">{formattedPrice}</p>
          </div>

          <section>
            <h4 className="text-[10px] font-black tracking-widest border-b-2 border-black pb-2 mb-4">Description</h4>
            <p className="text-lg font-black leading-tight">{asset.description || "DATA NOT PROVIDED"}</p>
          </section>

          <section>
            <h4 className="text-[10px] font-black tracking-widest border-b-2 border-black pb-2 mb-4">Live Geospatial Tracking</h4>
            <div className="border-4 border-black h-80 grayscale hover:grayscale-0 transition-all duration-700">
              <iframe width="100%" height="100%" src={asset.map_embed_url} frameBorder="0" allowFullScreen></iframe>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}