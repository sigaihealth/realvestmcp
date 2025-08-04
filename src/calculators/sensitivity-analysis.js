export class SensitivityAnalysisCalculator {
  constructor() {
    this.name = 'Sensitivity Analysis Calculator';
    this.description = 'Perform multi-variable sensitivity analysis on real estate investments';
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        base_scenario: {
          type: 'object',
          description: 'Base investment scenario',
          properties: {
            purchase_price: {
              type: 'number',
              description: 'Property purchase price',
              minimum: 0
            },
            down_payment_percent: {
              type: 'number',
              description: 'Down payment percentage',
              minimum: 0,
              maximum: 100,
              default: 20
            },
            annual_rental_income: {
              type: 'number',
              description: 'Annual gross rental income',
              minimum: 0
            },
            annual_expenses: {
              type: 'number',
              description: 'Annual operating expenses',
              minimum: 0
            },
            vacancy_rate: {
              type: 'number',
              description: 'Expected vacancy rate (%)',
              minimum: 0,
              maximum: 50,
              default: 5
            },
            interest_rate: {
              type: 'number',
              description: 'Mortgage interest rate (%)',
              minimum: 0,
              maximum: 20,
              default: 7
            },
            loan_term_years: {
              type: 'number',
              description: 'Loan term in years',
              minimum: 1,
              maximum: 40,
              default: 30
            },
            appreciation_rate: {
              type: 'number',
              description: 'Annual appreciation rate (%)',
              minimum: -10,
              maximum: 20,
              default: 3
            },
            holding_period_years: {
              type: 'number',
              description: 'Investment holding period in years',
              minimum: 1,
              maximum: 30,
              default: 5
            }
          },
          required: ['purchase_price', 'annual_rental_income', 'annual_expenses']
        },
        sensitivity_variables: {
          type: 'array',
          description: 'Variables to analyze',
          items: {
            type: 'object',
            properties: {
              variable: {
                type: 'string',
                description: 'Variable name to analyze',
                enum: ['purchase_price', 'rental_income', 'expenses', 'vacancy_rate', 'interest_rate', 'appreciation_rate']
              },
              variations: {
                type: 'array',
                description: 'Percentage variations from base (-20, -10, 0, 10, 20)',
                items: {
                  type: 'number'
                },
                default: [-20, -10, 0, 10, 20]
              }
            },
            required: ['variable']
          }
        },
        analysis_metrics: {
          type: 'array',
          description: 'Metrics to calculate',
          items: {
            type: 'string',
            enum: ['irr', 'npv', 'cash_on_cash', 'total_return', 'monthly_cash_flow']
          },
          default: ['irr', 'cash_on_cash', 'total_return']
        },
        discount_rate: {
          type: 'number',
          description: 'Discount rate for NPV calculation (%)',
          minimum: 0,
          maximum: 30,
          default: 10
        }
      },
      required: ['base_scenario']
    };
  }

  calculate(params) {
    const {
      base_scenario,
      sensitivity_variables = [
        { variable: 'purchase_price', variations: [-20, -10, 0, 10, 20] },
        { variable: 'rental_income', variations: [-20, -10, 0, 10, 20] },
        { variable: 'interest_rate', variations: [-20, -10, 0, 10, 20] }
      ],
      analysis_metrics = ['irr', 'cash_on_cash', 'total_return'],
      discount_rate = 10
    } = params;

    // Calculate base case metrics
    const baseMetrics = this.calculateScenarioMetrics(base_scenario, discount_rate / 100);

    // Perform sensitivity analysis
    const sensitivityResults = [];
    
    sensitivity_variables.forEach(({ variable, variations = [-20, -10, 0, 10, 20] }) => {
      const variableResults = {
        variable: this.formatVariableName(variable),
        base_value: this.getBaseValue(base_scenario, variable),
        scenarios: []
      };

      variations.forEach(variation => {
        const scenario = this.createScenario(base_scenario, variable, variation);
        const metrics = this.calculateScenarioMetrics(scenario, discount_rate / 100);
        
        variableResults.scenarios.push({
          variation_percent: variation,
          value: this.getVariableValue(scenario, variable),
          metrics: this.formatMetrics(metrics, analysis_metrics),
          impact: this.calculateImpact(baseMetrics, metrics, analysis_metrics)
        });
      });

      // Calculate sensitivity metrics
      variableResults.sensitivity_metrics = this.calculateSensitivityMetrics(variableResults.scenarios);
      sensitivityResults.push(variableResults);
    });

    // Two-way sensitivity analysis (if at least 2 variables)
    let twoWayAnalysis = null;
    if (sensitivity_variables.length >= 2) {
      twoWayAnalysis = this.performTwoWayAnalysis(
        base_scenario,
        sensitivity_variables[0],
        sensitivity_variables[1],
        analysis_metrics[0],
        discount_rate / 100
      );
    }

    // Tornado diagram data
    const tornadoDiagram = this.createTornadoDiagram(sensitivityResults, analysis_metrics[0]);

    // Critical values analysis
    const criticalValues = this.findCriticalValues(base_scenario, sensitivity_variables, discount_rate / 100);

    // Risk assessment
    const riskAssessment = this.assessRisk(sensitivityResults, baseMetrics);

    return {
      base_case: {
        scenario: base_scenario,
        metrics: this.formatMetrics(baseMetrics, analysis_metrics)
      },
      sensitivity_analysis: sensitivityResults,
      two_way_analysis: twoWayAnalysis,
      tornado_diagram: tornadoDiagram,
      critical_values: criticalValues,
      risk_assessment: riskAssessment,
      recommendations: this.generateRecommendations(
        sensitivityResults,
        riskAssessment,
        criticalValues
      )
    };
  }

  calculateScenarioMetrics(scenario, discountRate) {
    const {
      purchase_price,
      down_payment_percent = 20,
      annual_rental_income,
      annual_expenses,
      vacancy_rate = 5,
      interest_rate = 7,
      loan_term_years = 30,
      appreciation_rate = 3,
      holding_period_years = 5
    } = scenario;

    const down_payment = purchase_price * (down_payment_percent / 100);
    const loan_amount = purchase_price - down_payment;
    
    // Calculate annual debt service
    const monthly_rate = interest_rate / 100 / 12;
    const num_payments = loan_term_years * 12;
    let monthly_payment = 0;
    
    if (loan_amount > 0 && monthly_rate > 0) {
      monthly_payment = loan_amount * (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) / 
                       (Math.pow(1 + monthly_rate, num_payments) - 1);
    } else if (loan_amount > 0) {
      monthly_payment = loan_amount / num_payments;
    }
    
    const annual_debt_service = monthly_payment * 12;

    // Calculate annual NOI
    const effective_rental_income = annual_rental_income * (1 - vacancy_rate / 100);
    const noi = effective_rental_income - annual_expenses;
    
    // Calculate annual cash flow
    const annual_cash_flow = noi - annual_debt_service;
    const monthly_cash_flow = annual_cash_flow / 12;

    // Build cash flows for IRR/NPV
    const cashFlows = [-down_payment]; // Initial investment
    
    // Annual cash flows
    for (let year = 1; year <= holding_period_years; year++) {
      if (year < holding_period_years) {
        cashFlows.push(annual_cash_flow);
      } else {
        // Final year includes sale proceeds
        const future_value = purchase_price * Math.pow(1 + appreciation_rate / 100, holding_period_years);
        const remaining_balance = this.calculateRemainingBalance(
          loan_amount,
          monthly_rate,
          loan_term_years * 12,
          holding_period_years * 12
        );
        const sale_proceeds = future_value - remaining_balance;
        cashFlows.push(annual_cash_flow + sale_proceeds);
      }
    }

    // Calculate metrics
    const irr = this.calculateIRR(cashFlows);
    const npv = this.calculateNPV(cashFlows, discountRate);
    const cash_on_cash = down_payment > 0 ? (annual_cash_flow / down_payment) * 100 : 0;
    
    // Total return calculation
    const total_cash_received = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0);
    const total_return = down_payment > 0 ? ((total_cash_received - down_payment) / down_payment) * 100 : 0;

    return {
      irr: irr * 100,
      npv: npv,
      cash_on_cash: cash_on_cash,
      total_return: total_return,
      monthly_cash_flow: monthly_cash_flow,
      annual_cash_flow: annual_cash_flow,
      total_investment: down_payment,
      final_equity: cashFlows[cashFlows.length - 1] - annual_cash_flow
    };
  }

  calculateRemainingBalance(principal, monthlyRate, totalPayments, paymentsMade) {
    if (monthlyRate === 0) {
      return principal * (1 - paymentsMade / totalPayments);
    }
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                          (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    const remainingBalance = principal * Math.pow(1 + monthlyRate, paymentsMade) - 
                           monthlyPayment * (Math.pow(1 + monthlyRate, paymentsMade) - 1) / monthlyRate;
    
    return Math.max(0, remainingBalance);
  }

  calculateIRR(cashFlows) {
    let rate = 0.1;
    const maxIterations = 100;
    const tolerance = 0.00001;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;

      for (let j = 0; j < cashFlows.length; j++) {
        npv += cashFlows[j] / Math.pow(1 + rate, j);
        if (j > 0) {
          dnpv -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
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

  calculateNPV(cashFlows, discountRate) {
    return cashFlows.reduce((npv, cf, i) => npv + cf / Math.pow(1 + discountRate, i), 0);
  }

  formatVariableName(variable) {
    const names = {
      purchase_price: 'Purchase Price',
      rental_income: 'Rental Income',
      expenses: 'Operating Expenses',
      vacancy_rate: 'Vacancy Rate',
      interest_rate: 'Interest Rate',
      appreciation_rate: 'Appreciation Rate'
    };
    return names[variable] || variable;
  }

  getBaseValue(scenario, variable) {
    const mapping = {
      purchase_price: scenario.purchase_price,
      rental_income: scenario.annual_rental_income,
      expenses: scenario.annual_expenses,
      vacancy_rate: scenario.vacancy_rate || 5,
      interest_rate: scenario.interest_rate || 7,
      appreciation_rate: scenario.appreciation_rate || 3
    };
    return mapping[variable];
  }

  getVariableValue(scenario, variable) {
    return this.getBaseValue(scenario, variable);
  }

  createScenario(baseScenario, variable, variationPercent) {
    const scenario = { ...baseScenario };
    const baseValue = this.getBaseValue(baseScenario, variable);
    const newValue = baseValue * (1 + variationPercent / 100);

    switch (variable) {
      case 'purchase_price':
        scenario.purchase_price = newValue;
        break;
      case 'rental_income':
        scenario.annual_rental_income = newValue;
        break;
      case 'expenses':
        scenario.annual_expenses = newValue;
        break;
      case 'vacancy_rate':
        scenario.vacancy_rate = baseValue + variationPercent; // Direct percentage change
        break;
      case 'interest_rate':
        scenario.interest_rate = baseValue + variationPercent * baseValue / 100;
        break;
      case 'appreciation_rate':
        scenario.appreciation_rate = baseValue + variationPercent * baseValue / 100;
        break;
    }

    return scenario;
  }

  formatMetrics(metrics, selectedMetrics) {
    const formatted = {};
    selectedMetrics.forEach(metric => {
      formatted[metric] = parseFloat(metrics[metric].toFixed(2));
    });
    return formatted;
  }

  calculateImpact(baseMetrics, scenarioMetrics, selectedMetrics) {
    const impact = {};
    selectedMetrics.forEach(metric => {
      const baseValue = baseMetrics[metric];
      const scenarioValue = scenarioMetrics[metric];
      
      if (metric === 'monthly_cash_flow' || metric === 'npv') {
        // Absolute change for dollar amounts
        impact[metric] = parseFloat((scenarioValue - baseValue).toFixed(2));
      } else {
        // Percentage change for rates
        impact[metric] = baseValue !== 0 
          ? parseFloat(((scenarioValue - baseValue) / Math.abs(baseValue) * 100).toFixed(2))
          : 0;
      }
    });
    return impact;
  }

  calculateSensitivityMetrics(scenarios) {
    const metrics = {};
    const metricNames = Object.keys(scenarios[0].metrics);

    metricNames.forEach(metric => {
      const values = scenarios.map(s => s.metrics[metric]);
      const variations = scenarios.map(s => s.variation_percent);
      
      // Calculate range
      const range = Math.max(...values) - Math.min(...values);
      
      // Calculate elasticity (average % change in output per % change in input)
      let totalElasticity = 0;
      let count = 0;
      
      for (let i = 0; i < scenarios.length - 1; i++) {
        if (variations[i + 1] !== variations[i] && values[i] !== 0) {
          const inputChange = variations[i + 1] - variations[i];
          const outputChange = ((values[i + 1] - values[i]) / Math.abs(values[i])) * 100;
          totalElasticity += Math.abs(outputChange / inputChange);
          count++;
        }
      }
      
      metrics[metric] = {
        range: parseFloat(range.toFixed(2)),
        elasticity: count > 0 ? parseFloat((totalElasticity / count).toFixed(3)) : 0,
        min_value: parseFloat(Math.min(...values).toFixed(2)),
        max_value: parseFloat(Math.max(...values).toFixed(2))
      };
    });

    return metrics;
  }

  performTwoWayAnalysis(baseScenario, var1, var2, metric, discountRate) {
    const variations = [-20, -10, 0, 10, 20];
    const results = [];

    variations.forEach(var1Change => {
      const row = {
        var1_change: var1Change,
        values: []
      };

      variations.forEach(var2Change => {
        let scenario = this.createScenario(baseScenario, var1.variable, var1Change);
        scenario = this.createScenario(scenario, var2.variable, var2Change);
        const metrics = this.calculateScenarioMetrics(scenario, discountRate);
        row.values.push(parseFloat(metrics[metric].toFixed(2)));
      });

      results.push(row);
    });

    return {
      variable1: this.formatVariableName(var1.variable),
      variable2: this.formatVariableName(var2.variable),
      metric: metric,
      var2_changes: variations,
      data: results
    };
  }

  createTornadoDiagram(sensitivityResults, primaryMetric) {
    const data = [];

    sensitivityResults.forEach(result => {
      const sensitivity = result.sensitivity_metrics[primaryMetric];
      if (sensitivity) {
        data.push({
          variable: result.variable,
          min_impact: sensitivity.min_value,
          max_impact: sensitivity.max_value,
          range: sensitivity.range,
          elasticity: sensitivity.elasticity
        });
      }
    });

    // Sort by range (highest impact first)
    data.sort((a, b) => b.range - a.range);

    return {
      metric: primaryMetric,
      variables: data
    };
  }

  findCriticalValues(baseScenario, variables, discountRate) {
    const criticalValues = [];

    variables.forEach(({ variable }) => {
      // Find break-even point (where IRR = discount rate or NPV = 0)
      const breakEven = this.findBreakEvenPoint(
        baseScenario,
        variable,
        discountRate
      );

      if (breakEven !== null) {
        criticalValues.push({
          variable: this.formatVariableName(variable),
          base_value: this.getBaseValue(baseScenario, variable),
          break_even_value: breakEven.value,
          break_even_change_percent: breakEven.changePercent,
          margin_of_safety: parseFloat((100 - Math.abs(breakEven.changePercent)).toFixed(2))
        });
      }
    });

    return criticalValues;
  }

  findBreakEvenPoint(baseScenario, variable, targetRate) {
    let low = -90;
    let high = 200;
    const tolerance = 0.1;
    const maxIterations = 50;

    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2;
      const scenario = this.createScenario(baseScenario, variable, mid);
      const metrics = this.calculateScenarioMetrics(scenario, targetRate);
      
      // Look for NPV = 0
      if (Math.abs(metrics.npv) < 100) {
        return {
          value: this.getVariableValue(scenario, variable),
          changePercent: mid
        };
      }

      if (metrics.npv > 0) {
        // Need to make investment worse
        if (variable === 'expenses' || variable === 'purchase_price' || variable === 'interest_rate') {
          low = mid;
        } else {
          high = mid;
        }
      } else {
        // Need to make investment better
        if (variable === 'expenses' || variable === 'purchase_price' || variable === 'interest_rate') {
          high = mid;
        } else {
          low = mid;
        }
      }

      if (Math.abs(high - low) < tolerance) {
        break;
      }
    }

    return null;
  }

  assessRisk(sensitivityResults, baseMetrics) {
    let totalElasticity = 0;
    let maxDownsideRisk = 0;
    const highSensitivityVars = [];
    const criticalVariables = [];

    sensitivityResults.forEach(result => {
      const primaryMetric = Object.keys(result.sensitivity_metrics)[0];
      const sensitivity = result.sensitivity_metrics[primaryMetric];
      
      totalElasticity += sensitivity.elasticity;

      // Check for high sensitivity (elasticity > 1)
      if (sensitivity.elasticity > 1) {
        highSensitivityVars.push({
          variable: result.variable,
          elasticity: sensitivity.elasticity
        });
      }

      // Calculate downside risk
      const downsideScenarios = result.scenarios.filter(s => s.variation_percent < 0);
      const worstCase = Math.min(...downsideScenarios.map(s => s.metrics[primaryMetric]));
      const downsideRisk = ((baseMetrics[primaryMetric] - worstCase) / Math.abs(baseMetrics[primaryMetric])) * 100;
      
      if (downsideRisk > maxDownsideRisk) {
        maxDownsideRisk = downsideRisk;
      }

      // Identify critical variables (where small changes have big impacts)
      if (sensitivity.elasticity > 1.5 || downsideRisk > 30) {
        criticalVariables.push(result.variable);
      }
    });

    const avgElasticity = totalElasticity / sensitivityResults.length;
    
    // Determine overall risk level
    let riskLevel;
    if (avgElasticity < 0.5 && maxDownsideRisk < 20) {
      riskLevel = 'Low';
    } else if (avgElasticity < 1 && maxDownsideRisk < 40) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'High';
    }

    return {
      overall_risk_level: riskLevel,
      average_elasticity: parseFloat(avgElasticity.toFixed(3)),
      max_downside_risk: parseFloat(maxDownsideRisk.toFixed(2)),
      high_sensitivity_variables: highSensitivityVars,
      critical_variables: criticalVariables,
      risk_factors: this.identifyRiskFactors(sensitivityResults, criticalVariables)
    };
  }

  identifyRiskFactors(sensitivityResults, criticalVariables) {
    const factors = [];

    if (criticalVariables.includes('Interest Rate')) {
      factors.push({
        factor: 'Interest Rate Risk',
        description: 'Investment highly sensitive to rate changes',
        mitigation: 'Consider fixed-rate financing or rate locks'
      });
    }

    if (criticalVariables.includes('Rental Income')) {
      factors.push({
        factor: 'Income Risk',
        description: 'Returns heavily dependent on rental income',
        mitigation: 'Diversify tenant base, consider long-term leases'
      });
    }

    if (criticalVariables.includes('Purchase Price')) {
      factors.push({
        factor: 'Valuation Risk',
        description: 'Returns sensitive to purchase price',
        mitigation: 'Thorough due diligence and conservative valuations'
      });
    }

    if (criticalVariables.includes('Vacancy Rate')) {
      factors.push({
        factor: 'Occupancy Risk',
        description: 'Performance vulnerable to vacancy',
        mitigation: 'Focus on high-demand locations and tenant retention'
      });
    }

    return factors;
  }

  generateRecommendations(sensitivityResults, riskAssessment, criticalValues) {
    const recommendations = [];

    // Risk level recommendations
    if (riskAssessment.overall_risk_level === 'High') {
      recommendations.push({
        type: 'Risk Management',
        priority: 'High',
        message: 'High sensitivity to multiple variables',
        action: 'Implement hedging strategies and maintain larger reserves'
      });
    }

    // Critical variable recommendations
    riskAssessment.critical_variables.forEach(variable => {
      const critical = criticalValues.find(cv => cv.variable === variable);
      if (critical && critical.margin_of_safety < 20) {
        recommendations.push({
          type: 'Critical Risk',
          priority: 'High',
          message: `Low margin of safety for ${variable} (${critical.margin_of_safety}%)`,
          action: `Monitor ${variable} closely and develop contingency plans`
        });
      }
    });

    // Elasticity recommendations
    if (riskAssessment.average_elasticity > 1.5) {
      recommendations.push({
        type: 'Volatility',
        priority: 'Medium',
        message: 'High overall sensitivity to input changes',
        action: 'Consider more stable investment alternatives or risk reduction strategies'
      });
    }

    // Specific variable recommendations
    const tornadoData = this.createTornadoDiagram(sensitivityResults, Object.keys(sensitivityResults[0].sensitivity_metrics)[0]);
    const topRiskVariable = tornadoData.variables[0];
    
    if (topRiskVariable) {
      recommendations.push({
        type: 'Focus Area',
        priority: 'High',
        message: `${topRiskVariable.variable} has the highest impact on returns`,
        action: `Prioritize managing ${topRiskVariable.variable} risk through contracts or hedging`
      });
    }

    // Positive recommendations
    const lowRiskVars = sensitivityResults.filter(r => 
      Object.values(r.sensitivity_metrics)[0].elasticity < 0.5
    );
    
    if (lowRiskVars.length > 0) {
      recommendations.push({
        type: 'Strength',
        priority: 'Low',
        message: `Low sensitivity to ${lowRiskVars.map(v => v.variable).join(', ')}`,
        action: 'These factors provide stability to the investment'
      });
    }

    return recommendations;
  }
}