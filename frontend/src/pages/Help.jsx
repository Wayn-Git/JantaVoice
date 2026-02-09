import React from "react";
import { Phone, Mail, ShieldAlert, HeartPulse, HardHat, Info } from 'lucide-react';

export default function Help() {
  const contacts = [
    { name: "आपदा प्रबंधन (Disaster Management)", phone: "1078", email: "ndma@nic.in", icon: <ShieldAlert className="text-red-500" /> },
    { name: "महिला हेल्पलाइन (Women Helpline)", phone: "1091 / 181", email: "women-helpline@gov.in", icon: <Info className="text-pink-500" /> },
    { name: "बच्चों के लिए हेल्पलाइन (Childline)", phone: "1098", email: "childlineindia.org.in", icon: <Info className="text-blue-400" /> },
    { name: "स्वास्थ्य विभाग (Health)", phone: "1800-180-1104", email: "healthhelp@nic.in", icon: <HeartPulse className="text-red-600" /> },
    { name: "पुलिस सहायता (Police)", phone: "100", email: "police-support@gov.in", icon: <ShieldAlert className="text-blue-700" /> },
    { name: "साइबर क्राइम (Cyber Crime)", phone: "1930", email: "cybercrime@gov.in", icon: <ShieldAlert className="text-slate-700" /> },
    { name: "वरिष्ठ नागरिक (Senior Citizen)", phone: "14567", email: "seniorcitizen@gov.in", icon: <Info className="text-indigo-500" /> },
    { name: "रेलवे हेल्पलाइन (Railway)", phone: "139", email: "railhelp@rail.gov.in", icon: <HardHat className="text-orange-600" /> },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 py-24 px-6">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">मदद केंद्र <br/><span className="text-blue-600 italic">Help Center</span></h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          आपातकालीन स्थितियों में त्वरित सहायता के लिए आधिकारिक संपर्क।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {contacts.map((item, index) => (
          <div key={index} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 hover:shadow-xl hover:bg-white transition-all group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h2 className="text-xl font-bold mb-4 leading-tight">{item.name}</h2>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-blue-600 font-bold"><Phone size={14}/> {item.phone}</p>
              <p className="flex items-center gap-2 text-slate-400 truncate"><Mail size={14}/> {item.email}</p>
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-12 text-center text-slate-400 text-sm font-medium uppercase tracking-widest">
        Official Government Directories • 2026
      </p>
    </div>
  );
}