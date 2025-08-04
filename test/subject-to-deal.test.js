import { test } from 'node:test';
import assert from 'node:assert';
import { SubjectToDealCalculator } from '../src/calculators/subject-to-deal.js';

test('SubjectToDealCalculator - Basic Subject-To Deal Analysis', () => {
  const calc = new SubjectToDealCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 180000,
      condition: 'good'
    },
    existing_mortgage: {
      current_balance: 150000,
      monthly_payment: 1200,
      interest_rate: 6.5,
      remaining_term_months: 240,
      loan_type: 'conventional'
    },
    seller_situation: {
      reason_for_selling: 'financial_hardship',
      seller_motivation_level: 'very_high',
      months_behind: 2,
      arrears_amount: 2400
    },
    deal_structure: {
      purchase_price: 160000,
      cash_to_seller: 5000,
      closing_costs: 3000,
      deed_transfer_method: 'warranty_deed',
      authorization_agreements: true
    },
    rental_analysis: {
      estimated_monthly_rent: 1500,
      vacancy_rate: 5,
      property_management_rate: 8
    }
  });

  // Test structure
  assert(result.deal_summary, 'Should have deal summary');
  assert(result.deal_metrics, 'Should have deal metrics');
  assert(result.cash_flow_analysis, 'Should have cash flow analysis');
  assert(result.equity_analysis, 'Should have equity analysis');
  assert(result.recommendations, 'Should have recommendations');

  // Test deal metrics
  const metrics = result.deal_metrics;
  assert(metrics.market_value === 180000, 'Should preserve market value');
  assert(metrics.mortgage_balance === 150000, 'Should preserve mortgage balance');
  assert(metrics.total_cash_invested === 8000, 'Should calculate total cash invested (5000+3000)');
  assert(metrics.instant_equity > 0, 'Should calculate positive instant equity');
  assert(metrics.deal_quality_score > 0, 'Should calculate deal quality score');

  // Test cash flow analysis
  const cashFlow = result.cash_flow_analysis;
  assert(cashFlow.gross_monthly_rent === 1500, 'Should preserve gross rent');
  assert(cashFlow.net_monthly_cash_flow > 0, 'Should calculate positive net cash flow');
  assert(cashFlow.cash_on_cash_return !== null, 'Should calculate cash-on-cash return');
  assert(cashFlow.cash_flow_rating, 'Should provide cash flow rating');

  // Test equity analysis
  const equity = result.equity_analysis;
  assert(equity.current_equity === 30000, 'Should calculate current equity (180k - 150k)');
  assert(equity.monthly_principal_paydown > 0, 'Should calculate monthly principal paydown');
  assert(equity.annual_principal_paydown > 0, 'Should calculate annual principal paydown');
});

test('SubjectToDealCalculator - Deal Quality Scoring', () => {
  const calc = new SubjectToDealCalculator();
  
  // Test high quality deal
  const highQualityResult = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 200000
    },
    existing_mortgage: {
      current_balance: 120000,
      monthly_payment: 1000,
      interest_rate: 5.5,
      remaining_term_months: 300,
      loan_type: 'fha'
    },
    seller_situation: {
      reason_for_selling: 'job_relocation',
      seller_motivation_level: 'extremely_high'
    },
    deal_structure: {
      purchase_price: 160000,
      cash_to_seller: 3000,
      deed_transfer_method: 'warranty_deed'
    },
    rental_analysis: {
      estimated_monthly_rent: 1600
    }
  });

  assert(highQualityResult.deal_metrics.deal_quality_score >= 60, 
    'Should score high quality deal favorably');
  assert(highQualityResult.deal_metrics.discount_percentage === 20, 
    'Should calculate 20% discount (200k vs 160k)');

  // Test poor quality deal
  const poorQualityResult = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 150000
    },
    existing_mortgage: {
      current_balance: 148000,
      monthly_payment: 1400,
      interest_rate: 8.0,
      remaining_term_months: 360,
      loan_type: 'conventional'
    },
    seller_situation: {
      reason_for_selling: 'other',
      seller_motivation_level: 'moderate'
    },
    deal_structure: {
      purchase_price: 150000,
      cash_to_seller: 10000,
      deed_transfer_method: 'quitclaim_deed'
    },
    rental_analysis: {
      estimated_monthly_rent: 1200
    }
  });

  assert(poorQualityResult.deal_metrics.deal_quality_score < 50, 
    'Should score poor quality deal unfavorably');
});

