/**
 * Subject-To Deal Calculator
 * Analyzes subject-to real estate deals where buyer takes over existing mortgage payments
 */

export class SubjectToDealCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        property_details: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Property address' },
            property_type: {
              type: 'string',
              enum: ['single_family', 'multi_family', 'condo', 'townhouse'],
              description: 'Type of property'
            },
            square_footage: { type: 'number', minimum: 0, description: 'Total square footage' },
            bedrooms: { type: 'number', minimum: 0, description: 'Number of bedrooms' },
            bathrooms: { type: 'number', minimum: 0, description: 'Number of bathrooms' },
            year_built: { type: 'number', minimum: 1800, description: 'Year property was built' },
            condition: {
              type: 'string',
              enum: ['excellent', 'good', 'fair', 'poor'],
              description: 'Current condition of property'
            },
            current_market_value: { type: 'number', minimum: 0, description: 'Current market value' }
          },
          required: ['property_type', 'current_market_value']
        },
        existing_mortgage: {
          type: 'object',
          properties: {
            original_loan_amount: { type: 'number', minimum: 0, description: 'Original loan amount' },
            current_balance: { type: 'number', minimum: 0, description: 'Current mortgage balance' },
            monthly_payment: { type: 'number', minimum: 0, description: 'Monthly PITI payment' },
            interest_rate: { type: 'number', minimum: 0, maximum: 30, description: 'Interest rate (%)' },
            remaining_term_months: { type: 'number', minimum: 1, description: 'Remaining term in months' },
            loan_type: {
              type: 'string',
              enum: ['conventional', 'fha', 'va', 'usda', 'portfolio'],
              description: 'Type of existing loan'
            },
            pmi_monthly: { type: 'number', minimum: 0, description: 'Monthly PMI payment' },
            property_taxes_monthly: { type: 'number', minimum: 0, description: 'Monthly property taxes' },
            insurance_monthly: { type: 'number', minimum: 0, description: 'Monthly insurance' },
            hoa_monthly: { type: 'number', minimum: 0, description: 'Monthly HOA fees' }
          },
          required: ['current_balance', 'monthly_payment', 'interest_rate', 'remaining_term_months']
        },
        seller_situation: {
          type: 'object',
          properties: {
            reason_for_selling: {
              type: 'string',
              enum: ['foreclosure_threat', 'job_relocation', 'financial_hardship', 'inherited_property', 'divorce', 'health_issues', 'other'],
              description: 'Seller\'s primary reason for selling'
            },
            months_behind: { type: 'number', minimum: 0, description: 'Months behind on payments' },
            arrears_amount: { type: 'number', minimum: 0, description: 'Total amount in arrears' },
            foreclosure_date: { type: 'string', description: 'Scheduled foreclosure date if applicable' },
            seller_equity: { type: 'number', description: 'Seller\'s equity in property (can be negative)' },
            seller_motivation_level: {
              type: 'string',
              enum: ['extremely_high', 'very_high', 'high', 'moderate'],
              description: 'Level of seller motivation'
            }
          },
          required: ['reason_for_selling', 'seller_motivation_level']
        },
        deal_structure: {
          type: 'object',
          properties: {
            purchase_price: { type: 'number', minimum: 0, description: 'Agreed purchase price' },
            cash_to_seller: { type: 'number', minimum: 0, description: 'Cash payment to seller' },
            closing_costs: { type: 'number', minimum: 0, description: 'Estimated closing costs' },
            repair_costs: { type: 'number', minimum: 0, description: 'Estimated repair costs' },
            deed_transfer_method: {
              type: 'string',
              enum: ['warranty_deed', 'quitclaim_deed', 'land_contract', 'lease_option'],
              description: 'Method of deed transfer'
            },
            authorization_agreements: {
              type: 'boolean',
              description: 'Whether authorization to pay agreements are in place'
            }
          },
          required: ['purchase_price', 'cash_to_seller', 'deed_transfer_method']
        },
        rental_analysis: {
          type: 'object',
          properties: {
            estimated_monthly_rent: { type: 'number', minimum: 0, description: 'Estimated monthly rental income' },
            vacancy_rate: { type: 'number', minimum: 0, maximum: 100, description: 'Expected vacancy rate (%)' },
            property_management_rate: { type: 'number', minimum: 0, maximum: 50, description: 'Property management fee (%)' },
            maintenance_reserves: { type: 'number', minimum: 0, description: 'Monthly maintenance reserves' },
            tenant_placement_fee: { type: 'number', minimum: 0, description: 'Tenant placement fee' }
          },
          required: ['estimated_monthly_rent']
        },
        analysis_options: {
          type: 'object',
          properties: {
            include_legal_risks: { type: 'boolean', description: 'Include legal risk analysis' },
            calculate_exit_strategies: { type: 'boolean', description: 'Calculate exit strategy options' },
            insurance_analysis: { type: 'boolean', description: 'Analyze insurance requirements' },
            long_term_projections: { type: 'boolean', description: 'Include 5-year projections' }
          }
        }
      },
      required: ['property_details', 'existing_mortgage', 'seller_situation', 'deal_structure', 'rental_analysis']
    };
  }

  calculate(params) {
    const {
      property_details,
      existing_mortgage,
      seller_situation,
      deal_structure,
      rental_analysis,
      analysis_options = {}
    } = params;

    // Calculate deal metrics
    const deal_metrics = this.calculateDealMetrics(
      property_details,
      existing_mortgage,
      deal_structure
    );

    // Analyze cash flow
    const cash_flow_analysis = this.analyzeCashFlow(
      existing_mortgage,
      rental_analysis,
      deal_structure
    );

    // Calculate equity and appreciation
    const equity_analysis = this.analyzeEquity(
      property_details,
      existing_mortgage,
      deal_structure
    );

    // Risk assessment
    const risk_analysis = analysis_options.include_legal_risks ?
      this.assessRisks(
        existing_mortgage,
        seller_situation,
        deal_structure,
        property_details
      ) : null;

    // Exit strategies
    const exit_strategies = analysis_options.calculate_exit_strategies ?
      this.calculateExitStrategies(
        property_details,
        existing_mortgage,
        deal_structure,
        cash_flow_analysis
      ) : null;

    // Insurance analysis
    const insurance_analysis = analysis_options.insurance_analysis ?
      this.analyzeInsuranceRequirements(
        property_details,
        existing_mortgage,
        deal_structure
      ) : null;

    // Long-term projections
    const projections = analysis_options.long_term_projections ?
      this.calculateLongTermProjections(
        property_details,
        existing_mortgage,
        cash_flow_analysis,
        equity_analysis
      ) : null;

    return {
      deal_summary: this.createDealSummary(
        property_details,
        deal_structure,
        seller_situation
      ),
      deal_metrics,
      cash_flow_analysis,
      equity_analysis,
      risk_assessment: risk_analysis,
      exit_strategies,
      insurance_requirements: insurance_analysis,
      long_term_projections: projections,
      recommendations: this.generateRecommendations(
        deal_metrics,
        cash_flow_analysis,
        risk_analysis,
        existing_mortgage,
        seller_situation
      )
    };
  }

  createDealSummary(property_details, deal_structure, seller_situation) {
    return {
      property_type: property_details.property_type,
      current_market_value: property_details.current_market_value,
      purchase_price: deal_structure.purchase_price,
      cash_required: deal_structure.cash_to_seller + (deal_structure.closing_costs || 0) + (deal_structure.repair_costs || 0),
      seller_motivation: seller_situation.seller_motivation_level,
      deal_type: 'Subject-To Acquisition',
      transfer_method: deal_structure.deed_transfer_method
    };
  }

  calculateDealMetrics(property_details, existing_mortgage, deal_structure) {
    const market_value = property_details.current_market_value;
    const purchase_price = deal_structure.purchase_price;
    const mortgage_balance = existing_mortgage.current_balance;
    const cash_to_seller = deal_structure.cash_to_seller;
    const closing_costs = deal_structure.closing_costs || 0;
    const repair_costs = deal_structure.repair_costs || 0;

    // Total cash invested
    const total_cash_invested = cash_to_seller + closing_costs + repair_costs;
    
    // Instant equity calculation
    const instant_equity = market_value - mortgage_balance - total_cash_invested;
    
    // Equity percentage
    const equity_percentage = (instant_equity / market_value) * 100;
    
    // Loan-to-value ratio
    const ltv_ratio = (mortgage_balance / market_value) * 100;
    
    // Deal efficiency metrics
    const acquisition_discount = market_value - purchase_price;
    const discount_percentage = (acquisition_discount / market_value) * 100;
    
    // Leverage analysis
    const effective_leverage = mortgage_balance / (total_cash_invested || 1);
    
    return {
      market_value,
      purchase_price,
      mortgage_balance,
      total_cash_invested,
      instant_equity,
      equity_percentage,
      ltv_ratio,
      acquisition_discount,
      discount_percentage,
      effective_leverage,
      deal_quality_score: this.calculateDealQualityScore(
        discount_percentage,
        equity_percentage,
        ltv_ratio,
        effective_leverage
      )
    };
  }

  analyzeCashFlow(existing_mortgage, rental_analysis, deal_structure) {
    const monthly_payment = existing_mortgage.monthly_payment;
    const gross_rent = rental_analysis.estimated_monthly_rent;
    const vacancy_rate = (rental_analysis.vacancy_rate || 5) / 100;
    const management_rate = (rental_analysis.property_management_rate || 0) / 100;
    const maintenance_reserves = rental_analysis.maintenance_reserves || gross_rent * 0.05;

    // Effective rental income
    const effective_rent = gross_rent * (1 - vacancy_rate);
    
    // Management fees
    const management_fee = effective_rent * management_rate;
    
    // Total monthly expenses
    const total_expenses = monthly_payment + management_fee + maintenance_reserves;
    
    // Net cash flow
    const net_cash_flow = effective_rent - total_expenses;
    
    // Cash-on-cash return
    const cash_invested = deal_structure.cash_to_seller + (deal_structure.closing_costs || 0) + (deal_structure.repair_costs || 0);
    const annual_cash_flow = net_cash_flow * 12;
    const cash_on_cash_return = cash_invested > 0 ? (annual_cash_flow / cash_invested) * 100 : null;
    
    // Cash flow coverage ratio
    const cash_flow_coverage = effective_rent / monthly_payment;
    
    return {
      gross_monthly_rent: gross_rent,
      effective_monthly_rent: effective_rent,
      monthly_expenses: {
        mortgage_payment: monthly_payment,
        management_fee,
        maintenance_reserves,
        total: total_expenses
      },
      net_monthly_cash_flow: net_cash_flow,
      annual_cash_flow,
      cash_on_cash_return,
      cash_flow_coverage_ratio: cash_flow_coverage,
      cash_flow_rating: this.rateCashFlow(net_cash_flow, cash_flow_coverage, cash_on_cash_return)
    };
  }

  analyzeEquity(property_details, existing_mortgage, deal_structure) {
    const market_value = property_details.current_market_value;
    const mortgage_balance = existing_mortgage.current_balance;
    const monthly_payment = existing_mortgage.monthly_payment;
    const interest_rate = existing_mortgage.interest_rate / 100 / 12;
    const remaining_months = existing_mortgage.remaining_term_months;

    // Current equity position
    const current_equity = market_value - mortgage_balance;
    const current_ltv = (mortgage_balance / market_value) * 100;

    // Calculate monthly principal payment
    const monthly_principal = this.calculateMonthlyPrincipal(
      mortgage_balance,
      interest_rate,
      remaining_months,
      monthly_payment
    );

    // Annual principal paydown
    const annual_principal_paydown = monthly_principal * 12;

    // Equity build-up over time (assuming 3% appreciation)
    const annual_appreciation_rate = 0.03;
    const annual_appreciation = market_value * annual_appreciation_rate;

    // Total annual equity gain
    const total_annual_equity_gain = annual_principal_paydown + annual_appreciation;

    // 5-year equity projection
    const five_year_projections = this.projectEquityGrowth(
      market_value,
      mortgage_balance,
      monthly_principal,
      annual_appreciation_rate,
      60 // 5 years
    );

    return {
      current_equity,
      current_ltv,
      monthly_principal_paydown: monthly_principal,
      annual_principal_paydown,
      annual_appreciation,
      total_annual_equity_gain,
      equity_growth_rate: (total_annual_equity_gain / current_equity) * 100,
      five_year_projections,
      equity_multiple: five_year_projections.final_equity / current_equity
    };
  }

  assessRisks(existing_mortgage, seller_situation, deal_structure, property_details) {
    const risks = [];
    let risk_score = 0;

    // Due-on-sale clause risk
    if (existing_mortgage.loan_type === 'conventional' || existing_mortgage.loan_type === 'portfolio') {
      risks.push({
        category: 'Legal Risk',
        level: 'High',
        description: 'Due-on-sale clause may trigger loan acceleration',
        impact: 'Lender could demand immediate full payment',
        mitigation: 'Use authorization agreements and avoid triggering events'
      });
      risk_score += 4;
    } else if (existing_mortgage.loan_type === 'fha' || existing_mortgage.loan_type === 'va') {
      risks.push({
        category: 'Legal Risk',
        level: 'Medium',
        description: 'Government loans have due-on-sale clauses but less enforcement',
        impact: 'Lower probability of acceleration',
        mitigation: 'Maintain payment history and low profile'
      });
      risk_score += 2;
    }

    // Title and insurance risks
    if (!deal_structure.authorization_agreements) {
      risks.push({
        category: 'Insurance Risk',
        level: 'High',
        description: 'No authorization agreements increase insurance complications',
        impact: 'Difficulty obtaining adequate insurance coverage',
        mitigation: 'Obtain seller authorization and power of attorney'
      });
      risk_score += 3;
    }

    // Seller default risk
    if (seller_situation.months_behind > 0) {
      const risk_level = seller_situation.months_behind >= 3 ? 'High' : 'Medium';
      risks.push({
        category: 'Payment Risk',
        level: risk_level,
        description: `Seller is ${seller_situation.months_behind} months behind on payments`,
        impact: 'May need to cure arrears to prevent foreclosure',
        mitigation: 'Bring loan current as part of acquisition'
      });
      risk_score += seller_situation.months_behind >= 3 ? 3 : 2;
    }

    // Market risk
    const ltv = (existing_mortgage.current_balance / property_details.current_market_value) * 100;
    if (ltv > 90) {
      risks.push({
        category: 'Market Risk',
        level: 'High',
        description: 'High LTV leaves little equity cushion',
        impact: 'Vulnerable to market downturns',
        mitigation: 'Ensure strong cash flow to weather market changes'
      });
      risk_score += 3;
    } else if (ltv > 80) {
      risks.push({
        category: 'Market Risk',
        level: 'Medium',
        description: 'Moderate LTV with limited equity buffer',
        impact: 'Some vulnerability to market fluctuations',
        mitigation: 'Monitor market conditions closely'
      });
      risk_score += 2;
    }

    // Interest rate risk
    if (existing_mortgage.interest_rate > 7) {
      risks.push({
        category: 'Interest Rate Risk',
        level: 'Medium',
        description: 'High interest rate affects cash flow',
        impact: 'Reduced profitability compared to current rates',
        mitigation: 'Consider refinance opportunities in future'
      });
      risk_score += 2;
    }

    // Seller motivation risk
    if (seller_situation.seller_motivation_level === 'moderate') {
      risks.push({
        category: 'Deal Risk',
        level: 'Medium',
        description: 'Moderate seller motivation may lead to deal complications',
        impact: 'Seller may change terms or find alternative solutions',
        mitigation: 'Structure deal to benefit seller significantly'
      });
      risk_score += 2;
    }

    const overall_risk_level = risk_score >= 10 ? 'Very High' :
                              risk_score >= 7 ? 'High' :
                              risk_score >= 4 ? 'Medium' : 'Low';

    return {
      identified_risks: risks,
      risk_score,
      overall_risk_level,
      legal_compliance_score: this.calculateLegalComplianceScore(deal_structure, existing_mortgage),
      risk_mitigation_strategies: this.getRiskMitigationStrategies(risks)
    };
  }

  calculateExitStrategies(property_details, existing_mortgage, deal_structure, cash_flow_analysis) {
    const market_value = property_details.current_market_value;
    const mortgage_balance = existing_mortgage.current_balance;
    const total_invested = deal_structure.cash_to_seller + (deal_structure.closing_costs || 0) + (deal_structure.repair_costs || 0);

    const strategies = [];

    // Strategy 1: Hold and rent (current analysis)
    strategies.push({
      strategy: 'Hold and Rent',
      description: 'Continue making payments and collect rental income',
      timeline: 'Long-term (5+ years)',
      cash_flow: cash_flow_analysis.net_monthly_cash_flow,
      total_return_5_year: this.calculateHoldReturn(market_value, mortgage_balance, cash_flow_analysis, 60),
      pros: ['Passive income', 'Equity build-up', 'Tax benefits'],
      cons: ['Due-on-sale risk', 'Property management', 'Market risk'],
      exit_requirements: 'None - continue current structure'
    });

    // Strategy 2: Refinance and legitimize
    const refinance_amount = mortgage_balance * 1.05; // Assume 5% closing costs
    const new_payment = this.calculateMonthlyPayment(refinance_amount, 0.07, 360); // 7% 30-year
    const refinance_cash_flow = cash_flow_analysis.gross_monthly_rent * 0.95 - new_payment - cash_flow_analysis.monthly_expenses.maintenance_reserves;
    
    strategies.push({
      strategy: 'Refinance',
      description: 'Obtain new loan in your name to pay off existing mortgage',
      timeline: '3-6 months',
      cash_flow: refinance_cash_flow,
      total_return_5_year: this.calculateHoldReturn(market_value, refinance_amount, { net_monthly_cash_flow: refinance_cash_flow }, 60),
      pros: ['Eliminates due-on-sale risk', 'Clean title', 'Better insurance options'],
      cons: ['Qualification requirements', 'Closing costs', 'Higher payment possible'],
      exit_requirements: 'Income verification, credit approval, appraisal'
    });

    // Strategy 3: Sell with seller financing
    const seller_finance_price = market_value * 0.95; // 5% discount for seller financing
    const seller_finance_profit = seller_finance_price - mortgage_balance - total_invested;
    
    strategies.push({
      strategy: 'Sell with Owner Financing',
      description: 'Sell property with owner financing to another investor',
      timeline: '6-12 months',
      cash_flow: 0, // One-time profit
      total_return_5_year: seller_finance_profit,
      pros: ['Quick exit', 'Good profit potential', 'Monthly income stream'],
      cons: ['Buyer default risk', 'Property management', 'Market timing'],
      exit_requirements: 'Find qualified buyer, due-on-sale risk remains'
    });

    // Strategy 4: Quick sale
    const quick_sale_price = market_value * 0.85; // 15% discount for quick sale
    const quick_sale_profit = quick_sale_price - mortgage_balance - total_invested;
    
    strategies.push({
      strategy: 'Quick Sale',
      description: 'Sell property quickly to cash buyer',
      timeline: '1-3 months',
      cash_flow: 0,
      total_return_5_year: quick_sale_profit,
      pros: ['Fast exit', 'No ongoing risk', 'Immediate liquidity'],
      cons: ['Below market price', 'Limited profit', 'Lost appreciation potential'],
      exit_requirements: 'Find cash buyer, clear title issues'
    });

    return {
      available_strategies: strategies,
      recommended_strategy: this.recommendBestExitStrategy(strategies, cash_flow_analysis),
      strategy_comparison: this.compareExitStrategies(strategies)
    };
  }

  analyzeInsuranceRequirements(property_details, existing_mortgage, deal_structure) {
    const challenges = [];
    const solutions = [];

    // Standard homeowner's insurance challenges
    if (deal_structure.deed_transfer_method === 'quitclaim_deed') {
      challenges.push('Quitclaim deed may complicate insurance claims');
      solutions.push('Obtain title insurance and clear chain of title');
    }

    // Lender requirements
    if (existing_mortgage.loan_type === 'conventional') {
      challenges.push('Lender-required insurance may be difficult to maintain');
      solutions.push('Use power of attorney to manage insurance directly');
    }

    // Liability concerns
    challenges.push('Personal liability exposure from property ownership');
    solutions.push('Form LLC or corporation for property ownership');

    return {
      insurance_challenges: challenges,
      recommended_solutions: solutions,
      required_coverage: {
        property_insurance: existing_mortgage.insurance_monthly * 12,
        liability_insurance: 1200, // Estimated $100/month
        title_insurance: property_details.current_market_value * 0.005, // One-time 0.5%
        total_annual_cost: (existing_mortgage.insurance_monthly * 12) + 1200
      },
      recommended_structure: 'LLC ownership with comprehensive insurance package'
    };
  }

  calculateLongTermProjections(property_details, existing_mortgage, cash_flow_analysis, equity_analysis) {
    const years = [1, 2, 3, 4, 5];
    const projections = [];

    years.forEach(year => {
      const months = year * 12;
      const annual_cash_flow = cash_flow_analysis.net_monthly_cash_flow * 12;
      const cumulative_cash_flow = annual_cash_flow * year;
      
      // Mortgage balance projection
      const remaining_balance = this.calculateRemainingBalance(
        existing_mortgage.current_balance,
        existing_mortgage.interest_rate / 100 / 12,
        existing_mortgage.remaining_term_months,
        months
      );

      // Property value projection (3% annual appreciation)
      const projected_value = property_details.current_market_value * Math.pow(1.03, year);
      const projected_equity = projected_value - remaining_balance;

      // Total return calculation
      const total_return = cumulative_cash_flow + projected_equity;
      const initial_investment = equity_analysis.current_equity || 1;
      const total_roi = ((total_return - initial_investment) / initial_investment) * 100;

      projections.push({
        year,
        projected_property_value: projected_value,
        remaining_mortgage_balance: remaining_balance,
        projected_equity,
        cumulative_cash_flow,
        total_return,
        annualized_roi: total_roi / year
      });
    });

    return {
      yearly_projections: projections,
      five_year_summary: {
        total_cash_flow: projections[4].cumulative_cash_flow,
        equity_appreciation: projections[4].projected_equity - equity_analysis.current_equity,
        total_return: projections[4].total_return,
        average_annual_roi: projections[4].annualized_roi
      }
    };
  }

  // Helper methods
  calculateDealQualityScore(discount_percentage, equity_percentage, ltv_ratio, effective_leverage) {
    let score = 0;

    // Discount scoring
    if (discount_percentage >= 20) score += 25;
    else if (discount_percentage >= 10) score += 15;
    else if (discount_percentage >= 5) score += 10;

    // Equity scoring
    if (equity_percentage >= 30) score += 25;
    else if (equity_percentage >= 20) score += 20;
    else if (equity_percentage >= 10) score += 15;
    else if (equity_percentage >= 0) score += 10;

    // LTV scoring (lower is better)
    if (ltv_ratio <= 70) score += 25;
    else if (ltv_ratio <= 80) score += 20;
    else if (ltv_ratio <= 90) score += 15;
    else if (ltv_ratio <= 95) score += 10;

    // Leverage scoring
    if (effective_leverage >= 10) score += 25;
    else if (effective_leverage >= 5) score += 20;
    else if (effective_leverage >= 3) score += 15;
    else if (effective_leverage >= 2) score += 10;

    return Math.min(100, score);
  }

  calculateMonthlyPrincipal(balance, monthly_rate, remaining_months, monthly_payment) {
    const interest_payment = balance * monthly_rate;
    return monthly_payment - interest_payment;
  }

  projectEquityGrowth(initial_value, initial_balance, monthly_principal, appreciation_rate, months) {
    let property_value = initial_value;
    let mortgage_balance = initial_balance;

    for (let i = 0; i < months; i++) {
      // Monthly appreciation
      property_value *= (1 + appreciation_rate / 12);
      // Principal paydown
      mortgage_balance -= monthly_principal;
    }

    return {
      final_property_value: property_value,
      final_mortgage_balance: Math.max(0, mortgage_balance),
      final_equity: property_value - Math.max(0, mortgage_balance),
      total_appreciation: property_value - initial_value,
      total_principal_paydown: initial_balance - Math.max(0, mortgage_balance)
    };
  }

  rateCashFlow(net_cash_flow, coverage_ratio, cash_on_cash_return) {
    let score = 0;

    if (net_cash_flow >= 500) score += 3;
    else if (net_cash_flow >= 200) score += 2;
    else if (net_cash_flow >= 0) score += 1;

    if (coverage_ratio >= 1.5) score += 3;
    else if (coverage_ratio >= 1.25) score += 2;
    else if (coverage_ratio >= 1.1) score += 1;

    if (cash_on_cash_return >= 15) score += 3;
    else if (cash_on_cash_return >= 10) score += 2;
    else if (cash_on_cash_return >= 5) score += 1;

    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Very Good';
    if (score >= 4) return 'Good';
    if (score >= 2) return 'Fair';
    return 'Poor';
  }

  calculateLegalComplianceScore(deal_structure, existing_mortgage) {
    let score = 100;

    // Deduct points for risk factors
    if (deal_structure.deed_transfer_method === 'quitclaim_deed') {
      score -= 20; // Higher risk transfer method
    } else if (deal_structure.deed_transfer_method === 'warranty_deed') {
      score -= 10; // Still some risk but better
    }

    if (!deal_structure.authorization_agreements) {
      score -= 30; // Major compliance issue
    }

    if (existing_mortgage.loan_type === 'conventional') {
      score -= 25; // Highest due-on-sale risk
    } else if (existing_mortgage.loan_type === 'fha' || existing_mortgage.loan_type === 'va') {
      score -= 15; // Moderate risk
    }

    return Math.max(0, score);
  }

  getRiskMitigationStrategies(risks) {
    const strategies = new Set();

    risks.forEach(risk => {
      switch (risk.category) {
        case 'Legal Risk':
          strategies.add('Obtain comprehensive title insurance');
          strategies.add('Use authorization agreements and power of attorney');
          strategies.add('Structure through LLC for liability protection');
          strategies.add('Maintain low profile to avoid triggering due-on-sale');
          break;
        case 'Insurance Risk':
          strategies.add('Secure adequate property and liability insurance');
          strategies.add('Consider umbrella insurance policy');
          strategies.add('Work with insurance broker familiar with subject-to deals');
          break;
        case 'Payment Risk':
          strategies.add('Bring loan current before closing');
          strategies.add('Set up automatic payment systems');
          strategies.add('Maintain 6-month payment reserves');
          break;
        case 'Market Risk':
          strategies.add('Ensure strong cash flow to weather downturns');
          strategies.add('Consider refinance if rates drop significantly');
          strategies.add('Monitor local market conditions closely');
          break;
        case 'Interest Rate Risk':
          strategies.add('Plan for future refinance opportunities');
          strategies.add('Structure deal to handle higher payments');
          break;
        case 'Deal Risk':
          strategies.add('Ensure win-win structure for seller');
          strategies.add('Provide ongoing communication and support');
          strategies.add('Have backup plans ready');
          break;
      }
    });

    return Array.from(strategies);
  }

  calculateHoldReturn(market_value, mortgage_balance, cash_flow_analysis, months) {
    const annual_cash_flow = cash_flow_analysis.net_monthly_cash_flow * 12;
    const years = months / 12;
    const total_cash_flow = annual_cash_flow * years;
    
    // Assume 3% appreciation and principal paydown
    const future_value = market_value * Math.pow(1.03, years);
    const principal_paydown = mortgage_balance * 0.05 * years; // Rough estimate
    const future_equity = future_value - (mortgage_balance - principal_paydown);
    
    return total_cash_flow + future_equity;
  }

  calculateMonthlyPayment(principal, annual_rate, months) {
    const monthly_rate = annual_rate / 12;
    return principal * (monthly_rate * Math.pow(1 + monthly_rate, months)) / 
           (Math.pow(1 + monthly_rate, months) - 1);
  }

  calculateRemainingBalance(balance, monthly_rate, total_months, payments_made) {
    const monthly_payment = this.calculateMonthlyPayment(balance, monthly_rate * 12, total_months);
    
    for (let i = 0; i < payments_made; i++) {
      const interest = balance * monthly_rate;
      const principal = monthly_payment - interest;
      balance -= principal;
    }
    
    return Math.max(0, balance);
  }

  recommendBestExitStrategy(strategies, cash_flow_analysis) {
    // Score strategies based on return, risk, and timeline
    const scored_strategies = strategies.map(strategy => {
      let score = 0;
      
      // Return scoring
      if (strategy.total_return_5_year >= 100000) score += 4;
      else if (strategy.total_return_5_year >= 50000) score += 3;
      else if (strategy.total_return_5_year >= 25000) score += 2;
      else if (strategy.total_return_5_year >= 0) score += 1;
      
      // Cash flow scoring
      if (strategy.cash_flow >= 500) score += 3;
      else if (strategy.cash_flow >= 200) score += 2;
      else if (strategy.cash_flow >= 0) score += 1;
      
      // Timeline preference (shorter gets bonus for flexibility)
      if (strategy.timeline.includes('1-3 months')) score += 2;
      else if (strategy.timeline.includes('3-6 months')) score += 1;
      
      return { ...strategy, score };
    });

    const best_strategy = scored_strategies.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return {
      recommended: best_strategy.strategy,
      reasoning: `Best balance of returns (${best_strategy.total_return_5_year}), cash flow (${best_strategy.cash_flow}/month), and risk management`
    };
  }

  compareExitStrategies(strategies) {
    return {
      highest_return: strategies.reduce((max, current) => 
        current.total_return_5_year > max.total_return_5_year ? current : max
      ),
      best_cash_flow: strategies.reduce((max, current) => 
        current.cash_flow > max.cash_flow ? current : max
      ),
      fastest_exit: strategies.find(s => s.timeline.includes('1-3 months')) || strategies[0]
    };
  }

  generateRecommendations(deal_metrics, cash_flow_analysis, risk_analysis, existing_mortgage, seller_situation) {
    const recommendations = [];

    // Deal quality recommendations
    if (deal_metrics.deal_quality_score >= 80) {
      recommendations.push({
        category: 'Deal Quality',
        priority: 'High',
        recommendation: `Excellent deal score (${deal_metrics.deal_quality_score}/100) - proceed with confidence`,
        action: 'Move quickly to secure deal before seller finds alternatives'
      });
    } else if (deal_metrics.deal_quality_score < 50) {
      recommendations.push({
        category: 'Deal Quality',
        priority: 'High',
        recommendation: `Low deal score (${deal_metrics.deal_quality_score}/100) indicates significant challenges`,
        action: 'Renegotiate terms or consider passing on deal'
      });
    }

    // Cash flow recommendations
    if (cash_flow_analysis.net_monthly_cash_flow < 0) {
      recommendations.push({
        category: 'Cash Flow',
        priority: 'High',
        recommendation: 'Negative cash flow requires additional capital',
        action: 'Increase rent, reduce expenses, or provide seller with less cash'
      });
    } else if (cash_flow_analysis.cash_flow_coverage_ratio < 1.2) {
      recommendations.push({
        category: 'Cash Flow',
        priority: 'Medium',
        recommendation: 'Low coverage ratio increases payment risk',
        action: 'Build larger cash reserves or improve rental income'
      });
    }

    // Risk management recommendations
    if (risk_analysis && risk_analysis.overall_risk_level === 'Very High') {
      recommendations.push({
        category: 'Risk Management',
        priority: 'High',
        recommendation: 'Very high risk level requires extensive mitigation',
        action: 'Implement all recommended risk mitigation strategies'
      });
    }

    // Legal compliance recommendations
    if (risk_analysis && risk_analysis.legal_compliance_score < 70) {
      recommendations.push({
        category: 'Legal Compliance',
        priority: 'High',
        recommendation: 'Low compliance score increases legal exposure',
        action: 'Consult with real estate attorney and improve deal structure'
      });
    }

    // Seller situation recommendations
    if (seller_situation.months_behind > 0) {
      recommendations.push({
        category: 'Seller Assistance',
        priority: 'High',
        recommendation: `Seller is ${seller_situation.months_behind} months behind - foreclosure risk`,
        action: 'Include arrears amount in deal structure to bring loan current'
      });
    }

    // Market conditions recommendations
    if (deal_metrics.ltv_ratio > 90) {
      recommendations.push({
        category: 'Market Risk',
        priority: 'Medium',
        recommendation: 'High LTV creates vulnerability to market downturns',
        action: 'Ensure strong cash flow and consider market timing'
      });
    }

    return recommendations;
  }
}