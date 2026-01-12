'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, className = '', style }: BadgeProps) {
  const defaultStyle: React.CSSProperties = {
    backgroundColor: `color-mix(in srgb, var(--color-card-badge-bg) calc(var(--color-card-badge-opacity) * 100%), transparent)`,
    color: 'var(--color-card-badge-text)',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm ${className}`}
      style={style ? { ...defaultStyle, ...style } : defaultStyle}
    >
      {children}
    </div>
  );
}

export function BadgeSmall({ children, className = '' }: BadgeProps) {
  return (
    <div
      className={`inline-block rounded-full px-4 py-1 text-sm font-medium ${className}`}
      style={{
        backgroundColor: `color-mix(in srgb, var(--color-card-badge-bg) calc(var(--color-card-badge-opacity) * 100%), transparent)`,
        color: 'var(--color-card-badge-text)',
      }}
    >
      {children}
    </div>
  );
}
