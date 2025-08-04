import { test } from 'node:test';
import assert from 'node:assert';
import { HardMoneyLoanCalculator } from '../src/calculators/hard-money-loan.js';

test('HardMoneyLoanCalculator - Basic Interest-Only Loan', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 200000,
      property_value: 250000,
      interest_rate: 12.0,
      loan_term_months: 12,
      points: 2,
      origination_fee: 1,
      payment_type: 'interest_only'
    }
  });

  // Test structure
  assert(result.loan_summary, 'Should have loan summary');
  assert(result.loan_metrics, 'Should have loan metrics');
  assert(result.cost_analysis, 'Should have cost analysis');
  assert(result.risk_assessment, 'Should have risk assessment');

  // Test loan summary
  const summary = result.loan_summary;
  assert(summary.loan_amount === 200000, 'Should preserve loan amount');
  assert(summary.property_value === 250000, 'Should preserve property value');
  assert(summary.ltv_ratio === 80, 'Should calculate 80% LTV (200k/250k)');
  assert(summary.interest_rate === 12.0, 'Should preserve interest rate');
  assert(summary.payment_type === 'interest_only', 'Should preserve payment type');

  // Test loan metrics
  const metrics = result.loan_metrics;
  assert(metrics.monthly_payment === 2000, 'Should calculate $2,000 monthly payment (200k * 12% / 12)');
  assert(metrics.total_interest === 24000, 'Should calculate $24,000 total interest (2000 * 12)');
  assert(metrics.balloon_payment === 200000, 'Should have balloon payment equal to principal');
  assert(metrics.points_cost === 4000, 'Should calculate $4,000 points cost (200k * 2%)');
  assert(metrics.origination_cost === 2000, 'Should calculate $2,000 origination fee (200k * 1%)');
  assert(metrics.net_proceeds < 200000, 'Should calculate net proceeds after costs');
  assert(metrics.effective_interest_rate > 12, 'Should calculate effective rate higher than nominal');
});

test('HardMoneyLoanCalculator - Principal and Interest Loan', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 150000,
      property_value: 200000,
      interest_rate: 10.5,
      loan_term_months: 24,
      payment_type: 'principal_and_interest'
    }
  });

  const metrics = result.loan_metrics;
  
  // Should have amortized payment
  assert(metrics.monthly_payment > 6000, 'Should calculate amortized payment higher than interest-only');
  assert(metrics.balloon_payment === 0, 'Should have no balloon payment for fully amortized loan');
  assert(metrics.total_interest > 0, 'Should calculate total interest');
  assert(metrics.total_interest < metrics.monthly_payment * 24, 'Total interest should be less than total payments');
  
  // Should have payment schedule
  assert(Array.isArray(metrics.payment_schedule), 'Should provide payment schedule');
  assert(metrics.payment_schedule.length > 0, 'Should have payment schedule entries');
  assert(metrics.payment_schedule[0].month === 1, 'Should start with month 1');
  assert(metrics.payment_schedule[0].principal > 0, 'Should have principal payment');
});

test('HardMoneyLoanCalculator - Fix and Flip Project Analysis', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 180000,
      property_value: 150000,
      interest_rate: 13.5,
      loan_term_months: 9,
      payment_type: 'interest_only'
    },
    project_details: {
      project_type: 'fix_flip',
      purchase_price: 150000,
      rehab_budget: 50000,
      after_repair_value: 280000,
      project_timeline_months: 6,
      construction_draws: false
    }
  });

  const project = result.project_analysis;
  assert(project, 'Should include project analysis');
  assert(project.project_type === 'fix_flip', 'Should preserve project type');
  assert(project.total_project_cost === 200000, 'Should calculate total cost (150k + 50k)');
  assert(project.loan_to_cost === 90, 'Should calculate 90% loan-to-cost (180k/200k)');
  assert(project.loan_to_arv > 60 && project.loan_to_arv < 70, 'Should calculate loan-to-ARV around 64%');
  assert(project.gross_profit > 0, 'Should calculate positive gross profit');
  assert(project.profit_margin > 0, 'Should calculate profit margin');
  assert(project.roi > 0, 'Should calculate ROI');
  assert(project.annualized_roi > project.roi, 'Should calculate annualized ROI');
  assert(project.viability_score > 0, 'Should calculate viability score');
  assert(['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].includes(project.viability_rating), 
    'Should provide valid viability rating');
});

