import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic, Info, Search, Menu, X, ArrowRight, FileText, Bot, Home, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('home'), path: "/", icon: <Home size={18} /> },
    { name: t('voiceComplaint'), path: "/voice-complaint", icon: <Mic size={18} /> },
    { name: t('writtenComplaint'), path: "/complaint", icon: <FileText size={18} /> },
    { name: t('chatbot'), path: "/chatbot", icon: <Bot size={18} /> },
    { name: t('about'), path: "/about", icon: <Info size={18} /> },
  ];

  return (
    <nav
      className={`fixed w-full top-0 z-[100] transition-all duration-300 ${scrolled
        ? 'bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm py-2'
        : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-DEFAULT blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary-DEFAULT to-primary-dark rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Mic size={22} />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Janta<span className="text-primary-DEFAULT">Voice</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-white/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/40 shadow-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                {pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-white shadow-sm rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-2 ${pathname === link.path ? 'text-primary-dark font-semibold' : 'text-slate-600 hover:text-slate-900'}`}>
                  {link.icon}
                  {link.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-white/50 hover:bg-white text-slate-700 border border-transparent hover:border-slate-200 transition-all shadow-sm"
            >
              <Globe size={16} />
              {language === 'en' ? 'हिं' : 'EN'}
            </button>
            <Link
              to="/trackstatus"
              className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5"
            >
              <Search size={16} />
              <span>{t('trackStatus')}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              <Globe size={20} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <motion.div
                animate={isOpen ? "open" : "closed"}
                variants={{
                  open: { rotate: 180 },
                  closed: { rotate: 0 }
                }}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-xl rounded-b-2xl absolute left-0 right-0 top-full"
            >
              <div className="p-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${pathname === link.path
                      ? 'bg-primary-light/10 text-primary-dark font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon}
                      <span>{link.name}</span>
                    </div>
                    {pathname === link.path && <ArrowRight size={16} className="text-primary-DEFAULT" />}
                  </Link>
                ))}
                <Link
                  to="/trackstatus"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-2 w-full p-3 mt-4 bg-slate-900 text-white rounded-xl font-bold"
                >
                  <Search size={18} />
                  <span>{t('trackStatus')}</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;