test('SubjectToDealCalculator - Cash Flow Analysis', () => {
  const calc = new SubjectToDealCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 175000
    },
    existing_mortgage: {
      current_balance: 140000,
      monthly_payment: 1100,
      interest_rate: 6.0,
      remaining_term_months: 250
    },
    seller_situation: {
      reason_for_selling: 'divorce',
      seller_motivation_level: 'high'
    },
    deal_structure: {
      purchase_price: 165000,
      cash_to_seller: 4000,
      deed_transfer_method: 'warranty_deed'
    },
    rental_analysis: {
      estimated_monthly_rent: 1450,
      vacancy_rate: 8,
      property_management_rate: 10,
      maintenance_reserves: 100
    }
  });

  const cashFlow = result.cash_flow_analysis;
  
  // Effective rent = 1450 * (1 - 0.08) = 1334
  assert(Math.abs(cashFlow.effective_monthly_rent - 1334) < 1, 'Should calculate effective rent with vacancy');
  
  // Management fee = 1334 * 0.10 = 133.4
  assert(Math.abs(cashFlow.monthly_expenses.management_fee - 133.4) < 1, 'Should calculate management fee');
  
  // Net cash flow = 1334 - 1100 - 133.4 - 100 = 0.6
  assert(cashFlow.net_monthly_cash_flow >= -10, 'Should calculate net cash flow');
  assert(cashFlow.cash_flow_coverage_ratio > 1, 'Should calculate coverage ratio > 1');
  assert(['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].includes(cashFlow.cash_flow_rating), 
    'Should provide valid cash flow rating');
});

test('SubjectToDealCalculator - Risk Assessment', () => {
  const calc = new SubjectToDealCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 160000
    },
    existing_mortgage: {
      current_balance: 155000,
      monthly_payment: 1350,
      interest_rate: 8.5,
      remaining_term_months: 300,
      loan_type: 'conventional'
    },
    seller_situation: {
      reason_for_selling: 'foreclosure_threat',
      seller_motivation_level: 'extremely_high',
      months_behind: 4,
      arrears_amount: 5400
    },
    deal_structure: {
      purchase_price: 160000,
      cash_to_seller: 2000,
      deed_transfer_method: 'quitclaim_deed',
      authorization_agreements: false
    },
    rental_analysis: {
      estimated_monthly_rent: 1300
    },
    analysis_options: {
      include_legal_risks: true
    }
  });

  const riskAnalysis = result.risk_assessment;
  assert(riskAnalysis, 'Should include risk analysis when requested');
  assert(Array.isArray(riskAnalysis.identified_risks), 'Should identify specific risks');
  assert(riskAnalysis.identified_risks.length > 0, 'Should identify multiple risks');
  assert(riskAnalysis.risk_score > 0, 'Should calculate risk score');
  assert(['Very High', 'High', 'Medium', 'Low'].includes(riskAnalysis.overall_risk_level), 
    'Should assign valid overall risk level');
  
  // Check for specific high-risk conditions
  const riskCategories = riskAnalysis.identified_risks.map(risk => risk.category);
  assert(riskCategories.includes('Legal Risk'), 'Should identify legal risk for conventional loan');
  assert(riskCategories.includes('Payment Risk'), 'Should identify payment risk for arrears');
  assert(riskCategories.includes('Market Risk'), 'Should identify market risk for high LTV');
  
  assert(typeof riskAnalysis.legal_compliance_score === 'number', 'Should calculate legal compliance score');
  assert(Array.isArray(riskAnalysis.risk_mitigation_strategies), 'Should provide mitigation strategies');
});

