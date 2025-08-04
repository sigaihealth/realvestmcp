export class RentVsBuyCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        home_details: {
          type: 'object',
          properties: {
            home_price: { type: 'number', minimum: 0 },
            down_payment_percent: { type: 'number', minimum: 0, maximum: 100 },
            loan_term_years: { type: 'number', minimum: 1, maximum: 50 },
            interest_rate: { type: 'number', minimum: 0, maximum: 20 },
            property_tax_rate: { type: 'number', minimum: 0, maximum: 10 },
            home_insurance_annual: { type: 'number', minimum: 0 },
            hoa_monthly: { type: 'number', minimum: 0 },
            pmi_rate: { type: 'number', minimum: 0, maximum: 5 }
          },
          required: ['home_price', 'down_payment_percent', 'interest_rate']
        },
        rental_details: {
          type: 'object',
          properties: {
            monthly_rent: { type: 'number', minimum: 0 },
            renters_insurance_annual: { type: 'number', minimum: 0 },
            security_deposit: { type: 'number', minimum: 0 },
            broker_fee: { type: 'number', minimum: 0 }
          },
          required: ['monthly_rent']
        },
        market_assumptions: {
          type: 'object',
          properties: {
            home_appreciation_rate: { type: 'number', minimum: -10, maximum: 20 },
            rent_increase_rate: { type: 'number', minimum: 0, maximum: 20 },
            investment_return_rate: { type: 'number', minimum: 0, maximum: 20 },
            inflation_rate: { type: 'number', minimum: 0, maximum: 10 }
          }
        },
        maintenance_costs: {
          type: 'object',
          properties: {
            annual_maintenance_percent: { type: 'number', minimum: 0, maximum: 10 },
            major_repairs_annual: { type: 'number', minimum: 0 },
            utilities_monthly_buy: { type: 'number', minimum: 0 },
            utilities_monthly_rent: { type: 'number', minimum: 0 }
          }
        },
        financial_profile: {
          type: 'object',
          properties: {
            tax_bracket: { type: 'number', minimum: 0, maximum: 50 },
            closing_costs_percent: { type: 'number', minimum: 0, maximum: 10 },
            selling_costs_percent: { type: 'number', minimum: 0, maximum: 15 },
            emergency_fund_months: { type: 'number', minimum: 0, maximum: 24 }
          }
        },
        lifestyle_factors: {
          type: 'object',
          properties: {
            expected_years_in_home: { type: 'number', minimum: 1, maximum: 50 },
            mobility_importance: { type: 'string', enum: ['low', 'medium', 'high'] },
            maintenance_preference: { type: 'string', enum: ['diy', 'hire_out', 'minimal'] },
            stability_importance: { type: 'string', enum: ['low', 'medium', 'high'] }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            sensitivity_analysis: { type: 'boolean' },
            breakeven_analysis: { type: 'boolean' },
            scenario_comparison: { type: 'boolean' },
            cash_flow_analysis: { type: 'boolean' }
          }
        }
      },
      required: ['home_details', 'rental_details']
    };
  }

  calculate(params) {
    const {
      home_details,
      rental_details,
      market_assumptions = {},
      maintenance_costs = {},
      financial_profile = {},
      lifestyle_factors = {},
      analysis_options = {}
    } = params;

    // Default values
    const defaults = {
      market_assumptions: {
        home_appreciation_rate: 3.0,
        rent_increase_rate: 3.0,
        investment_return_rate: 7.0,
        inflation_rate: 2.5
      },
      maintenance_costs: {
        annual_maintenance_percent: 1.0,
        major_repairs_annual: 2000,
        utilities_monthly_buy: 200,
        utilities_monthly_rent: 150
      },
      financial_profile: {
        tax_bracket: 22,
        closing_costs_percent: 3.0,
        selling_costs_percent: 6.0,
        emergency_fund_months: 6
      },
      lifestyle_factors: {
        expected_years_in_home: 7,
        mobility_importance: 'medium',
        maintenance_preference: 'hire_out',
        stability_importance: 'medium'
      }
    };

    const merged_market = { ...defaults.market_assumptions, ...market_assumptions };
    const merged_maintenance = { ...defaults.maintenance_costs, ...maintenance_costs };
    const merged_financial = { ...defaults.financial_profile, ...financial_profile };
    const merged_lifestyle = { ...defaults.lifestyle_factors, ...lifestyle_factors };

    // Calculate buying costs
    const buying_analysis = this.calculateBuyingCosts(
      home_details, 
      merged_market, 
      merged_maintenance, 
      merged_financial,
      merged_lifestyle
    );

    // Calculate renting costs
    const renting_analysis = this.calculateRentingCosts(
      rental_details,
      merged_market,
      merged_maintenance,
      merged_lifestyle,
      buying_analysis.upfront_costs.down_payment
    );

    // Compare scenarios
    const comparison = this.compareScenarios(
      buying_analysis,
      renting_analysis,
      merged_market,
      merged_financial,
      merged_lifestyle
    );

    // Breakeven analysis
    const breakeven_analysis = analysis_options.breakeven_analysis
      ? this.calculateBreakeven(home_details, rental_details, merged_market, merged_financial)
      : null;

    // Sensitivity analysis
    const sensitivity_analysis = analysis_options.sensitivity_analysis
      ? this.performSensitivityAnalysis(buying_analysis, renting_analysis, merged_market)
      : null;

    // Scenario comparison
    const scenario_comparison = analysis_options.scenario_comparison
      ? this.compareScenarios(buying_analysis, renting_analysis, merged_market, merged_financial, merged_lifestyle)
      : null;

    // Cash flow analysis
    const cash_flow_analysis = analysis_options.cash_flow_analysis
      ? this.analyzeCashFlow(buying_analysis, renting_analysis, merged_lifestyle)
      : null;

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      comparison,
      breakeven_analysis,
      merged_lifestyle,
      merged_financial
    );

    return {
      comparison_summary: {
        decision: comparison.recommended_choice,
        confidence_level: comparison.confidence_level,
        net_benefit_buy: comparison.financial_comparison.net_benefit_buy,
        net_benefit_rent: comparison.financial_comparison.net_benefit_rent,
        time_horizon: merged_lifestyle.expected_years_in_home
      },
      buying_analysis,
      renting_analysis,
      comparison,
      breakeven_analysis,
      sensitivity_analysis,
      scenario_comparison,
      cash_flow_analysis,
      recommendations
    };
  }

  calculateBuyingCosts(home_details, market_assumptions, maintenance_costs, financial_profile, lifestyle_factors) {
    const {
      home_price,
      down_payment_percent = 20,
      loan_term_years = 30,
      interest_rate,
      property_tax_rate = 1.2,
      home_insurance_annual = 1200,
      hoa_monthly = 0,
      pmi_rate = 0.5
    } = home_details;

    // Initial costs
    const down_payment = home_price * (down_payment_percent / 100);
    const loan_amount = home_price - down_payment;
    const closing_costs = home_price * (financial_profile.closing_costs_percent / 100);
    const total_upfront = down_payment + closing_costs;

    // Monthly costs
    const monthly_rate = (interest_rate / 100) / 12;
    const num_payments = loan_term_years * 12;
    const monthly_principal_interest = loan_amount * 
      (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) / 
      (Math.pow(1 + monthly_rate, num_payments) - 1);

    const monthly_property_tax = (home_price * (property_tax_rate / 100)) / 12;
    const monthly_insurance = home_insurance_annual / 12;
    const monthly_pmi = down_payment_percent < 20 ? (loan_amount * (pmi_rate / 100)) / 12 : 0;
    const monthly_maintenance = (home_price * (maintenance_costs.annual_maintenance_percent / 100)) / 12;

    const total_monthly_payment = monthly_principal_interest + monthly_property_tax + 
      monthly_insurance + monthly_pmi + hoa_monthly + monthly_maintenance + 
      maintenance_costs.utilities_monthly_buy;

    // Calculate costs over time horizon
    const years = lifestyle_factors.expected_years_in_home;
    const total_payments = total_monthly_payment * 12 * years;
    
    // Calculate equity and appreciation
    const future_home_value = home_price * Math.pow(1 + (market_assumptions.home_appreciation_rate / 100), years);
    const remaining_balance = this.calculateRemainingBalance(loan_amount, monthly_rate, num_payments, years * 12);
    const equity_buildup = loan_amount - remaining_balance;
    const appreciation_gain = future_home_value - home_price;
    
    // Selling costs
    const selling_costs = future_home_value * (financial_profile.selling_costs_percent / 100);
    const net_proceeds = future_home_value - remaining_balance - selling_costs;

    // Tax benefits
    const annual_mortgage_interest = this.calculateAnnualInterest(loan_amount, monthly_rate, num_payments, years);
    const annual_property_tax = monthly_property_tax * 12;
    const total_deductions = annual_mortgage_interest + annual_property_tax;
    const annual_tax_savings = (total_deductions * (financial_profile.tax_bracket / 100)) / years;

    return {
      upfront_costs: {
        down_payment,
        closing_costs,
        total_upfront
      },
      monthly_costs: {
        principal_and_interest: monthly_principal_interest,
        property_tax: monthly_property_tax,
        insurance: monthly_insurance,
        pmi: monthly_pmi,
        hoa: hoa_monthly,
        maintenance: monthly_maintenance,
        utilities: maintenance_costs.utilities_monthly_buy,
        total_monthly: total_monthly_payment
      },
      long_term_analysis: {
        total_payments_over_period: total_payments,
        equity_buildup,
        appreciation_gain,
        future_home_value,
        net_proceeds_if_sold: net_proceeds,
        annual_tax_savings,
        total_cost_of_ownership: total_upfront + total_payments - net_proceeds
      },
      financing_details: {
        loan_amount,
        remaining_balance,
        total_interest_paid: (monthly_principal_interest * 12 * years) - equity_buildup
      }
    };
  }

  calculateRentingCosts(rental_details, market_assumptions, maintenance_costs, lifestyle_factors, buying_down_payment = 0) {
    const {
      monthly_rent,
      renters_insurance_annual = 200,
      security_deposit = monthly_rent,
      broker_fee = 0
    } = rental_details;

    const years = lifestyle_factors.expected_years_in_home;
    
    // Initial costs
    const upfront_costs = security_deposit + broker_fee;
    
    // Calculate rent increases over time
    let total_rent_paid = 0;
    let current_rent = monthly_rent;
    const rent_progression = [];
    
    for (let year = 1; year <= years; year++) {
      const annual_rent = current_rent * 12;
      total_rent_paid += annual_rent;
      
      rent_progression.push({
        year,
        monthly_rent: Math.round(current_rent),
        annual_rent: Math.round(annual_rent)
      });
      
      // Increase rent for next year
      current_rent *= (1 + (market_assumptions.rent_increase_rate / 100));
    }

    // Total costs
    const total_insurance = (renters_insurance_annual * years);
    const total_utilities = (maintenance_costs.utilities_monthly_rent * 12 * years);
    const total_cost_of_renting = upfront_costs + total_rent_paid + total_insurance + total_utilities;

    // Opportunity cost of not investing down payment
    const opportunity_cost = this.calculateOpportunityCost(
      buying_down_payment > 0 ? buying_down_payment : upfront_costs, 
      market_assumptions.investment_return_rate, 
      years
    );

    return {
      upfront_costs: {
        security_deposit,
        broker_fee,
        total_upfront: upfront_costs
      },
      monthly_costs: {
        base_rent: monthly_rent,
        insurance: renters_insurance_annual / 12,
        utilities: maintenance_costs.utilities_monthly_rent,
        total_monthly: monthly_rent + (renters_insurance_annual / 12) + maintenance_costs.utilities_monthly_rent
      },
      long_term_analysis: {
        total_rent_paid,
        total_insurance,
        total_utilities,
        total_cost_of_renting,
        rent_progression,
        final_monthly_rent: Math.round(current_rent),
        opportunity_cost_analysis: {
          potential_investment_value: opportunity_cost,
          foregone_returns: opportunity_cost - (buying_down_payment > 0 ? buying_down_payment : upfront_costs)
        }
      }
    };
  }

  compareScenarios(buying_analysis, renting_analysis, market_assumptions, financial_profile, lifestyle_factors) {
    const buy_total_cost = buying_analysis.long_term_analysis.total_cost_of_ownership;
    const rent_total_cost = renting_analysis.long_term_analysis.total_cost_of_renting;
    
    const net_benefit_buy = rent_total_cost - buy_total_cost;
    const net_benefit_rent = buy_total_cost - rent_total_cost;
    
    // Financial comparison
    const financial_winner = net_benefit_buy > 0 ? 'Buy' : 'Rent';
    const financial_advantage = Math.abs(net_benefit_buy);
    
    // Lifestyle scoring
    const lifestyle_score = this.calculateLifestyleScore(lifestyle_factors);
    
    // Risk assessment
    const risk_assessment = this.assessRisk(buying_analysis, market_assumptions, financial_profile);
    
    // Overall recommendation
    const recommendation = this.determineRecommendation(
      net_benefit_buy,
      lifestyle_score,
      risk_assessment,
      lifestyle_factors
    );

    return {
      financial_comparison: {
        buy_total_cost,
        rent_total_cost,
        net_benefit_buy,
        net_benefit_rent,
        financial_winner,
        financial_advantage,
        break_even_years: this.calculateSimpleBreakeven(buying_analysis, renting_analysis)
      },
      lifestyle_analysis: {
        lifestyle_score,
        mobility_factor: lifestyle_factors.mobility_importance,
        stability_preference: lifestyle_factors.stability_importance,
        maintenance_comfort: lifestyle_factors.maintenance_preference
      },
      risk_analysis: risk_assessment,
      recommended_choice: recommendation.choice,
      confidence_level: recommendation.confidence,
      decision_factors: recommendation.factors
    };
  }

  calculateBreakeven(home_details, rental_details, market_assumptions, financial_profile) {
    const scenarios = [];
    
    // Test different time horizons (1-15 years)
    for (let years = 1; years <= 15; years++) {
      const lifestyle_temp = { expected_years_in_home: years };
      
      const buying = this.calculateBuyingCosts(
        home_details, 
        market_assumptions, 
        { annual_maintenance_percent: 1.0, major_repairs_annual: 2000, utilities_monthly_buy: 200 },
        financial_profile,
        lifestyle_temp
      );
      
      const renting = this.calculateRentingCosts(
        rental_details,
        market_assumptions,
        { utilities_monthly_rent: 150 },
        lifestyle_temp,
        buying.upfront_costs.down_payment
      );
      
      const net_benefit = renting.long_term_analysis.total_cost_of_renting - 
                         buying.long_term_analysis.total_cost_of_ownership;
      
      scenarios.push({
        years,
        buying_total_cost: buying.long_term_analysis.total_cost_of_ownership,
        renting_total_cost: renting.long_term_analysis.total_cost_of_renting,
        net_benefit_buy: net_benefit,
        better_choice: net_benefit > 0 ? 'Buy' : 'Rent'
      });
    }
    
    // Find breakeven point
    let breakeven_years = null;
    for (let i = 0; i < scenarios.length - 1; i++) {
      if (scenarios[i].better_choice !== scenarios[i + 1].better_choice) {
        breakeven_years = scenarios[i].years + 0.5; // Approximate
        break;
      }
    }

    return {
      scenarios,
      breakeven_years,
      breakeven_analysis: breakeven_years ? 
        `Buying becomes advantageous after approximately ${breakeven_years} years` :
        'No clear breakeven point within 15-year analysis period'
    };
  }

  performSensitivityAnalysis(buying_analysis, renting_analysis, market_assumptions) {
    const base_net_benefit = renting_analysis.long_term_analysis.total_cost_of_renting - 
                            buying_analysis.long_term_analysis.total_cost_of_ownership;
    
    const sensitivity_factors = [
      { factor: 'Home Appreciation Rate', base_value: market_assumptions.home_appreciation_rate, range: [-2, -1, 0, 1, 2] },
      { factor: 'Rent Increase Rate', base_value: market_assumptions.rent_increase_rate, range: [-1, -0.5, 0, 0.5, 1] },
      { factor: 'Interest Rate', base_value: 6.5, range: [-1, -0.5, 0, 0.5, 1] }
    ];

    const sensitivity_results = sensitivity_factors.map(factor => {
      const scenarios = factor.range.map(adjustment => {
        const adjusted_value = factor.base_value + adjustment;
        // Simplified sensitivity - in practice would recalculate full scenarios
        const impact_multiplier = adjustment * 0.1; // Simplified
        const adjusted_benefit = base_net_benefit * (1 + impact_multiplier);
        
        return {
          adjustment,
          adjusted_value,
          net_benefit_change: adjusted_benefit - base_net_benefit,
          recommended_choice: adjusted_benefit > 0 ? 'Buy' : 'Rent'
        };
      });
      
      return {
        factor: factor.factor,
        base_value: factor.base_value,
        scenarios
      };
    });

    return {
      base_net_benefit,
      sensitivity_results,
      most_sensitive_factor: sensitivity_results.reduce((most, current) => {
        const current_range = Math.max(...current.scenarios.map(s => Math.abs(s.net_benefit_change)));
        const most_range = Math.max(...most.scenarios.map(s => Math.abs(s.net_benefit_change)));
        return current_range > most_range ? current : most;
      })
    };
  }

  analyzeCashFlow(buying_analysis, renting_analysis, lifestyle_factors) {
    const years = lifestyle_factors.expected_years_in_home;
    const monthly_buy = buying_analysis.monthly_costs.total_monthly;
    const monthly_rent_start = renting_analysis.monthly_costs.total_monthly;
    
    const cash_flow_comparison = [];
    let cumulative_buy = buying_analysis.upfront_costs.total_upfront;
    let cumulative_rent = renting_analysis.upfront_costs.total_upfront;
    let current_rent = renting_analysis.monthly_costs.base_rent;
    
    for (let year = 1; year <= years; year++) {
      const annual_buy = monthly_buy * 12;
      const annual_rent = (current_rent + renting_analysis.monthly_costs.insurance + 
                          renting_analysis.monthly_costs.utilities) * 12;
      
      cumulative_buy += annual_buy;
      cumulative_rent += annual_rent;
      
      cash_flow_comparison.push({
        year,
        annual_buy_cost: Math.round(annual_buy),
        annual_rent_cost: Math.round(annual_rent),
        cumulative_buy_cost: Math.round(cumulative_buy),
        cumulative_rent_cost: Math.round(cumulative_rent),
        monthly_difference: Math.round(monthly_buy - (annual_rent / 12)),
        cumulative_difference: Math.round(cumulative_buy - cumulative_rent)
      });
      
      // Increase rent for next year
      current_rent *= 1.03; // 3% increase
    }

    const average_monthly_difference = cash_flow_comparison.reduce((sum, year) => 
      sum + year.monthly_difference, 0) / years;

    return {
      cash_flow_comparison,
      summary: {
        average_monthly_difference: Math.round(average_monthly_difference),
        initial_monthly_difference: cash_flow_comparison[0].monthly_difference,
        final_year_difference: cash_flow_comparison[years - 1].monthly_difference,
        upfront_difference: buying_analysis.upfront_costs.total_upfront - 
                           renting_analysis.upfront_costs.total_upfront
      }
    };
  }

  calculateLifestyleScore(lifestyle_factors) {
    let score = 50; // Neutral starting point
    
    // Mobility importance (higher = favor renting)
    switch (lifestyle_factors.mobility_importance) {
      case 'high': score -= 15; break;
      case 'medium': score -= 5; break;
      case 'low': score += 10; break;
    }
    
    // Stability importance (higher = favor buying)
    switch (lifestyle_factors.stability_importance) {
      case 'high': score += 15; break;
      case 'medium': score += 5; break;
      case 'low': score -= 5; break;
    }
    
    // Maintenance preference (DIY = favor buying, minimal = favor renting)
    switch (lifestyle_factors.maintenance_preference) {
      case 'diy': score += 10; break;
      case 'hire_out': score += 0; break;
      case 'minimal': score -= 10; break;
    }
    
    // Time horizon (longer = favor buying)
    const years = lifestyle_factors.expected_years_in_home;
    if (years >= 10) score += 15;
    else if (years >= 7) score += 10;
    else if (years >= 5) score += 5;
    else if (years >= 3) score += 0;
    else score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  assessRisk(buying_analysis, market_assumptions, financial_profile) {
    const risks = [];
    let overall_risk_score = 0;
    
    // Market risk
    if (market_assumptions.home_appreciation_rate < 2) {
      risks.push({
        category: 'Market Risk',
        level: 'High',
        description: 'Low home appreciation rate increases risk of negative equity',
        impact: 'High'
      });
      overall_risk_score += 25;
    } else if (market_assumptions.home_appreciation_rate < 3) {
      risks.push({
        category: 'Market Risk',
        level: 'Medium',
        description: 'Moderate home appreciation rate',
        impact: 'Medium'
      });
      overall_risk_score += 15;
    }
    
    // Liquidity risk
    const upfront_investment = buying_analysis.upfront_costs.total_upfront;
    if (upfront_investment > 100000) {
      risks.push({
        category: 'Liquidity Risk',
        level: 'Medium',
        description: 'Large upfront investment reduces liquid assets',
        impact: 'Medium'
      });
      overall_risk_score += 15;
    }
    
    // Interest rate risk
    risks.push({
      category: 'Interest Rate Risk',
      level: 'Medium',
      description: 'Fixed-rate mortgage provides protection against rate increases',
      impact: 'Low'
    });
    overall_risk_score += 5;
    
    // Maintenance risk
    risks.push({
      category: 'Maintenance Risk',
      level: 'Medium',
      description: 'Homeowners bear responsibility for all repairs and maintenance',
      impact: 'Medium'
    });
    overall_risk_score += 10;

    let risk_level;
    if (overall_risk_score >= 40) risk_level = 'High';
    else if (overall_risk_score >= 20) risk_level = 'Medium';
    else risk_level = 'Low';

    return {
      identified_risks: risks,
      overall_risk_score,
      overall_risk_level: risk_level,
      risk_mitigation_strategies: [
        'Maintain adequate emergency fund (6-12 months expenses)',
        'Consider home warranty for major systems',
        'Budget extra 1-2% of home value annually for maintenance',
        'Ensure stable employment before purchasing',
        'Consider rent-to-own or lease-option arrangements'
      ]
    };
  }

  determineRecommendation(net_benefit_buy, lifestyle_score, risk_assessment, lifestyle_factors) {
    let choice;
    let confidence;
    let factors = [];
    
    // Financial factor (40% weight)
    const financial_score = net_benefit_buy > 0 ? 
      Math.min(40, (net_benefit_buy / 50000) * 20 + 20) : 
      Math.max(-40, (net_benefit_buy / 50000) * 20 - 20);
    
    // Lifestyle factor (35% weight)
    const lifestyle_weighted = ((lifestyle_score - 50) / 50) * 35;
    
    // Risk factor (25% weight)
    const risk_weighted = risk_assessment.overall_risk_level === 'High' ? -25 :
                         risk_assessment.overall_risk_level === 'Medium' ? -10 : 0;
    
    const total_score = financial_score + lifestyle_weighted + risk_weighted;
    
    if (total_score > 15) {
      choice = 'Buy';
      confidence = total_score > 30 ? 'High' : 'Medium';
    } else if (total_score < -15) {
      choice = 'Rent';
      confidence = total_score < -30 ? 'High' : 'Medium';
    } else {
      choice = 'Neutral';
      confidence = 'Low';
    }
    
    // Add decision factors
    if (net_benefit_buy > 25000) factors.push('Strong financial advantage to buying');
    else if (net_benefit_buy < -25000) factors.push('Strong financial advantage to renting');
    
    if (lifestyle_factors.expected_years_in_home >= 7) factors.push('Long time horizon favors buying');
    else if (lifestyle_factors.expected_years_in_home <= 3) factors.push('Short time horizon favors renting');
    
    if (lifestyle_factors.mobility_importance === 'high') factors.push('High mobility needs favor renting');
    if (lifestyle_factors.stability_importance === 'high') factors.push('Stability preference favors buying');
    
    return { choice, confidence, factors };
  }

  generateRecommendations(comparison, breakeven_analysis, lifestyle_factors, financial_profile) {
    const recommendations = [];
    
    // Primary recommendation
    if (comparison.recommended_choice === 'Buy') {
      recommendations.push({
        category: 'Primary Decision',
        recommendation: '🏠 Consider Buying',
        reasoning: `Financial analysis shows ${comparison.financial_comparison.financial_advantage > 0 ? 'buying advantage of $' + Math.round(comparison.financial_comparison.financial_advantage).toLocaleString() : 'neutral financial position'}`,
        priority: 'High'
      });
    } else if (comparison.recommended_choice === 'Rent') {
      recommendations.push({
        category: 'Primary Decision',
        recommendation: '🏠 Consider Renting',
        reasoning: `Financial analysis shows ${comparison.financial_comparison.financial_advantage > 0 ? 'renting advantage of $' + Math.round(comparison.financial_comparison.financial_advantage).toLocaleString() : 'neutral financial position'}`,
        priority: 'High'
      });
    } else {
      recommendations.push({
        category: 'Primary Decision',
        recommendation: '⚖️ Decision is Close - Consider Personal Factors',
        reasoning: 'Financial analysis shows minimal difference between renting and buying',
        priority: 'High'
      });
    }
    
    // Time horizon recommendations
    if (lifestyle_factors.expected_years_in_home < 5) {
      recommendations.push({
        category: 'Time Horizon',
        recommendation: '📅 Short time horizon typically favors renting',
        reasoning: `Planning to stay ${lifestyle_factors.expected_years_in_home} years may not allow enough time to recoup buying costs`,
        priority: 'Medium'
      });
    }
    
    // Breakeven insights
    if (breakeven_analysis && breakeven_analysis.breakeven_years) {
      recommendations.push({
        category: 'Breakeven Analysis',
        recommendation: `⏰ Breakeven occurs at ${breakeven_analysis.breakeven_years} years`,
        reasoning: breakeven_analysis.breakeven_analysis,
        priority: 'Medium'
      });
    }
    
    // Risk management
    if (comparison.risk_analysis.overall_risk_level === 'High') {
      recommendations.push({
        category: 'Risk Management',
        recommendation: '⚠️ Address high-risk factors before buying',
        reasoning: 'Multiple risk factors identified that could impact homeownership success',
        priority: 'High'
      });
    }
    
    // Financial preparation
    recommendations.push({
      category: 'Financial Preparation',
      recommendation: '💰 Ensure adequate emergency fund',
      reasoning: `Maintain ${financial_profile.emergency_fund_months}-month emergency fund regardless of decision`,
      priority: 'Medium'
    });

    return {
      recommendations,
      overall_assessment: this.getOverallAssessment(comparison),
      key_considerations: [
        'Time horizon is crucial - longer stays favor buying',
        'Consider total cost of ownership, not just monthly payments',
        'Factor in lifestyle preferences and mobility needs',
        'Maintain emergency fund for unexpected expenses',
        'Market conditions can significantly impact outcomes'
      ]
    };
  }

  getOverallAssessment(comparison) {
    const confidence = comparison.confidence_level;
    const decision = comparison.recommended_choice;
    
    if (confidence === 'High') {
      return `Strong ${decision} Recommendation - Clear Financial and Lifestyle Advantages`;
    } else if (confidence === 'Medium') {
      return `Moderate ${decision} Lean - Some Advantages but Consider All Factors`;
    } else {
      return 'Close Decision - Personal Preferences Should Drive Final Choice';
    }
  }

  // Helper methods
  calculateRemainingBalance(principal, monthly_rate, num_payments, payments_made) {
    if (payments_made >= num_payments) return 0;
    
    const remaining_payments = num_payments - payments_made;
    const monthly_payment = principal * 
      (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) / 
      (Math.pow(1 + monthly_rate, num_payments) - 1);
    
    return monthly_payment * (1 - Math.pow(1 + monthly_rate, -remaining_payments)) / monthly_rate;
  }

  calculateAnnualInterest(principal, monthly_rate, num_payments, years) {
    let total_interest = 0;
    let remaining_balance = principal;
    const monthly_payment = principal * 
      (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) / 
      (Math.pow(1 + monthly_rate, num_payments) - 1);
    
    for (let month = 1; month <= years * 12; month++) {
      const interest_payment = remaining_balance * monthly_rate;
      total_interest += interest_payment;
      const principal_payment = monthly_payment - interest_payment;
      remaining_balance -= principal_payment;
      
      if (remaining_balance <= 0) break;
    }
    
    return total_interest;
  }

  calculateOpportunityCost(amount, annual_return_rate, years) {
    return amount * Math.pow(1 + (annual_return_rate / 100), years);
  }

  calculateSimpleBreakeven(buying_analysis, renting_analysis) {
    const monthly_diff = buying_analysis.monthly_costs.total_monthly - 
                        renting_analysis.monthly_costs.total_monthly;
    const upfront_diff = buying_analysis.upfront_costs.total_upfront - 
                        renting_analysis.upfront_costs.total_upfront;
    
    if (monthly_diff <= 0) return null; // Buying is cheaper monthly
    
    return Math.round((upfront_diff / monthly_diff) / 12 * 10) / 10; // Years to breakeven
  }
}