// LocalStorage utility for portfolio persistence
export const STORAGE_KEYS = {
    PORTFOLIO: 'finAdvisor_portfolio',
    RISK_TOLERANCE: 'finAdvisor_riskTolerance',
    PREFERENCES: 'finAdvisor_preferences',
};

// Save portfolio holdings to localStorage
export const savePortfolio = (holdings) => {
    try {
        localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(holdings));
        return true;
    } catch (error) {
        console.error('Failed to save portfolio:', error);
        return false;
    }
};

// Load portfolio holdings from localStorage
export const loadPortfolio = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Failed to load portfolio:', error);
        return null;
    }
};

// Save risk tolerance to localStorage
export const saveRiskTolerance = (riskTolerance) => {
    try {
        localStorage.setItem(STORAGE_KEYS.RISK_TOLERANCE, riskTolerance);
        return true;
    } catch (error) {
        console.error('Failed to save risk tolerance:', error);
        return false;
    }
};

// Load risk tolerance from localStorage
export const loadRiskTolerance = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.RISK_TOLERANCE) || 'moderate';
    } catch (error) {
        console.error('Failed to load risk tolerance:', error);
        return 'moderate';
    }
};

// Save user preferences
export const savePreferences = (preferences) => {
    try {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
        return true;
    } catch (error) {
        console.error('Failed to save preferences:', error);
        return false;
    }
};

// Load user preferences
export const loadPreferences = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.error('Failed to load preferences:', error);
        return {};
    }
};

// Clear all saved data
export const clearAllData = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('Failed to clear data:', error);
        return false;
    }
};

// Export portfolio to CSV
export const exportToCSV = (holdings) => {
    if (!holdings || holdings.length === 0) {
        return null;
    }

    // CSV headers
    const headers = ['Symbol', 'Quantity', 'Current Price (₹)', 'Total Value (₹)'];

    // Convert holdings to CSV rows
    const rows = holdings.map(h => [
        h.symbol,
        h.quantity,
        h.currentPrice || 0,
        (h.quantity * (h.currentPrice || 0)).toFixed(2)
    ]);

    // Calculate total
    const total = holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || 0)), 0);
    rows.push(['', '', 'TOTAL', total.toFixed(2)]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
};

// Download CSV file
export const downloadCSV = (csvContent, filename = 'portfolio.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

// Export portfolio with metadata
export const exportPortfolioWithMetadata = (holdings, riskTolerance, analysis) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `portfolio_${timestamp}.csv`;

    const headers = ['Symbol', 'Quantity', 'Current Price (₹)', 'Total Value (₹)'];
    const rows = holdings.map(h => [
        h.symbol,
        h.quantity,
        h.currentPrice || 0,
        (h.quantity * (h.currentPrice || 0)).toFixed(2)
    ]);

    const total = holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || 0)), 0);

    // Add metadata
    const metadata = [
        `Portfolio Export - ${new Date().toLocaleString('en-IN')}`,
        `Risk Tolerance: ${riskTolerance.toUpperCase()}`,
        analysis ? `Risk Score: ${analysis.riskScore.toFixed(2)}` : '',
        analysis ? `Risk Level: ${analysis.riskLevel}` : '',
        '',
        headers.join(','),
        ...rows.map(row => row.join(',')),
        '',
        `,,TOTAL,${total.toFixed(2)}`
    ].filter(Boolean).join('\n');

    downloadCSV(metadata, filename);
};
