import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { OrderForm, OrderCard, ExecutionStats } from './ExecutionComponents';
import { RefreshCw, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * ExecutionPanel Component
 * Main panel for trade execution and order management
 */
const ExecutionPanel = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch orders and stats
    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [ordersResponse, statsResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/execution/orders`),
                axios.get(`${API_BASE_URL}/execution/stats`)
            ]);

            setOrders(ordersResponse.data);
            setStats(statsResponse.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load execution data. Make sure the backend is running on port 8080.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchData();

        // Auto-refresh every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Handle order creation
    const handleOrderCreated = (order) => {
        console.log('Order created:', order);
        setOrders([order, ...orders]);
        fetchData(); // Refresh to get updated stats
    };

    // Handle order execution
    const handleExecuteOrder = async (orderId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/execution/execute/${orderId}`);
            console.log('Execution result:', response.data);

            if (response.data.success) {
                alert('✅ Order executed successfully!');
            } else {
                alert('❌ ' + response.data.message);
            }
        } catch (err) {
            console.error('Error executing order:', err);
            alert('Failed to execute order: ' + (err.response?.data?.message || err.message));
        }
    };

    // Handle order cancellation
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            const response = await axios.delete(`${API_BASE_URL}/execution/orders/${orderId}`);
            console.log('Cancellation result:', response.data);

            if (response.data.success) {
                alert('🚫 Order cancelled');
                fetchData();
            } else {
                alert('❌ ' + response.data.message);
            }
        } catch (err) {
            console.error('Error cancelling order:', err);
            alert('Failed to cancel order: ' + (err.response?.data?.message || err.message));
        }
    };

    // Separate orders by status
    const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'EXECUTING');
    const completedOrders = orders.filter(o => o.status === 'EXECUTED' || o.status === 'FAILED' || o.status === 'CANCELLED');

    return (
        <div className="space-y-6">
            {/* Header with Refresh Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: '#1A1F37' }}>Trade Execution</h2>
                    <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                        Execute trades and manage orders
                    </p>
                </div>

                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 flex items-center gap-2"
                    style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-900">Connection Error</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Execution Statistics */}
            <ExecutionStats stats={stats} />

            {/* Order Creation Form */}
            <OrderForm onOrderCreated={handleOrderCreated} />

            {/* Pending Orders */}
            <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#1A1F37' }}>
                    Pending Orders ({pendingOrders.length})
                </h3>

                {pendingOrders.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center shadow-sm border" style={{ borderColor: '#E0E4EC' }}>
                        <p style={{ color: '#6B7280' }}>No pending orders</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingOrders.map(order => (
                            <OrderCard
                                key={order.orderId}
                                order={order}
                                onExecute={handleExecuteOrder}
                                onCancel={handleCancelOrder}
                                onRefresh={fetchData}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Execution History */}
            <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#1A1F37' }}>
                    Execution History ({completedOrders.length})
                </h3>

                {completedOrders.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center shadow-sm border" style={{ borderColor: '#E0E4EC' }}>
                        <p style={{ color: '#6B7280' }}>No execution history yet</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: '#E0E4EC' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead style={{ backgroundColor: '#F9FAFB' }}>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                                            Symbol
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                                            Executed At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: '#E0E4EC' }}>
                                    {completedOrders.map(order => (
                                        <tr key={order.orderId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium" style={{ color: '#1A1F37' }}>
                                                    {order.symbol}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="px-2 py-1 rounded text-xs font-bold text-white"
                                                    style={{ backgroundColor: order.orderType === 'BUY' ? '#10B981' : '#EF4444' }}
                                                >
                                                    {order.orderType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#1A1F37' }}>
                                                {order.executedQuantity || order.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#1A1F37' }}>
                                                ₹{(order.executedPrice || order.price).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="px-2 py-1 rounded text-xs font-semibold"
                                                    style={{
                                                        backgroundColor: order.status === 'EXECUTED' ? '#D1FAE5' : order.status === 'FAILED' ? '#FEE2E2' : '#F3F4F6',
                                                        color: order.status === 'EXECUTED' ? '#065F46' : order.status === 'FAILED' ? '#991B1B' : '#6B7280'
                                                    }}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#6B7280' }}>
                                                {order.executedAt ? new Date(order.executedAt).toLocaleString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExecutionPanel;
