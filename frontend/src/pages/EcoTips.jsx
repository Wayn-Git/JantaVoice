import React from 'react';
import { ShieldCheck, Scale, Users, Gavel, ArrowRight } from 'lucide-react';

const CivicTips = () => {
  const tips = [
    { title: "RTI का उपयोग", desc: "सूचना का अधिकार अधिनियम का उपयोग कर सरकारी कार्यों की जानकारी मांगें।", icon: <Scale className="text-blue-500"/> },
    { title: "सामुदायिक रिपोर्टिंग", desc: "अपने पड़ोसियों के साथ मिलकर सामूहिक शिकायतें दर्ज करें, जिससे त्वरित समाधान मिलता है।", icon: <Users className="text-indigo-500"/> },
    { title: "डिजिटल साक्ष्य", desc: "सड़क या पानी की समस्या की स्पष्ट फोटो और GPS लोकेशन हमेशा अपलोड करें।", icon: <ShieldCheck className="text-emerald-500"/> },
  ];

  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-6xl font-black tracking-tighter mb-4 italic">नागरिक अधिकार</h1>
          <p className="text-xl text-slate-500">Know your rights to build a better city.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {tips.map((tip, i) => (
            <div key={i} className="bg-slate-50 rounded-[2.5rem] p-10 border border-transparent hover:border-blue-100 transition-all">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8">{tip.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{tip.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-6">{tip.desc}</p>
              <button className="flex items-center gap-2 text-sm font-black text-blue-600 uppercase tracking-widest">विस्तार से पढ़ें <ArrowRight size={14}/></button>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
           <Gavel size={200} className="absolute -bottom-10 -left-10 text-white opacity-5"/>
           <h2 className="text-4xl font-bold text-white mb-6 italic">"A silent citizen is a silent city."</h2>
           <p className="text-blue-200 font-bold uppercase tracking-[0.3em] text-xs">Janta Voice Mission</p>
        </div>
      </div>
    </div>
  );
};

export default CivicTips;