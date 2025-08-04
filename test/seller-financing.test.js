import { test } from 'node:test';
import assert from 'node:assert';
import { SellerFinancingCalculator } from '../src/calculators/seller-financing.js';

test('SellerFinancingCalculator - Basic Fully Amortizing Loan', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 300000,
      property_type: 'single_family',
      monthly_rent: 2500,
      operating_expenses: 800
    },
    seller_financing_terms: {
      down_payment: 60000,
      seller_note_amount: 240000,
      interest_rate: 7.0,
      loan_term_years: 30,
      payment_type: 'fully_amortizing'
    }
  });

  // Test structure
  assert(result.deal_summary, 'Should have deal summary');
  assert(result.financing_metrics, 'Should have financing metrics');
  assert(result.seller_benefits, 'Should have seller benefits');
  assert(result.buyer_benefits, 'Should have buyer benefits');
  assert(result.cash_flow_analysis, 'Should have cash flow analysis');

  // Test deal summary
  const summary = result.deal_summary;
  assert(summary.property_value === 300000, 'Should preserve property value');
  assert(summary.down_payment === 60000, 'Should preserve down payment');
  assert(summary.seller_note_amount === 240000, 'Should preserve note amount');
  assert(summary.ltv_ratio === 80, 'Should calculate 80% LTV (240k/300k)');
  assert(summary.down_payment_percentage === 20, 'Should calculate 20% down (60k/300k)');

  // Test financing metrics
  const metrics = result.financing_metrics;
  assert(metrics.monthly_payment > 0, 'Should calculate monthly payment');
  assert(metrics.total_interest > 0, 'Should calculate total interest');
  assert(metrics.effective_annual_yield > 0, 'Should calculate effective yield');
  assert(Array.isArray(metrics.payment_schedule), 'Should provide payment schedule');
  assert(metrics.payment_schedule.length > 0, 'Should have payment schedule entries');

  // Test cash flow analysis
  const cashFlow = result.cash_flow_analysis;
  assert(cashFlow.gross_monthly_income === 2500, 'Should preserve gross income');
  assert(cashFlow.operating_expenses === 800, 'Should preserve operating expenses');
  assert(cashFlow.net_operating_income === 1700, 'Should calculate NOI (2500-800)');
  assert(cashFlow.monthly_cash_flow !== undefined, 'Should calculate monthly cash flow');
  assert(cashFlow.cash_on_cash_return !== undefined, 'Should calculate cash-on-cash return');
});

test('SellerFinancingCalculator - Interest-Only Loan with Balloon', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 200000,
      property_type: 'single_family'
    },
    seller_financing_terms: {
      down_payment: 40000,
      seller_note_amount: 160000,
      interest_rate: 8.5,
      loan_term_years: 10,
      payment_type: 'interest_only'
    }
  });

  const metrics = result.financing_metrics;
  
  // Interest-only payment = 160,000 * 8.5% / 12 = $1,133.33
  assert(Math.abs(metrics.monthly_payment - 1133) < 10, 'Should calculate correct interest-only payment');
  assert(metrics.balloon_payment === 160000, 'Should have balloon payment equal to principal');
  assert(metrics.total_interest > 100000, 'Should calculate total interest for 10 years');
  
  // Total payments = monthly payments + balloon
  const expected_total = (metrics.monthly_payment * 120) + 160000;
  assert(Math.abs(metrics.total_payments_to_seller - expected_total) < 100, 
    'Should calculate correct total payments to seller');
});

test('SellerFinancingCalculator - Balloon Payment Loan', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 250000,
      property_type: 'multi_family'
    },
    seller_financing_terms: {
      down_payment: 50000,
      seller_note_amount: 200000,
      interest_rate: 7.5,
      loan_term_years: 5,
      payment_type: 'balloon',
      balloon_period_years: 5,
      amortization_schedule: 30
    }
  });

  const metrics = result.financing_metrics;
  
  // Should have amortized payment but balloon at 5 years
  assert(metrics.monthly_payment > 1000, 'Should calculate amortized payment');
  assert(metrics.balloon_payment > 150000, 'Should have substantial balloon payment');
  assert(metrics.balloon_payment < 200000, 'Balloon should be less than original principal');
});

