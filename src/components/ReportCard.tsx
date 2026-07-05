import { useState } from 'react';
import { AeoReport } from '../types';
import { ScoreMeter } from './ScoreMeter';
import { CheckpointRow } from './CheckpointRow';
import { SaveScanBanner } from './SaveScanBanner';
import ResultPage, { Check, Report } from './ResultPage';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowLeft, Sparkles, Smartphone, Monitor } from 'lucide-react';

interface ReportCardProps {
  report: AeoReport;
  onReset: () => void;
}

export function ReportCard({ report, onReset }: ReportCardProps) {
  const { id, domain, score, status, checks } = report;

  // Retrieve AI Executive Summary (cast as any to capture backend metadata)
  const aiSummary = (report as any).aiSummary || '';

  // Theme style mapping based on AEO Score status
  const getStatusConfig = (s: string) => {
    switch (s) {
      case 'AI-Ready':
        return {
          bg: 'bg-green-50 text-green-700 border-green-200',
          badge: 'bg-[#34c759]',
          icon: <ShieldCheck className="h-5 w-5 text-[#34c759]" />,
          text: 'AI-Ready',
          description: 'Your website satisfies critical requirements and is fully accessible to AI crawlers, agent search engines, and Large Language Models.'
        };
      case 'Needs Work':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          badge: 'bg-[#ff9f0a]',
          icon: <AlertTriangle className="h-5 w-5 text-[#ff9f0a]" />,
          text: 'Needs Work',
          description: 'Your domain has moderate compliance but faces structural barriers that could block or distort indexing by ChatGPT, Perplexity, or Claude.'
        };
      default:
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          badge: 'bg-[#ff3b30]',
          icon: <ShieldAlert className="h-5 w-5 text-[#ff3b30]" />,
          text: 'Urgent Action Required',
          description: 'Critical compliance failures are active. Major search crawlers and autonomous agents are locked out or cannot parse your structured sitemaps.'
        };
    }
  };

  const [activeTab, setActiveTab] = useState<'mobile' | 'dashboard'>('mobile');

  const statusConfig = getStatusConfig(status);

  // Map database format to requested component's Report structure
  const checksArray: Check[] = Object.values(checks).map((chk: any) => ({
    name: chk.label || 'Checkpoint',
    pass: chk.pass,
    reason: chk.detail || 'No further explanation provided.',
  }));

  const mobileReport: Report = {
    domain,
    score,
    status,
    checks: checksArray,
    insight: aiSummary || 'Check status of robots.txt, schema standards, llms.txt, and renderability.',
    scannedAt: report.created_at || new Date().toISOString()
  };

  const handleSaveEmail = async (email: string) => {
    try {
      await axios.post('/api/save-scan', {
        email,
        report_id: id
      });
    } catch (err) {
      console.error('Save scan email failed:', err);
    }
  };

  return (
    <div id="aeo-report-card" className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Button Action & Segment Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-950 text-sm font-semibold transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Scan another website</span>
        </button>

        {/* Premium iOS-style Segment Controller */}
        <div className="bg-gray-200/60 p-1 rounded-2xl flex items-center gap-1 border border-gray-300/20 shadow-inner w-full md:w-auto">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all select-none cursor-pointer ${
              activeTab === 'mobile'
                ? 'bg-white text-[#007aff] shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Mobile Result View</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all select-none cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-[#007aff] shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Monitor className="h-4 w-4" />
            <span>Desktop Dashboard</span>
          </button>
        </div>

        {report.cached && (
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full border border-gray-200/50">
            ⚡ Cached Report
          </span>
        )}
      </div>

      {activeTab === 'mobile' ? (
        <div className="flex justify-center sm:py-4 sm:bg-gray-100/50 sm:rounded-[40px] sm:border sm:border-gray-200/30 w-full">
          <ResultPage report={mobileReport} onSaveEmail={handleSaveEmail} onBack={onReset} />
        </div>
      ) : (
        /* Main Glassmorphism Card Frame */
        <div
          id="report-card-inner"
          className="relative overflow-hidden bg-white/75 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-gray-100 pb-8">
            {/* Header left */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#007aff]">
                  AEO Compliance Audit
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mt-1 truncate">
                  {domain}
                </h2>
              </div>

              {/* Status callout panel */}
              <div className={`p-4 rounded-2xl border flex gap-3.5 ${statusConfig.bg}`}>
                <div className="flex-shrink-0 mt-0.5">{statusConfig.icon}</div>
                <div>
                  <p className="font-bold text-sm md:text-base tracking-tight leading-tight">
                    Status: {statusConfig.text}
                  </p>
                  <p className="text-xs md:text-sm mt-1 leading-relaxed opacity-90">
                    {statusConfig.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Header right ScoreMeter Circle */}
            <div className="md:col-span-4 flex justify-center">
              <ScoreMeter score={score} />
            </div>
          </div>

          {/* AI EXECUTIVE SUMMARY CALLOUT BOX */}
          {aiSummary && (
            <div id="ai-summary-callout" className="my-6 p-5 bg-gradient-to-tr from-blue-50/50 via-indigo-50/20 to-transparent rounded-2xl border border-blue-100/50 flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#007aff] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  Gemini AEO Insights
                </h4>
                <p className="text-xs md:text-sm text-gray-700 italic leading-relaxed mt-1">
                  "{aiSummary}"
                </p>
              </div>
            </div>
          )}

          {/* CHECKPOINTS TITLE */}
          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-4 px-1">
              8-Point Agentic Compliance Breakdown
            </h3>
            
            {/* List of rows */}
            <div className="border border-gray-100 rounded-2xl bg-white/50 divide-y divide-gray-100 overflow-hidden shadow-sm">
              {Object.entries(checks).map(([key, value], idx) => (
                <CheckpointRow key={key} checkpoint={value} index={idx} />
              ))}
            </div>
          </div>

          {/* LEAD CAPTURE CALL TO ACTION SECTION */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-center space-y-4">
            <h4 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Need Expert Help Fixing Failed Checkpoints?
            </h4>
            <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
              Our expert engineering team implements schema standards, direct files, and semantic page optimization. Get direct feedback and a free quote on WhatsApp or Telegram within minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/14164004699?text=Hello!%20My%20website%20(${domain})%20scored%20${score}/100%20on%20the%20AEO%20Analyzer.%20I'd%20love%20to%20discuss%20how%20to%20fix%20the%20failed%20checkpoints.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#25d366] hover:bg-[#20ba5a] active:scale-98 text-white font-bold rounded-2xl shadow-lg hover:shadow-green-500/10 transition-all cursor-pointer select-none text-sm md:text-base"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.449 5.423 0 9.832-4.388 9.835-9.784.002-2.614-1.011-5.074-2.853-6.918C16.412 2.057 13.953.955 11.347.955 5.922.955 1.512 5.343 1.51 10.739c-.001 1.745.474 3.447 1.378 4.96l-.999 3.648 3.758-.993zM16.14 13.25c-.247-.123-1.463-.722-1.69-.804-.227-.083-.393-.123-.558.124-.166.247-.641.804-.785.969-.144.165-.289.185-.536.062-.247-.124-1.044-.385-1.988-1.227-.735-.656-1.232-1.466-1.376-1.714-.144-.247-.015-.38.109-.503.111-.11.247-.289.371-.433.124-.144.166-.247.247-.412.083-.165.042-.31-.02-.433-.062-.124-.558-1.345-.764-1.84-.2-.483-.404-.418-.558-.426-.144-.007-.31-.009-.475-.009-.165 0-.433.062-.659.31-.227.247-.866.845-.866 2.062 0 1.216.887 2.392.986 2.529.1.137 1.747 2.668 4.232 3.738.591.254 1.053.406 1.412.52.593.188 1.133.161 1.56.097.476-.071 1.463-.598 1.67-1.175.206-.577.206-1.072.144-1.175-.062-.103-.227-.165-.475-.289z" />
                </svg>
                <span>WhatsApp Message</span>
              </a>
              <a
                href="https://t.me/+14164004699"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0088cc] hover:bg-[#0077b3] active:scale-98 text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer select-none text-sm md:text-base"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.18l-1.88 8.87c-.14.64-.53.8-.1.08l-2.87-2.11-1.39 1.34c-.15.15-.28.28-.58.28l.2-2.94 5.36-4.84c.23-.21-.05-.32-.36-.12L9.46 12.3 6.6 11.4c-.62-.19-.63-.62.13-.92l11.17-4.3c.52-.19.97.12.76 1z"/>
                </svg>
                <span>Telegram Message</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Save Scan Banner Link */}
      {id && activeTab === 'dashboard' && <SaveScanBanner reportId={id} />}
    </div>
  );
}
