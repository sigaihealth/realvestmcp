import { test } from 'node:test';
import assert from 'node:assert';
import { PropertyExpenseTracker } from '../src/calculators/property-expense-tracker.js';

test('PropertyExpenseTracker - Basic Expense Analysis', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'PROP001',
      property_name: 'Maple Street Duplex',
      property_type: 'duplex',
      total_units: 2,
      acquisition_date: '2023-01-15',
      acquisition_cost: 400000,
      current_market_value: 450000
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      period_type: 'monthly'
    },
    expense_categories: {
      operating_expenses: {
        property_management: 300,
        maintenance_repairs: 450,
        utilities: 150,
        landscaping: 100,
        pest_control: 50,
        cleaning: 75
      },
      fixed_expenses: {
        property_taxes: 600,
        property_insurance: 120,
        hoa_fees: 0
      },
      capital_expenses: {
        major_repairs: 800,
        appliance_replacement: 1200,
        flooring: 0
      },
      financing_costs: {
        mortgage_interest: 1800,
        loan_fees: 25
      }
    },
    income_data: {
      rental_income: 3600,
      late_fees: 50,
      pet_fees: 100
    }
  });

  // Test structure
  assert(result.property_summary, 'Should have property summary');
  assert(result.expense_analysis, 'Should have expense analysis');
  assert(result.income_analysis, 'Should have income analysis');
  assert(result.financial_metrics, 'Should have financial metrics');

  // Test property summary
  const summary = result.property_summary;
  assert(summary.property_id === 'PROP001', 'Should preserve property ID');
  assert(summary.property_name === 'Maple Street Duplex', 'Should preserve property name');
  assert(summary.property_type === 'duplex', 'Should preserve property type');
  assert(summary.total_units === 2, 'Should preserve unit count');

  // Test expense analysis
  const expenses = result.expense_analysis;
  assert(expenses.operating_expenses === 1125, 'Should sum operating expenses');
  assert(expenses.fixed_expenses === 720, 'Should sum fixed expenses');
  assert(expenses.capital_expenses === 2000, 'Should sum capital expenses');
  assert(expenses.financing_costs === 1825, 'Should sum financing costs');
  assert(expenses.total_expenses === 5670, 'Should calculate total expenses');
  assert(expenses.expense_per_unit === 2835, 'Should calculate expense per unit');

  // Test income analysis
  const income = result.income_analysis;
  assert(income.rental_income === 3600, 'Should preserve rental income');
  assert(income.other_income === 150, 'Should sum other income (50 + 100)');
  assert(income.total_income === 3750, 'Should calculate total income');
  assert(income.income_per_unit === 1875, 'Should calculate income per unit');

  // Test financial metrics
  const metrics = result.financial_metrics;
  assert(typeof metrics.net_operating_income === 'number', 'Should calculate NOI');
  assert(typeof metrics.total_cash_flow === 'number', 'Should calculate cash flow');
  assert(typeof metrics.operating_expense_ratio === 'number', 'Should calculate operating expense ratio');
  assert(typeof metrics.cap_rate === 'number', 'Should calculate cap rate');
});

test('PropertyExpenseTracker - Expense Breakdown Analysis', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'PROP002',
      property_name: 'Oak Avenue Triplex',
      property_type: 'triplex',
      total_units: 3
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-03-31',
      period_type: 'quarterly'
    },
    expense_categories: {
      operating_expenses: {
        property_management: 450,
        maintenance_repairs: 600,
        utilities: 200
      },
      fixed_expenses: {
        property_taxes: 900,
        property_insurance: 180
      },
      capital_expenses: {
        major_repairs: 1500,
        hvac: 2500
      }
    },
    analysis_options: {
      expense_breakdown: true
    }
  });

  const breakdown = result.expense_breakdown;
  assert(breakdown, 'Should include expense breakdown when requested');
  assert(breakdown.total_expenses === 6330, 'Should calculate correct total expenses');
  assert(breakdown.expense_per_unit === 2110, 'Should calculate expense per unit');
  assert(Array.isArray(breakdown.expense_categories), 'Should provide expense categories array');
  assert(breakdown.expense_categories.length === 6, 'Should have 6 expense categories');

  // Verify category breakdown
  const operatingCategory = breakdown.expense_categories.find(c => c.category === 'Operating Expenses');
  assert(operatingCategory, 'Should include operating expenses category');
  assert(operatingCategory.amount === 1250, 'Should calculate operating expenses total');
  assert(Math.abs(operatingCategory.percentage - 19.7) < 0.1, 'Should calculate correct percentage');

  const capitalCategory = breakdown.expense_categories.find(c => c.category === 'Capital Expenses');
  assert(capitalCategory, 'Should include capital expenses category');
  assert(capitalCategory.amount === 4000, 'Should calculate capital expenses total');
  assert(Math.abs(capitalCategory.percentage - 63.2) < 0.1, 'Should calculate correct percentage');
});

