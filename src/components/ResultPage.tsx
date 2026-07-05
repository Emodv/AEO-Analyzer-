"use client";

import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  Check, 
  ArrowLeft, 
  Copy, 
  Sparkles, 
  Wrench, 
  Send, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export interface Check {
  name: string;
  pass: boolean;
  reason: string;
}

export interface Report {
  domain: string;
  score: number;
  status: 'AI-Ready' | 'Needs Work' | 'Urgent Action Required';
  checks: Check[];
  insight: string;
  scannedAt: string;
}

interface ThemeConfig {
  hex: string;
  badge: string;
  button: string;
  card: string;
  text: string;
  border: string;
}

function getTheme(score: number): ThemeConfig {
  if (score <= 25) {
    return {
      hex: '#EF4444',
      badge: 'bg-red-50 text-red-700 border-red-100',
      button: 'bg-red-600 hover:bg-red-700',
      card: 'bg-red-50/40 border-red-100/50',
      text: 'text-red-600 font-semibold',
      border: 'border-red-200',
    };
  } else if (score <= 50) {
    return {
      hex: '#F97316',
      badge: 'bg-orange-50/80 text-orange-700 border-orange-100',
      button: 'bg-orange-600 hover:bg-orange-700',
      card: 'bg-orange-50/40 border-orange-100/50',
      text: 'text-orange-600 font-semibold',
      border: 'border-orange-200',
    };
  } else if (score <= 75) {
    return {
      hex: '#EAB308',
      badge: 'bg-yellow-50 text-yellow-800 border-yellow-100',
      button: 'bg-yellow-500 hover:bg-yellow-600',
      card: 'bg-yellow-50/40 border-yellow-100/50',
      text: 'text-yellow-600 font-semibold',
      border: 'border-yellow-200',
    };
  } else {
    return {
      hex: '#10B981',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      card: 'bg-emerald-50/40 border-emerald-100/50',
      text: 'text-emerald-600 font-semibold',
      border: 'border-emerald-200',
    };
  }
}

