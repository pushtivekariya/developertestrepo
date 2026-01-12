/**
 * Divider Component
 * Phase 7: Dynamic Theming System
 * 
 * Replaces RopeDivider with a solid color divider.
 * Uses CSS custom properties for color, thickness, and style.
 */

import { cn } from '@/lib/utils';

interface DividerProps {
  /**
   * Position of the divider relative to the parent section
   */
  position: 'top' | 'bottom';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Solid color divider that uses theme CSS variables
 * 
 * CSS Variables used:
 * - --divider-color: The divider color (default: ocean #A7D8DE)
 * - --divider-thickness: Height in pixels (default: 4px)
 * - --divider-style: Border style - solid, dashed, dotted (default: solid)
 * 
 * @example
 * ```tsx
 * <section className="relative">
 *   <Divider position="top" />
 *   <div>Section content</div>
 *   <Divider position="bottom" />
 * </section>
 * ```
 */
export function Divider({ position, className = '' }: DividerProps) {
  const positionClasses = position === 'top' 
    ? 'top-0' 
    : 'bottom-0';

  return (
    <div 
      className={cn(
        'absolute left-0 right-0 z-10 w-full',
        positionClasses,
        className
      )}
      style={{
        backgroundColor: 'var(--divider-color, #A7D8DE)',
        height: 'var(--divider-thickness, 4px)',
        borderStyle: 'var(--divider-style, solid)',
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Inline divider for use within content (not absolutely positioned)
 */
export function InlineDivider({ className = '' }: { className?: string }) {
  return (
    <hr 
      className={cn('border-0 my-8', className)}
      style={{
        backgroundColor: 'var(--divider-color, #A7D8DE)',
        height: 'var(--divider-thickness, 4px)',
      }}
      aria-hidden="true"
    />
  );
}
