'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';

export default function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [currentMedia, setCurrentMedia] = useState<string>("");

  useEffect(() => {
    const fetchAsset = async () => {
      const { data } = await supabase.from('assets').select('*').eq('id', id).single();
      if (data) {
        setAsset(data);
        setCurrentMedia(data.main_image);
      }
    };
    fetchAsset();
  }, [id]);

  const convertToEmbed = (input: string) => {
    if (!input) return "";
    if (input.includes('<iframe')) return input.match(/src="([^"]+)"/)?.[1] || input;
    return `http://googleusercontent.com/maps.google.com/9{encodeURIComponent(input)}&output=embed`;
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      let finalMediaUrl = currentMedia;

      // If a new file was selected, upload it
      if (newFile) {
        const filePath = `uploads/${Date.now()}_${newFile.name}`;
        await supabase.storage.from('asset-media').upload(filePath, newFile);
        const { data } = supabase.storage.from('asset-media').getPublicUrl(filePath);
        finalMediaUrl = data.publicUrl;
      }

      const { error } = await supabase.from('assets').update({
        title: formData.get('title'),
        price: formData.get('price'),
        city: formData.get('city'),
        country: formData.get('country'),
        description: formData.get('description'),
        map_embed_url: convertToEmbed(formData.get('mapUrl') as string),
        main_image: finalMediaUrl,
      }).eq('id', id);

      if (!error) window.location.href = `/property/${id}`;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!asset) return <div className="p-20 font-black uppercase">Loading Records...</div>;

  return (
    <main className="min-h-screen bg-white py-12 px-6 text-black uppercase">
      <div className="max-w-4xl mx-auto border-[4px] border-black p-8 md:p-16 shadow-[12px_12px_0px_black]">
        <div className="flex justify-between items-start mb-12">
          <Link href={`/property/${id}`} className="text-[10px] font-black hover:underline tracking-widest">← CANCEL EDIT</Link>
          <h1 className="text-5xl font-black tracking-tighter leading-none">Edit Asset</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-12">
          
          {/* MEDIA MANAGEMENT SECTION */}
          <div className="border-2 border-black p-6 bg-gray-50">
            <h4 className="text-[10px] font-black tracking-widest mb-6">Media Control</h4>
            
            {currentMedia && !newFile ? (
              <div className="relative w-full aspect-video border-2 border-black mb-4 overflow-hidden group">
                {currentMedia.match(/\.(mp4|mov|webm)$/i) ? (
                  <video src={currentMedia} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={currentMedia} className="w-full h-full object-cover" alt="current" />
                )}
                <button 
                  type="button"
                  onClick={() => setCurrentMedia("")}
                  className="absolute inset-0 bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity font-black text-xs"
                >
                  REMOVE EXISTING PHOTO/VIDEO
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-black cursor-pointer hover:bg-black hover:text-white transition-all">
                <span className="text-xs font-black">{newFile ? `NEW FILE: ${newFile.name}` : "+ UPLOAD NEW MEDIA"}</span>
                <input type="file" className="hidden" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="border-b-4 border-black pb-2">
              <label className="text-[10px] font-black block mb-2 text-gray-400">City</label>
              <input name="city" defaultValue={asset.city} className="w-full text-2xl font-black focus:outline-none" />
            </div>
            <div className="border-b-4 border-black pb-2">
              <label className="text-[10px] font-black block mb-2 text-gray-400">Country</label>
              <input name="country" defaultValue={asset.country} className="w-full text-2xl font-black focus:outline-none" />
            </div>
          </div>

          <div className="border-b-4 border-black pb-2">
            <label className="text-[10px] font-black block mb-2 text-gray-400">Map Link</label>
            <input name="mapUrl" defaultValue={asset.map_embed_url} className="w-full text-sm font-black focus:outline-none" />
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-12">
            <button disabled={loading} type="submit" className="flex-1 bg-black text-white py-8 text-sm font-black tracking-[0.3em] hover:bg-blue-600 transition-all">
              {loading ? 'SAVING CHANGES...' : 'UPDATE RECORDS'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}