test('PropertyExpenseTracker - Benchmark Comparison', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'PROP003',
      property_name: 'Pine Street Single Family',
      property_type: 'single_family',
      total_units: 1
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      period_type: 'monthly'
    },
    expense_categories: {
      operating_expenses: {
        maintenance_repairs: 400,
        utilities: 100
      },
      fixed_expenses: {
        property_taxes: 250,
        property_insurance: 100
      }
    },
    analysis_options: {
      benchmark_comparison: true
    }
  });

  const benchmark = result.benchmark_comparison;
  assert(benchmark, 'Should include benchmark comparison when requested');
  assert(benchmark.property_type === 'single_family', 'Should identify property type');
  assert(typeof benchmark.benchmark_operating_expenses_per_unit === 'number', 'Should provide benchmark');
  assert(typeof benchmark.actual_operating_expenses_per_unit === 'number', 'Should calculate actual expenses');
  assert(benchmark.variance_from_benchmark, 'Should calculate variance from benchmark');
  assert(['Excellent', 'Very Good', 'Good', 'Fair', 'Poor', 'Very Poor'].includes(benchmark.performance_rating), 
         'Should assign valid performance rating');
  assert(benchmark.benchmark_comparison, 'Should provide detailed benchmark comparison');
});

test('PropertyExpenseTracker - Multi-Family Property Analysis', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'PROP004',
      property_name: 'Elm Street Apartments',
      property_type: 'small_multifamily',
      total_units: 8,
      current_market_value: 800000
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      period_type: 'monthly'
    },
    expense_categories: {
      operating_expenses: {
        property_management: 800,
        maintenance_repairs: 1200,
        utilities: 400,
        landscaping: 300,
        pest_control: 150,
        cleaning: 250,
        security: 200
      },
      fixed_expenses: {
        property_taxes: 1200,
        property_insurance: 300,
        licenses_permits: 50
      },
      capital_expenses: {
        renovations: 2000,
        flooring: 1500,
        plumbing: 800
      }
    },
    income_data: {
      rental_income: 9600,
      laundry_income: 200,
      parking_fees: 400
    }
  });

  const expenses = result.expense_analysis;
  const income = result.income_analysis;
  const metrics = result.financial_metrics;

  // Multi-family should have economies of scale
  assert(expenses.expense_per_unit < 1500, 'Multi-family should have lower per-unit expenses');
  assert(income.total_income === 10200, 'Should include all income sources');
  assert(income.income_per_unit === 1275, 'Should calculate income per unit');

  // Should calculate NOI and cap rate for multi-family
  assert(metrics.net_operating_income > 0, 'Should have positive NOI');
  assert(metrics.cap_rate > 0, 'Should calculate cap rate with market value');
  assert(metrics.operating_expense_ratio < 50, 'Multi-family should have good operating ratio');
});

