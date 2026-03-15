'use client';
import { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';

export default function AddAssetPage() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const getEmbedUrl = (input: string) => {
    if (!input) return "";
    if (input.includes('<iframe')) {
      return input.match(/src="([^"]+)"/)?.[1] || input;
    }
    // Public search fallback - bypasses API Key requirements
    return `https://www.google.com/maps?q=${encodeURIComponent(input)}&output=embed`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let mediaUrl = "";
      if (file) {
        const filePath = `uploads/${Date.now()}_${file.name}`;
        await supabase.storage.from('asset-media').upload(filePath, file);
        const { data } = supabase.storage.from('asset-media').getPublicUrl(filePath);
        mediaUrl = data.publicUrl;
      }

      const { error } = await supabase.from('assets').insert([{
        title: formData.get('title'),
        price: formData.get('price'),
        city: formData.get('city'),
        country: formData.get('country'),
        description: formData.get('description'),
        map_embed_url: getEmbedUrl(formData.get('mapUrl') as string),
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
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto border-4 border-black p-10 md:p-16 space-y-10 shadow-[12px_12px_0px_black]">
        <Link href="/" className="text-[10px] font-black hover:underline tracking-widest">← BACK TO INDEX</Link>
        <h1 className="text-5xl font-black tracking-tighter leading-none mb-8">Register Asset</h1>

        <div className={`border-2 border-black p-8 text-center transition-all ${file ? 'bg-black text-white' : 'bg-gray-50'}`}>
          <label className="cursor-pointer block">
            <span className="text-[10px] font-black">{file ? `READY: ${file.name}` : "UPLOAD IMAGE OR VIDEO"}</span>
            <input type="file" required className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <input name="title" placeholder="ASSET NAME" required className="border-b-2 border-black py-2 text-xl font-black focus:outline-none" />
          <input name="price" placeholder="PRICE (₹ INR)" required type="number" className="border-b-2 border-black py-2 text-xl font-black focus:outline-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <input name="city" placeholder="CITY" required className="border-b-2 border-black py-2 text-xl font-black focus:outline-none" />
          <input name="country" placeholder="COUNTRY" required className="border-b-2 border-black py-2 text-xl font-black focus:outline-none" />
        </div>

        <div className="border-b-2 border-black pb-2">
          <label className="text-[10px] font-black block mb-2">Google Maps Link or Address</label>
          <input name="mapUrl" placeholder="PASTE LINK OR TYPE ADDRESS" className="w-full text-sm font-black focus:outline-none" />
        </div>

        <button disabled={loading} className="w-full bg-black text-white py-8 text-sm font-black tracking-[0.3em] hover:bg-blue-600 active:scale-95 transition-all">
          {loading ? 'PUBLISHING...' : 'Confirm & Sync to Cloud'}
        </button>
      </form>
    </main>
  );
}