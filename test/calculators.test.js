import { test } from 'node:test';
import assert from 'node:assert';
import { AffordabilityCalculator } from '../src/calculators/affordability.js';
import { BRRRRCalculator } from '../src/calculators/brrrr.js';
import { MortgageAffordabilityCalculator } from '../src/calculators/mortgage-affordability.js';
import { DebtToIncomeCalculator } from '../src/calculators/debt-to-income.js';

test('AffordabilityCalculator basic calculation', () => {
  const calc = new AffordabilityCalculator();
  const result = calc.calculate({
    annual_income: 75000,
    monthly_debts: 500,
    down_payment: 20000,
    interest_rate: 7.5
  });

  assert(result.max_home_price > 0, 'Should calculate a positive home price');
  assert(result.max_loan_amount > 0, 'Should calculate a positive loan amount');
  assert(result.monthly_payment_breakdown.total > 0, 'Should calculate monthly payment');
  assert(typeof result.debt_to_income.front_end_ratio === 'string', 'Should calculate DTI ratio');
});

test('BRRRRCalculator basic analysis', () => {
  const calc = new BRRRRCalculator();
  const result = calc.analyze({
    purchase_price: 150000,
    rehab_cost: 35000,
    after_repair_value: 220000,
    monthly_rent: 1800
  });

  assert(result.initial_investment.total_cash_needed > 0, 'Should calculate cash needed');
  assert(result.refinance_results.cash_out_amount !== undefined, 'Should calculate cash out');
  assert(result.cash_flow_analysis.net_monthly_cash_flow !== undefined, 'Should calculate cash flow');
  assert(result.overall_rating.rating, 'Should provide a rating');
});

test('Schema validation', () => {
  const affordCalc = new AffordabilityCalculator();
  const schema = affordCalc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.annual_income, 'Should have annual_income property');
  assert(schema.required.includes('annual_income'), 'annual_income should be required');
});

// ========== NEW CALCULATOR TESTS ==========

test('MortgageAffordabilityCalculator - Basic Calculation', () => {
  const calc = new MortgageAffordabilityCalculator();
  const result = calc.calculate({
    annual_income: 80000,
    down_payment: 25000,
    interest_rate: 6.85,
    car_payment: 400,
    student_loans: 300,
    credit_cards: 150
  });

  // Test structure
  assert(result.income_analysis, 'Should have income analysis');
  assert(result.debt_analysis, 'Should have debt analysis');
  assert(result.affordability_results, 'Should have affordability results');
  assert(result.monthly_payment_breakdown, 'Should have payment breakdown');
  assert(result.debt_to_income_ratios, 'Should have DTI ratios');
  assert(result.alternative_scenarios, 'Should have alternative scenarios');

  // Test calculations
  assert(result.income_analysis.monthly_income === 6667, 'Should calculate monthly income correctly');
  assert(result.debt_analysis.total_monthly_debts === 850, 'Should sum debts correctly');
  assert(result.affordability_results.max_home_price > 0, 'Should calculate positive home price');
  assert(result.monthly_payment_breakdown.total_monthly_payment > 0, 'Should calculate total payment');

  // Test DTI calculations
  const frontEnd = parseFloat(result.debt_to_income_ratios.front_end_ratio);
  const backEnd = parseFloat(result.debt_to_income_ratios.back_end_ratio);
  assert(frontEnd > 0 && frontEnd <= 50, 'Front-end ratio should be reasonable');
  assert(backEnd > frontEnd, 'Back-end ratio should be higher than front-end');
});

test('MortgageAffordabilityCalculator - High Debt Scenario', () => {
  const calc = new MortgageAffordabilityCalculator();
  const result = calc.calculate({
    annual_income: 50000, // Lower income
    down_payment: 10000,
    interest_rate: 7.25,
    car_payment: 800,
    student_loans: 600,
    credit_cards: 400,
    other_debts: 200
  });

  // With high debt, max affordability should be significantly reduced
  assert(result.affordability_results.max_home_price < 250000, 'High debt should limit home price');
  assert(result.debt_analysis.total_monthly_debts === 2000, 'Should sum debts correctly');
  
  // The calculator should produce reasonable DTI within limits, but with warnings
  const backEndRatio = parseFloat(result.debt_to_income_ratios.back_end_ratio);
  assert(backEndRatio > 30, 'Should have significant debt burden');
  assert(result.recommendations.length > 0, 'Should provide recommendations for high debt');
});

