import { test } from 'node:test';
import assert from 'node:assert';
import { SensitivityAnalysisCalculator } from '../src/calculators/sensitivity-analysis.js';
import { MonteCarloSimulator } from '../src/calculators/monte-carlo.js';
import { TaxBenefitsCalculator } from '../src/calculators/tax-benefits.js';
import { PropertyComparisonTool } from '../src/calculators/property-comparison.js';

// ========== SENSITIVITY ANALYSIS TESTS ==========

test('SensitivityAnalysisCalculator - Basic Analysis', () => {
  const calc = new SensitivityAnalysisCalculator();
  const result = calc.calculate({
    base_scenario: {
      purchase_price: 300000,
      annual_rental_income: 36000,
      annual_expenses: 12000,
      down_payment_percent: 20,
      interest_rate: 7,
      vacancy_rate: 5
    },
    sensitivity_variables: [
      { variable: 'purchase_price', variations: [-10, 0, 10] },
      { variable: 'rental_income', variations: [-10, 0, 10] }
    ],
    analysis_metrics: ['irr', 'cash_on_cash']
  });

  // Test structure
  assert(result.base_case, 'Should have base case analysis');
  assert(result.sensitivity_analysis, 'Should have sensitivity analysis');
  assert(result.tornado_diagram, 'Should have tornado diagram');
  assert(result.critical_values, 'Should have critical values');
  assert(result.risk_assessment, 'Should have risk assessment');
  assert(result.recommendations, 'Should have recommendations');

  // Test sensitivity results
  assert(result.sensitivity_analysis.length === 2, 'Should analyze 2 variables');
  const purchasePriceSensitivity = result.sensitivity_analysis.find(s => s.variable === 'Purchase Price');
  assert(purchasePriceSensitivity.scenarios.length === 3, 'Should have 3 scenarios');
  
  // Test tornado diagram
  assert(result.tornado_diagram.variables.length > 0, 'Should have tornado diagram data');
});

test('SensitivityAnalysisCalculator - Two-Way Analysis', () => {
  const calc = new SensitivityAnalysisCalculator();
  const result = calc.calculate({
    base_scenario: {
      purchase_price: 250000,
      annual_rental_income: 30000,
      annual_expenses: 10000
    },
    sensitivity_variables: [
      { variable: 'rental_income' },
      { variable: 'interest_rate' }
    ]
  });

  assert(result.two_way_analysis, 'Should have two-way analysis');
  assert(result.two_way_analysis.data.length > 0, 'Should have two-way data');
});

test('SensitivityAnalysisCalculator - Schema Validation', () => {
  const calc = new SensitivityAnalysisCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.base_scenario, 'Should have base_scenario');
  assert(schema.properties.sensitivity_variables, 'Should have sensitivity_variables');
  assert(schema.required.includes('base_scenario'), 'base_scenario should be required');
});

// ========== MONTE CARLO SIMULATOR TESTS ==========

test('MonteCarloSimulator - Basic Simulation', () => {
  const calc = new MonteCarloSimulator();
  const result = calc.calculate({
    investment_parameters: {
      purchase_price: 300000,
      down_payment_percent: 20,
      holding_period_years: 5
    },
    variable_distributions: {
      rental_income: {
        type: 'normal',
        mean: 2500,
        std_dev: 200
      },
      operating_expenses: {
        type: 'normal',
        mean: 15000,
        std_dev: 2000
      }
    },
    simulation_settings: {
      num_simulations: 1000,
      random_seed: 12345
    }
  });

  // Test structure
  assert(result.summary_statistics, 'Should have summary statistics');
  assert(result.distributions, 'Should have distributions');
  assert(result.risk_metrics, 'Should have risk metrics');
  assert(result.probability_analysis, 'Should have probability analysis');
  assert(result.correlations, 'Should have correlations');
  assert(result.scenario_analysis, 'Should have scenario analysis');
  assert(result.confidence_intervals, 'Should have confidence intervals');
  assert(result.recommendations, 'Should have recommendations');

  // Test statistics
  assert(result.summary_statistics.irr, 'Should calculate IRR statistics');
  assert(result.summary_statistics.irr.mean !== undefined, 'Should have mean IRR');
  assert(result.summary_statistics.irr.std_dev > 0, 'Should have IRR standard deviation');

  // Test risk metrics
  assert(result.risk_metrics.irr.value_at_risk, 'Should have VaR calculations');
  assert(result.risk_metrics.sharpe_ratio !== undefined, 'Should calculate Sharpe ratio');
});

