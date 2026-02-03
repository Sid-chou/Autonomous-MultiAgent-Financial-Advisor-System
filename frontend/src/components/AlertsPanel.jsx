import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, XCircle, CheckCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

function AlertsPanel({ holdings, setAlertCount }) {
    const [alerts, setAlerts] = useState([]);

    const checkAlerts = async () => {

        try {
            const response = await axios.post('http://localhost:8080/api/alerts/check', {
                holdings, riskTolerance: 'moderate'
            });
            setAlerts(response.data);
            const unreadCount = response.data.filter(a => !a.read).length;
            setAlertCount(unreadCount);
        } catch (err) {
            console.error('Alert check failed:', err);
        }
    };

    const clearAlerts = async () => {
        try {
            await axios.delete('http://localhost:8080/api/alerts');
            setAlerts([]);
            setAlertCount(0);
        } catch (err) {
            console.error('Failed to clear alerts:', err);
        }
    };

    useEffect(() => {
        if (holdings.length > 0) {
            checkAlerts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [holdings]);

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'CRITICAL': return <XCircle className="w-6 h-6" style={{ color: '#EF4444' }} />;
            case 'WARNING': return <AlertTriangle className="w-6 h-6" style={{ color: '#F59E0B' }} />;
            default: return <Info className="w-6 h-6" style={{ color: '#4A6CF7' }} />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return { backgroundColor: '#FEE2E2', borderColor: '#EF4444' };
            case 'WARNING': return { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' };
            default: return { backgroundColor: '#DBEAFE', borderColor: '#4A6CF7' };
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'PRICE_MOVEMENT': return 'Price Alert';
            case 'RISK_THRESHOLD': return 'Risk Alert';
            case 'REBALANCE_NEEDED': return 'Rebalance';
            case 'MARKET_EVENT': return 'Market Event';
            case 'DIVERSIFICATION': return 'Diversification';
            default: return type;
        }
    };

    const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
    const warningCount = alerts.filter(a => a.severity === 'WARNING').length;
    const infoCount = alerts.filter(a => a.severity === 'INFO').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Bell className="w-6 h-6" style={{ color: '#4A6CF7' }} />
                            <h2 className="text-2xl font-bold" style={{ color: '#1A1F37' }}>Alert & Notification Agent</h2>
                        </div>
                        <p className="text-sm" style={{ color: '#6B7280' }}>Intelligent portfolio monitoring and warnings</p>
                    </div>
                    <button
                        onClick={clearAlerts}
                        disabled={alerts.length === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${alerts.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100'}`}
                        style={{ backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: '#EF4444' }}
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                </div>
            </div>

            {/* Alert Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Critical */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 border rounded-xl p-6 shadow-sm" style={{ borderColor: '#EF4444' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-6 h-6" style={{ color: '#EF4444' }} />
                        <h3 className="text-lg font-bold" style={{ color: '#1A1F37' }}>Critical</h3>
                    </div>
                    <p className="text-5xl font-bold mb-2" style={{ color: '#1A1F37' }}>{criticalCount}</p>
                    <p className="text-sm" style={{ color: '#6B7280' }}>Requires immediate attention</p>
                </div>

                {/* Warning */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border rounded-xl p-6 shadow-sm" style={{ borderColor: '#F59E0B' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-6 h-6" style={{ color: '#F59E0B' }} />
                        <h3 className="text-lg font-bold" style={{ color: '#1A1F37' }}>Warning</h3>
                    </div>
                    <p className="text-5xl font-bold mb-2" style={{ color: '#1A1F37' }}>{warningCount}</p>
                    <p className="text-sm" style={{ color: '#6B7280' }}>Review recommended</p>
                </div>

                {/* Info */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border rounded-xl p-6 shadow-sm" style={{ borderColor: '#4A6CF7' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Info className="w-6 h-6" style={{ color: '#4A6CF7' }} />
                        <h3 className="text-lg font-bold" style={{ color: '#1A1F37' }}>Info</h3>
                    </div>
                    <p className="text-5xl font-bold mb-2" style={{ color: '#1A1F37' }}>{infoCount}</p>
                    <p className="text-sm" style={{ color: '#6B7280' }}>Informational only</p>
                </div>
            </div>

            {/* Alerts List */}
            <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <h3 className="font-semibold text-lg mb-4" style={{ color: '#1A1F37' }}>
                    Active Alerts ({alerts.length})
                </h3>
                <div className="border-t pt-4" style={{ borderColor: '#E0E4EC' }}>
                    {alerts.length > 0 ? (
                        <div className="space-y-4">
                            {alerts.map((alert, idx) => (
                                <div
                                    key={idx}
                                    className="border rounded-xl p-4"
                                    style={getSeverityColor(alert.severity)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            {getSeverityIcon(alert.severity)}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: 'rgba(26, 31, 55, 0.1)', color: '#1A1F37' }}>
                                                    {getTypeLabel(alert.type)}
                                                </span>
                                                {alert.symbol && (
                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full border" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', borderColor: '#4A6CF7' }}>
                                                        {alert.symbol}
                                                    </span>
                                                )}
                                                <span className="text-xs ml-auto" style={{ color: '#9CA3AF' }}>
                                                    {new Date(alert.timestamp).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <p className="font-semibold mb-2" style={{ color: '#1A1F37' }}>
                                                {alert.message}
                                            </p>
                                            {alert.aiExplanation && (
                                                <div className="rounded-lg p-3 mt-2" style={{ backgroundColor: 'rgba(26, 31, 55, 0.05)' }}>
                                                    <p className="text-sm italic" style={{ color: '#374151' }}>
                                                        <strong style={{ color: '#1A1F37' }}>AI Explanation:</strong> {alert.aiExplanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <CheckCircle className="w-20 h-20 mx-auto mb-4" style={{ color: '#10B981', opacity: 0.5 }} />
                            <h4 className="text-lg font-medium mb-2" style={{ color: '#1A1F37' }}>All Clear!</h4>
                            <p className="text-sm" style={{ color: '#6B7280' }}>
                                No alerts! Your portfolio looks good.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AlertsPanel;
