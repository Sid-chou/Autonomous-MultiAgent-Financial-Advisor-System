import React, { useState } from 'react';
import { TrendingUp, Trash2, Plus, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#4A6CF7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function RiskPanel({ holdings, setHoldings, riskTolerance, setRiskTolerance }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addHolding = () => {
        setHoldings([...holdings, { symbol: '', quantity: 0, purchasePrice: 0, currentPrice: 0 }]);
    };

    const removeHolding = (index) => {
        setHoldings(holdings.filter((_, i) => i !== index));
    };

    const updateHolding = (index, field, value) => {
        const updated = [...holdings];
        updated[index][field] = field === 'symbol' ? value : parseFloat(value) || 0;
        setHoldings(updated);
    };

    const analyzeRisk = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:8080/api/risk/analyze', {
                holdings, riskTolerance
            });
            setAnalysis(response.data);
        } catch (err) {
            setError('Failed to connect to Risk Agent. Ensure backend is running on port 8080.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'LOW': return { bg: 'bg-green-500', text: 'text-green-500' };
            case 'MEDIUM': return { bg: 'bg-amber-500', text: 'text-amber-500' };
            case 'HIGH': return { bg: 'bg-red-500', text: 'text-red-500' };
            default: return { bg: 'bg-slate-500', text: 'text-slate-500' };
        }
    };

    const pieData = holdings.map(h => ({
        name: h.symbol,
        value: h.currentPrice * h.quantity
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel: Portfolio Input */}
            <div className="space-y-6">
                {/* Holdings Input */}
                <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-6 h-6" style={{ color: '#4A6CF7' }} />
                        <h2 className="font-semibold text-lg" style={{ color: '#1A1F37' }}>Indian Portfolio Holdings</h2>
                    </div>

                    {/* Holdings List */}
                    <div className="space-y-3">
                        {holdings.map((holding, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 border transition-all duration-200 hover:border-blue-200" style={{ borderColor: '#E0E4EC' }}>
                                <div className="grid grid-cols-12 gap-2">
                                    {/* Symbol */}
                                    <div className="col-span-12 sm:col-span-3">
                                        <label className="text-xs uppercase tracking-wide mb-1 block font-medium" style={{ color: '#6B7280' }}>
                                            NSE Symbol
                                        </label>
                                        <input
                                            type="text"
                                            value={holding.symbol}
                                            onChange={(e) => updateHolding(index, 'symbol', e.target.value)}
                                            placeholder="RELIANCE.NS"
                                            className="w-full border rounded-lg px-3 py-2 text-sm transition-all duration-200 outline-none focus:ring-2"
                                            style={{
                                                backgroundColor: 'white',
                                                borderColor: '#E0E4EC',
                                                color: '#1A1F37'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#4A6CF7'}
                                            onBlur={(e) => e.target.style.borderColor = '#E0E4EC'}
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div className="col-span-4 sm:col-span-3">
                                        <label className="text-xs uppercase tracking-wide mb-1 block font-medium" style={{ color: '#6B7280' }}>
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            value={holding.quantity}
                                            onChange={(e) => updateHolding(index, 'quantity', e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 text-sm transition-all duration-200 outline-none"
                                            style={{
                                                backgroundColor: 'white',
                                                borderColor: '#E0E4EC',
                                                color: '#1A1F37'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#4A6CF7'}
                                            onBlur={(e) => e.target.style.borderColor = '#E0E4EC'}
                                        />
                                    </div>

                                    {/* Purchase Price */}
                                    <div className="col-span-4 sm:col-span-3">
                                        <label className="text-xs uppercase tracking-wide mb-1 block font-medium" style={{ color: '#6B7280' }}>
                                            Purchase ₹
                                        </label>
                                        <input
                                            type="number"
                                            value={holding.purchasePrice}
                                            onChange={(e) => updateHolding(index, 'purchasePrice', e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 text-sm transition-all duration-200 outline-none"
                                            style={{
                                                backgroundColor: 'white',
                                                borderColor: '#E0E4EC',
                                                color: '#1A1F37'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#4A6CF7'}
                                            onBlur={(e) => e.target.style.borderColor = '#E0E4EC'}
                                        />
                                    </div>

                                    {/* Current Price */}
                                    <div className="col-span-3 sm:col-span-2">
                                        <label className="text-xs uppercase tracking-wide mb-1 block font-medium" style={{ color: '#6B7280' }}>
                                            Current ₹
                                        </label>
                                        <input
                                            type="number"
                                            value={holding.currentPrice}
                                            onChange={(e) => updateHolding(index, 'currentPrice', e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 text-sm transition-all duration-200 outline-none"
                                            style={{
                                                backgroundColor: 'white',
                                                borderColor: '#E0E4EC',
                                                color: '#1A1F37'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#4A6CF7'}
                                            onBlur={(e) => e.target.style.borderColor = '#E0E4EC'}
                                        />
                                    </div>

                                    {/* Delete Button */}
                                    <div className="col-span-1 flex items-end">
                                        <button
                                            onClick={() => removeHolding(index)}
                                            className="p-2 rounded-lg transition-all duration-200 hover:bg-red-50"
                                            style={{ color: '#EF4444' }}
                                            title="Remove holding"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Holding Button */}
                    <button
                        onClick={addHolding}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                        style={{ backgroundColor: '#4A6CF7' }}
                    >
                        <Plus className="w-5 h-5" />
                        Add Holding
                    </button>

                    {/* Risk Tolerance */}
                    <div className="mt-6 pt-6 border-t" style={{ borderColor: '#E0E4EC' }}>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: '#1A1F37' }}>Risk Tolerance</h3>
                        <div className="flex gap-2">
                            {['conservative', 'moderate', 'aggressive'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setRiskTolerance(level)}
                                    className="flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200"
                                    style={riskTolerance === level
                                        ? { backgroundColor: '#4A6CF7', color: 'white', boxShadow: '0 4px 12px rgba(74, 108, 247, 0.3)' }
                                        : { backgroundColor: '#F3F4F6', color: '#6B7280', border: '1px solid #E0E4EC' }
                                    }
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Analyze Button */}
                    <button
                        onClick={analyzeRisk}
                        disabled={loading || holdings.length === 0}
                        className={`w-full mt-6 flex items-center justify-center gap-3 py-4 px-6 rounded-lg font-semibold text-base text-white transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-[1.02]'}`}
                        style={{
                            background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #4A6CF7 0%, #5E7DFF 100%)',
                            boxShadow: loading ? 'none' : '0 4px 12px rgba(74, 108, 247, 0.3)'
                        }}
                    >
                        <BarChart3 className="w-5 h-5" />
                        {loading ? 'Analyzing...' : 'Analyze Portfolio Risk'}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Portfolio Distribution Chart */}
                {holdings.length > 0 && (
                    <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <PieChartIcon className="w-5 h-5" style={{ color: '#4A6CF7' }} />
                            <h3 className="font-semibold text-lg" style={{ color: '#1A1F37' }}>Portfolio Distribution</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => entry.name}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `₹${value.toFixed(2)}`}
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
                                <Legend wrapperStyle={{ color: '#6B7280' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Right Panel: Analysis Results */}
            <div>
                {analysis ? (
                    <div className="space-y-6">
                        {/* Risk Score Card */}
                        <div className={`${getRiskColor(analysis.riskLevel).bg} rounded-xl p-6 shadow-lg`}>
                            <p className="text-white/90 text-sm font-medium mb-2">🤖 AI Risk Assessment Complete</p>
                            <h2 className="text-white text-4xl font-bold mb-1">{analysis.riskLevel}</h2>
                            <p className="text-white text-2xl font-semibold mb-4">Score: {analysis.riskScore}/100</p>
                            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-white h-full rounded-full transition-all duration-500"
                                    style={{ width: `${analysis.riskScore}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h3 className="font-semibold text-lg mb-4" style={{ color: '#1A1F37' }}>📊 Risk Metrics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Total Value */}
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#6B7280' }}>Total Value</p>
                                    <p className="text-2xl font-bold" style={{ color: '#4A6CF7' }}>₹{analysis.totalValue.toFixed(2)}</p>
                                </div>

                                {/* Value at Risk */}
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#6B7280' }}>Value at Risk</p>
                                    <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>₹{analysis.valueAtRisk.toFixed(2)}</p>
                                </div>

                                {/* Volatility */}
                                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#6B7280' }}>Volatility (σ)</p>
                                    <p className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>{analysis.standardDeviation.toFixed(2)}%</p>
                                </div>

                                {/* Diversification */}
                                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#6B7280' }}>Diversification</p>
                                    <p className="text-2xl font-bold" style={{ color: '#10B981' }}>{analysis.diversificationScore.toFixed(0)}%</p>
                                </div>
                            </div>
                        </div>

                        {/* AI Insight */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border rounded-xl p-6 shadow-sm" style={{ borderColor: '#4A6CF7' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <BarChart3 className="w-5 h-5" style={{ color: '#4A6CF7' }} />
                                <h3 className="font-semibold text-lg" style={{ color: '#1A1F37' }}>Groq AI Insight (Llama 3.1 70B)</h3>
                            </div>
                            <p className="italic text-base leading-relaxed" style={{ color: '#374151' }}>
                                "{analysis.aiInsight}"
                            </p>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h3 className="font-semibold text-lg mb-4" style={{ color: '#1A1F37' }}>⚡ Agent Recommendations</h3>
                            <div className="space-y-3">
                                {analysis.recommendations.map((rec, index) => {
                                    const isWarning = rec.includes('⚠️');
                                    const isSuccess = rec.includes('✓');

                                    return (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg border"
                                            style={
                                                isWarning ? { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' } :
                                                    isSuccess ? { backgroundColor: '#D1FAE5', borderColor: '#10B981', color: '#065F46' } :
                                                        { backgroundColor: '#DBEAFE', borderColor: '#4A6CF7', color: '#1E40AF' }
                                            }
                                        >
                                            <p className="text-sm">{rec}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Empty State
                    <div className="bg-white rounded-xl border shadow-sm p-12 text-center" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <BarChart3 className="w-20 h-20 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                        <h3 className="text-lg font-medium mb-2" style={{ color: '#1A1F37' }}>Ready to Analyze</h3>
                        <p className="text-sm max-w-sm mx-auto" style={{ color: '#6B7280' }}>
                            Configure your Indian market holdings and click "Analyze Portfolio Risk" to see AI-powered risk assessment
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RiskPanel;
