// src/app/admin/edit/[id]/page.tsx
'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';

export default function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAsset = async () => {
      const { data } = await supabase.from('assets').select('*').eq('id', id).single();
      if (data) setAsset(data);
    };
    fetchAsset();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from('assets').update({
      title: formData.get('title'),
      price: formData.get('price'),
      map_embed_url: formData.get('mapUrl'), // Fixed the field name here
      description: formData.get('description'),
    }).eq('id', id);

    if (!error) window.location.href = `/property/${id}`;
    setLoading(false);
  };

  const handleDelete = async () => {
    const confirmDelete = confirm("ARE YOU SURE? THIS ACTION CANNOT BE UNDONE.");
    if (!confirmDelete) return;

    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (!error) window.location.href = '/';
  };

  if (!asset) return <div className="p-20 font-black uppercase">Loading Asset Data...</div>;

  return (
    <main className="min-h-screen bg-white py-12 px-6 text-black uppercase">
      <div className="max-w-4xl mx-auto border-[4px] border-black p-8 md:p-16 shadow-[12px_12px_0px_black]">
        <div className="flex justify-between items-start mb-12">
          <Link href={`/property/${id}`} className="text-[10px] font-black hover:underline tracking-widest">← CANCEL</Link>
          <h1 className="text-5xl font-black tracking-tighter leading-none">Edit Entry</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="border-b-4 border-black pb-2">
              <label className="text-[10px] font-black block mb-2 text-gray-400">Asset Title</label>
              <input name="title" defaultValue={asset.title} className="w-full text-2xl font-black focus:outline-none" />
            </div>
            <div className="border-b-4 border-black pb-2">
              <label className="text-[10px] font-black block mb-2 text-gray-400">Valuation (₹ INR)</label>
              <input name="price" type="number" defaultValue={asset.price} className="w-full text-2xl font-black focus:outline-none" />
            </div>
          </div>

          <div className="border-b-4 border-black pb-2">
            <label className="text-[10px] font-black block mb-2 text-gray-400">Google Maps Embed Link</label>
            <input 
              name="mapUrl" 
              defaultValue={asset.map_embed_url} // FIXED: Changed from mapEmbedUrl
              className="w-full text-sm font-black focus:outline-none" 
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-12">
            <button disabled={loading} type="submit" className="flex-1 bg-black text-white py-8 text-sm font-black tracking-[0.3em] hover:bg-blue-600 transition-all">
              {loading ? 'SAVING...' : 'Update Records'}
            </button>
            <button 
              type="button" 
              onClick={handleDelete}
              className="px-10 py-8 border-4 border-red-600 text-red-600 text-xs font-black hover:bg-red-600 hover:text-white transition-all"
            >
              Delete Asset
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}