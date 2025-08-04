import { test } from 'node:test';
import assert from 'node:assert';
import { ConstructionLoanCalculator } from '../src/calculators/construction-loan.js';

test('ConstructionLoanCalculator - Basic Construction Loan Analysis', () => {
  const calc = new ConstructionLoanCalculator();
  const result = calc.calculate({
    project_details: {
      property_type: 'single_family',
      construction_cost: 300000,
      land_cost: 75000,
      finished_value: 500000, // Increased to make profitable
      construction_timeline_months: 6,
      square_footage: 2000
    },
    construction_loan: {
      interest_rate: 7.5,
      loan_term_months: 6,
      ltc_ratio: 0.8
    }
  });

  // Test structure
  assert(result.project_summary, 'Should have project summary');
  assert(result.total_project_cost, 'Should have total project cost');
  assert(result.construction_loan_analysis, 'Should have construction loan analysis');
  assert(result.payment_schedule, 'Should have payment schedule');
  assert(result.profitability_analysis, 'Should have profitability analysis');
  assert(result.risk_assessment, 'Should have risk assessment');
  assert(result.recommendations, 'Should have recommendations');

  // Test basic calculations
  const projectCost = result.total_project_cost;
  assert(projectCost.land_cost === 75000, 'Land cost should be $75,000');
  assert(projectCost.construction_cost === 300000, 'Construction cost should be $300,000');
  assert(projectCost.total_cost > 375000, 'Total cost should include soft costs and contingency');
  
  const loanAnalysis = result.construction_loan_analysis;
  assert(loanAnalysis.loan_amount > 0, 'Should calculate loan amount');
  assert(loanAnalysis.ltc_ratio > 0, 'Should calculate LTC ratio');
  assert(loanAnalysis.draw_schedule.length === 5, 'Should have default 5-phase draw schedule');

  // Test profitability
  const profitability = result.profitability_analysis;
  assert(profitability.investment_analysis.finished_value === 500000, 'Should preserve finished value');
  assert(profitability.investment_analysis.gross_profit > 0, 'Should calculate gross profit');
  assert(profitability.investment_analysis.profit_margin > 0, 'Should calculate profit margin');
});

test('ConstructionLoanCalculator - Custom Draw Schedule', () => {
  const calc = new ConstructionLoanCalculator();
  const result = calc.calculate({
    project_details: {
      property_type: 'custom_home',
      construction_cost: 500000,
      finished_value: 700000,
      construction_timeline_months: 8
    },
    construction_loan: {
      loan_amount: 400000,
      interest_rate: 8.0,
      loan_term_months: 8
    },
    draw_schedule: [
      { phase: 'Site Prep', percentage: 10, month: 1 },
      { phase: 'Foundation', percentage: 20, month: 2 },
      { phase: 'Framing', percentage: 25, month: 3 },
      { phase: 'MEP Rough', percentage: 20, month: 5 },
      { phase: 'Finishes', percentage: 25, month: 7 }
    ]
  });

  const loanAnalysis = result.construction_loan_analysis;
  assert(loanAnalysis.draw_schedule.length === 5, 'Should use custom draw schedule');
  assert(loanAnalysis.draw_schedule[0].phase === 'Site Prep', 'Should preserve custom phase names');
  assert(loanAnalysis.draw_schedule[0].draw_amount === 40000, 'Should calculate correct draw amounts (10% of $400k)');
  
  // Test that percentages add up to 100%
  const totalPercentage = loanAnalysis.draw_schedule.reduce((sum, draw) => sum + draw.percentage, 0);
  assert(totalPercentage === 100, 'Draw percentages should add up to 100%');
  
  // Test payment schedule
  const paymentSchedule = result.payment_schedule;
  assert(paymentSchedule.monthly_payments.length === 8, 'Should have 8 months of payments');
  assert(paymentSchedule.summary.total_interest_paid > 0, 'Should calculate total interest');
});

test('ConstructionLoanCalculator - Permanent Financing Analysis', () => {
  const calc = new ConstructionLoanCalculator();
  const result = calc.calculate({
    project_details: {
      property_type: 'multi_family',
      construction_cost: 800000,
      finished_value: 1200000,
      construction_timeline_months: 10
    },
    construction_loan: {
      loan_amount: 640000,
      interest_rate: 7.25,
      loan_term_months: 10
    },
    permanent_financing: {
      permanent_rate: 6.5,
      permanent_term_years: 30,
      permanent_ltv: 0.75,
      conversion_type: 'construction_to_perm',
      conversion_fees: 2500
    }
  });

  const permanentAnalysis = result.permanent_financing_analysis;
  assert(permanentAnalysis, 'Should have permanent financing analysis');
  assert(permanentAnalysis.finished_appraised_value === 1200000, 'Should use finished value');
  assert(permanentAnalysis.permanent_ltv === 0.75, 'Should use specified LTV');
  assert(permanentAnalysis.max_permanent_loan === 900000, 'Max loan should be 75% of $1.2M');
  assert(permanentAnalysis.monthly_payment > 0, 'Should calculate monthly payment');
  assert(permanentAnalysis.conversion_details.conversion_fees === 2500, 'Should include conversion fees');
  
  // Test loan summary
  const loanSummary = permanentAnalysis.loan_summary;
  assert(loanSummary.interest_rate === 6.5, 'Should preserve permanent rate');
  assert(loanSummary.term_years === 30, 'Should preserve loan term');
  assert(loanSummary.total_interest > 0, 'Should calculate total interest over loan life');
});