test('MortgageAffordabilityCalculator - Dual Income Scenario', () => {
  const calc = new MortgageAffordabilityCalculator();
  const result = calc.calculate({
    annual_income: 85000,
    co_borrower_income: 65000,
    other_monthly_income: 500,
    down_payment: 50000,
    interest_rate: 6.45,
    car_payment: 450,
    student_loans: 200
  });

  const expectedTotalIncome = 85000 + 65000 + (500 * 12); // 156,000
  assert(result.income_analysis.total_annual_income === expectedTotalIncome, 'Should calculate dual income correctly');
  assert(result.affordability_results.max_home_price > 400000, 'High income should afford expensive home');
  
  // Check that we have reasonable DTI ratios (may be Caution due to high home price)
  const frontEndStatus = result.debt_to_income_ratios.front_end_status;
  const backEndStatus = result.debt_to_income_ratios.back_end_status;
  assert(frontEndStatus !== 'Poor', 'Front-end ratio should not be poor with good income');
  assert(backEndStatus === 'Good' || backEndStatus === 'Excellent', 'Back-end ratio should be good with low debt');
});

test('MortgageAffordabilityCalculator - PMI Calculation', () => {
  const calc = new MortgageAffordabilityCalculator();
  const result = calc.calculate({
    annual_income: 75000,
    down_payment: 15000,
    down_payment_percent: 5, // Less than 20%
    interest_rate: 6.85
  });

  assert(result.monthly_payment_breakdown.pmi > 0, 'Should calculate PMI for <20% down');
  assert(result.loan_details.pmi_required === true, 'Should flag PMI as required');

  // Test with 20% down
  const result20 = calc.calculate({
    annual_income: 75000,
    down_payment: 60000,
    down_payment_percent: 20,
    interest_rate: 6.85
  });

  assert(result20.monthly_payment_breakdown.pmi === 0, 'Should not calculate PMI for 20%+ down');
  assert(result20.loan_details.pmi_required === false, 'Should not require PMI for 20%+ down');
});

test('MortgageAffordabilityCalculator - Schema Validation', () => {
  const calc = new MortgageAffordabilityCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.annual_income, 'Should have annual_income property');
  assert(schema.properties.co_borrower_income, 'Should have co_borrower_income property');
  assert(schema.properties.down_payment_percent, 'Should have down_payment_percent property');
  assert(schema.required.includes('annual_income'), 'annual_income should be required');
  assert(schema.required.includes('down_payment'), 'down_payment should be required');
  assert(schema.required.includes('interest_rate'), 'interest_rate should be required');
});

test('DebtToIncomeCalculator - Basic Calculation', () => {
  const calc = new DebtToIncomeCalculator();
  const result = calc.calculate({
    monthly_income: 6500,
    proposed_housing_payment: 1800,
    car_payments: 400,
    credit_card_minimums: 150,
    student_loans: 300
  });

  // Test structure
  assert(result.income_analysis, 'Should have income analysis');
  assert(result.proposed_payment, 'Should have proposed payment info');
  assert(result.dti_ratios, 'Should have DTI ratios');
  assert(result.qualification, 'Should have qualification status');
  assert(result.maximum_affordable, 'Should have maximum affordable payment');
  assert(result.debt_breakdown, 'Should have debt breakdown');
  assert(result.recommendations, 'Should have recommendations');

  // Test calculations
  assert(result.income_analysis.monthly_income === 6500, 'Should store monthly income');
  assert(result.proposed_payment.total_monthly_debts === 850, 'Should sum debts correctly');
  
  const frontEndRatio = parseFloat(result.dti_ratios.front_end.ratio);
  const backEndRatio = parseFloat(result.dti_ratios.back_end.ratio);
  
  assert(frontEndRatio === 27.7, 'Should calculate front-end ratio correctly'); // 1800/6500 * 100
  assert(backEndRatio === 40.8, 'Should calculate back-end ratio correctly'); // (1800+850)/6500 * 100
});

