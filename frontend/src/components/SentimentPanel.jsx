import React, { useState } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw, Newspaper, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';

function SentimentPanel() {
    const [ticker, setTicker] = useState('');
    const [sentiment, setSentiment] = useState(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const analyzeSentiment = async () => {
        if (!ticker) {
            toast.warning('Please enter a stock ticker');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.get(`http://localhost:8080/api/sentiment/analyze/${ticker.toUpperCase()}`);
            setSentiment(response.data);
            toast.success('Sentiment analysis complete!');
        } catch (err) {
            toast.error('Failed to analyze sentiment');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getSentimentColor = (sentimentType) => {
        switch (sentimentType) {
            case 'BULLISH':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-200',
                    badge: 'bg-green-500'
                };
            case 'BEARISH':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-200',
                    badge: 'bg-red-500'
                };
            default: // NEUTRAL
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                    badge: 'bg-gray-500'
                };
        }
    };

    const SentimentIcon = ({ sentiment }) => {
        switch (sentiment) {
            case 'BULLISH':
                return <TrendingUp className="w-8 h-8 text-green-600" />;
            case 'BEARISH':
                return <TrendingDown className="w-8 h-8 text-red-600" />;
            default:
                return <Minus className="w-8 h-8 text-gray-600" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">AI Sentiment Analysis</h2>
                </div>
                <p className="text-purple-100">
                    Analyze market sentiment using AI-powered FinBERT model with Indian financial news and social media
                </p>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1F37' }}>
                    Stock Ticker
                </label>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        placeholder="e.g., RELIANCE, TCS, INFY"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                            borderColor: '#E0E4EC',
                            color: '#1A1F37',
                            focusRingColor: '#4A6CF7'
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && analyzeSentiment()}
                    />
                    <button
                        onClick={analyzeSentiment}
                        disabled={loading}
                        className="px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                        style={{
                            backgroundColor: '#4A6CF7',
                            hover: { backgroundColor: '#3A5CE7' }
                        }}
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Analyze
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <LoadingSpinner size="lg" message="Analyzing market sentiment with AI..." />
                </div>
            )}

            {/* Results */}
            {!loading && sentiment && (
                <div className="space-y-6">
                    {/* Overall Sentiment Card */}
                    <div className={`${getSentimentColor(sentiment.overallSentiment).bg} rounded-xl p-6 border ${getSentimentColor(sentiment.overallSentiment).border} shadow-lg`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold" style={{ color: '#1A1F37' }}>
                                    {sentiment.ticker} - {sentiment.companyName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {new Date(sentiment.timestamp).toLocaleString()}
                                </p>
                            </div>
                            <SentimentIcon sentiment={sentiment.overallSentiment} />
                        </div>

                        <div className={`inline-block px-4 py-2 rounded-full text-white font-bold text-xl ${getSentimentColor(sentiment.overallSentiment).badge}`}>
                            {sentiment.overallSentiment}
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Positive</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {(sentiment.positiveScore * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Negative</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {(sentiment.negativeScore * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Neutral</p>
                                <p className="text-2xl font-bold text-gray-600">
                                    {(sentiment.neutralScore * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Newspaper className="w-4 h-4" />
                                <span>{sentiment.newsCount} News Articles</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span>{sentiment.socialCount} Social Posts</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                <span>{(sentiment.confidenceScore * 100).toFixed(0)}% Confidence</span>
                            </div>
                        </div>
                    </div>

                    {/* News Sources */}
                    {sentiment.sources?.news && sentiment.sources.news.length > 0 && (
                        <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1F37' }}>
                                <Newspaper className="w-5 h-5" style={{ color: '#4A6CF7' }} />
                                Top News Headlines
                            </h3>
                            <div className="space-y-3">
                                {sentiment.sources.news.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm" style={{ color: '#1A1F37' }}>
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Source: {item.source}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${item.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-700' :
                                                    item.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {item.sentiment}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Social Media Posts */}
                    {sentiment.sources?.social && sentiment.sources.social.length > 0 && (
                        <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1F37' }}>
                                <MessageSquare className="w-5 h-5" style={{ color: '#4A6CF7' }} />
                                Social Media Sentiment
                            </h3>
                            <div className="space-y-3">
                                {sentiment.sources.social.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm" style={{ color: '#1A1F37' }}>
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {item.source} • {item.upvotes || 0} upvotes
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${item.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-700' :
                                                    item.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {item.sentiment}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Data Message */}
                    {sentiment.message && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <p className="text-yellow-800 text-sm">
                                ℹ️ {sentiment.message}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!loading && !sentiment && (
                <div className="bg-white rounded-xl border shadow-sm p-12 text-center" style={{ borderColor: '#E0E4EC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1F37' }}>
                        No Sentiment Analysis Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Enter a stock ticker above to analyze market sentiment using AI
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => { setTicker('RELIANCE'); }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                        >
                            Try RELIANCE
                        </button>
                        <button
                            onClick={() => { setTicker('TCS'); }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                        >
                            Try TCS
                        </button>
                        <button
                            onClick={() => { setTicker('INFY'); }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                        >
                            Try INFY
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SentimentPanel;
