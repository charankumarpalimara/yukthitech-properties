import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideScrollbar = false,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass =
    {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    }[size] || 'max-w-lg';
  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={`bg-white rounded-t-[28px] sm:rounded-lg shadow-xl w-full max-w-full sm:${sizeClass} animate-in fade-in slide-in-from-bottom sm:zoom-in duration-300`}
      >
        {/* Mobile bottom sheet grab handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 block sm:hidden" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-[28px] sm:rounded-t-lg">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          className={`p-6 max-h-[75vh] sm:max-h-[85vh] overflow-y-auto overflow-x-visible ${hideScrollbar ? 'scrollbar-hide' : 'custom-scrollbar'}`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