test('ConstructionLoanCalculator - Additional Costs and Contingency', () => {
  const calc = new ConstructionLoanCalculator();
  const result = calc.calculate({
    project_details: {
      property_type: 'commercial',
      construction_cost: 1000000,
      finished_value: 1400000,
      construction_timeline_months: 12
    },
    construction_loan: {
      interest_rate: 8.5,
      loan_term_months: 12,
      ltc_ratio: 0.75
    },
    additional_costs: {
      permits_fees: 25000,
      utility_connections: 35000,
      soft_costs: 100000,
      interim_insurance: 8000,
      carrying_costs: 20000,
      contingency_percentage: 15
    }
  });

  const totalCost = result.total_project_cost;
  assert(totalCost.soft_costs_breakdown.permits_fees === 25000, 'Should use custom permit fees');
  assert(totalCost.soft_costs_breakdown.utility_connections === 35000, 'Should use custom utility costs');
  assert(totalCost.contingency_percentage === 15, 'Should use custom contingency percentage');
  assert(totalCost.contingency === 150000, 'Contingency should be 15% of $1M construction cost');
  
  // Test cost breakdown percentages
  const breakdown = totalCost.cost_breakdown_percentage;
  assert(breakdown.construction > 0, 'Should calculate construction percentage');
  assert(breakdown.soft_costs > 0, 'Should calculate soft costs percentage');
  assert(breakdown.contingency > 0, 'Should calculate contingency percentage');
  
  // Test that percentages add up to approximately 100%
  const totalPercentage = Object.values(breakdown).reduce((sum, pct) => sum + pct, 0);
  assert(Math.abs(totalPercentage - 100) < 1, 'Cost breakdown should add up to ~100%');
});

test('ConstructionLoanCalculator - Risk Assessment', () => {
  const calc = new ConstructionLoanCalculator();
  const result = calc.calculate({
    project_details: {
      property_type: 'single_family',
      construction_cost: 400000,
      finished_value: 480000, // Low margin
      construction_timeline_months: 14 // Long timeline
    },
    construction_loan: {
      interest_rate: 9.5, // High rate
      loan_term_months: 14,
      ltc_ratio: 0.95 // High leverage
    },
    additional_costs: {
      contingency_percentage: 5 // Low contingency
    }
  });

  const riskAssessment = result.risk_assessment;
  assert(riskAssessment.identified_risks.length > 0, 'Should identify risks');
  assert(riskAssessment.overall_risk_level, 'Should assign overall risk level');
  assert(riskAssessment.risk_score > 0, 'Should calculate risk score');
  
  // Check for specific high-risk conditions
  const riskTypes = riskAssessment.identified_risks.map(risk => risk.category);
  assert(riskTypes.includes('Timeline Risk'), 'Should identify timeline risk for 14-month project');
  assert(riskTypes.includes('Cost Risk'), 'Should identify cost risk for low contingency');
  assert(riskTypes.includes('Financing Risk'), 'Should identify financing risk for high rate');
  assert(riskTypes.includes('Leverage Risk'), 'Should identify leverage risk for 95% LTC');
  
  // Test mitigation strategies
  assert(Array.isArray(riskAssessment.risk_mitigation_strategies), 'Should provide mitigation strategies');
  assert(riskAssessment.risk_mitigation_strategies.length > 0, 'Should have specific mitigation strategies');
  
  // Test contingency recommendations
  const contingencyRec = riskAssessment.contingency_recommendations;
  assert(contingencyRec.current_contingency === 5, 'Should track current contingency');
  assert(contingencyRec.recommendation.includes('Increase'), 'Should recommend increasing low contingency');
});