test('SubjectToDealCalculator - Exit Strategies', () => {
  const calc = new SubjectToDealCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 190000
    },
    existing_mortgage: {
      current_balance: 145000,
      monthly_payment: 1150,
      interest_rate: 6.25,
      remaining_term_months: 280
    },
    seller_situation: {
      reason_for_selling: 'job_relocation',
      seller_motivation_level: 'very_high'
    },
    deal_structure: {
      purchase_price: 175000,
      cash_to_seller: 6000,
      closing_costs: 2500,
      deed_transfer_method: 'warranty_deed'
    },
    rental_analysis: {
      estimated_monthly_rent: 1550
    },
    analysis_options: {
      calculate_exit_strategies: true
    }
  });

  const exitStrategies = result.exit_strategies;
  assert(exitStrategies, 'Should include exit strategies when requested');
  assert(Array.isArray(exitStrategies.available_strategies), 'Should provide multiple strategies');
  assert(exitStrategies.available_strategies.length >= 3, 'Should have at least 3 exit strategies');
  
  const strategyNames = exitStrategies.available_strategies.map(s => s.strategy);
  assert(strategyNames.includes('Hold and Rent'), 'Should include hold and rent strategy');
  assert(strategyNames.includes('Refinance'), 'Should include refinance strategy');
  assert(strategyNames.includes('Quick Sale'), 'Should include quick sale strategy');
  
  assert(exitStrategies.recommended_strategy, 'Should recommend best strategy');
  assert(exitStrategies.strategy_comparison, 'Should provide strategy comparison');
  assert(exitStrategies.strategy_comparison.highest_return, 'Should identify highest return strategy');
});

test('SubjectToDealCalculator - Insurance Analysis', () => {
  const calc = new SubjectToDealCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 170000
    },
    existing_mortgage: {
      current_balance: 135000,
      monthly_payment: 1075,
      interest_rate: 5.75,
      remaining_term_months: 270,
      insurance_monthly: 85
    },
    seller_situation: {
      reason_for_selling: 'health_issues',
      seller_motivation_level: 'high'
    },
    deal_structure: {
      purchase_price: 165000,
      cash_to_seller: 4500,
      deed_transfer_method: 'quitclaim_deed'
    },
    rental_analysis: {
      estimated_monthly_rent: 1400
    },
    analysis_options: {
      insurance_analysis: true
    }
  });

  const insuranceAnalysis = result.insurance_requirements;
  assert(insuranceAnalysis, 'Should include insurance analysis when requested');
  assert(Array.isArray(insuranceAnalysis.insurance_challenges), 'Should identify insurance challenges');
  assert(Array.isArray(insuranceAnalysis.recommended_solutions), 'Should provide solutions');
  assert(insuranceAnalysis.required_coverage, 'Should calculate required coverage');
  assert(insuranceAnalysis.required_coverage.total_annual_cost > 0, 'Should calculate total annual cost');
  assert(insuranceAnalysis.recommended_structure, 'Should recommend ownership structure');
});

