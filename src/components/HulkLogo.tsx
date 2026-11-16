import React from 'react';

interface HulkLogoProps {
  compact?: boolean;
}

export const HulkLogo: React.FC<HulkLogoProps> = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#39FF14] to-[#14532D] p-[1.5px] shadow-neon">
        <div className="flex items-center justify-center w-full h-full rounded-[10px] bg-[#090B0A]">
          <svg
            viewBox="0 0 36 36"
            className="w-7 h-7 text-[#39FF14]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 3L31 9.5V19.5C31 26.8 25.4 31.8 18 33.5C10.6 31.8 5 26.8 5 19.5V9.5L18 3Z"
              stroke="currentColor"
              strokeWidth="2.4"
              fill="rgba(57, 255, 20, 0.1)"
            />
            <path
              d="M12 11V24M24 11V24M12 17.5H24"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-wider text-[#F5F7F5]">HULK</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30">
              FREE PRO
            </span>
          </div>
          <p className="text-[10px] font-bold tracking-[0.16em] text-[#929B95] uppercase">
            TRAIN HARD. TRACK SMART.
          </p>
        </div>
      )}
    </div>
  );
};
