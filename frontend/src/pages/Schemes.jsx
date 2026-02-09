import React from "react";
import { ArrowUpRight, BookOpen } from 'lucide-react';

export default function Schemes() {
  const schemes = [
    { title: "PM आवास योजना", desc: "सभी के लिए पक्के मकान का सपना साकार करने हेतु आर्थिक सहायता।", link: "#", color: "bg-blue-50" },
    { title: "आयुष्मान भारत", desc: "आर्थिक रूप से कमजोर परिवारों को ₹5 लाख तक का मुफ्त इलाज।", link: "#", color: "bg-emerald-50" },
    { title: "डिजिटल इंडिया", desc: "भारत को डिजिटल रूप से सशक्त समाज और ज्ञान आधारित अर्थव्यवस्था बनाना।", link: "#", color: "bg-indigo-50" },
    { title: "स्वच्छ भारत", desc: "देशव्यापी स्वच्छता और खुले में शौच मुक्त भारत का मिशन।", link: "#", color: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">प्रमुख योजनाएं <br/><span className="text-blue-600">Schemes</span></h1>
            <p className="text-slate-500 font-medium italic">Empowering citizens through government initiatives.</p>
          </div>
          <div className="p-4 bg-slate-900 rounded-3xl text-white flex items-center gap-3">
             <BookOpen size={20} className="text-blue-400"/>
             <span className="text-sm font-bold">12 Active Programs</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme, index) => (
            <div 
              key={index} 
              onClick={() => window.open(scheme.link, "_blank")}
              className="cursor-pointer bg-white border border-slate-100 rounded-[2.5rem] p-10 hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${scheme.color} rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform`} />
              <h2 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{scheme.title}</h2>
              <p className="text-slate-500 leading-relaxed mb-8">{scheme.desc}</p>
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900">
                जानकारी लें <ArrowUpRight size={16}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}