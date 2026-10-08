/**
 * FUNDECHO - BRAND LOGO COMPONENT
 * Renders the official FundEcho logo:
 * - Fluid green-to-blue "F" ribbon
 * - Vibrant 3D Earth globe in the inner curve
 * - Concentric broadcast/echo waves
 */

import React from 'react';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  subtitleColor?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textColor,
  subtitleColor,
}) => {
  const sizeClasses = typeof size === 'string' ? SIZE_MAP[size] || 'w-10 h-10' : '';
  const customDimensions = typeof size === 'number' ? { width: size, height: size } : {};

  const logoImg = (
    <img
      src="/logo.svg"
      alt="FundEcho Logo"
      className={`${sizeClasses} shrink-0 object-contain drop-shadow-xs ${className}`}
      style={customDimensions}
      referrerPolicy="no-referrer"
    />
  );

  if (!showText) {
    return logoImg;
  }

  return (
    <div className="flex items-center gap-2.5 text-left">
      {logoImg}
      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight leading-none ${
            textColor || 'text-slate-900 dark:text-white'
          } ${size === 'lg' || size === 'xl' ? 'text-2xl' : 'text-lg sm:text-xl'}`}
        >
          FundEcho
        </span>
        <span
          className={`text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase mt-0.5 ${
            subtitleColor || 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Global Opportunity Network
        </span>
      </div>
    </div>
  );
};
