// Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="transition-all duration-300">
        <Outlet />
      </main>
      <footer className="py-12 px-6 border-t border-slate-100 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xl font-black tracking-tighter text-blue-600">Janta Voice</span>
          <p className="text-slate-400 text-sm font-medium">© 2026 Official Civic Redressal Portal</p>
        </div>
      </footer>
    </div>
  );
}

// Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: "Raise Issue", path: "/complaint" },
    { name: "Recycling", path: "/pickup-scheduling" },
    { name: "Schemes", path: "/schemes" },
    { name: "Help", path: "/help" }
  ];

  return (
    <nav className={`fixed w-full top-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-3 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold group-hover:rotate-6 transition-transform">JV</div>
          <span className="text-xl font-black tracking-tighter text-slate-900">Janta Voice</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <Link key={link.path} to={link.path} className={`text-sm font-bold ${pathname === link.path ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>{link.name}</Link>
          ))}
          <Link to="/track" className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-md shadow-blue-900/10">
            <Search size={16} /> Track Status
          </Link>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-600">{isOpen ? <X /> : <Menu />}</button>
      </div>
    </nav>
  );
}