test('SubjectToDealCalculator - Long-Term Projections', () => {
  const calc = new SubjectToDealCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 185000
    },
    existing_mortgage: {
      current_balance: 148000,
      monthly_payment: 1125,
      interest_rate: 6.0,
      remaining_term_months: 300
    },
    seller_situation: {
      reason_for_selling: 'inherited_property',
      seller_motivation_level: 'high'
    },
    deal_structure: {
      purchase_price: 170000,
      cash_to_seller: 5500,
      deed_transfer_method: 'warranty_deed'
    },
    rental_analysis: {
      estimated_monthly_rent: 1475
    },
    analysis_options: {
      long_term_projections: true
    }
  });

  const projections = result.long_term_projections;
  assert(projections, 'Should include projections when requested');
  assert(Array.isArray(projections.yearly_projections), 'Should provide yearly projections');
  assert(projections.yearly_projections.length === 5, 'Should have 5 years of projections');
  
  const year5 = projections.yearly_projections[4];
  assert(year5.year === 5, 'Should have year 5 data');
  assert(year5.projected_property_value > 185000, 'Should show property appreciation');
  assert(year5.remaining_mortgage_balance < 148000, 'Should show mortgage paydown');
  assert(year5.projected_equity > 0, 'Should show positive equity');
  
  assert(projections.five_year_summary, 'Should provide 5-year summary');
  assert(projections.five_year_summary.total_cash_flow !== undefined, 'Should calculate total cash flow');
  assert(projections.five_year_summary.average_annual_roi !== undefined, 'Should calculate average ROI');
});

test('SubjectToDealCalculator - Equity Analysis', () => {
  const calc = new SubjectToDealCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 195000
    },
    existing_mortgage: {
      current_balance: 155000,
      monthly_payment: 1200,
      interest_rate: 6.5,
      remaining_term_months: 240
    },
    seller_situation: {
      reason_for_selling: 'financial_hardship',
      seller_motivation_level: 'very_high'
    },
    deal_structure: {
      purchase_price: 180000,
      cash_to_seller: 7000,
      deed_transfer_method: 'warranty_deed'
    },
    rental_analysis: {
      estimated_monthly_rent: 1600
    }
  });

  const equity = result.equity_analysis;
  assert(equity.current_equity === 40000, 'Should calculate current equity (195k - 155k)');
  assert(equity.current_ltv > 0, 'Should calculate current LTV');
  assert(equity.monthly_principal_paydown > 0, 'Should calculate monthly principal paydown');
  assert(equity.annual_principal_paydown > 0, 'Should calculate annual principal paydown');
  assert(equity.annual_appreciation > 0, 'Should calculate annual appreciation');
  assert(equity.total_annual_equity_gain > 0, 'Should calculate total equity gain');
  assert(equity.five_year_projections, 'Should provide 5-year projections');
  assert(equity.equity_multiple > 1, 'Should show equity growth multiple');
});

test('SubjectToDealCalculator - Deal Types and Transfer Methods', () => {
  const calc = new SubjectToDealCalculator();
  
  // Test warranty deed transfer
  const warrantyResult = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 160000
    },
    existing_mortgage: {
      current_balance: 130000,
      monthly_payment: 1050,
      interest_rate: 6.0,
      remaining_term_months: 300
    },
    seller_situation: {
      reason_for_selling: 'job_relocation',
      seller_motivation_level: 'high'
    },
    deal_structure: {
      purchase_price: 155000,
      cash_to_seller: 3000,
      deed_transfer_method: 'warranty_deed',
      authorization_agreements: true
    },
    rental_analysis: {
      estimated_monthly_rent: 1350
    },
    analysis_options: {
      include_legal_risks: true
    }
  });

  const warrantyRisk = warrantyResult.risk_assessment;
  assert(warrantyRisk.legal_compliance_score > 70, 
    'Warranty deed with authorization should have higher compliance score');

  // Test quitclaim deed transfer
  const quitclaimResult = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 160000
    },
    existing_mortgage: {
      current_balance: 130000,
      monthly_payment: 1050,
      interest_rate: 6.0,
      remaining_term_months: 300
    },
    seller_situation: {
      reason_for_selling: 'financial_hardship',
      seller_motivation_level: 'extremely_high'
    },
    deal_structure: {
      purchase_price: 155000,
      cash_to_seller: 3000,
      deed_transfer_method: 'quitclaim_deed',
      authorization_agreements: false
    },
    rental_analysis: {
      estimated_monthly_rent: 1350
    },
    analysis_options: {
      include_legal_risks: true
    }
  });

  const quitclaimRisk = quitclaimResult.risk_assessment;
  assert(quitclaimRisk.legal_compliance_score < warrantyRisk.legal_compliance_score, 
    'Quitclaim deed without authorization should have lower compliance score');
});

