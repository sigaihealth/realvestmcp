export class PropertyExpenseTracker {
  getSchema() {
    return {
      type: 'object',
      properties: {
        property_details: {
          type: 'object',
          properties: {
            property_id: { type: 'string' },
            property_name: { type: 'string' },
            property_type: { 
              type: 'string', 
              enum: ['single_family', 'duplex', 'triplex', 'fourplex', 'small_multifamily', 'large_multifamily', 'commercial', 'mixed_use'] 
            },
            total_units: { type: 'integer', minimum: 1, maximum: 1000 },
            acquisition_date: { type: 'string', format: 'date' },
            acquisition_cost: { type: 'number', minimum: 0 },
            current_market_value: { type: 'number', minimum: 0 }
          },
          required: ['property_id', 'property_name', 'property_type', 'total_units']
        },
        tracking_period: {
          type: 'object',
          properties: {
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            period_type: { 
              type: 'string', 
              enum: ['monthly', 'quarterly', 'annually', 'custom'] 
            }
          },
          required: ['start_date', 'end_date']
        },
        expense_categories: {
          type: 'object',
          properties: {
            operating_expenses: {
              type: 'object',
              properties: {
                property_management: { type: 'number', minimum: 0 },
                maintenance_repairs: { type: 'number', minimum: 0 },
                utilities: { type: 'number', minimum: 0 },
                landscaping: { type: 'number', minimum: 0 },
                pest_control: { type: 'number', minimum: 0 },
                cleaning: { type: 'number', minimum: 0 },
                security: { type: 'number', minimum: 0 },
                other_operating: { type: 'number', minimum: 0 }
              }
            },
            fixed_expenses: {
              type: 'object',
              properties: {
                property_taxes: { type: 'number', minimum: 0 },
                property_insurance: { type: 'number', minimum: 0 },
                hoa_fees: { type: 'number', minimum: 0 },
                licenses_permits: { type: 'number', minimum: 0 }
              }
            },
            capital_expenses: {
              type: 'object',
              properties: {
                major_repairs: { type: 'number', minimum: 0 },
                renovations: { type: 'number', minimum: 0 },
                appliance_replacement: { type: 'number', minimum: 0 },
                flooring: { type: 'number', minimum: 0 },
                roofing: { type: 'number', minimum: 0 },
                hvac: { type: 'number', minimum: 0 },
                plumbing: { type: 'number', minimum: 0 },
                electrical: { type: 'number', minimum: 0 },
                other_capital: { type: 'number', minimum: 0 }
              }
            },
            financing_costs: {
              type: 'object',
              properties: {
                mortgage_interest: { type: 'number', minimum: 0 },
                loan_fees: { type: 'number', minimum: 0 },
                refinancing_costs: { type: 'number', minimum: 0 }
              }
            },
            professional_services: {
              type: 'object',
              properties: {
                accounting: { type: 'number', minimum: 0 },
                legal: { type: 'number', minimum: 0 },
                real_estate_agent: { type: 'number', minimum: 0 },
                property_inspector: { type: 'number', minimum: 0 },
                consultant: { type: 'number', minimum: 0 }
              }
            },
            marketing_leasing: {
              type: 'object',
              properties: {
                advertising: { type: 'number', minimum: 0 },
                listing_fees: { type: 'number', minimum: 0 },
                tenant_screening: { type: 'number', minimum: 0 },
                leasing_commissions: { type: 'number', minimum: 0 }
              }
            }
          }
        },
        income_data: {
          type: 'object',
          properties: {
            rental_income: { type: 'number', minimum: 0 },
            late_fees: { type: 'number', minimum: 0 },
            pet_fees: { type: 'number', minimum: 0 },
            parking_fees: { type: 'number', minimum: 0 },
            laundry_income: { type: 'number', minimum: 0 },
            other_income: { type: 'number', minimum: 0 }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            expense_breakdown: { type: 'boolean' },
            benchmark_comparison: { type: 'boolean' },
            trend_analysis: { type: 'boolean' },
            budget_variance: { type: 'boolean' },
            tax_deduction_analysis: { type: 'boolean' },
            cash_flow_impact: { type: 'boolean' },
            expense_forecasting: { type: 'boolean' }
          }
        },
        budget_targets: {
          type: 'object',
          properties: {
            target_operating_ratio: { type: 'number', minimum: 0, maximum: 100 },
            target_maintenance_percentage: { type: 'number', minimum: 0, maximum: 50 },
            target_capex_reserve: { type: 'number', minimum: 0 },
            target_vacancy_rate: { type: 'number', minimum: 0, maximum: 100 }
          }
        }
      },
      required: ['property_details', 'tracking_period', 'expense_categories']
    };
  }

  calculate(params) {
    const {
      property_details,
      tracking_period,
      expense_categories,
      income_data = {},
      analysis_options = {},
      budget_targets = {}
    } = params;

    // Calculate total expenses by category
    const expenseAnalysis = this.analyzeExpenses(expense_categories, property_details);
    
    // Calculate income if provided
    const incomeAnalysis = this.analyzeIncome(income_data, property_details);
    
    // Calculate financial metrics
    const financialMetrics = this.calculateFinancialMetrics(
      expenseAnalysis, 
      incomeAnalysis, 
      property_details
    );
    
    // Generate expense breakdown
    const expenseBreakdown = analysis_options.expense_breakdown
      ? this.generateExpenseBreakdown(expenseAnalysis, financialMetrics)
      : null;
    
    // Benchmark comparison
    const benchmarkComparison = analysis_options.benchmark_comparison
      ? this.performBenchmarkComparison(expenseAnalysis, property_details)
      : null;
    
    // Trend analysis placeholder (would need historical data)
    const trendAnalysis = analysis_options.trend_analysis
      ? this.generateTrendAnalysis(expenseAnalysis, tracking_period)
      : null;
    
    // Budget variance analysis
    const budgetVariance = analysis_options.budget_variance && Object.keys(budget_targets).length > 0
      ? this.analyzeBudgetVariance(expenseAnalysis, financialMetrics, budget_targets)
      : null;
    
    // Tax deduction analysis
    const taxAnalysis = analysis_options.tax_deduction_analysis
      ? this.analyzeTaxDeductions(expenseAnalysis, property_details)
      : null;
    
    // Cash flow impact
    const cashFlowImpact = analysis_options.cash_flow_impact
      ? this.analyzeCashFlowImpact(expenseAnalysis, incomeAnalysis)
      : null;
    
    // Expense forecasting
    const expenseForecasting = analysis_options.expense_forecasting
      ? this.forecastExpenses(expenseAnalysis, property_details)
      : null;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      expenseAnalysis,
      financialMetrics,
      benchmarkComparison,
      property_details
    );

    return {
      property_summary: {
        property_id: property_details.property_id,
        property_name: property_details.property_name,
        property_type: property_details.property_type,
        total_units: property_details.total_units,
        tracking_period: tracking_period
      },
      expense_analysis: expenseAnalysis,
      income_analysis: incomeAnalysis,
      financial_metrics: financialMetrics,
      expense_breakdown: expenseBreakdown,
      benchmark_comparison: benchmarkComparison,
      trend_analysis: trendAnalysis,
      budget_variance: budgetVariance,
      tax_analysis: taxAnalysis,
      cash_flow_impact: cashFlowImpact,
      expense_forecasting: expenseForecasting,
      recommendations
    };
  }

  analyzeExpenses(expenseCategories, propertyDetails) {
    const operatingExpenses = this.sumExpenseCategory(expenseCategories.operating_expenses || {});
    const fixedExpenses = this.sumExpenseCategory(expenseCategories.fixed_expenses || {});
    const capitalExpenses = this.sumExpenseCategory(expenseCategories.capital_expenses || {});
    const financingCosts = this.sumExpenseCategory(expenseCategories.financing_costs || {});
    const professionalServices = this.sumExpenseCategory(expenseCategories.professional_services || {});
    const marketingLeasing = this.sumExpenseCategory(expenseCategories.marketing_leasing || {});

    const totalExpenses = operatingExpenses + fixedExpenses + capitalExpenses + 
                         financingCosts + professionalServices + marketingLeasing;

    const expensePerUnit = totalExpenses / propertyDetails.total_units;

    return {
      total_expenses: totalExpenses,
      expense_per_unit: expensePerUnit,
      operating_expenses: operatingExpenses,
      fixed_expenses: fixedExpenses,
      capital_expenses: capitalExpenses,
      financing_costs: financingCosts,
      professional_services: professionalServices,
      marketing_leasing: marketingLeasing,
      category_breakdown: {
        operating_expenses: this.calculateCategoryBreakdown(expenseCategories.operating_expenses || {}, totalExpenses),
        fixed_expenses: this.calculateCategoryBreakdown(expenseCategories.fixed_expenses || {}, totalExpenses),
        capital_expenses: this.calculateCategoryBreakdown(expenseCategories.capital_expenses || {}, totalExpenses),
        financing_costs: this.calculateCategoryBreakdown(expenseCategories.financing_costs || {}, totalExpenses),
        professional_services: this.calculateCategoryBreakdown(expenseCategories.professional_services || {}, totalExpenses),
        marketing_leasing: this.calculateCategoryBreakdown(expenseCategories.marketing_leasing || {}, totalExpenses)
      }
    };
  }

  analyzeIncome(incomeData, propertyDetails) {
    const rentalIncome = incomeData.rental_income || 0;
    const otherIncome = (incomeData.late_fees || 0) + (incomeData.pet_fees || 0) + 
                      (incomeData.parking_fees || 0) + (incomeData.laundry_income || 0) + 
                      (incomeData.other_income || 0);
    
    const totalIncome = rentalIncome + otherIncome;
    const incomePerUnit = totalIncome / propertyDetails.total_units;

    return {
      total_income: totalIncome,
      rental_income: rentalIncome,
      other_income: otherIncome,
      income_per_unit: incomePerUnit,
      income_breakdown: {
        rental_income: { amount: rentalIncome, percentage: totalIncome > 0 ? (rentalIncome / totalIncome) * 100 : 0 },
        late_fees: { amount: incomeData.late_fees || 0, percentage: totalIncome > 0 ? ((incomeData.late_fees || 0) / totalIncome) * 100 : 0 },
        pet_fees: { amount: incomeData.pet_fees || 0, percentage: totalIncome > 0 ? ((incomeData.pet_fees || 0) / totalIncome) * 100 : 0 },
        parking_fees: { amount: incomeData.parking_fees || 0, percentage: totalIncome > 0 ? ((incomeData.parking_fees || 0) / totalIncome) * 100 : 0 },
        laundry_income: { amount: incomeData.laundry_income || 0, percentage: totalIncome > 0 ? ((incomeData.laundry_income || 0) / totalIncome) * 100 : 0 },
        other_income: { amount: incomeData.other_income || 0, percentage: totalIncome > 0 ? ((incomeData.other_income || 0) / totalIncome) * 100 : 0 }
      }
    };
  }

  calculateFinancialMetrics(expenseAnalysis, incomeAnalysis, propertyDetails) {
    const netOperatingIncome = incomeAnalysis.total_income - expenseAnalysis.operating_expenses - expenseAnalysis.fixed_expenses;
    const totalCashFlow = netOperatingIncome - expenseAnalysis.financing_costs;
    const operatingExpenseRatio = incomeAnalysis.total_income > 0 ? 
      ((expenseAnalysis.operating_expenses + expenseAnalysis.fixed_expenses) / incomeAnalysis.total_income) * 100 : 0;
    const capexAsPercentageOfIncome = incomeAnalysis.total_income > 0 ? 
      (expenseAnalysis.capital_expenses / incomeAnalysis.total_income) * 100 : 0;

    let capRate = 0;
    if (propertyDetails.current_market_value && propertyDetails.current_market_value > 0) {
      capRate = (netOperatingIncome * 12 / propertyDetails.current_market_value) * 100; // Annualized
    }

    return {
      net_operating_income: netOperatingIncome,
      total_cash_flow: totalCashFlow,
      operating_expense_ratio: operatingExpenseRatio,
      capex_percentage: capexAsPercentageOfIncome,
      cap_rate: capRate,
      expense_per_unit: expenseAnalysis.expense_per_unit,
      income_per_unit: incomeAnalysis.income_per_unit,
      cash_flow_per_unit: totalCashFlow / propertyDetails.total_units
    };
  }

  sumExpenseCategory(category) {
    return Object.values(category).reduce((sum, value) => sum + (value || 0), 0);
  }

  calculateCategoryBreakdown(category, totalExpenses) {
    const categoryTotal = this.sumExpenseCategory(category);
    const breakdown = {};
    
    for (const [key, value] of Object.entries(category)) {
      breakdown[key] = {
        amount: value || 0,
        percentage_of_category: categoryTotal > 0 ? ((value || 0) / categoryTotal) * 100 : 0,
        percentage_of_total: totalExpenses > 0 ? ((value || 0) / totalExpenses) * 100 : 0
      };
    }
    
    return {
      category_total: categoryTotal,
      percentage_of_total_expenses: totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0,
      items: breakdown
    };
  }

  generateExpenseBreakdown(expenseAnalysis, financialMetrics) {
    const breakdown = {
      total_expenses: expenseAnalysis.total_expenses,
      expense_per_unit: expenseAnalysis.expense_per_unit,
      expense_categories: [
        {
          category: 'Operating Expenses',
          amount: expenseAnalysis.operating_expenses,
          percentage: expenseAnalysis.total_expenses > 0 ? (expenseAnalysis.operating_expenses / expenseAnalysis.total_expenses) * 100 : 0,
          description: 'Day-to-day operational costs'
        },
        {
          category: 'Fixed Expenses',
          amount: expenseAnalysis.fixed_expenses,
          percentage: expenseAnalysis.total_expenses > 0 ? (expenseAnalysis.fixed_expenses / expenseAnalysis.total_expenses) * 100 : 0,
          description: 'Taxes, insurance, and other fixed costs'
        },
        {
          category: 'Capital Expenses',
          amount: expenseAnalysis.capital_expenses,
          percentage: expenseAnalysis.total_expenses > 0 ? (expenseAnalysis.capital_expenses / expenseAnalysis.total_expenses) * 100 : 0,
          description: 'Major improvements and replacements'
        },
        {
          category: 'Financing Costs',
          amount: expenseAnalysis.financing_costs,
          percentage: expenseAnalysis.total_expenses > 0 ? (expenseAnalysis.financing_costs / expenseAnalysis.total_expenses) * 100 : 0,
          description: 'Mortgage interest and loan-related costs'
        },
        {
          category: 'Professional Services',
          amount: expenseAnalysis.professional_services,
          percentage: expenseAnalysis.total_expenses > 0 ? (expenseAnalysis.professional_services / expenseAnalysis.total_expenses) * 100 : 0,
          description: 'Legal, accounting, and consulting fees'
        },
        {
          category: 'Marketing & Leasing',
          amount: expenseAnalysis.marketing_leasing,
          percentage: expenseAnalysis.total_expenses > 0 ? (expenseAnalysis.marketing_leasing / expenseAnalysis.total_expenses) * 100 : 0,
          description: 'Tenant acquisition and retention costs'
        }
      ]
    };

    return breakdown;
  }

  performBenchmarkComparison(expenseAnalysis, propertyDetails) {
    // Industry benchmarks by property type (per unit annually)
    const benchmarks = {
      single_family: {
        operating_expenses: 3600,
        maintenance_percentage: 8,
        capex_percentage: 5,
        management_percentage: 10
      },
      duplex: {
        operating_expenses: 3200,
        maintenance_percentage: 7,
        capex_percentage: 5,
        management_percentage: 9
      },
      triplex: {
        operating_expenses: 2800,
        maintenance_percentage: 6,
        capex_percentage: 4,
        management_percentage: 8
      },
      fourplex: {
        operating_expenses: 2600,
        maintenance_percentage: 6,
        capex_percentage: 4,
        management_percentage: 8
      },
      small_multifamily: {
        operating_expenses: 2400,
        maintenance_percentage: 5,
        capex_percentage: 4,
        management_percentage: 7
      },
      large_multifamily: {
        operating_expenses: 2200,
        maintenance_percentage: 5,
        capex_percentage: 3,
        management_percentage: 6
      },
      commercial: {
        operating_expenses: 2000,
        maintenance_percentage: 4,
        capex_percentage: 3,
        management_percentage: 5
      },
      mixed_use: {
        operating_expenses: 2300,
        maintenance_percentage: 5,
        capex_percentage: 4,
        management_percentage: 6
      }
    };

    const propertyBenchmark = benchmarks[propertyDetails.property_type] || benchmarks.single_family;
    const annualExpensePerUnit = expenseAnalysis.expense_per_unit * 12; // Assuming monthly tracking

    return {
      property_type: propertyDetails.property_type,
      benchmark_operating_expenses_per_unit: propertyBenchmark.operating_expenses,
      actual_operating_expenses_per_unit: annualExpensePerUnit,
      variance_from_benchmark: {
        absolute: annualExpensePerUnit - propertyBenchmark.operating_expenses,
        percentage: propertyBenchmark.operating_expenses > 0 ? 
          ((annualExpensePerUnit - propertyBenchmark.operating_expenses) / propertyBenchmark.operating_expenses) * 100 : 0
      },
      performance_rating: this.calculatePerformanceRating(annualExpensePerUnit, propertyBenchmark.operating_expenses),
      benchmark_comparison: {
        operating_expenses: this.compareToBenchmark(expenseAnalysis.operating_expenses * 12 / propertyDetails.total_units, propertyBenchmark.operating_expenses),
        maintenance_capex: this.compareToBenchmark(expenseAnalysis.capital_expenses * 12 / propertyDetails.total_units, propertyBenchmark.operating_expenses * propertyBenchmark.capex_percentage / 100)
      }
    };
  }

  calculatePerformanceRating(actual, benchmark) {
    const variance = ((actual - benchmark) / benchmark) * 100;
    
    if (variance <= -20) return 'Excellent';
    if (variance <= -10) return 'Very Good';
    if (variance <= 0) return 'Good';
    if (variance <= 10) return 'Fair';
    if (variance <= 25) return 'Poor';
    return 'Very Poor';
  }

  compareToBenchmark(actual, benchmark) {
    return {
      actual,
      benchmark,
      variance: actual - benchmark,
      variance_percentage: benchmark > 0 ? ((actual - benchmark) / benchmark) * 100 : 0,
      status: actual <= benchmark ? 'Below Benchmark' : 'Above Benchmark'
    };
  }

  generateTrendAnalysis(expenseAnalysis, trackingPeriod) {
    // This would require historical data in a real implementation
    return {
      note: 'Trend analysis requires historical expense data across multiple time periods',
      current_period: trackingPeriod,
      recommendations: [
        'Track expenses consistently over multiple periods for trend analysis',
        'Monitor seasonal variations in expenses',
        'Compare year-over-year changes in major expense categories'
      ]
    };
  }

  analyzeBudgetVariance(expenseAnalysis, financialMetrics, budgetTargets) {
    const variances = {};

    if (budgetTargets.target_operating_ratio) {
      variances.operating_ratio = {
        target: budgetTargets.target_operating_ratio,
        actual: financialMetrics.operating_expense_ratio,
        variance: financialMetrics.operating_expense_ratio - budgetTargets.target_operating_ratio,
        status: financialMetrics.operating_expense_ratio <= budgetTargets.target_operating_ratio ? 'On Target' : 'Over Budget'
      };
    }

    if (budgetTargets.target_maintenance_percentage) {
      const actualMaintenancePercentage = financialMetrics.capex_percentage;
      variances.maintenance_percentage = {
        target: budgetTargets.target_maintenance_percentage,
        actual: actualMaintenancePercentage,
        variance: actualMaintenancePercentage - budgetTargets.target_maintenance_percentage,
        status: actualMaintenancePercentage <= budgetTargets.target_maintenance_percentage ? 'On Target' : 'Over Budget'
      };
    }

    if (budgetTargets.target_capex_reserve) {
      variances.capex_reserve = {
        target: budgetTargets.target_capex_reserve,
        actual: expenseAnalysis.capital_expenses,
        variance: expenseAnalysis.capital_expenses - budgetTargets.target_capex_reserve,
        status: expenseAnalysis.capital_expenses <= budgetTargets.target_capex_reserve ? 'Within Budget' : 'Over Budget'
      };
    }

    return {
      budget_variances: variances,
      overall_budget_status: this.calculateOverallBudgetStatus(variances)
    };
  }

  calculateOverallBudgetStatus(variances) {
    let overBudgetCount = 0;
    let totalVariances = 0;

    for (const variance of Object.values(variances)) {
      totalVariances++;
      if (variance.status.includes('Over')) {
        overBudgetCount++;
      }
    }

    if (overBudgetCount === 0) return 'On Track';
    if (overBudgetCount / totalVariances <= 0.3) return 'Mostly On Track';
    if (overBudgetCount / totalVariances <= 0.6) return 'Some Concerns';
    return 'Significant Budget Issues';
  }

  analyzeTaxDeductions(expenseAnalysis, propertyDetails) {
    const deductibleExpenses = {
      current_year_deductions: {
        operating_expenses: expenseAnalysis.operating_expenses * 12, // Annualized
        fixed_expenses: expenseAnalysis.fixed_expenses * 12,
        professional_services: expenseAnalysis.professional_services * 12,
        marketing_leasing: expenseAnalysis.marketing_leasing * 12,
        financing_costs: expenseAnalysis.financing_costs * 12
      },
      capital_expenses: {
        immediately_deductible: Math.min(expenseAnalysis.capital_expenses, 2500), // Section 179 small improvements
        depreciable: Math.max(0, expenseAnalysis.capital_expenses - 2500)
      }
    };

    const totalCurrentDeductions = Object.values(deductibleExpenses.current_year_deductions)
      .reduce((sum, value) => sum + value, 0) + deductibleExpenses.capital_expenses.immediately_deductible;

    const estimatedTaxSavings = this.calculateTaxSavings(totalCurrentDeductions);

    return {
      deductible_expenses: deductibleExpenses,
      total_current_year_deductions: totalCurrentDeductions,
      estimated_tax_savings: estimatedTaxSavings,
      tax_optimization_tips: [
        'Keep detailed records of all property-related expenses',
        'Consider timing of capital improvements for tax optimization',
        'Track vehicle mileage for property management activities',
        'Separate personal and business use of home office if applicable',
        'Consult with a tax professional for property-specific strategies'
      ]
    };
  }

  calculateTaxSavings(deductions) {
    // Simplified tax calculation - assumes combined federal and state rates
    const taxBrackets = [
      { min: 0, max: 50000, rate: 0.22 },
      { min: 50000, max: 100000, rate: 0.28 },
      { min: 100000, max: Infinity, rate: 0.32 }
    ];

    let taxSavings = 0;
    let remainingDeductions = deductions;

    for (const bracket of taxBrackets) {
      if (remainingDeductions <= 0) break;
      
      const bracketWidth = bracket.max === Infinity ? remainingDeductions : Math.min(bracket.max - bracket.min, remainingDeductions);
      taxSavings += bracketWidth * bracket.rate;
      remainingDeductions -= bracketWidth;
    }

    return {
      federal_savings: taxSavings * 0.7, // Assume 70% federal
      state_savings: taxSavings * 0.3,   // Assume 30% state
      total_savings: taxSavings,
      effective_tax_rate: deductions > 0 ? (taxSavings / deductions) * 100 : 0
    };
  }

  analyzeCashFlowImpact(expenseAnalysis, incomeAnalysis) {
    const operatingCashFlow = incomeAnalysis.total_income - expenseAnalysis.operating_expenses - expenseAnalysis.fixed_expenses;
    const totalCashFlow = operatingCashFlow - expenseAnalysis.financing_costs;
    const cashFlowMargin = incomeAnalysis.total_income > 0 ? (totalCashFlow / incomeAnalysis.total_income) * 100 : 0;

    return {
      operating_cash_flow: operatingCashFlow,
      total_cash_flow: totalCashFlow,
      cash_flow_margin: cashFlowMargin,
      cash_flow_status: this.determineCashFlowStatus(totalCashFlow, cashFlowMargin),
      expense_impact_analysis: {
        largest_expense_category: this.findLargestExpenseCategory(expenseAnalysis),
        expense_efficiency: this.calculateExpenseEfficiency(expenseAnalysis, incomeAnalysis),
        improvement_opportunities: this.identifyImprovementOpportunities(expenseAnalysis)
      }
    };
  }

  determineCashFlowStatus(totalCashFlow, margin) {
    if (totalCashFlow < 0) return 'Negative Cash Flow';
    if (margin < 5) return 'Minimal Cash Flow';
    if (margin < 15) return 'Moderate Cash Flow';
    if (margin < 25) return 'Good Cash Flow';
    return 'Excellent Cash Flow';
  }

  findLargestExpenseCategory(expenseAnalysis) {
    const categories = {
      'Operating Expenses': expenseAnalysis.operating_expenses,
      'Fixed Expenses': expenseAnalysis.fixed_expenses,
      'Capital Expenses': expenseAnalysis.capital_expenses,
      'Financing Costs': expenseAnalysis.financing_costs,
      'Professional Services': expenseAnalysis.professional_services,
      'Marketing & Leasing': expenseAnalysis.marketing_leasing
    };

    const largest = Object.entries(categories).reduce((max, [category, amount]) => 
      amount > max.amount ? { category, amount } : max, 
      { category: '', amount: 0 }
    );

    return {
      category: largest.category,
      amount: largest.amount,
      percentage: expenseAnalysis.total_expenses > 0 ? (largest.amount / expenseAnalysis.total_expenses) * 100 : 0
    };
  }

  calculateExpenseEfficiency(expenseAnalysis, incomeAnalysis) {
    return {
      expense_to_income_ratio: incomeAnalysis.total_income > 0 ? (expenseAnalysis.total_expenses / incomeAnalysis.total_income) * 100 : 0,
      operating_efficiency: incomeAnalysis.total_income > 0 ? ((expenseAnalysis.operating_expenses + expenseAnalysis.fixed_expenses) / incomeAnalysis.total_income) * 100 : 0,
      capital_intensity: incomeAnalysis.total_income > 0 ? (expenseAnalysis.capital_expenses / incomeAnalysis.total_income) * 100 : 0
    };
  }

  identifyImprovementOpportunities(expenseAnalysis) {
    const opportunities = [];

    if (expenseAnalysis.operating_expenses > expenseAnalysis.total_expenses * 0.4) {
      opportunities.push({
        category: 'Operating Expenses',
        issue: 'High operating expense ratio',
        recommendation: 'Review maintenance contracts and vendor pricing'
      });
    }

    if (expenseAnalysis.capital_expenses > expenseAnalysis.total_expenses * 0.3) {
      opportunities.push({
        category: 'Capital Expenses',
        issue: 'High capital expenditure',
        recommendation: 'Consider preventive maintenance to reduce major repairs'
      });
    }

    if (expenseAnalysis.professional_services > expenseAnalysis.total_expenses * 0.1) {
      opportunities.push({
        category: 'Professional Services',
        issue: 'High professional service costs',
        recommendation: 'Evaluate necessity and pricing of professional services'
      });
    }

    return opportunities;
  }

  forecastExpenses(expenseAnalysis, propertyDetails) {
    const annualizedExpenses = expenseAnalysis.total_expenses * 12;
    const inflationRate = 0.03; // 3% annual inflation
    const propertyAgeInflator = propertyDetails.property_age_years ? 1 + (propertyDetails.property_age_years * 0.001) : 1;

    const forecast = [];
    for (let year = 1; year <= 5; year++) {
      const baseGrowth = Math.pow(1 + inflationRate, year);
      const adjustedGrowth = baseGrowth * propertyAgeInflator;
      
      forecast.push({
        year: year,
        projected_expenses: annualizedExpenses * adjustedGrowth,
        growth_rate: ((adjustedGrowth - 1) * 100).toFixed(1) + '%',
        expense_per_unit: (annualizedExpenses * adjustedGrowth) / propertyDetails.total_units
      });
    }

    return {
      current_annual_expenses: annualizedExpenses,
      five_year_forecast: forecast,
      forecast_assumptions: {
        inflation_rate: `${(inflationRate * 100).toFixed(1)}%`,
        property_age_factor: propertyAgeInflator.toFixed(3),
        notes: 'Forecast includes inflation and property age adjustments'
      }
    };
  }

  generateRecommendations(expenseAnalysis, financialMetrics, benchmarkComparison, propertyDetails) {
    const recommendations = [];

    // High-level financial recommendations
    if (financialMetrics.operating_expense_ratio > 60) {
      recommendations.push({
        category: 'Cost Control',
        priority: 'High',
        recommendation: 'Reduce operating expense ratio',
        description: 'Operating expenses exceed 60% of income - review all operating costs',
        potential_savings: financialMetrics.operating_expense_ratio * 100
      });
    }

    // Benchmark-based recommendations
    if (benchmarkComparison && benchmarkComparison.variance_from_benchmark.percentage > 20) {
      recommendations.push({
        category: 'Benchmarking',
        priority: 'Medium',
        recommendation: 'Expenses significantly above market average',
        description: `Expenses are ${benchmarkComparison.variance_from_benchmark.percentage.toFixed(1)}% above benchmark`,
        potential_savings: benchmarkComparison.variance_from_benchmark.absolute
      });
    }

    // Capital expense recommendations
    if (financialMetrics.capex_percentage > 15) {
      recommendations.push({
        category: 'Capital Planning',
        priority: 'Medium',
        recommendation: 'High capital expenditure rate',
        description: 'Consider preventive maintenance program to reduce major repairs',
        potential_savings: expenseAnalysis.capital_expenses * 0.2
      });
    }

    // Property-specific recommendations
    if (propertyDetails.property_type === 'single_family' && expenseAnalysis.professional_services > 500) {
      recommendations.push({
        category: 'Self-Management',
        priority: 'Low',
        recommendation: 'Consider self-management',
        description: 'Single family properties often benefit from owner management',
        potential_savings: expenseAnalysis.professional_services * 0.7
      });
    }

    // General improvement recommendations
    recommendations.push({
      category: 'Process Improvement',
      priority: 'Low',
      recommendation: 'Implement expense tracking system',
      description: 'Regular expense tracking helps identify trends and optimize costs',
      potential_savings: expenseAnalysis.total_expenses * 0.05
    });

    return {
      recommendations,
      total_potential_savings: recommendations.reduce((sum, rec) => sum + (rec.potential_savings || 0), 0),
      implementation_priority: recommendations.filter(r => r.priority === 'High').length > 0 ? 'High' : 
                              recommendations.filter(r => r.priority === 'Medium').length > 0 ? 'Medium' : 'Low'
    };
  }
}