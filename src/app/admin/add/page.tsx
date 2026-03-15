'use client';
import { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';

export default function AddAssetPage() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Helper to extract the src URL if a user pastes a full iframe tag
  const cleanMapUrl = (input: string) => {
    if (input.includes('<iframe')) {
      const match = input.match(/src="([^"]+)"/);
      return match ? match[1] : input;
    }
    return input;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let mediaUrl = "";
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${Math.random()}.${fileExt}`;
        const { data } = await supabase.storage.from('asset-media').upload(filePath, file);
        if (data) {
          const { data: { publicUrl } } = supabase.storage.from('asset-media').getPublicUrl(filePath);
          mediaUrl = publicUrl;
        }
      }

      const { error } = await supabase.from('assets').insert([{
        title: formData.get('title'),
        price: formData.get('price'),
        city: formData.get('city'),
        country: formData.get('country'),
        description: formData.get('description'),
        map_embed_url: cleanMapUrl(formData.get('mapUrl') as string), // CLEANED HERE
        main_image: mediaUrl 
      }]);

      if (!error) window.location.href = '/';
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white py-12 px-6 text-black uppercase">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto border-4 border-black p-10 md:p-16 space-y-12 shadow-[16px_16px_0px_black]">
        <Link href="/" className="text-[10px] font-black hover:underline tracking-widest">← CANCEL</Link>
        <h1 className="text-5xl font-black tracking-tighter leading-none mb-12">Register Asset</h1>

        {/* MEDIA UPLOAD */}
        <div className="border-2 border-black p-8 text-center bg-gray-50 hover:bg-white transition-colors cursor-pointer">
          <label className="cursor-pointer">
            <span className="text-[10px] font-black tracking-widest">{file ? file.name : "SELECT MEDIA FILE (IMAGE/VIDEO)"}</span>
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="border-b-2 border-black pb-2">
            <label className="text-[10px] font-black block mb-2">Asset Name</label>
            <input name="title" required type="text" className="w-full text-xl font-black focus:outline-none" />
          </div>
          <div className="border-b-2 border-black pb-2">
            <label className="text-[10px] font-black block mb-2">Valuation (₹ INR)</label>
            <input name="price" required type="number" className="w-full text-xl font-black focus:outline-none" />
          </div>
        </div>

        <div className="border-b-2 border-black pb-2">
          <label className="text-[10px] font-black block mb-2">Google Maps Embed Link (URL or Iframe Tag)</label>
          <input name="mapUrl" type="text" placeholder="PASTE LINK HERE" className="w-full text-sm font-black focus:outline-none" />
        </div>

        <button disabled={loading} className="w-full bg-black text-white py-8 text-sm font-black tracking-[0.3em] hover:bg-blue-600 transition-all active:scale-95">
          {loading ? 'SYNCING DATA...' : 'Publish to Global Portfolio'}
        </button>
      </form>
    </main>
  );
}