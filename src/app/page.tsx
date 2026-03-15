'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';

export default function ShowroomDashboard() {
  // Fix: Explicitly type the state as an array of any objects
  const [assets, setAssets] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Database Error:", error.message);
      } else if (data) {
        setAssets(data);
      }
    };
    fetchAssets();
  }, []);

  const filtered = assets.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) || 
    p.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <nav className="border-b-4 border-black p-6 flex justify-between items-center sticky top-0 bg-white z-50">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">Property Log</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1">Asset Control Center</p>
        </div>
        <Link href="/admin/add" className="bg-black text-white px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
          + New Asset
        </Link>
      </nav>

      <section className="p-6 md:p-12 border-b-2 border-black bg-gray-50">
        <label className="text-[10px] font-black uppercase tracking-widest text-black block mb-2">Filter Inventory</label>
        <input 
          type="text" 
          placeholder="ENTER CITY OR COUNTRY..." 
          className="w-full bg-transparent py-4 text-3xl md:text-5xl font-black focus:outline-none placeholder:text-gray-200 uppercase"
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section className="p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((asset) => (
          <Link href={`/property/${asset.id}`} key={asset.id} className="group block border-2 border-black p-2 hover:bg-black hover:text-white transition-all duration-300">
            <div className="aspect-video overflow-hidden border-b-2 border-black">
              <img src={asset.main_image} className="w-full h-full object-cover" alt={asset.title} />
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-black uppercase tracking-tight leading-none">{asset.title}</h3>
                <span className="text-[9px] font-black border border-current px-2 py-0.5">ACTIVE</span>
              </div>
              <p className="text-xs font-black uppercase tracking-widest">{asset.city}, {asset.country}</p>
              <p className="text-3xl font-black pt-4 border-t border-current">
                ₹{Number(asset.price).toLocaleString('en-IN')}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}