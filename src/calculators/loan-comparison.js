export class LoanComparisonTool {
  constructor() {
    this.name = 'Loan Comparison Tool';
    this.description = 'Compare multiple mortgage loan scenarios side by side';
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        home_price: {
          type: 'number',
          description: 'Purchase price of the home',
          minimum: 0
        },
        loans: {
          type: 'array',
          description: 'Array of loan scenarios to compare (2-4 loans)',
          minItems: 2,
          maxItems: 4,
          items: {
            type: 'object',
            properties: {
              loan_name: {
                type: 'string',
                description: 'Name/label for this loan option'
              },
              down_payment_percent: {
                type: 'number',
                description: 'Down payment percentage',
                minimum: 0,
                maximum: 100
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
                enum: [10, 15, 20, 25, 30]
              },
              loan_type: {
                type: 'string',
                description: 'Type of loan',
                enum: ['conventional', 'fha', 'va', 'usda', 'jumbo', 'arm'],
                default: 'conventional'
              },
              points: {
                type: 'number',
                description: 'Discount points to buy down rate',
                minimum: 0,
                maximum: 4,
                default: 0
              },
              pmi_rate: {
                type: 'number',
                description: 'PMI rate (% of loan amount annually)',
                minimum: 0,
                maximum: 2,
                default: 0
              },
              arm_details: {
                type: 'object',
                description: 'ARM-specific details (if loan_type is ARM)',
                properties: {
                  fixed_period_years: {
                    type: 'number',
                    description: 'Initial fixed rate period',
                    enum: [3, 5, 7, 10]
                  },
                  adjustment_cap: {
                    type: 'number',
                    description: 'Max rate adjustment per period (%)',
                    default: 2
                  },
                  lifetime_cap: {
                    type: 'number',
                    description: 'Max lifetime rate increase (%)',
                    default: 5
                  }
                }
              }
            },
            required: ['loan_name', 'down_payment_percent', 'interest_rate', 'loan_term_years']
          }
        },
        property_tax_annual: {
          type: 'number',
          description: 'Annual property tax amount',
          minimum: 0,
          default: 0
        },
        home_insurance_annual: {
          type: 'number',
          description: 'Annual homeowners insurance',
          minimum: 0,
          default: 0
        },
        hoa_monthly: {
          type: 'number',
          description: 'Monthly HOA fees',
          minimum: 0,
          default: 0
        },
        comparison_period_years: {
          type: 'number',
          description: 'Years to compare total costs',
          minimum: 1,
          maximum: 30,
          default: 5
        }
      },
      required: ['home_price', 'loans']
    };
  }

  calculate(params) {
    const {
      home_price,
      loans,
      property_tax_annual = 0,
      home_insurance_annual = 0,
      hoa_monthly = 0,
      comparison_period_years = 5
    } = params;

    // Calculate details for each loan
    const loanDetails = loans.map(loan => this.calculateLoanDetails(
      home_price,
      loan,
      property_tax_annual,
      home_insurance_annual,
      hoa_monthly,
      comparison_period_years
    ));

    // Find best options
    const bestMonthlyPayment = this.findBestByMetric(loanDetails, 'total_monthly_payment', 'lowest');
    const bestTotalInterest = this.findBestByMetric(loanDetails, 'total_interest_paid', 'lowest');
    const bestUpfrontCost = this.findBestByMetric(loanDetails, 'total_upfront_costs', 'lowest');
    const bestOverallCost = this.findBestByMetric(loanDetails, 'total_cost_over_period', 'lowest');

    // Create comparison summary
    const summary = this.createComparisonSummary(loanDetails, comparison_period_years);

    // Generate side-by-side comparison
    const sideBySide = this.createSideBySideComparison(loanDetails);

    // Calculate break-even analysis for points
    const pointsAnalysis = this.analyzePointsBreakEven(loanDetails);

    // ARM risk analysis if applicable
    const armAnalysis = this.analyzeARMRisks(loanDetails, home_price);

    return {
      loan_details: loanDetails,
      comparison_summary: summary,
      best_options: {
        lowest_monthly_payment: bestMonthlyPayment,
        lowest_total_interest: bestTotalInterest,
        lowest_upfront_cost: bestUpfrontCost,
        lowest_overall_cost: bestOverallCost
      },
      side_by_side: sideBySide,
      points_analysis: pointsAnalysis,
      arm_risk_analysis: armAnalysis,
      recommendations: this.generateRecommendations(
        loanDetails,
        bestMonthlyPayment,
        bestOverallCost,
        comparison_period_years
      )
    };
  }

  calculateLoanDetails(homePrice, loan, propertyTaxAnnual, homeInsuranceAnnual, hoaMonthly, comparisonYears) {
    const {
      loan_name,
      down_payment_percent,
      interest_rate,
      loan_term_years,
      loan_type = 'conventional',
      points = 0,
      pmi_rate = 0,
      arm_details
    } = loan;

    // Basic calculations
    const down_payment = homePrice * (down_payment_percent / 100);
    const loan_amount = homePrice - down_payment;
    const monthly_rate = interest_rate / 100 / 12;
    const num_payments = loan_term_years * 12;
    const comparison_months = comparisonYears * 12;

    // Calculate monthly principal & interest
    const monthly_pi = this.calculateMonthlyPayment(loan_amount, monthly_rate, num_payments);

    // Calculate PMI if applicable
    let monthly_pmi = 0;
    let pmi_months = 0;
    if (down_payment_percent < 20 && loan_type !== 'va') {
      const actualPmiRate = pmi_rate || this.getDefaultPMIRate(down_payment_percent, loan_type);
      monthly_pmi = (loan_amount * actualPmiRate / 100) / 12;
      // PMI typically drops off at 78% LTV
      pmi_months = this.calculateMonthsUntilPMIRemoval(
        loan_amount,
        homePrice,
        monthly_pi,
        monthly_rate
      );
    }

    // Other monthly costs
    const monthly_property_tax = propertyTaxAnnual / 12;
    const monthly_insurance = homeInsuranceAnnual / 12;
    const total_monthly_payment = monthly_pi + monthly_pmi + monthly_property_tax + monthly_insurance + hoaMonthly;

    // Upfront costs
    const points_cost = loan_amount * (points / 100);
    const estimated_closing_costs = this.estimateClosingCosts(loan_amount, loan_type);
    const total_upfront_costs = down_payment + points_cost + estimated_closing_costs;

    // Calculate interest over comparison period
    const amortization = this.calculateAmortization(
      loan_amount,
      monthly_rate,
      num_payments,
      comparison_months
    );

    // Total PMI paid over comparison period
    const pmi_paid_comparison = monthly_pmi * Math.min(pmi_months, comparison_months);

    // Total cost over comparison period
    const total_cost_over_period = 
      total_upfront_costs +
      (monthly_pi * comparison_months) +
      pmi_paid_comparison +
      (monthly_property_tax * comparison_months) +
      (monthly_insurance * comparison_months) +
      (hoaMonthly * comparison_months);

    return {
      loan_name: loan_name,
      loan_type: loan_type,
      loan_amount: parseFloat(loan_amount.toFixed(2)),
      down_payment: parseFloat(down_payment.toFixed(2)),
      down_payment_percent: down_payment_percent,
      interest_rate: interest_rate,
      loan_term_years: loan_term_years,
      points: points,
      monthly_payment_breakdown: {
        principal_interest: parseFloat(monthly_pi.toFixed(2)),
        pmi: parseFloat(monthly_pmi.toFixed(2)),
        property_tax: parseFloat(monthly_property_tax.toFixed(2)),
        home_insurance: parseFloat(monthly_insurance.toFixed(2)),
        hoa: hoaMonthly,
        total: parseFloat(total_monthly_payment.toFixed(2))
      },
      total_monthly_payment: parseFloat(total_monthly_payment.toFixed(2)),
      upfront_costs: {
        down_payment: parseFloat(down_payment.toFixed(2)),
        points_cost: parseFloat(points_cost.toFixed(2)),
        estimated_closing: parseFloat(estimated_closing_costs.toFixed(2)),
        total: parseFloat(total_upfront_costs.toFixed(2))
      },
      total_upfront_costs: parseFloat(total_upfront_costs.toFixed(2)),
      comparison_period_analysis: {
        months: comparison_months,
        principal_paid: parseFloat(amortization.principal_paid.toFixed(2)),
        interest_paid: parseFloat(amortization.interest_paid.toFixed(2)),
        pmi_paid: parseFloat(pmi_paid_comparison.toFixed(2)),
        remaining_balance: parseFloat(amortization.remaining_balance.toFixed(2)),
        equity_built: parseFloat((down_payment + amortization.principal_paid).toFixed(2))
      },
      total_interest_paid: parseFloat(amortization.interest_paid.toFixed(2)),
      total_cost_over_period: parseFloat(total_cost_over_period.toFixed(2)),
      lifetime_costs: {
        total_interest: parseFloat(((monthly_pi * num_payments) - loan_amount).toFixed(2)),
        total_pmi: parseFloat((monthly_pmi * pmi_months).toFixed(2)),
        total_paid: parseFloat(((monthly_pi * num_payments) + (monthly_pmi * pmi_months) + total_upfront_costs).toFixed(2))
      },
      pmi_details: {
        has_pmi: monthly_pmi > 0,
        monthly_pmi: parseFloat(monthly_pmi.toFixed(2)),
        months_until_removal: pmi_months,
        total_pmi_paid: parseFloat((monthly_pmi * pmi_months).toFixed(2))
      },
      arm_details: arm_details
    };
  }

  calculateMonthlyPayment(principal, monthlyRate, numPayments) {
    if (monthlyRate === 0) {
      return principal / numPayments;
    }
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  getDefaultPMIRate(downPaymentPercent, loanType) {
    if (loanType === 'fha') {
      return 0.85; // FHA MIP
    }
    // Conventional PMI rates based on down payment
    if (downPaymentPercent >= 15) return 0.25;
    if (downPaymentPercent >= 10) return 0.45;
    if (downPaymentPercent >= 5) return 0.75;
    return 1.0;
  }

  calculateMonthsUntilPMIRemoval(loanAmount, homePrice, monthlyPayment, monthlyRate) {
    const targetBalance = homePrice * 0.78; // 78% LTV
    let balance = loanAmount;
    let months = 0;

    while (balance > targetBalance && months < 360) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      months++;
    }

    return months;
  }

  estimateClosingCosts(loanAmount, loanType) {
    // Rough estimates for closing costs
    const rates = {
      conventional: 0.025,
      fha: 0.03,
      va: 0.02,
      usda: 0.025,
      jumbo: 0.02,
      arm: 0.025
    };
    return loanAmount * (rates[loanType] || 0.025);
  }

  calculateAmortization(principal, monthlyRate, totalPayments, periodMonths) {
    let balance = principal;
    let totalInterest = 0;
    let totalPrincipal = 0;
    const monthlyPayment = this.calculateMonthlyPayment(principal, monthlyRate, totalPayments);

    for (let month = 1; month <= periodMonths && month <= totalPayments; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      totalInterest += interestPayment;
      totalPrincipal += principalPayment;
      balance -= principalPayment;
    }

    return {
      principal_paid: totalPrincipal,
      interest_paid: totalInterest,
      remaining_balance: Math.max(0, balance)
    };
  }

  findBestByMetric(loanDetails, metric, direction = 'lowest') {
    const getValue = (loan) => {
      const keys = metric.split('.');
      return keys.reduce((obj, key) => obj[key], loan);
    };

    const sorted = [...loanDetails].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);
      return direction === 'lowest' ? valA - valB : valB - valA;
    });

    const best = sorted[0];
    const savings = sorted.slice(1).map(loan => ({
      loan_name: loan.loan_name,
      difference: getValue(loan) - getValue(best)
    }));

    return {
      loan_name: best.loan_name,
      value: getValue(best),
      savings_vs_others: savings
    };
  }

  createComparisonSummary(loanDetails, comparisonYears) {
    const metrics = {
      monthly_payments: loanDetails.map(l => ({
        loan: l.loan_name,
        amount: l.total_monthly_payment
      })),
      upfront_costs: loanDetails.map(l => ({
        loan: l.loan_name,
        amount: l.total_upfront_costs
      })),
      interest_paid: loanDetails.map(l => ({
        loan: l.loan_name,
        amount: l.total_interest_paid,
        period: `${comparisonYears} years`
      })),
      total_cost: loanDetails.map(l => ({
        loan: l.loan_name,
        amount: l.total_cost_over_period,
        period: `${comparisonYears} years`
      }))
    };

    return metrics;
  }

  createSideBySideComparison(loanDetails) {
    const categories = [
      { label: 'Loan Amount', key: 'loan_amount' },
      { label: 'Down Payment', key: 'down_payment' },
      { label: 'Interest Rate', key: 'interest_rate', suffix: '%' },
      { label: 'Term', key: 'loan_term_years', suffix: ' years' },
      { label: 'Monthly P&I', key: 'monthly_payment_breakdown.principal_interest' },
      { label: 'Monthly PMI', key: 'monthly_payment_breakdown.pmi' },
      { label: 'Total Monthly', key: 'total_monthly_payment' },
      { label: 'Upfront Costs', key: 'total_upfront_costs' },
      { label: 'Points Cost', key: 'upfront_costs.points_cost' },
      { label: '5-Year Interest', key: 'total_interest_paid' },
      { label: '5-Year Total Cost', key: 'total_cost_over_period' },
      { label: 'Lifetime Interest', key: 'lifetime_costs.total_interest' }
    ];

    const comparison = categories.map(cat => {
      const row = { category: cat.label };
      loanDetails.forEach(loan => {
        const value = cat.key.split('.').reduce((obj, key) => obj[key], loan);
        row[loan.loan_name] = typeof value === 'number' 
          ? `$${value.toLocaleString()}${cat.suffix || ''}`
          : value + (cat.suffix || '');
      });
      return row;
    });

    return comparison;
  }

  analyzePointsBreakEven(loanDetails) {
    const pointsAnalysis = [];

    loanDetails.forEach(loan => {
      if (loan.points > 0) {
        // Find comparison loan without points
        const baseComparison = loanDetails.find(l => 
          l.loan_type === loan.loan_type && 
          l.down_payment_percent === loan.down_payment_percent &&
          l.points === 0
        );

        if (baseComparison) {
          const monthlySavings = baseComparison.monthly_payment_breakdown.principal_interest - 
                                loan.monthly_payment_breakdown.principal_interest;
          const breakEvenMonths = loan.upfront_costs.points_cost / monthlySavings;
          
          pointsAnalysis.push({
            loan_name: loan.loan_name,
            points: loan.points,
            points_cost: loan.upfront_costs.points_cost,
            monthly_savings: parseFloat(monthlySavings.toFixed(2)),
            break_even_months: Math.ceil(breakEvenMonths),
            break_even_years: parseFloat((breakEvenMonths / 12).toFixed(1)),
            worth_it: breakEvenMonths < (loan.loan_term_years * 12 * 0.7) // Worth it if break even before 70% of term
          });
        }
      }
    });

    return pointsAnalysis;
  }

  analyzeARMRisks(loanDetails, homePrice) {
    const armLoans = loanDetails.filter(l => l.loan_type === 'arm');
    if (armLoans.length === 0) return null;

    return armLoans.map(loan => {
      const maxRate = loan.interest_rate + (loan.arm_details?.lifetime_cap || 5);
      const maxMonthlyRate = maxRate / 100 / 12;
      const maxPayment = this.calculateMonthlyPayment(
        loan.loan_amount,
        maxMonthlyRate,
        loan.loan_term_years * 12
      );

      return {
        loan_name: loan.loan_name,
        initial_rate: loan.interest_rate,
        max_possible_rate: maxRate,
        current_payment: loan.monthly_payment_breakdown.principal_interest,
        max_possible_payment: parseFloat(maxPayment.toFixed(2)),
        payment_increase: parseFloat((maxPayment - loan.monthly_payment_breakdown.principal_interest).toFixed(2)),
        payment_increase_percent: parseFloat(
          ((maxPayment - loan.monthly_payment_breakdown.principal_interest) / 
           loan.monthly_payment_breakdown.principal_interest * 100).toFixed(2)
        ),
        fixed_period: loan.arm_details?.fixed_period_years || 5,
        risk_assessment: maxPayment > loan.monthly_payment_breakdown.principal_interest * 1.25 
          ? "High Risk" : "Moderate Risk"
      };
    });
  }

  generateRecommendations(loanDetails, bestMonthly, bestOverall, comparisonYears) {
    const recommendations = [];

    // Best overall value
    if (bestOverall.loan_name === bestMonthly.loan_name) {
      recommendations.push({
        type: "Best Choice",
        message: `${bestOverall.loan_name} offers both lowest monthly payment and lowest total cost`,
        action: "This is likely your best option unless you have specific constraints"
      });
    } else {
      recommendations.push({
        type: "Trade-off",
        message: `${bestMonthly.loan_name} has lowest monthly payment, but ${bestOverall.loan_name} saves more over ${comparisonYears} years`,
        action: "Choose based on your monthly budget vs long-term savings priority"
      });
    }

    // PMI considerations
    const loansWithPMI = loanDetails.filter(l => l.pmi_details.has_pmi);
    if (loansWithPMI.length > 0) {
      const loansWithoutPMI = loanDetails.filter(l => !l.pmi_details.has_pmi);
      if (loansWithoutPMI.length > 0) {
        const pmiSavings = Math.min(...loansWithPMI.map(l => l.pmi_details.total_pmi_paid));
        recommendations.push({
          type: "PMI Avoidance",
          message: `20% down payment options save $${pmiSavings.toLocaleString()} in PMI`,
          action: "Consider if you can afford the higher down payment"
        });
      }
    }

    // Points analysis
    const loansWithPoints = loanDetails.filter(l => l.points > 0);
    if (loansWithPoints.length > 0) {
      recommendations.push({
        type: "Points Strategy",
        message: "Some options include discount points",
        action: "Points are worthwhile if you plan to keep the loan long-term"
      });
    }

    // ARM warnings
    const armLoans = loanDetails.filter(l => l.loan_type === 'arm');
    if (armLoans.length > 0) {
      recommendations.push({
        type: "ARM Caution",
        message: "ARM loans carry interest rate risk after the fixed period",
        action: "Only choose ARM if you plan to sell/refinance before rate adjustments"
      });
    }

    // Short vs long term
    const shortTermLoans = loanDetails.filter(l => l.loan_term_years <= 15);
    const longTermLoans = loanDetails.filter(l => l.loan_term_years >= 30);
    
    if (shortTermLoans.length > 0 && longTermLoans.length > 0) {
      const interestSavings = Math.min(...longTermLoans.map(l => l.lifetime_costs.total_interest)) -
                             Math.min(...shortTermLoans.map(l => l.lifetime_costs.total_interest));
      recommendations.push({
        type: "Term Length",
        message: `15-year loans save ~$${interestSavings.toLocaleString()} in lifetime interest`,
        action: "Choose shorter term if you can afford the higher payment"
      });
    }

    return recommendations;
  }
}