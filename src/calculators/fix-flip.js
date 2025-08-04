export class FixFlipCalculator {
  constructor() {
    this.name = 'Fix & Flip Calculator';
    this.description = 'Analyze profitability of fix and flip real estate investments';
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        purchase_price: {
          type: 'number',
          description: 'Property purchase price',
          minimum: 0
        },
        rehab_budget: {
          type: 'number',
          description: 'Total renovation/rehab budget',
          minimum: 0
        },
        after_repair_value: {
          type: 'number',
          description: 'Estimated value after repairs (ARV)',
          minimum: 0
        },
        purchase_closing_costs: {
          type: 'number',
          description: 'Closing costs for purchase',
          minimum: 0,
          default: 0
        },
        holding_period_months: {
          type: 'number',
          description: 'Expected project duration in months',
          minimum: 1,
          maximum: 24,
          default: 6
        },
        financing_type: {
          type: 'string',
          description: 'Type of financing',
          enum: ['cash', 'hard_money', 'conventional', 'private_lender'],
          default: 'hard_money'
        },
        down_payment_percent: {
          type: 'number',
          description: 'Down payment percentage (if financed)',
          minimum: 0,
          maximum: 100,
          default: 20
        },
        interest_rate: {
          type: 'number',
          description: 'Annual interest rate (%)',
          minimum: 0,
          maximum: 30,
          default: 12
        },
        loan_points: {
          type: 'number',
          description: 'Loan origination points',
          minimum: 0,
          maximum: 10,
          default: 2
        },
        monthly_holding_costs: {
          type: 'number',
          description: 'Monthly costs (utilities, insurance, taxes, etc.)',
          minimum: 0,
          default: 0
        },
        selling_costs_percent: {
          type: 'number',
          description: 'Selling costs as % of sale price (agent fees, closing)',
          minimum: 0,
          maximum: 15,
          default: 8
        },
        contingency_percent: {
          type: 'number',
          description: 'Contingency for rehab overruns (%)',
          minimum: 0,
          maximum: 50,
          default: 10
        }
      },
      required: ['purchase_price', 'rehab_budget', 'after_repair_value']
    };
  }

  calculate(params) {
    const {
      purchase_price,
      rehab_budget,
      after_repair_value,
      purchase_closing_costs = 0,
      holding_period_months = 6,
      financing_type = 'hard_money',
      down_payment_percent = 20,
      interest_rate = 12,
      loan_points = 2,
      monthly_holding_costs = 0,
      selling_costs_percent = 8,
      contingency_percent = 10
    } = params;

    // Calculate financing details
    const financingDetails = this.calculateFinancing(
      purchase_price,
      rehab_budget,
      financing_type,
      down_payment_percent,
      interest_rate,
      loan_points,
      holding_period_months
    );

    // Calculate all costs
    const rehab_contingency = rehab_budget * (contingency_percent / 100);
    const total_rehab_budget = rehab_budget + rehab_contingency;
    const total_holding_costs = monthly_holding_costs * holding_period_months;
    const selling_costs = after_repair_value * (selling_costs_percent / 100);

    // Total investment calculation
    const total_cash_needed = 
      financingDetails.cash_to_close +
      (financing_type === 'cash' ? total_rehab_budget : 0) +
      (financing_type !== 'cash' && !financingDetails.rehab_financed ? total_rehab_budget : 0);

    const total_costs = 
      purchase_price +
      purchase_closing_costs +
      total_rehab_budget +
      financingDetails.total_loan_costs +
      total_holding_costs +
      selling_costs;

    // Profit calculations
    const gross_profit = after_repair_value - total_costs;
    const net_profit = gross_profit; // Already accounts for all costs
    const roi = (net_profit / total_cash_needed) * 100;
    const profit_margin = (net_profit / after_repair_value) * 100;

    // Annualized return
    const months_to_years = 12 / holding_period_months;
    const annualized_roi = roi * months_to_years;

    // Maximum allowable offer (MAO) using 70% rule
    const mao_70_rule = (after_repair_value * 0.7) - rehab_budget;
    const actual_purchase_percent = (purchase_price / after_repair_value) * 100;

    // Risk analysis
    const risk_metrics = this.analyzeRisk(
      purchase_price,
      after_repair_value,
      total_rehab_budget,
      net_profit,
      actual_purchase_percent
    );

    // Break-even analysis
    const break_even_sale_price = total_costs;
    const cushion_amount = after_repair_value - break_even_sale_price;
    const cushion_percent = (cushion_amount / after_repair_value) * 100;

    // Timeline analysis
    const timeline = this.createTimeline(
      holding_period_months,
      financingDetails,
      monthly_holding_costs
    );

    return {
      deal_summary: {
        purchase_price: purchase_price,
        total_rehab_budget: parseFloat(total_rehab_budget.toFixed(2)),
        after_repair_value: after_repair_value,
        holding_period_months: holding_period_months
      },
      financing: financingDetails,
      cost_breakdown: {
        purchase_price: purchase_price,
        purchase_closing_costs: purchase_closing_costs,
        rehab_budget: rehab_budget,
        rehab_contingency: parseFloat(rehab_contingency.toFixed(2)),
        total_rehab: parseFloat(total_rehab_budget.toFixed(2)),
        financing_costs: parseFloat(financingDetails.total_loan_costs.toFixed(2)),
        holding_costs: parseFloat(total_holding_costs.toFixed(2)),
        selling_costs: parseFloat(selling_costs.toFixed(2)),
        total_costs: parseFloat(total_costs.toFixed(2))
      },
      profit_analysis: {
        gross_profit: parseFloat(gross_profit.toFixed(2)),
        net_profit: parseFloat(net_profit.toFixed(2)),
        roi_percentage: parseFloat(roi.toFixed(2)),
        annualized_roi: parseFloat(annualized_roi.toFixed(2)),
        profit_margin: parseFloat(profit_margin.toFixed(2)),
        profit_per_month: parseFloat((net_profit / holding_period_months).toFixed(2))
      },
      investment_requirements: {
        total_cash_needed: parseFloat(total_cash_needed.toFixed(2)),
        cash_at_closing: parseFloat(financingDetails.cash_to_close.toFixed(2)),
        cash_for_rehab: parseFloat((total_cash_needed - financingDetails.cash_to_close).toFixed(2))
      },
      mao_analysis: {
        mao_70_rule: parseFloat(mao_70_rule.toFixed(2)),
        actual_purchase_price: purchase_price,
        actual_percent_of_arv: parseFloat(actual_purchase_percent.toFixed(2)),
        difference_from_mao: parseFloat((purchase_price - mao_70_rule).toFixed(2)),
        follows_70_rule: purchase_price <= mao_70_rule
      },
      break_even_analysis: {
        break_even_price: parseFloat(break_even_sale_price.toFixed(2)),
        safety_cushion: parseFloat(cushion_amount.toFixed(2)),
        cushion_percentage: parseFloat(cushion_percent.toFixed(2)),
        can_afford_price_drop: parseFloat(cushion_percent.toFixed(2)) + '%'
      },
      risk_assessment: risk_metrics,
      project_timeline: timeline,
      recommendations: this.generateRecommendations(
        roi,
        profit_margin,
        cushion_percent,
        risk_metrics,
        financingDetails
      )
    };
  }

  calculateFinancing(purchasePrice, rehabBudget, financingType, downPaymentPercent, interestRate, loanPoints, holdingMonths) {
    if (financingType === 'cash') {
      return {
        financing_type: 'Cash Purchase',
        loan_amount: 0,
        down_payment: purchasePrice,
        cash_to_close: purchasePrice,
        monthly_payment: 0,
        total_interest: 0,
        loan_origination_fee: 0,
        total_loan_costs: 0,
        effective_rate: 0,
        rehab_financed: false
      };
    }

    const down_payment = purchasePrice * (downPaymentPercent / 100);
    const base_loan_amount = purchasePrice - down_payment;
    
    // For hard money, often includes rehab in loan
    const rehab_financed = financingType === 'hard_money';
    const loan_amount = rehab_financed ? base_loan_amount + rehabBudget : base_loan_amount;
    
    const monthly_rate = interestRate / 100 / 12;
    const loan_origination_fee = loan_amount * (loanPoints / 100);
    
    // Interest-only payment (common for fix & flip)
    const monthly_payment = loan_amount * monthly_rate;
    const total_interest = monthly_payment * holdingMonths;
    const total_loan_costs = total_interest + loan_origination_fee;
    
    // Effective annual rate including points
    const total_cost_percent = (total_loan_costs / loan_amount) * 100;
    const effective_rate = (total_cost_percent / holdingMonths) * 12;

    return {
      financing_type: this.getFinancingTypeName(financingType),
      loan_amount: parseFloat(loan_amount.toFixed(2)),
      down_payment: parseFloat(down_payment.toFixed(2)),
      cash_to_close: parseFloat((down_payment + loan_origination_fee).toFixed(2)),
      monthly_payment: parseFloat(monthly_payment.toFixed(2)),
      total_interest: parseFloat(total_interest.toFixed(2)),
      loan_origination_fee: parseFloat(loan_origination_fee.toFixed(2)),
      total_loan_costs: parseFloat(total_loan_costs.toFixed(2)),
      effective_rate: parseFloat(effective_rate.toFixed(2)),
      rehab_financed: rehab_financed
    };
  }

  getFinancingTypeName(type) {
    const names = {
      cash: 'Cash Purchase',
      hard_money: 'Hard Money Loan',
      conventional: 'Conventional Loan',
      private_lender: 'Private Lender'
    };
    return names[type] || type;
  }

  analyzeRisk(purchasePrice, arv, rehabBudget, profit, purchasePercent) {
    const riskFactors = [];
    let riskScore = 0;

    // Purchase price vs ARV
    if (purchasePercent > 75) {
      riskFactors.push({
        factor: "High Purchase Price",
        severity: "High",
        description: "Purchase price exceeds 75% of ARV"
      });
      riskScore += 3;
    } else if (purchasePercent > 70) {
      riskFactors.push({
        factor: "Moderate Purchase Price",
        severity: "Medium",
        description: "Purchase price between 70-75% of ARV"
      });
      riskScore += 2;
    }

    // Rehab budget as % of ARV
    const rehabPercent = (rehabBudget / arv) * 100;
    if (rehabPercent > 30) {
      riskFactors.push({
        factor: "Heavy Rehab",
        severity: "High",
        description: "Rehab costs exceed 30% of ARV"
      });
      riskScore += 3;
    } else if (rehabPercent > 20) {
      riskFactors.push({
        factor: "Moderate Rehab",
        severity: "Medium",
        description: "Rehab costs 20-30% of ARV"
      });
      riskScore += 2;
    }

    // Profit margin
    const profitMargin = (profit / arv) * 100;
    if (profitMargin < 10) {
      riskFactors.push({
        factor: "Thin Profit Margin",
        severity: "High",
        description: "Profit margin under 10%"
      });
      riskScore += 3;
    } else if (profitMargin < 15) {
      riskFactors.push({
        factor: "Moderate Profit Margin",
        severity: "Medium",
        description: "Profit margin 10-15%"
      });
      riskScore += 1;
    }

    // Overall risk rating
    let overallRisk;
    if (riskScore >= 6) {
      overallRisk = "High Risk";
    } else if (riskScore >= 3) {
      overallRisk = "Moderate Risk";
    } else {
      overallRisk = "Low Risk";
    }

    return {
      overall_risk: overallRisk,
      risk_score: riskScore,
      risk_factors: riskFactors,
      mitigation_strategies: this.getRiskMitigationStrategies(riskFactors)
    };
  }

  getRiskMitigationStrategies(riskFactors) {
    const strategies = [];
    
    riskFactors.forEach(factor => {
      if (factor.factor.includes("Purchase Price")) {
        strategies.push("Negotiate a lower purchase price or find motivated sellers");
      }
      if (factor.factor.includes("Rehab")) {
        strategies.push("Get multiple contractor bids and build in larger contingencies");
      }
      if (factor.factor.includes("Profit Margin")) {
        strategies.push("Reduce costs, increase ARV through better finishes, or pass on deal");
      }
    });

    return [...new Set(strategies)]; // Remove duplicates
  }

  createTimeline(holdingMonths, financing, monthlyHoldingCosts) {
    const timeline = [];
    
    // Month 0 - Acquisition
    timeline.push({
      month: 0,
      phase: "Acquisition",
      activities: ["Close on property", "Secure permits", "Finalize contractor"],
      cash_outflow: financing.cash_to_close
    });

    // Rehab months
    const rehabMonths = Math.ceil(holdingMonths * 0.7); // Assume 70% for rehab
    for (let i = 1; i <= rehabMonths; i++) {
      timeline.push({
        month: i,
        phase: "Renovation",
        activities: this.getRehabActivities(i, rehabMonths),
        cash_outflow: financing.monthly_payment + monthlyHoldingCosts
      });
    }

    // Marketing/Sale months
    for (let i = rehabMonths + 1; i <= holdingMonths; i++) {
      timeline.push({
        month: i,
        phase: "Marketing & Sale",
        activities: ["List property", "Show to buyers", "Negotiate offers"],
        cash_outflow: financing.monthly_payment + monthlyHoldingCosts
      });
    }

    return timeline;
  }

  getRehabActivities(month, totalRehabMonths) {
    const earlyPhase = month <= totalRehabMonths * 0.3;
    const midPhase = month <= totalRehabMonths * 0.7;
    
    if (earlyPhase) {
      return ["Demolition", "Structural work", "Major systems"];
    } else if (midPhase) {
      return ["Framing", "Electrical/Plumbing", "Insulation/Drywall"];
    } else {
      return ["Finishes", "Fixtures", "Final touches"];
    }
  }

  generateRecommendations(roi, profitMargin, cushionPercent, riskMetrics, financing) {
    const recommendations = [];

    // ROI-based recommendations
    if (roi < 15) {
      recommendations.push({
        type: "Caution",
        category: "Returns",
        message: "ROI below 15% may not justify the risk and effort",
        action: "Consider negotiating purchase price or finding higher ARV properties"
      });
    } else if (roi > 30) {
      recommendations.push({
        type: "Positive",
        category: "Returns",
        message: "Strong ROI above 30%",
        action: "Move quickly but verify all assumptions"
      });
    }

    // Risk-based recommendations
    if (riskMetrics.overall_risk === "High Risk") {
      recommendations.push({
        type: "Warning",
        category: "Risk",
        message: "Multiple high-risk factors identified",
        action: "Consider passing or restructuring the deal"
      });
    }

    // Cushion-based recommendations
    if (cushionPercent < 10) {
      recommendations.push({
        type: "Caution",
        category: "Safety Margin",
        message: "Less than 10% price cushion",
        action: "Build in larger contingencies or reduce purchase price"
      });
    }

    // Financing recommendations
    if (financing.effective_rate > 15) {
      recommendations.push({
        type: "Optimization",
        category: "Financing",
        message: "High financing costs reducing returns",
        action: "Shop for better rates or consider partnering for cash purchase"
      });
    }

    // General best practices
    recommendations.push({
      type: "Best Practice",
      category: "Execution",
      message: "Success depends on execution",
      action: "Have backup contractors and maintain strict project timeline"
    });

    return recommendations;
  }
}