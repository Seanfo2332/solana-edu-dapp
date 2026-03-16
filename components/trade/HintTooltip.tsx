'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface HintTooltipProps {
  text: string;
  className?: string;
}

export default function HintTooltip({ text, className = '' }: HintTooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setCoords({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const tooltip = open && mounted
    ? createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: coords.x,
              top: coords.y - 8,
              transform: 'translate(-50%, -100%)',
              zIndex: 9999,
            }}
            className="w-64 p-3 rounded-xl bg-[#1a1a24] border border-white/[0.08] shadow-xl shadow-black/60"
          >
            <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a24] border-r border-b border-white/[0.08] rotate-45 -mt-1" />
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <span className={`inline-flex items-center ${className}`}>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="w-4 h-4 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[9px] font-bold text-gray-500 hover:text-sol-green hover:border-sol-green/30 hover:bg-sol-green/10 transition-all cursor-help shrink-0"
        aria-label="Hint"
      >
        ?
      </button>
      {tooltip}
    </span>
  );
}
