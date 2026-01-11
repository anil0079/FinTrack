/**
 * Shared financial calculation engine for the GravityLess Finance application.
 * Ensures consistent math across Dashboard, Income, and Optimization views.
 */

export interface IncomeMetricResults {
    invested: number;
    current: number;
    net: number;
    cagr: number;
    monthly: number;
    tdsCurrentFY: number;
    maturityDate: Date;
    type: string;
}

export const calculateIncomeMetrics = (source: any): IncomeMetricResults => {
    const investedAmount = source.amountInvested || 0
    const startDate = source.investmentDate ? new Date(source.investmentDate) : (source.createdAt ? new Date(source.createdAt) : new Date())
    const now = new Date()

    // Payout tracking
    const payouts = source.payouts || []
    let totalInterestPaid = 0
    let totalPrincipalReturned = 0
    let totalInterestProjected = 0
    let totalPrincipalProjected = 0
    let maxPayoutDate = source.investedUntil ? new Date(source.investedUntil) : startDate

    payouts.forEach((p: any) => {
        const pDate = new Date(p.date)
        if (pDate > maxPayoutDate) maxPayoutDate = pDate

        if (pDate <= now) {
            if (p.type === 'Principal') totalPrincipalReturned += p.amount
            else totalInterestPaid += p.amount
        }

        if (p.type === 'Principal') totalPrincipalProjected += p.amount
        else totalInterestProjected += p.amount
    })

    if (totalPrincipalProjected === 0 && investedAmount > 0) {
        totalPrincipalProjected = investedAmount
    }

    const effectiveNow = now > maxPayoutDate ? maxPayoutDate : now
    const elapsedYears = Math.max(0, (effectiveNow.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    const totalDurationYears = Math.max(0.01, (maxPayoutDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))

    // 1. Accumulation / Interest Tracking
    let totalInterestEarnedSoFar = 0
    let accruedInterest = 0

    if (payouts.length > 0) {
        // Payout-based assets (Interest is paid out, not accumulated in value)
        totalInterestEarnedSoFar = totalInterestPaid

        // Accrued Interest (Pro-rata for the upcoming payout)
        const upcomingPayout = payouts
            .filter((p: any) => new Date(p.date) > now)
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

        if (upcomingPayout && upcomingPayout.type !== 'Principal') {
            const lastPayout = payouts
                .filter((p: any) => new Date(p.date) <= now)
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

            const lastDate = lastPayout ? new Date(lastPayout.date) : startDate
            const nextDate = new Date(upcomingPayout.date)

            if (now > lastDate && nextDate > lastDate) {
                const periodDuration = nextDate.getTime() - lastDate.getTime()
                const timeElapsed = now.getTime() - lastDate.getTime()
                const fraction = Math.min(1, timeElapsed / periodDuration)
                accruedInterest = upcomingPayout.amount * fraction
            }
        }
    } else {
        // Growth-based assets (Compound interest accumulated in value)
        const valuationFull = investedAmount * Math.pow(1 + (source.growthRate / 100), elapsedYears)
        totalInterestEarnedSoFar = valuationFull - investedAmount
    }

    // 2. Core Value Metrics
    const currentVal = Math.max(0, investedAmount + totalInterestEarnedSoFar - totalInterestPaid - totalPrincipalReturned)
    const netVal = investedAmount + totalInterestEarnedSoFar + accruedInterest

    // 3. Smart Yield Derivation
    let derivedCAGR = Number(source.growthRate || 0)
    if (totalDurationYears > 0 && investedAmount > 0 && (totalInterestProjected > 0 || totalPrincipalProjected !== investedAmount)) {
        const totalProjectedReturn = totalInterestProjected + totalPrincipalProjected
        const diffDays = totalDurationYears * 365.25

        const isDebtAsset = payouts.length > 0 || ['Bonds', 'FD/RD', 'P2P Lending', 'Savings'].includes(source.category)

        if (diffDays < 30) {
            derivedCAGR = ((totalProjectedReturn / investedAmount) - 1) * 100
        } else if (isDebtAsset) {
            // Simple Annualized Yield matches XIRR better for debt
            derivedCAGR = (((totalProjectedReturn / investedAmount) - 1) / totalDurationYears) * 100
        } else {
            // Standard CAGR for growth
            derivedCAGR = (Math.pow(totalProjectedReturn / investedAmount, 1 / totalDurationYears) - 1) * 100
        }

        if (derivedCAGR > 1000) derivedCAGR = Number(source.growthRate || 0)
    }

    // 4. Derived Monthly Value
    let monthlyValue = Number(source.monthlyIncome || 0)
    if (payouts.length > 0 && totalDurationYears > 0) {
        monthlyValue = totalInterestProjected / (totalDurationYears * 12)
    } else if (investedAmount > 0 && derivedCAGR > 0) {
        monthlyValue = (investedAmount * (derivedCAGR / 100)) / 12
    }

    // 5. TDS Calculation (Financial Year window)
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
    const fyStartDate = new Date(fyStartYear, 3, 1)
    const fyEndDate = new Date(fyStartYear + 1, 2, 31)

    let tdsCurrentFY = 0
    if (source.tdsDeducted && source.tdsRate > 0) {
        payouts.forEach((p: any) => {
            const pDate = new Date(p.date)
            if (p.type !== 'Principal' && pDate >= fyStartDate && pDate <= fyEndDate) {
                tdsCurrentFY += p.amount * (source.tdsRate / 100)
            }
        })
    }

    return {
        invested: Math.round(investedAmount),
        current: Math.round(currentVal),
        net: Math.round(netVal),
        cagr: parseFloat((derivedCAGR || 0).toFixed(2)),
        monthly: Math.round(monthlyValue),
        tdsCurrentFY: Math.round(tdsCurrentFY),
        maturityDate: maxPayoutDate,
        type: source.type || 'Other'
    }
}
