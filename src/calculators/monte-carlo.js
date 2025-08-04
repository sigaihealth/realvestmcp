export class MonteCarloSimulator {
  constructor() {
    this.name = 'Monte Carlo Real Estate Simulator';
    this.description = 'Simulate thousands of scenarios to assess investment risk and return probabilities';
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        investment_parameters: {
          type: 'object',
          description: 'Base investment parameters',
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
            closing_costs: {
              type: 'number',
              description: 'Closing costs',
              minimum: 0,
              default: 0
            },
            holding_period_years: {
              type: 'number',
              description: 'Investment holding period',
              minimum: 1,
              maximum: 30,
              default: 5
            },
            loan_interest_rate: {
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
            }
          },
          required: ['purchase_price']
        },
        variable_distributions: {
          type: 'object',
          description: 'Probability distributions for uncertain variables',
          properties: {
            rental_income: {
              type: 'object',
              description: 'Monthly rental income distribution',
              properties: {
                type: {
                  type: 'string',
                  enum: ['normal', 'uniform', 'triangular'],
                  default: 'normal'
                },
                mean: {
                  type: 'number',
                  description: 'Mean/expected monthly rent',
                  minimum: 0
                },
                std_dev: {
                  type: 'number',
                  description: 'Standard deviation (for normal distribution)',
                  minimum: 0
                },
                min: {
                  type: 'number',
                  description: 'Minimum value (for uniform/triangular)',
                  minimum: 0
                },
                max: {
                  type: 'number',
                  description: 'Maximum value (for uniform/triangular)',
                  minimum: 0
                },
                mode: {
                  type: 'number',
                  description: 'Most likely value (for triangular)',
                  minimum: 0
                }
              },
              required: ['type', 'mean']
            },
            vacancy_rate: {
              type: 'object',
              description: 'Vacancy rate distribution (%)',
              properties: {
                type: {
                  type: 'string',
                  enum: ['normal', 'uniform', 'triangular'],
                  default: 'triangular'
                },
                mean: {
                  type: 'number',
                  description: 'Mean vacancy rate',
                  minimum: 0,
                  maximum: 100,
                  default: 5
                },
                std_dev: {
                  type: 'number',
                  description: 'Standard deviation',
                  minimum: 0
                },
                min: {
                  type: 'number',
                  description: 'Minimum vacancy rate',
                  minimum: 0,
                  default: 0
                },
                max: {
                  type: 'number',
                  description: 'Maximum vacancy rate',
                  minimum: 0,
                  maximum: 100,
                  default: 20
                },
                mode: {
                  type: 'number',
                  description: 'Most likely vacancy rate',
                  minimum: 0,
                  default: 5
                }
              }
            },
            operating_expenses: {
              type: 'object',
              description: 'Annual operating expenses distribution',
              properties: {
                type: {
                  type: 'string',
                  enum: ['normal', 'uniform', 'triangular'],
                  default: 'normal'
                },
                mean: {
                  type: 'number',
                  description: 'Mean annual expenses',
                  minimum: 0
                },
                std_dev: {
                  type: 'number',
                  description: 'Standard deviation',
                  minimum: 0
                },
                min: {
                  type: 'number',
                  description: 'Minimum expenses',
                  minimum: 0
                },
                max: {
                  type: 'number',
                  description: 'Maximum expenses',
                  minimum: 0
                }
              },
              required: ['type', 'mean']
            },
            appreciation_rate: {
              type: 'object',
              description: 'Annual appreciation rate distribution (%)',
              properties: {
                type: {
                  type: 'string',
                  enum: ['normal', 'uniform', 'triangular'],
                  default: 'normal'
                },
                mean: {
                  type: 'number',
                  description: 'Mean appreciation rate',
                  default: 3
                },
                std_dev: {
                  type: 'number',
                  description: 'Standard deviation',
                  minimum: 0,
                  default: 2
                },
                min: {
                  type: 'number',
                  description: 'Minimum appreciation',
                  default: -5
                },
                max: {
                  type: 'number',
                  description: 'Maximum appreciation',
                  default: 10
                }
              }
            },
            exit_cap_rate: {
              type: 'object',
              description: 'Exit cap rate distribution (%)',
              properties: {
                type: {
                  type: 'string',
                  enum: ['normal', 'uniform', 'triangular'],
                  default: 'normal'
                },
                mean: {
                  type: 'number',
                  description: 'Mean exit cap rate',
                  minimum: 0,
                  default: 6
                },
                std_dev: {
                  type: 'number',
                  description: 'Standard deviation',
                  minimum: 0,
                  default: 1
                }
              }
            }
          },
          required: ['rental_income', 'operating_expenses']
        },
        simulation_settings: {
          type: 'object',
          description: 'Monte Carlo simulation settings',
          properties: {
            num_simulations: {
              type: 'number',
              description: 'Number of simulations to run',
              minimum: 100,
              maximum: 100000,
              default: 10000
            },
            random_seed: {
              type: 'number',
              description: 'Random seed for reproducibility',
              default: null
            },
            confidence_levels: {
              type: 'array',
              description: 'Confidence levels for VaR calculation',
              items: {
                type: 'number',
                minimum: 0,
                maximum: 100
              },
              default: [5, 10, 25, 50, 75, 90, 95]
            }
          }
        },
        target_metrics: {
          type: 'object',
          description: 'Target values for probability calculations',
          properties: {
            minimum_irr: {
              type: 'number',
              description: 'Minimum acceptable IRR (%)',
              default: 10
            },
            minimum_cash_flow: {
              type: 'number',
              description: 'Minimum monthly cash flow',
              default: 0
            },
            maximum_loss: {
              type: 'number',
              description: 'Maximum acceptable loss',
              default: 0
            }
          }
        }
      },
      required: ['investment_parameters', 'variable_distributions']
    };
  }

  calculate(params) {
    const {
      investment_parameters,
      variable_distributions,
      simulation_settings = {},
      target_metrics = {}
    } = params;

    const {
      num_simulations = 10000,
      random_seed = null,
      confidence_levels = [5, 10, 25, 50, 75, 90, 95]
    } = simulation_settings;

    // Initialize random number generator
    this.initializeRandom(random_seed);

    // Run simulations
    const simulationResults = [];
    for (let i = 0; i < num_simulations; i++) {
      const scenario = this.generateScenario(variable_distributions);
      const results = this.calculateScenarioResults(investment_parameters, scenario);
      simulationResults.push(results);
    }

    // Analyze results
    const statistics = this.calculateStatistics(simulationResults);
    const distributions = this.analyzeDistributions(simulationResults);
    const riskMetrics = this.calculateRiskMetrics(simulationResults, confidence_levels);
    const probabilities = this.calculateProbabilities(simulationResults, target_metrics);
    const correlations = this.calculateCorrelations(simulationResults);
    const scenarios = this.identifyKeyScenarios(simulationResults);

    return {
      summary_statistics: statistics,
      distributions: distributions,
      risk_metrics: riskMetrics,
      probability_analysis: probabilities,
      correlations: correlations,
      scenario_analysis: scenarios,
      confidence_intervals: this.calculateConfidenceIntervals(simulationResults, confidence_levels),
      recommendations: this.generateRecommendations(statistics, riskMetrics, probabilities),
      simulation_metadata: {
        num_simulations: num_simulations,
        random_seed: random_seed,
        timestamp: new Date().toISOString()
      }
    };
  }

  initializeRandom(seed) {
    // Simple seedable random number generator
    this.seed = seed || Date.now();
    this.random = () => {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return this.seed / 233280;
    };
  }

  generateScenario(distributions) {
    const scenario = {};

    // Generate rental income
    scenario.monthly_rent = this.sampleDistribution(distributions.rental_income);
    
    // Generate vacancy rate
    scenario.vacancy_rate = distributions.vacancy_rate 
      ? this.sampleDistribution(distributions.vacancy_rate)
      : 5;

    // Generate operating expenses
    scenario.annual_expenses = this.sampleDistribution(distributions.operating_expenses);

    // Generate appreciation rate
    scenario.appreciation_rate = distributions.appreciation_rate
      ? this.sampleDistribution(distributions.appreciation_rate)
      : 3;

    // Generate exit cap rate
    scenario.exit_cap_rate = distributions.exit_cap_rate
      ? this.sampleDistribution(distributions.exit_cap_rate)
      : 6;

    return scenario;
  }

  sampleDistribution(distribution) {
    const { type, mean, std_dev, min, max, mode } = distribution;

    switch (type) {
      case 'normal':
        return this.sampleNormal(mean, std_dev || mean * 0.1);
      
      case 'uniform':
        return this.sampleUniform(min || mean * 0.8, max || mean * 1.2);
      
      case 'triangular':
        return this.sampleTriangular(
          min || mean * 0.8,
          max || mean * 1.2,
          mode || mean
        );
      
      default:
        return mean;
    }
  }

  sampleNormal(mean, stdDev) {
    // Box-Muller transform
    const u1 = this.random();
    const u2 = this.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  sampleUniform(min, max) {
    return min + this.random() * (max - min);
  }

  sampleTriangular(min, max, mode) {
    const u = this.random();
    const fc = (mode - min) / (max - min);
    
    if (u < fc) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }

  calculateScenarioResults(params, scenario) {
    const {
      purchase_price,
      down_payment_percent = 20,
      closing_costs = 0,
      holding_period_years = 5,
      loan_interest_rate = 7,
      loan_term_years = 30
    } = params;

    const {
      monthly_rent,
      vacancy_rate,
      annual_expenses,
      appreciation_rate,
      exit_cap_rate
    } = scenario;

    // Initial investment
    const down_payment = purchase_price * (down_payment_percent / 100);
    const total_cash_invested = down_payment + closing_costs;
    const loan_amount = purchase_price - down_payment;

    // Calculate monthly payment
    const monthly_rate = loan_interest_rate / 100 / 12;
    const num_payments = loan_term_years * 12;
    let monthly_payment = 0;
    
    if (loan_amount > 0 && monthly_rate > 0) {
      monthly_payment = loan_amount * (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) / 
                       (Math.pow(1 + monthly_rate, num_payments) - 1);
    }

    // Annual income and expenses
    const annual_rental_income = monthly_rent * 12 * (1 - vacancy_rate / 100);
    const annual_debt_service = monthly_payment * 12;
    const annual_cash_flow = annual_rental_income - annual_expenses - annual_debt_service;
    const monthly_cash_flow = annual_cash_flow / 12;

    // Build cash flows for IRR
    const cashFlows = [-total_cash_invested];
    let cumulative_cash_flow = 0;

    for (let year = 1; year <= holding_period_years; year++) {
      if (year < holding_period_years) {
        cashFlows.push(annual_cash_flow);
        cumulative_cash_flow += annual_cash_flow;
      } else {
        // Exit year
        const future_value = purchase_price * Math.pow(1 + appreciation_rate / 100, holding_period_years);
        
        // Calculate exit value using cap rate if provided
        let exit_value = future_value;
        if (exit_cap_rate > 0) {
          const exit_noi = annual_rental_income - annual_expenses;
          const cap_rate_value = exit_noi / (exit_cap_rate / 100);
          exit_value = Math.min(future_value, cap_rate_value); // Conservative approach
        }
        
        // Calculate remaining loan balance
        const remaining_balance = this.calculateRemainingBalance(
          loan_amount,
          monthly_rate,
          num_payments,
          holding_period_years * 12
        );
        
        const sale_proceeds = exit_value - remaining_balance;
        cashFlows.push(annual_cash_flow + sale_proceeds);
        cumulative_cash_flow += annual_cash_flow;
      }
    }

    // Calculate metrics
    const irr = this.calculateIRR(cashFlows) * 100;
    const total_return = ((cumulative_cash_flow + cashFlows[cashFlows.length - 1] - annual_cash_flow) / total_cash_invested) * 100;
    const cash_on_cash = (annual_cash_flow / total_cash_invested) * 100;
    const equity_multiple = (cumulative_cash_flow + cashFlows[cashFlows.length - 1] - annual_cash_flow + total_cash_invested) / total_cash_invested;

    return {
      irr: irr,
      total_return: total_return,
      cash_on_cash_return: cash_on_cash,
      equity_multiple: equity_multiple,
      monthly_cash_flow: monthly_cash_flow,
      annual_cash_flow: annual_cash_flow,
      total_profit: cumulative_cash_flow + cashFlows[cashFlows.length - 1] - annual_cash_flow,
      exit_value: cashFlows[cashFlows.length - 1] - annual_cash_flow,
      // Include scenario inputs for correlation analysis
      inputs: {
        monthly_rent: monthly_rent,
        vacancy_rate: vacancy_rate,
        annual_expenses: annual_expenses,
        appreciation_rate: appreciation_rate,
        exit_cap_rate: exit_cap_rate
      }
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

      if (Math.abs(npv) < tolerance) {
        return rate;
      }

      const newRate = rate - npv / dnpv;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate;
      }
      
      // Bound the rate to prevent divergence
      rate = Math.max(-0.99, Math.min(newRate, 10));
    }

    return rate;
  }

  calculateStatistics(results) {
    const metrics = ['irr', 'total_return', 'cash_on_cash_return', 'equity_multiple', 'monthly_cash_flow', 'total_profit'];
    const statistics = {};

    metrics.forEach(metric => {
      const values = results.map(r => r[metric]);
      const sorted = [...values].sort((a, b) => a - b);
      const n = values.length;

      statistics[metric] = {
        mean: this.mean(values),
        median: sorted[Math.floor(n / 2)],
        std_dev: this.standardDeviation(values),
        min: sorted[0],
        max: sorted[n - 1],
        skewness: this.skewness(values),
        kurtosis: this.kurtosis(values)
      };
    });

    return statistics;
  }

  mean(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  standardDeviation(values) {
    const avg = this.mean(values);
    const squareDiffs = values.map(val => Math.pow(val - avg, 2));
    return Math.sqrt(this.mean(squareDiffs));
  }

  skewness(values) {
    const n = values.length;
    const mean = this.mean(values);
    const stdDev = this.standardDeviation(values);
    
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
  }

  kurtosis(values) {
    const n = values.length;
    const mean = this.mean(values);
    const stdDev = this.standardDeviation(values);
    
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0);
    return (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sum - 3 * Math.pow(n - 1, 2) / ((n - 2) * (n - 3));
  }

  analyzeDistributions(results) {
    const distributions = {};
    const metrics = ['irr', 'total_return', 'monthly_cash_flow'];

    metrics.forEach(metric => {
      const values = results.map(r => r[metric]);
      const histogram = this.createHistogram(values, 20);
      
      distributions[metric] = {
        histogram: histogram,
        percentiles: this.calculatePercentiles(values, [1, 5, 10, 25, 50, 75, 90, 95, 99])
      };
    });

    return distributions;
  }

  createHistogram(values, numBins) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numBins;
    
    const bins = Array(numBins).fill(0).map((_, i) => ({
      min: min + i * binWidth,
      max: min + (i + 1) * binWidth,
      count: 0,
      frequency: 0
    }));

    values.forEach(val => {
      const binIndex = Math.min(Math.floor((val - min) / binWidth), numBins - 1);
      bins[binIndex].count++;
    });

    bins.forEach(bin => {
      bin.frequency = bin.count / values.length;
    });

    return bins;
  }

  calculatePercentiles(values, percentiles) {
    const sorted = [...values].sort((a, b) => a - b);
    const result = {};
    
    percentiles.forEach(p => {
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      result[`p${p}`] = sorted[Math.max(0, index)];
    });

    return result;
  }

  calculateRiskMetrics(results, confidenceLevels) {
    const metrics = {};
    
    // Value at Risk (VaR) for different metrics
    ['irr', 'total_return', 'monthly_cash_flow'].forEach(metric => {
      const values = results.map(r => r[metric]);
      const sorted = [...values].sort((a, b) => a - b);
      
      metrics[metric] = {
        value_at_risk: {},
        conditional_value_at_risk: {},
        probability_of_loss: (values.filter(v => v < 0).length / values.length) * 100,
        downside_deviation: this.calculateDownsideDeviation(values)
      };

      confidenceLevels.forEach(level => {
        const index = Math.floor((level / 100) * sorted.length);
        const var_value = sorted[index];
        
        metrics[metric].value_at_risk[`var_${level}`] = var_value;
        
        // CVaR (average of values below VaR)
        const below_var = sorted.slice(0, index);
        metrics[metric].conditional_value_at_risk[`cvar_${level}`] = 
          below_var.length > 0 ? this.mean(below_var) : var_value;
      });
    });

    // Sharpe ratio approximation (using 0 as risk-free rate)
    const returns = results.map(r => r.total_return);
    const avgReturn = this.mean(returns);
    const stdReturn = this.standardDeviation(returns);
    metrics.sharpe_ratio = stdReturn > 0 ? avgReturn / stdReturn : 0;

    // Maximum drawdown
    metrics.max_drawdown = Math.min(...returns);

    return metrics;
  }

  calculateDownsideDeviation(values, target = 0) {
    const downsideValues = values.filter(v => v < target);
    if (downsideValues.length === 0) return 0;
    
    const downsideSquares = downsideValues.map(v => Math.pow(v - target, 2));
    return Math.sqrt(this.mean(downsideSquares));
  }

  calculateProbabilities(results, targets) {
    const {
      minimum_irr = 10,
      minimum_cash_flow = 0,
      maximum_loss = 0
    } = targets;

    const probabilities = {
      irr_above_target: (results.filter(r => r.irr >= minimum_irr).length / results.length) * 100,
      positive_cash_flow: (results.filter(r => r.monthly_cash_flow >= minimum_cash_flow).length / results.length) * 100,
      profitable_exit: (results.filter(r => r.total_profit > maximum_loss).length / results.length) * 100,
      double_money: (results.filter(r => r.equity_multiple >= 2).length / results.length) * 100,
      loss_probability: (results.filter(r => r.total_return < 0).length / results.length) * 100
    };

    // Joint probabilities
    probabilities.meet_all_targets = (results.filter(r => 
      r.irr >= minimum_irr && 
      r.monthly_cash_flow >= minimum_cash_flow && 
      r.total_profit > maximum_loss
    ).length / results.length) * 100;

    return probabilities;
  }

  calculateCorrelations(results) {
    const correlations = {};
    
    // Calculate correlations between inputs and outputs
    const inputs = ['monthly_rent', 'vacancy_rate', 'annual_expenses', 'appreciation_rate'];
    const outputs = ['irr', 'total_return', 'monthly_cash_flow'];

    outputs.forEach(output => {
      correlations[output] = {};
      const outputValues = results.map(r => r[output]);

      inputs.forEach(input => {
        const inputValues = results.map(r => r.inputs[input]);
        correlations[output][input] = this.pearsonCorrelation(inputValues, outputValues);
      });
    });

    // Rank inputs by absolute correlation strength
    const sensitivity_ranking = [];
    Object.entries(correlations.irr).forEach(([input, corr]) => {
      sensitivity_ranking.push({
        variable: input,
        correlation: corr,
        impact: Math.abs(corr) > 0.7 ? 'High' : Math.abs(corr) > 0.4 ? 'Medium' : 'Low'
      });
    });
    sensitivity_ranking.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    return {
      correlation_matrix: correlations,
      sensitivity_ranking: sensitivity_ranking
    };
  }

  pearsonCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  identifyKeyScenarios(results) {
    const sorted_by_irr = [...results].sort((a, b) => b.irr - a.irr);
    const n = results.length;

    return {
      best_case: this.formatScenario(sorted_by_irr[0], 'Best Case'),
      worst_case: this.formatScenario(sorted_by_irr[n - 1], 'Worst Case'),
      median_case: this.formatScenario(sorted_by_irr[Math.floor(n / 2)], 'Median Case'),
      percentile_10: this.formatScenario(sorted_by_irr[Math.floor(n * 0.9)], '10th Percentile'),
      percentile_90: this.formatScenario(sorted_by_irr[Math.floor(n * 0.1)], '90th Percentile')
    };
  }

  formatScenario(result, label) {
    return {
      label: label,
      inputs: result.inputs,
      outputs: {
        irr: parseFloat(result.irr.toFixed(2)),
        total_return: parseFloat(result.total_return.toFixed(2)),
        monthly_cash_flow: parseFloat(result.monthly_cash_flow.toFixed(2)),
        equity_multiple: parseFloat(result.equity_multiple.toFixed(2))
      }
    };
  }

  calculateConfidenceIntervals(results, levels) {
    const intervals = {};
    const metrics = ['irr', 'total_return', 'monthly_cash_flow'];

    metrics.forEach(metric => {
      const values = results.map(r => r[metric]);
      const sorted = [...values].sort((a, b) => a - b);
      intervals[metric] = {};

      levels.forEach(level => {
        const lowerIndex = Math.floor(((100 - level) / 2 / 100) * sorted.length);
        const upperIndex = Math.floor(((100 + level) / 2 / 100) * sorted.length) - 1;
        
        intervals[metric][`ci_${level}`] = {
          lower: sorted[lowerIndex],
          upper: sorted[upperIndex],
          width: sorted[upperIndex] - sorted[lowerIndex]
        };
      });
    });

    return intervals;
  }

  generateRecommendations(statistics, riskMetrics, probabilities) {
    const recommendations = [];

    // IRR recommendations
    if (statistics.irr.mean > 15) {
      recommendations.push({
        type: 'Performance',
        priority: 'High',
        message: `Strong expected IRR of ${statistics.irr.mean.toFixed(1)}%`,
        action: 'Investment shows attractive returns across scenarios'
      });
    } else if (statistics.irr.mean < 8) {
      recommendations.push({
        type: 'Performance',
        priority: 'High',
        message: `Low expected IRR of ${statistics.irr.mean.toFixed(1)}%`,
        action: 'Consider alternative investments or improve deal terms'
      });
    }

    // Risk recommendations
    if (riskMetrics.irr.probability_of_loss > 20) {
      recommendations.push({
        type: 'Risk',
        priority: 'High',
        message: `${riskMetrics.irr.probability_of_loss.toFixed(1)}% chance of negative returns`,
        action: 'High risk investment - ensure adequate risk tolerance'
      });
    }

    // Cash flow recommendations
    if (probabilities.positive_cash_flow < 80) {
      recommendations.push({
        type: 'Cash Flow',
        priority: 'Medium',
        message: `Only ${probabilities.positive_cash_flow.toFixed(1)}% chance of positive cash flow`,
        action: 'Prepare for potential negative cash flow periods'
      });
    }

    // Volatility recommendations
    const irr_cv = statistics.irr.std_dev / Math.abs(statistics.irr.mean);
    if (irr_cv > 0.5) {
      recommendations.push({
        type: 'Volatility',
        priority: 'Medium',
        message: 'High return volatility across scenarios',
        action: 'Consider strategies to reduce uncertainty in key variables'
      });
    }

    // Downside protection
    const var_10 = riskMetrics.irr.value_at_risk.var_10;
    if (var_10 < 0) {
      recommendations.push({
        type: 'Downside Risk',
        priority: 'High',
        message: `10% chance of IRR below ${var_10.toFixed(1)}%`,
        action: 'Implement downside protection strategies'
      });
    }

    // Positive recommendations
    if (probabilities.double_money > 50) {
      recommendations.push({
        type: 'Upside Potential',
        priority: 'Low',
        message: `${probabilities.double_money.toFixed(1)}% chance of doubling investment`,
        action: 'Strong upside potential in favorable scenarios'
      });
    }

    return recommendations;
  }
}