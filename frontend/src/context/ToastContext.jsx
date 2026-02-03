// Toast Notification Context for app-wide notifications
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);

        if (duration !== Infinity) {
            setTimeout(() => {
                setToasts(prev => prev.filter(toast => toast.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
    const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, warning, info, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2" style={{ maxWidth: '400px' }}>
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

const Toast = ({ id, message, type, onClose }) => {
    const config = {
        success: {
            icon: CheckCircle,
            bg: '#D1FAE5',
            border: '#10B981',
            text: '#065F46',
            iconColor: '#10B981'
        },
        error: {
            icon: XCircle,
            bg: '#FEE2E2',
            border: '#EF4444',
            text: '#991B1B',
            iconColor: '#EF4444'
        },
        warning: {
            icon: AlertTriangle,
            bg: '#FEF3C7',
            border: '#F59E0B',
            text: '#92400E',
            iconColor: '#F59E0B'
        },
        info: {
            icon: Info,
            bg: '#DBEAFE',
            border: '#4A6CF7',
            text: '#1E40AF',
            iconColor: '#4A6CF7'
        }
    };

    const { icon: Icon, bg, border, text, iconColor } = config[type];

    return (
        <div
            className="flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in-right"
            style={{ backgroundColor: bg, borderColor: border }}
        >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: iconColor }} />
            <p className="flex-1 text-sm font-medium" style={{ color: text }}>
                {message}
            </p>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                style={{ color: text }}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
