import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Cpu } from 'lucide-react';

const STATUS_MESSAGES = [
  'Checking robots.txt…',
  'Scanning schema markup…',
  'Testing server-side rendering…',
  'Fetching Core Web Vitals…',
  'Compiling your report…'
];

export function ScanLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="scan-loader-overlay"
      className="fixed inset-0 z-50 bg-[#f5f5f7]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
    >
      <div id="scan-loader-container" className="max-w-md w-full flex flex-col items-center">
        {/* Pulsing Scanner Visual */}
        <div className="relative mb-8 flex items-center justify-center">
          <motion.div
            id="scanner-pulse-outer-2"
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.15, 0, 0.15],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-32 h-32 rounded-full border-2 border-blue-400 bg-blue-100/10"
          />
          <motion.div
            id="scanner-pulse-outer-1"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-28 h-28 rounded-full border border-blue-500 bg-blue-200/20"
          />
          <motion.div
            id="scanner-icon-bg"
            animate={{
              boxShadow: [
                '0 0 10px rgba(0, 122, 255, 0.2)',
                '0 0 30px rgba(0, 122, 255, 0.5)',
                '0 0 10px rgba(0, 122, 255, 0.2)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-20 h-20 bg-gradient-to-tr from-[#007aff] to-blue-400 text-white rounded-2xl flex items-center justify-center shadow-lg relative z-10"
          >
            <Cpu className="h-10 w-10 animate-pulse" />
          </motion.div>
        </div>

        {/* Dynamic Text Messages */}
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight mb-2">
          Analyzing AEO Compliance
        </h2>
        
        <div className="h-8 overflow-hidden relative w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={STATUS_MESSAGES[msgIndex]}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="text-[#007aff] font-medium text-sm md:text-base absolute"
            >
              {STATUS_MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="text-gray-400 text-xs mt-8 max-w-xs leading-relaxed">
          Retrieving robots.txt, scanning metadata schemas, measuring server-side render efficiency, and evaluating AI crawlers.
        </p>
      </div>
    </div>
  );
}
