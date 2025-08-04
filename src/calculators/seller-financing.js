export class SellerFinancingCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        property_details: {
          type: 'object',
          properties: {
            property_value: { type: 'number', minimum: 1000 },
            property_type: { 
              type: 'string', 
              enum: ['single_family', 'multi_family', 'commercial', 'land', 'mobile_home'] 
            },
            monthly_rent: { type: 'number', minimum: 0 },
            operating_expenses: { type: 'number', minimum: 0 }
          },
          required: ['property_value', 'property_type']
        },
        seller_financing_terms: {
          type: 'object',
          properties: {
            down_payment: { type: 'number', minimum: 0 },
            seller_note_amount: { type: 'number', minimum: 1000 },
            interest_rate: { type: 'number', minimum: 0, maximum: 30 },
            loan_term_years: { type: 'number', minimum: 1, maximum: 50 },
            payment_type: { 
              type: 'string', 
              enum: ['fully_amortizing', 'interest_only', 'balloon', 'partial_amortization'] 
            },
            balloon_period_years: { type: 'number', minimum: 1, maximum: 30 },
            amortization_schedule: { type: 'number', minimum: 1, maximum: 50 }
          },
          required: ['down_payment', 'seller_note_amount', 'interest_rate', 'loan_term_years', 'payment_type']
        },
        seller_profile: {
          type: 'object',
          properties: {
            seller_age: { type: 'number', minimum: 18, maximum: 100 },
            motivation_level: { 
              type: 'string', 
              enum: ['low', 'moderate', 'high', 'very_high', 'extremely_high'] 
            },
            tax_situation: { 
              type: 'string', 
              enum: ['minimize_taxes', 'spread_income', 'maximize_income', 'neutral'] 
            },
            cash_needs: { 
              type: 'string', 
              enum: ['immediate_cash', 'steady_income', 'future_lump_sum', 'flexible'] 
            },
            risk_tolerance: { 
              type: 'string', 
              enum: ['conservative', 'moderate', 'aggressive'] 
            }
          }
        },
        buyer_profile: {
          type: 'object',
          properties: {
            credit_score: { type: 'number', minimum: 300, maximum: 850 },
            down_payment_available: { type: 'number', minimum: 0 },
            monthly_income: { type: 'number', minimum: 0 },
            current_debts: { type: 'number', minimum: 0 },
            investment_experience: { 
              type: 'string', 
              enum: ['beginner', 'intermediate', 'advanced', 'expert'] 
            }
          }
        },
        market_conditions: {
          type: 'object',
          properties: {
            current_market_rates: { type: 'number', minimum: 0, maximum: 20 },
            property_appreciation_rate: { type: 'number', minimum: -10, maximum: 20 },
            rental_growth_rate: { type: 'number', minimum: -5, maximum: 15 },
            market_liquidity: { 
              type: 'string', 
              enum: ['very_low', 'low', 'moderate', 'high', 'very_high'] 
            }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            compare_scenarios: { type: 'boolean' },
            tax_analysis: { type: 'boolean' },
            risk_assessment: { type: 'boolean' },
            exit_strategies: { type: 'boolean' },
            sensitivity_analysis: { type: 'boolean' }
          }
        }
      },
      required: ['property_details', 'seller_financing_terms']
    };
  }

  calculate(params) {
    const {
      property_details,
      seller_financing_terms,
      seller_profile = {},
      buyer_profile = {},
      market_conditions = {},
      analysis_options = {}
    } = params;

    // Calculate basic financing metrics
    const financing_metrics = this.calculateFinancingMetrics(seller_financing_terms);
    
    // Analyze seller benefits
    const seller_benefits = this.analyzeSellerBenefits(
      property_details, 
      seller_financing_terms, 
      seller_profile,
      market_conditions
    );
    
    // Analyze buyer benefits
    const buyer_benefits = this.analyzeBuyerBenefits(
      property_details,
      seller_financing_terms,
      buyer_profile,
      market_conditions
    );
    
    // Calculate cash flow analysis for buyer
    const cash_flow_analysis = this.calculateCashFlowAnalysis(
      property_details,
      seller_financing_terms
    );
    
    // Generate risk assessment
    const risk_assessment = analysis_options.risk_assessment 
      ? this.assessRisks(property_details, seller_financing_terms, seller_profile, buyer_profile)
      : null;
    
    // Compare scenarios if requested
    const scenario_comparison = analysis_options.compare_scenarios
      ? this.compareScenarios(property_details, seller_financing_terms, market_conditions)
      : null;
    
    // Tax analysis
    const tax_analysis = analysis_options.tax_analysis
      ? this.analyzeTaxImplications(property_details, seller_financing_terms, seller_profile)
      : null;
    
    // Exit strategies
    const exit_strategies = analysis_options.exit_strategies
      ? this.analyzeExitStrategies(property_details, seller_financing_terms)
      : null;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      financing_metrics,
      seller_benefits,
      buyer_benefits,
      risk_assessment,
      market_conditions
    );

    return {
      deal_summary: {
        property_value: property_details.property_value,
        down_payment: seller_financing_terms.down_payment,
        seller_note_amount: seller_financing_terms.seller_note_amount,
        interest_rate: seller_financing_terms.interest_rate,
        loan_term_years: seller_financing_terms.loan_term_years,
        payment_type: seller_financing_terms.payment_type,
        ltv_ratio: (seller_financing_terms.seller_note_amount / property_details.property_value) * 100,
        down_payment_percentage: (seller_financing_terms.down_payment / property_details.property_value) * 100
      },
      financing_metrics,
      seller_benefits,
      buyer_benefits,
      cash_flow_analysis,
      risk_assessment,
      scenario_comparison,
      tax_analysis,
      exit_strategies,
      recommendations
    };
  }

  calculateFinancingMetrics(terms) {
    const {
      seller_note_amount,
      interest_rate,
      loan_term_years,
      payment_type,
      balloon_period_years = loan_term_years,
      amortization_schedule = loan_term_years
    } = terms;

    const monthly_rate = interest_rate / 100 / 12;
    const total_payments = loan_term_years * 12;
    const amortization_payments = amortization_schedule * 12;

    let monthly_payment = 0;
    let total_interest = 0;
    let balloon_payment = 0;

    switch (payment_type) {
      case 'fully_amortizing':
        monthly_payment = seller_note_amount * 
          (monthly_rate * Math.pow(1 + monthly_rate, total_payments)) /
          (Math.pow(1 + monthly_rate, total_payments) - 1);
        total_interest = (monthly_payment * total_payments) - seller_note_amount;
        break;

      case 'interest_only':
        monthly_payment = seller_note_amount * monthly_rate;
        total_interest = monthly_payment * total_payments;
        balloon_payment = seller_note_amount;
        break;

      case 'balloon':
        const balloon_payments = balloon_period_years * 12;
        monthly_payment = seller_note_amount * 
          (monthly_rate * Math.pow(1 + monthly_rate, amortization_payments)) /
          (Math.pow(1 + monthly_rate, amortization_payments) - 1);
        
        // Calculate remaining balance at balloon
        const remaining_balance = seller_note_amount * 
          (Math.pow(1 + monthly_rate, amortization_payments) - Math.pow(1 + monthly_rate, balloon_payments)) /
          (Math.pow(1 + monthly_rate, amortization_payments) - 1);
        
        balloon_payment = remaining_balance;
        total_interest = (monthly_payment * balloon_payments) + balloon_payment - seller_note_amount;
        break;

      case 'partial_amortization':
        monthly_payment = seller_note_amount * 
          (monthly_rate * Math.pow(1 + monthly_rate, amortization_payments)) /
          (Math.pow(1 + monthly_rate, amortization_payments) - 1);
        
        // Calculate remaining balance at term end
        const remaining_partial = seller_note_amount * 
          (Math.pow(1 + monthly_rate, amortization_payments) - Math.pow(1 + monthly_rate, total_payments)) /
          (Math.pow(1 + monthly_rate, amortization_payments) - 1);
        
        balloon_payment = remaining_partial;
        total_interest = (monthly_payment * total_payments) + balloon_payment - seller_note_amount;
        break;
    }

    // Calculate effective yield for seller
    const annual_yield = total_interest / seller_note_amount / loan_term_years * 100;
    
    return {
      monthly_payment: Math.round(monthly_payment),
      total_interest: Math.round(total_interest),
      balloon_payment: Math.round(balloon_payment),
      total_payments_to_seller: Math.round(seller_note_amount + total_interest),
      effective_annual_yield: Math.round(annual_yield * 100) / 100,
      payment_schedule: this.generatePaymentSchedule(terms, monthly_payment)
    };
  }

  generatePaymentSchedule(terms, monthly_payment) {
    const { seller_note_amount, interest_rate, loan_term_years } = terms;
    const monthly_rate = interest_rate / 100 / 12;
    let remaining_balance = seller_note_amount;
    const schedule = [];

    for (let month = 1; month <= Math.min(loan_term_years * 12, 60); month++) { // Show first 5 years
      const interest_payment = remaining_balance * monthly_rate;
      const principal_payment = monthly_payment - interest_payment;
      remaining_balance -= principal_payment;

      if (month <= 12 || month % 12 === 0) { // Show monthly for year 1, then annually
        schedule.push({
          period: month,
          payment: Math.round(monthly_payment),
          principal: Math.round(principal_payment),
          interest: Math.round(interest_payment),
          balance: Math.round(Math.max(0, remaining_balance))
        });
      }
    }

    return schedule;
  }

  analyzeSellerBenefits(property_details, terms, seller_profile, market_conditions) {
    const { property_value } = property_details;
    const { seller_note_amount, interest_rate } = terms;
    const current_market_rates = market_conditions.current_market_rates || 5.0;

    const benefits = [];
    let total_benefit_score = 0;

    // Interest rate advantage
    if (interest_rate > current_market_rates) {
      const rate_advantage = interest_rate - current_market_rates;
      benefits.push({
        benefit: 'Higher Interest Rate',
        description: `Earning ${interest_rate}% vs ${current_market_rates}% market rate`,
        annual_value: Math.round(seller_note_amount * rate_advantage / 100),
        impact: rate_advantage > 2 ? 'High' : rate_advantage > 1 ? 'Medium' : 'Low'
      });
      total_benefit_score += rate_advantage * 10;
    }

    // Tax deferral benefits
    if (seller_profile.tax_situation === 'spread_income') {
      const annual_income = seller_note_amount * interest_rate / 100;
      benefits.push({
        benefit: 'Tax Deferral',
        description: 'Spread capital gains over loan term vs lump sum',
        annual_value: Math.round(annual_income * 0.15), // Estimated tax savings
        impact: 'High'
      });
      total_benefit_score += 25;
    }

    // Cash flow benefit
    const monthly_income = Math.round(seller_note_amount * interest_rate / 100 / 12);
    if (seller_profile.cash_needs === 'steady_income') {
      benefits.push({
        benefit: 'Steady Monthly Income',
        description: `Predictable ${monthly_income}/month income stream`,
        annual_value: monthly_income * 12,
        impact: 'Medium'
      });
      total_benefit_score += 15;
    }

    // Market conditions advantage
    if (market_conditions.market_liquidity === 'low' || market_conditions.market_liquidity === 'very_low') {
      benefits.push({
        benefit: 'Enhanced Marketability',
        description: 'Seller financing makes property more attractive to buyers',
        annual_value: Math.round(property_value * 0.02), // 2% value enhancement
        impact: 'High'
      });
      total_benefit_score += 20;
    }

    // No realtor commissions on full price
    const commission_savings = Math.round(property_value * 0.06);
    benefits.push({
      benefit: 'Commission Savings',
      description: 'Potential to sell at full price without realtor commissions',
      annual_value: commission_savings,
      impact: 'High'
    });
    total_benefit_score += 15;

    return {
      benefits,
      total_annual_benefit: benefits.reduce((sum, b) => sum + b.annual_value, 0),
      benefit_score: Math.min(100, total_benefit_score),
      rating: total_benefit_score > 60 ? 'Excellent' : 
              total_benefit_score > 40 ? 'Very Good' :
              total_benefit_score > 25 ? 'Good' : 'Fair'
    };
  }

  analyzeBuyerBenefits(property_details, terms, buyer_profile, market_conditions) {
    const { property_value, monthly_rent = 0 } = property_details;
    const { down_payment, interest_rate } = terms;
    const current_market_rates = market_conditions.current_market_rates || 7.0;

    const benefits = [];
    let total_benefit_score = 0;

    // Interest rate savings
    if (interest_rate < current_market_rates) {
      const rate_savings = current_market_rates - interest_rate;
      const annual_savings = (property_value - down_payment) * rate_savings / 100;
      benefits.push({
        benefit: 'Below Market Interest Rate',
        description: `${interest_rate}% vs ${current_market_rates}% market rate`,
        annual_value: Math.round(annual_savings),
        impact: rate_savings > 1 ? 'High' : 'Medium'
      });
      total_benefit_score += rate_savings * 15;
    }

    // Qualification advantages
    if (buyer_profile.credit_score && buyer_profile.credit_score < 640) {
      benefits.push({
        benefit: 'Easier Qualification',
        description: 'Bypass strict bank lending requirements',
        annual_value: 0,
        impact: 'High'
      });
      total_benefit_score += 25;
    }

    // Speed to close
    benefits.push({
      benefit: 'Faster Closing',
      description: 'Close in 2-3 weeks vs 30-45 days with traditional financing',
      annual_value: monthly_rent * 2, // Value of faster cash flow
      impact: 'Medium'
    });
    total_benefit_score += 10;

    // Negotiation leverage
    if (down_payment < property_value * 0.20) {
      benefits.push({
        benefit: 'Lower Down Payment',
        description: `Only ${(down_payment/property_value*100).toFixed(1)}% down vs typical 20-25%`,
        annual_value: Math.round((property_value * 0.20 - down_payment) * 0.08), // Opportunity cost
        impact: 'High'
      });
      total_benefit_score += 20;
    }

    return {
      benefits,
      total_annual_benefit: benefits.reduce((sum, b) => sum + b.annual_value, 0),
      benefit_score: Math.min(100, total_benefit_score),
      rating: total_benefit_score > 50 ? 'Excellent' :
              total_benefit_score > 35 ? 'Very Good' :
              total_benefit_score > 20 ? 'Good' : 'Fair'
    };
  }

  calculateCashFlowAnalysis(property_details, terms) {
    const { monthly_rent = 0, operating_expenses = 0 } = property_details;
    const monthly_payment = this.calculateFinancingMetrics(terms).monthly_payment;

    const gross_monthly_income = monthly_rent;
    const net_operating_income = gross_monthly_income - operating_expenses;
    const monthly_cash_flow = net_operating_income - monthly_payment;
    const annual_cash_flow = monthly_cash_flow * 12;

    // Calculate cash-on-cash return
    const cash_invested = terms.down_payment;
    const cash_on_cash_return = cash_invested > 0 ? (annual_cash_flow / cash_invested) * 100 : 0;

    // Calculate debt service coverage ratio
    const annual_debt_service = monthly_payment * 12;
    const dscr = annual_debt_service > 0 ? (net_operating_income * 12) / annual_debt_service : 0;

    return {
      gross_monthly_income,
      operating_expenses,
      net_operating_income,
      monthly_payment,
      monthly_cash_flow,
      annual_cash_flow,
      cash_on_cash_return: Math.round(cash_on_cash_return * 100) / 100,
      debt_service_coverage_ratio: Math.round(dscr * 100) / 100,
      cash_flow_rating: this.rateCashFlow(cash_on_cash_return, dscr)
    };
  }

  rateCashFlow(cocr, dscr) {
    if (cocr >= 12 && dscr >= 1.3) return 'Excellent';
    if (cocr >= 8 && dscr >= 1.2) return 'Very Good';
    if (cocr >= 5 && dscr >= 1.1) return 'Good';
    if (cocr >= 0 && dscr >= 1.0) return 'Fair';
    return 'Poor';
  }

  assessRisks(property_details, terms, seller_profile, buyer_profile) {
    const risks = [];
    let total_risk_score = 0;

    // Seller risks
    if (buyer_profile.credit_score && buyer_profile.credit_score < 600) {
      risks.push({
        category: 'Credit Risk',
        risk: 'Buyer Default Risk',
        level: 'High',
        description: 'Low buyer credit score increases default probability',
        mitigation: 'Require larger down payment, personal guarantees, or additional security'
      });
      total_risk_score += 25;
    }

    // Interest rate risk for seller
    if (terms.payment_type === 'interest_only' || terms.payment_type === 'balloon') {
      risks.push({
        category: 'Payment Risk',
        risk: 'Balloon Payment Risk',
        level: 'Medium',
        description: 'Large balloon payment may be difficult for buyer to refinance',
        mitigation: 'Include refinancing assistance clause or extend amortization'
      });
      total_risk_score += 15;
    }

    // Market risk
    const ltv = (terms.seller_note_amount / property_details.property_value) * 100;
    if (ltv > 80) {
      risks.push({
        category: 'Market Risk',
        risk: 'High Loan-to-Value',
        level: ltv > 90 ? 'High' : 'Medium',
        description: `${ltv.toFixed(1)}% LTV provides limited equity cushion`,
        mitigation: 'Require higher down payment or property improvement escrow'
      });
      total_risk_score += ltv > 90 ? 20 : 10;
    }

    // Legal/Documentation risk
    risks.push({
      category: 'Legal Risk',
      risk: 'Documentation Complexity',
      level: 'Medium',
      description: 'Seller financing requires comprehensive legal documentation',
      mitigation: 'Use experienced real estate attorney for all documentation'
    });
    total_risk_score += 10;

    return {
      identified_risks: risks,
      risk_score: Math.min(100, total_risk_score),
      overall_risk_level: total_risk_score > 60 ? 'High' :
                         total_risk_score > 30 ? 'Medium' : 'Low',
      risk_mitigation_strategies: this.generateRiskMitigation(risks)
    };
  }

  generateRiskMitigation(risks) {
    const strategies = [
      'Use comprehensive promissory note and deed of trust',
      'Require title insurance and property insurance',
      'Include personal guarantee from buyer if applicable',
      'Set up automatic payment processing',
      'Include property maintenance requirements',
      'Establish clear default and foreclosure procedures',
      'Consider mortgage servicing company for payment collection'
    ];

    return strategies;
  }

  compareScenarios(property_details, base_terms, market_conditions) {
    const scenarios = [];

    // Base scenario
    const base_metrics = this.calculateFinancingMetrics(base_terms);
    scenarios.push({
      scenario: 'Base Terms',
      terms: base_terms,
      monthly_payment: base_metrics.monthly_payment,
      total_interest: base_metrics.total_interest,
      effective_yield: base_metrics.effective_annual_yield
    });

    // Higher interest rate scenario
    const higher_rate_terms = { ...base_terms, interest_rate: base_terms.interest_rate + 1 };
    const higher_rate_metrics = this.calculateFinancingMetrics(higher_rate_terms);
    scenarios.push({
      scenario: 'Higher Rate (+1%)',
      terms: higher_rate_terms,
      monthly_payment: higher_rate_metrics.monthly_payment,
      total_interest: higher_rate_metrics.total_interest,
      effective_yield: higher_rate_metrics.effective_annual_yield
    });

    // Shorter term scenario
    const shorter_term = Math.max(5, base_terms.loan_term_years - 5);
    const shorter_terms = { ...base_terms, loan_term_years: shorter_term };
    const shorter_metrics = this.calculateFinancingMetrics(shorter_terms);
    scenarios.push({
      scenario: `Shorter Term (${shorter_term} years)`,
      terms: shorter_terms,
      monthly_payment: shorter_metrics.monthly_payment,
      total_interest: shorter_metrics.total_interest,
      effective_yield: shorter_metrics.effective_annual_yield
    });

    return {
      scenarios,
      best_for_cash_flow: scenarios.reduce((min, s) => 
        s.monthly_payment < min.monthly_payment ? s : min
      ),
      best_for_total_return: scenarios.reduce((max, s) => 
        s.total_interest > max.total_interest ? s : max
      )
    };
  }

  analyzeTaxImplications(property_details, terms, seller_profile) {
    const { property_value } = property_details;
    const { seller_note_amount, interest_rate, loan_term_years } = terms;

    // Estimate capital gains
    const estimated_basis = property_value * 0.75; // Assume 25% gain
    const capital_gain = property_value - estimated_basis;
    const annual_gain_recognition = capital_gain / loan_term_years;

    // Interest income
    const annual_interest_income = seller_note_amount * interest_rate / 100;

    // Tax implications
    const estimated_capital_gains_rate = 0.15; // 15% for most sellers
    const estimated_ordinary_rate = 0.24; // 24% bracket

    const annual_capital_gains_tax = annual_gain_recognition * estimated_capital_gains_rate;
    const annual_interest_tax = annual_interest_income * estimated_ordinary_rate;
    const total_annual_tax = annual_capital_gains_tax + annual_interest_tax;

    return {
      capital_gain_total: Math.round(capital_gain),
      annual_gain_recognition: Math.round(annual_gain_recognition),
      annual_interest_income: Math.round(annual_interest_income),
      estimated_annual_taxes: {
        capital_gains_tax: Math.round(annual_capital_gains_tax),
        interest_income_tax: Math.round(annual_interest_tax),
        total_annual_tax: Math.round(total_annual_tax)
      },
      tax_advantages: [
        'Spread capital gains recognition over loan term',
        'Potential for lower tax brackets with spread income',
        'Interest income taxed as ordinary income',
        'Depreciation recapture spread over payments received'
      ],
      recommendations: [
        'Consult tax professional for specific situation',
        'Consider installment sale election under IRC 453',
        'Plan for quarterly estimated tax payments',
        'Keep detailed records of all payments received'
      ]
    };
  }

  analyzeExitStrategies(property_details, terms) {
    const strategies = [];

    // Full payoff strategy
    strategies.push({
      strategy: 'Hold to Maturity',
      timeline: `${terms.loan_term_years} years`,
      description: 'Receive all payments as scheduled',
      pros: ['Predictable income stream', 'Full interest earnings', 'No reinvestment risk'],
      cons: ['Long-term commitment', 'Inflation risk', 'Limited liquidity'],
      best_for: 'Sellers wanting steady long-term income'
    });

    // Early payoff
    strategies.push({
      strategy: 'Early Payoff Incentive',
      timeline: '3-7 years',
      description: 'Offer discount for early payoff',
      pros: ['Immediate cash', 'Eliminate default risk', 'Reinvestment opportunity'],
      cons: ['Reduced total return', 'Loss of income stream'],
      best_for: 'Sellers needing liquidity or wanting to redeploy capital'
    });

    // Note sale
    strategies.push({
      strategy: 'Sell Note to Investor',
      timeline: 'Any time',
      description: 'Sell promissory note to note investor',
      pros: ['Immediate cash', 'Transfer of risk', 'Market liquidity'],
      cons: ['Discount to face value (20-40%)', 'Lost future income'],
      best_for: 'Emergency liquidity needs or risk reduction'
    });

    // Partial note sale
    strategies.push({
      strategy: 'Partial Note Sale',
      timeline: 'Any time',
      description: 'Sell portion of payments to investor',
      pros: ['Immediate partial cash', 'Retain some income', 'Flexibility'],
      cons: ['Complex structure', 'Reduced yield on sold portion'],
      best_for: 'Moderate liquidity needs while retaining income'
    });

    return {
      available_strategies: strategies,
      recommended_strategy: 'Hold to Maturity',
      liquidity_options: [
        'Note sale to investor (expect 60-80% of face value)',
        'Partial assignment of payments',
        'Use note as collateral for loan'
      ]
    };
  }

  generateRecommendations(financing_metrics, seller_benefits, buyer_benefits, risk_assessment, market_conditions) {
    const recommendations = [];

    // Overall deal assessment
    const combined_score = (seller_benefits.benefit_score + buyer_benefits.benefit_score) / 2;
    if (combined_score > 60) {
      recommendations.push({
        category: 'Deal Structure',
        recommendation: '✅ Proceed with seller financing',
        reasoning: 'Strong mutual benefits for both parties',
        priority: 'High'
      });
    } else if (combined_score > 40) {
      recommendations.push({
        category: 'Deal Structure',
        recommendation: '⚠️ Consider with modifications',
        reasoning: 'Moderate benefits, optimize terms for better outcome',
        priority: 'Medium'
      });
    } else {
      recommendations.push({
        category: 'Deal Structure',
        recommendation: '❌ Not recommended in current form',
        reasoning: 'Limited benefits, consider alternative strategies',
        priority: 'High'
      });
    }

    // Interest rate recommendations
    const current_rates = market_conditions.current_market_rates || 7.0;
    if (financing_metrics.effective_annual_yield < current_rates - 0.5) {
      recommendations.push({
        category: 'Pricing',
        recommendation: 'Consider increasing interest rate',
        reasoning: `Current rate of ${financing_metrics.effective_annual_yield}% is below market`,
        priority: 'Medium'
      });
    }

    // Risk mitigation
    if (risk_assessment && risk_assessment.risk_score > 40) {
      recommendations.push({
        category: 'Risk Management',  
        recommendation: 'Implement comprehensive risk mitigation',
        reasoning: 'High risk score requires additional protections',
        priority: 'High'
      });
    }

    // Documentation
    recommendations.push({
      category: 'Legal',
      recommendation: 'Use experienced real estate attorney',
      reasoning: 'Proper documentation is critical for seller financing',
      priority: 'High'
    });

    return {
      recommendations,
      overall_assessment: combined_score > 60 ? 'Highly Recommended' :
                         combined_score > 40 ? 'Recommended with Modifications' :
                         'Not Recommended',
      key_success_factors: [
        'Comprehensive legal documentation',
        'Thorough buyer qualification',
        'Competitive but fair interest rate',
        'Clear payment and default procedures',
        'Regular payment monitoring'
      ]
    };
  }
}