test('MonteCarloSimulator - Distribution Types', () => {
  const calc = new MonteCarloSimulator();
  const result = calc.calculate({
    investment_parameters: {
      purchase_price: 200000
    },
    variable_distributions: {
      rental_income: {
        type: 'triangular',
        min: 1800,
        max: 2200,
        mode: 2000,
        mean: 2000
      },
      operating_expenses: {
        type: 'uniform',
        min: 10000,
        max: 15000,
        mean: 12500
      },
      vacancy_rate: {
        type: 'normal',
        mean: 5,
        std_dev: 2
      }
    },
    simulation_settings: {
      num_simulations: 500
    }
  });

  assert(result.summary_statistics.monthly_cash_flow, 'Should calculate cash flow statistics');
  assert(result.probability_analysis.positive_cash_flow >= 0, 'Should calculate probabilities');
});

test('MonteCarloSimulator - Schema Validation', () => {
  const calc = new MonteCarloSimulator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.investment_parameters, 'Should have investment_parameters');
  assert(schema.properties.variable_distributions, 'Should have variable_distributions');
  assert(schema.required.includes('investment_parameters'), 'investment_parameters should be required');
});

// ========== TAX BENEFITS CALCULATOR TESTS ==========

test('TaxBenefitsCalculator - Basic Calculation', () => {
  const calc = new TaxBenefitsCalculator();
  const result = calc.calculate({
    property_details: {
      purchase_price: 400000,
      land_value: 80000,
      property_type: 'residential_rental'
    },
    income_expenses: {
      annual_rental_income: 48000,
      operating_expenses: {
        property_tax: 4800,
        insurance: 2400,
        repairs_maintenance: 3600
      }
    },
    taxpayer_info: {
      filing_status: 'married_filing_jointly',
      other_income: 150000,
      active_participation: true
    },
    loan_details: {
      loan_amount: 320000,
      interest_rate: 7,
      loan_term_years: 30
    }
  });

  // Test structure
  assert(result.depreciation_analysis, 'Should have depreciation analysis');
  assert(result.annual_tax_analysis, 'Should have annual tax analysis');
  assert(result.summary_metrics, 'Should have summary metrics');
  assert(result.passive_loss_analysis, 'Should have passive loss analysis');
  assert(result.tax_strategies, 'Should have tax strategies');
  assert(result.effective_tax_rates, 'Should have effective tax rates');
  assert(result.recommendations, 'Should have recommendations');

  // Test calculations
  assert(result.depreciation_analysis.depreciable_basis.total > 0, 'Should calculate depreciable basis');
  assert(result.depreciation_analysis.depreciation_schedule.length > 0, 'Should have depreciation schedule');
  assert(result.annual_tax_analysis[0].depreciation > 0, 'Should calculate depreciation');
  assert(result.summary_metrics.total_tax_savings !== 0, 'Should calculate tax savings');
});

test('TaxBenefitsCalculator - Cost Segregation', () => {
  const calc = new TaxBenefitsCalculator();
  const result = calc.calculate({
    property_details: {
      purchase_price: 500000,
      land_value: 100000,
      property_type: 'residential_rental',
      cost_segregation: true
    },
    income_expenses: {
      annual_rental_income: 60000
    },
    taxpayer_info: {
      other_income: 200000
    },
    cost_segregation_breakdown: {
      personal_property_5yr: 40000,
      land_improvements_15yr: 60000,
      bonus_depreciation_eligible: true
    },
    analysis_options: {
      bonus_depreciation_rate: 60
    }
  });

  assert(result.cost_segregation_analysis, 'Should have cost segregation analysis');
  assert(result.depreciation_analysis.depreciation_schedule[0].bonus_depreciation > 0, 
    'Should apply bonus depreciation');
});

