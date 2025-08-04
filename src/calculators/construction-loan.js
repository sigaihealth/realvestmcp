/**
 * Construction Loan Calculator
 * Analyzes construction loan costs, draws, interest-only payments, and permanent financing
 */

export class ConstructionLoanCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        project_details: {
          type: 'object',
          properties: {
            property_type: {
              type: 'string',
              enum: ['single_family', 'multi_family', 'commercial', 'custom_home', 'spec_home'],
              description: 'Type of construction project'
            },
            construction_cost: { type: 'number', minimum: 0, description: 'Total construction cost estimate' },
            land_cost: { type: 'number', minimum: 0, description: 'Cost of land (if not owned)' },
            finished_value: { type: 'number', minimum: 0, description: 'Expected finished property value' },
            construction_timeline_months: { type: 'number', minimum: 1, maximum: 60, description: 'Expected construction timeline in months' },
            square_footage: { type: 'number', minimum: 0, description: 'Total square footage of finished property' },
            project_address: { type: 'string', description: 'Project location address' }
          },
          required: ['property_type', 'construction_cost', 'finished_value', 'construction_timeline_months']
        },
        construction_loan: {
          type: 'object',
          properties: {
            loan_amount: { type: 'number', minimum: 0, description: 'Construction loan amount' },
            interest_rate: { type: 'number', minimum: 0, maximum: 30, description: 'Construction loan interest rate (%)' },
            loan_term_months: { type: 'number', minimum: 1, maximum: 60, description: 'Construction loan term in months' },
            ltc_ratio: { type: 'number', minimum: 0, maximum: 1, description: 'Loan-to-cost ratio (0.0-1.0)' },
            origination_fee: { type: 'number', minimum: 0, description: 'Loan origination fee ($)' },
            draw_fee: { type: 'number', minimum: 0, description: 'Fee per draw ($)' },
            inspection_fee: { type: 'number', minimum: 0, description: 'Inspection fee per draw ($)' },
            appraisal_fee: { type: 'number', minimum: 0, description: 'Appraisal fee ($)' }
          },
          required: ['interest_rate', 'loan_term_months']
        },
        permanent_financing: {
          type: 'object',
          properties: {
            permanent_rate: { type: 'number', minimum: 0, maximum: 15, description: 'Permanent loan interest rate (%)' },
            permanent_term_years: { type: 'number', minimum: 1, maximum: 50, description: 'Permanent loan term in years' },
            permanent_ltv: { type: 'number', minimum: 0, maximum: 1, description: 'Permanent loan-to-value ratio (0.0-1.0)' },
            conversion_type: {
              type: 'string',
              enum: ['construction_to_perm', 'separate_closing', 'end_loan'],
              description: 'Type of permanent financing conversion'
            },
            conversion_fees: { type: 'number', minimum: 0, description: 'Fees for converting to permanent loan ($)' }
          }
        },
        draw_schedule: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              phase: { type: 'string', description: 'Construction phase name' },
              percentage: { type: 'number', minimum: 0, maximum: 100, description: 'Percentage of total cost for this phase' },
              month: { type: 'number', minimum: 1, description: 'Expected month of completion' },
              description: { type: 'string', description: 'Description of work completed' }
            },
            required: ['phase', 'percentage', 'month']
          },
          description: 'Detailed draw schedule by construction phase'
        },
        additional_costs: {
          type: 'object',
          properties: {
            permits_fees: { type: 'number', minimum: 0, description: 'Building permits and fees' },
            utility_connections: { type: 'number', minimum: 0, description: 'Utility connection costs' },
            soft_costs: { type: 'number', minimum: 0, description: 'Architect, engineer, consultant fees' },
            interim_insurance: { type: 'number', minimum: 0, description: 'Construction insurance cost' },
            carrying_costs: { type: 'number', minimum: 0, description: 'Property taxes, utilities during construction' },
            contingency_percentage: { type: 'number', minimum: 0, maximum: 50, description: 'Contingency as percentage of construction cost' }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            include_cost_breakdown: { type: 'boolean', description: 'Include detailed cost analysis' },
            compare_scenarios: { type: 'boolean', description: 'Compare different financing scenarios' },
            stress_test: { type: 'boolean', description: 'Perform stress testing on timeline and costs' },
            monthly_cash_flow: { type: 'boolean', description: 'Calculate monthly cash flow requirements' }
          }
        }
      },
      required: ['project_details', 'construction_loan']
    };
  }

  calculate(params) {
    const {
      project_details,
      construction_loan,
      permanent_financing = {},
      draw_schedule = [],
      additional_costs = {},
      analysis_options = {}
    } = params;

    // Calculate total project cost
    const total_project_cost = this.calculateTotalProjectCost(
      project_details,
      additional_costs
    );

    // Determine loan amount if not specified
    const loan_amount = construction_loan.loan_amount || 
      (total_project_cost.total_cost * (construction_loan.ltc_ratio || 0.8));

    // Calculate construction phase financing
    const construction_analysis = this.analyzeConstructionPhase(
      project_details,
      construction_loan,
      loan_amount,
      draw_schedule
    );

    // Calculate interest-only payments
    const payment_schedule = this.calculatePaymentSchedule(
      construction_analysis,
      construction_loan,
      project_details.construction_timeline_months
    );

    // Analyze permanent financing
    const permanent_analysis = permanent_financing.permanent_rate ?
      this.analyzePermanentFinancing(
        project_details.finished_value,
        permanent_financing,
        construction_analysis.total_drawn
      ) : null;

    // Project profitability analysis
    const profitability = this.analyzeProfitability(
      project_details,
      total_project_cost,
      construction_analysis,
      permanent_analysis
    );

    // Risk assessment
    const risk_analysis = this.assessConstructionRisks(
      project_details,
      construction_loan,
      total_project_cost,
      construction_analysis
    );

    // Cash flow requirements
    const cash_flow_analysis = analysis_options.monthly_cash_flow ?
      this.analyzeCashFlowRequirements(
        total_project_cost,
        construction_analysis,
        payment_schedule,
        project_details.construction_timeline_months
      ) : null;

    // Comparison scenarios
    const scenario_comparison = analysis_options.compare_scenarios ?
      this.compareFinancingScenarios(
        project_details,
        construction_loan,
        total_project_cost
      ) : null;

    // Stress testing
    const stress_testing = analysis_options.stress_test ?
      this.performStressTesting(
        project_details,
        construction_loan,
        total_project_cost,
        profitability
      ) : null;

    return {
      project_summary: {
        ...project_details,
        cost_per_sqft: project_details.square_footage ? 
          total_project_cost.construction_cost / project_details.square_footage : null,
        value_per_sqft: project_details.square_footage ?
          project_details.finished_value / project_details.square_footage : null
      },
      total_project_cost,
      construction_loan_analysis: construction_analysis,
      payment_schedule,
      permanent_financing_analysis: permanent_analysis,
      profitability_analysis: profitability,
      risk_assessment: risk_analysis,
      cash_flow_requirements: cash_flow_analysis,
      scenario_comparison,
      stress_testing,
      recommendations: this.generateRecommendations(
        total_project_cost,
        construction_analysis,
        profitability,
        risk_analysis
      )
    };
  }

  calculateTotalProjectCost(project_details, additional_costs) {
    const land_cost = project_details.land_cost || 0;
    const construction_cost = project_details.construction_cost;
    const permits_fees = additional_costs.permits_fees || construction_cost * 0.02;
    const utility_connections = additional_costs.utility_connections || 15000;
    const soft_costs = additional_costs.soft_costs || construction_cost * 0.08;
    const interim_insurance = additional_costs.interim_insurance || construction_cost * 0.005;
    const carrying_costs = additional_costs.carrying_costs || construction_cost * 0.015;
    const contingency_percentage = additional_costs.contingency_percentage || 10;
    const contingency = construction_cost * (contingency_percentage / 100);

    const hard_costs = construction_cost + contingency;
    const soft_costs_total = permits_fees + utility_connections + soft_costs + 
                           interim_insurance + carrying_costs;
    const total_cost = land_cost + hard_costs + soft_costs_total;

    return {
      land_cost,
      construction_cost,
      hard_costs,
      soft_costs_breakdown: {
        permits_fees,
        utility_connections,
        soft_costs,
        interim_insurance,
        carrying_costs
      },
      soft_costs_total,
      contingency,
      contingency_percentage,
      total_cost,
      cost_breakdown_percentage: {
        land: (land_cost / total_cost) * 100,
        construction: (construction_cost / total_cost) * 100,
        soft_costs: (soft_costs_total / total_cost) * 100,
        contingency: (contingency / total_cost) * 100
      }
    };
  }

  analyzeConstructionPhase(project_details, construction_loan, loan_amount, draw_schedule) {
    // Default draw schedule if not provided
    const default_draws = [
      { phase: 'Foundation', percentage: 15, month: 1 },
      { phase: 'Framing', percentage: 20, month: 2 },
      { phase: 'Mechanical/Electrical/Plumbing', percentage: 20, month: 3 },
      { phase: 'Drywall/Interior', percentage: 25, month: 4 },
      { phase: 'Final/Completion', percentage: 20, month: 5 }
    ];

    const draws = draw_schedule.length > 0 ? draw_schedule : default_draws;
    const timeline_months = project_details.construction_timeline_months;

    // Calculate draw amounts and timing
    let cumulative_drawn = 0;
    const draw_analysis = draws.map((draw, index) => {
      const draw_amount = loan_amount * (draw.percentage / 100);
      cumulative_drawn += draw_amount;
      
      return {
        ...draw,
        draw_number: index + 1,
        draw_amount,
        cumulative_drawn,
        interest_base: cumulative_drawn,
        month_scheduled: Math.min(draw.month, timeline_months)
      };
    });

    // Calculate total fees
    const origination_fee = construction_loan.origination_fee || loan_amount * 0.01;
    const total_draw_fees = (construction_loan.draw_fee || 300) * draws.length;
    const total_inspection_fees = (construction_loan.inspection_fee || 250) * draws.length;
    const appraisal_fee = construction_loan.appraisal_fee || 500;
    const total_fees = origination_fee + total_draw_fees + total_inspection_fees + appraisal_fee;

    return {
      loan_amount,
      ltc_ratio: loan_amount / project_details.construction_cost,
      draw_schedule: draw_analysis,
      total_drawn: cumulative_drawn,
      fees_breakdown: {
        origination_fee,
        draw_fees: total_draw_fees,
        inspection_fees: total_inspection_fees,
        appraisal_fee,
        total_fees
      },
      expected_completion_month: Math.max(...draws.map(d => d.month))
    };
  }

  calculatePaymentSchedule(construction_analysis, construction_loan, timeline_months) {
    const monthly_rate = construction_loan.interest_rate / 100 / 12;
    const payments = [];
    let current_balance = 0;

    for (let month = 1; month <= timeline_months; month++) {
      // Check for draws this month
      const monthly_draws = construction_analysis.draw_schedule.filter(
        draw => draw.month_scheduled === month
      );
      
      const draws_amount = monthly_draws.reduce((sum, draw) => sum + draw.draw_amount, 0);
      current_balance += draws_amount;

      // Calculate interest payment
      const interest_payment = current_balance * monthly_rate;
      
      payments.push({
        month,
        beginning_balance: current_balance - draws_amount,
        draws_received: draws_amount,
        ending_balance: current_balance,
        interest_payment,
        draws_this_month: monthly_draws.length,
        cumulative_interest: payments.reduce((sum, p) => sum + p.interest_payment, 0) + interest_payment
      });
    }

    const total_interest = payments.reduce((sum, payment) => sum + payment.interest_payment, 0);
    const average_monthly_payment = total_interest / timeline_months;

    return {
      monthly_payments: payments,
      summary: {
        total_interest_paid: total_interest,
        average_monthly_payment,
        highest_monthly_payment: Math.max(...payments.map(p => p.interest_payment)),
        total_construction_draws: construction_analysis.total_drawn,
        final_balance_to_convert: current_balance
      }
    };
  }

  analyzePermanentFinancing(finished_value, permanent_financing, construction_balance) {
    const {
      permanent_rate,
      permanent_term_years,
      permanent_ltv,
      conversion_type = 'construction_to_perm',
      conversion_fees = 0
    } = permanent_financing;

    const max_permanent_loan = finished_value * (permanent_ltv || 0.8);
    const permanent_loan_amount = Math.min(construction_balance, max_permanent_loan);
    const cash_needed = Math.max(0, construction_balance - permanent_loan_amount);

    // Calculate permanent loan payment
    const monthly_rate = permanent_rate / 100 / 12;
    const num_payments = permanent_term_years * 12;
    const monthly_payment = permanent_loan_amount * 
      (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) / 
      (Math.pow(1 + monthly_rate, num_payments) - 1);

    return {
      finished_appraised_value: finished_value,
      permanent_ltv: permanent_ltv || 0.8,
      max_permanent_loan,
      permanent_loan_amount,
      cash_needed_at_conversion: cash_needed,
      monthly_payment,
      conversion_details: {
        conversion_type,
        conversion_fees,
        estimated_closing_costs: permanent_loan_amount * 0.015
      },
      loan_summary: {
        principal: permanent_loan_amount,
        interest_rate: permanent_rate,
        term_years: permanent_term_years,
        total_payments: monthly_payment * num_payments,
        total_interest: (monthly_payment * num_payments) - permanent_loan_amount
      }
    };
  }

  analyzeProfitability(project_details, total_project_cost, construction_analysis, permanent_analysis) {
    const total_investment = total_project_cost.total_cost + construction_analysis.fees_breakdown.total_fees;
    const finished_value = project_details.finished_value;
    const gross_profit = finished_value - total_investment;
    const profit_margin = (gross_profit / finished_value) * 100;
    const roi = (gross_profit / total_investment) * 100;

    // Calculate out-of-pocket investment
    const loan_proceeds = construction_analysis.total_drawn;
    const out_of_pocket = total_investment - loan_proceeds + 
                         (permanent_analysis?.cash_needed_at_conversion || 0);

    const leveraged_roi = out_of_pocket > 0 ? (gross_profit / out_of_pocket) * 100 : null;

    // Timeline-adjusted returns
    const timeline_years = project_details.construction_timeline_months / 12;
    const annualized_roi = roi / timeline_years;
    const annualized_leveraged_roi = leveraged_roi ? leveraged_roi / timeline_years : null;

    return {
      investment_analysis: {
        total_investment,
        finished_value,
        gross_profit,
        profit_margin,
        roi,
        out_of_pocket_investment: out_of_pocket,
        leveraged_roi
      },
      time_adjusted_returns: {
        construction_timeline_months: project_details.construction_timeline_months,
        timeline_years,
        annualized_roi,
        annualized_leveraged_roi
      },
      profitability_rating: this.rateProfitability(profit_margin, annualized_roi),
      breakeven_analysis: {
        breakeven_sale_price: total_investment,
        minimum_margin_for_profit: 0,
        required_appreciation: total_investment > finished_value ? 
          ((total_investment - finished_value) / finished_value) * 100 : 0
      }
    };
  }

  assessConstructionRisks(project_details, construction_loan, total_project_cost, construction_analysis) {
    const risks = [];
    let risk_score = 0;

    // Timeline risk
    if (project_details.construction_timeline_months > 12) {
      risks.push({
        category: 'Timeline Risk',
        level: 'High',
        description: 'Construction timeline over 12 months increases cost overrun risk',
        impact: 'Cost overruns, extended interest payments'
      });
      risk_score += 3;
    } else if (project_details.construction_timeline_months > 8) {
      risks.push({
        category: 'Timeline Risk',
        level: 'Medium',
        description: 'Moderate construction timeline may face seasonal delays',
        impact: 'Potential schedule delays'
      });
      risk_score += 2;
    }

    // Cost risk
    const contingency_percentage = total_project_cost.contingency_percentage;
    if (contingency_percentage < 8) {
      risks.push({
        category: 'Cost Risk',
        level: 'High',
        description: 'Low contingency may not cover unexpected costs',
        impact: 'Budget overruns, need for additional funding'
      });
      risk_score += 3;
    } else if (contingency_percentage < 12) {
      risks.push({
        category: 'Cost Risk',
        level: 'Medium',
        description: 'Moderate contingency for cost variations',
        impact: 'Some protection against cost increases'
      });
      risk_score += 1;
    }

    // Interest rate risk
    if (construction_loan.interest_rate > 8) {
      risks.push({
        category: 'Financing Risk',
        level: 'High',
        description: 'High construction loan interest rate increases carrying costs',
        impact: 'Higher monthly payments, reduced profitability'
      });
      risk_score += 2;
    }

    // LTC ratio risk
    const ltc_ratio = construction_analysis.ltc_ratio;
    if (ltc_ratio > 0.9) {
      risks.push({
        category: 'Leverage Risk',
        level: 'High',
        description: 'High loan-to-cost ratio leaves little equity buffer',
        impact: 'Higher risk of needing additional capital'
      });
      risk_score += 3;
    } else if (ltc_ratio > 0.8) {
      risks.push({
        category: 'Leverage Risk',
        level: 'Medium',
        description: 'Moderate leverage with adequate equity buffer',
        impact: 'Balanced risk-return profile'
      });
      risk_score += 1;
    }

    // Market risk
    const value_to_cost_ratio = project_details.finished_value / total_project_cost.total_cost;
    if (value_to_cost_ratio < 1.15) {
      risks.push({
        category: 'Market Risk',
        level: 'High',
        description: 'Low margin between cost and value leaves little room for market changes',
        impact: 'Vulnerable to market downturns'
      });
      risk_score += 3;
    } else if (value_to_cost_ratio < 1.25) {
      risks.push({
        category: 'Market Risk',
        level: 'Medium',
        description: 'Moderate value buffer against market fluctuations',
        impact: 'Some protection against market changes'
      });
      risk_score += 1;
    }

    const overall_risk_level = risk_score >= 8 ? 'High' : risk_score >= 4 ? 'Medium' : 'Low';

    return {
      identified_risks: risks,
      risk_score,
      overall_risk_level,
      risk_mitigation_strategies: this.getRiskMitigationStrategies(risks),
      contingency_recommendations: this.getContingencyRecommendations(
        contingency_percentage,
        project_details.property_type
      )
    };
  }

  analyzeCashFlowRequirements(total_project_cost, construction_analysis, payment_schedule, timeline_months) {
    const monthly_requirements = [];
    let cumulative_out_of_pocket = 0;

    for (let month = 1; month <= timeline_months; month++) {
      const payment_info = payment_schedule.monthly_payments[month - 1];
      const monthly_cost = total_project_cost.total_cost / timeline_months; // Simplified assumption
      const draws_received = payment_info.draws_received;
      const interest_payment = payment_info.interest_payment;
      
      const net_cash_needed = monthly_cost - draws_received + interest_payment;
      cumulative_out_of_pocket += Math.max(0, net_cash_needed);

      monthly_requirements.push({
        month,
        estimated_monthly_costs: monthly_cost,
        draws_received,
        interest_payment,
        net_cash_needed,
        cumulative_out_of_pocket
      });
    }

    const peak_cash_requirement = Math.max(...monthly_requirements.map(m => m.cumulative_out_of_pocket));
    const total_out_of_pocket = cumulative_out_of_pocket;

    return {
      monthly_cash_flow: monthly_requirements,
      cash_flow_summary: {
        peak_cash_requirement,
        total_out_of_pocket_needed: total_out_of_pocket,
        average_monthly_requirement: total_out_of_pocket / timeline_months,
        recommended_reserve: peak_cash_requirement * 1.2 // 20% buffer
      }
    };
  }

  compareFinancingScenarios(project_details, base_loan, total_project_cost) {
    const scenarios = [];

    // Base scenario
    scenarios.push({
      name: 'Base Scenario',
      loan_amount: base_loan.loan_amount || total_project_cost.total_cost * 0.8,
      interest_rate: base_loan.interest_rate,
      ltc_ratio: 0.8,
      estimated_interest: this.estimateConstructionInterest(
        base_loan.loan_amount || total_project_cost.total_cost * 0.8,
        base_loan.interest_rate,
        project_details.construction_timeline_months
      )
    });

    // Higher LTC scenario
    const high_ltc_loan = total_project_cost.total_cost * 0.9;
    scenarios.push({
      name: 'Higher Leverage (90% LTC)',
      loan_amount: high_ltc_loan,
      interest_rate: base_loan.interest_rate + 0.5, // Higher rate for higher LTC
      ltc_ratio: 0.9,
      estimated_interest: this.estimateConstructionInterest(
        high_ltc_loan,
        base_loan.interest_rate + 0.5,
        project_details.construction_timeline_months
      )
    });

    // Lower LTC scenario
    const low_ltc_loan = total_project_cost.total_cost * 0.7;
    scenarios.push({
      name: 'Conservative (70% LTC)',
      loan_amount: low_ltc_loan,
      interest_rate: base_loan.interest_rate - 0.25, // Lower rate for lower LTC
      ltc_ratio: 0.7,
      estimated_interest: this.estimateConstructionInterest(
        low_ltc_loan,
        base_loan.interest_rate - 0.25,
        project_details.construction_timeline_months
      )
    });

    // Add out-of-pocket calculations
    scenarios.forEach(scenario => {
      scenario.out_of_pocket_needed = total_project_cost.total_cost - scenario.loan_amount;
      scenario.total_financing_cost = scenario.estimated_interest + (scenario.loan_amount * 0.015); // Estimated fees
      scenario.effective_cost = scenario.total_financing_cost / scenario.loan_amount * 100;
    });

    return {
      scenarios,
      recommendation: this.recommendBestScenario(scenarios)
    };
  }

  performStressTesting(project_details, construction_loan, total_project_cost, base_profitability) {
    const tests = [];

    // Cost overrun scenarios
    [10, 20, 30].forEach(overrun_percent => {
      const increased_cost = total_project_cost.total_cost * (1 + overrun_percent / 100);
      const new_profit = project_details.finished_value - increased_cost;
      const new_margin = (new_profit / project_details.finished_value) * 100;
      
      tests.push({
        scenario: `${overrun_percent}% Cost Overrun`,
        impact: 'Cost',
        parameter_change: `+${overrun_percent}%`,
        new_total_cost: increased_cost,
        new_profit: new_profit,
        new_profit_margin: new_margin,
        profit_change: new_margin - base_profitability.investment_analysis.profit_margin,
        viability: new_margin > 5 ? 'Viable' : new_margin > 0 ? 'Marginal' : 'Not Viable'
      });
    });

    // Timeline extension scenarios
    [2, 4, 6].forEach(additional_months => {
      const new_timeline = project_details.construction_timeline_months + additional_months;
      const additional_interest = this.estimateConstructionInterest(
        construction_loan.loan_amount || total_project_cost.total_cost * 0.8,
        construction_loan.interest_rate,
        additional_months
      );
      const new_total_cost = total_project_cost.total_cost + additional_interest;
      const new_profit = project_details.finished_value - new_total_cost;
      const new_margin = (new_profit / project_details.finished_value) * 100;
      
      tests.push({
        scenario: `${additional_months} Month Delay`,
        impact: 'Timeline',
        parameter_change: `+${additional_months} months`,
        new_timeline_months: new_timeline,
        additional_interest,
        new_profit: new_profit,
        new_profit_margin: new_margin,
        profit_change: new_margin - base_profitability.investment_analysis.profit_margin,
        viability: new_margin > 5 ? 'Viable' : new_margin > 0 ? 'Marginal' : 'Not Viable'
      });
    });

    // Market value scenarios
    [-10, -15, -20].forEach(value_decline => {
      const new_value = project_details.finished_value * (1 + value_decline / 100);
      const new_profit = new_value - total_project_cost.total_cost;
      const new_margin = (new_profit / new_value) * 100;
      
      tests.push({
        scenario: `${Math.abs(value_decline)}% Value Decline`,
        impact: 'Market Value',
        parameter_change: `${value_decline}%`,
        new_finished_value: new_value,
        new_profit: new_profit,
        new_profit_margin: new_margin,
        profit_change: new_margin - base_profitability.investment_analysis.profit_margin,
        viability: new_margin > 5 ? 'Viable' : new_margin > 0 ? 'Marginal' : 'Not Viable'
      });
    });

    const worst_case = tests.reduce((worst, test) => 
      test.new_profit_margin < worst.new_profit_margin ? test : worst
    );

    return {
      stress_tests: tests,
      worst_case_scenario: worst_case,
      resilience_score: this.calculateResilienceScore(tests),
      recommendations: this.getStressTestRecommendations(tests)
    };
  }

  // Helper methods
  estimateConstructionInterest(loan_amount, interest_rate, months) {
    // Simplified calculation assuming average balance of 50% of loan amount
    const average_balance = loan_amount * 0.5;
    const monthly_rate = interest_rate / 100 / 12;
    return average_balance * monthly_rate * months;
  }

  rateProfitability(profit_margin, annualized_roi) {
    if (profit_margin >= 20 && annualized_roi >= 25) return 'Excellent';
    if (profit_margin >= 15 && annualized_roi >= 20) return 'Very Good';
    if (profit_margin >= 10 && annualized_roi >= 15) return 'Good';
    if (profit_margin >= 5 && annualized_roi >= 10) return 'Fair';
    return 'Poor';
  }

  getRiskMitigationStrategies(risks) {
    const strategies = [];
    
    risks.forEach(risk => {
      switch (risk.category) {
        case 'Timeline Risk':
          strategies.push('Build buffer time into construction schedule');
          strategies.push('Pre-approve all materials and finishes');
          strategies.push('Establish relationships with reliable subcontractors');
          break;
        case 'Cost Risk':
          strategies.push('Increase contingency budget to 12-15%');
          strategies.push('Lock in material prices where possible');
          strategies.push('Get detailed bids from all contractors');
          break;
        case 'Financing Risk':
          strategies.push('Consider rate locks or caps if available');
          strategies.push('Shop multiple lenders for better terms');
          strategies.push('Maintain strong credit and reserves');
          break;
        case 'Market Risk':
          strategies.push('Monitor local market conditions closely');
          strategies.push('Consider pre-selling or finding buyer early');
          strategies.push('Build in higher profit margins');
          break;
      }
    });

    return [...new Set(strategies)]; // Remove duplicates
  }

  getContingencyRecommendations(current_contingency, property_type) {
    const recommendations = {
      'single_family': { min: 8, recommended: 12, max: 15 },
      'multi_family': { min: 10, recommended: 15, max: 20 },
      'commercial': { min: 12, recommended: 18, max: 25 },
      'custom_home': { min: 10, recommended: 15, max: 20 },
      'spec_home': { min: 8, recommended: 12, max: 15 }
    };

    const rec = recommendations[property_type] || recommendations['single_family'];
    
    return {
      current_contingency: current_contingency,
      recommended_range: rec,
      recommendation: current_contingency < rec.min ? 
        `Increase contingency to at least ${rec.min}%` :
        current_contingency > rec.max ?
        `Consider reducing contingency from ${current_contingency}% to ${rec.recommended}%` :
        'Contingency level is appropriate'
    };
  }

  recommendBestScenario(scenarios) {
    // Score scenarios based on multiple factors
    const scored_scenarios = scenarios.map(scenario => {
      let score = 0;
      
      // Lower effective cost is better
      if (scenario.effective_cost < 8) score += 3;
      else if (scenario.effective_cost < 10) score += 2;
      else score += 1;
      
      // Moderate leverage is preferred
      if (scenario.ltc_ratio >= 0.75 && scenario.ltc_ratio <= 0.85) score += 3;
      else if (scenario.ltc_ratio >= 0.7 && scenario.ltc_ratio <= 0.9) score += 2;
      else score += 1;
      
      // Lower out-of-pocket is generally better
      const out_of_pocket_ratio = scenario.out_of_pocket_needed / scenario.loan_amount;
      if (out_of_pocket_ratio < 0.3) score += 3;
      else if (out_of_pocket_ratio < 0.5) score += 2;
      else score += 1;
      
      return { ...scenario, score };
    });

    const best_scenario = scored_scenarios.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return {
      recommended_scenario: best_scenario.name,
      reasoning: `Best balance of leverage (${(best_scenario.ltc_ratio * 100).toFixed(0)}% LTC), ` +
                `effective cost (${best_scenario.effective_cost.toFixed(2)}%), ` +
                `and capital efficiency`
    };
  }

  calculateResilienceScore(stress_tests) {
    const viable_tests = stress_tests.filter(test => test.viability === 'Viable').length;
    const total_tests = stress_tests.length;
    return Math.round((viable_tests / total_tests) * 100);
  }

  getStressTestRecommendations(stress_tests) {
    const recommendations = [];
    
    const not_viable_count = stress_tests.filter(test => test.viability === 'Not Viable').length;
    const marginal_count = stress_tests.filter(test => test.viability === 'Marginal').length;
    
    if (not_viable_count > 3) {
      recommendations.push('Project has high risk - consider increasing profit margins or reducing costs');
    }
    
    if (marginal_count > 2) {
      recommendations.push('Build in additional safety margins for cost overruns and delays');
    }
    
    const worst_cost_impact = Math.max(...stress_tests
      .filter(t => t.impact === 'Cost')
      .map(t => Math.abs(t.profit_change)));
    
    if (worst_cost_impact > 15) {
      recommendations.push('Consider increasing contingency budget to protect against cost overruns');
    }
    
    return recommendations;
  }

  generateRecommendations(total_project_cost, construction_analysis, profitability, risk_analysis) {
    const recommendations = [];

    // Profitability recommendations
    if (profitability.investment_analysis.profit_margin < 10) {
      recommendations.push({
        category: 'Profitability',
        priority: 'High',
        recommendation: 'Profit margin below 10% - consider reducing costs or increasing finished value',
        action: 'Review construction budget and market comparables'
      });
    }

    // Risk recommendations
    if (risk_analysis.overall_risk_level === 'High') {
      recommendations.push({
        category: 'Risk Management',
        priority: 'High',
        recommendation: 'High risk level detected - implement comprehensive risk mitigation',
        action: 'Follow all recommended risk mitigation strategies'
      });
    }

    // Financing recommendations
    if (construction_analysis.ltc_ratio > 0.85) {
      recommendations.push({
        category: 'Financing',
        priority: 'Medium',
        recommendation: 'High leverage increases risk - consider additional equity investment',
        action: 'Reduce loan amount or increase down payment'
      });
    }

    // Timeline recommendations
    if (construction_analysis.expected_completion_month > 12) {
      recommendations.push({
        category: 'Timeline',
        priority: 'Medium',
        recommendation: 'Long construction timeline increases risk and costs',
        action: 'Develop detailed schedule with milestone tracking'
      });
    }

    // Contingency recommendations
    if (total_project_cost.contingency_percentage < 10) {
      recommendations.push({
        category: 'Budget',
        priority: 'High',
        recommendation: 'Increase contingency budget to protect against cost overruns',
        action: `Increase contingency from ${total_project_cost.contingency_percentage}% to at least 12%`
      });
    }

    return recommendations;
  }
}