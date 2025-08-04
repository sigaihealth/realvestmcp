/**
 * Wholesale Deal Analyzer
 * Analyzes wholesale real estate deals with assignment fees, profit margins, and exit strategies
 */

export class WholesaleDealAnalyzer {
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
              enum: ['single_family', 'multi_family', 'condo', 'townhouse', 'commercial'],
              description: 'Type of property'
            },
            square_footage: { type: 'number', minimum: 0, description: 'Total square footage' },
            bedrooms: { type: 'number', minimum: 0, description: 'Number of bedrooms' },
            bathrooms: { type: 'number', minimum: 0, description: 'Number of bathrooms' },
            year_built: { type: 'number', minimum: 1800, description: 'Year property was built' },
            condition: {
              type: 'string',
              enum: ['excellent', 'good', 'fair', 'poor', 'distressed'],
              description: 'Current condition of property'
            }
          },
          required: ['property_type', 'condition']
        },
        purchase_details: {
          type: 'object',
          properties: {
            contract_price: { type: 'number', minimum: 0, description: 'Price under contract with seller' },
            earnest_money: { type: 'number', minimum: 0, description: 'Earnest money deposit' },
            inspection_period_days: { type: 'number', minimum: 0, description: 'Inspection period in days' },
            closing_date: { type: 'string', description: 'Expected closing date' },
            seller_motivation: {
              type: 'string',
              enum: ['very_high', 'high', 'moderate', 'low'],
              description: 'Level of seller motivation'
            },
            days_on_market: { type: 'number', minimum: 0, description: 'How long property has been listed' }
          },
          required: ['contract_price']
        },
        market_analysis: {
          type: 'object',
          properties: {
            arv: { type: 'number', minimum: 0, description: 'After Repair Value (ARV)' },
            repair_estimates: { type: 'number', minimum: 0, description: 'Estimated repair costs' },
            comparable_sales: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  address: { type: 'string', description: 'Comparable property address' },
                  sale_price: { type: 'number', minimum: 0, description: 'Sale price' },
                  square_footage: { type: 'number', minimum: 0, description: 'Square footage' },
                  days_on_market: { type: 'number', minimum: 0, description: 'Days on market' },
                  sale_date: { type: 'string', description: 'Date of sale' }
                },
                required: ['sale_price']
              },
              description: 'Comparable sales data'
            },
            neighborhood_grade: {
              type: 'string',
              enum: ['A', 'B', 'C', 'D'],
              description: 'Neighborhood quality grade'
            },
            market_trend: {
              type: 'string',
              enum: ['appreciating', 'stable', 'declining'],
              description: 'Current market trend'
            }
          },
          required: ['arv']
        },
        wholesale_strategy: {
          type: 'object',
          properties: {
            assignment_fee: { type: 'number', minimum: 0, description: 'Planned assignment fee' },
            marketing_budget: { type: 'number', minimum: 0, description: 'Budget for marketing to buyers' },
            holding_costs_daily: { type: 'number', minimum: 0, description: 'Daily holding costs' },
            target_buyer_type: {
              type: 'string',
              enum: ['fix_flip', 'buy_hold', 'owner_occupant', 'developer'],
              description: 'Target buyer profile'
            },
            buyer_list_size: { type: 'number', minimum: 0, description: 'Size of active buyer list' }
          },
          required: ['assignment_fee']
        },
        analysis_options: {
          type: 'object',
          properties: {
            include_exit_strategies: { type: 'boolean', description: 'Include alternative exit strategies' },
            calculate_buyer_analysis: { type: 'boolean', description: 'Calculate end buyer deal analysis' },
            risk_assessment: { type: 'boolean', description: 'Perform comprehensive risk analysis' },
            market_timing: { type: 'boolean', description: 'Analyze market timing factors' }
          }
        }
      },
      required: ['property_details', 'purchase_details', 'market_analysis', 'wholesale_strategy']
    };
  }

  calculate(params) {
    const {
      property_details,
      purchase_details,
      market_analysis,
      wholesale_strategy,
      analysis_options = {}
    } = params;

    // Calculate wholesale deal metrics
    const deal_metrics = this.calculateDealMetrics(
      purchase_details,
      market_analysis,
      wholesale_strategy
    );

    // Analyze end buyer's deal
    const buyer_analysis = analysis_options.calculate_buyer_analysis ?
      this.analyzeBuyerDeal(
        purchase_details,
        market_analysis,
        wholesale_strategy
      ) : null;

    // Calculate profitability
    const profitability = this.calculateProfitability(
      deal_metrics,
      wholesale_strategy
    );

    // Risk assessment
    const risk_analysis = analysis_options.risk_assessment ?
      this.assessRisks(
        property_details,
        purchase_details,
        market_analysis,
        deal_metrics
      ) : null;

    // Exit strategies
    const exit_strategies = analysis_options.include_exit_strategies ?
      this.analyzeExitStrategies(
        purchase_details,
        market_analysis,
        deal_metrics
      ) : null;

    // Market timing analysis
    const market_timing = analysis_options.market_timing ?
      this.analyzeMarketTiming(
        market_analysis,
        purchase_details
      ) : null;

    return {
      property_summary: this.createPropertySummary(property_details, purchase_details),
      deal_metrics,
      profitability_analysis: profitability,
      buyer_analysis,
      risk_assessment: risk_analysis,
      exit_strategies,
      market_timing,
      recommendations: this.generateRecommendations(
        deal_metrics,
        profitability,
        risk_analysis,
        market_analysis
      )
    };
  }

  createPropertySummary(property_details, purchase_details) {
    return {
      ...property_details,
      contract_price: purchase_details.contract_price,
      price_per_sqft: property_details.square_footage ?
        purchase_details.contract_price / property_details.square_footage : null,
      seller_motivation: purchase_details.seller_motivation,
      days_on_market: purchase_details.days_on_market
    };
  }

  calculateDealMetrics(purchase_details, market_analysis, wholesale_strategy) {
    const contract_price = purchase_details.contract_price;
    const arv = market_analysis.arv;
    const repair_costs = market_analysis.repair_estimates || 0;
    const assignment_fee = wholesale_strategy.assignment_fee;

    // Calculate end buyer's acquisition cost
    const buyer_acquisition_cost = contract_price + assignment_fee;
    
    // Calculate maximum allowable offer (MAO) for end buyer
    const buyer_profit_margin = 0.15; // 15% minimum profit for buyer
    const buyer_holding_costs = arv * 0.03; // 3% for holding costs
    const buyer_closing_costs = arv * 0.02; // 2% for closing costs
    
    const buyer_mao = arv - repair_costs - (arv * buyer_profit_margin) - 
                     buyer_holding_costs - buyer_closing_costs;

    // Wholesale deal analysis
    const wholesale_spread = buyer_mao - contract_price;
    const assignment_fee_percentage = (assignment_fee / contract_price) * 100;
    const buyer_total_investment = buyer_acquisition_cost + repair_costs;
    const buyer_equity_position = arv - buyer_total_investment;
    const buyer_roi = (buyer_equity_position / buyer_total_investment) * 100;

    // Deal quality metrics
    const arv_to_contract_ratio = arv / contract_price;
    const repair_to_arv_ratio = (repair_costs / arv) * 100;
    
    return {
      contract_price,
      arv,
      repair_costs,
      assignment_fee,
      buyer_acquisition_cost,
      buyer_mao,
      wholesale_spread,
      assignment_fee_percentage,
      buyer_total_investment,
      buyer_equity_position,
      buyer_roi,
      deal_quality_metrics: {
        arv_to_contract_ratio,
        repair_to_arv_ratio,
        wholesale_margin: wholesale_spread,
        deal_grade: this.gradeDeal(wholesale_spread, buyer_roi, arv_to_contract_ratio)
      }
    };
  }

  calculateProfitability(deal_metrics, wholesale_strategy) {
    const assignment_fee = deal_metrics.assignment_fee;
    const marketing_budget = wholesale_strategy.marketing_budget || assignment_fee * 0.1;
    const earnest_money = wholesale_strategy.earnest_money || 1000;
    
    // Estimate time to assign (days)
    const avg_days_to_assign = this.estimateDaysToAssign(
      wholesale_strategy.buyer_list_size || 50,
      deal_metrics.deal_quality_metrics.deal_grade
    );

    const holding_costs = (wholesale_strategy.holding_costs_daily || 25) * avg_days_to_assign;
    
    const total_costs = marketing_budget + holding_costs;
    const net_profit = assignment_fee - total_costs;
    const profit_margin = (net_profit / assignment_fee) * 100;
    const roi_on_costs = total_costs > 0 ? (net_profit / total_costs) * 100 : null;
    
    // Annualized return
    const days_in_year = 365;
    const annualized_roi = roi_on_costs ? (roi_on_costs * days_in_year / avg_days_to_assign) : null;
    
    return {
      gross_profit: assignment_fee,
      total_costs,
      cost_breakdown: {
        marketing_budget,
        holding_costs,
        earnest_money_tied_up: earnest_money
      },
      net_profit,
      profit_margin,
      estimated_days_to_assign: avg_days_to_assign,
      roi_on_costs,
      annualized_roi,
      profitability_rating: this.rateProfitability(net_profit, profit_margin, annualized_roi)
    };
  }

  analyzeBuyerDeal(purchase_details, market_analysis, wholesale_strategy) {
    const buyer_acquisition = purchase_details.contract_price + wholesale_strategy.assignment_fee;
    const arv = market_analysis.arv;
    const repair_costs = market_analysis.repair_estimates || 0;
    const total_investment = buyer_acquisition + repair_costs;
    
    // Buyer's returns
    const gross_profit = arv - total_investment;
    const profit_margin = (gross_profit / arv) * 100;
    const roi = (gross_profit / total_investment) * 100;
    
    // 70% rule compliance
    const seventy_percent_rule = arv * 0.7 - repair_costs;
    const meets_70_rule = buyer_acquisition <= seventy_percent_rule;
    
    // Cash-on-cash return if financed
    const down_payment = total_investment * 0.25; // 25% down typical
    const annual_cash_flow = gross_profit * 0.1; // Estimate annual cash flow
    const cash_on_cash = (annual_cash_flow / down_payment) * 100;
    
    return {
      buyer_acquisition_cost: buyer_acquisition,
      total_investment,
      gross_profit,
      profit_margin,
      roi,
      financing_analysis: {
        down_payment_25_percent: down_payment,
        estimated_annual_cash_flow: annual_cash_flow,
        cash_on_cash_return: cash_on_cash
      },
      seventy_percent_rule: {
        max_allowable_offer: seventy_percent_rule,
        actual_offer: buyer_acquisition,
        meets_rule: meets_70_rule,
        margin: seventy_percent_rule - buyer_acquisition
      },
      buyer_deal_quality: this.rateBuyerDeal(profit_margin, roi, meets_70_rule)
    };
  }

  assessRisks(property_details, purchase_details, market_analysis, deal_metrics) {
    const risks = [];
    let risk_score = 0;

    // Market risk
    if (market_analysis.market_trend === 'declining') {
      risks.push({
        category: 'Market Risk',
        level: 'High',
        description: 'Declining market may affect ARV and buyer demand',
        impact: 'Reduced buyer interest, longer assignment time'
      });
      risk_score += 3;
    }

    // Property condition risk
    if (property_details.condition === 'poor' || property_details.condition === 'distressed') {
      risks.push({
        category: 'Property Risk',
        level: 'High',
        description: 'Poor condition may lead to higher repair costs than estimated',
        impact: 'Buyer may renegotiate or walk away'
      });
      risk_score += 3;
    }

    // Deal margin risk
    if (deal_metrics.wholesale_spread < 10000) {
      risks.push({
        category: 'Deal Risk',
        level: 'High',
        description: 'Low wholesale spread leaves little room for error',
        impact: 'Difficulty finding qualified buyers'
      });
      risk_score += 3;
    }

    // Seller motivation risk
    if (purchase_details.seller_motivation === 'low') {
      risks.push({
        category: 'Seller Risk',
        level: 'Medium',
        description: 'Low seller motivation may lead to deal falling through',
        impact: 'Seller may accept higher offer or change terms'
      });
      risk_score += 2;
    }

    // Time risk
    const inspection_period = purchase_details.inspection_period_days || 10;
    if (inspection_period < 7) {
      risks.push({
        category: 'Time Risk',
        level: 'Medium',
        description: 'Short inspection period limits marketing time',
        impact: 'Pressure to find buyer quickly'
      });
      risk_score += 2;
    }

    // Repair estimate risk
    const repair_to_arv = deal_metrics.deal_quality_metrics.repair_to_arv_ratio;
    if (repair_to_arv > 25) {
      risks.push({
        category: 'Repair Risk',
        level: 'High',
        description: 'High repair costs increase chance of estimate errors',
        impact: 'Buyer may get different repair estimates'
      });
      risk_score += 3;
    }

    const overall_risk_level = risk_score >= 8 ? 'High' : risk_score >= 4 ? 'Medium' : 'Low';

    return {
      identified_risks: risks,
      risk_score,
      overall_risk_level,
      risk_mitigation_strategies: this.getRiskMitigationStrategies(risks)
    };
  }

  analyzeExitStrategies(purchase_details, market_analysis, deal_metrics) {
    const contract_price = purchase_details.contract_price;
    const arv = market_analysis.arv;
    const repair_costs = market_analysis.repair_estimates || 0;

    const strategies = [];

    // Strategy 1: Wholesale Assignment (primary)
    strategies.push({
      strategy: 'Wholesale Assignment',
      description: 'Assign contract to end buyer for assignment fee',
      estimated_profit: deal_metrics.assignment_fee,
      time_to_close: '15-30 days',
      capital_required: purchase_details.earnest_money || 1000,
      risk_level: 'Medium',
      pros: ['Quick turnaround', 'Low capital requirement', 'No repair responsibility'],
      cons: ['Dependent on finding buyer', 'Limited profit potential']
    });

    // Strategy 2: Double Close
    const double_close_profit = deal_metrics.assignment_fee * 1.5; // Typically higher fee
    strategies.push({
      strategy: 'Double Close',
      description: 'Close on property and immediately sell to end buyer',
      estimated_profit: double_close_profit,
      time_to_close: '30-45 days',
      capital_required: contract_price * 0.1, // 10% for transactional funding
      risk_level: 'High',
      pros: ['Higher profit potential', 'More control over transaction'],
      cons: ['Higher capital requirement', 'Closing cost burden', 'Title seasoning issues']
    });

    // Strategy 3: Fix and Flip (if margins support)
    if (deal_metrics.buyer_roi > 20) {
      const flip_profit = arv - contract_price - repair_costs - (arv * 0.1); // 10% for costs
      strategies.push({
        strategy: 'Fix and Flip',
        description: 'Purchase, renovate, and retail the property',
        estimated_profit: flip_profit,
        time_to_close: '4-6 months',
        capital_required: contract_price + repair_costs,
        risk_level: 'High',
        pros: ['Highest profit potential', 'Full control of project'],
        cons: ['High capital requirement', 'Construction risk', 'Longer timeline']
      });
    }

    // Strategy 4: Lease Option (creative)
    const lease_option_monthly = (arv * 0.008); // 0.8% of ARV monthly rent
    strategies.push({
      strategy: 'Lease Option',
      description: 'Lease with option to purchase, sublease to tenant-buyer',
      estimated_profit: lease_option_monthly * 12, // Annual profit
      time_to_close: '1-3 years',
      capital_required: contract_price * 0.05, // 5% down payment
      risk_level: 'Medium',
      pros: ['Lower capital requirement', 'Monthly cash flow', 'Multiple exit options'],
      cons: ['Longer commitment', 'Property management responsibility']
    });

    return {
      available_strategies: strategies,
      recommended_strategy: this.recommendBestStrategy(strategies, deal_metrics),
      strategy_comparison: this.compareStrategies(strategies)
    };
  }

  analyzeMarketTiming(market_analysis, purchase_details) {
    const timing_factors = [];
    let timing_score = 5; // Neutral starting point (1-10 scale)

    // Market trend analysis
    if (market_analysis.market_trend === 'appreciating') {
      timing_factors.push({
        factor: 'Market Appreciation',
        impact: 'Positive',
        description: 'Rising market supports higher buyer demand and ARV values'
      });
      timing_score += 2;
    } else if (market_analysis.market_trend === 'declining') {
      timing_factors.push({
        factor: 'Market Decline',
        impact: 'Negative',
        description: 'Declining market may reduce buyer demand and ARV reliability'
      });
      timing_score -= 2;
    }

    // Seasonal factors
    const current_month = new Date().getMonth(); // 0-11
    if (current_month >= 2 && current_month <= 6) { // March-July
      timing_factors.push({
        factor: 'Spring/Summer Season',
        impact: 'Positive',
        description: 'Peak real estate season increases buyer activity'
      });
      timing_score += 1;
    } else if (current_month >= 10 || current_month <= 1) { // Nov-Feb
      timing_factors.push({
        factor: 'Winter Season',
        impact: 'Negative',
        description: 'Slower real estate season may reduce buyer pool'
      });
      timing_score -= 1;
    }

    // Days on market indicator
    const dom = purchase_details.days_on_market || 0;
    if (dom > 90) {
      timing_factors.push({
        factor: 'Long Market Time',
        impact: 'Negative',
        description: 'Property has been on market long time, may indicate pricing or condition issues'
      });
      timing_score -= 1;
    } else if (dom < 30) {
      timing_factors.push({
        factor: 'Fresh Listing',
        impact: 'Positive',
        description: 'Recently listed property may attract more buyer interest'
      });
      timing_score += 1;
    }

    // Neighborhood grade impact
    const grade = market_analysis.neighborhood_grade;
    if (grade === 'A' || grade === 'B') {
      timing_factors.push({
        factor: 'Quality Neighborhood',
        impact: 'Positive',
        description: 'A/B grade neighborhoods have consistent buyer demand'
      });
      timing_score += 1;
    } else if (grade === 'D') {
      timing_factors.push({
        factor: 'Lower Grade Area',
        impact: 'Negative',
        description: 'D grade areas may have limited buyer pool'
      });
      timing_score -= 1;
    }

    const timing_rating = timing_score >= 8 ? 'Excellent' :
                         timing_score >= 6 ? 'Good' :
                         timing_score >= 4 ? 'Fair' : 'Poor';

    return {
      timing_factors,
      timing_score,
      timing_rating,
      recommendations: this.getTimingRecommendations(timing_score, timing_factors)
    };
  }

  // Helper methods
  gradeDeal(wholesale_spread, buyer_roi, arv_ratio) {
    let score = 0;
    
    if (wholesale_spread >= 20000) score += 3;
    else if (wholesale_spread >= 10000) score += 2;
    else if (wholesale_spread >= 5000) score += 1;
    
    if (buyer_roi >= 25) score += 3;
    else if (buyer_roi >= 20) score += 2;
    else if (buyer_roi >= 15) score += 1;
    
    if (arv_ratio >= 1.4) score += 2;
    else if (arv_ratio >= 1.3) score += 1;
    
    if (score >= 7) return 'A';
    if (score >= 5) return 'B';
    if (score >= 3) return 'C';
    return 'D';
  }

  estimateDaysToAssign(buyer_list_size, deal_grade) {
    let base_days = 30;
    
    // Adjust for buyer list size
    if (buyer_list_size >= 100) base_days -= 10;
    else if (buyer_list_size >= 50) base_days -= 5;
    else if (buyer_list_size < 25) base_days += 10;
    
    // Adjust for deal quality
    if (deal_grade === 'A') base_days -= 10;
    else if (deal_grade === 'B') base_days -= 5;
    else if (deal_grade === 'D') base_days += 15;
    
    return Math.max(7, Math.min(60, base_days)); // Cap between 7-60 days
  }

  rateProfitability(net_profit, profit_margin, annualized_roi) {
    if (net_profit >= 15000 && profit_margin >= 70 && annualized_roi >= 200) return 'Excellent';
    if (net_profit >= 10000 && profit_margin >= 60 && annualized_roi >= 150) return 'Very Good';
    if (net_profit >= 5000 && profit_margin >= 50 && annualized_roi >= 100) return 'Good';
    if (net_profit >= 2500 && profit_margin >= 25 && annualized_roi >= 50) return 'Fair';
    return 'Poor';
  }

  rateBuyerDeal(profit_margin, roi, meets_70_rule) {
    let score = 0;
    
    if (profit_margin >= 20) score += 3;
    else if (profit_margin >= 15) score += 2;
    else if (profit_margin >= 10) score += 1;
    
    if (roi >= 25) score += 3;
    else if (roi >= 20) score += 2;
    else if (roi >= 15) score += 1;
    
    if (meets_70_rule) score += 2;
    
    if (score >= 7) return 'Excellent';
    if (score >= 5) return 'Good';
    if (score >= 3) return 'Fair';
    return 'Poor';
  }

  getRiskMitigationStrategies(risks) {
    const strategies = [];
    
    risks.forEach(risk => {
      switch (risk.category) {
        case 'Market Risk':
          strategies.push('Monitor market trends closely and adjust ARV estimates');
          strategies.push('Build larger buyer list for faster assignment');
          break;
        case 'Property Risk':
          strategies.push('Get multiple repair estimates from qualified contractors');
          strategies.push('Include inspection contingency in contract');
          break;
        case 'Deal Risk':
          strategies.push('Negotiate higher assignment fee or lower contract price');
          strategies.push('Have backup exit strategies ready');
          break;
        case 'Seller Risk':
          strategies.push('Maintain regular communication with seller');
          strategies.push('Understand seller timeline and motivations');
          break;
        case 'Time Risk':
          strategies.push('Pre-market the deal before closing');
          strategies.push('Have buyers pre-qualified and ready');
          break;
        case 'Repair Risk':
          strategies.push('Get detailed scope of work from contractors');
          strategies.push('Include repair cost buffer in buyer analysis');
          break;
      }
    });

    return [...new Set(strategies)]; // Remove duplicates
  }

  recommendBestStrategy(strategies, deal_metrics) {
    // Score each strategy
    const scored_strategies = strategies.map(strategy => {
      let score = 0;
      
      // Higher profit is better
      if (strategy.estimated_profit >= 15000) score += 3;
      else if (strategy.estimated_profit >= 10000) score += 2;
      else if (strategy.estimated_profit >= 5000) score += 1;
      
      // Lower risk is better
      if (strategy.risk_level === 'Medium') score += 2;
      else if (strategy.risk_level === 'Low') score += 3;
      
      // Faster timeline is better
      if (strategy.time_to_close.includes('15-30')) score += 3;
      else if (strategy.time_to_close.includes('30-45')) score += 2;
      else if (strategy.time_to_close.includes('4-6 months')) score += 1;
      
      // Lower capital requirement is better
      if (strategy.capital_required <= 5000) score += 3;
      else if (strategy.capital_required <= 25000) score += 2;
      else if (strategy.capital_required <= 100000) score += 1;
      
      return { ...strategy, score };
    });

    const best_strategy = scored_strategies.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return {
      recommended: best_strategy.strategy,
      reasoning: `Best balance of profit (${best_strategy.estimated_profit}), risk (${best_strategy.risk_level}), and timeline (${best_strategy.time_to_close})`
    };
  }

  compareStrategies(strategies) {
    return {
      highest_profit: strategies.reduce((max, current) => 
        current.estimated_profit > max.estimated_profit ? current : max
      ),
      lowest_risk: strategies.filter(s => s.risk_level === 'Low')[0] || 
                   strategies.filter(s => s.risk_level === 'Medium')[0],
      fastest_close: strategies.reduce((fastest, current) => {
        const currentDays = this.parseTimeToDays(current.time_to_close);
        const fastestDays = this.parseTimeToDays(fastest.time_to_close);
        return currentDays < fastestDays ? current : fastest;
      })
    };
  }

  parseTimeToDays(timeString) {
    if (timeString.includes('15-30')) return 22;
    if (timeString.includes('30-45')) return 37;
    if (timeString.includes('4-6 months')) return 150;
    if (timeString.includes('1-3 years')) return 730;
    return 30; // default
  }

  getTimingRecommendations(timing_score, timing_factors) {
    const recommendations = [];
    
    if (timing_score >= 8) {
      recommendations.push('Excellent timing - proceed with confidence');
      recommendations.push('Market conditions favor quick assignment');
    } else if (timing_score >= 6) {
      recommendations.push('Good timing - normal marketing approach');
      recommendations.push('Monitor market conditions for any changes');
    } else if (timing_score >= 4) {
      recommendations.push('Fair timing - be prepared for longer marketing period');
      recommendations.push('Consider adjusting assignment fee for quicker sale');
    } else {
      recommendations.push('Poor timing - consider waiting or alternative strategies');
      recommendations.push('Focus on highest quality buyers only');
    }
    
    // Specific recommendations based on factors
    const negative_factors = timing_factors.filter(f => f.impact === 'Negative');
    if (negative_factors.length > 0) {
      recommendations.push('Address timing challenges with enhanced marketing');
      recommendations.push('Build larger buffer into deal timeline');
    }
    
    return recommendations;
  }

  generateRecommendations(deal_metrics, profitability, risk_analysis, market_analysis) {
    const recommendations = [];

    // Deal quality recommendations
    if (deal_metrics.deal_quality_metrics.deal_grade === 'A' || deal_metrics.deal_quality_metrics.deal_grade === 'B') {
      recommendations.push({
        category: 'Deal Quality',
        priority: 'High',
        recommendation: `Excellent ${deal_metrics.deal_quality_metrics.deal_grade}-grade deal - proceed with confidence`,
        action: 'Move quickly to secure contract and begin buyer marketing'
      });
    } else if (deal_metrics.deal_quality_metrics.deal_grade === 'D') {
      recommendations.push({
        category: 'Deal Quality',
        priority: 'High',
        recommendation: 'D-grade deal has significant challenges',
        action: 'Renegotiate contract price or consider passing on deal'
      });
    }

    // Profitability recommendations
    if (profitability.net_profit < 5000) {
      recommendations.push({
        category: 'Profitability',
        priority: 'High',
        recommendation: 'Low net profit may not justify time and risk',
        action: 'Negotiate higher assignment fee or lower contract price'
      });
    }

    // Risk recommendations
    if (risk_analysis && risk_analysis.overall_risk_level === 'High') {
      recommendations.push({
        category: 'Risk Management',
        priority: 'High',
        recommendation: 'High risk level requires enhanced due diligence',
        action: 'Implement all risk mitigation strategies before proceeding'
      });
    }

    // Market recommendations
    if (market_analysis.market_trend === 'declining') {
      recommendations.push({
        category: 'Market Conditions',
        priority: 'Medium',
        recommendation: 'Declining market requires conservative approach',
        action: 'Reduce ARV estimates by 5-10% and move quickly to assign'
      });
    }

    // Buyer analysis recommendations
    if (deal_metrics.buyer_roi < 15) {
      recommendations.push({
        category: 'Buyer Appeal',
        priority: 'High',
        recommendation: 'Low buyer ROI will limit interested parties',
        action: 'Reduce assignment fee or find alternative exit strategy'
      });
    }

    return recommendations;
  }
}