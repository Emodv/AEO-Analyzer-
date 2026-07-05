import React, { useState } from 'react';
import { Search, ShieldAlert } from 'lucide-react';

interface ScanInputProps {
  onScan: (domain: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export function ScanInput({ onScan, isLoading, initialValue = '' }: ScanInputProps) {
  const [domain, setDomain] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const validateDomain = (val: string): boolean => {
    let clean = val.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//i, '');
    clean = clean.replace(/\/.*$/, '');
    
    // Quick regex for a valid domain (e.g. google.com, subdomain.test.co)
    const domainRegex = /^([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,18}$/;
    return domainRegex.test(clean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!domain.trim()) {
      setError('Please enter a website URL');
      return;
    }

    if (!validateDomain(domain)) {
      setError('Please enter a valid domain (e.g., company.com)');
      return;
    }

    // Pass normalized domain up
    let clean = domain.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//i, '');
    clean = clean.replace(/\/.*$/, '');
    onScan(clean);
  };

  return (
    <div id="scan-input-wrapper" className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="domain-input"
            type="text"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              if (error) setError(null);
            }}
            placeholder="yourdomain.com"
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-base md:text-lg"
          />
        </div>
        <button
          id="scan-button"
          type="submit"
          disabled={isLoading}
          className="px-8 py-4 bg-[#007aff] hover:bg-blue-600 active:scale-98 text-white font-medium rounded-2xl shadow-md transition-all duration-150 flex items-center justify-center gap-2 text-base md:text-lg cursor-pointer select-none"
        >
          {isLoading ? 'Auditing...' : 'Scan Website'}
        </button>
      </form>
      {error && (
        <div id="scan-error" className="mt-3 flex items-center gap-2 text-red-500 text-sm justify-center bg-red-50 py-2 px-4 rounded-xl border border-red-100 animate-fadeIn">
          <ShieldAlert className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
