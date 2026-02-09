import React, { createContext, useContext, useState, useEffect } from 'react';

// Language translations
const translations = {
    en: {
        // Navbar
        home: "Home",
        voiceComplaint: "Voice Complaint",
        writtenComplaint: "Written Complaint",
        chatbot: "Chatbot",
        about: "About",
        trackStatus: "Track Status",

        // Home
        heroTagline: "Official Civic Redressal Portal",
        heroTitle1: "Your Voice,",
        heroTitle2: "Your Power",
        heroSubtitle: "A transparent bridge between citizens and local government. Report issues like broken roads, water leaks, and waste management directly to authorities.",
        voiceComplaintBtn: "Voice Complaint",
        writtenComplaintBtn: "Written Complaint",
        trackStatusBtn: "Track Status",
        schemes: "Schemes",
        schemesDesc: "Government scheme information",
        chatbotDesc: "Ask AI anything",
        help: "Help",
        helpDesc: "Guidance and support",
        aboutDesc: "About JantaVoice",
        departmentComplaint: "Complain by Department",
        roadDept: "Road Department",
        roadDeptDesc: "Potholes, broken roads, street lights",
        waterDept: "Water Department",
        waterDeptDesc: "Water shortage, pipe leakage",
        sanitationDept: "Sanitation Department",
        sanitationDeptDesc: "Garbage, cleanliness, drains",
        electricityDept: "Electricity Department",
        electricityDeptDesc: "Power cuts, faulty wires",
        healthDept: "Health Department",
        healthDeptDesc: "Hospitals, sanitation",
        generalComplaint: "General Complaint",
        generalComplaintDesc: "All other issues",
        howItWorks: "How does complaint work?",
        step1Title: "File Complaint",
        step1Desc: "Voice or written",
        step2Title: "AI Processing",
        step2Desc: "Department and urgency assigned",
        step3Title: "Sent to Department",
        step3Desc: "Reaches concerned officer",
        step4Title: "Resolution",
        step4Desc: "You get updates",
        adminPortal: "Admin Portal",
        adminDashboard: "Admin Dashboard",
        adminDesc: "Manage and analyze complaints",
        officerLogin: "Officer Login",

        // Complaint Form
        fileComplaint: "File a Complaint",
        complaintSubtitle: "Describe your issue, we will help",
        selectDept: "Select Department",
        fillDetails: "Fill Details",
        confirm: "Confirm",
        yourName: "Your Name",
        namePlaceholder: "Enter your full name",
        location: "Location",
        locationPlaceholder: "Address or location name",
        issueDescription: "Issue Description",
        descPlaceholder: "Describe your issue in detail...",
        urgencyLevel: "Urgency Level",
        low: "Low",
        medium: "Medium",
        high: "High",
        photo: "Photo (Optional)",
        back: "Back",
        next: "Next",
        submitComplaint: "Submit Complaint",
        submitting: "Submitting...",
        complaintSuccess: "Complaint Filed Successfully!",
        complaintSentTo: "Your complaint has been sent to",
        complaintId: "Complaint ID",
        fileNewComplaint: "File New Complaint",

        // Track Status
        trackTitle: "Track Complaint Status",
        trackSubtitle: "Enter your Complaint ID to check status",
        enterComplaintId: "Enter Complaint ID... (e.g., JV-XXXX)",
        track: "Track",
        currentStatus: "Current Status",
        resolved: "Resolved",
        processing: "Processing",
        pending: "Pending",
        complainant: "Complainant",
        department: "Department",
        description: "Description",
        filedOn: "Filed on",
        idTip: "💡 You get the Complaint ID after filing a complaint",

        // Voice Complaint
        voiceTitle: "Voice Complaint",
        voiceSubtitle: "Speak in Hindi, AI will file your complaint",
        startRecording: "Start Recording",
        stopRecording: "Stop Recording",
        uploadAudio: "Upload Audio",
        processAudio: "Process with AI",
        transcript: "Transcript",
        extractedFields: "Extracted Fields",

        // Chatbot
        chatbotTitle: "Government Schemes Chatbot",
        chatbotSubtitle: "Ask about any government scheme",
        typeMessage: "Type your message...",
        send: "Send",

        // Common
        selectLanguage: "Language",
        english: "English",
        hindi: "हिंदी",
        error: "Error",
        loading: "Loading...",
        required: "Required"
    },
    hi: {
        // Navbar
        home: "होम",
        voiceComplaint: "आवाज़ शिकायत",
        writtenComplaint: "लिखित शिकायत",
        chatbot: "चैटबॉट",
        about: "हमारे बारे में",
        trackStatus: "स्थिति ट्रैक करें",

        // Home
        heroTagline: "नागरिक शिकायत पोर्टल",
        heroTitle1: "आपकी आवाज़,",
        heroTitle2: "जनता की आवाज़",
        heroSubtitle: "सरकार और नागरिकों के बीच एक पारदर्शी पुल। सड़क, पानी, बिजली जैसी समस्याओं की शिकायत सीधे अधिकारियों तक पहुंचाएं।",
        voiceComplaintBtn: "आवाज़ से शिकायत",
        writtenComplaintBtn: "लिखित शिकायत",
        trackStatusBtn: "स्थिति ट्रैक करें",
        schemes: "योजनाएं",
        schemesDesc: "सरकारी योजनाओं की जानकारी",
        chatbotDesc: "AI से पूछें कुछ भी",
        help: "सहायता",
        helpDesc: "मदद और मार्गदर्शन",
        aboutDesc: "JantaVoice के बारे में",
        departmentComplaint: "विभागों के अनुसार शिकायत करें",
        roadDept: "सड़क विभाग",
        roadDeptDesc: "गड्ढे, टूटी सड़कें, स्ट्रीट लाइट",
        waterDept: "जल विभाग",
        waterDeptDesc: "पानी की कमी, पाइप लीकेज",
        sanitationDept: "स्वच्छता विभाग",
        sanitationDeptDesc: "कूड़ा, गंदगी, नाला",
        electricityDept: "बिजली विभाग",
        electricityDeptDesc: "बिजली कटौती, खराब तार",
        healthDept: "स्वास्थ्य विभाग",
        healthDeptDesc: "अस्पताल, सफाई",
        generalComplaint: "सामान्य शिकायत",
        generalComplaintDesc: "अन्य सभी समस्याएं",
        howItWorks: "शिकायत कैसे काम करती है?",
        step1Title: "शिकायत दर्ज करें",
        step1Desc: "आवाज़ या लिखित रूप में",
        step2Title: "AI प्रोसेसिंग",
        step2Desc: "विभाग और अर्जेंसी तय होती है",
        step3Title: "विभाग को भेजी जाती है",
        step3Desc: "संबंधित अधिकारी को मिलती है",
        step4Title: "समाधान",
        step4Desc: "आपको अपडेट मिलता है",
        adminPortal: "अधिकारी पोर्टल",
        adminDashboard: "Admin Dashboard",
        adminDesc: "शिकायतों का प्रबंधन और विश्लेषण",
        officerLogin: "Officer Login",

        // Complaint Form
        fileComplaint: "शिकायत दर्ज करें",
        complaintSubtitle: "अपनी समस्या का विवरण दें, हम मदद करेंगे",
        selectDept: "विभाग चुनें",
        fillDetails: "विवरण भरें",
        confirm: "पुष्टि करें",
        yourName: "आपका नाम",
        namePlaceholder: "अपना पूरा नाम लिखें",
        location: "स्थान",
        locationPlaceholder: "पता या स्थान का नाम",
        issueDescription: "समस्या का विवरण",
        descPlaceholder: "अपनी समस्या विस्तार से बताएं...",
        urgencyLevel: "अर्जेंसी स्तर",
        low: "कम",
        medium: "मध्यम",
        high: "उच्च",
        photo: "फोटो (वैकल्पिक)",
        back: "वापस",
        next: "आगे",
        submitComplaint: "शिकायत दर्ज करें",
        submitting: "दर्ज हो रहा है...",
        complaintSuccess: "शिकायत सफलतापूर्वक दर्ज!",
        complaintSentTo: "आपकी शिकायत भेज दी गई है",
        complaintId: "शिकायत ID",
        fileNewComplaint: "नई शिकायत दर्ज करें",

        // Track Status
        trackTitle: "शिकायत स्थिति ट्रैक करें",
        trackSubtitle: "अपनी Complaint ID दर्ज करें और स्थिति देखें",
        enterComplaintId: "Complaint ID दर्ज करें... (जैसे: JV-XXXX)",
        track: "ट्रैक करें",
        currentStatus: "वर्तमान स्थिति",
        resolved: "समाधान हो गया",
        processing: "प्रक्रिया में",
        pending: "लंबित",
        complainant: "शिकायतकर्ता",
        department: "विभाग",
        description: "विवरण",
        filedOn: "दर्ज किया गया",
        idTip: "💡 आपको Complaint ID शिकायत दर्ज करने के बाद मिलती है",

        // Voice Complaint
        voiceTitle: "आवाज़ शिकायत",
        voiceSubtitle: "हिंदी में बोलें, AI आपकी शिकायत दर्ज करेगा",
        startRecording: "रिकॉर्डिंग शुरू करें",
        stopRecording: "रिकॉर्डिंग रोकें",
        uploadAudio: "ऑडियो अपलोड करें",
        processAudio: "AI से प्रोसेस करें",
        transcript: "ट्रांसक्रिप्ट",
        extractedFields: "निकाली गई जानकारी",

        // Chatbot
        chatbotTitle: "सरकारी योजनाएं चैटबॉट",
        chatbotSubtitle: "किसी भी सरकारी योजना के बारे में पूछें",
        typeMessage: "अपना संदेश लिखें...",
        send: "भेजें",

        // Common
        selectLanguage: "भाषा",
        english: "English",
        hindi: "हिंदी",
        error: "त्रुटि",
        loading: "लोड हो रहा है...",
        required: "आवश्यक"
    }
};

// Create context
const LanguageContext = createContext();

// Provider component
export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        // Get saved language or default to English
        const saved = localStorage.getItem('jantavoice-language');
        return saved || 'en';
    });

    useEffect(() => {
        localStorage.setItem('jantavoice-language', language);
    }, [language]);

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'hi' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

// Hook to use language
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
