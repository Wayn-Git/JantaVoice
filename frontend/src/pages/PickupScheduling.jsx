import React, { useState } from 'react';
import { Trash2, Calendar, Package, Clock } from 'lucide-react';

export default function PickupScheduling() {
  const materials = ['Plastic', 'Paper', 'E-waste', 'Glass', 'Metal'];
  const [selected, setSelected] = useState([]);

  return (
    <div className="min-h-screen bg-white pt-32 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h1 className="text-5xl font-black tracking-tighter mb-8 italic text-emerald-600">Schedule Pickup</h1>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
            {materials.map(m => (
              <div 
                key={m} 
                onClick={() => setSelected(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-4 ${selected.includes(m) ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 bg-white'}`}
              >
                <Package className={selected.includes(m) ? 'text-emerald-600' : 'text-slate-300'} />
                <span className="font-bold text-slate-700">{m}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-10 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400">Date</label>
                <input type="date" className="w-full p-4 rounded-2xl border-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400">Time Slot</label>
                <select className="w-full p-4 rounded-2xl border-none font-bold">
                  <option>09:00 AM - 11:00 AM</option>
                  <option>02:00 PM - 04:00 PM</option>
                </select>
              </div>
            </div>
            <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-900/10">Confirm Booking</button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-500 rounded-[2.5rem] p-10 text-white">
            <h3 className="text-2xl font-bold mb-4">Impact Points</h3>
            <p className="opacity-80 mb-8">Each pickup adds credits to your digital wallet for a greener city.</p>
            <div className="text-5xl font-black tracking-tighter">+12.5kg</div>
            <p className="text-xs font-bold uppercase tracking-widest mt-2 opacity-60">Avg. Citizen Impact</p>
          </div>
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white">
            <ShieldCheck className="text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-white">Verified Sarthies</h3>
            <p className="text-slate-400 text-sm">Every collection agent is background checked and verified.</p>
          </div>
        </div>
      </div>
    </div>
  );
}