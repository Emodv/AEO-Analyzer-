import React, { useState } from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface SaveScanBannerProps {
  reportId: string;
}

export function SaveScanBanner({ reportId }: SaveScanBannerProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide an email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/save-scan', {
        email,
        report_id: reportId
      });

      if (response.data?.success) {
        setIsSuccess(true);
      } else {
        setError('Could not save your scan. Please check your email format.');
      }
    } catch (err: any) {
      console.error('Save scan failed:', err);
      setError(err.response?.data?.error || 'Failed to trigger save request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="save-scan-banner"
      className="p-6 md:p-8 bg-gradient-to-r from-gray-900 to-slate-800 rounded-3xl border border-white/10 text-white mt-8 shadow-xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-md">
          <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-400" /> Save This Audit Report
          </h4>
          <p className="text-gray-300 text-sm mt-1 leading-relaxed">
            Enter your email and we'll dispatch a secure, permanent share link directly to your inbox so you can reference these metrics later.
          </p>
        </div>

        <div className="w-full md:w-auto">
          {isSuccess ? (
            <div id="save-success" className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 px-5 py-3 rounded-2xl">
              <Check className="h-5 w-5" />
              <span className="font-semibold text-sm">✅ Report link dispatched to inbox!</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="name@company.com"
                  className="w-full sm:w-64 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 text-sm bg-[#007aff] hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md transition-colors whitespace-nowrap cursor-pointer select-none"
                >
                  {isSubmitting ? 'Saving...' : 'Email Report Link'}
                </button>
              </div>
              {error && (
                <div className="text-red-400 text-xs flex items-center gap-1.5 px-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
