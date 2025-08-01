import { test } from 'node:test';
import assert from 'node:assert';
import { AffordabilityCalculator } from '../src/calculators/affordability.js';
import { BRRRRCalculator } from '../src/calculators/brrrr.js';

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