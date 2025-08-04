export class PropertyComparisonTool {
  constructor() {
    this.name = 'Property Comparison Tool';
    this.description = 'Compare multiple investment properties side by side with comprehensive analysis';
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        properties: {
          type: 'array',
          description: 'List of properties to compare (2-5 properties)',
          minItems: 2,
          maxItems: 5,
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Property name/address'
              },
              purchase_price: {
                type: 'number',
                description: 'Total purchase price',
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
                description: 'Estimated closing costs',
                minimum: 0,
                default: 0
              },
              property_type: {
                type: 'string',
                description: 'Type of property',
                enum: ['single_family', 'multi_family', 'condo', 'townhouse', 'commercial'],
                default: 'single_family'
              },
              units: {
                type: 'number',
                description: 'Number of rental units',
                minimum: 1,
                default: 1
              },
              square_feet: {
                type: 'number',
                description: 'Total square footage',
                minimum: 0
              },
              year_built: {
                type: 'number',
                description: 'Year property was built',
                minimum: 1800,
                maximum: 2025
              },
              monthly_rent: {
                type: 'number',
                description: 'Total monthly rental income',
                minimum: 0
              },
              monthly_expenses: {
                type: 'object',
                description: 'Monthly operating expenses',
                properties: {
                  property_tax: {
                    type: 'number',
                    minimum: 0,
                    default: 0
                  },
                  insurance: {
                    type: 'number',
                    minimum: 0,
                    default: 0
                  },
                  hoa: {
                    type: 'number',
                    minimum: 0,
                    default: 0
                  },
                  management: {
                    type: 'number',
                    minimum: 0,
                    default: 0
                  },
                  maintenance: {
                    type: 'number',
                    minimum: 0,
                    default: 0
                  },
                  utilities: {
                    type: 'number',
                    minimum: 0,
                    default: 0
                  },
                  other: {
                    type: 'number',
                    minimum: 0,
                    default: 0
                  }
                }
              },
              vacancy_rate: {
                type: 'number',
                description: 'Expected vacancy rate (%)',
                minimum: 0,
                maximum: 50,
                default: 5
              },
              appreciation_rate: {
                type: 'number',
                description: 'Expected annual appreciation (%)',
                minimum: -10,
                maximum: 20,
                default: 3
              },
              location_score: {
                type: 'object',
                description: 'Location quality scores (1-10)',
                properties: {
                  school_district: {
                    type: 'number',
                    minimum: 1,
                    maximum: 10
                  },
                  neighborhood: {
                    type: 'number',
                    minimum: 1,
                    maximum: 10
                  },
                  job_growth: {
                    type: 'number',
                    minimum: 1,
                    maximum: 10
                  },
                  amenities: {
                    type: 'number',
                    minimum: 1,
                    maximum: 10
                  }
                }
              }
            },
            required: ['name', 'purchase_price', 'monthly_rent']
          }
        },
        loan_terms: {
          type: 'object',
          description: 'Common loan terms for all properties',
          properties: {
            interest_rate: {
              type: 'number',
              description: 'Annual interest rate (%)',
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
          }
        },
        comparison_criteria: {
          type: 'object',
          description: 'Criteria for comparison and weighting',
          properties: {
            holding_period_years: {
              type: 'number',
              description: 'Investment holding period for analysis',
              minimum: 1,
              maximum: 30,
              default: 5
            },
            target_cash_flow: {
              type: 'number',
              description: 'Minimum monthly cash flow requirement',
              default: 200
            },
            target_cap_rate: {
              type: 'number',
              description: 'Minimum cap rate requirement (%)',
              default: 6
            },
            weights: {
              type: 'object',
              description: 'Importance weights for ranking (must sum to 100)',
              properties: {
                cash_flow: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  default: 25
                },
                appreciation: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  default: 25
                },
                cap_rate: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  default: 25
                },
                location: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  default: 25
                }
              }
            }
          }
        }
      },
      required: ['properties']
    };
  }

  calculate(params) {
    const {
      properties,
      loan_terms = {},
      comparison_criteria = {}
    } = params;

    const {
      interest_rate = 7,
      loan_term_years = 30
    } = loan_terms;

    const {
      holding_period_years = 5,
      target_cash_flow = 200,
      target_cap_rate = 6,
      weights = {
        cash_flow: 25,
        appreciation: 25,
        cap_rate: 25,
        location: 25
      }
    } = comparison_criteria;

    // Analyze each property
    const propertyAnalyses = properties.map(property => 
      this.analyzeProperty(property, interest_rate, loan_term_years, holding_period_years)
    );

    // Create comparison matrix
    const comparisonMatrix = this.createComparisonMatrix(propertyAnalyses);

    // Score and rank properties
    const rankings = this.scoreAndRank(propertyAnalyses, weights, target_cash_flow, target_cap_rate);

    // Identify best options for different criteria
    const bestOptions = this.identifyBestOptions(propertyAnalyses);

    // Risk-return analysis
    const riskReturnAnalysis = this.analyzeRiskReturn(propertyAnalyses);

    // Sensitivity comparison
    const sensitivityComparison = this.compareSensitivity(properties, interest_rate, loan_term_years);

    // Investment timeline comparison
    const timelineComparison = this.compareTimelines(propertyAnalyses, holding_period_years);

    // Generate insights
    const insights = this.generateInsights(propertyAnalyses, rankings, bestOptions);

    return {
      property_analyses: propertyAnalyses,
      comparison_matrix: comparisonMatrix,
      rankings: rankings,
      best_options: bestOptions,
      risk_return_analysis: riskReturnAnalysis,
      sensitivity_comparison: sensitivityComparison,
      timeline_comparison: timelineComparison,
      insights: insights,
      recommendations: this.generateRecommendations(rankings, propertyAnalyses, target_cash_flow, target_cap_rate)
    };
  }

  analyzeProperty(property, interestRate, loanTermYears, holdingPeriodYears) {
    const {
      name,
      purchase_price,
      down_payment_percent = 20,
      closing_costs = 0,
      monthly_rent,
      monthly_expenses = {},
      vacancy_rate = 5,
      appreciation_rate = 3,
      units = 1,
      square_feet,
      year_built,
      location_score = {}
    } = property;

    // Financial calculations
    const down_payment = purchase_price * (down_payment_percent / 100);
    const loan_amount = purchase_price - down_payment;
    const total_cash_invested = down_payment + closing_costs;

    // Monthly payment calculation
    const monthly_rate = interestRate / 100 / 12;
    const num_payments = loanTermYears * 12;
    let monthly_payment = 0;
    
    if (loan_amount > 0 && monthly_rate > 0) {
      monthly_payment = loan_amount * (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) / 
                       (Math.pow(1 + monthly_rate, num_payments) - 1);
    }

    // Income and expense calculations
    const effective_monthly_rent = monthly_rent * (1 - vacancy_rate / 100);
    const total_monthly_expenses = Object.values(monthly_expenses).reduce((sum, expense) => sum + expense, 0);
    const monthly_noi = effective_monthly_rent - total_monthly_expenses;
    const monthly_cash_flow = monthly_noi - monthly_payment;

    // Annual calculations
    const annual_noi = monthly_noi * 12;
    const annual_cash_flow = monthly_cash_flow * 12;

    // Key metrics
    const cap_rate = (annual_noi / purchase_price) * 100;
    const cash_on_cash_return = total_cash_invested > 0 ? (annual_cash_flow / total_cash_invested) * 100 : 0;
    const gross_rent_multiplier = purchase_price / (monthly_rent * 12);
    const price_per_sqft = square_feet > 0 ? purchase_price / square_feet : null;
    const rent_per_sqft = square_feet > 0 ? monthly_rent / square_feet : null;
    const price_per_unit = units > 0 ? purchase_price / units : purchase_price;

    // 1% and 2% rules
    const one_percent_rule = (monthly_rent / purchase_price) * 100;
    const two_percent_rule = one_percent_rule * 2;

    // Future value projections
    const future_value = purchase_price * Math.pow(1 + appreciation_rate / 100, holdingPeriodYears);
    const total_cash_flow_received = annual_cash_flow * holdingPeriodYears;
    
    // Calculate remaining loan balance
    const payments_made = holdingPeriodYears * 12;
    const remaining_balance = this.calculateRemainingBalance(loan_amount, monthly_rate, num_payments, payments_made);
    
    const equity_at_sale = future_value - remaining_balance;
    const total_return = total_cash_flow_received + equity_at_sale - total_cash_invested;
    const roi = total_cash_invested > 0 ? (total_return / total_cash_invested) * 100 : 0;

    // IRR calculation
    const cashFlows = [-total_cash_invested];
    for (let year = 1; year < holdingPeriodYears; year++) {
      cashFlows.push(annual_cash_flow);
    }
    cashFlows.push(annual_cash_flow + equity_at_sale);
    const irr = this.calculateIRR(cashFlows) * 100;

    // Location score
    const avg_location_score = Object.values(location_score).length > 0 ?
      Object.values(location_score).reduce((sum, score) => sum + score, 0) / Object.values(location_score).length : 5;

    // Property age factor
    const property_age = year_built ? new Date().getFullYear() - year_built : null;
    const age_factor = property_age ? Math.max(0, 100 - property_age) / 100 : 0.5;

    return {
      name: name,
      basic_info: {
        purchase_price: purchase_price,
        down_payment: down_payment,
        loan_amount: loan_amount,
        total_cash_invested: total_cash_invested,
        property_type: property.property_type,
        units: units,
        square_feet: square_feet,
        year_built: year_built,
        property_age: property_age
      },
      cash_flow_analysis: {
        monthly_rent: monthly_rent,
        effective_monthly_rent: parseFloat(effective_monthly_rent.toFixed(2)),
        monthly_expenses: parseFloat(total_monthly_expenses.toFixed(2)),
        monthly_noi: parseFloat(monthly_noi.toFixed(2)),
        monthly_payment: parseFloat(monthly_payment.toFixed(2)),
        monthly_cash_flow: parseFloat(monthly_cash_flow.toFixed(2)),
        annual_cash_flow: parseFloat(annual_cash_flow.toFixed(2))
      },
      return_metrics: {
        cap_rate: parseFloat(cap_rate.toFixed(2)),
        cash_on_cash_return: parseFloat(cash_on_cash_return.toFixed(2)),
        gross_rent_multiplier: parseFloat(gross_rent_multiplier.toFixed(2)),
        total_roi: parseFloat(roi.toFixed(2)),
        irr: parseFloat(irr.toFixed(2))
      },
      valuation_metrics: {
        price_per_sqft: price_per_sqft ? parseFloat(price_per_sqft.toFixed(2)) : null,
        rent_per_sqft: rent_per_sqft ? parseFloat(rent_per_sqft.toFixed(2)) : null,
        price_per_unit: parseFloat(price_per_unit.toFixed(2)),
        one_percent_rule: parseFloat(one_percent_rule.toFixed(3)),
        meets_one_percent: one_percent_rule >= 1
      },
      future_projections: {
        future_value: parseFloat(future_value.toFixed(2)),
        total_appreciation: parseFloat((future_value - purchase_price).toFixed(2)),
        total_cash_flow: parseFloat(total_cash_flow_received.toFixed(2)),
        equity_at_sale: parseFloat(equity_at_sale.toFixed(2)),
        total_return: parseFloat(total_return.toFixed(2))
      },
      location_analysis: {
        location_scores: location_score,
        average_score: parseFloat(avg_location_score.toFixed(1)),
        age_factor: parseFloat(age_factor.toFixed(2))
      },
      risk_metrics: {
        leverage_ratio: parseFloat((loan_amount / purchase_price * 100).toFixed(2)),
        break_even_occupancy: parseFloat(((total_monthly_expenses + monthly_payment) / monthly_rent * 100).toFixed(2)),
        cash_flow_margin: monthly_noi > 0 ? parseFloat((monthly_cash_flow / monthly_noi * 100).toFixed(2)) : 0
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

      const newRate = rate - npv / dnpv;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate;
      }
      
      rate = newRate;
    }

    return rate;
  }

  createComparisonMatrix(analyses) {
    const metrics = [
      { key: 'purchase_price', path: 'basic_info.purchase_price', label: 'Purchase Price', format: 'currency' },
      { key: 'cash_invested', path: 'basic_info.total_cash_invested', label: 'Cash Required', format: 'currency' },
      { key: 'monthly_cash_flow', path: 'cash_flow_analysis.monthly_cash_flow', label: 'Monthly Cash Flow', format: 'currency' },
      { key: 'cap_rate', path: 'return_metrics.cap_rate', label: 'Cap Rate', format: 'percent' },
      { key: 'cash_on_cash', path: 'return_metrics.cash_on_cash_return', label: 'Cash-on-Cash Return', format: 'percent' },
      { key: 'irr', path: 'return_metrics.irr', label: 'IRR', format: 'percent' },
      { key: 'total_return', path: 'future_projections.total_return', label: 'Total Return', format: 'currency' },
      { key: 'price_per_sqft', path: 'valuation_metrics.price_per_sqft', label: 'Price/Sq Ft', format: 'currency' },
      { key: 'break_even', path: 'risk_metrics.break_even_occupancy', label: 'Break-Even Occupancy', format: 'percent' },
      { key: 'location_score', path: 'location_analysis.average_score', label: 'Location Score', format: 'number' }
    ];

    const matrix = {
      properties: analyses.map(a => a.name),
      metrics: {}
    };

    metrics.forEach(metric => {
      matrix.metrics[metric.key] = {
        label: metric.label,
        format: metric.format,
        values: analyses.map(analysis => this.getNestedValue(analysis, metric.path)),
        best_value: null,
        best_property: null
      };

      // Identify best value
      const values = matrix.metrics[metric.key].values.filter(v => v !== null);
      if (values.length > 0) {
        const bestValue = metric.key === 'purchase_price' || metric.key === 'cash_invested' || metric.key === 'break_even' ?
          Math.min(...values) : Math.max(...values);
        const bestIndex = matrix.metrics[metric.key].values.indexOf(bestValue);
        
        matrix.metrics[metric.key].best_value = bestValue;
        matrix.metrics[metric.key].best_property = analyses[bestIndex].name;
      }
    });

    return matrix;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  scoreAndRank(analyses, weights, targetCashFlow, targetCapRate) {
    // Normalize weights
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    const normalizedWeights = {};
    Object.keys(weights).forEach(key => {
      normalizedWeights[key] = weights[key] / totalWeight;
    });

    const scores = analyses.map(analysis => {
      const scores = {
        cash_flow: this.scoreCashFlow(analysis.cash_flow_analysis.monthly_cash_flow, targetCashFlow),
        appreciation: this.scoreAppreciation(analysis.future_projections.total_appreciation, analysis.basic_info.purchase_price),
        cap_rate: this.scoreCapRate(analysis.return_metrics.cap_rate, targetCapRate),
        location: analysis.location_analysis.average_score / 10 * 100
      };

      const weightedScore = Object.keys(scores).reduce((total, key) => {
        return total + scores[key] * (normalizedWeights[key] || 0);
      }, 0);

      return {
        property: analysis.name,
        individual_scores: scores,
        weighted_score: parseFloat(weightedScore.toFixed(2)),
        meets_criteria: {
          cash_flow: analysis.cash_flow_analysis.monthly_cash_flow >= targetCashFlow,
          cap_rate: analysis.return_metrics.cap_rate >= targetCapRate
        }
      };
    });

    // Sort by weighted score
    scores.sort((a, b) => b.weighted_score - a.weighted_score);

    // Add ranking
    scores.forEach((score, index) => {
      score.rank = index + 1;
    });

    return scores;
  }

  scoreCashFlow(monthlyFlow, target) {
    if (monthlyFlow < 0) return 0;
    if (monthlyFlow >= target * 2) return 100;
    return Math.min(100, (monthlyFlow / (target * 2)) * 100);
  }

  scoreAppreciation(totalAppreciation, purchasePrice) {
    const appreciationRate = (totalAppreciation / purchasePrice) * 100;
    return Math.min(100, appreciationRate * 4); // 25% appreciation = 100 score
  }

  scoreCapRate(capRate, target) {
    if (capRate < target * 0.5) return 0;
    if (capRate >= target * 1.5) return 100;
    return ((capRate - target * 0.5) / (target * 1)) * 100;
  }

  identifyBestOptions(analyses) {
    const criteria = [
      { key: 'highest_cash_flow', metric: 'cash_flow_analysis.monthly_cash_flow', higher_better: true },
      { key: 'best_cap_rate', metric: 'return_metrics.cap_rate', higher_better: true },
      { key: 'highest_roi', metric: 'return_metrics.total_roi', higher_better: true },
      { key: 'best_value', metric: 'valuation_metrics.price_per_sqft', higher_better: false },
      { key: 'lowest_risk', metric: 'risk_metrics.break_even_occupancy', higher_better: false },
      { key: 'best_location', metric: 'location_analysis.average_score', higher_better: true }
    ];

    const bestOptions = {};

    criteria.forEach(criterion => {
      const values = analyses.map(a => ({
        property: a.name,
        value: this.getNestedValue(a, criterion.metric)
      })).filter(v => v.value !== null);

      if (values.length > 0) {
        values.sort((a, b) => criterion.higher_better ? b.value - a.value : a.value - b.value);
        
        bestOptions[criterion.key] = {
          property: values[0].property,
          value: values[0].value,
          runner_up: values[1] ? values[1].property : null,
          margin: values[1] ? Math.abs(values[0].value - values[1].value) : null
        };
      }
    });

    return bestOptions;
  }

  analyzeRiskReturn(analyses) {
    const riskReturnData = analyses.map(analysis => ({
      property: analysis.name,
      risk_score: this.calculateRiskScore(analysis),
      return_score: analysis.return_metrics.irr,
      efficiency_ratio: analysis.return_metrics.irr / this.calculateRiskScore(analysis)
    }));

    // Identify efficient frontier
    riskReturnData.sort((a, b) => a.risk_score - b.risk_score);
    
    const efficientFrontier = [];
    let maxReturn = -Infinity;
    
    riskReturnData.forEach(property => {
      if (property.return_score > maxReturn) {
        maxReturn = property.return_score;
        efficientFrontier.push(property.property);
      }
    });

    return {
      risk_return_profiles: riskReturnData,
      efficient_frontier: efficientFrontier,
      risk_adjusted_ranking: [...riskReturnData].sort((a, b) => b.efficiency_ratio - a.efficiency_ratio)
    };
  }

  calculateRiskScore(analysis) {
    const factors = {
      leverage: analysis.risk_metrics.leverage_ratio / 100 * 30, // 30% weight
      breakEven: analysis.risk_metrics.break_even_occupancy / 100 * 30, // 30% weight
      cashFlowMargin: (100 - Math.abs(analysis.risk_metrics.cash_flow_margin)) / 100 * 20, // 20% weight
      propertyAge: analysis.basic_info.property_age ? Math.min(analysis.basic_info.property_age / 50, 1) * 20 : 10 // 20% weight
    };

    return Object.values(factors).reduce((sum, factor) => sum + factor, 0);
  }

  compareSensitivity(properties, interestRate, loanTermYears) {
    const variables = ['monthly_rent', 'vacancy_rate', 'interest_rate'];
    const variations = [-10, 0, 10]; // -10%, base, +10%
    
    const sensitivities = {};

    properties.forEach(property => {
      sensitivities[property.name] = {};

      variables.forEach(variable => {
        const results = variations.map(variation => {
          const modifiedProperty = { ...property };
          
          switch (variable) {
            case 'monthly_rent':
              modifiedProperty.monthly_rent = property.monthly_rent * (1 + variation / 100);
              break;
            case 'vacancy_rate':
              modifiedProperty.vacancy_rate = Math.max(0, property.vacancy_rate + variation);
              break;
            case 'interest_rate':
              // This affects the loan terms, not the property
              const modifiedRate = interestRate * (1 + variation / 100);
              return this.analyzeProperty(modifiedProperty, modifiedRate, loanTermYears, 5);
          }

          if (variable !== 'interest_rate') {
            return this.analyzeProperty(modifiedProperty, interestRate, loanTermYears, 5);
          }
        });

        // Calculate sensitivity metrics
        const baselineIndex = variations.indexOf(0);
        const baseline = results[baselineIndex];
        
        sensitivities[property.name][variable] = {
          impact_on_cash_flow: results.map((r, i) => ({
            variation: variations[i],
            cash_flow: r.cash_flow_analysis.monthly_cash_flow,
            change: r.cash_flow_analysis.monthly_cash_flow - baseline.cash_flow_analysis.monthly_cash_flow
          })),
          elasticity: this.calculateElasticity(results, variations, 'cash_flow_analysis.monthly_cash_flow')
        };
      });
    });

    return sensitivities;
  }

  calculateElasticity(results, variations, metricPath) {
    const baselineIndex = variations.indexOf(0);
    if (baselineIndex === -1) return 0;

    const baseValue = this.getNestedValue(results[baselineIndex], metricPath);
    if (baseValue === 0) return 0;

    let totalElasticity = 0;
    let count = 0;

    variations.forEach((variation, i) => {
      if (variation !== 0) {
        const value = this.getNestedValue(results[i], metricPath);
        const percentChange = ((value - baseValue) / baseValue) * 100;
        totalElasticity += Math.abs(percentChange / variation);
        count++;
      }
    });

    return count > 0 ? totalElasticity / count : 0;
  }

  compareTimelines(analyses, holdingPeriod) {
    const timeline = [];

    for (let year = 1; year <= holdingPeriod; year++) {
      const yearData = {
        year: year,
        properties: {}
      };

      analyses.forEach(analysis => {
        const annualCashFlow = analysis.cash_flow_analysis.annual_cash_flow;
        const cumulativeCashFlow = annualCashFlow * year;
        const appreciatedValue = analysis.basic_info.purchase_price * 
          Math.pow(1.03, year); // Assuming 3% appreciation
        const equity = appreciatedValue - analysis.basic_info.loan_amount; // Simplified

        yearData.properties[analysis.name] = {
          annual_cash_flow: annualCashFlow,
          cumulative_cash_flow: cumulativeCashFlow,
          property_value: appreciatedValue,
          equity: equity,
          total_return: cumulativeCashFlow + equity - analysis.basic_info.total_cash_invested
        };
      });

      timeline.push(yearData);
    }

    return timeline;
  }

  generateInsights(analyses, rankings, bestOptions) {
    const insights = [];

    // Top performer insight
    const topProperty = rankings[0];
    insights.push({
      type: 'Top Performer',
      message: `${topProperty.property} ranks highest with a weighted score of ${topProperty.weighted_score}`,
      details: `Excels in: ${Object.entries(topProperty.individual_scores)
        .filter(([_, score]) => score > 80)
        .map(([metric, _]) => metric)
        .join(', ')}`
    });

    // Value proposition
    const bestValue = bestOptions.best_value;
    if (bestValue) {
      insights.push({
        type: 'Best Value',
        message: `${bestValue.property} offers the best value at $${bestValue.value}/sq ft`,
        details: bestValue.runner_up ? 
          `${((bestValue.margin / bestValue.value) * 100).toFixed(1)}% cheaper than runner-up` : null
      });
    }

    // Cash flow comparison
    const cashFlowRange = analyses.map(a => a.cash_flow_analysis.monthly_cash_flow);
    const cashFlowSpread = Math.max(...cashFlowRange) - Math.min(...cashFlowRange);
    if (cashFlowSpread > 500) {
      insights.push({
        type: 'Cash Flow Variance',
        message: `Significant cash flow spread of $${cashFlowSpread.toFixed(0)} between properties`,
        details: 'Consider your cash flow requirements carefully'
      });
    }

    // Risk insight
    const riskRange = analyses.map(a => a.risk_metrics.break_even_occupancy);
    const highestRisk = Math.max(...riskRange);
    if (highestRisk > 85) {
      const riskyProperty = analyses.find(a => a.risk_metrics.break_even_occupancy === highestRisk);
      insights.push({
        type: 'Risk Alert',
        message: `${riskyProperty.name} requires ${highestRisk.toFixed(1)}% occupancy to break even`,
        details: 'Limited margin for vacancy or expense increases'
      });
    }

    // 1% rule insight
    const meetingOnePercent = analyses.filter(a => a.valuation_metrics.meets_one_percent);
    if (meetingOnePercent.length > 0) {
      insights.push({
        type: 'Investment Rule',
        message: `${meetingOnePercent.length} propert${meetingOnePercent.length > 1 ? 'ies' : 'y'} meet the 1% rule`,
        details: meetingOnePercent.map(a => a.name).join(', ')
      });
    }

    return insights;
  }

  generateRecommendations(rankings, analyses, targetCashFlow, targetCapRate) {
    const recommendations = [];

    // Top recommendation
    const topProperty = rankings[0];
    if (topProperty.meets_criteria.cash_flow && topProperty.meets_criteria.cap_rate) {
      recommendations.push({
        type: 'Strong Buy',
        property: topProperty.property,
        reason: 'Highest overall score and meets all investment criteria',
        action: 'Proceed with detailed due diligence'
      });
    } else {
      recommendations.push({
        type: 'Qualified Buy',
        property: topProperty.property,
        reason: `Highest score but ${!topProperty.meets_criteria.cash_flow ? 'below target cash flow' : 'below target cap rate'}`,
        action: 'Negotiate better terms or adjust expectations'
      });
    }

    // Alternative recommendations
    if (rankings.length > 1) {
      const alternative = rankings[1];
      if (alternative.weighted_score > 70) {
        recommendations.push({
          type: 'Strong Alternative',
          property: alternative.property,
          reason: `Close second with ${alternative.weighted_score} score`,
          action: 'Consider if primary choice falls through'
        });
      }
    }

    // Specific strategy recommendations
    analyses.forEach(analysis => {
      if (analysis.cash_flow_analysis.monthly_cash_flow < 0) {
        recommendations.push({
          type: 'Cash Flow Warning',
          property: analysis.name,
          reason: 'Negative monthly cash flow',
          action: 'Only consider if strong appreciation expected'
        });
      }

      if (analysis.return_metrics.irr > 20) {
        recommendations.push({
          type: 'High Return Opportunity',
          property: analysis.name,
          reason: `Exceptional ${analysis.return_metrics.irr.toFixed(1)}% IRR`,
          action: 'Verify assumptions and move quickly'
        });
      }
    });

    // Portfolio strategy
    if (rankings.length >= 3) {
      const diversified = rankings.slice(0, 3).filter(r => r.weighted_score > 60);
      if (diversified.length >= 2) {
        recommendations.push({
          type: 'Portfolio Strategy',
          property: 'Multiple Properties',
          reason: 'Consider diversifying across top properties',
          action: `Split investment between ${diversified.map(d => d.property).join(' and ')}`
        });
      }
    }

    return recommendations;
  }
}