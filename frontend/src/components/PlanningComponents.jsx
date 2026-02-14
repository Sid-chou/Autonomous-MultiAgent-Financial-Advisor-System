import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

function GoalFormModal({ goal, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        name: goal?.name || '',
        type: goal?.type || 'OTHER',
        targetAmount: goal?.targetAmount || 100000,
        targetDate: goal?.targetDate || '',
        priority: goal?.priority || 'MEDIUM',
        description: goal?.description || '',
        currentProgress: goal?.currentProgress || 0
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            if (name === 'targetAmount' || name === 'currentProgress') {
                const num = parseFloat(value);
                return {
                    ...prev,
                    [name]: isNaN(num) ? 0 : num
                };
            }
            return {
                ...prev,
                [name]: value
            };
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">
                        {goal ? 'Edit Goal' : 'Create New Goal'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Goal Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Goal Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Buy House, Retirement Fund"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Goal Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Goal Type *
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="RETIREMENT">Retirement</option>
                            <option value="HOUSE">House/Property</option>
                            <option value="EDUCATION">Education</option>
                            <option value="EMERGENCY_FUND">Emergency Fund</option>
                            <option value="VACATION">Vacation/Travel</option>
                            <option value="WEDDING">Wedding</option>
                            <option value="VEHICLE">Vehicle</option>
                            <option value="BUSINESS">Business/Entrepreneurship</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {/* Target Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Amount (₹) *
                        </label>
                        <input
                            type="number"
                            name="targetAmount"
                            value={formData.targetAmount}
                            onChange={handleChange}
                            required
                            min="1000"
                            step="1000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Current Progress */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Savings (₹)
                        </label>
                        <input
                            type="number"
                            name="currentProgress"
                            value={formData.currentProgress}
                            onChange={handleChange}
                            min="0"
                            step="1000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Target Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Date *
                        </label>
                        <input
                            type="date"
                            name="targetDate"
                            value={formData.targetDate}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <div className="flex gap-3">
                            {['HIGH', 'MEDIUM', 'LOW'].map(priority => (
                                <label key={priority} className="flex-1">
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={priority}
                                        checked={formData.priority === priority}
                                        onChange={handleChange}
                                        className="hidden peer"
                                    />
                                    <div className={`px-4 py-2 rounded-lg text-center cursor-pointer transition-all border-2 peer-checked:border-purple-500 peer-checked:bg-purple-50 ${priority === 'HIGH' ? 'border-red-200 hover:border-red-300' :
                                            priority === 'MEDIUM' ? 'border-yellow-200 hover:border-yellow-300' :
                                                'border-green-200 hover:border-green-300'
                                        }`}>
                                        <span className="text-sm font-medium">{priority}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Add notes about this goal..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {goal ? 'Update' : 'Create'} Goal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SIPCalculator({ inputs, setInputs, result, onCalculate, loading }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        const num = parseFloat(value);
        setInputs(prev => ({
            ...prev,
            [name]: isNaN(num) ? 0 : num
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">SIP Calculator Inputs</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Amount (₹)
                        </label>
                        <input
                            type="number"
                            name="targetAmount"
                            value={inputs.targetAmount}
                            onChange={handleChange}
                            min="10000"
                            step="10000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            ₹{inputs.targetAmount.toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Period (Years)
                        </label>
                        <input
                            type="range"
                            name="years"
                            value={inputs.years}
                            onChange={handleChange}
                            min="1"
                            max="40"
                            className="w-full"
                        />
                        <p className="text-sm text-gray-600 mt-1">{inputs.years} years</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Return (% p.a.)
                        </label>
                        <input
                            type="range"
                            name="expectedReturn"
                            value={inputs.expectedReturn}
                            onChange={handleChange}
                            min="4"
                            max="18"
                            step="0.5"
                            className="w-full"
                        />
                        <p className="text-sm text-gray-600 mt-1">{inputs.expectedReturn}%</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Savings (₹)
                        </label>
                        <input
                            type="number"
                            name="currentSavings"
                            value={inputs.currentSavings}
                            onChange={handleChange}
                            min="0"
                            step="10000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <button
                        onClick={onCalculate}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-medium mt-4"
                    >
                        {loading ? 'Calculating...' : 'Calculate SIP'}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">SIP Results</h3>

                {result ? (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Monthly Investment Required</p>
                            <p className="text-3xl font-bold text-purple-600">
                                ₹{Math.round(result.monthlyInvestment).toLocaleString()}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-xs text-gray-600 mb-1">Total Investment</p>
                                <p className="text-lg font-bold text-gray-900">
                                    ₹{Math.round(result.totalInvestment).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-xs text-gray-600 mb-1">Final Value</p>
                                <p className="text-lg font-bold text-green-600">
                                    ₹{Math.round(result.finalValue).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Total Returns (Gains)</p>
                            <p className="text-2xl font-bold text-green-600">
                                ₹{Math.round(result.totalReturns).toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span>Investment vs Returns</span>
                                <span className="font-semibold">
                                    {((result.totalReturns / result.totalInvestment) * 100).toFixed(1)}% gain
                                </span>
                            </div>
                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
                                <div
                                    className="bg-purple-500"
                                    style={{ width: `${(result.totalInvestment / result.finalValue) * 100}%` }}
                                />
                                <div
                                    className="bg-green-500"
                                    style={{ width: `${(result.totalReturns / result.finalValue) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs mt-2">
                                <span className="text-purple-600">■ Investment</span>
                                <span className="text-green-600">■ Returns</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                        <div className="text-center">
                            <p className="text-lg mb-2">Enter details and calculate</p>
                            <p className="text-sm">to see your SIP plan</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function RetirementPlanner({ inputs, setInputs, plan, onCalculate, loading }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => {
            if (name === 'riskTolerance') {
                return {
                    ...prev,
                    [name]: value
                };
            }
            const num = parseFloat(value);
            return {
                ...prev,
                [name]: isNaN(num) ? 0 : num
            };
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Retirement Planning Inputs</h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Age
                            </label>
                            <input
                                type="number"
                                name="currentAge"
                                value={inputs.currentAge}
                                onChange={handleChange}
                                min="18"
                                max="65"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Retirement Age
                            </label>
                            <input
                                type="number"
                                name="retirementAge"
                                value={inputs.retirementAge}
                                onChange={handleChange}
                                min={inputs.currentAge + 1}
                                max="70"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Monthly Expenses (₹)
                        </label>
                        <input
                            type="number"
                            name="monthlyExpenses"
                            value={inputs.monthlyExpenses}
                            onChange={handleChange}
                            min="10000"
                            step="5000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            ₹{inputs.monthlyExpenses.toLocaleString()}/month
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Retirement Savings (₹)
                        </label>
                        <input
                            type="number"
                            name="currentSavings"
                            value={inputs.currentSavings}
                            onChange={handleChange}
                            min="0"
                            step="50000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Risk Tolerance
                        </label>
                        <select
                            name="riskTolerance"
                            value={inputs.riskTolerance}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="conservative">Conservative</option>
                            <option value="moderate">Moderate</option>
                            <option value="aggressive">Aggressive</option>
                        </select>
                    </div>

                    <button
                        onClick={onCalculate}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-medium mt-4"
                    >
                        {loading ? 'Calculating...' : 'Generate Retirement Plan'}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Retirement Plan</h3>

                {plan ? (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Retirement Corpus Needed</p>
                            <p className="text-3xl font-bold text-blue-600">
                                ₹{(plan.plan.corpusNeeded / 10000000).toFixed(2)} Cr
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                To maintain lifestyle post-retirement
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Monthly SIP Required</p>
                            <p className="text-2xl font-bold text-purple-600">
                                ₹{Math.round(plan.plan.monthlyInvestmentRequired).toLocaleString()}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-xs text-gray-600 mb-1">Years to Retirement</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {plan.plan.yearsToRetirement} years
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-xs text-gray-600 mb-1">Future Monthly Expense</p>
                                <p className="text-lg font-bold text-orange-600">
                                    ₹{Math.round(plan.plan.futureMonthlyExpenses).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {plan.plan.assetAllocation && (
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-sm font-semibold text-gray-900 mb-3">Recommended Allocation</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Equity</span>
                                        <span className="text-sm font-bold text-green-600">
                                            {plan.plan.assetAllocation.equity}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Debt</span>
                                        <span className="text-sm font-bold text-blue-600">
                                            {plan.plan.assetAllocation.debt}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Gold</span>
                                        <span className="text-sm font-bold text-yellow-600">
                                            {plan.plan.assetAllocation.gold}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Cash</span>
                                        <span className="text-sm font-bold text-gray-600">
                                            {plan.plan.assetAllocation.cash}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {plan.aiInsight && (
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-sm font-semibold text-gray-900 mb-2">AI Strategic Insight</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {plan.aiInsight}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                        <div className="text-center">
                            <p className="text-lg mb-2">Enter your details</p>
                            <p className="text-sm">to generate your retirement plan</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export { GoalFormModal, SIPCalculator, RetirementPlanner };
