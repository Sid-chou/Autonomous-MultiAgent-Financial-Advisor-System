// Loading spinner component
import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className={`${sizes[size]} relative`}>
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div
                    className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                    style={{ borderColor: '#4A6CF7', borderTopColor: 'transparent' }}
                ></div>
            </div>
            {message && (
                <p className="mt-4 text-sm font-medium" style={{ color: '#6B7280' }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