test('SellerFinancingCalculator - Seller Benefits Analysis', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 350000,
      property_type: 'single_family'
    },
    seller_financing_terms: {
      down_payment: 70000,
      seller_note_amount: 280000,
      interest_rate: 8.0,
      loan_term_years: 15,
      payment_type: 'fully_amortizing'
    },
    seller_profile: {
      seller_age: 65,
      motivation_level: 'high',
      tax_situation: 'spread_income',
      cash_needs: 'steady_income',
      risk_tolerance: 'moderate'
    },
    market_conditions: {
      current_market_rates: 7.0,
      market_liquidity: 'low'
    }
  });

  const benefits = result.seller_benefits;
  assert(Array.isArray(benefits.benefits), 'Should have benefits array');
  assert(benefits.benefits.length > 0, 'Should identify multiple benefits');
  assert(benefits.total_annual_benefit > 0, 'Should calculate total annual benefit');
  assert(benefits.benefit_score > 0, 'Should calculate benefit score');
  assert(['Excellent', 'Very Good', 'Good', 'Fair'].includes(benefits.rating), 
    'Should provide valid rating');

  // Should identify higher interest rate benefit (8% vs 7% market)
  const rateAdvantage = benefits.benefits.find(b => b.benefit === 'Higher Interest Rate');
  assert(rateAdvantage, 'Should identify interest rate advantage');
  assert(rateAdvantage.annual_value > 0, 'Should quantify rate advantage value');
});

test('SellerFinancingCalculator - Buyer Benefits Analysis', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 275000,
      property_type: 'single_family',
      monthly_rent: 2200
    },
    seller_financing_terms: {
      down_payment: 27500, // 10% down
      seller_note_amount: 247500,
      interest_rate: 6.5,
      loan_term_years: 30,
      payment_type: 'fully_amortizing'
    },
    buyer_profile: {
      credit_score: 620,
      down_payment_available: 30000,
      monthly_income: 8000,
      current_debts: 1200,
      investment_experience: 'beginner'
    },
    market_conditions: {
      current_market_rates: 7.5
    }
  });

  const benefits = result.buyer_benefits;
  assert(Array.isArray(benefits.benefits), 'Should have benefits array');
  assert(benefits.total_annual_benefit >= 0, 'Should calculate total benefit');
  assert(benefits.benefit_score > 0, 'Should calculate benefit score');

  // Should identify below-market rate benefit (6.5% vs 7.5%)
  const rateBenefit = benefits.benefits.find(b => b.benefit === 'Below Market Interest Rate');
  assert(rateBenefit, 'Should identify below-market rate benefit');

  // Should identify easier qualification for 620 credit score
  const qualificationBenefit = benefits.benefits.find(b => b.benefit === 'Easier Qualification');
  assert(qualificationBenefit, 'Should identify easier qualification benefit');

  // Should identify lower down payment benefit (10% vs typical 20%)
  const downPaymentBenefit = benefits.benefits.find(b => b.benefit === 'Lower Down Payment');
  assert(downPaymentBenefit, 'Should identify lower down payment benefit');
});

test('SellerFinancingCalculator - Risk Assessment', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 180000,
      property_type: 'single_family'
    },
    seller_financing_terms: {
      down_payment: 18000, // 10% down
      seller_note_amount: 162000, // 90% LTV
      interest_rate: 9.0,
      loan_term_years: 5,
      payment_type: 'balloon',
      balloon_period_years: 5,
      amortization_schedule: 30
    },
    seller_profile: {
      risk_tolerance: 'conservative'
    },
    buyer_profile: {
      credit_score: 580, // Poor credit
      investment_experience: 'beginner'
    },
    analysis_options: {
      risk_assessment: true
    }
  });

  const risks = result.risk_assessment;
  assert(risks, 'Should include risk assessment when requested');
  assert(Array.isArray(risks.identified_risks), 'Should identify specific risks');
  assert(risks.identified_risks.length > 0, 'Should identify multiple risks');
  assert(risks.risk_score > 0, 'Should calculate risk score');
  assert(['High', 'Medium', 'Low'].includes(risks.overall_risk_level), 
    'Should assign valid risk level');

  // Should identify credit risk for 580 score
  const creditRisk = risks.identified_risks.find(r => r.category === 'Credit Risk');
  assert(creditRisk, 'Should identify credit risk for low score');
  assert(creditRisk.level === 'High', 'Should mark credit risk as high for 580 score');

  // Should identify balloon payment risk
  const balloonRisk = risks.identified_risks.find(r => r.category === 'Payment Risk');
  assert(balloonRisk, 'Should identify balloon payment risk');

  // Should identify high LTV risk (90%)
  const ltvRisk = risks.identified_risks.find(r => r.category === 'Market Risk');
  assert(ltvRisk, 'Should identify high LTV risk');

  assert(Array.isArray(risks.risk_mitigation_strategies), 'Should provide mitigation strategies');
  assert(risks.risk_mitigation_strategies.length > 0, 'Should have mitigation strategies');
});

