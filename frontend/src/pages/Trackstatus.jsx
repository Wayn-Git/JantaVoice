import React, { useState } from "react";
import { Search, Loader2, ClipboardCheck, MapPin, Building2, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import axios from "axios";
import { useLanguage } from '../context/LanguageContext';

export default function TrackStatus() {
  const { t } = useLanguage();
  const [complaintId, setComplaintId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTrack = async () => {
    if (!complaintId.trim()) {
      setError("Please enter a Complaint ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get(`/api/complaint/status/${complaintId.trim()}`);

      if (response.data.success) {
        setResult(response.data.complaint);
      } else {
        setError(response.data.message || "Complaint not found");
      }
    } catch (err) {
      console.error("Track error:", err);
      if (err.response?.status === 404) {
        setError("Complaint ID not found. Please check and try again.");
      } else {
        setError("Technical error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return <CheckCircle className="w-5 h-5" />;
      case 'processing': return <Clock className="w-5 h-5" />;
      case 'pending': return <AlertTriangle className="w-5 h-5" />;
      default: return <ClipboardCheck className="w-5 h-5" />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return t('resolved');
      case 'processing': return t('processing');
      case 'pending': return t('pending');
      default: return status;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 py-20 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔍 {t('trackTitle')}
          </h1>
          <p className="text-gray-600">
            {t('trackSubtitle')}
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder={t('enterComplaintId')}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-4 text-lg font-medium focus:border-blue-500 focus:outline-none transition-all pr-28"
              value={complaintId}
              onChange={(e) => {
                setComplaintId(e.target.value);
                setError(null);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {t('track')}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <XCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* Result Card */}
        {result && (
          <div className="bg-white rounded-3xl p-6 shadow-lg animate-fade-in">
            {/* Status Header */}
            <div className={`flex items-center justify-between p-4 rounded-2xl mb-6 border ${getStatusColor(result.status)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <p className="text-xs uppercase font-bold opacity-70">{t('currentStatus')}</p>
                  <p className="font-bold text-lg">{getStatusText(result.status)}</p>
                </div>
              </div>
              {result.urgency && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(result.urgency)}`}>
                  {result.urgency}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              {/* ID */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">{t('complaintId')}</p>
                  <p className="font-mono font-bold text-gray-800">{result.id}</p>
                </div>
              </div>

              {/* Name */}
              {result.name && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('complainant')}</p>
                    <p className="font-bold text-gray-800">{result.name}</p>
                  </div>
                </div>
              )}

              {/* Department */}
              {result.department && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('department')}</p>
                    <p className="font-bold text-gray-800">{result.department}</p>
                  </div>
                </div>
              )}

              {/* Location */}
              {result.location && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('location')}</p>
                    <p className="font-bold text-gray-800">{result.location}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {result.description && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('description')}</p>
                  <p className="text-gray-700">{result.description}</p>
                </div>
              )}

              {/* Timestamp */}
              {result.timestamp && (
                <div className="text-center text-sm text-gray-500 pt-4 border-t">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {t('filedOn')}: {new Date(result.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!result && !error && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">
              {t('idTip')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}