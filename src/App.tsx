import { useState, useEffect } from 'react';
import axios from 'axios';
import { ScanInput } from './components/ScanInput';
import { ScanLoader } from './components/ScanLoader';
import { ReportCard } from './components/ReportCard';
import { AeoReport } from './types';
import { Cpu, Globe, Rocket, HelpCircle, Server, FileCheck, Layers } from 'lucide-react';

export default function App() {
  // Navigation & report state
  const [currentView, setCurrentView] = useState<'home' | 'report'>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AeoReport | null>(null);
  
  // Dashboard statistics
  const [stats, setStats] = useState({ totalScans: 148, avgScore: 82.4 });

  // Load statistics and check hash routes on startup
  useEffect(() => {
    // 1. Fetch live social-proof stats
    axios.get('/api/stats')
      .then(res => {
        if (res.data) {
          setStats({
            totalScans: res.data.totalScans || 148,
            avgScore: res.data.avgScore || 82.4
          });
        }
      })
      .catch(err => console.warn('Stats load warning:', err.message));

    // 2. Hash Route Synchronizer: supports bookmarking or URL shares
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/report/')) {
        const domain = hash.substring(9).trim();
        if (domain) {
          fetchExistingReport(domain);
        }
      } else {
        setCurrentView('home');
        setReport(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run once on load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch pre-existing report by domain
  const fetchExistingReport = async (domain: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/report/${domain}`);
      if (response.data) {
        setReport(response.data);
        setCurrentView('report');
        window.location.hash = `#/report/${domain}`;
      }
    } catch (err) {
      console.warn('Cached report not found, routing to scanner');
      // If report not found, run a fresh scan!
      handleStartScan(domain);
    } finally {
      setIsLoading(false);
    }
  };

  // Run a new audit scan
  const handleStartScan = async (domain: string) => {
    setIsLoading(true);
    setReport(null);
    setCurrentView('home');
    
    try {
      const response = await axios.post('/api/scan', { domain });
      if (response.data) {
        setReport(response.data);
        setCurrentView('report');
        window.location.hash = `#/report/${response.data.domain}`;
      }
    } catch (err: any) {
      console.error('Scan failed:', err);
      alert(err.response?.data?.error || 'A network error occurred while performing the AEO audit.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setCurrentView('home');
    window.location.hash = '';
  };

  return (
    <div id="aeo-app" className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans transition-all selection:bg-blue-500/20 selection:text-blue-900 pb-20">
      
      {/* Top Navigation Bar */}
      <header id="app-header" className="sticky top-0 z-40 bg-[#f5f5f7]/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 font-extrabold text-lg tracking-tight hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#007aff] text-white flex items-center justify-center shadow-md">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <span>AEO Analyzer</span>
          </button>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span className="hidden sm:inline-block">AI Compliance Engine v1.0</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        {isLoading && <ScanLoader />}

        {currentView === 'home' ? (
          <div id="home-view" className="space-y-16 py-8 animate-fadeIn">
            {/* HERO INTRODUCTION */}
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/50 text-[#007aff] text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                <Rocket className="h-3.5 w-3.5" /> Next-Generation SEO for LLMs
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Is Your Website Ready for AI Search Agents?
              </h1>
              
              <p className="text-gray-500 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
                Scan your domain in seconds. Receive an authoritative, 8-point Agentic Engine Optimization (AEO) audit score for OpenAI, Claude, and Perplexity crawlers.
              </p>
            </div>

            {/* SCANNING CONTROL */}
            <ScanInput onScan={handleStartScan} isLoading={isLoading} />

            {/* SOCIAL PROOF COUNTER */}
            <div id="social-proof-banner" className="text-center select-none">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <span>⚡ Join {stats.totalScans} domains audited today</span>
                <span className="text-gray-200">|</span>
                <span>Average Readiness: {stats.avgScore}%</span>
              </p>
            </div>

            {/* VALUE PROPOSITION GRID ("How It Works") */}
            <div id="how-it-works" className="pt-8">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Why Agentic Engine Optimization Matters
                </h3>
                <p className="text-gray-500 text-sm md:text-base mt-1">
                  AI-native search engines index and parse code differently than traditional web crawlers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-150">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#007aff] flex items-center justify-center mb-4">
                      <Globe className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 tracking-tight">
                      1. Check AI-Access Rules
                    </h4>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                      We check standard AI crawler rules in your <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">robots.txt</code> to verify that agents from Anthropic, Google, and OpenAI can actually scan your domain.
                    </p>
                  </div>
                  <span className="text-gray-300 text-4xl font-extrabold select-none text-right block mt-4">01</span>
                </div>

                {/* Step 2 */}
                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-150">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                      <Layers className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 tracking-tight">
                      2. Validate Structured Files
                    </h4>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                      Our system verifies emerging specifications like <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">llms.txt</code> and <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">agent-permissions.json</code> which direct fine-grained autonomous logic.
                    </p>
                  </div>
                  <span className="text-gray-300 text-4xl font-extrabold select-none text-right block mt-4">02</span>
                </div>

                {/* Step 3 */}
                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-150">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 tracking-tight">
                      3. Audit Semantic Markup
                    </h4>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                      We verify sitemaps, analyze structured schema data freshness, and run server-rendered accessibility tests for heavy Single-Page applications.
                    </p>
                  </div>
                  <span className="text-gray-300 text-4xl font-extrabold select-none text-right block mt-4">03</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div id="report-view" className="py-4 animate-fadeIn">
            {report && <ReportCard report={report} onReset={handleReset} />}
          </div>
        )}
      </main>
    </div>
  );
}