test('PropertyExpenseTracker - Budget Variance Analysis', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'PROP005',
      property_name: 'Cedar Lane Fourplex',
      property_type: 'fourplex',
      total_units: 4
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      period_type: 'monthly'
    },
    expense_categories: {
      operating_expenses: {
        maintenance_repairs: 800,
        utilities: 200
      },
      fixed_expenses: {
        property_taxes: 400,
        property_insurance: 150
      },
      capital_expenses: {
        major_repairs: 2000
      }
    },
    income_data: {
      rental_income: 4800
    },
    budget_targets: {
      target_operating_ratio: 35,
      target_maintenance_percentage: 10,
      target_capex_reserve: 1500
    },
    analysis_options: {
      budget_variance: true
    }
  });

  const variance = result.budget_variance;
  assert(variance, 'Should include budget variance when requested');
  assert(variance.budget_variances, 'Should provide budget variances');
  assert(variance.overall_budget_status, 'Should provide overall budget status');

  // Should analyze specific budget targets
  if (variance.budget_variances.operating_ratio) {
    assert(variance.budget_variances.operating_ratio.target === 35, 'Should preserve target operating ratio');
    assert(typeof variance.budget_variances.operating_ratio.actual === 'number', 'Should calculate actual ratio');
    assert(['On Target', 'Over Budget'].includes(variance.budget_variances.operating_ratio.status), 'Should assign status');
  }

  if (variance.budget_variances.capex_reserve) {
    assert(variance.budget_variances.capex_reserve.target === 1500, 'Should preserve capex target');
    assert(variance.budget_variances.capex_reserve.actual === 2000, 'Should show actual capex');
    assert(variance.budget_variances.capex_reserve.status === 'Over Budget', 'Should identify over budget');
  }

  assert(['On Track', 'Mostly On Track', 'Some Concerns', 'Significant Budget Issues'].includes(variance.overall_budget_status),
         'Should assign valid overall budget status');
});

test('PropertyExpenseTracker - Tax Deduction Analysis', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'PROP006',
      property_name: 'Birch Avenue Rental',
      property_type: 'single_family',
      total_units: 1
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      period_type: 'monthly'
    },
    expense_categories: {
      operating_expenses: {
        maintenance_repairs: 300,
        utilities: 80
      },
      fixed_expenses: {
        property_taxes: 200,
        property_insurance: 90
      },
      capital_expenses: {
        major_repairs: 1800,
        appliance_replacement: 600
      },
      professional_services: {
        accounting: 100,
        legal: 150
      },
      financing_costs: {
        mortgage_interest: 1200
      }
    },
    analysis_options: {
      tax_deduction_analysis: true
    }
  });

  const taxAnalysis = result.tax_analysis;
  assert(taxAnalysis, 'Should include tax analysis when requested');
  assert(taxAnalysis.deductible_expenses, 'Should categorize deductible expenses');
  assert(taxAnalysis.total_current_year_deductions > 0, 'Should calculate total deductions');
  assert(taxAnalysis.estimated_tax_savings, 'Should estimate tax savings');
  assert(Array.isArray(taxAnalysis.tax_optimization_tips), 'Should provide optimization tips');

  const deductibleExpenses = taxAnalysis.deductible_expenses;
  assert(deductibleExpenses.current_year_deductions, 'Should categorize current year deductions');
  assert(deductibleExpenses.capital_expenses, 'Should handle capital expenses separately');

  // Capital expenses should be split between immediately deductible and depreciable
  assert(deductibleExpenses.capital_expenses.immediately_deductible <= 2500, 'Should cap immediate deduction');
  assert(deductibleExpenses.capital_expenses.depreciable >= 0, 'Should calculate depreciable amount');

  const taxSavings = taxAnalysis.estimated_tax_savings;
  assert(typeof taxSavings.federal_savings === 'number', 'Should estimate federal tax savings');
  assert(typeof taxSavings.state_savings === 'number', 'Should estimate state tax savings');
  assert(typeof taxSavings.total_savings === 'number', 'Should calculate total tax savings');
  assert(typeof taxSavings.effective_tax_rate === 'number', 'Should calculate effective tax rate');
});

