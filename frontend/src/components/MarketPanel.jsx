import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, LineChart } from 'lucide-react';
import axios from 'axios';

function MarketPanel() {
    const [market, setMarket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLive, setIsLive] = useState(false);

    const fetchMarket = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('http://localhost:8080/api/market/current');
            setMarket(response.data);
            setLastUpdated(new Date());
            setIsLive(true);
        } catch (err) {
            setError('Failed to fetch market data');
            console.error(err);
            setIsLive(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarket();

        // Auto-refresh every 60 seconds
        const interval = setInterval(() => {
            fetchMarket();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const getTrendIcon = (direction) => {
        switch (direction) {
            case 'UP': return <TrendingUp className="w-6 h-6" style={{ color: '#10B981' }} />;
            case 'DOWN': return <TrendingDown className="w-6 h-6" style={{ color: '#EF4444' }} />;
            default: return <Minus className="w-6 h-6" style={{ color: '#9CA3AF' }} />;
        }
    };

    const getTrendColor = (direction) => {
        switch (direction) {
            case 'UP': return { background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', borderColor: '#10B981' };
            case 'DOWN': return { background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', borderColor: '#EF4444' };
            default: return { background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', borderColor: '#9CA3AF' };
        }
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'POSITIVE': return { backgroundColor: '#D1FAE5', color: '#065F46', borderColor: '#10B981' };
            case 'NEGATIVE': return { backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: '#EF4444' };
            default: return { backgroundColor: '#F3F4F6', color: '#6B7280', borderColor: '#9CA3AF' };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <LineChart className="w-6 h-6" style={{ color: '#4A6CF7' }} />
                            <h2 className="text-2xl font-bold" style={{ color: '#1A1F37' }}>Indian Market Analysis Agent</h2>
                            {isLive && (
                                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border" style={{ backgroundColor: '#D1FAE5', color: '#065F46', borderColor: '#10B981' }}>
                                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10B981' }}></span>
                                    LIVE
                                </span>
                            )}
                        </div>
                        <p className="text-sm" style={{ color: '#6B7280' }}>
                            Real-time monitoring of NSE/BSE indices
                            {lastUpdated && (
                                <span style={{ color: '#9CA3AF' }}>
                                    • Updated {new Date(lastUpdated).toLocaleTimeString('en-IN')}
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={fetchMarket}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-white ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                        style={{ backgroundColor: '#4A6CF7' }}
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {market && (
                <>
                    {/* Market Indices */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* NIFTY 50 */}
                        <div className="border rounded-xl p-6 shadow-sm" style={{ ...getTrendColor(market.indices.NIFTY50.direction) }}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-bold" style={{ color: '#1A1F37' }}>NIFTY 50</h3>
                                {getTrendIcon(market.indices.NIFTY50.direction)}
                            </div>
                            <p className="text-4xl font-bold mb-2" style={{ color: '#1A1F37' }}>
                                {market.indices.NIFTY50.currentValue.toFixed(2)}
                            </p>
                            <p className={`text-xl font-semibold`} style={{ color: market.indices.NIFTY50.changePercent >= 0 ? '#10B981' : '#EF4444' }}>
                                {market.indices.NIFTY50.changePercent >= 0 ? '+' : ''}{market.indices.NIFTY50.changePercent.toFixed(2)}%
                            </p>
                        </div>

                        {/* SENSEX */}
                        <div className="border rounded-xl p-6 shadow-sm" style={{ ...getTrendColor(market.indices.SENSEX.direction) }}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-bold" style={{ color: '#1A1F37' }}>BSE SENSEX</h3>
                                {getTrendIcon(market.indices.SENSEX.direction)}
                            </div>
                            <p className="text-4xl font-bold mb-2" style={{ color: '#1A1F37' }}>
                                {market.indices.SENSEX.currentValue.toFixed(2)}
                            </p>
                            <p className={`text-xl font-semibold`} style={{ color: market.indices.SENSEX.changePercent >= 0 ? '#10B981' : '#EF4444' }}>
                                {market.indices.SENSEX.changePercent >= 0 ? '+' : ''}{market.indices.SENSEX.changePercent.toFixed(2)}%
                            </p>
                        </div>

                        {/* BANK NIFTY */}
                        <div className="border rounded-xl p-6 shadow-sm" style={{ ...getTrendColor(market.indices.BANKNIFTY.direction) }}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-bold" style={{ color: '#1A1F37' }}>BANK NIFTY</h3>
                                {getTrendIcon(market.indices.BANKNIFTY.direction)}
                            </div>
                            <p className="text-4xl font-bold mb-2" style={{ color: '#1A1F37' }}>
                                {market.indices.BANKNIFTY.currentValue.toFixed(2)}
                            </p>
                            <p className={`text-xl font-semibold`} style={{ color: market.indices.BANKNIFTY.changePercent >= 0 ? '#10B981' : '#EF4444' }}>
                                {market.indices.BANKNIFTY.changePercent >= 0 ? '+' : ''}{market.indices.BANKNIFTY.changePercent.toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    {/* Market Summary & Sector Performance */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Market Summary */}
                        <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h3 className="font-semibold text-lg mb-4" style={{ color: '#1A1F37' }}>Market Summary</h3>
                            <div className="flex flex-wrap gap-3 mb-4">
                                <span className="px-4 py-2 rounded-full font-semibold border" style={
                                    market.trend === 'BULLISH' ? { backgroundColor: '#D1FAE5', color: '#065F46', borderColor: '#10B981' } :
                                        market.trend === 'BEARISH' ? { backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: '#EF4444' } :
                                            { backgroundColor: '#F3F4F6', color: '#6B7280', borderColor: '#9CA3AF' }
                                }>
                                    Trend: {market.trend}
                                </span>
                                <span className="px-4 py-2 rounded-full font-semibold border" style={getSentimentColor(market.sentiment)}>
                                    Sentiment: {market.sentiment}
                                </span>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#6B7280' }}>Volatility Index</p>
                                <p className="text-3xl font-bold" style={{ color: '#8B5CF6' }}>{market.volatilityIndex.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Sector Performance */}
                        <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h3 className="font-semibold text-lg mb-4" style={{ color: '#1A1F37' }}>Sector Performance</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {market.sectors.map((sector, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-lg p-3 border"
                                        style={
                                            sector.status === 'LEADING' ? { backgroundColor: '#D1FAE5', borderColor: '#10B981' } :
                                                sector.status === 'LAGGING' ? { backgroundColor: '#FEE2E2', borderColor: '#EF4444' } :
                                                    { backgroundColor: '#F3F4F6', borderColor: '#E0E4EC' }
                                        }
                                    >
                                        <p className="text-xs font-bold mb-1" style={{ color: '#6B7280' }}>{sector.sector}</p>
                                        <p className="text-lg font-bold" style={{ color: sector.performance >= 0 ? '#10B981' : '#EF4444' }}>
                                            {sector.performance >= 0 ? '+' : ''}{sector.performance.toFixed(2)}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Insight */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border rounded-xl p-6 shadow-sm" style={{ borderColor: '#F59E0B' }}>
                        <h3 className="font-semibold text-lg mb-3" style={{ color: '#1A1F37' }}>AI Market Insight</h3>
                        <p className="italic text-base leading-relaxed mb-3" style={{ color: '#374151' }}>
                            "{market.aiInsight}"
                        </p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>
                            Last updated: {new Date(market.timestamp).toLocaleString('en-IN')}
                        </p>
                    </div>
                </>
            )}

            {/* Empty State */}
            {!market && !loading && (
                <div className="bg-white rounded-xl border shadow-sm p-12 text-center" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <LineChart className="w-20 h-20 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                    <h3 className="text-lg font-medium mb-2" style={{ color: '#1A1F37' }}>Ready to Load Market Data</h3>
                    <p className="text-sm max-w-sm mx-auto" style={{ color: '#6B7280' }}>
                        Click Refresh to load real-time market analysis from NSE and BSE
                    </p>
                </div>
            )}
        </div>
    );
}

export default MarketPanel;
