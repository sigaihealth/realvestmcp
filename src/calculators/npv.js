export class NPVCalculator {
  constructor() {
    this.name = 'NPV Calculator';
    this.description = 'Calculate Net Present Value for real estate investment decisions';
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        initial_investment: {
          type: 'number',
          description: 'Total initial investment (negative value)',
          maximum: 0
        },
        cash_flows: {
          type: 'array',
          description: 'Array of future cash flows by period',
          items: {
            type: 'object',
            properties: {
              period: {
                type: 'number',
                description: 'Period number (year, month, etc.)'
              },
              amount: {
                type: 'number',
                description: 'Cash flow amount for this period'
              },
              description: {
                type: 'string',
                description: 'Optional description of cash flow'
              }
            },
            required: ['period', 'amount']
          }
        },
        discount_rate: {
          type: 'number',
          description: 'Required rate of return (discount rate) as percentage',
          minimum: 0,
          maximum: 50,
          default: 10
        },
        terminal_value: {
          type: 'number',
          description: 'Expected sale/terminal value at end of analysis period',
          minimum: 0,
          default: 0
        },
        terminal_period: {
          type: 'number',
          description: 'Period when terminal value is realized',
          minimum: 1
        },
        inflation_rate: {
          type: 'number',
          description: 'Annual inflation rate for real NPV calculation (%)',
          minimum: 0,
          maximum: 20,
          default: 0
        },
        comparison_investment: {
          type: 'number',
          description: 'Alternative investment amount for opportunity cost analysis',
          minimum: 0
        }
      },
      required: ['initial_investment', 'cash_flows', 'discount_rate']
    };
  }

  calculate(params) {
    const {
      initial_investment,
      cash_flows,
      discount_rate,
      terminal_value = 0,
      terminal_period,
      inflation_rate = 0,
      comparison_investment
    } = params;

    // Sort cash flows by period
    const sortedCashFlows = [...cash_flows].sort((a, b) => a.period - b.period);

    // Add terminal value if provided
    if (terminal_value > 0 && terminal_period) {
      const existingTerminalFlow = sortedCashFlows.find(cf => cf.period === terminal_period);
      if (existingTerminalFlow) {
        existingTerminalFlow.amount += terminal_value;
        existingTerminalFlow.description = `${existingTerminalFlow.description || 'Cash flow'} + Terminal value`;
      } else {
        sortedCashFlows.push({
          period: terminal_period,
          amount: terminal_value,
          description: 'Terminal value'
        });
        sortedCashFlows.sort((a, b) => a.period - b.period);
      }
    }

    // Calculate nominal NPV
    const nominalNPV = this.calculateNPV(initial_investment, sortedCashFlows, discount_rate / 100);

    // Calculate real NPV (adjusted for inflation)
    let realNPV = nominalNPV;
    let realDiscountRate = discount_rate;
    if (inflation_rate > 0) {
      realDiscountRate = this.calculateRealDiscountRate(discount_rate / 100, inflation_rate / 100) * 100;
      realNPV = this.calculateNPV(initial_investment, sortedCashFlows, realDiscountRate / 100);
    }

    // Calculate other metrics
    const totalCashInflows = sortedCashFlows.reduce((sum, cf) => sum + Math.max(0, cf.amount), 0);
    const totalCashOutflows = Math.abs(initial_investment) + sortedCashFlows.reduce((sum, cf) => sum + Math.abs(Math.min(0, cf.amount)), 0);
    const netCashFlow = totalCashInflows - totalCashOutflows;
    const profitabilityIndex = totalCashInflows > 0 ? (nominalNPV + Math.abs(initial_investment)) / Math.abs(initial_investment) : 0;

    // Modified IRR calculation
    const irr = this.calculateModifiedIRR(initial_investment, sortedCashFlows, discount_rate / 100);

    // Payback period
    const paybackPeriod = this.calculatePaybackPeriod(initial_investment, sortedCashFlows);
    const discountedPayback = this.calculateDiscountedPaybackPeriod(initial_investment, sortedCashFlows, discount_rate / 100);

    // Sensitivity analysis
    const sensitivity = this.performSensitivityAnalysis(initial_investment, sortedCashFlows, discount_rate / 100);

    // Decision analysis
    const decision = this.analyzeDecision(nominalNPV, irr, profitabilityIndex, paybackPeriod);

    // Opportunity cost analysis
    let opportunityCost = null;
    if (comparison_investment) {
      opportunityCost = this.calculateOpportunityCost(
        initial_investment,
        sortedCashFlows,
        discount_rate / 100,
        comparison_investment
      );
    }

    // Build detailed cash flow schedule
    const cashFlowSchedule = this.buildCashFlowSchedule(
      initial_investment,
      sortedCashFlows,
      discount_rate / 100,
      inflation_rate / 100
    );

    return {
      npv_analysis: {
        nominal_npv: parseFloat(nominalNPV.toFixed(2)),
        real_npv: inflation_rate > 0 ? parseFloat(realNPV.toFixed(2)) : null,
        npv_interpretation: nominalNPV > 0 
          ? "Positive NPV - Investment adds value"
          : "Negative NPV - Investment destroys value",
        discount_rate_used: discount_rate,
        real_discount_rate: inflation_rate > 0 ? parseFloat(realDiscountRate.toFixed(2)) : null
      },
      investment_metrics: {
        initial_investment: initial_investment,
        total_cash_inflows: parseFloat(totalCashInflows.toFixed(2)),
        total_cash_outflows: parseFloat(totalCashOutflows.toFixed(2)),
        net_cash_flow: parseFloat(netCashFlow.toFixed(2)),
        profitability_index: parseFloat(profitabilityIndex.toFixed(3)),
        modified_irr: parseFloat((irr * 100).toFixed(2))
      },
      payback_analysis: {
        simple_payback_period: paybackPeriod,
        discounted_payback_period: discountedPayback,
        payback_achieved: paybackPeriod !== null
      },
      decision_criteria: decision,
      sensitivity_analysis: sensitivity,
      opportunity_cost: opportunityCost,
      cash_flow_schedule: cashFlowSchedule,
      recommendations: this.generateRecommendations(
        nominalNPV,
        irr,
        profitabilityIndex,
        paybackPeriod,
        sensitivity
      )
    };
  }

  calculateNPV(initialInvestment, cashFlows, discountRate) {
    let npv = initialInvestment;
    
    cashFlows.forEach(cf => {
      const presentValue = cf.amount / Math.pow(1 + discountRate, cf.period);
      npv += presentValue;
    });

    return npv;
  }

  calculateRealDiscountRate(nominalRate, inflationRate) {
    return ((1 + nominalRate) / (1 + inflationRate)) - 1;
  }

  calculateModifiedIRR(initialInvestment, cashFlows, discountRate) {
    // Build complete cash flow array
    const allCashFlows = [initialInvestment];
    let maxPeriod = Math.max(...cashFlows.map(cf => cf.period));
    
    for (let period = 1; period <= maxPeriod; period++) {
      const periodFlow = cashFlows.find(cf => cf.period === period);
      allCashFlows.push(periodFlow ? periodFlow.amount : 0);
    }

    // Use Newton's method to find IRR
    let rate = 0.1; // Initial guess
    const maxIterations = 100;
    const tolerance = 0.00001;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;

      for (let j = 0; j < allCashFlows.length; j++) {
        npv += allCashFlows[j] / Math.pow(1 + rate, j);
        if (j > 0) {
          dnpv -= j * allCashFlows[j] / Math.pow(1 + rate, j + 1);
        }
      }

      const newRate = rate - npv / dnpv;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate;
      }
      
      rate = newRate;
    }

    return rate;
  }

  calculatePaybackPeriod(initialInvestment, cashFlows) {
    let cumulativeCashFlow = initialInvestment;
    
    for (const cf of cashFlows) {
      cumulativeCashFlow += cf.amount;
      if (cumulativeCashFlow >= 0) {
        // Interpolate for fractional period
        const previousCumulative = cumulativeCashFlow - cf.amount;
        const fraction = -previousCumulative / cf.amount;
        return cf.period - 1 + fraction;
      }
    }

    return null; // Payback not achieved
  }

  calculateDiscountedPaybackPeriod(initialInvestment, cashFlows, discountRate) {
    let cumulativePV = initialInvestment;
    
    for (const cf of cashFlows) {
      const presentValue = cf.amount / Math.pow(1 + discountRate, cf.period);
      cumulativePV += presentValue;
      
      if (cumulativePV >= 0) {
        // Interpolate for fractional period
        const previousCumulative = cumulativePV - presentValue;
        const fraction = -previousCumulative / presentValue;
        return cf.period - 1 + fraction;
      }
    }

    return null; // Discounted payback not achieved
  }

  performSensitivityAnalysis(initialInvestment, cashFlows, baseDiscountRate) {
    const scenarios = [];
    
    // Discount rate sensitivity
    const discountRates = [
      { rate: baseDiscountRate * 0.5, label: '50% of base rate' },
      { rate: baseDiscountRate * 0.75, label: '75% of base rate' },
      { rate: baseDiscountRate, label: 'Base rate' },
      { rate: baseDiscountRate * 1.25, label: '125% of base rate' },
      { rate: baseDiscountRate * 1.5, label: '150% of base rate' }
    ];

    discountRates.forEach(scenario => {
      const npv = this.calculateNPV(initialInvestment, cashFlows, scenario.rate);
      scenarios.push({
        variable: 'Discount Rate',
        scenario: scenario.label,
        rate: parseFloat((scenario.rate * 100).toFixed(2)),
        npv: parseFloat(npv.toFixed(2)),
        impact: parseFloat((npv - this.calculateNPV(initialInvestment, cashFlows, baseDiscountRate)).toFixed(2))
      });
    });

    // Cash flow sensitivity
    const cashFlowMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2];
    cashFlowMultipliers.forEach(multiplier => {
      const adjustedCashFlows = cashFlows.map(cf => ({
        ...cf,
        amount: cf.amount * multiplier
      }));
      const npv = this.calculateNPV(initialInvestment, adjustedCashFlows, baseDiscountRate);
      
      scenarios.push({
        variable: 'Cash Flows',
        scenario: `${(multiplier * 100).toFixed(0)}% of projected`,
        multiplier: multiplier,
        npv: parseFloat(npv.toFixed(2)),
        impact: parseFloat((npv - this.calculateNPV(initialInvestment, cashFlows, baseDiscountRate)).toFixed(2))
      });
    });

    // Find break-even discount rate
    const breakEvenRate = this.findBreakEvenDiscountRate(initialInvestment, cashFlows);

    return {
      scenarios: scenarios,
      break_even_discount_rate: parseFloat((breakEvenRate * 100).toFixed(2)),
      most_sensitive_to: this.identifyMostSensitiveVariable(scenarios)
    };
  }

  findBreakEvenDiscountRate(initialInvestment, cashFlows) {
    let low = 0;
    let high = 2; // 200%
    const tolerance = 0.0001;
    
    while (high - low > tolerance) {
      const mid = (low + high) / 2;
      const npv = this.calculateNPV(initialInvestment, cashFlows, mid);
      
      if (Math.abs(npv) < 0.01) {
        return mid;
      } else if (npv > 0) {
        low = mid;
      } else {
        high = mid;
      }
    }
    
    return (low + high) / 2;
  }

  identifyMostSensitiveVariable(scenarios) {
    let maxImpactRange = 0;
    let mostSensitive = '';

    const variables = ['Discount Rate', 'Cash Flows'];
    
    variables.forEach(variable => {
      const variableScenarios = scenarios.filter(s => s.variable === variable);
      const npvs = variableScenarios.map(s => s.npv);
      const range = Math.max(...npvs) - Math.min(...npvs);
      
      if (range > maxImpactRange) {
        maxImpactRange = range;
        mostSensitive = variable;
      }
    });

    return mostSensitive;
  }

  analyzeDecision(npv, irr, profitabilityIndex, paybackPeriod) {
    const criteria = [];
    let acceptCount = 0;
    let rejectCount = 0;

    // NPV criterion
    if (npv > 0) {
      criteria.push({
        criterion: 'NPV',
        value: `$${npv.toLocaleString()}`,
        decision: 'Accept',
        reason: 'Positive NPV adds value'
      });
      acceptCount++;
    } else {
      criteria.push({
        criterion: 'NPV',
        value: `$${npv.toLocaleString()}`,
        decision: 'Reject',
        reason: 'Negative NPV destroys value'
      });
      rejectCount++;
    }

    // IRR criterion (assuming 10% hurdle rate if not specified)
    const irrPercent = irr * 100;
    if (irrPercent > 10) {
      criteria.push({
        criterion: 'IRR',
        value: `${irrPercent.toFixed(2)}%`,
        decision: 'Accept',
        reason: 'IRR exceeds typical hurdle rate'
      });
      acceptCount++;
    } else {
      criteria.push({
        criterion: 'IRR',
        value: `${irrPercent.toFixed(2)}%`,
        decision: 'Reject',
        reason: 'IRR below typical hurdle rate'
      });
      rejectCount++;
    }

    // Profitability Index criterion
    if (profitabilityIndex > 1) {
      criteria.push({
        criterion: 'Profitability Index',
        value: profitabilityIndex.toFixed(3),
        decision: 'Accept',
        reason: 'PI > 1 indicates value creation'
      });
      acceptCount++;
    } else {
      criteria.push({
        criterion: 'Profitability Index',
        value: profitabilityIndex.toFixed(3),
        decision: 'Reject',
        reason: 'PI < 1 indicates value destruction'
      });
      rejectCount++;
    }

    // Payback period criterion (assuming 5-year maximum acceptable)
    if (paybackPeriod && paybackPeriod <= 5) {
      criteria.push({
        criterion: 'Payback Period',
        value: `${paybackPeriod.toFixed(1)} periods`,
        decision: 'Accept',
        reason: 'Payback within acceptable timeframe'
      });
      acceptCount++;
    } else if (paybackPeriod) {
      criteria.push({
        criterion: 'Payback Period',
        value: `${paybackPeriod.toFixed(1)} periods`,
        decision: 'Caution',
        reason: 'Long payback period increases risk'
      });
    } else {
      criteria.push({
        criterion: 'Payback Period',
        value: 'Not achieved',
        decision: 'Reject',
        reason: 'Investment never pays back'
      });
      rejectCount++;
    }

    const overallDecision = acceptCount > rejectCount ? 'Accept' : 'Reject';
    const confidence = Math.abs(acceptCount - rejectCount) / criteria.length;

    return {
      criteria: criteria,
      overall_decision: overallDecision,
      confidence_level: confidence > 0.5 ? 'High' : 'Low',
      accept_count: acceptCount,
      reject_count: rejectCount
    };
  }

  calculateOpportunityCost(initialInvestment, cashFlows, discountRate, alternativeInvestment) {
    // Calculate NPV of current investment
    const currentNPV = this.calculateNPV(initialInvestment, cashFlows, discountRate);
    
    // Calculate future value of alternative investment
    const maxPeriod = Math.max(...cashFlows.map(cf => cf.period));
    const alternativeFV = alternativeInvestment * Math.pow(1 + discountRate, maxPeriod);
    const alternativeNPV = alternativeFV / Math.pow(1 + discountRate, maxPeriod) - alternativeInvestment;

    return {
      current_investment_npv: parseFloat(currentNPV.toFixed(2)),
      alternative_investment_npv: parseFloat(alternativeNPV.toFixed(2)),
      opportunity_cost: parseFloat((alternativeNPV - currentNPV).toFixed(2)),
      better_option: currentNPV > alternativeNPV ? 'Current Investment' : 'Alternative Investment'
    };
  }

  buildCashFlowSchedule(initialInvestment, cashFlows, discountRate, inflationRate) {
    const schedule = [{
      period: 0,
      description: 'Initial Investment',
      cash_flow: initialInvestment,
      present_value: initialInvestment,
      cumulative_pv: initialInvestment,
      discount_factor: 1.000
    }];

    let cumulativePV = initialInvestment;
    
    cashFlows.forEach(cf => {
      const discountFactor = 1 / Math.pow(1 + discountRate, cf.period);
      const presentValue = cf.amount * discountFactor;
      cumulativePV += presentValue;

      schedule.push({
        period: cf.period,
        description: cf.description || `Period ${cf.period} cash flow`,
        cash_flow: parseFloat(cf.amount.toFixed(2)),
        present_value: parseFloat(presentValue.toFixed(2)),
        cumulative_pv: parseFloat(cumulativePV.toFixed(2)),
        discount_factor: parseFloat(discountFactor.toFixed(4))
      });
    });

    return schedule;
  }

  generateRecommendations(npv, irr, profitabilityIndex, paybackPeriod, sensitivity) {
    const recommendations = [];

    // NPV-based recommendations
    if (npv > 0) {
      recommendations.push({
        type: 'Positive',
        category: 'Value Creation',
        message: `Project creates $${Math.abs(npv).toLocaleString()} in value`,
        action: 'Consider proceeding with investment'
      });
    } else {
      recommendations.push({
        type: 'Warning',
        category: 'Value Destruction',
        message: `Project destroys $${Math.abs(npv).toLocaleString()} in value`,
        action: 'Reconsider or restructure the investment'
      });
    }

    // IRR recommendations
    const irrPercent = irr * 100;
    if (irrPercent > 20) {
      recommendations.push({
        type: 'Positive',
        category: 'Returns',
        message: `Strong ${irrPercent.toFixed(1)}% return exceeds most alternatives`,
        action: 'Verify assumptions as returns seem very attractive'
      });
    } else if (irrPercent < 8) {
      recommendations.push({
        type: 'Caution',
        category: 'Returns',
        message: `${irrPercent.toFixed(1)}% return may not justify the risk`,
        action: 'Compare with lower-risk alternatives like bonds'
      });
    }

    // Sensitivity recommendations
    if (sensitivity.most_sensitive_to === 'Discount Rate') {
      recommendations.push({
        type: 'Risk Alert',
        category: 'Sensitivity',
        message: 'Highly sensitive to cost of capital changes',
        action: 'Lock in financing rates if possible'
      });
    } else if (sensitivity.most_sensitive_to === 'Cash Flows') {
      recommendations.push({
        type: 'Risk Alert',
        category: 'Sensitivity',
        message: 'Success depends heavily on achieving projected cash flows',
        action: 'Build in conservative assumptions and contingencies'
      });
    }

    // Payback recommendations
    if (!paybackPeriod) {
      recommendations.push({
        type: 'Warning',
        category: 'Liquidity',
        message: 'Investment never fully recovers initial capital',
        action: 'Only proceed if strategic value justifies the loss'
      });
    } else if (paybackPeriod > 7) {
      recommendations.push({
        type: 'Caution',
        category: 'Liquidity',
        message: `Long ${paybackPeriod.toFixed(1)}-period payback increases risk`,
        action: 'Ensure you have adequate liquidity for the duration'
      });
    }

    // Break-even analysis
    if (sensitivity.break_even_discount_rate < 15) {
      recommendations.push({
        type: 'Caution',
        category: 'Risk Margin',
        message: `Break-even at ${sensitivity.break_even_discount_rate}% leaves little margin for error`,
        action: 'Consider requiring higher returns for safety margin'
      });
    }

    return recommendations;
  }
}