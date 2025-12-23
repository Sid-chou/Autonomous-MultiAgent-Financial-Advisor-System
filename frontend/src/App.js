import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    Box,
    Chip,
    Alert,
    CircularProgress,
    LinearProgress,
    IconButton,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Analytics as AnalyticsIcon,
    TrendingUp as TrendingUpIcon,
    Shield as ShieldIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function App() {
    const [holdings, setHoldings] = useState([
        { symbol: 'AAPL', quantity: 10, purchasePrice: 150, currentPrice: 175 },
        { symbol: 'GOOGL', quantity: 5, purchasePrice: 2800, currentPrice: 2950 },
    ]);
    const [riskTolerance, setRiskTolerance] = useState('moderate');
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
                holdings: holdings,
                riskTolerance: riskTolerance
            });
            setAnalysis(response.data);
        } catch (err) {
            setError('Failed to analyze portfolio. Make sure the backend is running on port 8080.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'LOW': return '#4caf50';
            case 'MEDIUM': return '#ff9800';
            case 'HIGH': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    const pieData = holdings.map(h => ({
        name: h.symbol,
        value: h.currentPrice * h.quantity
    }));

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <ShieldIcon sx={{ fontSize: 48 }} />
                    <Box>
                        <Typography variant="h3" fontWeight="bold">
                            Risk Assessment Agent
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                            Autonomous Multi-Agent Financial Advisor System
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Grid container spacing={3}>
                {/* Left Panel - Portfolio Input */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom fontWeight="bold" display="flex" alignItems="center" gap={1}>
                            <TrendingUpIcon /> Portfolio Holdings
                        </Typography>

                        {holdings.map((holding, index) => (
                            <Card key={index} sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
                                <CardContent>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                label="Symbol"
                                                value={holding.symbol}
                                                onChange={(e) => updateHolding(index, 'symbol', e.target.value)}
                                                fullWidth
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                label="Quantity"
                                                type="number"
                                                value={holding.quantity}
                                                onChange={(e) => updateHolding(index, 'quantity', e.target.value)}
                                                fullWidth
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                label="Purchase $"
                                                type="number"
                                                value={holding.purchasePrice}
                                                onChange={(e) => updateHolding(index, 'purchasePrice', e.target.value)}
                                                fullWidth
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={10} sm={2}>
                                            <TextField
                                                label="Current $"
                                                type="number"
                                                value={holding.currentPrice}
                                                onChange={(e) => updateHolding(index, 'currentPrice', e.target.value)}
                                                fullWidth
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={2} sm={1}>
                                            <IconButton onClick={() => removeHolding(index)} color="error" size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            startIcon={<AddIcon />}
                            onClick={addHolding}
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            Add Holding
                        </Button>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Risk Tolerance
                        </Typography>
                        <Box display="flex" gap={1} mb={3}>
                            {['conservative', 'moderate', 'aggressive'].map((level) => (
                                <Chip
                                    key={level}
                                    label={level.charAt(0).toUpperCase() + level.slice(1)}
                                    onClick={() => setRiskTolerance(level)}
                                    color={riskTolerance === level ? 'primary' : 'default'}
                                    variant={riskTolerance === level ? 'filled' : 'outlined'}
                                />
                            ))}
                        </Box>

                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
                            onClick={analyzeRisk}
                            disabled={loading || holdings.length === 0}
                            sx={{
                                py: 1.5,
                                fontSize: '1.1rem',
                                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            }}
                        >
                            {loading ? 'Analyzing...' : 'Analyze Risk'}
                        </Button>

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Paper>

                    {/* Portfolio Distribution Chart */}
                    {holdings.length > 0 && (
                        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Portfolio Distribution
                            </Typography>
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
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    )}
                </Grid>

                {/* Right Panel - Analysis Results */}
                <Grid item xs={12} md={6}>
                    {analysis ? (
                        <>
                            {/* Risk Score Card */}
                            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: getRiskColor(analysis.riskLevel), color: 'white' }}>
                                <Typography variant="h6" gutterBottom>
                                    Risk Assessment Complete
                                </Typography>
                                <Typography variant="h2" fontWeight="bold">
                                    {analysis.riskLevel}
                                </Typography>
                                <Typography variant="h4">
                                    Score: {analysis.riskScore}/100
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={parseFloat(analysis.riskScore)}
                                    sx={{ mt: 2, height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.3)' }}
                                />
                            </Paper>

                            {/* Risk Metrics */}
                            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom fontWeight="bold">
                                    📊 Risk Metrics
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Card sx={{ bgcolor: '#e3f2fd' }}>
                                            <CardContent>
                                                <Typography color="textSecondary" variant="caption">
                                                    Total Value
                                                </Typography>
                                                <Typography variant="h5" fontWeight="bold">
                                                    ${analysis.totalValue.toFixed(2)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card sx={{ bgcolor: '#fff3e0' }}>
                                            <CardContent>
                                                <Typography color="textSecondary" variant="caption">
                                                    Value at Risk (95%)
                                                </Typography>
                                                <Typography variant="h5" fontWeight="bold">
                                                    ${analysis.valueAtRisk.toFixed(2)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card sx={{ bgcolor: '#f3e5f5' }}>
                                            <CardContent>
                                                <Typography color="textSecondary" variant="caption">
                                                    Volatility (σ)
                                                </Typography>
                                                <Typography variant="h5" fontWeight="bold">
                                                    {analysis.standardDeviation.toFixed(2)}%
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card sx={{ bgcolor: '#e8f5e9' }}>
                                            <CardContent>
                                                <Typography color="textSecondary" variant="caption">
                                                    Diversification
                                                </Typography>
                                                <Typography variant="h5" fontWeight="bold">
                                                    {analysis.diversificationScore.toFixed(0)}%
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* AI Insight */}
                            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#e8eaf6' }}>
                                <Typography variant="h6" gutterBottom fontWeight="bold" display="flex" alignItems="center" gap={1}>
                                    <AnalyticsIcon /> AI-Powered Insight
                                </Typography>
                                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                                    "{analysis.aiInsight}"
                                </Typography>
                            </Paper>

                            {/* Recommendations */}
                            <Paper elevation={2} sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom fontWeight="bold" display="flex" alignItems="center" gap={1}>
                                    <WarningIcon /> Recommendations
                                </Typography>
                                {analysis.recommendations.map((rec, index) => (
                                    <Alert
                                        key={index}
                                        severity={rec.includes('⚠️') ? 'warning' : rec.includes('✓') ? 'success' : 'info'}
                                        sx={{ mb: 1 }}
                                    >
                                        {rec}
                                    </Alert>
                                ))}
                            </Paper>
                        </>
                    ) : (
                        <Paper elevation={2} sx={{ p: 5, textAlign: 'center', color: '#999' }}>
                            <AnalyticsIcon sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
                            <Typography variant="h6">
                                Add your portfolio holdings and click "Analyze Risk" to see results
                            </Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}

export default App;