test('ConstructionLoanCalculator - Cash Flow Analysis', () => {
  const calc = new ConstructionLoanCalculator();
  const result = calc.calculate({
    project_details: {
      property_type: 'single_family',
      construction_cost: 350000,
      finished_value: 500000,
      construction_timeline_months: 7
    },
    construction_loan: {
      loan_amount: 280000,
      interest_rate: 7.75,
      loan_term_months: 7
    },
    analysis_options: {
      monthly_cash_flow: true
    }
  });

  const cashFlowAnalysis = result.cash_flow_requirements;
  assert(cashFlowAnalysis, 'Should have cash flow analysis when requested');
  assert(cashFlowAnalysis.monthly_cash_flow.length === 7, 'Should have 7 months of cash flow data');
  
  const monthlyCashFlow = cashFlowAnalysis.monthly_cash_flow;
  monthlyCashFlow.forEach((month, index) => {
    assert(month.month === index + 1, `Month ${index + 1} should be properly indexed`);
    assert(typeof month.estimated_monthly_costs === 'number', 'Should have monthly cost estimates');
    assert(typeof month.draws_received === 'number', 'Should track draws received');
    assert(typeof month.interest_payment === 'number', 'Should calculate interest payments');
    assert(typeof month.cumulative_out_of_pocket === 'number', 'Should track cumulative out-of-pocket');
  });

  const cashFlowSummary = cashFlowAnalysis.cash_flow_summary;
  assert(cashFlowSummary.peak_cash_requirement > 0, 'Should calculate peak cash requirement');
  assert(cashFlowSummary.total_out_of_pocket_needed > 0, 'Should calculate total out-of-pocket needed');
  assert(cashFlowSummary.recommended_reserve > cashFlowSummary.peak_cash_requirement, 
    'Recommended reserve should include buffer above peak requirement');
});

test('ConstructionLoanCalculator - Scenario Comparison', () => {
  const calc = new ConstructionLoanCalculator();
  const result = calc.calculate({
    project_details: {
      property_type: 'single_family',
      construction_cost: 300000,
      finished_value: 425000,
      construction_timeline_months: 6
    },
    construction_loan: {
      interest_rate: 7.5,
      loan_term_months: 6
    },
    analysis_options: {
      compare_scenarios: true
    }
  });

  const scenarioComparison = result.scenario_comparison;
  assert(scenarioComparison, 'Should have scenario comparison when requested');
  assert(scenarioComparison.scenarios.length === 3, 'Should compare 3 scenarios');
  
  const scenarios = scenarioComparison.scenarios;
  const scenarioNames = scenarios.map(s => s.name);
  assert(scenarioNames.includes('Base Scenario'), 'Should include base scenario');
  assert(scenarioNames.includes('Higher Leverage (90% LTC)'), 'Should include high leverage scenario');
  assert(scenarioNames.includes('Conservative (70% LTC)'), 'Should include conservative scenario');
  
  scenarios.forEach(scenario => {
    assert(typeof scenario.loan_amount === 'number', 'Should calculate loan amount for each scenario');
    assert(typeof scenario.ltc_ratio === 'number', 'Should have LTC ratio for each scenario');
    assert(typeof scenario.estimated_interest === 'number', 'Should estimate interest for each scenario');
    assert(typeof scenario.out_of_pocket_needed === 'number', 'Should calculate out-of-pocket for each scenario');
    assert(typeof scenario.effective_cost === 'number', 'Should calculate effective cost for each scenario');
  });

  assert(scenarioComparison.recommendation, 'Should provide scenario recommendation');
  assert(scenarioComparison.recommendation.recommended_scenario, 'Should recommend specific scenario');
  assert(scenarioComparison.recommendation.reasoning, 'Should provide reasoning for recommendation');
});

test('ConstructionLoanCalculator - Stress Testing', () => {
  const calc = new ConstructionLoanCalculator();
  const result = calc.calculate({
    project_details: {
      property_type: 'single_family',
      construction_cost: 400000,
      finished_value: 550000,
      construction_timeline_months: 8
    },
    construction_loan: {
      interest_rate: 7.25,
      loan_term_months: 8,
      ltc_ratio: 0.8
    },
    analysis_options: {
      stress_test: true
    }
  });

  const stressTesting = result.stress_testing;
  assert(stressTesting, 'Should have stress testing when requested');
  assert(Array.isArray(stressTesting.stress_tests), 'Should have array of stress tests');
  assert(stressTesting.stress_tests.length > 0, 'Should have multiple stress test scenarios');
  
  // Check for different types of stress tests
  const testImpacts = stressTesting.stress_tests.map(test => test.impact);
  assert(testImpacts.includes('Cost'), 'Should test cost overrun scenarios');
  assert(testImpacts.includes('Timeline'), 'Should test timeline delay scenarios');
  assert(testImpacts.includes('Market Value'), 'Should test market value decline scenarios');
  
  stressTesting.stress_tests.forEach(test => {
    assert(test.scenario, 'Each test should have scenario description');
    assert(test.parameter_change, 'Each test should show parameter change');
    assert(typeof test.new_profit_margin === 'number', 'Should calculate new profit margin');
    assert(test.viability, 'Should assess viability of each scenario');
    assert(['Viable', 'Marginal', 'Not Viable'].includes(test.viability), 'Viability should be valid option');
  });

  assert(stressTesting.worst_case_scenario, 'Should identify worst case scenario');
  assert(typeof stressTesting.resilience_score === 'number', 'Should calculate resilience score');
  assert(stressTesting.resilience_score >= 0 && stressTesting.resilience_score <= 100, 
    'Resilience score should be 0-100');
  assert(Array.isArray(stressTesting.recommendations), 'Should provide stress test recommendations');
});