// FIX_TEMPLATES Constant Verbatim
export const FIX_TEMPLATES: Record<string, {
  description: string;
  steps: string[];
  code: string;
}> = {
  "Robots.txt & AI Crawler Access": {
    description: "Allow all major AI crawlers to access your site.",
    steps: [
      "Create a `robots.txt` file in your website's root directory.",
      "Add the following rules to allow Anthropic, OpenAI, Perplexity, and Googlebot.",
      "Upload the file to your server."
    ],
    code: `User-agent: anthropic-ai\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nSitemap: https://yourdomain.com/sitemap.xml`
  },
  "Schema Markup Coverage": {
    description: "Add structured data to help AI agents understand your content.",
    steps: [
      "Identify the primary content type (Product, Article, Organization, etc.).",
      "Copy the JSON-LD snippet below and replace the placeholder values.",
      "Paste it in the <head> section of your homepage (or relevant pages)."
    ],
    code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "Your Product Name",\n  "description": "Your product description",\n  "brand": "Your Brand",\n  "offers": {\n    "@type": "Offer",\n    "price": "19.99",\n    "priceCurrency": "USD"\n  }\n}\n</script>`
  },
  "llms.txt Presence": {
    description: "Provide a plain-text file that LLMs can read to understand your site structure.",
    steps: [
      "Create a file named `llms.txt` in your website root.",
      "Copy the content below and customize it.",
      "Upload the file to your server."
    ],
    code: `# Your Site Name\n\n## Important Pages\n- Homepage: https://yourdomain.com\n- About: https://yourdomain.com/about\n- Contact: https://yourdomain.com/contact\n\n## Key Content\nInclude a brief summary of your site's purpose and main topics.`
  },
  "Agent-Permissions.json": {
    description: "Explicitly declare permissions for AI agents.",
    steps: [
      "Create a file named `agent-permissions.json` in your website root.",
      "Use the JSON below and adjust the allowed endpoints.",
      "Upload it to your server."
    ],
    code: `{\n  "allow": [\n    "/api/public/*",\n    "/blog/*"\n  ],\n  "disallow": [\n    "/admin/*",\n    "/private/*"\n  ]\n}`
  },
  "Content Discoverability": {
    description: "Ensure your HTML is semantically structured for easy parsing.",
    steps: [
      "Use proper heading hierarchy (H1, H2, H3, etc.) without skipping levels.",
      "Wrap main content in <main> or <article> tags.",
      "Use <ul> and <ol> for lists, and add alt attributes to images."
    ],
    code: `<!-- Example structure -->\n<article>\n  <h1>Main Title</h1>\n  <h2>Sub-section</h2>\n  <p>Content here...</p>\n  <ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n  </ul>\n  <img src="photo.jpg" alt="Description of image">\n</article>`
  },
  "JS Rendering Accessibility": {
    description: "Ensure critical content is available without JavaScript.",
    steps: [
      "Identify content that depends on client-side JavaScript.",
      "Implement server-side rendering (SSR) or static generation (SSG) for that content.",
      "If SSR isn't feasible, use `<noscript>` tags to show a fallback message."
    ],
    code: `<!-- For critical content, render it on the server:\n     In Next.js: use getServerSideProps or generateStaticParams.\n     In other frameworks, prerender the content. -->\n\n<!-- Fallback for non-JS users -->\n<noscript>\n  <div>Please enable JavaScript to see the full content. Alternatively, view our <a href="/basic-version">basic version</a>.</div>\n</noscript>`
  },
  "Core Web Vitals": {
    description: "Optimize loading speed and responsiveness.",
    steps: [
      "Compress images using WebP format and lazy-load them.",
      "Minify CSS and JavaScript, and use a CDN.",
      "Reduce server response time by caching and using a fast hosting provider."
    ],
    code: `<!-- Example: lazy-load images -->\n<img src="image.jpg" loading="lazy" alt="Description">\n\n<!-- Inline critical CSS -->\n<style>\n  /* Critical styles for above-the-fold content */\n</style>\n\n<!-- Defer non-critical scripts -->\n<script defer src="non-critical.js"></script>`
  },
  "Structured Data Freshness": {
    description: "Update your schema to use current, non-deprecated properties.",
    steps: [
      "Review your JSON-LD schemas for deprecated properties (e.g., 'creator' -> 'author').",
      "Use the updated snippet below as a reference.",
      "Ensure all required properties are present."
    ],
    code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "Your Article Title",\n  "author": {\n    "@type": "Person",\n    "name": "Author Name"\n  },\n  "datePublished": "2025-01-01"\n}\n</script>`
  }
};

// Clipboard copy helper supporting iframe context fallback
function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch(() => resolve(fallbackCopy(text)));
    } else {
      resolve(fallbackCopy(text));
    }
  });
}

function fallbackCopy(text: string): boolean {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback copy failed", err);
    return false;
  }
}

// Reusable Copy Button component matching quiet luxury style
export function CopyButton({
  code,
  label = "Copy",
  className = "bg-white/10 hover:bg-white/20 text-white border border-white/10"
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all active:scale-95 cursor-pointer select-none flex items-center gap-1.5 shrink-0 ${
        copied ? 'bg-emerald-600 text-white border-emerald-600' : className
      }`}
    >
      <Copy size={12} className={copied ? "hidden" : "block"} />
      <span>{copied ? 'Copied! ✓' : label}</span>
    </button>
  );
}

// FixModal (Single Checkpoint) with focus trap & escape key behavior
interface FixModalProps {
  checkpointName: string;
  template: {
    description: string;
    steps: string[];
    code: string;
  };
  onClose: () => void;
  onMarkFixed: (fixed: boolean) => void;
  isMarkedFixed: boolean;
}

