// Error Boundary component to catch React errors
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8ECF4' }}>
                    <div className="max-w-md w-full mx-4">
                        <div className="bg-white rounded-xl border shadow-lg p-8 text-center" style={{ borderColor: '#E0E4EC', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                                <AlertTriangle className="w-8 h-8" style={{ color: '#EF4444' }} />
                            </div>

                            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1F37' }}>
                                Oops! Something went wrong
                            </h2>

                            <p className="mb-6" style={{ color: '#6B7280' }}>
                                The application encountered an unexpected error. Don't worry, your data is safe.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mb-4 p-4 rounded-lg text-left overflow-auto max-h-40" style={{ backgroundColor: '#FEE2E2', borderColor: '#EF4444' }}>
                                    <p className="text-sm font-mono text-red-800">
                                        {this.state.error.toString()}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg"
                                style={{ backgroundColor: '#4A6CF7' }}
                            >
                                <RefreshCw className="w-5 h-5" />
                                Reload Application
                            </button>

                            <p className="mt-4 text-xs" style={{ color: '#9CA3AF' }}>
                                If the problem persists, please clear your browser cache.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