test('PropertyExpenseTracker - Cash Flow Impact Analysis', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'PROP007',
      property_name: 'Willow Creek Duplex',
      property_type: 'duplex',
      total_units: 2
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      period_type: 'monthly'
    },
    expense_categories: {
      operating_expenses: {
        property_management: 250,
        maintenance_repairs: 400,
        utilities: 120
      },
      fixed_expenses: {
        property_taxes: 300,
        property_insurance: 100
      },
      financing_costs: {
        mortgage_interest: 1400
      }
    },
    income_data: {
      rental_income: 3200,
      late_fees: 25
    },
    analysis_options: {
      cash_flow_impact: true
    }
  });

  const cashFlowImpact = result.cash_flow_impact;
  assert(cashFlowImpact, 'Should include cash flow impact when requested');
  assert(typeof cashFlowImpact.operating_cash_flow === 'number', 'Should calculate operating cash flow');
  assert(typeof cashFlowImpact.total_cash_flow === 'number', 'Should calculate total cash flow');
  assert(typeof cashFlowImpact.cash_flow_margin === 'number', 'Should calculate cash flow margin');
  assert(['Negative Cash Flow', 'Minimal Cash Flow', 'Moderate Cash Flow', 'Good Cash Flow', 'Excellent Cash Flow']
         .includes(cashFlowImpact.cash_flow_status), 'Should assign valid cash flow status');

  const expenseImpact = cashFlowImpact.expense_impact_analysis;
  assert(expenseImpact.largest_expense_category, 'Should identify largest expense category');
  assert(expenseImpact.expense_efficiency, 'Should calculate expense efficiency');
  assert(Array.isArray(expenseImpact.improvement_opportunities), 'Should identify improvement opportunities');

  const largestCategory = expenseImpact.largest_expense_category;
  assert(largestCategory.category, 'Should name the largest category');
  assert(typeof largestCategory.amount === 'number', 'Should provide category amount');
  assert(typeof largestCategory.percentage === 'number', 'Should calculate category percentage');
});

test('PropertyExpenseTracker - Expense Forecasting', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'PROP008',
      property_name: 'Sunset Boulevard Commercial',
      property_type: 'commercial',
      total_units: 5,
      property_age_years: 20
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      period_type: 'monthly'
    },
    expense_categories: {
      operating_expenses: {
        property_management: 600,
        maintenance_repairs: 800,
        utilities: 300
      },
      fixed_expenses: {
        property_taxes: 800,
        property_insurance: 200
      }
    },
    analysis_options: {
      expense_forecasting: true
    }
  });

  const forecasting = result.expense_forecasting;
  assert(forecasting, 'Should include expense forecasting when requested');
  assert(typeof forecasting.current_annual_expenses === 'number', 'Should calculate current annual expenses');
  assert(Array.isArray(forecasting.five_year_forecast), 'Should provide 5-year forecast');
  assert(forecasting.five_year_forecast.length === 5, 'Should forecast 5 years');
  assert(forecasting.forecast_assumptions, 'Should provide forecast assumptions');

  forecasting.five_year_forecast.forEach((year, index) => {
    assert(year.year === index + 1, 'Should number years correctly');
    assert(typeof year.projected_expenses === 'number', 'Should project expenses');
    assert(year.growth_rate, 'Should provide growth rate');
    assert(typeof year.expense_per_unit === 'number', 'Should calculate expense per unit');
    
    // Each year should be higher than the previous (accounting for inflation and age)
    if (index > 0) {
      assert(year.projected_expenses > forecasting.five_year_forecast[index - 1].projected_expenses,
             'Forecast should show increasing expenses over time');
    }
  });

  const assumptions = forecasting.forecast_assumptions;
  assert(assumptions.inflation_rate, 'Should specify inflation rate');
  assert(typeof assumptions.property_age_factor === 'string', 'Should specify age factor');
  assert(assumptions.notes, 'Should provide forecast notes');
});