test('HardMoneyLoanCalculator - Ground-Up Construction Project', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 300000,
      property_value: 200000,
      interest_rate: 14.0,
      loan_term_months: 18,
      payment_type: 'interest_only'
    },
    project_details: {
      project_type: 'ground_up_construction',
      purchase_price: 100000,
      rehab_budget: 250000,
      after_repair_value: 450000,
      project_timeline_months: 15,
      construction_draws: true
    }
  });

  const project = result.project_analysis;
  const risks = result.risk_assessment;
  
  assert(project.project_type === 'ground_up_construction', 'Should preserve construction type');
  assert(project.construction_draws === true, 'Should note construction draws');
  assert(project.viability_score < 80, 'Construction projects should have lower viability scores');
  
  // Should identify construction risks
  const constructionRisk = risks.identified_risks.find(r => r.category === 'Project Risk');
  assert(constructionRisk, 'Should identify construction project risk');
  assert(constructionRisk.level === 'High', 'Should mark construction risk as high');
  assert(risks.overall_risk_level === 'High' || risks.overall_risk_level === 'Medium', 
    'Should have elevated risk level for construction');
});

test('HardMoneyLoanCalculator - Cost Analysis', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 100000,
      property_value: 125000,
      interest_rate: 11.0,
      loan_term_months: 6,
      points: 3,
      payment_type: 'interest_only'
    },
    project_details: {
      project_timeline_months: 4
    }
  });

  const cost = result.cost_analysis;
  assert(cost.effective_annual_rate > 11, 'Should calculate effective rate higher than nominal');
  assert(cost.monthly_carrying_cost > 900, 'Should calculate monthly carrying cost');
  assert(cost.total_carrying_cost > 0, 'Should calculate total carrying cost');
  assert(cost.cost_per_month_per_100k > 0, 'Should calculate cost per 100k');
  assert(cost.upfront_cost_percentage > 0, 'Should calculate upfront cost percentage');
  assert(Array.isArray(cost.cost_analysis), 'Should provide cost analysis');
});

test('HardMoneyLoanCalculator - Risk Assessment', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 225000,
      property_value: 250000, // 90% LTV
      interest_rate: 16.0, // High rate
      loan_term_months: 12,
      payment_type: 'interest_only'
    },
    project_details: {
      project_type: 'heavy_rehab',
      project_timeline_months: 15 // Exceeds loan term
    },
    borrower_profile: {
      experience_level: 'beginner'
    }
  });

  const risks = result.risk_assessment;
  assert(Array.isArray(risks.identified_risks), 'Should identify specific risks');
  assert(risks.identified_risks.length > 0, 'Should identify multiple risks');
  assert(risks.risk_score > 0, 'Should calculate risk score');
  assert(['High', 'Medium', 'Low'].includes(risks.overall_risk_level), 
    'Should assign valid risk level');

  // Should identify high interest rate risk
  const interestRisk = risks.identified_risks.find(r => r.category === 'Cost Risk');
  assert(interestRisk, 'Should identify high interest rate risk');

  // Should identify high LTV risk
  const ltvRisk = risks.identified_risks.find(r => r.category === 'Market Risk');
  assert(ltvRisk, 'Should identify high LTV risk');

  // Should identify project risk for heavy rehab
  const projectRisk = risks.identified_risks.find(r => r.category === 'Project Risk');
  assert(projectRisk, 'Should identify heavy rehab project risk');

  // Should identify timeline risk
  const timelineRisk = risks.identified_risks.find(r => r.category === 'Timeline Risk');
  assert(timelineRisk, 'Should identify timeline exceeding loan term');

  // Should identify borrower experience risk
  const borrowerRisk = risks.identified_risks.find(r => r.category === 'Borrower Risk');
  assert(borrowerRisk, 'Should identify beginner experience risk');

  assert(Array.isArray(risks.risk_mitigation_strategies), 'Should provide mitigation strategies');
});

test('HardMoneyLoanCalculator - Conventional Financing Comparison', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 160000,
      property_value: 200000,
      interest_rate: 12.5,
      loan_term_months: 12,
      payment_type: 'interest_only'
    },
    project_details: {
      project_type: 'fix_flip',
      project_timeline_months: 8
    },
    analysis_options: {
      compare_conventional: true
    }
  });

  const comparison = result.conventional_comparison;
  assert(comparison, 'Should include conventional comparison when requested');
  assert(comparison.hard_money, 'Should have hard money details');
  assert(comparison.conventional, 'Should have conventional details');
  assert(comparison.hard_money.interest_rate === 12.5, 'Should preserve hard money rate');
  assert(comparison.conventional.interest_rate === 7.0, 'Should use standard conventional rate');
  assert(comparison.hard_money.approval_time === '3-7 days', 'Should note quick approval');
  assert(comparison.conventional.approval_time === '30-45 days', 'Should note longer approval');
  
  assert(Array.isArray(comparison.hard_money_advantages), 'Should list hard money advantages');
  assert(Array.isArray(comparison.conventional_advantages), 'Should list conventional advantages');
  assert(comparison.recommendation, 'Should provide financing recommendation');
});

