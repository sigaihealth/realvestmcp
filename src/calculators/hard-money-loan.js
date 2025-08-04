export class HardMoneyLoanCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        loan_details: {
          type: 'object',
          properties: {
            loan_amount: { type: 'number', minimum: 1000 },
            property_value: { type: 'number', minimum: 1000 },
            interest_rate: { type: 'number', minimum: 0, maximum: 30 },
            loan_term_months: { type: 'number', minimum: 1, maximum: 60 },
            points: { type: 'number', minimum: 0, maximum: 10 },
            origination_fee: { type: 'number', minimum: 0, maximum: 10 },
            payment_type: { 
              type: 'string', 
              enum: ['interest_only', 'principal_and_interest', 'balloon'] 
            }
          },
          required: ['loan_amount', 'property_value', 'interest_rate', 'loan_term_months', 'payment_type']
        },
        project_details: {
          type: 'object',
          properties: {
            project_type: { 
              type: 'string', 
              enum: ['fix_flip', 'ground_up_construction', 'heavy_rehab', 'light_rehab', 'buy_hold', 'refinance'] 
            },
            purchase_price: { type: 'number', minimum: 0 },
            rehab_budget: { type: 'number', minimum: 0 },
            after_repair_value: { type: 'number', minimum: 0 },
            project_timeline_months: { type: 'number', minimum: 1, maximum: 36 },
            construction_draws: { type: 'boolean' }
          }
        },
        borrower_profile: {
          type: 'object',
          properties: {
            experience_level: { 
              type: 'string', 
              enum: ['beginner', 'intermediate', 'experienced', 'expert'] 
            },
            credit_score: { type: 'number', minimum: 300, maximum: 850 },
            liquid_assets: { type: 'number', minimum: 0 },
            other_properties: { type: 'number', minimum: 0 },
            income_verification: { type: 'boolean' }
          }
        },
        additional_costs: {
          type: 'object',
          properties: {
            appraisal_fee: { type: 'number', minimum: 0 },
            inspection_fees: { type: 'number', minimum: 0 },
            title_insurance: { type: 'number', minimum: 0 },
            attorney_fees: { type: 'number', minimum: 0 },
            recording_fees: { type: 'number', minimum: 0 },
            other_closing_costs: { type: 'number', minimum: 0 }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            compare_conventional: { type: 'boolean' },
            stress_testing: { type: 'boolean' },
            roi_analysis: { type: 'boolean' },
            prepayment_analysis: { type: 'boolean' }
          }
        }
      },
      required: ['loan_details']
    };
  }

  calculate(params) {
    const {
      loan_details,
      project_details = {},
      borrower_profile = {},
      additional_costs = {},
      analysis_options = {}
    } = params;

    // Calculate basic loan metrics
    const loan_metrics = this.calculateLoanMetrics(loan_details, additional_costs);
    
    // Analyze project viability
    const project_analysis = project_details.project_type 
      ? this.analyzeProject(project_details, loan_details, loan_metrics)
      : null;
    
    // Calculate total cost of capital
    const cost_analysis = this.analyzeCostOfCapital(loan_details, loan_metrics, project_details);
    
    // Generate risk assessment
    const risk_assessment = this.assessRisks(loan_details, project_details, borrower_profile);
    
    // Compare with conventional financing if requested
    const conventional_comparison = analysis_options.compare_conventional
      ? this.compareConventionalFinancing(loan_details, project_details)
      : null;
    
    // Stress testing scenarios
    const stress_testing = analysis_options.stress_testing
      ? this.performStressTesting(loan_details, project_details)
      : null;
    
    // ROI analysis for project
    const roi_analysis = analysis_options.roi_analysis && project_details.project_type
      ? this.calculateROIAnalysis(loan_details, project_details, loan_metrics)
      : null;
    
    // Prepayment analysis
    const prepayment_analysis = analysis_options.prepayment_analysis
      ? this.analyzePrepaymentOptions(loan_details, loan_metrics)
      : null;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      loan_metrics, 
      project_analysis, 
      risk_assessment, 
      borrower_profile
    );

    return {
      loan_summary: {
        loan_amount: loan_details.loan_amount,
        property_value: loan_details.property_value,
        ltv_ratio: (loan_details.loan_amount / loan_details.property_value) * 100,
        interest_rate: loan_details.interest_rate,
        loan_term_months: loan_details.loan_term_months,
        payment_type: loan_details.payment_type,
        points: loan_details.points || 0,
        origination_fee: loan_details.origination_fee || 0
      },
      loan_metrics,
      project_analysis,
      cost_analysis,
      risk_assessment,
      conventional_comparison,
      stress_testing,
      roi_analysis,
      prepayment_analysis,
      recommendations
    };
  }

  calculateLoanMetrics(loan_details, additional_costs = {}) {
    const {
      loan_amount,
      interest_rate,
      loan_term_months,
      points = 0,
      origination_fee = 0,
      payment_type
    } = loan_details;

    const monthly_rate = interest_rate / 100 / 12;
    
    // Calculate upfront costs
    const points_cost = loan_amount * (points / 100);
    const origination_cost = loan_amount * (origination_fee / 100);
    const closing_costs = Object.values(additional_costs).reduce((sum, cost) => sum + (cost || 0), 0);
    const total_upfront_costs = points_cost + origination_cost + closing_costs;

    let monthly_payment = 0;
    let total_interest = 0;
    let balloon_payment = 0;

    switch (payment_type) {
      case 'interest_only':
        monthly_payment = loan_amount * monthly_rate;
        total_interest = monthly_payment * loan_term_months;
        balloon_payment = loan_amount;
        break;

      case 'principal_and_interest':
        monthly_payment = loan_amount * 
          (monthly_rate * Math.pow(1 + monthly_rate, loan_term_months)) /
          (Math.pow(1 + monthly_rate, loan_term_months) - 1);
        total_interest = (monthly_payment * loan_term_months) - loan_amount;
        break;

      case 'balloon':
        // Interest-only with balloon at end
        monthly_payment = loan_amount * monthly_rate;
        total_interest = monthly_payment * loan_term_months;
        balloon_payment = loan_amount;
        break;
    }

    // Calculate effective interest rate including costs
    const total_cost = total_interest + total_upfront_costs;
    const effective_rate = (total_cost / loan_amount / (loan_term_months / 12)) * 100;

    // Net loan proceeds
    const net_proceeds = loan_amount - total_upfront_costs;

    return {
      monthly_payment: Math.round(monthly_payment),
      total_interest: Math.round(total_interest),
      balloon_payment: Math.round(balloon_payment),
      points_cost: Math.round(points_cost),
      origination_cost: Math.round(origination_cost),
      closing_costs: Math.round(closing_costs),
      total_upfront_costs: Math.round(total_upfront_costs),
      net_proceeds: Math.round(net_proceeds),
      effective_interest_rate: Math.round(effective_rate * 100) / 100,
      total_cost_of_loan: Math.round(total_cost),
      payment_schedule: this.generatePaymentSchedule(loan_details, monthly_payment)
    };
  }

  generatePaymentSchedule(loan_details, monthly_payment) {
    const { loan_amount, interest_rate, loan_term_months, payment_type } = loan_details;
    const monthly_rate = interest_rate / 100 / 12;
    let remaining_balance = loan_amount;
    const schedule = [];

    for (let month = 1; month <= Math.min(loan_term_months, 12); month++) { // Show first year
      const interest_payment = remaining_balance * monthly_rate;
      let principal_payment = 0;
      
      if (payment_type === 'principal_and_interest') {
        principal_payment = monthly_payment - interest_payment;
        remaining_balance -= principal_payment;
      }

      schedule.push({
        month,
        payment: Math.round(monthly_payment),
        principal: Math.round(principal_payment),
        interest: Math.round(interest_payment),
        balance: Math.round(remaining_balance)
      });
    }

    return schedule;
  }

  analyzeProject(project_details, loan_details, loan_metrics) {
    const {
      project_type,
      purchase_price = 0,
      rehab_budget = 0,
      after_repair_value = 0,
      project_timeline_months = loan_details.loan_term_months,
      construction_draws = false
    } = project_details;

    const total_project_cost = purchase_price + rehab_budget;
    const loan_to_cost = total_project_cost > 0 ? (loan_details.loan_amount / total_project_cost) * 100 : 0;
    const loan_to_arv = after_repair_value > 0 ? (loan_details.loan_amount / after_repair_value) * 100 : 0;

    // Calculate project metrics
    const gross_profit = after_repair_value - total_project_cost - loan_metrics.total_cost_of_loan;
    const profit_margin = after_repair_value > 0 ? (gross_profit / after_repair_value) * 100 : 0;
    const roi = total_project_cost > 0 ? (gross_profit / total_project_cost) * 100 : 0;
    const annualized_roi = project_timeline_months > 0 ? (roi / project_timeline_months) * 12 : 0;

    // Project viability assessment
    const viability_score = this.calculateViabilityScore(
      profit_margin, 
      loan_to_arv, 
      project_timeline_months, 
      project_type
    );

    return {
      project_type,
      total_project_cost,
      loan_to_cost: Math.round(loan_to_cost * 100) / 100,
      loan_to_arv: Math.round(loan_to_arv * 100) / 100,
      gross_profit: Math.round(gross_profit),
      profit_margin: Math.round(profit_margin * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      annualized_roi: Math.round(annualized_roi * 100) / 100,
      project_timeline_months,
      construction_draws,
      viability_score,
      viability_rating: this.rateViability(viability_score),
      project_recommendations: this.generateProjectRecommendations(
        project_type, profit_margin, loan_to_arv, project_timeline_months
      )
    };
  }

  calculateViabilityScore(profit_margin, loan_to_arv, timeline, project_type) {
    let score = 0;

    // Profit margin scoring (40 points max)
    if (profit_margin >= 25) score += 40;
    else if (profit_margin >= 20) score += 35;
    else if (profit_margin >= 15) score += 25;
    else if (profit_margin >= 10) score += 15;
    else if (profit_margin >= 5) score += 5;

    // LTV scoring (30 points max)
    if (loan_to_arv <= 65) score += 30;
    else if (loan_to_arv <= 70) score += 25;
    else if (loan_to_arv <= 75) score += 20;
    else if (loan_to_arv <= 80) score += 10;

    // Timeline scoring (20 points max)
    if (timeline <= 6) score += 20;
    else if (timeline <= 9) score += 15;
    else if (timeline <= 12) score += 10;
    else if (timeline <= 18) score += 5;

    // Project type scoring (10 points max)
    const type_scores = {
      'light_rehab': 10,
      'fix_flip': 8,
      'buy_hold': 6,
      'heavy_rehab': 5,
      'ground_up_construction': 3,
      'refinance': 9
    };
    score += type_scores[project_type] || 5;

    return Math.min(100, score);
  }

  rateViability(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Very Good';
    if (score >= 50) return 'Good';
    if (score >= 35) return 'Fair';
    return 'Poor';
  }

  generateProjectRecommendations(project_type, profit_margin, loan_to_arv, timeline) {
    const recommendations = [];

    if (profit_margin < 15) {
      recommendations.push('Consider increasing sale price or reducing costs - profit margin below industry standard');
    }

    if (loan_to_arv > 75) {
      recommendations.push('High loan-to-ARV ratio increases risk - consider larger down payment');
    }

    if (timeline > 12) {
      recommendations.push('Extended timeline increases carrying costs - consider shorter-term strategies');
    }

    if (project_type === 'ground_up_construction') {
      recommendations.push('Construction projects require experienced contractors and detailed timeline management');
    }

    if (project_type === 'heavy_rehab') {
      recommendations.push('Heavy rehab projects need comprehensive inspections and cost contingencies');
    }

    return recommendations;
  }

  analyzeCostOfCapital(loan_details, loan_metrics, project_details = {}) {
    const { loan_term_months, interest_rate } = loan_details;
    const { project_timeline_months = loan_term_months } = project_details;

    // Calculate various cost metrics
    const effective_rate = loan_metrics.effective_interest_rate;
    const monthly_carrying_cost = loan_metrics.monthly_payment;
    const total_carrying_cost = monthly_carrying_cost * project_timeline_months;

    // Comparison with other financing types
    const conventional_rate = 7.0; // Assumed conventional rate
    const savings_vs_conventional = (conventional_rate - interest_rate) * 
      (loan_details.loan_amount / 100) * (project_timeline_months / 12);

    return {
      effective_annual_rate: effective_rate,
      monthly_carrying_cost,
      total_carrying_cost: Math.round(total_carrying_cost),
      cost_per_month_per_100k: Math.round((monthly_carrying_cost / loan_details.loan_amount) * 100000),
      upfront_cost_percentage: (loan_metrics.total_upfront_costs / loan_details.loan_amount) * 100,
      savings_vs_conventional: Math.round(savings_vs_conventional),
      cost_analysis: this.analyzeCostEffectiveness(effective_rate, project_timeline_months)
    };
  }

  analyzeCostEffectiveness(effective_rate, timeline_months) {
    const analysis = [];

    if (effective_rate > 15) {
      analysis.push('High cost of capital - ensure project returns justify expense');
    } else if (effective_rate > 12) {
      analysis.push('Moderate cost of capital - acceptable for quick turnaround projects');
    } else {
      analysis.push('Competitive cost of capital for hard money financing');
    }

    if (timeline_months <= 6) {
      analysis.push('Short timeline helps minimize total interest cost');
    } else if (timeline_months > 12) {
      analysis.push('Extended timeline increases total cost - consider conventional refinancing');
    }

    return analysis;
  }

  assessRisks(loan_details, project_details = {}, borrower_profile = {}) {
    const risks = [];
    let total_risk_score = 0;

    // Interest rate risk
    if (loan_details.interest_rate > 14) {
      risks.push({
        category: 'Cost Risk',
        risk: 'High Interest Rate',
        level: 'High',
        description: `${loan_details.interest_rate}% rate creates significant carrying costs`,
        mitigation: 'Focus on quick execution to minimize total interest paid'
      });
      total_risk_score += 25;
    }

    // LTV risk
    const ltv = (loan_details.loan_amount / loan_details.property_value) * 100;
    if (ltv > 80) {
      risks.push({
        category: 'Market Risk',
        risk: 'High Loan-to-Value',
        level: ltv > 90 ? 'High' : 'Medium',
        description: `${ltv.toFixed(1)}% LTV provides limited equity cushion`,
        mitigation: 'Ensure conservative property valuation and exit strategy'
      });
      total_risk_score += ltv > 90 ? 20 : 15;
    }

    // Project risk
    if (project_details.project_type === 'ground_up_construction') {
      risks.push({
        category: 'Project Risk',
        risk: 'Construction Complexity',
        level: 'High',
        description: 'Ground-up construction has highest risk of delays and cost overruns',
        mitigation: 'Use experienced contractors, detailed contracts, and adequate contingencies'
      });
      total_risk_score += 30;
    } else if (project_details.project_type === 'heavy_rehab') {
      risks.push({
        category: 'Project Risk',
        risk: 'Rehab Complexity',
        level: 'Medium',
        description: 'Heavy rehab projects often encounter unexpected issues',
        mitigation: 'Conduct thorough inspections and maintain 20% cost contingency'
      });
      total_risk_score += 20;
    }

    // Timeline risk
    if (project_details.project_timeline_months > loan_details.loan_term_months) {
      risks.push({
        category: 'Timeline Risk',
        risk: 'Project Timeline Exceeds Loan Term',
        level: 'High',
        description: 'Project timeline longer than loan term creates refinancing risk',
        mitigation: 'Negotiate loan extension option or ensure refinancing backup plan'
      });
      total_risk_score += 25;
    }

    // Experience risk
    if (borrower_profile.experience_level === 'beginner') {
      risks.push({
        category: 'Borrower Risk',
        risk: 'Limited Experience',
        level: 'Medium',
        description: 'Inexperienced borrowers face higher execution risk',
        mitigation: 'Partner with experienced contractors and consider mentorship'
      });
      total_risk_score += 15;
    }

    return {
      identified_risks: risks,
      risk_score: Math.min(100, total_risk_score),
      overall_risk_level: total_risk_score > 60 ? 'High' :
                         total_risk_score > 35 ? 'Medium' : 'Low',
      risk_mitigation_strategies: this.generateRiskMitigation(risks)
    };
  }

  generateRiskMitigation(risks) {
    const strategies = [
      'Maintain detailed project timeline with milestone tracking',
      'Secure backup contractors and suppliers',
      'Establish credit line for cost overruns',
      'Conduct comprehensive property inspections',
      'Obtain appropriate insurance coverage',
      'Plan exit strategy before project start',
      'Monitor local market conditions regularly'
    ];

    return strategies;
  }

  compareConventionalFinancing(loan_details, project_details = {}) {
    const conventional_rate = 7.0; // Typical investment property rate
    const conventional_ltv = 75; // Typical max LTV for investment
    const conventional_term = 360; // 30 years

    const conventional_loan_amount = loan_details.property_value * 0.75;
    const conventional_monthly = conventional_loan_amount * 
      (conventional_rate / 100 / 12 * Math.pow(1 + conventional_rate / 100 / 12, conventional_term)) /
      (Math.pow(1 + conventional_rate / 100 / 12, conventional_term) - 1);

    const hard_money_total_cost = loan_details.loan_amount * loan_details.interest_rate / 100 * 
      (loan_details.loan_term_months / 12);

    const conventional_total_cost = conventional_monthly * conventional_term - conventional_loan_amount;

    return {
      comparison_type: 'Hard Money vs Conventional',
      hard_money: {
        loan_amount: loan_details.loan_amount,
        interest_rate: loan_details.interest_rate,
        monthly_payment: Math.round(loan_details.loan_amount * loan_details.interest_rate / 100 / 12),
        total_cost: Math.round(hard_money_total_cost),
        approval_time: '3-7 days',
        requirements: 'Asset-based, minimal documentation'
      },
      conventional: {
        loan_amount: Math.round(conventional_loan_amount),
        interest_rate: conventional_rate,
        monthly_payment: Math.round(conventional_monthly),
        total_cost: Math.round(conventional_total_cost),
        approval_time: '30-45 days',
        requirements: 'Income verification, credit score, seasoning'
      },
      hard_money_advantages: [
        'Fast approval and funding',
        'Asset-based qualification',
        'Flexible terms',
        'Allows renovation financing'
      ],
      conventional_advantages: [
        'Lower interest rate',
        'Longer term available',
        'Lower total cost for long-term holds',
        'Predictable payments'
      ],
      recommendation: this.getFinancingRecommendation(loan_details, project_details)
    };
  }

  getFinancingRecommendation(loan_details, project_details) {
    const timeline = project_details.project_timeline_months || loan_details.loan_term_months;
    
    if (timeline <= 12 && project_details.project_type !== 'buy_hold') {
      return 'Hard money recommended for short-term projects with quick exit strategy';
    } else if (timeline > 24 || project_details.project_type === 'buy_hold') {
      return 'Consider conventional financing for long-term holds after project completion';
    } else {
      return 'Hard money for acquisition and renovation, then refinance to conventional';
    }
  }

  performStressTesting(loan_details, project_details = {}) {
    const base_scenario = {
      name: 'Base Case',
      timeline: project_details.project_timeline_months || loan_details.loan_term_months,
      costs: project_details.rehab_budget || 0,
      arv: project_details.after_repair_value || loan_details.property_value
    };

    const scenarios = [base_scenario];

    // Timeline delay scenario
    scenarios.push({
      name: 'Timeline Delay (50%)',
      timeline: base_scenario.timeline * 1.5,
      costs: base_scenario.costs,
      arv: base_scenario.arv,
      additional_cost: loan_details.loan_amount * loan_details.interest_rate / 100 * 0.5 * (base_scenario.timeline / 12)
    });

    // Cost overrun scenario
    scenarios.push({
      name: 'Cost Overrun (25%)',
      timeline: base_scenario.timeline,
      costs: base_scenario.costs * 1.25,
      arv: base_scenario.arv,
      additional_cost: base_scenario.costs * 0.25
    });

    // Market decline scenario
    scenarios.push({
      name: 'Market Decline (15%)',
      timeline: base_scenario.timeline,
      costs: base_scenario.costs,
      arv: base_scenario.arv * 0.85,
      value_loss: base_scenario.arv * 0.15
    });

    // Calculate impact for each scenario
    scenarios.forEach(scenario => {
      const total_additional_cost = (scenario.additional_cost || 0) + (scenario.value_loss || 0);
      scenario.impact_on_profit = -total_additional_cost;
      scenario.severity = total_additional_cost > 50000 ? 'High' : total_additional_cost > 25000 ? 'Medium' : 'Low';
    });

    return {
      scenarios,
      most_likely_risk: 'Timeline Delay',
      highest_impact_risk: scenarios.reduce((max, s) => 
        Math.abs(s.impact_on_profit || 0) > Math.abs(max.impact_on_profit || 0) ? s : max
      ).name,
      stress_test_recommendations: [
        'Maintain 20-25% cost contingency',
        'Plan for 25-50% timeline buffer',
        'Secure backup exit strategies',
        'Monitor market conditions closely'
      ]
    };
  }

  calculateROIAnalysis(loan_details, project_details, loan_metrics) {
    const {
      purchase_price = 0,
      rehab_budget = 0,
      after_repair_value = 0,
      project_timeline_months = loan_details.loan_term_months
    } = project_details;

    const total_investment = purchase_price + rehab_budget + loan_metrics.total_cost_of_loan;
    const gross_profit = after_repair_value - total_investment;
    const roi = total_investment > 0 ? (gross_profit / total_investment) * 100 : 0;
    const annualized_roi = project_timeline_months > 0 ? (roi / project_timeline_months) * 12 : 0;

    // Calculate various return metrics
    const cash_invested = total_investment - loan_details.loan_amount;
    const cash_on_cash_return = cash_invested > 0 ? (gross_profit / cash_invested) * 100 : 0;
    const annualized_coc = project_timeline_months > 0 ? (cash_on_cash_return / project_timeline_months) * 12 : 0;

    return {
      total_investment: Math.round(total_investment),
      gross_profit: Math.round(gross_profit),
      roi: Math.round(roi * 100) / 100,
      annualized_roi: Math.round(annualized_roi * 100) / 100,
      cash_invested: Math.round(cash_invested),
      cash_on_cash_return: Math.round(cash_on_cash_return * 100) / 100,
      annualized_coc: Math.round(annualized_coc * 100) / 100,
      profit_per_month: Math.round(gross_profit / project_timeline_months),
      roi_rating: this.rateROI(annualized_roi),
      roi_benchmarks: {
        minimum_acceptable: 15,
        good: 25,
        excellent: 35
      }
    };
  }

  rateROI(annualized_roi) {
    if (annualized_roi >= 35) return 'Excellent';
    if (annualized_roi >= 25) return 'Very Good';
    if (annualized_roi >= 15) return 'Good';
    if (annualized_roi >= 8) return 'Fair';
    return 'Poor';
  }

  analyzePrepaymentOptions(loan_details, loan_metrics) {
    const scenarios = [];
    const { loan_amount, interest_rate, loan_term_months } = loan_details;
    const monthly_rate = interest_rate / 100 / 12;

    // Calculate savings for different prepayment scenarios
    const prepayment_months = [3, 6, 9, 12].filter(m => m < loan_term_months);

    prepayment_months.forEach(months => {
      const interest_saved = loan_amount * monthly_rate * (loan_term_months - months);
      const total_paid = loan_metrics.monthly_payment * months + loan_amount;
      
      scenarios.push({
        prepayment_month: months,
        interest_saved: Math.round(interest_saved),
        total_cost: Math.round(total_paid + loan_metrics.total_upfront_costs),
        savings_vs_full_term: Math.round(loan_metrics.total_cost_of_loan - (total_paid - loan_amount))
      });
    });

    return {
      prepayment_scenarios: scenarios,
      optimal_prepayment: scenarios.length > 0 ? scenarios.reduce((best, current) => 
        current.savings_vs_full_term > best.savings_vs_full_term ? current : best
      ) : null,
      prepayment_benefits: [
        'Reduces total interest cost',
        'Frees up capital for next project',
        'Eliminates refinancing risk',
        'Simplifies exit process'
      ]
    };
  }

  generateRecommendations(loan_metrics, project_analysis, risk_assessment, borrower_profile = {}) {
    const recommendations = [];

    // Overall loan assessment
    if (loan_metrics.effective_interest_rate > 16) {
      recommendations.push({
        category: 'Cost Management',
        recommendation: '⚠️ High cost of capital requires quick execution',
        reasoning: `${loan_metrics.effective_interest_rate}% effective rate necessitates rapid project completion`,
        priority: 'High'
      });
    } else if (loan_metrics.effective_interest_rate < 12) {
      recommendations.push({
        category: 'Loan Terms',
        recommendation: '✅ Competitive hard money terms',
        reasoning: 'Effective rate below 12% is favorable for hard money financing',
        priority: 'Medium'
      });
    }

    // Project analysis recommendations
    if (project_analysis && project_analysis.viability_score < 50) {
      recommendations.push({
        category: 'Project Viability',
        recommendation: '❌ Reconsider project parameters',
        reasoning: 'Low viability score suggests poor risk-adjusted returns',
        priority: 'High'
      });
    } else if (project_analysis && project_analysis.viability_score > 75) {
      recommendations.push({
        category: 'Project Execution',
        recommendation: '✅ Strong project fundamentals',
        reasoning: 'High viability score indicates good potential returns',
        priority: 'Medium'
      });
    }

    // Risk-based recommendations
    if (risk_assessment.overall_risk_level === 'High') {
      recommendations.push({
        category: 'Risk Management',
        recommendation: 'Implement comprehensive risk mitigation',
        reasoning: 'High risk score requires additional protections and contingencies',
        priority: 'High'
      });
    }

    // Experience-based recommendations
    if (borrower_profile.experience_level === 'beginner') {
      recommendations.push({
        category: 'Execution Support',
        recommendation: 'Consider experienced partners or mentorship',
        reasoning: 'First-time hard money borrowers benefit from experienced guidance',
        priority: 'Medium'
      });
    }

    // Timeline recommendations
    if (project_analysis && project_analysis.project_timeline_months > 12) {
      recommendations.push({
        category: 'Timeline Management',
        recommendation: 'Plan conventional refinancing option',
        reasoning: 'Extended timeline makes conventional financing more cost-effective',
        priority: 'Medium'
      });
    }

    return {
      recommendations,
      overall_assessment: this.getOverallAssessment(loan_metrics, project_analysis, risk_assessment),
      key_success_factors: [
        'Accurate project cost estimation',
        'Realistic timeline planning',
        'Strong contractor relationships',
        'Clear exit strategy',
        'Adequate cash reserves'
      ]
    };
  }

  getOverallAssessment(loan_metrics, project_analysis, risk_assessment) {
    let score = 0;
    let factors = 0;

    // Cost assessment
    if (loan_metrics.effective_interest_rate <= 12) {
      score += 30;
    } else if (loan_metrics.effective_interest_rate <= 15) {
      score += 20;
    } else {
      score += 5;
    }
    factors++;

    // Project viability
    if (project_analysis) {
      score += project_analysis.viability_score * 0.4;
      factors++;
    }

    // Risk assessment
    score += Math.max(0, 100 - risk_assessment.risk_score) * 0.3;
    factors++;

    const final_score = score / factors;

    if (final_score >= 75) return 'Highly Recommended';
    if (final_score >= 60) return 'Recommended';
    if (final_score >= 45) return 'Proceed with Caution';
    return 'Not Recommended';
  }
}