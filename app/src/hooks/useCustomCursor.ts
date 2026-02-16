import { useEffect, useRef, useCallback } from 'react';

export const useCustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const isHovering = useRef(false);
  const lastMoveTime = useRef(Date.now());

  const animate = useCallback(() => {
    const now = Date.now();
    if (now - lastMoveTime.current > 100) {
      rafId.current = requestAnimationFrame(animate);
      return;
    }

    const dx = mousePos.current.x - cursorPos.current.x;
    const dy = mousePos.current.y - cursorPos.current.y;
    
    cursorPos.current.x += dx * 0.15;
    cursorPos.current.y += dy * 0.15;

    if (cursorRef.current) {
      cursorRef.current.style.left = `${cursorPos.current.x}px`;
      cursorRef.current.style.top = `${cursorPos.current.y}px`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    document.body.classList.add('custom-cursor-active');

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    cursorRef.current = cursor;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      lastMoveTime.current = Date.now();
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.dataset.cursor === 'hover'
      ) {
        isHovering.current = true;
        cursor.classList.add('hover');
      }
    };

    const handleMouseLeave = () => {
      isHovering.current = false;
      cursor.classList.remove('hover');
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseEnter, { passive: true });
    document.addEventListener('mouseout', handleMouseLeave, { passive: true });

    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(rafId.current);
      cursor.remove();
      document.body.classList.remove('custom-cursor-active');
    };
  }, [animate]);
};

export default useCustomCursor;
