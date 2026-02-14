import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GoalFormModal, SIPCalculator, RetirementPlanner } from './PlanningComponents';
import {
    Target, TrendingUp, Home, GraduationCap, Wallet,
    PiggyBank, Calendar, Plus, Calculator, X, Edit2,
    Check, AlertCircle, TrendingDown, Activity
} from 'lucide-react';

function PlanningPanel() {
    const [activeTab, setActiveTab] = useState('goals'); // goals, sip, retirement
    const [goals, setGoals] = useState([]);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [comprehensivePlan, setComprehensivePlan] = useState(null);

    // SIP Calculator state
    const [sipInputs, setSipInputs] = useState({
        targetAmount: 1000000,
        years: 10,
        expectedReturn: 12,
        currentSavings: 0
    });
    const [sipResult, setSipResult] = useState(null);

    // Retirement Planner state
    const [retirementInputs, setRetirementInputs] = useState({
        currentAge: 30,
        retirementAge: 60,
        monthlyExpenses: 50000,
        currentSavings: 500000,
        riskTolerance: 'moderate'
    });
    const [retirementPlan, setRetirementPlan] = useState(null);

    useEffect(() => {
        if (activeTab === 'goals') {
            fetchGoals();
        }
    }, [activeTab]);

    const fetchGoals = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/planning/goals');
            setGoals(response.data);
        } catch (err) {
            console.error('Error fetching goals:', err);
        }
    };

    const fetchComprehensivePlan = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/planning/comprehensive-plan?monthlyIncome=100000');
            setComprehensivePlan(response.data);
        } catch (err) {
            toast.error('Failed to generate comprehensive plan');
        } finally {
            setLoading(false);
        }
    };

    const calculateSIP = async () => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8080/api/planning/calculate-sip', sipInputs);
            setSipResult(response.data);
            toast.success('SIP calculated successfully!');
        } catch (err) {
            toast.error('Failed to calculate SIP');
        } finally {
            setLoading(false);
        }
    };

    const calculateRetirement = async () => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8080/api/planning/retirement-plan', retirementInputs);
            setRetirementPlan(response.data);
            toast.success('Retirement plan generated!');
        } catch (err) {
            toast.error('Failed to generate retirement plan');
        } finally {
            setLoading(false);
        }
    };

    const createGoal = async (goalData) => {
        try {
            await axios.post('http://localhost:8080/api/planning/goals', goalData);
            toast.success('Goal created successfully!');
            fetchGoals();
            setShowAddGoal(false);
        } catch (err) {
            toast.error('Failed to create goal');
        }
    };

    const updateGoal = async (id, goalData) => {
        try {
            await axios.put(`http://localhost:8080/api/planning/goals/${id}`, goalData);
            toast.success('Goal updated!');
            fetchGoals();
            setEditingGoal(null);
        } catch (err) {
            toast.error('Failed to update goal');
        }
    };

    const deleteGoal = async (id) => {
        if (!window.confirm('Are you sure you want to delete this goal?')) return;

        try {
            await axios.delete(`http://localhost:8080/api/planning/goals/${id}`);
            toast.success('Goal deleted');
            fetchGoals();
        } catch (err) {
            toast.error('Failed to delete goal');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Financial Planning</h2>
                        <p className="text-gray-600">Set goals, plan investments, and track progress</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('goals')}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'goals'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <Target className="inline w-4 h-4 mr-2" />
                    My Goals
                </button>
                <button
                    onClick={() => setActiveTab('sip')}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'sip'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <Calculator className="inline w-4 h-4 mr-2" />
                    SIP Calculator
                </button>
                <button
                    onClick={() => setActiveTab('retirement')}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'retirement'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <PiggyBank className="inline w-4 h-4 mr-2" />
                    Retirement Planner
                </button>
            </div>

            {/* Goals Tab */}
            {activeTab === 'goals' && (
                <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddGoal(true)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Goal
                        </button>
                        <button
                            onClick={fetchComprehensivePlan}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <Activity className="w-4 h-4" />
                            Generate AI Plan
                        </button>
                    </div>

                    {/* Goals Grid */}
                    {goals.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Yet</h3>
                            <p className="text-gray-600 mb-4">Start by creating your first financial goal</p>
                            <button
                                onClick={() => setShowAddGoal(true)}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Create First Goal
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {goals.map(goal => (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    onEdit={() => setEditingGoal(goal)}
                                    onDelete={() => deleteGoal(goal.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Comprehensive Plan */}
                    {comprehensivePlan && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                                AI-Powered Comprehensive Plan
                            </h3>
                            <div className="bg-white rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Monthly Investment</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ₹{comprehensivePlan.totalMonthlyInvestment?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Investment Ratio</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {comprehensivePlan.investmentToIncomeRatio?.toFixed(1) || 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {comprehensivePlan.comprehensivePlan}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SIP Calculator Tab */}
            {activeTab === 'sip' && (
                <SIPCalculator
                    inputs={sipInputs}
                    setInputs={setSipInputs}
                    result={sipResult}
                    onCalculate={calculateSIP}
                    loading={loading}
                />
            )}

            {/* Retirement Planner Tab */}
            {activeTab === 'retirement' && (
                <RetirementPlanner
                    inputs={retirementInputs}
                    setInputs={setRetirementInputs}
                    plan={retirementPlan}
                    onCalculate={calculateRetirement}
                    loading={loading}
                />
            )}

            {/* Add/Edit Goal Modal */}
            {(showAddGoal || editingGoal) && (
                <GoalFormModal
                    goal={editingGoal}
                    onClose={() => {
                        setShowAddGoal(false);
                        setEditingGoal(null);
                    }}
                    onSubmit={(data) => {
                        if (editingGoal) {
                            updateGoal(editingGoal.id, data);
                        } else {
                            createGoal(data);
                        }
                    }}
                />
            )}
        </div>
    );
}

// Goal Card Component
function GoalCard({ goal, onEdit, onDelete }) {
    const [progress, setProgress] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchProgress();
    }, [goal.id]);

    const fetchProgress = async () => {
        try {
            const response = await axios.get(`/api/planning/goals/${goal.id}/progress`);
            setProgress(response.data);
        } catch (err) {
            console.error('Error fetching progress:', err);
        }
    };

    const getIcon = (type) => {
        const icons = {
            RETIREMENT: PiggyBank,
            HOUSE: Home,
            EDUCATION: GraduationCap,
            EMERGENCY_FUND: Wallet,
            VACATION: Calendar,
            WEDDING: Target,
            VEHICLE: TrendingUp,
            BUSINESS: Target,
            OTHER: Target
        };
        const Icon = icons[type] || Target;
        return <Icon className="w-6 h-6" />;
    };

    const getTypeColor = (type) => {
        const colors = {
            RETIREMENT: 'from-blue-500 to-indigo-600',
            HOUSE: 'from-green-500 to-emerald-600',
            EDUCATION: 'from-purple-500 to-violet-600',
            EMERGENCY_FUND: 'from-red-500 to-rose-600',
            VACATION: 'from-yellow-500 to-orange-600',
            WEDDING: 'from-pink-500 to-rose-600',
            VEHICLE: 'from-gray-500 to-slate-600',
            BUSINESS: 'from-indigo-500 to-blue-600',
            OTHER: 'from-gray-500 to-gray-600'
        };
        return colors[type] || 'from-gray-500 to-gray-600';
    };

    const percent = progress ? progress.progressPercentage : 0;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(goal.type)} rounded-xl flex items-center justify-center text-white shadow-md`}>
                        {getIcon(goal.type)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{goal.name}</h3>
                        <p className="text-sm text-gray-500">{goal.type.replace('_', ' ')}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={onDelete} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-900">{percent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${getTypeColor(goal.type)} transition-all duration-500`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                </div>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-500">Current</p>
                    <p className="text-lg font-bold text-gray-900">
                        ₹{(goal.currentProgress || 0).toLocaleString()}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Target</p>
                    <p className="text-lg font-bold text-gray-900">
                        ₹{goal.targetAmount.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Target Date & Status */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(goal.targetDate).toLocaleDateString()}
                </div>
                {progress && (
                    <div className="flex items-center gap-1">
                        {progress.onTrack ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                On Track
                            </span>
                        ) : (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Behind
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Monthly SIP */}
            {progress && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Required Monthly SIP</p>
                    <p className="text-xl font-bold text-purple-600">
                        ₹{progress.requiredMonthlyInvestment?.toLocaleString() || 0}
                    </p>
                </div>
            )}
        </div>
    );
}

// PART 2 of the component continues...

export default PlanningPanel;
