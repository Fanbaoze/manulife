import { AnnuityInput, AnnuityCalculationSummary, YearlyBreakdownRow } from '../types';

/**
 * Calculates Newton-Raphson IRR for a series of cash flows
 * cashFlows[0] is year 0 (negative investment), cashFlows[t] is year t cash flow
 */
export function calculateIRR(cashFlows: number[]): number {
  if (cashFlows.length < 2) return 0;
  
  let rate = 0.03; // initial guess 3%
  const maxIterations = 50;
  const tolerance = 1e-6;

  for (let iter = 0; iter < maxIterations; iter++) {
    let npv = 0;
    let dnpv = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const discount = Math.pow(1 + rate, t);
      npv += cashFlows[t] / discount;
      dnpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100;
    }

    if (Math.abs(dnpv) < 1e-10) break;

    const nextRate = rate - npv / dnpv;
    if (isNaN(nextRate) || nextRate < -0.99 || nextRate > 1.5) break;
    rate = nextRate;
  }

  return Math.max(0, rate * 100);
}

export function calculateAnnuitySchedule(input: AnnuityInput): AnnuityCalculationSummary {
  const rows: YearlyBreakdownRow[] = [];
  const totalYears = Math.min(75, 105 - input.issueAge);
  
  let cumPremium = 0;
  let cumPayout = 0;
  let runningUniversalValue = 0;
  let paybackYear = totalYears;
  let paybackAge = input.issueAge + totalYears;
  let foundPayback = false;

  const totalPremiumToPay = input.annualPremium * input.payYears;

  // Base payout rate factor
  // Typically annuity pays ~15% - 25% of annual premium once payout starts, or a percentage based on sum assured
  const basePayoutRate = 0.22;
  const dividendBonusFactor = 
    input.dividendTier === 'high' ? 0.015 :
    input.dividendTier === 'medium' ? 0.008 : 0;

  for (let year = 1; year <= totalYears; year++) {
    const currentAge = input.issueAge + year;
    const isPaying = year <= input.payYears;
    const currentPremium = isPaying ? input.annualPremium : 0;
    cumPremium += currentPremium;

    // Determine Payout
    let yearlyPayout = 0;
    if (currentAge >= input.payoutStartAge) {
      const basePayout = totalPremiumToPay * basePayoutRate;
      const freqMultiplier = input.payoutFrequency === 'monthly' ? 1.02 : 1.0;
      yearlyPayout = basePayout * freqMultiplier * (1 + dividendBonusFactor);
    }

    // Special 1st Year or Maturity Bonus
    if (year === input.payYears + 1 && input.firstYearBonusPercent > 0) {
      yearlyPayout += totalPremiumToPay * (input.firstYearBonusPercent / 100);
    }

    cumPayout += yearlyPayout;

    // Calculate Cash Value (CV)
    // Acquisition cost phase during payYears, then compounding growth
    let cvGrowthRate = (input.guaranteedRate / 100) + dividendBonusFactor;
    let baseCV = 0;

    if (isPaying) {
      // Early surrender value progression: Y1 ~60%, Y2 ~75%, Y3 ~88%, Y5 ~102%
      const payProgress = year / input.payYears;
      const surrenderFactor = 0.55 + 0.50 * Math.pow(payProgress, 0.85);
      baseCV = cumPremium * surrenderFactor;
    } else {
      // After pay years: CV compounds stably
      const prevCV = rows[year - 2]?.cashValue || (cumPremium * 1.02);
      const netAfterPayout = Math.max(0, prevCV - yearlyPayout * 0.3); // part of payout reduces main CV
      baseCV = netAfterPayout * (1 + cvGrowthRate);
    }

    // Universal Account compounding
    if (input.enableUniversalAccount) {
      // Payout rolls into universal account if not withdrawn immediately
      const depositToUniversal = yearlyPayout;
      runningUniversalValue = (runningUniversalValue + depositToUniversal) * (1 + input.universalAccountRate / 100);
    } else {
      runningUniversalValue = 0;
    }

    const totalWealth = baseCV + runningUniversalValue;

    // Death Benefit: Max of (Cumulative Premium, Cash Value, 120%-160% of premium paid)
    const deathMultiplier = isPaying ? 1.4 : 1.1;
    const deathBenefit = Math.max(cumPremium * deathMultiplier, baseCV + yearlyPayout);

    // Check Payback (Break-Even)
    const totalBenefit = baseCV + cumPayout + runningUniversalValue;
    if (!foundPayback && totalBenefit >= cumPremium && cumPremium > 0) {
      paybackYear = year;
      paybackAge = currentAge;
      foundPayback = true;
    }

    // Cash flow array for IRR up to this year:
    // Year 0..year: -premium[t] + payout[t], final year adds total wealth
    const cfSeries: number[] = [];
    for (let t = 1; t <= year; t++) {
      const p = t <= input.payYears ? input.annualPremium : 0;
      const pay = t >= (input.payoutStartAge - input.issueAge) ? (yearlyPayout / (1 + dividendBonusFactor)) : 0;
      let netCF = pay - p;
      if (t === year) {
        netCF += baseCV + runningUniversalValue;
      }
      cfSeries.push(netCF);
    }

    // Prepend initial year 0 if needed or calculate IRR
    const yearIrr = calculateIRR([-input.annualPremium, ...cfSeries.slice(1)]);

    rows.push({
      policyYear: year,
      age: currentAge,
      annualPremium: currentPremium,
      cumulativePremium: cumPremium,
      annuityPayout: Math.round(yearlyPayout),
      cumulativePayout: Math.round(cumPayout),
      cashValue: Math.round(baseCV),
      universalValue: Math.round(runningUniversalValue),
      totalWealthValue: Math.round(totalWealth),
      deathBenefit: Math.round(deathBenefit),
      annualRoiPercent: Number(((totalBenefit / Math.max(1, cumPremium) - 1) * 100).toFixed(2)),
      irrPercent: Number(yearIrr.toFixed(2)),
    });
  }

  // Find metrics at specific ages
  const getMetricsAtAge = (age: number) => {
    const row = rows.find((r) => r.age === age) || rows[rows.length - 1];
    return {
      payout: row.cumulativePayout,
      cv: row.cashValue,
      totalBenefit: row.totalWealthValue + row.cumulativePayout,
      irr: row.irrPercent,
    };
  };

  const at80 = getMetricsAtAge(80);
  const at60 = getMetricsAtAge(60);
  const at70 = getMetricsAtAge(70);
  const at90 = getMetricsAtAge(90);

  return {
    totalPremiumPaid: totalPremiumToPay,
    paybackPolicyYear: paybackYear,
    paybackAge: paybackAge,
    totalPayoutAtAge80: at80.payout,
    cashValueAtAge80: at80.cv,
    totalBenefitAtAge80: at80.totalBenefit,
    irrAtAge60: at60.irr,
    irrAtAge70: at70.irr,
    irrAtAge80: at80.irr,
    irrAtAge90: at90.irr,
    rows,
  };
}