test('SellerFinancingCalculator - Scenario Comparison', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 225000,
      property_type: 'single_family'
    },
    seller_financing_terms: {
      down_payment: 45000,
      seller_note_amount: 180000,
      interest_rate: 7.5,
      loan_term_years: 20,
      payment_type: 'fully_amortizing'
    },
    analysis_options: {
      compare_scenarios: true
    }
  });

  const comparison = result.scenario_comparison;
  assert(comparison, 'Should include scenario comparison when requested');
  assert(Array.isArray(comparison.scenarios), 'Should provide multiple scenarios');
  assert(comparison.scenarios.length >= 3, 'Should have at least 3 scenarios');

  const scenarios = comparison.scenarios;
  assert(scenarios.find(s => s.scenario === 'Base Terms'), 'Should include base scenario');
  assert(scenarios.find(s => s.scenario.includes('Higher Rate')), 'Should include higher rate scenario');
  assert(scenarios.find(s => s.scenario.includes('Shorter Term')), 'Should include shorter term scenario');

  assert(comparison.best_for_cash_flow, 'Should identify best scenario for cash flow');
  assert(comparison.best_for_total_return, 'Should identify best scenario for total return');
});

test('SellerFinancingCalculator - Tax Analysis', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 400000,
      property_type: 'multi_family'
    },
    seller_financing_terms: {
      down_payment: 80000,
      seller_note_amount: 320000,
      interest_rate: 8.0,
      loan_term_years: 15,
      payment_type: 'fully_amortizing'
    },
    seller_profile: {
      tax_situation: 'spread_income'
    },
    analysis_options: {
      tax_analysis: true
    }
  });

  const tax = result.tax_analysis;
  assert(tax, 'Should include tax analysis when requested');
  assert(tax.capital_gain_total > 0, 'Should estimate capital gain');
  assert(tax.annual_gain_recognition > 0, 'Should calculate annual gain recognition');
  assert(tax.annual_interest_income > 0, 'Should calculate annual interest income');
  
  assert(tax.estimated_annual_taxes, 'Should estimate annual taxes');
  assert(tax.estimated_annual_taxes.capital_gains_tax >= 0, 'Should estimate capital gains tax');
  assert(tax.estimated_annual_taxes.interest_income_tax > 0, 'Should estimate interest income tax');
  assert(tax.estimated_annual_taxes.total_annual_tax > 0, 'Should calculate total annual tax');

  assert(Array.isArray(tax.tax_advantages), 'Should list tax advantages');
  assert(tax.tax_advantages.length > 0, 'Should have tax advantages');
  assert(Array.isArray(tax.recommendations), 'Should provide tax recommendations');
});

test('SellerFinancingCalculator - Exit Strategies', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 320000,
      property_type: 'single_family'
    },
    seller_financing_terms: {
      down_payment: 64000,
      seller_note_amount: 256000,
      interest_rate: 7.75,
      loan_term_years: 25,
      payment_type: 'fully_amortizing'
    },
    analysis_options: {
      exit_strategies: true
    }
  });

  const exits = result.exit_strategies;
  assert(exits, 'Should include exit strategies when requested');
  assert(Array.isArray(exits.available_strategies), 'Should provide multiple strategies');
  assert(exits.available_strategies.length >= 4, 'Should have at least 4 exit strategies');

  const strategies = exits.available_strategies.map(s => s.strategy);
  assert(strategies.includes('Hold to Maturity'), 'Should include hold to maturity');
  assert(strategies.includes('Early Payoff Incentive'), 'Should include early payoff');
  assert(strategies.includes('Sell Note to Investor'), 'Should include note sale');
  assert(strategies.includes('Partial Note Sale'), 'Should include partial sale');

  assert(exits.recommended_strategy, 'Should recommend a strategy');
  assert(Array.isArray(exits.liquidity_options), 'Should provide liquidity options');
});

