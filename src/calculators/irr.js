export class IRRCalculator {
  constructor() {
    this.name = 'IRR Calculator';
    this.description = 'Calculate Internal Rate of Return for real estate investments';
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        initial_investment: {
          type: 'number',
          description: 'Total initial investment (down payment + closing costs + rehab)',
          minimum: 0
        },
        holding_period_years: {
          type: 'number',
          description: 'Investment holding period in years',
          minimum: 1,
          maximum: 30,
          default: 5
        },
        annual_cash_flows: {
          type: 'array',
          description: 'Array of annual net cash flows (rental income - expenses)',
          items: {
            type: 'number'
          }
        },
        projected_sale_price: {
          type: 'number',
          description: 'Projected property sale price at end of holding period',
          minimum: 0
        },
        selling_costs_percent: {
          type: 'number',
          description: 'Selling costs as percentage of sale price',
          minimum: 0,
          maximum: 15,
          default: 7
        },
        loan_balance_at_sale: {
          type: 'number',
          description: 'Remaining loan balance when property is sold',
          minimum: 0,
          default: 0
        },
        target_irr: {
          type: 'number',
          description: 'Target IRR for comparison (%)',
          minimum: 0,
          maximum: 100,
          default: 15
        }
      },
      required: ['initial_investment', 'annual_cash_flows', 'projected_sale_price']
    };
  }

  calculate(params) {
    const {
      initial_investment,
      annual_cash_flows,
      projected_sale_price,
      selling_costs_percent = 7,
      loan_balance_at_sale = 0,
      target_irr = 15,
      holding_period_years = annual_cash_flows.length
    } = params;

    // Calculate net proceeds from sale
    const selling_costs = projected_sale_price * (selling_costs_percent / 100);
    const net_sale_proceeds = projected_sale_price - selling_costs - loan_balance_at_sale;

    // Build complete cash flow array
    const all_cash_flows = [-initial_investment];
    
    // Add annual cash flows
    for (let i = 0; i < annual_cash_flows.length; i++) {
      if (i === annual_cash_flows.length - 1) {
        // Last year includes sale proceeds
        all_cash_flows.push(annual_cash_flows[i] + net_sale_proceeds);
      } else {
        all_cash_flows.push(annual_cash_flows[i]);
      }
    }

    // Calculate IRR using Newton's method
    const irr = this.calculateIRR(all_cash_flows);
    const irr_percentage = irr * 100;

    // Calculate NPV at target rate
    const npv_at_target = this.calculateNPV(all_cash_flows, target_irr / 100);

    // Calculate other metrics
    const total_cash_invested = initial_investment;
    const total_cash_received = annual_cash_flows.reduce((sum, cf) => sum + cf, 0) + net_sale_proceeds;
    const total_profit = total_cash_received - total_cash_invested;
    const cash_on_cash_return = (total_profit / total_cash_invested) * 100;
    const average_annual_return = cash_on_cash_return / holding_period_years;

    // Performance analysis
    const performance = this.analyzePerformance(irr_percentage, target_irr);

    // Sensitivity analysis
    const sensitivity = this.performSensitivityAnalysis(
      params,
      all_cash_flows,
      irr_percentage
    );

    return {
      irr_analysis: {
        irr_percentage: parseFloat(irr_percentage.toFixed(2)),
        irr_decimal: parseFloat(irr.toFixed(4)),
        meets_target: irr_percentage >= target_irr,
        target_irr: target_irr,
        difference_from_target: parseFloat((irr_percentage - target_irr).toFixed(2))
      },
      cash_flow_summary: {
        initial_investment: initial_investment,
        total_cash_received: total_cash_received,
        total_profit: total_profit,
        cash_on_cash_return: parseFloat(cash_on_cash_return.toFixed(2)),
        average_annual_return: parseFloat(average_annual_return.toFixed(2))
      },
      cash_flow_schedule: this.buildCashFlowSchedule(
        initial_investment,
        annual_cash_flows,
        net_sale_proceeds
      ),
      npv_analysis: {
        npv_at_target_rate: parseFloat(npv_at_target.toFixed(2)),
        npv_interpretation: npv_at_target > 0 
          ? "Positive NPV - Investment exceeds target return"
          : "Negative NPV - Investment below target return",
        break_even_rate: this.findBreakEvenRate(all_cash_flows)
      },
      sale_analysis: {
        projected_sale_price: projected_sale_price,
        selling_costs: parseFloat(selling_costs.toFixed(2)),
        loan_payoff: loan_balance_at_sale,
        net_proceeds: parseFloat(net_sale_proceeds.toFixed(2))
      },
      performance_rating: performance,
      sensitivity_analysis: sensitivity,
      recommendations: this.generateRecommendations(
        irr_percentage,
        target_irr,
        cash_on_cash_return,
        sensitivity
      )
    };
  }

  calculateIRR(cashFlows, guess = 0.1) {
    const maxIterations = 100;
    const tolerance = 0.00001;
    let rate = guess;

    for (let i = 0; i < maxIterations; i++) {
      const npv = this.calculateNPV(cashFlows, rate);
      const dnpv = this.calculateDerivativeNPV(cashFlows, rate);
      
      const newRate = rate - npv / dnpv;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate;
      }
      
      rate = newRate;
    }

    // If no convergence, try different initial guesses
    const guesses = [0.0, 0.05, 0.15, 0.25, 0.5, -0.1];
    for (const newGuess of guesses) {
      const result = this.calculateIRRWithGuess(cashFlows, newGuess);
      if (result !== null) return result;
    }

    return 0; // Default if convergence fails
  }

  calculateIRRWithGuess(cashFlows, guess) {
    const maxIterations = 50;
    const tolerance = 0.00001;
    let rate = guess;

    for (let i = 0; i < maxIterations; i++) {
      const npv = this.calculateNPV(cashFlows, rate);
      const dnpv = this.calculateDerivativeNPV(cashFlows, rate);
      
      if (Math.abs(dnpv) < tolerance) return null;
      
      const newRate = rate - npv / dnpv;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate;
      }
      
      rate = newRate;
    }

    return null;
  }

  calculateNPV(cashFlows, rate) {
    return cashFlows.reduce((npv, cf, i) => {
      return npv + cf / Math.pow(1 + rate, i);
    }, 0);
  }

  calculateDerivativeNPV(cashFlows, rate) {
    return cashFlows.reduce((dnpv, cf, i) => {
      if (i === 0) return dnpv;
      return dnpv - (i * cf) / Math.pow(1 + rate, i + 1);
    }, 0);
  }

  buildCashFlowSchedule(initialInvestment, annualCashFlows, netSaleProceeds) {
    const schedule = [
      {
        year: 0,
        description: "Initial Investment",
        cash_flow: -initialInvestment,
        cumulative_cash_flow: -initialInvestment
      }
    ];

    let cumulative = -initialInvestment;

    for (let i = 0; i < annualCashFlows.length; i++) {
      const isLastYear = i === annualCashFlows.length - 1;
      const cashFlow = isLastYear 
        ? annualCashFlows[i] + netSaleProceeds 
        : annualCashFlows[i];
      
      cumulative += cashFlow;

      schedule.push({
        year: i + 1,
        description: isLastYear 
          ? `Year ${i + 1} Operations + Sale Proceeds`
          : `Year ${i + 1} Net Cash Flow`,
        cash_flow: parseFloat(cashFlow.toFixed(2)),
        cumulative_cash_flow: parseFloat(cumulative.toFixed(2))
      });
    }

    return schedule;
  }

  analyzePerformance(irr, targetIrr) {
    if (irr >= targetIrr + 10) {
      return {
        rating: "Exceptional",
        description: "Significantly exceeds target return",
        risk_adjusted_view: "Even with conservative assumptions, likely a strong investment"
      };
    } else if (irr >= targetIrr + 5) {
      return {
        rating: "Excellent",
        description: "Comfortably exceeds target return",
        risk_adjusted_view: "Good margin of safety above target"
      };
    } else if (irr >= targetIrr) {
      return {
        rating: "Good",
        description: "Meets target return",
        risk_adjusted_view: "Achieves desired return, but limited cushion for surprises"
      };
    } else if (irr >= targetIrr - 3) {
      return {
        rating: "Marginal",
        description: "Slightly below target return",
        risk_adjusted_view: "Close to target, but may not justify the risk"
      };
    } else {
      return {
        rating: "Poor",
        description: "Well below target return",
        risk_adjusted_view: "Consider alternative investments or renegotiating terms"
      };
    }
  }

  performSensitivityAnalysis(originalParams, originalCashFlows, baseIRR) {
    const scenarios = [];

    // 10% reduction in annual cash flows
    const reducedCashFlows = originalParams.annual_cash_flows.map(cf => cf * 0.9);
    const reducedCashFlowsComplete = [-originalParams.initial_investment];
    const sellingCostsPct = originalParams.selling_costs_percent || 7;
    const saleSellingCosts = originalParams.projected_sale_price * (sellingCostsPct / 100);
    const saleNetProceeds = originalParams.projected_sale_price - saleSellingCosts - (originalParams.loan_balance_at_sale || 0);
    
    for (let i = 0; i < reducedCashFlows.length; i++) {
      if (i === reducedCashFlows.length - 1) {
        reducedCashFlowsComplete.push(reducedCashFlows[i] + saleNetProceeds);
      } else {
        reducedCashFlowsComplete.push(reducedCashFlows[i]);
      }
    }
    const cashFlowReducedIRR = this.calculateIRR(reducedCashFlowsComplete) * 100;

    scenarios.push({
      scenario: "10% Lower Cash Flows",
      irr: parseFloat(cashFlowReducedIRR.toFixed(2)),
      impact: parseFloat((cashFlowReducedIRR - baseIRR).toFixed(2))
    });

    // 10% lower sale price
    const lowerSalePrice = originalParams.projected_sale_price * 0.9;
    const lowerSaleCashFlows = [...originalCashFlows];
    const sellingCosts = lowerSalePrice * (originalParams.selling_costs_percent / 100);
    const netProceeds = lowerSalePrice - sellingCosts - (originalParams.loan_balance_at_sale || 0);
    lowerSaleCashFlows[lowerSaleCashFlows.length - 1] = 
      originalParams.annual_cash_flows[originalParams.annual_cash_flows.length - 1] + 
      netProceeds;
    const salePriceReducedIRR = this.calculateIRR(lowerSaleCashFlows) * 100;

    scenarios.push({
      scenario: "10% Lower Sale Price",
      irr: parseFloat(salePriceReducedIRR.toFixed(2)),
      impact: parseFloat((salePriceReducedIRR - baseIRR).toFixed(2))
    });

    // 20% higher initial investment
    const higherInvestmentCashFlows = [...originalCashFlows];
    higherInvestmentCashFlows[0] = -originalParams.initial_investment * 1.2;
    const higherInvestmentIRR = this.calculateIRR(higherInvestmentCashFlows) * 100;

    scenarios.push({
      scenario: "20% Higher Initial Investment",
      irr: parseFloat(higherInvestmentIRR.toFixed(2)),
      impact: parseFloat((higherInvestmentIRR - baseIRR).toFixed(2))
    });

    return {
      base_case_irr: parseFloat(baseIRR.toFixed(2)),
      scenarios: scenarios,
      most_sensitive_factor: this.identifyMostSensitiveFactor(scenarios)
    };
  }

  identifyMostSensitiveFactor(scenarios) {
    let maxImpact = 0;
    let mostSensitive = "";

    scenarios.forEach(scenario => {
      if (Math.abs(scenario.impact) > maxImpact) {
        maxImpact = Math.abs(scenario.impact);
        mostSensitive = scenario.scenario;
      }
    });

    return mostSensitive;
  }

  findBreakEvenRate(cashFlows) {
    // Find rate where NPV = 0 (which is IRR by definition)
    const irr = this.calculateIRR(cashFlows);
    return parseFloat((irr * 100).toFixed(2));
  }

  generateRecommendations(irr, targetIrr, cashOnCash, sensitivity) {
    const recommendations = [];

    if (irr >= targetIrr) {
      recommendations.push({
        type: "Positive",
        message: `IRR of ${irr}% exceeds your target of ${targetIrr}%`,
        action: "Consider proceeding with appropriate due diligence"
      });
    } else {
      recommendations.push({
        type: "Caution",
        message: `IRR of ${irr}% is below your target of ${targetIrr}%`,
        action: "Negotiate better terms or consider alternative investments"
      });
    }

    // Sensitivity-based recommendations
    const mostSensitive = sensitivity.most_sensitive_factor;
    if (mostSensitive.includes("Cash Flows")) {
      recommendations.push({
        type: "Risk Management",
        message: "Returns are highly sensitive to rental income",
        action: "Focus on tenant quality and lease terms to ensure stable cash flows"
      });
    } else if (mostSensitive.includes("Sale Price")) {
      recommendations.push({
        type: "Risk Management",
        message: "Returns are highly sensitive to exit value",
        action: "Consider value-add strategies to ensure appreciation"
      });
    }

    // Performance-based recommendations
    if (cashOnCash < 8) {
      recommendations.push({
        type: "Optimization",
        message: "Low cash-on-cash return during holding period",
        action: "Look for ways to increase rents or reduce expenses"
      });
    }

    if (irr > 25) {
      recommendations.push({
        type: "Due Diligence",
        message: "Very high projected returns",
        action: "Double-check all assumptions for accuracy and conservatism"
      });
    }

    return recommendations;
  }
}