test('SubjectToDealCalculator - Loan Type Risk Assessment', () => {
  const calc = new SubjectToDealCalculator();
  
  // Test conventional loan (highest risk)
  const conventionalResult = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 170000
    },
    existing_mortgage: {
      current_balance: 140000,
      monthly_payment: 1100,
      interest_rate: 6.5,
      remaining_term_months: 280,
      loan_type: 'conventional'
    },
    seller_situation: {
      reason_for_selling: 'divorce',
      seller_motivation_level: 'high'
    },
    deal_structure: {
      purchase_price: 165000,
      cash_to_seller: 4000,
      deed_transfer_method: 'warranty_deed'
    },
    rental_analysis: {
      estimated_monthly_rent: 1400
    },
    analysis_options: {
      include_legal_risks: true
    }
  });

  // Test FHA loan (lower risk)
  const fhaResult = calc.calculate({
    property_details: {
      property_type: 'single_family',
      current_market_value: 170000
    },
    existing_mortgage: {
      current_balance: 140000,
      monthly_payment: 1100,
      interest_rate: 6.5,
      remaining_term_months: 280,
      loan_type: 'fha'
    },
    seller_situation: {
      reason_for_selling: 'divorce',
      seller_motivation_level: 'high'
    },
    deal_structure: {
      purchase_price: 165000,
      cash_to_seller: 4000,
      deed_transfer_method: 'warranty_deed'
    },
    rental_analysis: {
      estimated_monthly_rent: 1400
    },
    analysis_options: {
      include_legal_risks: true
    }
  });

  const conventionalRisk = conventionalResult.risk_assessment;
  const fhaRisk = fhaResult.risk_assessment;
  
  assert(conventionalRisk.risk_score > fhaRisk.risk_score, 
    'Conventional loan should have higher risk score than FHA');
  
  const conventionalLegalRisks = conventionalRisk.identified_risks.filter(r => r.category === 'Legal Risk');
  const fhaLegalRisks = fhaRisk.identified_risks.filter(r => r.category === 'Legal Risk');
  
  assert(conventionalLegalRisks.some(r => r.level === 'High'), 
    'Conventional loan should have high legal risk');
  assert(fhaLegalRisks.some(r => r.level === 'Medium'), 
    'FHA loan should have medium legal risk');
});

test('SubjectToDealCalculator - Schema Validation', () => {
  const calc = new SubjectToDealCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.property_details, 'Should have property_details property');
  assert(schema.properties.existing_mortgage, 'Should have existing_mortgage property');
  assert(schema.properties.seller_situation, 'Should have seller_situation property');
  assert(schema.properties.deal_structure, 'Should have deal_structure property');
  assert(schema.properties.rental_analysis, 'Should have rental_analysis property');
  assert(schema.properties.analysis_options, 'Should have analysis_options property');
  
  assert(schema.required.includes('property_details'), 'property_details should be required');
  assert(schema.required.includes('existing_mortgage'), 'existing_mortgage should be required');
  assert(schema.required.includes('seller_situation'), 'seller_situation should be required');
  assert(schema.required.includes('deal_structure'), 'deal_structure should be required');
  assert(schema.required.includes('rental_analysis'), 'rental_analysis should be required');
  
  // Test nested schema structure
  const existingMortgage = schema.properties.existing_mortgage;
  assert(existingMortgage.properties.current_balance, 'Should define current_balance');
  assert(existingMortgage.properties.monthly_payment, 'Should define monthly_payment');
  assert(existingMortgage.properties.loan_type, 'Should define loan_type');
  assert(existingMortgage.required.includes('current_balance'), 'current_balance should be required');
  assert(existingMortgage.required.includes('monthly_payment'), 'monthly_payment should be required');
});