test('ConstructionLoanCalculator - Profitability Rating', () => {
  const calc = new ConstructionLoanCalculator();
  
  // Test high profitability scenario
  const highProfitResult = calc.calculate({
    project_details: {
      property_type: 'single_family',
      construction_cost: 250000,
      finished_value: 400000, // 60% markup
      construction_timeline_months: 5
    },
    construction_loan: {
      interest_rate: 6.5,
      loan_term_months: 5,
      ltc_ratio: 0.75
    }
  });

  const highProfitability = highProfitResult.profitability_analysis;
  assert(highProfitability.investment_analysis.profit_margin > 15, 'Should have high profit margin');
  assert(['Excellent', 'Very Good'].includes(highProfitability.profitability_rating), 
    'Should rate high profitability favorably');

  // Test low profitability scenario
  const lowProfitResult = calc.calculate({
    project_details: {
      property_type: 'single_family',
      construction_cost: 350000,
      finished_value: 375000, // Only 7% markup
      construction_timeline_months: 8
    },
    construction_loan: {
      interest_rate: 8.5,
      loan_term_months: 8,
      ltc_ratio: 0.9
    }
  });

  const lowProfitability = lowProfitResult.profitability_analysis;
  assert(lowProfitability.investment_analysis.profit_margin < 10, 'Should have low profit margin');
  assert(['Poor', 'Fair'].includes(lowProfitability.profitability_rating), 
    'Should rate low profitability unfavorably');
});

test('ConstructionLoanCalculator - Recommendations Generation', () => {
  const calc = new ConstructionLoanCalculator();
  const result = calc.calculate({
    project_details: {
      property_type: 'single_family',
      construction_cost: 300000,
      finished_value: 320000, // Very low margin
      construction_timeline_months: 15 // Long timeline
    },
    construction_loan: {
      interest_rate: 9.0,
      loan_term_months: 15,
      ltc_ratio: 0.9 // High leverage
    },
    additional_costs: {
      contingency_percentage: 6 // Low contingency
    }
  });

  const recommendations = result.recommendations;
  assert(Array.isArray(recommendations), 'Should provide recommendations array');
  assert(recommendations.length > 0, 'Should have specific recommendations');
  
  recommendations.forEach(rec => {
    assert(rec.category, 'Each recommendation should have category');
    assert(rec.priority, 'Each recommendation should have priority');
    assert(rec.recommendation, 'Each recommendation should have description');
    assert(rec.action, 'Each recommendation should have specific action');
    assert(['High', 'Medium', 'Low'].includes(rec.priority), 'Priority should be valid');
  });

  // Check for specific recommendations based on the risky scenario
  const categories = recommendations.map(rec => rec.category);
  assert(categories.includes('Profitability'), 'Should recommend profitability improvements for low margin');
  assert(categories.includes('Budget'), 'Should recommend budget improvements for low contingency');
  
  // High priority recommendations should exist for this risky scenario
  const highPriorityRecs = recommendations.filter(rec => rec.priority === 'High');
  assert(highPriorityRecs.length > 0, 'Should have high priority recommendations for risky project');
});

test('ConstructionLoanCalculator - Schema Validation', () => {
  const calc = new ConstructionLoanCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.project_details, 'Should have project_details property');
  assert(schema.properties.construction_loan, 'Should have construction_loan property');
  assert(schema.properties.permanent_financing, 'Should have permanent_financing property');
  assert(schema.properties.draw_schedule, 'Should have draw_schedule property');
  assert(schema.properties.additional_costs, 'Should have additional_costs property');
  assert(schema.properties.analysis_options, 'Should have analysis_options property');
  
  assert(schema.required.includes('project_details'), 'project_details should be required');
  assert(schema.required.includes('construction_loan'), 'construction_loan should be required');
  
  // Test nested schema structure
  const projectDetails = schema.properties.project_details;
  assert(projectDetails.properties.property_type, 'Should define property_type');
  assert(projectDetails.properties.construction_cost, 'Should define construction_cost');
  assert(projectDetails.properties.finished_value, 'Should define finished_value');
  assert(projectDetails.required.includes('property_type'), 'property_type should be required');
  assert(projectDetails.required.includes('construction_cost'), 'construction_cost should be required');
});