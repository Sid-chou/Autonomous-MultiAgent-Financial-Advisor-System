import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Shield,
    BarChart3,
    Bell,
    User,
    Settings,
    AlertTriangle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

// Import panels
import RiskPanel from './components/RiskPanel';
import OptimizationPanel from './components/OptimizationPanel';
import MarketPanel from './components/MarketPanel';
import AlertsPanel from './components/AlertsPanel';

// Import utilities
import { loadPortfolio, loadRiskTolerance } from './utils/localStorage';

function App() {
    const [activeTab, setActiveTab] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [holdings, setHoldings] = useState([]);
    const [riskTolerance, setRiskTolerance] = useState('moderate');
    const [alertCount, setAlertCount] = useState(0);

    // Load saved data on mount
    useEffect(() => {
        const savedPortfolio = loadPortfolio();
        const savedRiskTolerance = loadRiskTolerance();

        if (savedPortfolio && savedPortfolio.length > 0) {
            setHoldings(savedPortfolio);
        } else {
            // Default holdings if none saved
            setHoldings([
                { symbol: 'RELIANCE.NS', quantity: 10, purchasePrice: 2400, currentPrice: 2550 },
                { symbol: 'TCS.NS', quantity: 5, purchasePrice: 3200, currentPrice: 3450 },
                { symbol: 'INFY.NS', quantity: 8, purchasePrice: 1450, currentPrice: 1520 }
            ]);
        }

        setRiskTolerance(savedRiskTolerance);
    }, []);

    const tabConfig = [
        { label: 'Risk Analysis', icon: Shield },
        { label: 'Optimization', icon: TrendingUp },
        { label: 'Market', icon: BarChart3 },
        { label: 'Alerts', icon: AlertTriangle, badge: alertCount }
    ];

    const ActiveComponent = [RiskPanel, OptimizationPanel, MarketPanel, AlertsPanel][activeTab];

    return (
        <div className="min-h-screen flex animate-fade-in" style={{ backgroundColor: '#E8ECF4' }}>
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full transition-all duration-300 z-40 ${sidebarCollapsed ? 'w-20' : 'w-64'
                    }`}
                style={{ backgroundColor: '#1A1F37' }}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2.5 rounded-xl"
                                style={{ background: 'linear-gradient(135deg, #4A6CF7 0%, #5E7DFF 100%)' }}
                            >
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            {!sidebarCollapsed && (
                                <div className="animate-slide-right">
                                    <h1 className="text-white text-lg font-bold tracking-tight">
                                        FinAdvisor
                                    </h1>
                                    <p className="text-gray-400 text-xs">Multi-Agent AI</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3">
                        {tabConfig.map((tab, idx) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === idx;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(idx)}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2
                                        transition-all duration-200 relative group
                                        ${isActive
                                            ? 'text-white shadow-lg'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                    style={isActive ? { backgroundColor: '#4A6CF7' } : {}}
                                    title={sidebarCollapsed ? tab.label : ''}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {!sidebarCollapsed && (
                                        <>
                                            <span className="font-medium text-sm flex-1 text-left">
                                                {tab.label}
                                            </span>
                                            {tab.badge > 0 && (
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                                                    style={isActive
                                                        ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
                                                        : { backgroundColor: '#EF4444', color: 'white' }
                                                    }
                                                >
                                                    {tab.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {sidebarCollapsed && tab.badge > 0 && (
                                        <span
                                            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold"
                                            style={{ backgroundColor: '#EF4444', color: 'white' }}
                                        >
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Collapse Toggle */}
                    <div className="p-3 border-t border-white/10">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200"
                        >
                            {sidebarCollapsed ? (
                                <ChevronRight className="w-5 h-5" />
                            ) : (
                                <>
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="text-sm font-medium">Collapse</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div
                className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'
                    }`}
            >
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white border-b shadow-sm" style={{ borderColor: '#E0E4EC' }}>
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Page Title */}
                            <div>
                                <h2 className="font-bold text-xl" style={{ color: '#1A1F37' }}>
                                    {tabConfig[activeTab].label}
                                </h2>
                                <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                                    Autonomous Indian Market Analysis • NIFTY 50 • SENSEX • NSE/BSE
                                </p>
                            </div>

                            {/* User Controls */}
                            <div className="flex items-center gap-3">
                                {/* Notifications */}
                                <button
                                    className="relative p-2.5 rounded-lg transition-all duration-200 hover:shadow-md"
                                    style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                                >
                                    <Bell className="w-5 h-5" />
                                    {alertCount > 0 && (
                                        <span
                                            className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                            style={{ backgroundColor: '#EF4444' }}
                                        >
                                            {alertCount}
                                        </span>
                                    )}
                                </button>

                                {/* Settings */}
                                <button
                                    className="p-2.5 rounded-lg transition-all duration-200 hover:shadow-md"
                                    style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                                >
                                    <Settings className="w-5 h-5" />
                                </button>

                                {/* User Avatar */}
                                <button
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                    style={{ backgroundColor: '#F3F4F6' }}
                                >
                                    <div
                                        className="p-2 rounded-full"
                                        style={{ background: 'linear-gradient(135deg, #4A6CF7 0%, #5E7DFF 100%)' }}
                                    >
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: '#1A1F37' }}>
                                        Account
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <div className="animate-slide-up">
                        <ActiveComponent
                            holdings={holdings}
                            setHoldings={setHoldings}
                            riskTolerance={riskTolerance}
                            setRiskTolerance={setRiskTolerance}
                            setAlertCount={setAlertCount}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