test('HardMoneyLoanCalculator - Stress Testing', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 140000,
      property_value: 175000,
      interest_rate: 13.0,
      loan_term_months: 12,
      payment_type: 'interest_only'
    },
    project_details: {
      project_type: 'fix_flip',
      rehab_budget: 40000,
      after_repair_value: 240000,
      project_timeline_months: 8
    },
    analysis_options: {
      stress_testing: true
    }
  });

  const stress = result.stress_testing;
  assert(stress, 'Should include stress testing when requested');
  assert(Array.isArray(stress.scenarios), 'Should provide multiple scenarios');
  assert(stress.scenarios.length >= 4, 'Should have at least 4 scenarios (base + 3 stress)');
  
  const scenarios = stress.scenarios;
  assert(scenarios.find(s => s.name === 'Base Case'), 'Should include base case');
  assert(scenarios.find(s => s.name.includes('Timeline Delay')), 'Should include timeline delay scenario');
  assert(scenarios.find(s => s.name.includes('Cost Overrun')), 'Should include cost overrun scenario');
  assert(scenarios.find(s => s.name.includes('Market Decline')), 'Should include market decline scenario');

  assert(stress.most_likely_risk, 'Should identify most likely risk');
  assert(stress.highest_impact_risk, 'Should identify highest impact risk');
  assert(Array.isArray(stress.stress_test_recommendations), 'Should provide stress test recommendations');
});

test('HardMoneyLoanCalculator - ROI Analysis', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 120000,
      property_value: 100000,
      interest_rate: 11.5,
      loan_term_months: 10,
      payment_type: 'interest_only'
    },
    project_details: {
      project_type: 'fix_flip',
      purchase_price: 100000,
      rehab_budget: 30000,
      after_repair_value: 180000,
      project_timeline_months: 6
    },
    analysis_options: {
      roi_analysis: true
    }
  });

  const roi = result.roi_analysis;
  assert(roi, 'Should include ROI analysis when requested');
  assert(roi.total_investment > 0, 'Should calculate total investment');
  assert(roi.gross_profit !== undefined, 'Should calculate gross profit');
  assert(roi.roi !== undefined, 'Should calculate ROI');
  assert(roi.annualized_roi !== undefined, 'Should calculate annualized ROI');
  assert(roi.cash_invested > 0, 'Should calculate cash invested');
  assert(roi.cash_on_cash_return !== undefined, 'Should calculate cash-on-cash return');
  assert(roi.annualized_coc !== undefined, 'Should calculate annualized CoC');
  assert(roi.profit_per_month !== undefined, 'Should calculate profit per month');
  assert(['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].includes(roi.roi_rating), 
    'Should provide valid ROI rating');
  assert(roi.roi_benchmarks, 'Should provide ROI benchmarks');
});

test('HardMoneyLoanCalculator - Prepayment Analysis', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 200000,
      property_value: 250000,
      interest_rate: 12.0,
      loan_term_months: 18,
      payment_type: 'interest_only'
    },
    analysis_options: {
      prepayment_analysis: true
    }
  });

  const prepayment = result.prepayment_analysis;
  assert(prepayment, 'Should include prepayment analysis when requested');
  assert(Array.isArray(prepayment.prepayment_scenarios), 'Should provide prepayment scenarios');
  assert(prepayment.prepayment_scenarios.length > 0, 'Should have prepayment scenarios');
  
  const scenarios = prepayment.prepayment_scenarios;
  scenarios.forEach(scenario => {
    assert(scenario.prepayment_month > 0, 'Should have valid prepayment month');
    assert(scenario.interest_saved > 0, 'Should calculate interest saved');
    assert(scenario.total_cost > 0, 'Should calculate total cost');
    assert(scenario.savings_vs_full_term > 0, 'Should calculate savings vs full term');
  });

  if (prepayment.optimal_prepayment) {
    assert(prepayment.optimal_prepayment.prepayment_month > 0, 'Should identify optimal prepayment timing');
  }
  
  assert(Array.isArray(prepayment.prepayment_benefits), 'Should list prepayment benefits');
});

