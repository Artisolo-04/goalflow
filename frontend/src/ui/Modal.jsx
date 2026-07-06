import { useEffect } from 'react';
import { X } from 'lucide-react';

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[85vh] scrollbar-hide bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/50 animate-in zoom-in-95 fade-in duration-150"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-2xl">
          <h2 className="text-lg font-display font-semibold text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