test('PropertyExpenseTracker - Commercial Property Analysis', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'COMM001',
      property_name: 'Downtown Office Building',
      property_type: 'commercial',
      total_units: 12,
      current_market_value: 2400000
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      period_type: 'monthly'
    },
    expense_categories: {
      operating_expenses: {
        property_management: 1200,
        maintenance_repairs: 1800,
        utilities: 800,
        security: 600,
        cleaning: 900
      },
      fixed_expenses: {
        property_taxes: 3000,
        property_insurance: 500,
        licenses_permits: 100
      },
      capital_expenses: {
        hvac: 5000,
        electrical: 2000
      }
    },
    income_data: {
      rental_income: 24000
    },
    analysis_options: {
      benchmark_comparison: true
    }
  });

  const benchmark = result.benchmark_comparison;
  assert(benchmark.property_type === 'commercial', 'Should identify as commercial property');
  
  // Commercial properties typically have different benchmarks
  assert(benchmark.benchmark_operating_expenses_per_unit < 2500, 'Commercial should have lower per-unit benchmarks');
  
  const metrics = result.financial_metrics;
  assert(metrics.cap_rate > 0, 'Should calculate cap rate for commercial property');
  assert(metrics.income_per_unit === 2000, 'Should calculate $2000 per unit income');
});

test('PropertyExpenseTracker - Mixed Use Property Analysis', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'MIX001',
      property_name: 'Main Street Mixed Use',
      property_type: 'mixed_use',
      total_units: 6
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      period_type: 'monthly'
    },
    expense_categories: {
      operating_expenses: {
        property_management: 450,
        maintenance_repairs: 600,
        utilities: 250
      },
      fixed_expenses: {
        property_taxes: 600,
        property_insurance: 180
      },
      professional_services: {
        accounting: 75,
        legal: 100
      }
    },
    income_data: {
      rental_income: 7200,
      parking_fees: 300
    }
  });

  const expenses = result.expense_analysis;
  const income = result.income_analysis;

  assert(expenses.professional_services === 175, 'Should sum professional services');
  assert(income.total_income === 7500, 'Should include parking fees in total income');
  assert(income.income_per_unit === 1250, 'Should calculate income per unit for mixed use');
});

test('PropertyExpenseTracker - Recommendations Generation', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'PROP009',
      property_name: 'High Expense Property',
      property_type: 'triplex',
      total_units: 3
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      period_type: 'monthly'
    },
    expense_categories: {
      operating_expenses: {
        maintenance_repairs: 1500, // Very high
        utilities: 300
      },
      fixed_expenses: {
        property_taxes: 200,
        property_insurance: 100
      },
      capital_expenses: {
        major_repairs: 2500 // Very high
      },
      professional_services: {
        property_management: 800 // High for triplex
      }
    },
    income_data: {
      rental_income: 3000 // Creating high expense ratio scenario
    },
    analysis_options: {
      benchmark_comparison: true
    }
  });

  const recommendations = result.recommendations;
  assert(recommendations, 'Should provide recommendations');
  assert(Array.isArray(recommendations.recommendations), 'Should have recommendations array');
  assert(recommendations.recommendations.length > 0, 'Should have multiple recommendations');
  assert(typeof recommendations.total_potential_savings === 'number', 'Should estimate total savings');
  assert(['High', 'Medium', 'Low'].includes(recommendations.implementation_priority), 'Should assign priority');

  // Should identify high expense issues
  const highExpenseRec = recommendations.recommendations.find(r => r.category === 'Cost Control');
  if (highExpenseRec) {
    assert(highExpenseRec.priority === 'High', 'High expense issues should be high priority');
    assert(highExpenseRec.potential_savings > 0, 'Should estimate savings');
  }

  // Should include process improvement recommendation
  const processRec = recommendations.recommendations.find(r => r.category === 'Process Improvement');
  assert(processRec, 'Should include process improvement recommendation');
});

