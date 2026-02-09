import React, { useState } from "react";
import { Camera, MapPin, Loader2, CheckCircle, AlertCircle, Building2, User, FileText, AlertTriangle } from "lucide-react";
import axios from "axios";
import { useLanguage } from '../context/LanguageContext';

export default function ComplaintForm() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState(null);
  const [error, setError] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    department: "",
    urgency: "Medium",
    description: "",
    photo: null
  });

  const departments = [
    { id: "Road Department", label: t('roadDept'), icon: "🛣️" },
    { id: "Water Department", label: t('waterDept'), icon: "💧" },
    { id: "Sanitation Department", label: t('sanitationDept'), icon: "🗑️" },
    { id: "Electricity Department", label: t('electricityDept'), icon: "⚡" },
    { id: "Health Department", label: t('healthDept'), icon: "🏥" },
    { id: "General Administration", label: t('generalComplaint'), icon: "🏛️" }
  ];

  const urgencyLevels = [
    { id: "Low", label: t('low'), color: "bg-green-500" },
    { id: "Medium", label: t('medium'), color: "bg-yellow-500" },
    { id: "High", label: t('high'), color: "bg-red-500" }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            handleInputChange("location", address);
          } catch {
            handleInputChange("location", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        },
        () => {
          setError("Could not get location. Please enter manually.");
        }
      );
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleInputChange("photo", file);
    }
  };

  const validateStep = () => {
    if (step === 1 && !formData.department) {
      setError("Please select a department");
      return false;
    }
    if (step === 2) {
      if (!formData.name.trim()) {
        setError("Please enter your name");
        return false;
      }
      if (!formData.location.trim()) {
        setError("Please enter location");
        return false;
      }
      if (!formData.description.trim()) {
        setError("Please describe the issue");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("location", formData.location);
      submitData.append("department", formData.department);
      submitData.append("urgency", formData.urgency);
      submitData.append("description", formData.description);

      if (formData.photo) {
        submitData.append("photo", formData.photo);
      }

      const response = await axios.post("/api/complaint", submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        setComplaintId(response.data.complaintId);
        setSubmitted(true);
      } else {
        setError(response.data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.response?.data?.message || "Technical error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            {t('complaintSuccess')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('complaintSentTo')} {formData.department}
          </p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">{t('complaintId')}</p>
            <p className="text-2xl font-mono font-bold text-green-700">{complaintId}</p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
              setFormData({
                name: "",
                location: "",
                department: "",
                urgency: "Medium",
                description: "",
                photo: null
              });
            }}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            {t('fileNewComplaint')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📝 {t('fileComplaint')}
          </h1>
          <p className="text-gray-600">
            {t('complaintSubtitle')}
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${step >= i ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            />
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-xs text-gray-500 mb-6 px-2">
          <span className={step >= 1 ? 'text-blue-600 font-semibold' : ''}>{t('selectDept')}</span>
          <span className={step >= 2 ? 'text-blue-600 font-semibold' : ''}>{t('fillDetails')}</span>
          <span className={step >= 3 ? 'text-blue-600 font-semibold' : ''}>{t('confirm')}</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Step 1: Department Selection */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                {t('selectDept')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {departments.map(dept => (
                  <button
                    key={dept.id}
                    onClick={() => handleInputChange("department", dept.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.department === dept.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <span className="text-2xl">{dept.icon}</span>
                    <p className="font-medium mt-1">{dept.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  {t('yourName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t('location')} *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder={t('locationPlaceholder')}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={getLocation}
                    className="px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  {t('issueDescription')} *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder={t('descPlaceholder')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  {t('urgencyLevel')}
                </label>
                <div className="flex gap-3">
                  {urgencyLevels.map(level => (
                    <button
                      key={level.id}
                      onClick={() => handleInputChange("urgency", level.id)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${formData.urgency === level.id
                          ? `${level.color} text-white`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Camera className="w-4 h-4 inline mr-1" />
                  {t('photo')}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full p-3 border border-dashed border-gray-300 rounded-xl"
                />
                {formData.photo && (
                  <p className="text-sm text-green-600 mt-2">✓ {formData.photo.name}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">📋 {t('confirm')}</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('department')}:</span>
                  <span className="font-medium">{formData.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('yourName')}:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('location')}:</span>
                  <span className="font-medium text-right max-w-[200px] truncate">{formData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('urgencyLevel')}:</span>
                  <span className={`px-2 py-0.5 rounded text-white text-sm ${formData.urgency === 'High' ? 'bg-red-500' :
                      formData.urgency === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>{formData.urgency}</span>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-gray-600 text-sm">{t('description')}:</span>
                  <p className="mt-1 text-gray-800">{formData.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 text-gray-600 font-medium hover:text-gray-800"
              >
                ← {t('back')}
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                {t('next')} →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('submitting')}
                  </>
                ) : (
                  <>{t('submitComplaint')} ✓</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}