import React, { useEffect } from 'react';
import { Toast as ToastType } from '../context/ToastContext';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const getToastStyles = () => {
    const baseStyles = 'toast-item';
    switch (toast.type) {
      case 'success':
        return `${baseStyles} toast-success`;
      case 'error':
        return `${baseStyles} toast-error`;
      case 'warning':
        return `${baseStyles} toast-warning`;
      case 'info':
      default:
        return `${baseStyles} toast-info`;
    }
  };

  return (
    <div className={getToastStyles()}>
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close"
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
