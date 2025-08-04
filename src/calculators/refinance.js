/**
 * Refinance Calculator
 * Analyzes whether refinancing makes financial sense
 */

export class RefinanceCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        current_loan: {
          type: 'object',
          properties: {
            original_balance: { type: 'number', minimum: 0, description: 'Original loan amount' },
            current_balance: { type: 'number', minimum: 0, description: 'Current loan balance' },
            interest_rate: { type: 'number', minimum: 0, maximum: 100, description: 'Current interest rate (%)' },
            monthly_payment: { type: 'number', minimum: 0, description: 'Current monthly payment (P&I)' },
            years_remaining: { type: 'number', minimum: 0, maximum: 30, description: 'Years remaining on current loan' },
            months_paid: { type: 'number', minimum: 0, description: 'Months already paid' }
          },
          required: ['current_balance', 'interest_rate', 'monthly_payment', 'years_remaining']
        },
        new_loan: {
          type: 'object',
          properties: {
            interest_rate: { type: 'number', minimum: 0, maximum: 100, description: 'New interest rate (%)' },
            loan_term_years: { type: 'number', minimum: 1, maximum: 30, description: 'New loan term in years' },
            closing_costs: { type: 'number', minimum: 0, description: 'Total closing costs' },
            points: { type: 'number', minimum: 0, maximum: 10, description: 'Discount points' },
            cash_out: { type: 'number', minimum: 0, description: 'Cash-out amount (if any)' }
          },
          required: ['interest_rate', 'loan_term_years']
        },
        property_info: {
          type: 'object',
          properties: {
            current_value: { type: 'number', minimum: 0, description: 'Current property value' },
            property_type: { 
              type: 'string', 
              enum: ['primary_residence', 'investment_property', 'second_home'],
              description: 'Type of property'
            }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            tax_bracket: { type: 'number', minimum: 0, maximum: 100, description: 'Marginal tax bracket (%)' },
            investment_return: { type: 'number', minimum: 0, maximum: 100, description: 'Expected return on investments (%)' },
            planning_horizon_years: { type: 'number', minimum: 1, maximum: 30, description: 'How long you plan to keep property' }
          }
        }
      },
      required: ['current_loan', 'new_loan']
    };
  }

  calculate(params) {
    const { current_loan, new_loan, property_info = {}, analysis_options = {} } = params;
    
    // Set defaults
    const tax_bracket = analysis_options.tax_bracket || 25;
    const investment_return = analysis_options.investment_return || 7;
    const planning_horizon_years = analysis_options.planning_horizon_years || new_loan.loan_term_years;
    const closing_costs = new_loan.closing_costs || (current_loan.current_balance * 0.02);
    const points_cost = (new_loan.points || 0) * current_loan.current_balance / 100;
    
    // Calculate new loan amount
    const new_loan_amount = current_loan.current_balance + (new_loan.cash_out || 0) + 
                           (closing_costs + points_cost);
    
    // Calculate new monthly payment
    const new_rate_monthly = new_loan.interest_rate / 100 / 12;
    const new_term_months = new_loan.loan_term_years * 12;
    const new_monthly_payment = this.calculateMonthlyPayment(
      new_loan_amount, 
      new_rate_monthly, 
      new_term_months
    );
    
    // Monthly savings
    const monthly_savings = current_loan.monthly_payment - new_monthly_payment;
    
    // Calculate break-even
    const total_upfront_costs = closing_costs + points_cost;
    const simple_breakeven_months = monthly_savings > 0 ? 
      Math.ceil(total_upfront_costs / monthly_savings) : null;
    
    // Calculate interest savings
    const current_total_interest = this.calculateTotalInterest(
      current_loan.current_balance,
      current_loan.interest_rate / 100 / 12,
      current_loan.years_remaining * 12
    );
    
    const new_total_interest = this.calculateTotalInterest(
      new_loan_amount,
      new_rate_monthly,
      new_term_months
    );
    
    const interest_savings = current_total_interest - new_total_interest;
    
    // NPV analysis
    const npv_analysis = this.calculateNPV(
      current_loan,
      new_loan,
      new_loan_amount,
      new_monthly_payment,
      monthly_savings,
      total_upfront_costs,
      investment_return,
      planning_horizon_years
    );
    
    // LTV analysis
    const ltv_analysis = property_info.current_value ? {
      current_ltv: (current_loan.current_balance / property_info.current_value * 100).toFixed(1),
      new_ltv: (new_loan_amount / property_info.current_value * 100).toFixed(1),
      max_conventional_ltv: property_info.property_type === 'investment_property' ? 75 : 80,
      pmi_required: property_info.property_type === 'primary_residence' && 
                   (new_loan_amount / property_info.current_value) > 0.80
    } : null;
    
    // Calculate effective interest rate (after tax deduction if applicable)
    const effective_rate_analysis = {
      current_effective_rate: current_loan.interest_rate * (1 - tax_bracket / 100),
      new_effective_rate: new_loan.interest_rate * (1 - tax_bracket / 100),
      tax_deduction_applicable: property_info.property_type !== 'primary_residence' ||
                               new_loan_amount <= 750000
    };
    
    // Decision metrics
    const should_refinance = this.evaluateRefinance(
      monthly_savings,
      simple_breakeven_months,
      npv_analysis.net_present_value,
      planning_horizon_years,
      current_loan.interest_rate,
      new_loan.interest_rate
    );
    
    // Alternative scenarios
    const scenarios = this.calculateScenarios(
      current_loan,
      new_loan,
      property_info,
      new_loan_amount
    );
    
    return {
      loan_comparison: {
        current_loan: {
          balance: current_loan.current_balance,
          rate: current_loan.interest_rate,
          monthly_payment: current_loan.monthly_payment,
          years_remaining: current_loan.years_remaining,
          total_remaining_interest: current_total_interest
        },
        new_loan: {
          amount: new_loan_amount,
          rate: new_loan.interest_rate,
          monthly_payment: new_monthly_payment,
          term_years: new_loan.loan_term_years,
          total_interest: new_total_interest,
          closing_costs: closing_costs,
          points_cost: points_cost
        }
      },
      financial_impact: {
        monthly_savings: monthly_savings,
        annual_savings: monthly_savings * 12,
        total_interest_savings: interest_savings,
        upfront_costs: total_upfront_costs,
        net_lifetime_savings: interest_savings - total_upfront_costs
      },
      break_even_analysis: {
        simple_breakeven_months: simple_breakeven_months,
        simple_breakeven_years: simple_breakeven_months ? 
          (simple_breakeven_months / 12).toFixed(1) : null,
        true_breakeven_months: npv_analysis.true_breakeven_months,
        roi_at_breakeven: simple_breakeven_months ? 
          ((monthly_savings * 12) / total_upfront_costs * 100).toFixed(1) : null
      },
      npv_analysis: npv_analysis,
      ltv_analysis: ltv_analysis,
      effective_rate_analysis: effective_rate_analysis,
      decision: {
        should_refinance: should_refinance.decision,
        confidence: should_refinance.confidence,
        primary_reason: should_refinance.primary_reason,
        risk_factors: should_refinance.risk_factors
      },
      scenarios: scenarios,
      recommendations: this.generateRecommendations(
        should_refinance,
        monthly_savings,
        simple_breakeven_months,
        planning_horizon_years,
        ltv_analysis,
        current_loan,
        new_loan
      )
    };
  }
  
  calculateMonthlyPayment(principal, monthlyRate, months) {
    if (monthlyRate === 0) return principal / months;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  }
  
  calculateTotalInterest(principal, monthlyRate, months) {
    const monthlyPayment = this.calculateMonthlyPayment(principal, monthlyRate, months);
    return (monthlyPayment * months) - principal;
  }
  
  calculateNPV(currentLoan, newLoan, newLoanAmount, newPayment, monthlySavings, 
               upfrontCosts, investmentReturn, horizonYears) {
    const monthlyReturn = investmentReturn / 100 / 12;
    const horizonMonths = Math.min(horizonYears * 12, currentLoan.years_remaining * 12);
    
    let npv = -upfrontCosts;
    let trueBreakevenMonth = null;
    let cumulativeSavings = -upfrontCosts;
    
    // Calculate present value of monthly savings
    for (let month = 1; month <= horizonMonths; month++) {
      const pv = monthlySavings / Math.pow(1 + monthlyReturn, month);
      npv += pv;
      cumulativeSavings += monthlySavings;
      
      if (trueBreakevenMonth === null && cumulativeSavings > 0) {
        trueBreakevenMonth = month;
      }
    }
    
    // Add value of lower balance at end of horizon if selling
    if (horizonYears < newLoan.loan_term_years) {
      const currentBalance = this.calculateRemainingBalance(
        currentLoan.current_balance,
        currentLoan.interest_rate / 100 / 12,
        currentLoan.years_remaining * 12,
        horizonMonths
      );
      
      const newBalance = this.calculateRemainingBalance(
        newLoanAmount,
        newLoan.interest_rate / 100 / 12,
        newLoan.loan_term_years * 12,
        horizonMonths
      );
      
      const balanceDifference = currentBalance - newBalance;
      const pvBalanceDiff = balanceDifference / Math.pow(1 + monthlyReturn, horizonMonths);
      npv += pvBalanceDiff;
    }
    
    return {
      net_present_value: npv,
      true_breakeven_months: trueBreakevenMonth,
      total_cash_flow_benefit: monthlySavings * horizonMonths - upfrontCosts,
      irr: this.calculateIRR(upfrontCosts, monthlySavings, horizonMonths)
    };
  }
  
  calculateRemainingBalance(principal, monthlyRate, totalMonths, monthsPaid) {
    const monthlyPayment = this.calculateMonthlyPayment(principal, monthlyRate, totalMonths);
    let balance = principal;
    
    for (let i = 0; i < monthsPaid; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
    }
    
    return Math.max(0, balance);
  }
  
  calculateIRR(initialCost, monthlySavings, months) {
    // Simple IRR approximation
    const totalReturn = monthlySavings * months;
    const gain = totalReturn - initialCost;
    const avgAnnualReturn = (gain / initialCost) / (months / 12);
    return avgAnnualReturn * 100;
  }
  
  evaluateRefinance(monthlySavings, breakevenMonths, npv, planningHorizon, 
                    currentRate, newRate) {
    const rateDrop = currentRate - newRate;
    let decision = false;
    let confidence = 'low';
    let primaryReason = '';
    const riskFactors = [];
    
    // Strong indicators for refinancing
    if (rateDrop >= 0.75 && breakevenMonths && breakevenMonths <= 36 && npv > 0) {
      decision = true;
      confidence = 'high';
      primaryReason = 'Significant rate reduction with reasonable break-even';
    } else if (rateDrop >= 0.5 && breakevenMonths && breakevenMonths <= 24 && npv > 0) {
      decision = true;
      confidence = 'high';
      primaryReason = 'Good rate reduction with quick break-even';
    } else if (monthlySavings > 200 && breakevenMonths && breakevenMonths <= 48) {
      decision = true;
      confidence = 'medium';
      primaryReason = 'Substantial monthly savings';
    } else if (npv > 10000) {
      decision = true;
      confidence = 'medium';
      primaryReason = 'Strong positive NPV';
    }
    
    // Risk factors
    if (breakevenMonths && breakevenMonths > planningHorizon * 12) {
      riskFactors.push('Break-even exceeds planning horizon');
      confidence = 'low';
    }
    if (rateDrop < 0.5) {
      riskFactors.push('Minimal rate improvement');
    }
    if (breakevenMonths && breakevenMonths > 60) {
      riskFactors.push('Very long break-even period');
      decision = false;
    }
    if (monthlySavings < 50) {
      riskFactors.push('Minimal monthly savings');
      decision = false;
    }
    
    return {
      decision,
      confidence,
      primary_reason: primaryReason,
      risk_factors: riskFactors
    };
  }
  
  calculateScenarios(currentLoan, newLoan, propertyInfo, newLoanAmount) {
    const scenarios = [];
    
    // No cash-out scenario
    if (newLoan.cash_out > 0) {
      const noCashOutAmount = currentLoan.current_balance + 
                             (newLoan.closing_costs || currentLoan.current_balance * 0.02) +
                             ((newLoan.points || 0) * currentLoan.current_balance / 100);
      
      const noCashOutPayment = this.calculateMonthlyPayment(
        noCashOutAmount,
        newLoan.interest_rate / 100 / 12,
        newLoan.loan_term_years * 12
      );
      
      scenarios.push({
        name: 'No Cash-Out Refinance',
        loan_amount: noCashOutAmount,
        monthly_payment: noCashOutPayment,
        monthly_savings: currentLoan.monthly_payment - noCashOutPayment
      });
    }
    
    // Different term scenarios
    const terms = [15, 20, 30].filter(t => t !== newLoan.loan_term_years);
    terms.forEach(term => {
      const payment = this.calculateMonthlyPayment(
        newLoanAmount,
        newLoan.interest_rate / 100 / 12,
        term * 12
      );
      
      scenarios.push({
        name: `${term}-Year Term`,
        loan_amount: newLoanAmount,
        monthly_payment: payment,
        monthly_savings: currentLoan.monthly_payment - payment,
        total_interest: this.calculateTotalInterest(
          newLoanAmount,
          newLoan.interest_rate / 100 / 12,
          term * 12
        )
      });
    });
    
    // Rate scenarios
    [-0.25, 0.25].forEach(rateAdjust => {
      const adjustedRate = newLoan.interest_rate + rateAdjust;
      const payment = this.calculateMonthlyPayment(
        newLoanAmount,
        adjustedRate / 100 / 12,
        newLoan.loan_term_years * 12
      );
      
      scenarios.push({
        name: `${adjustedRate.toFixed(2)}% Rate`,
        loan_amount: newLoanAmount,
        monthly_payment: payment,
        monthly_savings: currentLoan.monthly_payment - payment
      });
    });
    
    return scenarios;
  }
  
  generateRecommendations(shouldRefinance, monthlySavings, breakevenMonths, 
                          planningHorizon, ltvAnalysis, currentLoan, newLoan) {
    const recommendations = [];
    
    if (shouldRefinance.decision) {
      recommendations.push({
        category: 'Action',
        priority: 'high',
        message: `Proceed with refinance - ${shouldRefinance.primary_reason}`
      });
      
      if (monthlySavings > 0) {
        recommendations.push({
          category: 'Savings Strategy',
          priority: 'medium',
          message: `Invest the $${monthlySavings.toFixed(0)} monthly savings for compound growth`
        });
      }
    } else {
      recommendations.push({
        category: 'Action',
        priority: 'high',
        message: 'Refinancing not recommended at this time'
      });
      
      if (currentLoan.interest_rate - newLoan.interest_rate < 0.5) {
        recommendations.push({
          category: 'Alternative',
          priority: 'medium',
          message: 'Wait for rates to drop at least 0.5% below current rate'
        });
      }
    }
    
    // Break-even recommendations
    if (breakevenMonths && breakevenMonths > 36) {
      recommendations.push({
        category: 'Timing',
        priority: 'medium',
        message: 'Consider negotiating lower closing costs to improve break-even'
      });
    }
    
    // LTV recommendations
    if (ltvAnalysis) {
      if (ltvAnalysis.new_ltv > 80 && ltvAnalysis.pmi_required) {
        recommendations.push({
          category: 'Cost Reduction',
          priority: 'high',
          message: 'Consider larger down payment to avoid PMI'
        });
      }
      
      if (ltvAnalysis.new_ltv > ltvAnalysis.max_conventional_ltv) {
        recommendations.push({
          category: 'Loan Type',
          priority: 'high',
          message: 'May need jumbo or portfolio loan for this LTV'
        });
      }
    }
    
    // Planning horizon
    if (breakevenMonths && planningHorizon * 12 < breakevenMonths) {
      recommendations.push({
        category: 'Risk',
        priority: 'high',
        message: `You may sell before reaching break-even (${(breakevenMonths/12).toFixed(1)} years)`
      });
    }
    
    // Rate environment
    if (newLoan.interest_rate > 7) {
      recommendations.push({
        category: 'Market Timing',
        priority: 'medium',
        message: 'Consider waiting if rates are expected to decline'
      });
    }
    
    return recommendations;
  }
}