test('SellerFinancingCalculator - Cash Flow Analysis', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 280000,
      property_type: 'single_family',
      monthly_rent: 2300,
      operating_expenses: 650
    },
    seller_financing_terms: {
      down_payment: 56000,
      seller_note_amount: 224000,
      interest_rate: 7.25,
      loan_term_years: 30,
      payment_type: 'fully_amortizing'
    }
  });

  const cashFlow = result.cash_flow_analysis;
  assert(cashFlow.gross_monthly_income === 2300, 'Should preserve gross income');
  assert(cashFlow.operating_expenses === 650, 'Should preserve operating expenses');
  assert(cashFlow.net_operating_income === 1650, 'Should calculate NOI (2300-650)');
  assert(cashFlow.monthly_payment > 0, 'Should have monthly payment');
  assert(cashFlow.monthly_cash_flow !== undefined, 'Should calculate monthly cash flow');
  assert(cashFlow.annual_cash_flow !== undefined, 'Should calculate annual cash flow');
  assert(cashFlow.cash_on_cash_return !== undefined, 'Should calculate CoC return');
  assert(cashFlow.debt_service_coverage_ratio > 0, 'Should calculate DSCR');
  assert(['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].includes(cashFlow.cash_flow_rating), 
    'Should provide valid cash flow rating');
});

test('SellerFinancingCalculator - Partial Amortization Loan', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 195000,
      property_type: 'single_family'
    },
    seller_financing_terms: {
      down_payment: 39000,
      seller_note_amount: 156000,
      interest_rate: 8.25,
      loan_term_years: 10,
      payment_type: 'partial_amortization',
      amortization_schedule: 25
    }
  });

  const metrics = result.financing_metrics;
  
  // Should have payment based on 25-year amortization
  assert(metrics.monthly_payment > 1000, 'Should calculate amortized payment');
  assert(metrics.monthly_payment < 1500, 'Payment should be reasonable for 25-year amortization');
  
  // Should have balloon payment after 10 years
  assert(metrics.balloon_payment > 100000, 'Should have substantial balloon payment');
  assert(metrics.balloon_payment < 156000, 'Balloon should be less than original principal');
  
  assert(metrics.total_interest > 0, 'Should calculate total interest');
  assert(metrics.effective_annual_yield > 0, 'Should have positive effective yield');
});

test('SellerFinancingCalculator - Recommendations Generation', () => {
  const calc = new SellerFinancingCalculator();
  const result = calc.calculate({
    property_details: {
      property_value: 235000,
      property_type: 'single_family'
    },
    seller_financing_terms: {
      down_payment: 47000,
      seller_note_amount: 188000,
      interest_rate: 7.0,
      loan_term_years: 15,
      payment_type: 'fully_amortizing'
    },
    seller_profile: {
      motivation_level: 'high',
      tax_situation: 'spread_income'
    },
    buyer_profile: {
      credit_score: 680,
      investment_experience: 'intermediate'
    },
    market_conditions: {
      current_market_rates: 7.5
    }
  });

  const recommendations = result.recommendations;
  assert(recommendations, 'Should provide recommendations');
  assert(Array.isArray(recommendations.recommendations), 'Should have recommendations array');
  assert(recommendations.recommendations.length > 0, 'Should have multiple recommendations');
  assert(recommendations.overall_assessment, 'Should provide overall assessment');
  assert(['Highly Recommended', 'Recommended with Modifications', 'Not Recommended']
    .includes(recommendations.overall_assessment), 'Should provide valid assessment');

  const categories = recommendations.recommendations.map(r => r.category);
  assert(categories.includes('Deal Structure'), 'Should include deal structure recommendation');
  assert(categories.includes('Legal'), 'Should include legal recommendation');

  assert(Array.isArray(recommendations.key_success_factors), 'Should provide success factors');
  assert(recommendations.key_success_factors.length > 0, 'Should have success factors');
});

test('SellerFinancingCalculator - Schema Validation', () => {
  const calc = new SellerFinancingCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.property_details, 'Should have property_details property');
  assert(schema.properties.seller_financing_terms, 'Should have seller_financing_terms property');
  assert(schema.properties.seller_profile, 'Should have seller_profile property');
  assert(schema.properties.buyer_profile, 'Should have buyer_profile property');
  assert(schema.properties.market_conditions, 'Should have market_conditions property');
  assert(schema.properties.analysis_options, 'Should have analysis_options property');
  
  assert(schema.required.includes('property_details'), 'property_details should be required');
  assert(schema.required.includes('seller_financing_terms'), 'seller_financing_terms should be required');
  
  // Test nested schema structure
  const sellerTerms = schema.properties.seller_financing_terms;
  assert(sellerTerms.properties.down_payment, 'Should define down_payment');
  assert(sellerTerms.properties.seller_note_amount, 'Should define seller_note_amount');  
  assert(sellerTerms.properties.interest_rate, 'Should define interest_rate');
  assert(sellerTerms.properties.payment_type, 'Should define payment_type');
  assert(sellerTerms.required.includes('down_payment'), 'down_payment should be required');
  assert(sellerTerms.required.includes('seller_note_amount'), 'seller_note_amount should be required');
});