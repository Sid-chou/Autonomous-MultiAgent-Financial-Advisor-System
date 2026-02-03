import React, { useState } from 'react';
import { TrendingUp, RefreshCw, ArrowRightLeft, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function OptimizationPanel({ holdings, riskTolerance }) {
    const [optimization, setOptimization] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const optimize = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:8080/api/optimization/analyze', {
                holdings, riskTolerance
            });
            setOptimization(response.data);
        } catch (err) {
            setError('Failed to connect to Optimization Agent');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const allocationData = optimization ? [
        { name: 'Stocks', current: optimization.currentAllocation.Stocks, target: optimization.targetAllocation.Stocks },
        { name: 'Bonds', current: optimization.currentAllocation.Bonds, target: optimization.targetAllocation.Bonds },
        { name: 'Cash', current: optimization.currentAllocation.Cash || 0, target: optimization.targetAllocation.Cash || 0 }
    ] : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div className="flex items-center gap-3 mb-2">
                    <RefreshCw className="w-6 h-6" style={{ color: '#4A6CF7' }} />
                    <h2 className="text-2xl font-bold" style={{ color: '#1A1F37' }}>Portfolio Optimization Agent</h2>
                </div>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                    Analyzes your portfolio allocation and suggests rebalancing trades for optimal risk-adjusted returns
                </p>
            </div>

            {/* Action Button */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <button
                        onClick={optimize}
                        disabled={loading || holdings.length === 0}
                        className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg font-semibold text-base text-white mb-4 transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-[1.02]'}`}
                        style={{
                            background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #4A6CF7 0%, #5E7DFF 100%)',
                            boxShadow: loading ? 'none' : '0 4px 12px rgba(74, 108, 247, 0.3)'
                        }}
                    >
                        <TrendingUp className="w-5 h-5" />
                        {loading ? 'Optimizing...' : 'Optimize Portfolio'}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {optimization && (
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold mb-3" style={{ color: '#1A1F37' }}>Risk Profile</h3>
                            <div className="text-center py-3 px-4 rounded-lg font-bold text-lg text-white" style={{ background: 'linear-gradient(135deg, #4A6CF7 0%, #5E7DFF 100%)' }}>
                                {riskTolerance.toUpperCase()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Allocation Chart */}
                {optimization && (
                    <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <h3 className="font-semibold text-lg mb-4" style={{ color: '#1A1F37' }}>Current vs Target Allocation</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={allocationData}>
                                <XAxis dataKey="name" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid rgba(148, 163, 184, 0.3)',
                                        borderRadius: '8px',
                                        color: '#1e293b',
                                        backdropFilter: 'blur(10px)',
                                        WebkitBackdropFilter: 'blur(10px)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    }}
                                />
                                <Bar dataKey="current" fill="#4A6CF7" name="Current %" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="target" fill="#10b981" name="Target %" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {optimization && (
                <>
                    {/* Recommended Trades */}
                    <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <ArrowRightLeft className="w-5 h-5" style={{ color: '#10B981' }} />
                            <h3 className="font-semibold text-lg" style={{ color: '#1A1F37' }}>Recommended Trades</h3>
                        </div>
                        <div className="border-t pt-4" style={{ borderColor: '#E0E4EC' }}>
                            {optimization.rebalanceTrades.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left border-b" style={{ borderColor: '#E0E4EC' }}>
                                                <th className="pb-3 font-semibold text-sm" style={{ color: '#6B7280' }}>Action</th>
                                                <th className="pb-3 font-semibold text-sm" style={{ color: '#6B7280' }}>Symbol</th>
                                                <th className="pb-3 font-semibold text-sm text-right" style={{ color: '#6B7280' }}>Quantity</th>
                                                <th className="pb-3 font-semibold text-sm text-right" style={{ color: '#6B7280' }}>Value (₹)</th>
                                                <th className="pb-3 font-semibold text-sm" style={{ color: '#6B7280' }}>Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {optimization.rebalanceTrades.map((trade, idx) => (
                                                <tr key={idx} className="border-b" style={{ borderColor: '#E0E4EC' }}>
                                                    <td className="py-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold`}
                                                            style={trade.action === 'BUY'
                                                                ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                                                                : { backgroundColor: '#FEE2E2', color: '#991B1B' }
                                                            }
                                                        >
                                                            {trade.action}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 font-semibold" style={{ color: '#1A1F37' }}>{trade.symbol}</td>
                                                    <td className="py-3 text-right" style={{ color: '#374151' }}>{trade.quantity}</td>
                                                    <td className="py-3 text-right" style={{ color: '#374151' }}>₹{trade.value.toFixed(2)}</td>
                                                    <td className="py-3 text-sm" style={{ color: '#6B7280' }}>{trade.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-700 text-sm">Portfolio is already well-balanced! No rebalancing needed.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Impact & AI Insight */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Projected Impact */}
                        <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h3 className="font-semibold text-lg mb-4" style={{ color: '#1A1F37' }}>Projected Impact</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#6B7280' }}>Return Improvement</p>
                                    <p className="text-3xl font-bold" style={{ color: '#10B981' }}>
                                        {optimization.projectedReturn >= 0 ? '+' : ''}{optimization.projectedReturn.toFixed(2)}%
                                    </p>
                                </div>
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#6B7280' }}>Risk Reduction</p>
                                    <p className="text-3xl font-bold" style={{ color: '#4A6CF7' }}>
                                        {optimization.projectedRiskReduction.toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* AI Insight */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border rounded-xl p-6 shadow-sm" style={{ borderColor: '#F59E0B' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <BarChart3 className="w-5 h-5" style={{ color: '#F59E0B' }} />
                                <h3 className="font-semibold text-lg" style={{ color: '#1A1F37' }}>AI Optimization Insight</h3>
                            </div>
                            <p className="italic text-base leading-relaxed" style={{ color: '#374151' }}>
                                "{optimization.aiInsight}"
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* Empty State */}
            {!optimization && (
                <div className="bg-white rounded-xl border shadow-sm p-12 text-center" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <RefreshCw className="w-20 h-20 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                    <h3 className="text-lg font-medium mb-2" style={{ color: '#1A1F37' }}>Ready to Optimize</h3>
                    <p className="text-sm max-w-sm mx-auto" style={{ color: '#6B7280' }}>
                        Click "Optimize Portfolio" to get advanced rebalancing recommendations and allocation analysis
                    </p>
                </div>
            )}
        </div>
    );
}

export default OptimizationPanel;
