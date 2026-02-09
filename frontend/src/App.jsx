import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AnimatePresence } from "framer-motion";
import UserLogin from "./pages/UserLogin";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import UserOptions from "./pages/UserOptions";
import Schemes from "./pages/Schemes";
import Acts from "./pages/Acts";
import Policies from "./pages/Policies";
import ComplaintForm from "./pages/ComplaintForm";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import TrackStatus from "./pages/Trackstatus";
import VoiceComplaint from "./pages/VoiceComplaint";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import ComplaintChoice from './pages/ComplaintChoice';
import Help from "./pages/Help";
import About from "./pages/About";
import EcoTips from "./pages/EcoTips";
import WomenChildComplaint from "./pages/WomenChildComplaint";
import PickupScheduling from "./pages/PickupScheduling";
import SchemeChatbot from "./pages/SchemeChatbot";
import PageTransition from "./components/PageTransition";
import ScrollToTop from "./components/ScrollToTop";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/user-options" element={<PageTransition><UserOptions /></PageTransition>} />
        <Route path="/user-login" element={<PageTransition><UserLogin /></PageTransition>} />
        <Route path="/complaint" element={<PageTransition><ComplaintForm /></PageTransition>} />
        <Route path="/complaint-choice" element={<PageTransition><ComplaintChoice /></PageTransition>} />
        <Route path="/voice" element={<PageTransition><VoiceComplaint /></PageTransition>} />
        <Route path="/voice-complaint" element={<PageTransition><VoiceComplaint /></PageTransition>} />
        <Route path="/admin-login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
        {/* <Route path="/track" element={<Trackstatus />} /> */}
        <Route path="/trackstatus" element={<PageTransition><TrackStatus /></PageTransition>} />
        <Route path="/schemes" element={<PageTransition><Schemes /></PageTransition>} />
        <Route path="/acts" element={<PageTransition><Acts /></PageTransition>} />
        <Route path="/policies" element={<PageTransition><Policies /></PageTransition>} />
        <Route path="/help" element={<PageTransition><Help /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/eco-tips" element={<PageTransition><EcoTips /></PageTransition>} />
        <Route path="/women-child-complaint" element={<PageTransition><WomenChildComplaint /></PageTransition>} />
        <Route path="/pickup-scheduling" element={<PageTransition><PickupScheduling /></PageTransition>} />
        <Route path="/chatbot" element={<PageTransition><SchemeChatbot /></PageTransition>} />

        {/* ✅ Protected Route - No transition needed for wrapper, but inside maybe? Keeping simple for now */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <PageTransition><AdminDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Optional: Fallback 404 */}
        <Route path="*" element={<PageTransition><h2 className="text-center text-red-500 mt-10">404: Page not found</h2></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="bg-gray-50 min-h-screen font-sans">
          <ScrollToTop />
          <Navbar />
          <AnimatedRoutes />
        </div>
      </Router>
    </LanguageProvider>
  );
}

