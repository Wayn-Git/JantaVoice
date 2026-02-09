import React, { useState, useRef, useEffect } from "react";
import { Phone, PhoneCall, Mic, MicOff, Volume2, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

export default function VoiceComplaint() {
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  
  // Result states
  const [transcript, setTranscript] = useState("");
  const [extractedFields, setExtractedFields] = useState(null);
  const [complaintId, setComplaintId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  // Form fields (editable)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    department: "",
    description: "",
    urgency: "Medium"
  });
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setAudioBlob(null);
      setAudioUrl(null);
      setTranscript("");
      setExtractedFields(null);
      setSubmitted(false);
      
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("माइक्रोफ़ोन एक्सेस करने में समस्या। कृपया अनुमति दें।");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setTranscript("");
      setExtractedFields(null);
      setSubmitted(false);
      setError(null);
    }
  };

  // Process audio with AI
  const processAudio = async () => {
    if (!audioBlob) {
      setError("कृपया पहले ऑडियो रिकॉर्ड करें या अपलोड करें");
      return;
    }
    
    setIsProcessing(true);
    setCurrentStep("ऑडियो अपलोड हो रहा है...");
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Determine file extension based on blob type
      const extension = audioBlob.type.includes('webm') ? 'webm' : 
                       audioBlob.type.includes('mp4') ? 'm4a' : 'wav';
      formData.append('audio', audioBlob, `recording.${extension}`);
      
      setCurrentStep("AI द्वारा ट्रांसक्रिप्शन हो रहा है...");
      
      const response = await axios.post('/api/complaint/voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // 2 minutes for processing
      });
      
      if (response.data.success) {
        setTranscript(response.data.transcript);
        setExtractedFields(response.data.extracted_fields);
        
        // Pre-fill form with extracted data
        setFormData({
          name: response.data.extracted_fields.name || "",
          phone: response.data.extracted_fields.phone || "",
          location: response.data.extracted_fields.location || "",
          department: response.data.extracted_fields.department || "",
          description: response.data.extracted_fields.description || "",
          urgency: response.data.extracted_fields.urgency || "Medium"
        });
        
        setComplaintId(response.data.complaint_id);
        setSubmitted(true);
        setCurrentStep("शिकायत सफलतापूर्वक दर्ज हो गई!");
      } else {
        setError(response.data.error || "प्रोसेसिंग में समस्या हुई");
      }
      
    } catch (err) {
      console.error("Processing error:", err);
      setError(err.response?.data?.error || err.message || "तकनीकी समस्या हुई");
    } finally {
      setIsProcessing(false);
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎙️ आवाज़ शिकायत
          </h1>
          <p className="text-purple-300">
            हिंदी में बोलें, AI आपकी शिकायत दर्ज करेगा
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20">
          
          {/* Recording Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-400" />
              चरण 1: ऑडियो रिकॉर्ड करें या अपलोड करें
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Record Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } disabled:opacity-50`}
              >
                {isRecording ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>
              
              <span className="text-white/60">या</span>
              
              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isRecording || isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                फ़ाइल अपलोड करें
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            
            {isRecording && (
              <div className="text-center mt-4 text-red-400 animate-pulse">
                🔴 रिकॉर्डिंग हो रही है... रुकने के लिए बटन दबाएं
              </div>
            )}
            
            {/* Audio Preview */}
            {audioUrl && !isRecording && (
              <div className="mt-4">
                <audio src={audioUrl} controls className="w-full rounded-lg" />
              </div>
            )}
          </div>

          {/* Process Button */}
          {audioBlob && !isRecording && !submitted && (
            <div className="mb-6">
              <button
                onClick={processAudio}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {currentStep}
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    AI से प्रोसेस करें
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                📝 ट्रांसक्रिप्ट (हिंदी)
              </h2>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/90 leading-relaxed">{transcript}</p>
              </div>
            </div>
          )}

          {/* Extracted Fields Display */}
          {extractedFields && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                🔍 AI द्वारा निकाली गई जानकारी
              </h2>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-xs text-purple-300 mb-1">नाम</div>
                    <div className="text-white font-medium">{extractedFields.name || "—"}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-xs text-purple-300 mb-1">स्थान</div>
                    <div className="text-white font-medium">{extractedFields.location || "—"}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-xs text-purple-300 mb-1">विभाग</div>
                    <div className="text-white font-medium">{extractedFields.department || "—"}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-xs text-purple-300 mb-1">अर्जेंसी</div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(extractedFields.urgency)}`}>
                      {extractedFields.urgency || "Medium"}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs text-purple-300 mb-1">विवरण (English)</div>
                  <div className="text-white/90">{extractedFields.description || "—"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {submitted && complaintId && (
            <div className="p-6 bg-green-500/20 border border-green-500/50 rounded-xl text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-green-300 mb-2">
                शिकायत सफलतापूर्वक दर्ज!
              </h3>
              <p className="text-green-200/80 mb-3">
                आपकी शिकायत प्रशासन को भेज दी गई है
              </p>
              <div className="inline-block px-4 py-2 bg-green-500/30 rounded-lg">
                <span className="text-sm text-green-300">शिकायत ID: </span>
                <span className="font-mono font-bold text-white">{complaintId}</span>
              </div>
              
              {/* New Complaint Button */}
              <button
                onClick={() => {
                  setAudioBlob(null);
                  setAudioUrl(null);
                  setTranscript("");
                  setExtractedFields(null);
                  setComplaintId(null);
                  setSubmitted(false);
                  setError(null);
                }}
                className="mt-4 block w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
              >
                नई शिकायत दर्ज करें
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-white/60 text-sm">
          <p>💡 टिप: स्पष्ट हिंदी में बोलें और अपना नाम, स्थान और समस्या बताएं</p>
        </div>
      </div>
    </div>
  );
}