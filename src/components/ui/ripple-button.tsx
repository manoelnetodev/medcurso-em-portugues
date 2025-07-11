import React, { useState, useRef } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface RippleButtonProps extends React.ComponentProps<typeof Button> {
  rippleColor?: string;
  duration?: number;
}

export const RippleButton = React.forwardRef<
  HTMLButtonElement,
  RippleButtonProps
>(({ children, className, rippleColor = 'rgba(255, 255, 255, 0.6)', duration = 600, onClick, ...props }, ref) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, duration);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(event);
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button
      ref={buttonRef}
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: Math.max(buttonRef.current?.offsetWidth || 0, buttonRef.current?.offsetHeight || 0),
            height: Math.max(buttonRef.current?.offsetWidth || 0, buttonRef.current?.offsetHeight || 0),
            background: rippleColor,
            transform: 'scale(0)',
            animation: `ripple ${duration}ms ease-out`,
          }}
        />
      ))}
    </Button>
  );
});

RippleButton.displayName = 'RippleButton'; 