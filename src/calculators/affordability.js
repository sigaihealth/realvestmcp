export class AffordabilityCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        annual_income: {
          type: 'number',
          description: 'Annual gross income in dollars',
          minimum: 0
        },
        monthly_debts: {
          type: 'number',
          description: 'Total monthly debt payments (car, credit cards, student loans, etc.)',
          minimum: 0
        },
        down_payment: {
          type: 'number',
          description: 'Down payment amount in dollars',
          minimum: 0
        },
        interest_rate: {
          type: 'number',
          description: 'Annual interest rate as a percentage (e.g., 7.5 for 7.5%)',
          minimum: 0,
          maximum: 20
        },
        property_tax_rate: {
          type: 'number',
          description: 'Annual property tax rate as percentage of home value (default: 1.2%)',
          default: 1.2
        },
        insurance_rate: {
          type: 'number',
          description: 'Annual insurance rate as percentage of home value (default: 0.5%)',
          default: 0.5
        },
        hoa_monthly: {
          type: 'number',
          description: 'Monthly HOA fees (default: 0)',
          default: 0
        },
        loan_term_years: {
          type: 'number',
          description: 'Loan term in years (default: 30)',
          default: 30
        }
      },
      required: ['annual_income', 'monthly_debts', 'down_payment', 'interest_rate']
    };
  }

  calculate(params) {
    const {
      annual_income,
      monthly_debts,
      down_payment,
      interest_rate,
      property_tax_rate = 1.2,
      insurance_rate = 0.5,
      hoa_monthly = 0,
      loan_term_years = 30
    } = params;

    // Calculate monthly income
    const monthlyIncome = annual_income / 12;

    // DTI limits
    const frontEndRatio = 0.28; // 28% for housing
    const backEndRatio = 0.36;  // 36% total debt

    // Calculate maximum monthly payment based on DTI ratios
    const maxHousingPayment = monthlyIncome * frontEndRatio;
    const maxTotalDebtPayment = monthlyIncome * backEndRatio;
    const maxPaymentAfterDebts = maxTotalDebtPayment - monthly_debts;

    // Use the lower of the two limits
    const maxMonthlyPayment = Math.min(maxHousingPayment, maxPaymentAfterDebts);

    // Calculate loan amount based on payment
    const monthlyRate = interest_rate / 100 / 12;
    const numPayments = loan_term_years * 12;

    // Account for property tax, insurance, and HOA
    const propertyTaxMonthly = (property_tax_rate / 100) / 12;
    const insuranceMonthly = (insurance_rate / 100) / 12;
    
    // Calculate maximum principal and interest payment
    const maxPrincipalInterest = maxMonthlyPayment - hoa_monthly;

    // Solve for loan amount using mortgage formula
    let maxLoanAmount;
    if (monthlyRate === 0) {
      maxLoanAmount = maxPrincipalInterest * numPayments;
    } else {
      // Account for property tax and insurance in the calculation
      // These are based on home value, so we need to solve iteratively
      let homePrice = 200000; // Initial guess
      let iterations = 0;
      
      while (iterations < 20) {
        const taxAndInsurance = homePrice * (propertyTaxMonthly + insuranceMonthly);
        const availableForPrincipalInterest = maxMonthlyPayment - taxAndInsurance - hoa_monthly;
        
        const newLoanAmount = availableForPrincipalInterest * 
          ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);
        
        const newHomePrice = newLoanAmount + down_payment;
        
        if (Math.abs(newHomePrice - homePrice) < 100) break;
        
        homePrice = newHomePrice;
        iterations++;
      }
      
      maxLoanAmount = homePrice - down_payment;
    }

    let maxHomePrice = maxLoanAmount + down_payment;

    // Calculate down payment percentage
    let downPaymentPercent = (down_payment / maxHomePrice) * 100;

    // Check if PMI is required (less than 20% down)
    const pmiRequired = downPaymentPercent < 20;
    const pmiMonthly = pmiRequired ? maxLoanAmount * 0.005 : 0; // 0.5% annually

    // Recalculate if PMI is required
    if (pmiRequired) {
      const availableAfterPMI = maxMonthlyPayment - pmiMonthly;
      const taxAndInsurance = maxHomePrice * (propertyTaxMonthly + insuranceMonthly);
      const availableForPrincipalInterest = availableAfterPMI - taxAndInsurance - hoa_monthly;
      
      maxLoanAmount = availableForPrincipalInterest * 
        ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);
      
      maxHomePrice = maxLoanAmount + down_payment;
      downPaymentPercent = (down_payment / maxHomePrice) * 100;
    }

    // Calculate actual monthly payment breakdown
    const principalInterest = maxLoanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const propertyTax = maxHomePrice * propertyTaxMonthly;
    const insurance = maxHomePrice * insuranceMonthly;
    const totalMonthlyPayment = principalInterest + propertyTax + insurance + pmiMonthly + hoa_monthly;

    // Calculate ratios
    const frontEndActual = (totalMonthlyPayment / monthlyIncome) * 100;
    const backEndActual = ((totalMonthlyPayment + monthly_debts) / monthlyIncome) * 100;

    return {
      max_home_price: Math.round(maxHomePrice),
      max_loan_amount: Math.round(maxLoanAmount),
      down_payment: down_payment,
      down_payment_percent: downPaymentPercent.toFixed(1),
      monthly_payment_breakdown: {
        principal_interest: Math.round(principalInterest),
        property_tax: Math.round(propertyTax),
        insurance: Math.round(insurance),
        pmi: Math.round(pmiMonthly),
        hoa: hoa_monthly,
        total: Math.round(totalMonthlyPayment)
      },
      debt_to_income: {
        front_end_ratio: frontEndActual.toFixed(1),
        back_end_ratio: backEndActual.toFixed(1),
        front_end_limit: (frontEndRatio * 100).toFixed(0),
        back_end_limit: (backEndRatio * 100).toFixed(0)
      },
      loan_details: {
        interest_rate: interest_rate,
        loan_term_years: loan_term_years,
        total_payments: numPayments,
        pmi_required: pmiRequired
      },
      affordability_summary: {
        monthly_income: Math.round(monthlyIncome),
        max_housing_payment: Math.round(maxMonthlyPayment),
        current_monthly_debts: monthly_debts,
        remaining_for_housing: Math.round(maxMonthlyPayment)
      }
    };
  }
}