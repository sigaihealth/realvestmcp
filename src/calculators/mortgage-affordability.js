export class MortgageAffordabilityCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        annual_income: {
          type: 'number',
          description: 'Annual gross income in dollars',
          minimum: 0
        },
        co_borrower_income: {
          type: 'number',
          description: 'Co-borrower annual income (default: 0)',
          default: 0
        },
        other_monthly_income: {
          type: 'number',
          description: 'Other monthly income (rental, investments, etc.)',
          default: 0
        },
        car_payment: {
          type: 'number',
          description: 'Monthly car loan/lease payments',
          default: 0
        },
        student_loans: {
          type: 'number',
          description: 'Monthly student loan payments',
          default: 0
        },
        credit_cards: {
          type: 'number',
          description: 'Monthly credit card minimum payments',
          default: 0
        },
        other_debts: {
          type: 'number',
          description: 'Other monthly debt payments',
          default: 0
        },
        down_payment: {
          type: 'number',
          description: 'Down payment amount in dollars',
          minimum: 0
        },
        down_payment_percent: {
          type: 'number',
          description: 'Down payment percentage (3.5, 5, 10, 15, 20, etc.)',
          default: 20
        },
        interest_rate: {
          type: 'number',
          description: 'Annual interest rate as a percentage (e.g., 7.0 for 7.0%)',
          minimum: 0,
          maximum: 20
        },
        loan_term: {
          type: 'number',
          description: 'Loan term in years (15 or 30)',
          enum: [15, 30],
          default: 30
        },
        property_tax_rate: {
          type: 'number',
          description: 'Annual property tax rate as percentage of home value (default: 1.2%)',
          default: 1.2
        },
        insurance_annual: {
          type: 'number',
          description: 'Annual homeowners insurance cost (default: $1200)',
          default: 1200
        },
        hoa_monthly: {
          type: 'number',
          description: 'Monthly HOA fees (default: 0)',
          default: 0
        }
      },
      required: ['annual_income', 'down_payment', 'interest_rate']
    };
  }

  calculate(params) {
    const {
      annual_income,
      co_borrower_income = 0,
      other_monthly_income = 0,
      car_payment = 0,
      student_loans = 0,
      credit_cards = 0,
      other_debts = 0,
      down_payment,
      down_payment_percent = 20,
      interest_rate,
      loan_term = 30,
      property_tax_rate = 1.2,
      insurance_annual = 1200,
      hoa_monthly = 0
    } = params;

    // Calculate total income and debts
    const totalAnnualIncome = annual_income + co_borrower_income + (other_monthly_income * 12);
    const monthlyIncome = totalAnnualIncome / 12;
    const totalMonthlyDebts = car_payment + student_loans + credit_cards + other_debts;

    // Calculate maximum monthly housing payment (28% rule)
    const maxHousingPayment = monthlyIncome * 0.28;
    
    // Calculate maximum total debt payment (36% rule)
    const maxTotalDebt = monthlyIncome * 0.36;
    const availableForHousing = maxTotalDebt - totalMonthlyDebts;
    
    // Use the lower of the two
    const maxMonthlyPayment = Math.min(maxHousingPayment, availableForHousing);

    // Calculate other monthly costs
    const monthlyInsurance = insurance_annual / 12;
    const monthlyHOA = hoa_monthly;
    
    // Estimate property tax (will refine later)
    const estimatedHomePrice = maxMonthlyPayment * 150; // Rough estimate
    const monthlyPropertyTax = (estimatedHomePrice * (property_tax_rate / 100)) / 12;
    
    // Calculate PMI if down payment < 20%
    let monthlyPMI = 0;
    if (down_payment_percent < 20) {
      monthlyPMI = estimatedHomePrice * 0.005 / 12; // 0.5% annually
    }
    
    // Available for principal and interest
    const availableForPI = maxMonthlyPayment - monthlyPropertyTax - monthlyInsurance - monthlyPMI - monthlyHOA;
    
    // Calculate max loan amount
    const monthlyRate = interest_rate / 100 / 12;
    const numPayments = loan_term * 12;
    const maxLoanAmount = availableForPI * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);
    
    // Calculate max home price based on down payment
    let maxHomePrice;
    if (down_payment_percent > 0) {
      maxHomePrice = maxLoanAmount / (1 - down_payment_percent / 100);
    } else {
      maxHomePrice = maxLoanAmount + down_payment;
    }
    
    // Recalculate with actual home price
    const actualMonthlyTax = (maxHomePrice * (property_tax_rate / 100)) / 12;
    const actualMonthlyPMI = down_payment_percent < 20 ? (maxHomePrice * 0.005 / 12) : 0;
    const monthlyPI = availableForPI;
    const totalMonthlyPayment = monthlyPI + actualMonthlyTax + monthlyInsurance + actualMonthlyPMI + monthlyHOA;
    
    // Calculate DTI ratios
    const frontEndRatio = (totalMonthlyPayment / monthlyIncome) * 100;
    const backEndRatio = ((totalMonthlyPayment + totalMonthlyDebts) / monthlyIncome) * 100;
    
    // Calculate alternative scenarios
    const conservativePayment = monthlyIncome * 0.25;
    const moderatePayment = monthlyIncome * 0.28;
    const aggressivePayment = monthlyIncome * 0.36 - totalMonthlyDebts;
    
    // Calculate prices for each scenario
    const calculatePriceForPayment = (payment) => {
      const availablePI = payment - actualMonthlyTax - monthlyInsurance - actualMonthlyPMI - monthlyHOA;
      const loanAmt = availablePI * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);
      return down_payment_percent > 0 ? loanAmt / (1 - down_payment_percent / 100) : loanAmt + down_payment;
    };

    return {
      income_analysis: {
        monthly_income: Math.round(monthlyIncome),
        total_annual_income: Math.round(totalAnnualIncome),
        primary_income: annual_income,
        co_borrower_income: co_borrower_income,
        other_monthly_income: other_monthly_income
      },
      debt_analysis: {
        total_monthly_debts: Math.round(totalMonthlyDebts),
        car_payment: car_payment,
        student_loans: student_loans,
        credit_cards: credit_cards,
        other_debts: other_debts
      },
      affordability_results: {
        max_home_price: Math.round(maxHomePrice),
        max_loan_amount: Math.round(maxLoanAmount),
        required_down_payment: Math.round(maxHomePrice * (down_payment_percent / 100)),
        down_payment_percent: down_payment_percent
      },
      monthly_payment_breakdown: {
        principal_interest: Math.round(monthlyPI),
        property_tax: Math.round(actualMonthlyTax),
        insurance: Math.round(monthlyInsurance),
        pmi: Math.round(actualMonthlyPMI),
        hoa: monthlyHOA,
        total_monthly_payment: Math.round(totalMonthlyPayment)
      },
      debt_to_income_ratios: {
        front_end_ratio: frontEndRatio.toFixed(1) + '%',
        back_end_ratio: backEndRatio.toFixed(1) + '%',
        front_end_limit: '28%',
        back_end_limit: '36%',
        front_end_status: frontEndRatio <= 28 ? 'Good' : frontEndRatio <= 33 ? 'Caution' : 'Over Limit',
        back_end_status: backEndRatio <= 36 ? 'Good' : backEndRatio <= 43 ? 'Caution' : 'Over Limit'
      },
      alternative_scenarios: {
        conservative_25_percent: {
          max_price: Math.round(calculatePriceForPayment(conservativePayment)),
          monthly_payment: Math.round(conservativePayment),
          description: 'Lower risk, more financial flexibility'
        },
        moderate_28_percent: {
          max_price: Math.round(calculatePriceForPayment(moderatePayment)),
          monthly_payment: Math.round(moderatePayment),
          description: 'Standard lending guideline'
        },
        aggressive_36_percent: {
          max_price: Math.round(calculatePriceForPayment(aggressivePayment)),
          monthly_payment: Math.round(aggressivePayment),
          description: 'Maximum typical approval'
        }
      },
      loan_details: {
        interest_rate: interest_rate + '%',
        loan_term: loan_term + ' years',
        total_payments: numPayments,
        pmi_required: down_payment_percent < 20,
        total_interest_paid: Math.round((monthlyPI * numPayments) - maxLoanAmount)
      },
      recommendations: this.generateRecommendations(frontEndRatio, backEndRatio, down_payment_percent, maxHomePrice)
    };
  }

  generateRecommendations(frontEndRatio, backEndRatio, downPaymentPercent, maxHomePrice) {
    const recommendations = [];

    if (frontEndRatio > 28) {
      recommendations.push("Your housing ratio exceeds 28%. Consider reducing debt or increasing income.");
    }

    if (backEndRatio > 36) {
      recommendations.push("Your total debt ratio exceeds 36%. Pay down existing debts before home shopping.");
    }

    if (downPaymentPercent < 20) {
      recommendations.push("With less than 20% down, you'll pay PMI. Consider saving more to avoid this cost.");
    }

    if (maxHomePrice < 200000) {
      recommendations.push("Consider increasing income, reducing debts, or looking at first-time buyer programs.");
    }

    if (frontEndRatio <= 25 && backEndRatio <= 32) {
      recommendations.push("Great job! Your debt ratios are excellent. You have room for a higher price range if desired.");
    }

    return recommendations;
  }
}