export function FixModal({
  checkpointName,
  template,
  onClose,
  onMarkFixed,
  isMarkedFixed,
}: FixModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const element = modalRef.current;
    if (element) {
      const focusableElements = element.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();

        const trapFocus = (ev: KeyboardEvent) => {
          if (ev.key !== 'Tab') return;
          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];
          if (ev.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              ev.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              ev.preventDefault();
            }
          }
        };

        element.addEventListener('keydown', trapFocus);
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
          element.removeEventListener('keydown', trapFocus);
        };
      }
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-sm rounded-2xl p-4 relative shadow-xl border border-[#F0F0F0] text-[#1E1E1E] animate-scaleIn flex flex-col gap-3 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header containing Mark as Fixed Checkbox and the touch target Close Button */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          {/* Mark as fixed toggle */}
          <div className="flex items-center gap-2">
            <input
              id="modal-mark-fixed-checkbox"
              type="checkbox"
              checked={isMarkedFixed}
              onChange={(e) => onMarkFixed(e.target.checked)}
              className="w-4 h-4 text-[#007aff] bg-white border-gray-300 rounded focus:ring-1 focus:ring-[#007aff] cursor-pointer"
            />
            <label
              htmlFor="modal-mark-fixed-checkbox"
              className="text-xs font-semibold text-gray-700 cursor-pointer select-none"
            >
              Mark as fixed
            </label>
          </div>

          {/* Touch target compliant Close (44x44px) */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-11 h-11 flex items-center justify-center -mr-2 text-gray-400 hover:text-[#1E1E1E] hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Title and Description */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight text-[#1E1E1E]">
            Fix: {checkpointName}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Steps */}
        <div className="bg-gray-50/50 border border-[#F0F0F0] rounded-lg p-2.5 space-y-1.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
            Implementation Steps
          </span>
          <ol className="list-decimal ml-4 space-y-1 text-xs text-gray-600 font-medium">
            {template.steps.map((step, idx) => (
              <li key={idx} className="leading-snug">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Code Block Container */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Code Block
            </span>
            <CopyButton
              code={template.code}
              label="Copy Code"
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white"
            />
          </div>
          <div className="bg-gray-900 text-emerald-400 font-mono text-xs rounded-lg p-3 overflow-x-auto relative shadow-inner max-h-[140px] border border-gray-950">
            <pre className="whitespace-pre">{template.code}</pre>
          </div>
        </div>

        {/* Footer Reminder */}
        <div className="pt-1 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-medium">
            💡 After you add this, re-scan your site to confirm the fix.
          </p>
        </div>
      </div>
    </div>
  );
}

// FixAllDrawer (All Failed Checkpoints) with focus trap & beautiful slide-up
interface FixAllDrawerProps {
  failedChecks: Check[];
  onClose: () => void;
  onMarkFixed: (name: string, fixed: boolean) => void;
  markedFixed: Record<string, boolean>;
}

export function FixAllDrawer({
  failedChecks,
  onClose,
  onMarkFixed,
  markedFixed,
}: FixAllDrawerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'individual'>('all');
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const element = drawerRef.current;
    if (element) {
      const focusableElements = element.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();

        const trapFocus = (ev: KeyboardEvent) => {
          if (ev.key !== 'Tab') return;
          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];
          if (ev.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              ev.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              ev.preventDefault();
            }
          }
        };

        element.addEventListener('keydown', trapFocus);
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
          element.removeEventListener('keydown', trapFocus);
        };
      }
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Join all failed templates with \n\n---\n\n as requested
  const allConcatenatedCode = failedChecks
    .map((check) => {
      const template = FIX_TEMPLATES[check.name];
      if (!template) return '';
      return `/* =========================================================\n   FIX FOR: ${check.name}\n   ========================================================= */\n${template.code}`;
    })
    .filter(Boolean)
    .join('\n\n---\n\n');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        className="bg-white w-full max-w-[480px] mx-auto rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] border-t border-[#F0F0F0] text-[#1E1E1E] animate-slideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek top indicator bar */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🛠️</span>
            <h3 className="text-xs font-semibold tracking-tight text-[#1E1E1E]">
              Fix All ({failedChecks.length}) Failed Issues
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="w-11 h-11 flex items-center justify-center -mr-2 text-gray-400 hover:text-[#1E1E1E] hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quiet Luxury Switcher Tab Bar */}
        <div className="px-4 py-2 bg-gray-50 border-b border-[#F0F0F0]">
          <div className="flex bg-gray-200/60 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[#1E1E1E] shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Copy All Code
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'individual'
                  ? 'bg-white text-[#1E1E1E] shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Copy Individual
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {activeTab === 'all' ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 text-center leading-normal">
                Copy all failed checkpoints' code blocks joined together.
              </p>
              
              <div className="bg-gray-900 rounded-lg p-3 max-h-[160px] overflow-y-auto font-mono text-[10px] text-emerald-400 shadow-inner select-all border border-gray-950">
                <pre className="whitespace-pre">{allConcatenatedCode}</pre>
              </div>

              <div className="pt-1">
                <CopyButton
                  code={allConcatenatedCode}
                  label="Copy Combined Code Blocks"
                  className="w-full bg-[#1E1E1E] hover:bg-black text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-semibold text-xs shadow-sm hover:shadow-md transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {failedChecks.map((check) => {
                const temp = FIX_TEMPLATES[check.name];
                return (
                  <div
                    key={check.name}
                    className="border border-[#F0F0F0] rounded-xl p-3 bg-white space-y-2 hover:border-gray-300 transition-all shadow-[0_1px_4px_rgba(0,0,0,0.01)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-800 truncate">
                        {check.name}
                      </span>
                      {temp && (
                        <CopyButton
                          code={temp.code}
                          label="Copy"
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 border border-gray-200"
                        />
                      )}
                    </div>
                    {temp && (
                      <p className="text-[11px] text-gray-400 leading-normal">
                        {temp.description}
                      </p>
                    )}

                    {/* Mark as fixed */}
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                      <input
                        type="checkbox"
                        id={`drawer-check-${check.name}`}
                        checked={!!markedFixed[check.name]}
                        onChange={(e) => onMarkFixed(check.name, e.target.checked)}
                        className="w-3.5 h-3.5 text-[#007aff] bg-white border-gray-300 rounded focus:ring-1 focus:ring-[#007aff]"
                      />
                      <label
                        htmlFor={`drawer-check-${check.name}`}
                        className="text-[10px] font-semibold text-gray-500 cursor-pointer select-none"
                      >
                        Mark as fixed
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 text-center">
          <p className="text-[10px] text-gray-400 font-medium">
            💡 Paste these implementations directly on your web pages.
          </p>
        </div>
      </div>
    </div>
  );
}

// ResultPage Main Export Component
export default function ResultPage({
  report,
  onSaveEmail,
  onBack,
}: {
  report: Report;
  onSaveEmail: (email: string) => void;
  onBack?: () => void;
}) {
  const [localPass, setLocalPass] = useState<Record<string, boolean>>({});
  const [selectedFix, setSelectedFix] = useState<string | null>(null);
  const [fixAllOpen, setFixAllOpen] = useState(false);

  const [animatedScore, setAnimatedScore] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);

  // Reactive calculations for overrides
  const mergedChecks = report.checks.map(check => ({
    ...check,
    pass: localPass[check.name] !== undefined ? localPass[check.name] : check.pass
  }));

  const failedChecks = mergedChecks.filter(check => !check.pass);
  const failedChecksCount = failedChecks.length;

  // Compute dynamic score reactively based on local overrides
  const originalScore = report.score;
  const failedOriginalCount = report.checks.filter(c => !c.pass).length;
  const newlyFixedCount = mergedChecks.filter(
    c => c.pass && !report.checks.find(oc => oc.name === c.name)?.pass
  ).length;

  const dynamicScore = failedOriginalCount > 0
    ? Math.min(100, Math.round(originalScore + (newlyFixedCount / failedOriginalCount) * (100 - originalScore)))
    : originalScore;

  const theme = getTheme(dynamicScore);

  // SVG parameters
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  // Smooth count animation
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 800;
    const startScore = animatedScore;
    const targetScore = dynamicScore;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = progress * (2 - progress);
      setAnimatedScore(Math.round(startScore + easedProgress * (targetScore - startScore)));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [dynamicScore]);

  // Sort: failed items first, then passed
  const sortedChecks = [...mergedChecks].sort((a, b) => {
    if (a.pass === b.pass) return 0;
    return a.pass ? 1 : -1;
  });

  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      onSaveEmail(emailInput.trim());
      setEmailSaved(true);
      setEmailInput('');
      setTimeout(() => setEmailSaved(false), 5000);
    }
  };

  const handleToggleMarkFixed = (name: string, fixed: boolean) => {
    setLocalPass(prev => ({
      ...prev,
      [name]: fixed
    }));
  };

  return (
    <div className="w-full max-w-[480px] mx-auto bg-[#FAFAFA] text-[#1E1E1E] sm:border sm:border-[#F0F0F0] sm:rounded-[24px] sm:shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden min-h-screen px-4 py-3 space-y-3 font-sans relative flex flex-col justify-between">
      
      {/* Top Part */}
      <div className="space-y-3 flex-grow">
        
        {/* Header */}
        <div className="flex items-center justify-between pt-2 pb-1 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-1.5 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 hover:bg-[#F0F0F0] rounded-full transition-colors text-gray-400 hover:text-[#1E1E1E] cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <span className="text-xl font-semibold text-[#1E1E1E] truncate max-w-[220px]">
              {report.domain}
            </span>
          </div>
          <span className="text-xs text-gray-400">Scanned just now</span>
        </div>

        {/* Compact Score Area */}
        <div className="flex flex-col items-center text-center mt-1 select-none">
          {/* Circular SVG Meter */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="#F0F0F0"
                strokeWidth={strokeWidth}
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={theme.hex}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-75"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center -mt-0.5">
              <span className="text-4xl font-bold tracking-tight text-[#1E1E1E]">
                {animatedScore}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                / 100
              </span>
              <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                AEO READINESS
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${theme.badge}`}>
            {dynamicScore === 100 ? 'AI-Ready' : failedChecksCount > 3 ? 'Urgent Action Required' : 'Needs Work'}
          </div>

          {/* Minimalist status summary */}
          <p className="text-xs text-gray-500 mt-1 font-medium leading-tight">
            {dynamicScore === 100 
              ? 'Your site is fully indexable and compliant for agent discovery.' 
              : `Your site has ${failedChecksCount} checkpoint${failedChecksCount === 1 ? '' : 's'} remaining to be AI-ready.`
            }
          </p>
        </div>

        {/* Checklist (Failed Items First) in elegant 2-column grid */}
        <div className="space-y-1.5 pt-1">
          <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Access Checklist
          </h4>
          
          <div className="grid grid-cols-2 gap-1.5">
            {sortedChecks.map((check, idx) => (
              <div
                key={check.name}
                title={check.reason}
                style={{
                  opacity: 0,
                  animation: `fadeIn 0.2s forwards`,
                  animationDelay: `${idx * 40}ms`
                }}
                className="bg-white border border-[#F0F0F0] rounded-xl p-2 flex items-center justify-between min-w-0 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all group"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-xs shrink-0 select-none">
                    {check.pass ? '✅' : '❌'}
                  </span>
                  <span className="text-[11px] font-medium text-[#1E1E1E] truncate" title={check.name}>
                    {check.name}
                  </span>
                </div>
                
                {!check.pass && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFix(check.name);
                    }}
                    className="text-blue-600 hover:text-blue-800 underline text-[10px] font-semibold shrink-0 cursor-pointer ml-1"
                  >
                    Fix
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Global CTA "Let's Fix Them All" (Visible if any failures exist) */}
        {failedChecksCount > 0 && (
          <div className="space-y-1">
            <button
              onClick={() => setFixAllOpen(true)}
              className="w-full bg-[#1E1E1E] hover:bg-black active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer select-none text-xs"
            >
              <Sparkles size={13} />
              <span>Let's Fix Them All</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center font-medium">
              Get custom instructions and code templates to configure all failed checkpoints.
            </p>
          </div>
        )}

        {/* Impact Stat Card in Elegant Subtle Styling */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 space-y-1">
          <h5 className="text-xs font-semibold text-blue-900 flex items-center gap-1">
            <span>📈</span> Business Impact
          </h5>
          <p className="text-[11px] text-blue-800/85 leading-relaxed font-medium">
            Over 50% of traffic is now navigated by AI. AI-ready sites index higher and are chosen by discovery agents 4x more often.
          </p>
        </div>

        {/* Instant WhatsApp / Telegram assistance banner */}
        <div className="bg-white border border-[#F0F0F0] rounded-xl p-2.5 flex items-center justify-between text-left shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="min-w-0">
            <h4 className="text-[11px] font-semibold text-gray-800 flex items-center gap-1">
              <span className="text-[#007aff]">⚡</span> AEO Assistance
            </h4>
            <p className="text-[9px] text-gray-500 truncate">Discuss fixes with an expert (+1 416 400 4699)</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <a
              href={`https://wa.me/14164004699?text=Hello!%20My%20website%20(${report.domain})%20scored%20${dynamicScore}/100%20on%20AEO%20Analyzer.%20I'd%20love%20to%20discuss%20fixes.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25d366] hover:bg-[#20ba5a] text-white text-[10px] font-semibold px-2 py-1 rounded transition-all flex items-center gap-1"
            >
              <MessageCircle size={10} />
              WhatsApp
            </a>
            <a
              href="https://t.me/+14164004699"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0088cc] hover:bg-[#0077b3] text-white text-[10px] font-semibold px-2 py-1 rounded transition-all flex items-center gap-1"
            >
              <Send size={10} />
              Telegram
            </a>
          </div>
        </div>

      </div>

      {/* Secondary Content Section (Scrollable on small screens if height overflows) */}
      <div className="space-y-3 pt-2 border-t border-gray-100 flex-shrink-0">
        
        {/* Gemini AEO Insight box */}
        <div className="bg-gray-50 border border-[#F0F0F0] rounded-xl p-3 flex items-start gap-2.5">
          <span className="text-xs select-none mt-0.5">💡</span>
          <div>
            <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Gemini AEO Insight
            </h6>
            <p className="text-xs text-gray-600 italic leading-relaxed mt-0.5">
              "{report.insight}"
            </p>
          </div>
        </div>

        {/* Save this report email capture */}
        <div className="bg-white border border-[#F0F0F0] rounded-xl p-3 space-y-2 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Save This Audit Report
            </span>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
              Send a permanent, shareable backup direct to your inbox.
            </p>
          </div>

          {emailSaved ? (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 py-1.5 px-3 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5">
              <span>✓ Report dispatched successfully!</span>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex gap-1.5">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Your email"
                className="flex-grow px-2.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 bg-gray-50 border border-[#F0F0F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white transition-all font-medium"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E1E1E] hover:bg-black rounded-lg transition-colors cursor-pointer select-none"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Conditionally Render FixModal */}
      {selectedFix && FIX_TEMPLATES[selectedFix] && (
        <FixModal
          checkpointName={selectedFix}
          template={FIX_TEMPLATES[selectedFix]}
          onClose={() => setSelectedFix(null)}
          onMarkFixed={(fixed) => handleToggleMarkFixed(selectedFix, fixed)}
          isMarkedFixed={!!localPass[selectedFix]}
        />
      )}

      {/* Conditionally Render FixAllDrawer */}
      {fixAllOpen && (
        <FixAllDrawer
          failedChecks={failedChecks}
          onClose={() => setFixAllOpen(false)}
          onMarkFixed={handleToggleMarkFixed}
          markedFixed={localPass}
        />
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slideUp {
          animation: slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Footer */}
      <div className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest pt-2 pb-1 select-none">
        Powered by AEO Analyzer
      </div>
    </div>
  );
}
