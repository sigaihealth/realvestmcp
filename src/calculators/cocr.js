export class COCRCalculator {
  constructor() {
    this.name = 'Cash-on-Cash Return Calculator';
    this.description = 'Calculate Cash-on-Cash Return for real estate investments';
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        purchase_price: {
          type: 'number',
          description: 'Total purchase price of the property',
          minimum: 0
        },
        down_payment: {
          type: 'number',
          description: 'Down payment amount',
          minimum: 0
        },
        closing_costs: {
          type: 'number',
          description: 'Closing costs and fees',
          minimum: 0,
          default: 0
        },
        renovation_costs: {
          type: 'number',
          description: 'Initial renovation/improvement costs',
          minimum: 0,
          default: 0
        },
        annual_rental_income: {
          type: 'number',
          description: 'Total annual rental income',
          minimum: 0
        },
        annual_expenses: {
          type: 'object',
          description: 'Annual operating expenses',
          properties: {
            property_tax: {
              type: 'number',
              description: 'Annual property taxes',
              minimum: 0,
              default: 0
            },
            insurance: {
              type: 'number',
              description: 'Annual insurance premiums',
              minimum: 0,
              default: 0
            },
            hoa_fees: {
              type: 'number',
              description: 'Annual HOA fees',
              minimum: 0,
              default: 0
            },
            property_management: {
              type: 'number',
              description: 'Annual property management fees',
              minimum: 0,
              default: 0
            },
            maintenance: {
              type: 'number',
              description: 'Annual maintenance and repairs',
              minimum: 0,
              default: 0
            },
            utilities: {
              type: 'number',
              description: 'Annual utilities (if owner pays)',
              minimum: 0,
              default: 0
            },
            other: {
              type: 'number',
              description: 'Other annual expenses',
              minimum: 0,
              default: 0
            }
          }
        },
        vacancy_rate: {
          type: 'number',
          description: 'Expected vacancy rate (%)',
          minimum: 0,
          maximum: 100,
          default: 5
        },
        loan_details: {
          type: 'object',
          description: 'Mortgage loan details',
          properties: {
            loan_amount: {
              type: 'number',
              description: 'Loan amount (auto-calculated if not provided)',
              minimum: 0
            },
            interest_rate: {
              type: 'number',
              description: 'Annual interest rate (%)',
              minimum: 0,
              maximum: 20
            },
            loan_term_years: {
              type: 'number',
              description: 'Loan term in years',
              minimum: 1,
              maximum: 40,
              default: 30
            }
          }
        },
        reserve_fund_percent: {
          type: 'number',
          description: 'Percentage of gross income to reserve',
          minimum: 0,
          maximum: 20,
          default: 5
        }
      },
      required: ['purchase_price', 'down_payment', 'annual_rental_income']
    };
  }

  calculate(params, skipScenarios = false) {
    const {
      purchase_price,
      down_payment,
      closing_costs = 0,
      renovation_costs = 0,
      annual_rental_income,
      annual_expenses = {},
      vacancy_rate = 5,
      loan_details = {},
      reserve_fund_percent = 5
    } = params;

    // Calculate total cash invested
    const total_cash_invested = down_payment + closing_costs + renovation_costs;

    // Calculate effective rental income
    const vacancy_loss = annual_rental_income * (vacancy_rate / 100);
    const effective_rental_income = annual_rental_income - vacancy_loss;

    // Calculate total operating expenses
    const operating_expenses = this.calculateOperatingExpenses(annual_expenses);
    const reserve_fund = effective_rental_income * (reserve_fund_percent / 100);
    const total_operating_expenses = operating_expenses + reserve_fund;

    // Calculate NOI (Net Operating Income)
    const noi = effective_rental_income - total_operating_expenses;

    // Calculate debt service if applicable
    let annual_debt_service = 0;
    let loan_amount = 0;
    let monthly_payment = 0;
    
    if (loan_details.interest_rate) {
      loan_amount = loan_details.loan_amount || (purchase_price - down_payment);
      const monthly_rate = loan_details.interest_rate / 100 / 12;
      const num_payments = (loan_details.loan_term_years || 30) * 12;
      
      if (monthly_rate > 0) {
        monthly_payment = loan_amount * (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) / 
                         (Math.pow(1 + monthly_rate, num_payments) - 1);
      } else {
        monthly_payment = loan_amount / num_payments;
      }
      
      annual_debt_service = monthly_payment * 12;
    }

    // Calculate cash flow
    const annual_cash_flow = noi - annual_debt_service;
    const monthly_cash_flow = annual_cash_flow / 12;

    // Calculate Cash-on-Cash Return
    const cocr = (annual_cash_flow / total_cash_invested) * 100;

    // Calculate other important metrics
    const cap_rate = (noi / purchase_price) * 100;
    const gross_rent_multiplier = purchase_price / annual_rental_income;
    const debt_coverage_ratio = annual_debt_service > 0 ? noi / annual_debt_service : null;
    const operating_expense_ratio = (total_operating_expenses / effective_rental_income) * 100;

    // Performance analysis
    const performance = this.analyzePerformance(cocr, cap_rate, debt_coverage_ratio);

    // Monthly breakdown
    const monthly_breakdown = this.createMonthlyBreakdown(
      annual_rental_income,
      vacancy_rate,
      operating_expenses,
      reserve_fund,
      monthly_payment
    );

    // Basic results for scenario analysis
    if (skipScenarios) {
      return {
        cash_flow_analysis: {
          annual_cash_flow: annual_cash_flow
        },
        return_metrics: {
          cash_on_cash_return: cocr
        }
      };
    }

    // Scenario analysis (only if not skipping)
    const scenarios = this.performScenarioAnalysis(
      params,
      total_cash_invested,
      cocr
    );

    // 5-year projection
    const projection = this.createFiveYearProjection(
      params,
      effective_rental_income,
      total_operating_expenses,
      annual_debt_service,
      total_cash_invested
    );

    // Target analysis
    const target_analysis = this.analyzeTargetCashFlow(
      {
        monthly_rent_per_unit: annual_rental_income / 12,
        total_units: 1,
        other_monthly_income: 0
      },
      (operating_expenses + reserve_fund) / 12,
      {
        vacancy_rate: vacancy_rate,
        maintenance_percent: 0,
        management_percent: 0
      },
      params.target_cash_flow || 0
    );

    // Risk assessment
    const risk_assessment = this.assessRisk(
      {
        occupancy_rate: 100 - vacancy_rate
      },
      { rent_elasticity: 1.0, cost_elasticity: 1.0 },
      { total_units: 1 }
    );

    return {
      investment_summary: {
        purchase_price: purchase_price,
        total_cash_invested: parseFloat(total_cash_invested.toFixed(2)),
        down_payment: down_payment,
        closing_costs: closing_costs,
        renovation_costs: renovation_costs,
        loan_amount: parseFloat(loan_amount.toFixed(2))
      },
      income_analysis: {
        gross_annual_income: annual_rental_income,
        vacancy_loss: parseFloat(vacancy_loss.toFixed(2)),
        effective_annual_income: parseFloat(effective_rental_income.toFixed(2)),
        monthly_income: parseFloat((effective_rental_income / 12).toFixed(2))
      },
      expense_analysis: {
        operating_expenses: parseFloat(operating_expenses.toFixed(2)),
        reserve_fund: parseFloat(reserve_fund.toFixed(2)),
        total_expenses: parseFloat(total_operating_expenses.toFixed(2)),
        expense_breakdown: this.formatExpenseBreakdown(annual_expenses),
        operating_expense_ratio: parseFloat(operating_expense_ratio.toFixed(2))
      },
      cash_flow_analysis: {
        net_operating_income: parseFloat(noi.toFixed(2)),
        annual_debt_service: parseFloat(annual_debt_service.toFixed(2)),
        annual_cash_flow: parseFloat(annual_cash_flow.toFixed(2)),
        monthly_cash_flow: parseFloat(monthly_cash_flow.toFixed(2)),
        cash_flow_per_unit: annual_cash_flow
      },
      return_metrics: {
        cash_on_cash_return: parseFloat(cocr.toFixed(2)),
        cap_rate: parseFloat(cap_rate.toFixed(2)),
        gross_rent_multiplier: parseFloat(gross_rent_multiplier.toFixed(2)),
        debt_coverage_ratio: debt_coverage_ratio ? parseFloat(debt_coverage_ratio.toFixed(2)) : null,
        annual_roi: parseFloat(cocr.toFixed(2)),
        payback_period_years: parseFloat((100 / cocr).toFixed(1))
      },
      performance_rating: performance,
      monthly_breakdown: monthly_breakdown,
      scenario_analysis: scenarios,
      five_year_projection: projection,
      recommendations: this.generateRecommendations(
        cocr,
        cap_rate,
        debt_coverage_ratio,
        monthly_cash_flow,
        operating_expense_ratio
      )
    };
  }

  calculateOperatingExpenses(expenses) {
    return Object.values(expenses).reduce((sum, expense) => sum + (expense || 0), 0);
  }

  formatExpenseBreakdown(expenses) {
    const breakdown = [];
    const expenseNames = {
      property_tax: 'Property Tax',
      insurance: 'Insurance',
      hoa_fees: 'HOA Fees',
      property_management: 'Property Management',
      maintenance: 'Maintenance & Repairs',
      utilities: 'Utilities',
      other: 'Other Expenses'
    };

    Object.entries(expenses).forEach(([key, value]) => {
      if (value > 0) {
        breakdown.push({
          category: expenseNames[key] || key,
          annual_amount: value,
          monthly_amount: parseFloat((value / 12).toFixed(2)),
          percentage: 0
        });
      }
    });

    // Calculate percentages
    const total = breakdown.reduce((sum, item) => sum + item.annual_amount, 0);
    breakdown.forEach(item => {
      item.percentage = parseFloat(((item.annual_amount / total) * 100).toFixed(1));
    });

    return breakdown;
  }

  analyzePerformance(cocr, capRate, dscr) {
    let rating = '';
    let description = '';
    const factors = [];

    // COCR Analysis
    if (cocr >= 12) {
      factors.push({ factor: 'Cash-on-Cash Return', rating: 'Excellent', value: `${cocr.toFixed(1)}%` });
    } else if (cocr >= 8) {
      factors.push({ factor: 'Cash-on-Cash Return', rating: 'Good', value: `${cocr.toFixed(1)}%` });
    } else if (cocr >= 5) {
      factors.push({ factor: 'Cash-on-Cash Return', rating: 'Fair', value: `${cocr.toFixed(1)}%` });
    } else if (cocr >= 0) {
      factors.push({ factor: 'Cash-on-Cash Return', rating: 'Poor', value: `${cocr.toFixed(1)}%` });
    } else {
      factors.push({ factor: 'Cash-on-Cash Return', rating: 'Negative', value: `${cocr.toFixed(1)}%` });
    }

    // Cap Rate Analysis
    if (capRate >= 10) {
      factors.push({ factor: 'Cap Rate', rating: 'Excellent', value: `${capRate.toFixed(1)}%` });
    } else if (capRate >= 7) {
      factors.push({ factor: 'Cap Rate', rating: 'Good', value: `${capRate.toFixed(1)}%` });
    } else if (capRate >= 5) {
      factors.push({ factor: 'Cap Rate', rating: 'Fair', value: `${capRate.toFixed(1)}%` });
    } else {
      factors.push({ factor: 'Cap Rate', rating: 'Poor', value: `${capRate.toFixed(1)}%` });
    }

    // DSCR Analysis
    if (dscr) {
      if (dscr >= 1.5) {
        factors.push({ factor: 'Debt Coverage', rating: 'Excellent', value: dscr.toFixed(2) });
      } else if (dscr >= 1.25) {
        factors.push({ factor: 'Debt Coverage', rating: 'Good', value: dscr.toFixed(2) });
      } else if (dscr >= 1.0) {
        factors.push({ factor: 'Debt Coverage', rating: 'Fair', value: dscr.toFixed(2) });
      } else {
        factors.push({ factor: 'Debt Coverage', rating: 'Poor', value: dscr.toFixed(2) });
      }
    }

    // Overall rating
    const excellentCount = factors.filter(f => f.rating === 'Excellent').length;
    const goodCount = factors.filter(f => f.rating === 'Good').length;
    const poorCount = factors.filter(f => f.rating === 'Poor' || f.rating === 'Negative').length;

    if (excellentCount >= 2) {
      rating = 'Excellent Investment';
      description = 'Strong returns across multiple metrics';
    } else if (goodCount >= 2 && poorCount === 0) {
      rating = 'Good Investment';
      description = 'Solid returns with acceptable risk';
    } else if (poorCount >= 2) {
      rating = 'Poor Investment';
      description = 'Below-market returns or high risk';
    } else {
      rating = 'Fair Investment';
      description = 'Mixed performance, requires careful consideration';
    }

    return {
      overall_rating: rating,
      description: description,
      factor_analysis: factors
    };
  }

  createMonthlyBreakdown(annualIncome, vacancyRate, operatingExpenses, reserveFund, monthlyDebtService) {
    const monthlyGrossIncome = annualIncome / 12;
    const monthlyVacancyLoss = monthlyGrossIncome * (vacancyRate / 100);
    const monthlyEffectiveIncome = monthlyGrossIncome - monthlyVacancyLoss;
    const monthlyOperatingExpenses = operatingExpenses / 12;
    const monthlyReserves = reserveFund / 12;
    const monthlyNOI = monthlyEffectiveIncome - monthlyOperatingExpenses - monthlyReserves;
    const monthlyCashFlow = monthlyNOI - monthlyDebtService;

    return {
      gross_income: parseFloat(monthlyGrossIncome.toFixed(2)),
      vacancy_loss: parseFloat(monthlyVacancyLoss.toFixed(2)),
      effective_income: parseFloat(monthlyEffectiveIncome.toFixed(2)),
      operating_expenses: parseFloat(monthlyOperatingExpenses.toFixed(2)),
      reserves: parseFloat(monthlyReserves.toFixed(2)),
      net_operating_income: parseFloat(monthlyNOI.toFixed(2)),
      debt_service: parseFloat(monthlyDebtService.toFixed(2)),
      cash_flow: parseFloat(monthlyCashFlow.toFixed(2))
    };
  }

  performScenarioAnalysis(originalParams, totalCashInvested, baseCOCR) {
    const scenarios = [];

    // Vacancy rate scenarios
    const vacancyRates = [0, 5, 10, 15, 20];
    vacancyRates.forEach(rate => {
      const modifiedParams = { ...originalParams, vacancy_rate: rate };
      const result = this.calculate(modifiedParams, true); // Skip scenarios to avoid recursion
      scenarios.push({
        type: 'Vacancy Rate',
        scenario: `${rate}% Vacancy`,
        cash_flow: result.cash_flow_analysis.annual_cash_flow,
        cocr: result.return_metrics.cash_on_cash_return,
        impact: result.return_metrics.cash_on_cash_return - baseCOCR
      });
    });

    // Rent increase scenarios
    const rentMultipliers = [0.9, 0.95, 1.0, 1.05, 1.1];
    rentMultipliers.forEach(multiplier => {
      const modifiedParams = { 
        ...originalParams, 
        annual_rental_income: originalParams.annual_rental_income * multiplier 
      };
      const result = this.calculate(modifiedParams, true); // Skip scenarios to avoid recursion
      scenarios.push({
        type: 'Rent Change',
        scenario: `${((multiplier - 1) * 100).toFixed(0)}% Rent Change`,
        cash_flow: result.cash_flow_analysis.annual_cash_flow,
        cocr: result.return_metrics.cash_on_cash_return,
        impact: result.return_metrics.cash_on_cash_return - baseCOCR
      });
    });

    // Interest rate scenarios (if financed)
    if (originalParams.loan_details?.interest_rate) {
      const baseRate = originalParams.loan_details.interest_rate;
      const rateAdjustments = [-1, -0.5, 0, 0.5, 1];
      
      rateAdjustments.forEach(adjustment => {
        const modifiedParams = {
          ...originalParams,
          loan_details: {
            ...originalParams.loan_details,
            interest_rate: baseRate + adjustment
          }
        };
        const result = this.calculate(modifiedParams, true); // Skip scenarios to avoid recursion
        scenarios.push({
          type: 'Interest Rate',
          scenario: `${(baseRate + adjustment).toFixed(2)}% Rate`,
          cash_flow: result.cash_flow_analysis.annual_cash_flow,
          cocr: result.return_metrics.cash_on_cash_return,
          impact: result.return_metrics.cash_on_cash_return - baseCOCR
        });
      });
    }

    return scenarios;
  }

  createFiveYearProjection(params, baseIncome, baseExpenses, debtService, totalCashInvested) {
    const projection = [];
    const rentGrowthRate = 0.03;
    const expenseGrowthRate = 0.025;
    const appreciationRate = 0.04;

    let currentIncome = baseIncome;
    let currentExpenses = baseExpenses;
    let currentValue = params.purchase_price;
    let cumulativeCashFlow = 0;

    for (let year = 1; year <= 5; year++) {
      if (year > 1) {
        currentIncome *= (1 + rentGrowthRate);
        currentExpenses *= (1 + expenseGrowthRate);
        currentValue *= (1 + appreciationRate);
      }

      const noi = currentIncome - currentExpenses;
      const cashFlow = noi - debtService;
      cumulativeCashFlow += cashFlow;
      const cocr = (cashFlow / totalCashInvested) * 100;

      projection.push({
        year: year,
        rental_income: parseFloat(currentIncome.toFixed(2)),
        operating_expenses: parseFloat(currentExpenses.toFixed(2)),
        noi: parseFloat(noi.toFixed(2)),
        cash_flow: parseFloat(cashFlow.toFixed(2)),
        cumulative_cash_flow: parseFloat(cumulativeCashFlow.toFixed(2)),
        cocr: parseFloat(cocr.toFixed(2)),
        property_value: parseFloat(currentValue.toFixed(2)),
        total_return: parseFloat(((cumulativeCashFlow + (currentValue - params.purchase_price)) / totalCashInvested * 100).toFixed(2))
      });
    }

    return projection;
  }

  analyzeTargetCashFlow(revenue, fixedCosts, variableCosts, targetCashFlow) {
    return null; // Simplified for now
  }

  assessRisk(breakeven, sensitivity, revenue) {
    const riskFactors = [];
    let riskScore = 0;

    // Basic risk assessment
    if (breakeven.occupancy_rate < 70) {
      riskScore = 1;
    } else if (breakeven.occupancy_rate < 85) {
      riskScore = 2;
    } else {
      riskScore = 3;
    }

    let overallRisk;
    if (riskScore >= 3) {
      overallRisk = 'Moderate Risk';
    } else if (riskScore >= 2) {
      overallRisk = 'Low Risk';
    } else {
      overallRisk = 'Very Low Risk';
    }

    return {
      overall_risk: overallRisk,
      risk_score: riskScore,
      risk_factors: riskFactors,
      breakeven_margin: parseFloat((100 - breakeven.occupancy_rate).toFixed(1))
    };
  }

  generateRecommendations(cocr, capRate, dscr, monthlyCashFlow, expenseRatio) {
    const recommendations = [];

    // COCR-based recommendations
    if (cocr < 5) {
      recommendations.push({
        type: 'Warning',
        category: 'Returns',
        message: `Low ${cocr.toFixed(1)}% cash-on-cash return`,
        action: 'Consider negotiating price, reducing expenses, or finding higher-yield properties'
      });
    } else if (cocr > 15) {
      recommendations.push({
        type: 'Positive',
        category: 'Returns',
        message: `Excellent ${cocr.toFixed(1)}% cash-on-cash return`,
        action: 'Verify all assumptions as returns are exceptionally high'
      });
    }

    // Cash flow recommendations
    if (monthlyCashFlow < 200) {
      recommendations.push({
        type: 'Caution',
        category: 'Cash Flow',
        message: `Thin monthly cash flow of $${monthlyCashFlow.toFixed(0)}`,
        action: 'Build larger reserves for unexpected expenses'
      });
    } else if (monthlyCashFlow < 0) {
      recommendations.push({
        type: 'Warning',
        category: 'Cash Flow',
        message: 'Negative monthly cash flow',
        action: 'Property requires monthly subsidy - only proceed if appreciation is certain'
      });
    }

    // DSCR recommendations
    if (dscr && dscr < 1.2) {
      recommendations.push({
        type: 'Caution',
        category: 'Debt Coverage',
        message: `Low debt coverage ratio of ${dscr.toFixed(2)}`,
        action: 'Limited cushion for vacancy or expense increases'
      });
    }

    // Expense ratio recommendations
    if (expenseRatio > 50) {
      recommendations.push({
        type: 'Warning',
        category: 'Expenses',
        message: `High expense ratio of ${expenseRatio.toFixed(1)}%`,
        action: 'Review all expenses for potential reductions'
      });
    }

    // Cap rate comparison
    if (capRate < 6) {
      recommendations.push({
        type: 'Info',
        category: 'Market',
        message: `Low ${capRate.toFixed(1)}% cap rate suggests expensive market`,
        action: 'Ensure strong appreciation potential to justify low current yield'
      });
    }

    // General best practices
    recommendations.push({
      type: 'Best Practice',
      category: 'Risk Management',
      message: 'Maintain 6-month expense reserve',
      action: 'Set aside funds for maintenance, vacancy, and emergencies'
    });

    return recommendations;
  }
}