test('HardMoneyLoanCalculator - Recommendations Generation', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 175000,
      property_value: 200000,
      interest_rate: 13.5,
      loan_term_months: 12,
      payment_type: 'interest_only'
    },
    project_details: {
      project_type: 'light_rehab',
      purchase_price: 150000,
      rehab_budget: 25000,
      after_repair_value: 220000,
      project_timeline_months: 4
    },
    borrower_profile: {
      experience_level: 'intermediate'
    }
  });

  const recommendations = result.recommendations;
  assert(recommendations, 'Should provide recommendations');
  assert(Array.isArray(recommendations.recommendations), 'Should have recommendations array');
  assert(recommendations.recommendations.length > 0, 'Should have multiple recommendations');
  assert(recommendations.overall_assessment, 'Should provide overall assessment');
  assert(['Highly Recommended', 'Recommended', 'Proceed with Caution', 'Not Recommended']
    .includes(recommendations.overall_assessment), 'Should provide valid assessment');

  const categories = recommendations.recommendations.map(r => r.category);
  assert(categories.length > 0, 'Should categorize recommendations');

  assert(Array.isArray(recommendations.key_success_factors), 'Should provide success factors');
  assert(recommendations.key_success_factors.length > 0, 'Should have success factors');
});

test('HardMoneyLoanCalculator - High Points and Fees', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 100000,
      property_value: 125000,
      interest_rate: 10.0,
      loan_term_months: 6,
      points: 5, // High points
      origination_fee: 2, // High origination
      payment_type: 'interest_only'
    },
    additional_costs: {
      appraisal_fee: 600,
      inspection_fees: 400,
      title_insurance: 1200,
      attorney_fees: 800,
      recording_fees: 200
    }
  });

  const metrics = result.loan_metrics;
  assert(metrics.points_cost === 5000, 'Should calculate $5,000 points cost');
  assert(metrics.origination_cost === 2000, 'Should calculate $2,000 origination fee');
  assert(metrics.closing_costs === 3200, 'Should calculate $3,200 additional closing costs');
  assert(metrics.total_upfront_costs === 10200, 'Should calculate total upfront costs');
  assert(metrics.net_proceeds === 89800, 'Should calculate net proceeds after costs');
  assert(metrics.effective_interest_rate > 20, 'Should show high effective rate due to costs');
});

test('HardMoneyLoanCalculator - Buy and Hold Project', () => {
  const calc = new HardMoneyLoanCalculator();
  const result = calc.calculate({
    loan_details: {
      loan_amount: 160000,
      property_value: 200000,
      interest_rate: 11.0,
      loan_term_months: 24, // Longer term for buy-hold
      payment_type: 'interest_only'
    },
    project_details: {
      project_type: 'buy_hold',
      purchase_price: 180000,
      rehab_budget: 20000,
      after_repair_value: 220000,
      project_timeline_months: 24
    },
    analysis_options: {
      compare_conventional: true
    }
  });

  const project = result.project_analysis;
  const comparison = result.conventional_comparison;
  
  assert(project.project_type === 'buy_hold', 'Should preserve buy and hold type');
  assert(comparison, 'Should include conventional comparison');
  assert(comparison.recommendation.includes('conventional'), 
    'Should recommend conventional financing for long-term holds');
});

test('HardMoneyLoanCalculator - Schema Validation', () => {
  const calc = new HardMoneyLoanCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.loan_details, 'Should have loan_details property');
  assert(schema.properties.project_details, 'Should have project_details property');
  assert(schema.properties.borrower_profile, 'Should have borrower_profile property');
  assert(schema.properties.additional_costs, 'Should have additional_costs property');
  assert(schema.properties.analysis_options, 'Should have analysis_options property');
  
  assert(schema.required.includes('loan_details'), 'loan_details should be required');
  
  // Test nested schema structure
  const loanDetails = schema.properties.loan_details;
  assert(loanDetails.properties.loan_amount, 'Should define loan_amount');
  assert(loanDetails.properties.property_value, 'Should define property_value');
  assert(loanDetails.properties.interest_rate, 'Should define interest_rate');
  assert(loanDetails.properties.payment_type, 'Should define payment_type');
  assert(loanDetails.required.includes('loan_amount'), 'loan_amount should be required');
  assert(loanDetails.required.includes('property_value'), 'property_value should be required');
  assert(loanDetails.required.includes('payment_type'), 'payment_type should be required');
});