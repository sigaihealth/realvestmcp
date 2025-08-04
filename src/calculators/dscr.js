export class DSCRCalculator {
  constructor() {
    this.name = 'DSCR Calculator';
    this.description = 'Calculate Debt Service Coverage Ratio for investment property loans';
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        property_income: {
          type: 'object',
          description: 'Property income details',
          properties: {
            monthly_rent: {
              type: 'number',
              description: 'Total monthly rental income',
              minimum: 0
            },
            other_monthly_income: {
              type: 'number',
              description: 'Other monthly income (parking, laundry, etc.)',
              minimum: 0,
              default: 0
            },
            vacancy_rate: {
              type: 'number',
              description: 'Expected vacancy rate (%)',
              minimum: 0,
              maximum: 50,
              default: 5
            }
          },
          required: ['monthly_rent']
        },
        property_expenses: {
          type: 'object',
          description: 'Monthly operating expenses',
          properties: {
            property_tax: {
              type: 'number',
              description: 'Monthly property tax',
              minimum: 0,
              default: 0
            },
            insurance: {
              type: 'number',
              description: 'Monthly insurance',
              minimum: 0,
              default: 0
            },
            hoa: {
              type: 'number',
              description: 'Monthly HOA fees',
              minimum: 0,
              default: 0
            },
            property_management: {
              type: 'number',
              description: 'Monthly property management',
              minimum: 0,
              default: 0
            },
            maintenance_reserve: {
              type: 'number',
              description: 'Monthly maintenance reserve',
              minimum: 0,
              default: 0
            },
            utilities: {
              type: 'number',
              description: 'Monthly utilities (if owner pays)',
              minimum: 0,
              default: 0
            },
            other: {
              type: 'number',
              description: 'Other monthly expenses',
              minimum: 0,
              default: 0
            }
          }
        },
        loan_details: {
          type: 'object',
          description: 'Loan information',
          properties: {
            loan_amount: {
              type: 'number',
              description: 'Total loan amount',
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
            },
            loan_type: {
              type: 'string',
              description: 'Type of loan',
              enum: ['conventional', 'dscr', 'portfolio', 'commercial'],
              default: 'dscr'
            }
          },
          required: ['loan_amount', 'interest_rate']
        },
        property_details: {
          type: 'object',
          description: 'Property information',
          properties: {
            purchase_price: {
              type: 'number',
              description: 'Property purchase price',
              minimum: 0
            },
            property_type: {
              type: 'string',
              description: 'Type of property',
              enum: ['single_family', 'multi_family', 'condo', 'commercial'],
              default: 'single_family'
            },
            units: {
              type: 'number',
              description: 'Number of rental units',
              minimum: 1,
              default: 1
            }
          }
        }
      },
      required: ['property_income', 'loan_details']
    };
  }

  calculate(params, skipStressTests = false) {
    const {
      property_income,
      property_expenses = {},
      loan_details,
      property_details = {}
    } = params;

    // Calculate effective gross income
    const gross_monthly_income = property_income.monthly_rent + (property_income.other_monthly_income || 0);
    const vacancy_loss = gross_monthly_income * ((property_income.vacancy_rate || 5) / 100);
    const effective_gross_income = gross_monthly_income - vacancy_loss;
    const annual_effective_income = effective_gross_income * 12;

    // Calculate total operating expenses
    const monthly_expenses = this.calculateMonthlyExpenses(property_expenses);
    const annual_expenses = monthly_expenses * 12;

    // Calculate Net Operating Income (NOI)
    const monthly_noi = effective_gross_income - monthly_expenses;
    const annual_noi = monthly_noi * 12;

    // Calculate debt service
    const monthly_payment = this.calculateMonthlyPayment(
      loan_details.loan_amount,
      loan_details.interest_rate / 100 / 12,
      (loan_details.loan_term_years || 30) * 12
    );
    const annual_debt_service = monthly_payment * 12;

    // Calculate DSCR
    const dscr = annual_debt_service > 0 ? annual_noi / annual_debt_service : 0;

    // Calculate other important metrics
    const monthly_cash_flow = monthly_noi - monthly_payment;
    const annual_cash_flow = monthly_cash_flow * 12;
    
    // LTV if purchase price provided
    let ltv_ratio = null;
    let down_payment = null;
    if (property_details.purchase_price) {
      ltv_ratio = (loan_details.loan_amount / property_details.purchase_price) * 100;
      down_payment = property_details.purchase_price - loan_details.loan_amount;
    }

    // Loan qualification analysis
    const qualification = this.analyzeLoanQualification(dscr, loan_details.loan_type);

    // Maximum loan analysis
    const max_loan_analysis = this.calculateMaximumLoan(
      annual_noi,
      loan_details.interest_rate,
      loan_details.loan_term_years || 30,
      loan_details.loan_type
    );

    // Stress test scenarios (skip if called from within stress test)
    const stress_tests = skipStressTests ? null : this.performStressTests(
      property_income,
      property_expenses,
      loan_details,
      dscr
    );

    // Break-even analysis
    const break_even = this.calculateBreakEvenAnalysis(
      gross_monthly_income,
      monthly_expenses,
      monthly_payment
    );

    // Property performance metrics
    const performance_metrics = this.calculatePerformanceMetrics(
      property_details.purchase_price,
      annual_noi,
      annual_cash_flow,
      down_payment
    );

    return {
      income_analysis: {
        gross_monthly_income: parseFloat(gross_monthly_income.toFixed(2)),
        vacancy_loss: parseFloat(vacancy_loss.toFixed(2)),
        effective_monthly_income: parseFloat(effective_gross_income.toFixed(2)),
        annual_effective_income: parseFloat(annual_effective_income.toFixed(2))
      },
      expense_analysis: {
        monthly_expenses: parseFloat(monthly_expenses.toFixed(2)),
        annual_expenses: parseFloat(annual_expenses.toFixed(2)),
        expense_breakdown: this.formatExpenseBreakdown(property_expenses, monthly_expenses),
        expense_ratio: parseFloat(((monthly_expenses / effective_gross_income) * 100).toFixed(2))
      },
      noi_analysis: {
        monthly_noi: parseFloat(monthly_noi.toFixed(2)),
        annual_noi: parseFloat(annual_noi.toFixed(2)),
        noi_margin: parseFloat(((annual_noi / annual_effective_income) * 100).toFixed(2))
      },
      debt_service: {
        monthly_payment: parseFloat(monthly_payment.toFixed(2)),
        annual_debt_service: parseFloat(annual_debt_service.toFixed(2)),
        principal_and_interest: this.breakdownPayment(
          loan_details.loan_amount,
          loan_details.interest_rate / 100 / 12,
          monthly_payment
        )
      },
      dscr_analysis: {
        dscr_ratio: parseFloat(dscr.toFixed(3)),
        dscr_interpretation: this.interpretDSCR(dscr),
        monthly_cash_flow: parseFloat(monthly_cash_flow.toFixed(2)),
        annual_cash_flow: parseFloat(annual_cash_flow.toFixed(2)),
        cash_flow_margin: monthly_noi > 0 ? parseFloat(((monthly_cash_flow / monthly_noi) * 100).toFixed(2)) : 0
      },
      loan_metrics: {
        loan_amount: loan_details.loan_amount,
        ltv_ratio: ltv_ratio ? parseFloat(ltv_ratio.toFixed(2)) : null,
        loan_constant: parseFloat(((annual_debt_service / loan_details.loan_amount) * 100).toFixed(3)),
        debt_yield: parseFloat(((annual_noi / loan_details.loan_amount) * 100).toFixed(2))
      },
      qualification_analysis: qualification,
      maximum_loan_analysis: max_loan_analysis,
      stress_test_results: stress_tests,
      break_even_analysis: break_even,
      performance_metrics: performance_metrics,
      recommendations: this.generateRecommendations(
        dscr,
        monthly_cash_flow,
        qualification,
        stress_tests
      )
    };
  }

  calculateMonthlyExpenses(expenses) {
    return Object.values(expenses).reduce((sum, expense) => sum + (expense || 0), 0);
  }

  calculateMonthlyPayment(principal, monthlyRate, numPayments) {
    if (monthlyRate === 0) {
      return principal / numPayments;
    }
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  formatExpenseBreakdown(expenses, totalMonthly) {
    const breakdown = [];
    const expenseNames = {
      property_tax: 'Property Tax',
      insurance: 'Insurance',
      hoa: 'HOA Fees',
      property_management: 'Property Management',
      maintenance_reserve: 'Maintenance Reserve',
      utilities: 'Utilities',
      other: 'Other Expenses'
    };

    Object.entries(expenses).forEach(([key, value]) => {
      if (value > 0) {
        breakdown.push({
          category: expenseNames[key] || key,
          monthly_amount: value,
          annual_amount: value * 12,
          percentage: totalMonthly > 0 ? parseFloat(((value / totalMonthly) * 100).toFixed(1)) : 0
        });
      }
    });

    return breakdown.sort((a, b) => b.monthly_amount - a.monthly_amount);
  }

  breakdownPayment(loanAmount, monthlyRate, monthlyPayment) {
    const firstMonthInterest = loanAmount * monthlyRate;
    const firstMonthPrincipal = monthlyPayment - firstMonthInterest;
    
    return {
      first_month_principal: parseFloat(firstMonthPrincipal.toFixed(2)),
      first_month_interest: parseFloat(firstMonthInterest.toFixed(2)),
      principal_percentage: parseFloat(((firstMonthPrincipal / monthlyPayment) * 100).toFixed(1)),
      interest_percentage: parseFloat(((firstMonthInterest / monthlyPayment) * 100).toFixed(1))
    };
  }

  interpretDSCR(dscr) {
    if (dscr >= 1.5) {
      return "Excellent - Strong coverage with significant cushion";
    } else if (dscr >= 1.25) {
      return "Good - Comfortable coverage for most lenders";
    } else if (dscr >= 1.2) {
      return "Acceptable - Meets minimum for many DSCR loans";
    } else if (dscr >= 1.0) {
      return "Marginal - Property breaks even on debt service";
    } else {
      return "Poor - Insufficient income to cover debt service";
    }
  }

  analyzeLoanQualification(dscr, loanType) {
    const requirements = {
      conventional: { min_dscr: 1.25, typical_dscr: 1.35 },
      dscr: { min_dscr: 1.0, typical_dscr: 1.2 },
      portfolio: { min_dscr: 1.2, typical_dscr: 1.25 },
      commercial: { min_dscr: 1.25, typical_dscr: 1.35 }
    };

    const req = requirements[loanType] || requirements.dscr;
    const qualifies = dscr >= req.min_dscr;
    const strong_candidate = dscr >= req.typical_dscr;

    let qualification_status;
    let explanation;

    if (dscr >= req.typical_dscr) {
      qualification_status = "Strong Candidate";
      explanation = `DSCR of ${dscr.toFixed(3)} exceeds typical requirement of ${req.typical_dscr}`;
    } else if (dscr >= req.min_dscr) {
      qualification_status = "Likely Qualifies";
      explanation = `DSCR of ${dscr.toFixed(3)} meets minimum requirement of ${req.min_dscr}`;
    } else if (dscr >= req.min_dscr * 0.95) {
      qualification_status = "Borderline";
      explanation = `DSCR of ${dscr.toFixed(3)} is slightly below minimum of ${req.min_dscr}`;
    } else {
      qualification_status = "Unlikely to Qualify";
      explanation = `DSCR of ${dscr.toFixed(3)} is well below minimum of ${req.min_dscr}`;
    }

    return {
      loan_type: loanType,
      qualifies: qualifies,
      qualification_status: qualification_status,
      explanation: explanation,
      minimum_dscr_required: req.min_dscr,
      typical_dscr_required: req.typical_dscr,
      dscr_surplus: parseFloat((dscr - req.min_dscr).toFixed(3)),
      improvement_needed: !qualifies ? parseFloat((req.min_dscr - dscr).toFixed(3)) : 0
    };
  }

  calculateMaximumLoan(annualNOI, interestRate, termYears, loanType) {
    const requirements = {
      conventional: 1.25,
      dscr: 1.0,
      portfolio: 1.2,
      commercial: 1.25
    };

    const minDSCR = requirements[loanType] || 1.2;
    const maxAnnualDebtService = annualNOI / minDSCR;
    const monthlyPayment = maxAnnualDebtService / 12;

    // Calculate maximum loan amount
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = termYears * 12;
    
    let maxLoanAmount;
    if (monthlyRate === 0) {
      maxLoanAmount = monthlyPayment * numPayments;
    } else {
      maxLoanAmount = monthlyPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / 
                     (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
    }

    return {
      maximum_loan_amount: parseFloat(maxLoanAmount.toFixed(2)),
      required_dscr: minDSCR,
      max_monthly_payment: parseFloat(monthlyPayment.toFixed(2)),
      max_annual_debt_service: parseFloat(maxAnnualDebtService.toFixed(2)),
      assumptions: {
        interest_rate: interestRate,
        term_years: termYears,
        loan_type: loanType
      }
    };
  }

  performStressTests(income, expenses, loanDetails, baseDSCR) {
    const scenarios = [];

    // Vacancy stress tests
    const vacancyRates = [5, 10, 15, 20, 25];
    vacancyRates.forEach(rate => {
      const stressedIncome = { ...income, vacancy_rate: rate };
      const result = this.calculate({
        property_income: stressedIncome,
        property_expenses: expenses,
        loan_details: loanDetails
      }, true); // Skip nested stress tests
      
      scenarios.push({
        scenario_type: 'Vacancy Rate',
        scenario: `${rate}% Vacancy`,
        dscr: result.dscr_analysis.dscr_ratio,
        monthly_cash_flow: result.dscr_analysis.monthly_cash_flow,
        passes_minimum: result.dscr_analysis.dscr_ratio >= 1.0,
        impact_on_dscr: parseFloat((result.dscr_analysis.dscr_ratio - baseDSCR).toFixed(3))
      });
    });

    // Expense increase stress tests
    const expenseMultipliers = [1.0, 1.1, 1.2, 1.3, 1.4];
    expenseMultipliers.forEach(multiplier => {
      const stressedExpenses = {};
      Object.entries(expenses).forEach(([key, value]) => {
        stressedExpenses[key] = value * multiplier;
      });
      
      const result = this.calculate({
        property_income: income,
        property_expenses: stressedExpenses,
        loan_details: loanDetails
      }, true); // Skip nested stress tests
      
      scenarios.push({
        scenario_type: 'Expense Increase',
        scenario: `${((multiplier - 1) * 100).toFixed(0)}% Expense Increase`,
        dscr: result.dscr_analysis.dscr_ratio,
        monthly_cash_flow: result.dscr_analysis.monthly_cash_flow,
        passes_minimum: result.dscr_analysis.dscr_ratio >= 1.0,
        impact_on_dscr: parseFloat((result.dscr_analysis.dscr_ratio - baseDSCR).toFixed(3))
      });
    });

    // Combined stress test (10% vacancy + 10% expense increase)
    const combinedStressedIncome = { ...income, vacancy_rate: 10 };
    const combinedStressedExpenses = {};
    Object.entries(expenses).forEach(([key, value]) => {
      combinedStressedExpenses[key] = value * 1.1;
    });
    
    const combinedResult = this.calculate({
      property_income: combinedStressedIncome,
      property_expenses: combinedStressedExpenses,
      loan_details: loanDetails
    }, true); // Skip nested stress tests
    
    scenarios.push({
      scenario_type: 'Combined Stress',
      scenario: '10% Vacancy + 10% Expense Increase',
      dscr: combinedResult.dscr_analysis.dscr_ratio,
      monthly_cash_flow: combinedResult.dscr_analysis.monthly_cash_flow,
      passes_minimum: combinedResult.dscr_analysis.dscr_ratio >= 1.0,
      impact_on_dscr: parseFloat((combinedResult.dscr_analysis.dscr_ratio - baseDSCR).toFixed(3))
    });

    return {
      scenarios: scenarios,
      worst_case: scenarios.reduce((worst, current) => 
        current.dscr < worst.dscr ? current : worst
      ),
      resilience_score: this.calculateResilienceScore(scenarios)
    };
  }

  calculateResilienceScore(scenarios) {
    const passingScenarios = scenarios.filter(s => s.passes_minimum).length;
    const totalScenarios = scenarios.length;
    const score = (passingScenarios / totalScenarios) * 100;

    let rating;
    if (score >= 90) {
      rating = "Highly Resilient";
    } else if (score >= 70) {
      rating = "Moderately Resilient";
    } else if (score >= 50) {
      rating = "Average Resilience";
    } else {
      rating = "Low Resilience";
    }

    return {
      score: parseFloat(score.toFixed(1)),
      rating: rating,
      passing_scenarios: passingScenarios,
      total_scenarios: totalScenarios
    };
  }

  calculateBreakEvenAnalysis(grossIncome, expenses, debtService) {
    const totalCosts = expenses + debtService;
    const breakEvenOccupancy = (totalCosts / grossIncome) * 100;
    const currentMargin = grossIncome - totalCosts;
    const marginPercent = (currentMargin / grossIncome) * 100;

    // Calculate how much rent can drop
    const maxRentDecrease = currentMargin;
    const maxRentDecreasePercent = (maxRentDecrease / grossIncome) * 100;

    // Calculate how much expenses can increase
    const maxExpenseIncrease = currentMargin;
    const maxExpenseIncreasePercent = expenses > 0 ? (maxExpenseIncrease / expenses) * 100 : 0;

    return {
      break_even_occupancy: parseFloat(breakEvenOccupancy.toFixed(1)),
      current_margin: parseFloat(currentMargin.toFixed(2)),
      margin_percentage: parseFloat(marginPercent.toFixed(1)),
      max_rent_decrease: {
        amount: parseFloat(maxRentDecrease.toFixed(2)),
        percentage: parseFloat(maxRentDecreasePercent.toFixed(1))
      },
      max_expense_increase: {
        amount: parseFloat(maxExpenseIncrease.toFixed(2)),
        percentage: parseFloat(maxExpenseIncreasePercent.toFixed(1))
      }
    };
  }

  calculatePerformanceMetrics(purchasePrice, annualNOI, annualCashFlow, downPayment) {
    if (!purchasePrice) {
      return null;
    }

    const capRate = (annualNOI / purchasePrice) * 100;
    const cashOnCash = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;
    const grossRentMultiplier = purchasePrice / (annualNOI + annualCashFlow);

    return {
      cap_rate: parseFloat(capRate.toFixed(2)),
      cash_on_cash_return: parseFloat(cashOnCash.toFixed(2)),
      gross_rent_multiplier: parseFloat(grossRentMultiplier.toFixed(2)),
      annual_roi: parseFloat(cashOnCash.toFixed(2))
    };
  }

  generateRecommendations(dscr, monthlyCashFlow, qualification, stressTests) {
    const recommendations = [];

    // DSCR-based recommendations
    if (dscr < 1.0) {
      recommendations.push({
        type: 'Critical',
        category: 'DSCR',
        message: 'Property has negative cash flow',
        action: 'Increase rents, reduce expenses, or negotiate better loan terms'
      });
    } else if (dscr < 1.2) {
      recommendations.push({
        type: 'Warning',
        category: 'DSCR',
        message: `DSCR of ${dscr.toFixed(3)} provides minimal cushion`,
        action: 'Build reserves and avoid additional leverage'
      });
    } else if (dscr > 1.5) {
      recommendations.push({
        type: 'Positive',
        category: 'DSCR',
        message: `Strong DSCR of ${dscr.toFixed(3)}`,
        action: 'Consider leveraging equity for additional investments'
      });
    }

    // Qualification recommendations
    if (!qualification.qualifies) {
      recommendations.push({
        type: 'Action Required',
        category: 'Loan Qualification',
        message: `Need DSCR improvement of ${qualification.improvement_needed.toFixed(3)}`,
        action: 'Increase rents or reduce loan amount to qualify'
      });
    }

    // Stress test recommendations
    if (stressTests && stressTests.worst_case) {
      const worstCase = stressTests.worst_case;
      if (worstCase.dscr < 1.0) {
        recommendations.push({
          type: 'Risk Alert',
          category: 'Stress Testing',
          message: `Property fails under ${worstCase.scenario} scenario`,
          action: 'Maintain larger reserves or improve property resilience'
        });
      }
    }

    // Cash flow recommendations
    if (monthlyCashFlow < 200) {
      recommendations.push({
        type: 'Caution',
        category: 'Cash Flow',
        message: `Thin monthly cash flow of $${monthlyCashFlow.toFixed(0)}`,
        action: 'Any maintenance issue could create negative cash flow'
      });
    }

    // Resilience recommendations
    if (stressTests && stressTests.resilience_score && stressTests.resilience_score.score < 70) {
      recommendations.push({
        type: 'Warning',
        category: 'Resilience',
        message: `Low resilience score of ${stressTests.resilience_score.score}%`,
        action: 'Property vulnerable to market changes - maintain higher reserves'
      });
    }

    return recommendations;
  }
}