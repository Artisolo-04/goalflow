import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastList } from '../context/ToastContext';

const STYLES = {
  success: { accent: 'bg-emerald-500', text: 'text-emerald-300', bar: 'bg-emerald-400', icon: CheckCircle2 },
  error: { accent: 'bg-orange-500', text: 'text-orange-300', bar: 'bg-orange-400', icon: XCircle },
  info: { accent: 'bg-indigo-500', text: 'text-indigo-300', bar: 'bg-indigo-400', icon: Info },
};

function ToastContainer() {
  const { toasts, dismiss, duration } = useToastList();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-[300] flex flex-col gap-2 pointer-events-none
                 inset-x-3 bottom-20 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-full sm:max-w-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {toasts.map((t) => {
        const style = STYLES[t.type] || STYLES.info;
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            className={`
              relative overflow-hidden pointer-events-auto
              flex items-start gap-2.5 rounded-xl p-4
              bg-gray-900/95 border border-gray-800 shadow-2xl shadow-black/50 backdrop-blur-md
              transition-all duration-200 ease-out
              ${t.leaving
                ? 'opacity-0 translate-y-1 scale-95'
                : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-3 zoom-in-95 duration-250'}
            `}
          >
            <Icon size={16} className={`shrink-0 mt-0.5 ${style.text}`} />
            <p className="text-sm flex-1 text-gray-100 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-gray-500 hover:text-gray-300 transition-colors shrink-0 -mt-0.5"
            >
              <X size={14} />
            </button>
            <span
              className={`absolute bottom-0 left-0 h-0.5 ${style.bar} opacity-70`}
              style={{
                animation: t.leaving ? 'none' : `toast-shrink ${duration}ms linear forwards`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
