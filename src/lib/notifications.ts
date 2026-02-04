import toast from 'react-hot-toast';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

const defaultOptions: ToastOptions = {
  duration: 3000,
  position: 'top-center',
};

export function showToast(message: string, type: ToastType = 'info', options?: ToastOptions) {
  const mergedOptions = { ...defaultOptions, ...options };

  switch (type) {
    case 'success':
      toast.success(message, {
        ...mergedOptions,
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: '600',
        },
      });
      break;
    case 'error':
      toast.error(message, {
        ...mergedOptions,
        icon: '❌',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: '600',
        },
      });
      break;
    case 'warning':
      toast(message, {
        ...mergedOptions,
        icon: '⚠️',
        style: {
          background: '#f59e0b',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: '600',
        },
      });
      break;
    case 'info':
    default:
      toast(message, {
        ...mergedOptions,
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: '600',
        },
      });
      break;
  }
}

export function showSuccess(message: string, options?: ToastOptions) {
  showToast(message, 'success', options);
}

export function showError(message: string, options?: ToastOptions) {
  showToast(message, 'error', options);
}

export function showWarning(message: string, options?: ToastOptions) {
  showToast(message, 'warning', options);
}

export function showInfo(message: string, options?: ToastOptions) {
  showToast(message, 'info', options);
}