test('DebtToIncomeCalculator - Different Loan Types', () => {
  const calc = new DebtToIncomeCalculator();
  
  // Test Conventional loan limits
  const conventional = calc.calculate({
    monthly_income: 5000,
    proposed_housing_payment: 1500,
    car_payments: 300,
    loan_type: 'conventional'
  });
  
  assert(conventional.dti_ratios.front_end.limit === '28%', 'Conventional should have 28% front-end limit');
  assert(conventional.dti_ratios.back_end.limit === '36%', 'Conventional should have 36% back-end limit');

  // Test FHA loan limits
  const fha = calc.calculate({
    monthly_income: 5000,
    proposed_housing_payment: 1500,
    car_payments: 300,
    loan_type: 'fha'
  });
  
  assert(fha.dti_ratios.front_end.limit === '31%', 'FHA should have 31% front-end limit');
  assert(fha.dti_ratios.back_end.limit === '43%', 'FHA should have 43% back-end limit');

  // Test VA loan limits
  const va = calc.calculate({
    monthly_income: 5000,
    proposed_housing_payment: 1500,
    car_payments: 300,
    loan_type: 'va'
  });
  
  assert(va.dti_ratios.front_end.limit === '41%', 'VA should have 41% front-end limit');
  assert(va.dti_ratios.back_end.limit === '41%', 'VA should have 41% back-end limit');
});

test('DebtToIncomeCalculator - Qualification Status', () => {
  const calc = new DebtToIncomeCalculator();
  
  // Test excellent candidate
  const excellent = calc.calculate({
    monthly_income: 8000,
    proposed_housing_payment: 1600, // 20% front-end
    car_payments: 200,
    credit_card_minimums: 100 // Total 23.75% back-end
  });
  
  assert(excellent.qualification.overall_status === 'Excellent Candidate', 'Should be excellent candidate');
  assert(excellent.qualification.front_end_passes === true, 'Should pass front-end');
  assert(excellent.qualification.back_end_passes === true, 'Should pass back-end');

  // Test poor candidate
  const poor = calc.calculate({
    monthly_income: 4000,
    proposed_housing_payment: 1400, // 35% front-end
    car_payments: 800,
    credit_card_minimums: 300,
    student_loans: 400 // Total 72.5% back-end
  });
  
  assert(poor.qualification.overall_status === 'Likely Declined', 'Should be likely declined');
  assert(poor.qualification.front_end_passes === false, 'Should fail front-end');
  assert(poor.qualification.back_end_passes === false, 'Should fail back-end');
});

test('DebtToIncomeCalculator - Debt Breakdown', () => {
  const calc = new DebtToIncomeCalculator();
  const result = calc.calculate({
    monthly_income: 6000,
    proposed_housing_payment: 1500,
    car_payments: 500,
    credit_card_minimums: 200,
    student_loans: 300
  });

  assert(result.debt_breakdown.length === 3, 'Should have 3 debt types');
  assert(result.debt_breakdown[0].amount === 500, 'Should sort debts by amount (highest first)');
  assert(result.debt_breakdown[0].type === 'Car Payments', 'Should format debt type names');
  
  // Check percentages add up to 100%
  const totalPercentage = result.debt_breakdown.reduce((sum, debt) => {
    return sum + parseFloat(debt.percentage);
  }, 0);
  assert(Math.abs(totalPercentage - 100) < 0.1, 'Debt percentages should add up to ~100%');
});

test('DebtToIncomeCalculator - Improvement Strategies', () => {
  const calc = new DebtToIncomeCalculator();
  const result = calc.calculate({
    monthly_income: 4500,
    proposed_housing_payment: 1600, // High DTI
    car_payments: 600,
    credit_card_minimums: 400,
    student_loans: 300
  });

  assert(result.improvement_strategies.length > 0, 'Should provide improvement strategies');
  
  const strategies = result.improvement_strategies.map(s => s.strategy);
  assert(strategies.includes('Increase Income'), 'Should suggest increasing income');
  assert(strategies.includes('Pay Down High-Interest Debt'), 'Should suggest paying down debt');
  assert(strategies.some(s => s.includes('Loan Type')), 'Should suggest different loan types');
});

test('DebtToIncomeCalculator - Schema Validation', () => {
  const calc = new DebtToIncomeCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.monthly_income, 'Should have monthly_income property');
  assert(schema.properties.proposed_housing_payment, 'Should have proposed_housing_payment property');
  assert(schema.properties.loan_type, 'Should have loan_type property');
  assert(schema.properties.loan_type.enum.includes('fha'), 'Should include FHA in loan types');
  assert(schema.required.includes('monthly_income'), 'monthly_income should be required');
  assert(schema.required.includes('proposed_housing_payment'), 'proposed_housing_payment should be required');
});