test('PropertyExpenseTracker - Large Multifamily Efficiency', () => {
  const tracker = new PropertyExpenseTracker();
  const result = tracker.calculate({
    property_details: {
      property_id: 'LARGE001',
      property_name: 'Riverside Apartments',
      property_type: 'large_multifamily',
      total_units: 50
    },
    tracking_period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      period_type: 'monthly'
    },
    expense_categories: {
      operating_expenses: {
        property_management: 3000,
        maintenance_repairs: 4000,
        utilities: 1500,
        landscaping: 800,
        security: 1200
      },
      fixed_expenses: {
        property_taxes: 6000,
        property_insurance: 1000
      }
    },
    income_data: {
      rental_income: 75000,
      laundry_income: 1000,
      parking_fees: 2500
    },
    analysis_options: {
      benchmark_comparison: true
    }
  });

  const expenses = result.expense_analysis;
  const metrics = result.financial_metrics;
  const benchmark = result.benchmark_comparison;

  // Large multifamily should have good economies of scale
  assert(expenses.expense_per_unit < 400, 'Large multifamily should have excellent per-unit efficiency');
  assert(metrics.operating_expense_ratio < 30, 'Should have good operating efficiency');
  
  // Should have benchmark comparison
  assert(benchmark.property_type === 'large_multifamily', 'Should identify correct property type');
  assert(typeof benchmark.performance_rating === 'string', 'Should assign performance rating');
});

test('PropertyExpenseTracker - Schema Validation', () => {
  const tracker = new PropertyExpenseTracker();
  const schema = tracker.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.property_details, 'Should have property_details property');
  assert(schema.properties.tracking_period, 'Should have tracking_period property');
  assert(schema.properties.expense_categories, 'Should have expense_categories property');
  assert(schema.properties.income_data, 'Should have income_data property');
  assert(schema.properties.analysis_options, 'Should have analysis_options property');
  assert(schema.properties.budget_targets, 'Should have budget_targets property');
  
  assert(schema.required.includes('property_details'), 'property_details should be required');
  assert(schema.required.includes('tracking_period'), 'tracking_period should be required');
  assert(schema.required.includes('expense_categories'), 'expense_categories should be required');
  
  // Test property details schema
  const propertyDetails = schema.properties.property_details;
  assert(propertyDetails.properties.property_id, 'Should define property_id');
  assert(propertyDetails.properties.property_name, 'Should define property_name');
  assert(propertyDetails.properties.property_type, 'Should define property_type');
  assert(propertyDetails.properties.total_units, 'Should define total_units');
  
  // Test property type enum
  const propertyTypeEnum = propertyDetails.properties.property_type.enum;
  assert(propertyTypeEnum.includes('single_family'), 'Should include single_family');
  assert(propertyTypeEnum.includes('duplex'), 'Should include duplex');
  assert(propertyTypeEnum.includes('large_multifamily'), 'Should include large_multifamily');
  assert(propertyTypeEnum.includes('commercial'), 'Should include commercial');
  assert(propertyTypeEnum.includes('mixed_use'), 'Should include mixed_use');
  
  // Test tracking period schema
  const trackingPeriod = schema.properties.tracking_period;
  assert(trackingPeriod.properties.start_date, 'Should define start_date');
  assert(trackingPeriod.properties.end_date, 'Should define end_date');
  assert(trackingPeriod.properties.period_type, 'Should define period_type');
  assert(trackingPeriod.required.includes('start_date'), 'start_date should be required');
  assert(trackingPeriod.required.includes('end_date'), 'end_date should be required');
  
  // Test expense categories schema
  const expenseCategories = schema.properties.expense_categories;
  assert(expenseCategories.properties.operating_expenses, 'Should define operating_expenses');
  assert(expenseCategories.properties.fixed_expenses, 'Should define fixed_expenses');
  assert(expenseCategories.properties.capital_expenses, 'Should define capital_expenses');
  assert(expenseCategories.properties.financing_costs, 'Should define financing_costs');
  assert(expenseCategories.properties.professional_services, 'Should define professional_services');
  assert(expenseCategories.properties.marketing_leasing, 'Should define marketing_leasing');
  
  // Test operating expenses subcategory
  const operatingExpenses = expenseCategories.properties.operating_expenses;
  assert(operatingExpenses.properties.property_management, 'Should define property_management');
  assert(operatingExpenses.properties.maintenance_repairs, 'Should define maintenance_repairs');
  assert(operatingExpenses.properties.utilities, 'Should define utilities');
});