test('TaxBenefitsCalculator - Schema Validation', () => {
  const calc = new TaxBenefitsCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.property_details, 'Should have property_details');
  assert(schema.properties.income_expenses, 'Should have income_expenses');
  assert(schema.properties.taxpayer_info, 'Should have taxpayer_info');
  assert(schema.required.includes('property_details'), 'property_details should be required');
});

// ========== PROPERTY COMPARISON TESTS ==========

test('PropertyComparisonTool - Basic Comparison', () => {
  const calc = new PropertyComparisonTool();
  const result = calc.calculate({
    properties: [
      {
        name: 'Property A',
        purchase_price: 300000,
        monthly_rent: 3000,
        monthly_expenses: {
          property_tax: 300,
          insurance: 150,
          maintenance: 200
        },
        square_feet: 2000,
        units: 1
      },
      {
        name: 'Property B',
        purchase_price: 250000,
        monthly_rent: 2500,
        monthly_expenses: {
          property_tax: 250,
          insurance: 125,
          maintenance: 150
        },
        square_feet: 1800,
        units: 1
      }
    ],
    loan_terms: {
      interest_rate: 7,
      loan_term_years: 30
    }
  });

  // Test structure
  assert(result.property_analyses, 'Should have property analyses');
  assert(result.comparison_matrix, 'Should have comparison matrix');
  assert(result.rankings, 'Should have rankings');
  assert(result.best_options, 'Should have best options');
  assert(result.risk_return_analysis, 'Should have risk-return analysis');
  assert(result.sensitivity_comparison, 'Should have sensitivity comparison');
  assert(result.timeline_comparison, 'Should have timeline comparison');
  assert(result.insights, 'Should have insights');
  assert(result.recommendations, 'Should have recommendations');

  // Test analyses
  assert(result.property_analyses.length === 2, 'Should analyze 2 properties');
  assert(result.rankings.length === 2, 'Should rank 2 properties');
  assert(result.rankings[0].rank === 1, 'Should assign ranks');
});

test('PropertyComparisonTool - Multi-Property Comparison', () => {
  const calc = new PropertyComparisonTool();
  const result = calc.calculate({
    properties: [
      {
        name: 'Downtown Condo',
        purchase_price: 400000,
        monthly_rent: 3500,
        property_type: 'condo',
        location_score: {
          school_district: 6,
          neighborhood: 9,
          job_growth: 10,
          amenities: 9
        }
      },
      {
        name: 'Suburban House',
        purchase_price: 350000,
        monthly_rent: 3200,
        property_type: 'single_family',
        location_score: {
          school_district: 9,
          neighborhood: 8,
          job_growth: 7,
          amenities: 6
        }
      },
      {
        name: 'Duplex',
        purchase_price: 450000,
        monthly_rent: 4000,
        property_type: 'multi_family',
        units: 2,
        location_score: {
          school_district: 7,
          neighborhood: 7,
          job_growth: 8,
          amenities: 7
        }
      }
    ],
    comparison_criteria: {
      weights: {
        cash_flow: 30,
        appreciation: 20,
        cap_rate: 30,
        location: 20
      }
    }
  });

  assert(result.property_analyses.length === 3, 'Should analyze 3 properties');
  assert(result.insights.length > 0, 'Should generate insights');
  assert(result.best_options.highest_cash_flow, 'Should identify best cash flow property');
});

test('PropertyComparisonTool - Schema Validation', () => {
  const calc = new PropertyComparisonTool();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.properties, 'Should have properties array');
  assert(schema.properties.properties.type === 'array', 'Properties should be an array');
  assert(schema.properties.properties.minItems === 2, 'Should require at least 2 properties');
  assert(schema.required.includes('properties'), 'properties should be required');
});