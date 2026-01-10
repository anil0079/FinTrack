export type IncomeMetric = {
    id: string
    item: string
    monthlyIncome: number
    weeklyHours: number
    riskFactor: number
    roiPerHour: number
    riskAdjustedReturn: number
    efficiencyScore: number // 0-100
}

export function calculateMetrics(source: any): IncomeMetric {
    const monthlyHours = source.weeklyHours * 4.33
    const roiPerHour = monthlyHours > 0 ? source.monthlyIncome / monthlyHours : source.monthlyIncome

    // Simple model: Higher return is good, lower risk is good.
    // Risk Adjusted = Annual Return / Risk Factor
    // We normalize this to a score.
    const riskAdjustedReturn = (source.monthlyIncome * 12) / (source.riskFactor || 1)

    // Efficiency: Weighted score of ROI/hr (60%) and Risk Adj Return (40%)
    // This is arbitrary but serves the "Game Theory" aspect.
    // Normalized roughly to 0-100 scale for UI
    const efficiencyScore = Math.min(100, (roiPerHour / 10) + (riskAdjustedReturn / 1000))

    return {
        id: source.id,
        item: source.item,
        monthlyIncome: source.monthlyIncome,
        weeklyHours: source.weeklyHours,
        riskFactor: source.riskFactor,
        roiPerHour,
        riskAdjustedReturn,
        efficiencyScore
    }
}

export function suggestOptimization(metrics: IncomeMetric[]) {
    // Identify "Time Leaks": High hours, Low ROI
    const timeLeaks = metrics.filter(m => m.weeklyHours > 10 && m.roiPerHour < 500) // Thresholds illustrative

    // Identify "Risk Bombs": High Risk, Low Return
    const riskBombs = metrics.filter(m => m.riskFactor > 7 && m.riskAdjustedReturn < 5000)

    // Suggest Mix
    return {
        warnings: [
            ...timeLeaks.map(m => `Time Leak Detected: "${m.item}" takes ${m.weeklyHours}hrs/wk but only yields ₹${m.roiPerHour.toFixed(0)}/hr.`),
            ...riskBombs.map(m => `Risk Alert: "${m.item}" has high risk (${m.riskFactor}) with low adjusted return.`)
        ],
        theory: "We use the Sharpe Ratio equivalent for personal capital: Return per unit of Risk (Risk Factor) and Return on Time Invested (ROTI). Optimization minimizes 'h' (hours) while maximizing 'R' (Risk-adjusted Return)."
    }
}

export const ALLOCATION_STRATEGIES = {
    "emergency_first": {
        name: "Emergency First",
        description: "Builds a safety net before aggressive investing.",
        allocation: { emergency: 50, safe: 30, growth: 20 },
        theory: "Maslow's Hierarchy of Financial Needs: Survival > Safety > Growth."
    },
    "max_return": {
        name: "Maximum Return",
        description: "Aggressive growth focus, accepting higher volatility.",
        allocation: { emergency: 10, safe: 10, growth: 80 },
        theory: "Efficient Market Hypothesis (Risk Premium): High risk is correlated with high expected returns."
    },
    "safe_play": {
        name: "Safe Play",
        description: "Capital preservation is the priority.",
        allocation: { emergency: 30, safe: 60, growth: 10 },
        theory: "Loss Aversion: The pain of losing is psychologically twice as powerful as the pleasure of gaining."
    }
}
