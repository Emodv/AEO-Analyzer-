import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { CheckpointResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CheckpointRowProps {
  checkpoint: CheckpointResult;
  index: number;
  key?: string;
}

export function CheckpointRow({ checkpoint, index }: CheckpointRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { pass, label, detail } = checkpoint;

  return (
    <div
      id={`checkpoint-row-${index}`}
      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 px-5 flex items-start gap-4 text-left focus:outline-none focus:ring-1 focus:ring-blue-100 rounded-xl transition-all cursor-pointer"
      >
        {/* Pass/Fail Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {pass ? (
            <CheckCircle2 className="h-5 w-5 text-[#34c759]" />
          ) : (
            <XCircle className="h-5 w-5 text-[#ff3b30]" />
          )}
        </div>

        {/* Text Headers */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-gray-900 text-sm md:text-base leading-tight">
              {label}
            </span>
            <div className="flex-shrink-0 text-gray-400">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
          
          <p className="text-gray-500 text-xs md:text-sm mt-1 line-clamp-1">
            {detail}
          </p>
        </div>
      </button>

      {/* Expandable detailed section */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-14 pb-4 text-xs md:text-sm text-gray-600 bg-gray-50/30 leading-relaxed border-t border-dashed border-gray-100 pt-2">
              <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-inner">
                <span className="font-semibold text-gray-700 block mb-1">Diagnostic Detail:</span>
                {detail}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
