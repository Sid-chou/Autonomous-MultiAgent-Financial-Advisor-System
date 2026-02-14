import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Loader, Trash2, Play } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * OrderForm Component
 * Form for creating new trade orders
 */
export const OrderForm = ({ onOrderCreated }) => {
    const [formData, setFormData] = useState({
        symbol: '',
        orderType: 'BUY',
        quantity: '',
        price: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/execution/orders`, {
                symbol: formData.symbol.toUpperCase(),
                orderType: formData.orderType,
                quantity: parseInt(formData.quantity),
                price: parseFloat(formData.price)
            });

            onOrderCreated(response.data);

            // Reset form
            setFormData({
                symbol: '',
                orderType: 'BUY',
                quantity: '',
                price: ''
            });
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: '#E0E4EC' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1A1F37' }}>Create New Order</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                            Stock Symbol
                        </label>
                        <input
                            type="text"
                            value={formData.symbol}
                            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{ borderColor: '#E0E4EC', color: '#1A1F37' }}
                            placeholder="e.g., RELIANCE.NS"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                            Order Type
                        </label>
                        <select
                            value={formData.orderType}
                            onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{ borderColor: '#E0E4EC', color: '#1A1F37' }}
                        >
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                            Quantity
                        </label>
                        <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{ borderColor: '#E0E4EC', color: '#1A1F37' }}
                            placeholder="10"
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                            Price (₹)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{ borderColor: '#E0E4EC', color: '#1A1F37' }}
                            placeholder="2500.00"
                            min="0.01"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: '#4A6CF7' }}
                >
                    {loading ? 'Creating...' : 'Create Order'}
                </button>
            </form>
        </div>
    );
};

/**
 * OrderCard Component
 * Display single order with action buttons
 */
export const OrderCard = ({ order, onExecute, onCancel, onRefresh }) => {
    const [executing, setExecuting] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'EXECUTED': return '#10B981';
            case 'PENDING': return '#F59E0B';
            case 'EXECUTING': return '#3B82F6';
            case 'CANCELLED': return '#6B7280';
            case 'FAILED': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'EXECUTED': return <CheckCircle className="w-5 h-5" />;
            case 'PENDING': return <Clock className="w-5 h-5" />;
            case 'EXECUTING': return <Loader className="w-5 h-5 animate-spin" />;
            case 'CANCELLED': return <XCircle className="w-5 h-5" />;
            case 'FAILED': return <XCircle className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    const handleExecute = async () => {
        setExecuting(true);
        await onExecute(order.orderId);
        setExecuting(false);
        setTimeout(onRefresh, 500);
    };

    return (
        <div className="bg-white rounded-lg p-4 border hover:shadow-md transition-shadow" style={{ borderColor: '#E0E4EC' }}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg" style={{ color: '#1A1F37' }}>
                            {order.symbol}
                        </h4>
                        <span
                            className="px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1"
                            style={{ backgroundColor: order.orderType === 'BUY' ? '#10B981' : '#EF4444' }}
                        >
                            {order.orderType === 'BUY' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {order.orderType}
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                        {order.quantity} shares @ ₹{order.price.toFixed(2)}
                    </p>
                </div>

                <div className="flex items-center gap-2" style={{ color: getStatusColor(order.status) }}>
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-semibold">{order.status}</span>
                </div>
            </div>

            {order.status === 'EXECUTED' && (
                <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: '#F0FDF4' }}>
                    <p className="text-sm font-medium" style={{ color: '#10B981' }}>
                        Executed: {order.executedQuantity} @ ₹{order.executedPrice?.toFixed(2)}
                    </p>
                    <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                        Total: ₹{(order.executedPrice * order.executedQuantity).toFixed(2)}
                    </p>
                </div>
            )}

            {order.status === 'FAILED' && order.failureReason && (
                <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                    <p className="text-sm" style={{ color: '#EF4444' }}>
                        {order.failureReason}
                    </p>
                </div>
            )}

            <div className="flex gap-2 mt-3">
                {order.status === 'PENDING' && (
                    <>
                        <button
                            onClick={handleExecute}
                            disabled={executing}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#4A6CF7' }}
                        >
                            {executing ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Execute
                        </button>
                        <button
                            onClick={() => onCancel(order.orderId)}
                            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>

            <p className="text-xs mt-3" style={{ color: '#9CA3AF' }}>
                Created: {new Date(order.createdAt).toLocaleString()}
            </p>
        </div>
    );
};

/**
 * ExecutionStats Component
 * Display execution statistics
 */
export const ExecutionStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border" style={{ borderColor: '#E0E4EC' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Total Orders</p>
                <p className="text-2xl font-bold" style={{ color: '#1A1F37' }}>{stats.totalOrders || 0}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border" style={{ borderColor: '#E0E4EC' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Executed</p>
                <p className="text-2xl font-bold" style={{ color: '#10B981' }}>{stats.totalExecuted || 0}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border" style={{ borderColor: '#E0E4EC' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Success Rate</p>
                <p className="text-2xl font-bold" style={{ color: '#4A6CF7' }}>{stats.successRate || '0%'}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border" style={{ borderColor: '#E0E4EC' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Total Volume</p>
                <p className="text-2xl font-bold" style={{ color: '#1A1F37' }}>{stats.totalVolume || '₹0'}</p>
            </div>
        </div>
    );
};
