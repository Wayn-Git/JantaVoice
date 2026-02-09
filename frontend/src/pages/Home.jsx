import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, MapPin,
  MessageSquare, BarChart3, Users,
  Droplets, Construction, Trash2, Mic, FileText, Bot, HelpCircle, Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-light/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 z-10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <span className="bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200 text-primary-dark px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2">
              <ShieldCheck size={14} /> {t('heroTagline')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1] md:leading-[1.1]"
          >
            {t('heroTitle1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-DEFAULT to-purple-600">
              {t('heroTitle2')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            {t('heroSubtitle')}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate('/voice-complaint')}
              className="group relative px-8 py-4 bg-primary-DEFAULT rounded-full text-white font-bold shadow-lg shadow-primary-DEFAULT/30 hover:shadow-primary-DEFAULT/50 hover:-translate-y-1 transition-all overflow-hidden w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="flex items-center justify-center gap-2 relative z-10">
                <Mic size={20} /> {t('voiceComplaintBtn')}
              </div>
            </button>
            <button
              onClick={() => navigate('/complaint')}
              className="px-8 py-4 bg-white text-slate-800 border border-slate-200 rounded-full font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <FileText size={20} /> {t('writtenComplaintBtn')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="px-6 pb-20 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { title: t('schemes'), desc: t('schemesDesc'), icon: "📋", path: "/schemes", color: "bg-blue-50" },
            { title: t('chatbot'), desc: t('chatbotDesc'), icon: "🤖", path: "/chatbot", color: "bg-purple-50" },
            { title: t('help'), desc: t('helpDesc'), icon: "❓", path: "/help", color: "bg-green-50" },
            { title: t('about'), desc: t('aboutDesc'), icon: "ℹ️", path: "/about", color: "bg-orange-50" },
          ].map((item, i) => (
            <motion.button
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-6 text-left shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all group"
            >
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <h4 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-primary-dark transition-colors">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Service Categories */}
      <section className="px-6 py-20 bg-white/50 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('departmentComplaint')}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Select the department relevant to your issue for faster processing.</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { title: t('roadDept'), desc: t('roadDeptDesc'), icon: <Construction className="text-orange-500" />, color: "bg-orange-50" },
              { title: t('waterDept'), desc: t('waterDeptDesc'), icon: <Droplets className="text-blue-500" />, color: "bg-blue-50" },
              { title: t('sanitationDept'), desc: t('sanitationDeptDesc'), icon: <Trash2 className="text-green-500" />, color: "bg-green-50" },
              { title: t('electricityDept'), desc: t('electricityDeptDesc'), icon: "⚡", color: "bg-yellow-50" },
              { title: t('healthDept'), desc: t('healthDeptDesc'), icon: "🏥", color: "bg-red-50" },
              { title: t('generalComplaint'), desc: t('generalComplaintDesc'), icon: "📝", color: "bg-gray-50" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                onClick={() => navigate('/complaint')}
                className="group bg-white border border-slate-100 rounded-3xl p-6 cursor-pointer shadow-md hover:shadow-xl hover:border-primary-light/30 transition-all"
              >
                <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h4 className="font-bold text-lg mb-2 text-slate-800">{item.title}</h4>
                <p className="text-sm text-slate-500">{item.desc}</p>
                <div className="mt-4 flex items-center text-primary-DEFAULT font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                  Report Incident <ArrowRight size={14} className="ml-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-DEFAULT font-bold tracking-widest uppercase text-sm mb-2 block">Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t('howItWorks')}</h2>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-0.5 bg-slate-200 -z-10" />

            {[
              { step: "1", title: t('step1Title'), desc: t('step1Desc'), icon: <Mic className="text-white" /> },
              { step: "2", title: t('step2Title'), desc: t('step2Desc'), icon: <Bot className="text-white" /> },
              { step: "3", title: t('step3Title'), desc: t('step3Desc'), icon: <MessageSquare className="text-white" /> },
              { step: "4", title: t('step4Title'), desc: t('step4Desc'), icon: <ShieldCheck className="text-white" /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center relative bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-100"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary-DEFAULT to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-DEFAULT/30 z-10 relative">
                  {item.icon}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-slate-900 shadow-sm border border-slate-100">
                    {item.step}
                  </div>
                </div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Access & Footer */}
      <section className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-DEFAULT/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-md">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-primary-DEFAULT mb-3">{t('adminPortal')}</div>
              <h3 className="text-3xl font-bold mb-4">{t('adminDashboard')}</h3>
              <p className="text-slate-400 max-w-md text-lg">{t('adminDesc')}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin-login')}
              className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 hover:bg-slate-100 shadow-lg shadow-white/10"
            >
              {t('officerLogin')} <ArrowRight size={18} />
            </motion.button>
          </div>

          <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-DEFAULT to-primary-dark rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                <Mic size={20} />
              </div>
              <span className="text-2xl font-bold tracking-tight">Janta<span className="text-primary-DEFAULT">Voice</span></span>
            </div>
            <div className="flex gap-8 text-sm text-slate-400">
              <span className="cursor-pointer hover:text-white transition-colors">© 2026 JantaVoice</span>
              <button onClick={() => navigate('/about')} className="hover:text-primary-DEFAULT transition-colors">About</button>
              <button onClick={() => navigate('/help')} className="hover:text-primary-DEFAULT transition-colors">Help</button>
              <button onClick={() => navigate('/privacy')} className="hover:text-primary-DEFAULT transition-colors">Privacy</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;