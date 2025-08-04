export class BreakevenCalculator {
  constructor() {
    this.name = 'Breakeven Analysis Calculator';
    this.description = 'Calculate breakeven points for real estate investments';
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        property_costs: {
          type: 'object',
          description: 'Fixed and variable property costs',
          properties: {
            purchase_price: {
              type: 'number',
              description: 'Total property purchase price',
              minimum: 0
            },
            renovation_costs: {
              type: 'number',
              description: 'Initial renovation/improvement costs',
              minimum: 0,
              default: 0
            },
            closing_costs: {
              type: 'number',
              description: 'Purchase closing costs',
              minimum: 0,
              default: 0
            },
            down_payment: {
              type: 'number',
              description: 'Down payment amount',
              minimum: 0
            }
          },
          required: ['purchase_price', 'down_payment']
        },
        fixed_costs: {
          type: 'object',
          description: 'Monthly fixed costs',
          properties: {
            mortgage_payment: {
              type: 'number',
              description: 'Monthly mortgage payment (P&I)',
              minimum: 0,
              default: 0
            },
            property_tax: {
              type: 'number',
              description: 'Monthly property tax',
              minimum: 0,
              default: 0
            },
            insurance: {
              type: 'number',
              description: 'Monthly insurance premium',
              minimum: 0,
              default: 0
            },
            hoa_fees: {
              type: 'number',
              description: 'Monthly HOA fees',
              minimum: 0,
              default: 0
            },
            property_management: {
              type: 'number',
              description: 'Monthly property management fee',
              minimum: 0,
              default: 0
            }
          }
        },
        variable_costs: {
          type: 'object',
          description: 'Variable costs (per unit or percentage)',
          properties: {
            utilities_per_unit: {
              type: 'number',
              description: 'Monthly utilities per occupied unit',
              minimum: 0,
              default: 0
            },
            maintenance_percent: {
              type: 'number',
              description: 'Maintenance as % of rental income',
              minimum: 0,
              maximum: 30,
              default: 5
            },
            vacancy_rate: {
              type: 'number',
              description: 'Expected vacancy rate (%)',
              minimum: 0,
              maximum: 50,
              default: 5
            },
            management_percent: {
              type: 'number',
              description: 'Property management as % of rent (if not fixed)',
              minimum: 0,
              maximum: 20,
              default: 0
            }
          }
        },
        revenue_streams: {
          type: 'object',
          description: 'Property revenue sources',
          properties: {
            monthly_rent_per_unit: {
              type: 'number',
              description: 'Monthly rent per unit',
              minimum: 0
            },
            total_units: {
              type: 'number',
              description: 'Total number of rentable units',
              minimum: 1,
              default: 1
            },
            other_monthly_income: {
              type: 'number',
              description: 'Other monthly income (parking, laundry, etc.)',
              minimum: 0,
              default: 0
            },
            annual_rent_increase: {
              type: 'number',
              description: 'Expected annual rent increase (%)',
              minimum: 0,
              maximum: 20,
              default: 3
            }
          },
          required: ['monthly_rent_per_unit']
        },
        analysis_parameters: {
          type: 'object',
          description: 'Analysis parameters',
          properties: {
            target_cash_flow: {
              type: 'number',
              description: 'Target monthly cash flow',
              minimum: 0,
              default: 0
            },
            analysis_period_years: {
              type: 'number',
              description: 'Years to analyze',
              minimum: 1,
              maximum: 30,
              default: 10
            },
            include_appreciation: {
              type: 'boolean',
              description: 'Include property appreciation in ROI',
              default: false
            },
            appreciation_rate: {
              type: 'number',
              description: 'Annual appreciation rate (%)',
              minimum: 0,
              maximum: 20,
              default: 3
            }
          }
        }
      },
      required: ['property_costs', 'revenue_streams']
    };
  }

  calculate(params) {
    const {
      property_costs,
      fixed_costs = {},
      variable_costs = {},
      revenue_streams,
      analysis_parameters = {}
    } = params;

    // Calculate total initial investment
    const total_initial_investment = this.calculateInitialInvestment(property_costs);

    // Calculate monthly fixed costs
    const monthly_fixed_costs = this.calculateMonthlyFixedCosts(fixed_costs);

    // Calculate breakeven occupancy
    const breakeven_occupancy = this.calculateBreakevenOccupancy(
      revenue_streams,
      monthly_fixed_costs,
      variable_costs
    );

    // Calculate breakeven rent
    const breakeven_rent = this.calculateBreakevenRent(
      monthly_fixed_costs,
      variable_costs,
      revenue_streams
    );

    // Calculate time to positive cash flow
    const time_to_positive_cashflow = this.calculateTimeToPositiveCashflow(
      total_initial_investment,
      revenue_streams,
      monthly_fixed_costs,
      variable_costs
    );

    // Calculate ROI breakeven
    const roi_breakeven = this.calculateROIBreakeven(
      total_initial_investment,
      revenue_streams,
      monthly_fixed_costs,
      variable_costs,
      analysis_parameters
    );

    // Sensitivity analysis
    const sensitivity = this.performSensitivityAnalysis(
      revenue_streams,
      monthly_fixed_costs,
      variable_costs,
      breakeven_occupancy.occupancy_rate
    );

    // Multi-year projection
    const projection = this.createMultiYearProjection(
      revenue_streams,
      monthly_fixed_costs,
      variable_costs,
      analysis_parameters,
      total_initial_investment
    );

    // Target analysis
    const target_analysis = this.analyzeTargetCashFlow(
      revenue_streams,
      monthly_fixed_costs,
      variable_costs,
      analysis_parameters.target_cash_flow || 0
    );

    // Risk assessment
    const risk_assessment = this.assessRisk(
      breakeven_occupancy.occupancy_rate,
      sensitivity,
      revenue_streams
    );

    return {
      initial_investment: {
        down_payment: property_costs.down_payment,
        closing_costs: property_costs.closing_costs || 0,
        renovation_costs: property_costs.renovation_costs || 0,
        total_cash_required: parseFloat(total_initial_investment.toFixed(2))
      },
      cost_analysis: {
        monthly_fixed_costs: parseFloat(monthly_fixed_costs.toFixed(2)),
        fixed_cost_breakdown: this.formatCostBreakdown(fixed_costs),
        variable_cost_factors: {
          maintenance_rate: variable_costs.maintenance_percent || 5,
          vacancy_rate: variable_costs.vacancy_rate || 5,
          management_rate: variable_costs.management_percent || 0
        }
      },
      breakeven_analysis: {
        occupancy_breakeven: breakeven_occupancy,
        rent_breakeven: breakeven_rent,
        time_to_positive_cashflow: time_to_positive_cashflow,
        roi_breakeven: roi_breakeven
      },
      current_performance: this.calculateCurrentPerformance(
        revenue_streams,
        monthly_fixed_costs,
        variable_costs
      ),
      sensitivity_analysis: sensitivity,
      target_analysis: target_analysis,
      multi_year_projection: projection,
      risk_assessment: risk_assessment,
      recommendations: this.generateRecommendations(
        breakeven_occupancy.occupancy_rate,
        time_to_positive_cashflow,
        risk_assessment,
        target_analysis
      )
    };
  }

  calculateInitialInvestment(costs) {
    return costs.down_payment + 
           (costs.closing_costs || 0) + 
           (costs.renovation_costs || 0);
  }

  calculateMonthlyFixedCosts(fixed) {
    return Object.values(fixed).reduce((sum, cost) => sum + (cost || 0), 0);
  }

  calculateBreakevenOccupancy(revenue, fixedCosts, variableCosts) {
    const rentPerUnit = revenue.monthly_rent_per_unit;
    const totalUnits = revenue.total_units || 1;
    const otherIncome = revenue.other_monthly_income || 0;
    
    // Variable costs as percentage of revenue
    const maintenanceRate = (variableCosts.maintenance_percent || 5) / 100;
    const managementRate = (variableCosts.management_percent || 0) / 100;
    const utilitiesPerUnit = variableCosts.utilities_per_unit || 0;

    // Net revenue per occupied unit after variable costs
    const netRevenuePerUnit = rentPerUnit * (1 - maintenanceRate - managementRate) - utilitiesPerUnit;
    
    // Units needed to cover fixed costs
    const unitsNeeded = (fixedCosts - otherIncome) / netRevenuePerUnit;
    const occupancyRate = (unitsNeeded / totalUnits) * 100;

    return {
      occupancy_rate: parseFloat(Math.min(100, occupancyRate).toFixed(1)),
      units_needed: parseFloat(unitsNeeded.toFixed(2)),
      total_units: totalUnits,
      feasible: occupancyRate <= 100,
      margin: parseFloat((100 - occupancyRate).toFixed(1))
    };
  }

  calculateBreakevenRent(fixedCosts, variableCosts, revenue) {
    const totalUnits = revenue.total_units || 1;
    const otherIncome = revenue.other_monthly_income || 0;
    const targetOccupancy = 1 - (variableCosts.vacancy_rate || 5) / 100;
    
    const maintenanceRate = (variableCosts.maintenance_percent || 5) / 100;
    const managementRate = (variableCosts.management_percent || 0) / 100;
    const utilitiesPerUnit = variableCosts.utilities_per_unit || 0;

    // Rent needed per unit to break even
    const effectiveUnits = totalUnits * targetOccupancy;
    const revenueNeeded = fixedCosts - otherIncome + (utilitiesPerUnit * effectiveUnits);
    const rentBeforeVariableCosts = revenueNeeded / effectiveUnits;
    const breakevenRent = rentBeforeVariableCosts / (1 - maintenanceRate - managementRate);

    const currentRent = revenue.monthly_rent_per_unit;
    const difference = breakevenRent - currentRent;
    const percentDifference = (difference / currentRent) * 100;

    return {
      breakeven_rent: parseFloat(breakevenRent.toFixed(2)),
      current_rent: currentRent,
      difference: parseFloat(difference.toFixed(2)),
      percent_difference: parseFloat(percentDifference.toFixed(1)),
      achievable: currentRent >= breakevenRent
    };
  }

  calculateTimeToPositiveCashflow(initialInvestment, revenue, fixedCosts, variableCosts) {
    const monthlyRent = revenue.monthly_rent_per_unit * (revenue.total_units || 1);
    const otherIncome = revenue.other_monthly_income || 0;
    const vacancyRate = (variableCosts.vacancy_rate || 5) / 100;
    const maintenanceRate = (variableCosts.maintenance_percent || 5) / 100;
    const managementRate = (variableCosts.management_percent || 0) / 100;

    const effectiveIncome = (monthlyRent + otherIncome) * (1 - vacancyRate);
    const variableExpenses = effectiveIncome * (maintenanceRate + managementRate) + 
                           (variableCosts.utilities_per_unit || 0) * (revenue.total_units || 1);
    const monthlyCashFlow = effectiveIncome - fixedCosts - variableExpenses;

    if (monthlyCashFlow <= 0) {
      return {
        months: null,
        years: null,
        monthly_cash_flow: parseFloat(monthlyCashFlow.toFixed(2)),
        achievable: false,
        explanation: "Property has negative cash flow"
      };
    }

    const monthsToRecover = initialInvestment / monthlyCashFlow;

    return {
      months: Math.ceil(monthsToRecover),
      years: parseFloat((monthsToRecover / 12).toFixed(1)),
      monthly_cash_flow: parseFloat(monthlyCashFlow.toFixed(2)),
      achievable: true,
      total_to_recover: initialInvestment
    };
  }

  calculateROIBreakeven(initialInvestment, revenue, fixedCosts, variableCosts, parameters) {
    const includeAppreciation = parameters.include_appreciation || false;
    const appreciationRate = (parameters.appreciation_rate || 3) / 100;
    const propertyValue = initialInvestment * 4; // Rough estimate

    let cumulativeReturn = 0;
    let month = 0;

    // Calculate monthly cash flow
    const monthlyRent = revenue.monthly_rent_per_unit * (revenue.total_units || 1);
    const otherIncome = revenue.other_monthly_income || 0;
    const vacancyRate = (variableCosts.vacancy_rate || 5) / 100;
    const effectiveIncome = (monthlyRent + otherIncome) * (1 - vacancyRate);
    
    const maintenanceRate = (variableCosts.maintenance_percent || 5) / 100;
    const managementRate = (variableCosts.management_percent || 0) / 100;
    const variableExpenses = effectiveIncome * (maintenanceRate + managementRate);
    
    const monthlyCashFlow = effectiveIncome - fixedCosts - variableExpenses;

    while (cumulativeReturn < initialInvestment && month < 360) { // Max 30 years
      month++;
      cumulativeReturn += monthlyCashFlow;
      
      if (includeAppreciation && month % 12 === 0) {
        const years = month / 12;
        const appreciatedValue = propertyValue * Math.pow(1 + appreciationRate, years);
        const appreciationGain = appreciatedValue - propertyValue;
        // Only count realized appreciation if we're looking at exit
        if (month === 60 || month === 120) { // 5 or 10 year marks
          cumulativeReturn += appreciationGain * 0.1; // Assume 10% of appreciation is accessible
        }
      }
    }

    const breakevenYears = month / 12;
    const annualizedROI = month > 0 ? (cumulativeReturn / initialInvestment / breakevenYears) * 100 : 0;

    return {
      months_to_100_percent_roi: month < 360 ? month : null,
      years_to_100_percent_roi: month < 360 ? parseFloat(breakevenYears.toFixed(1)) : null,
      achievable: month < 360,
      annualized_roi_at_breakeven: parseFloat(annualizedROI.toFixed(2)),
      includes_appreciation: includeAppreciation
    };
  }

  performSensitivityAnalysis(revenue, fixedCosts, variableCosts, baseOccupancy) {
    const scenarios = [];

    // Rent sensitivity
    const rentChanges = [-20, -10, -5, 0, 5, 10, 20];
    rentChanges.forEach(change => {
      const adjustedRevenue = {
        ...revenue,
        monthly_rent_per_unit: revenue.monthly_rent_per_unit * (1 + change / 100)
      };
      const result = this.calculateBreakevenOccupancy(adjustedRevenue, fixedCosts, variableCosts);
      
      scenarios.push({
        variable: 'Rent',
        change: `${change > 0 ? '+' : ''}${change}%`,
        breakeven_occupancy: result.occupancy_rate,
        impact: parseFloat((result.occupancy_rate - baseOccupancy).toFixed(1))
      });
    });

    // Fixed cost sensitivity
    const costChanges = [-20, -10, 0, 10, 20, 30];
    costChanges.forEach(change => {
      const adjustedFixed = fixedCosts * (1 + change / 100);
      const result = this.calculateBreakevenOccupancy(revenue, adjustedFixed, variableCosts);
      
      scenarios.push({
        variable: 'Fixed Costs',
        change: `${change > 0 ? '+' : ''}${change}%`,
        breakeven_occupancy: result.occupancy_rate,
        impact: parseFloat((result.occupancy_rate - baseOccupancy).toFixed(1))
      });
    });

    // Find most sensitive variable
    const rentSensitivity = Math.abs(scenarios.find(s => s.variable === 'Rent' && s.change === '+10%').impact);
    const costSensitivity = Math.abs(scenarios.find(s => s.variable === 'Fixed Costs' && s.change === '+10%').impact);

    return {
      scenarios: scenarios,
      most_sensitive_to: rentSensitivity > costSensitivity ? 'Rent Changes' : 'Cost Changes',
      rent_elasticity: parseFloat((rentSensitivity / 10).toFixed(2)), // % change in breakeven per 1% rent change
      cost_elasticity: parseFloat((costSensitivity / 10).toFixed(2))
    };
  }

  calculateCurrentPerformance(revenue, fixedCosts, variableCosts) {
    const monthlyRent = revenue.monthly_rent_per_unit * (revenue.total_units || 1);
    const otherIncome = revenue.other_monthly_income || 0;
    const grossIncome = monthlyRent + otherIncome;
    
    const vacancyRate = (variableCosts.vacancy_rate || 5) / 100;
    const effectiveIncome = grossIncome * (1 - vacancyRate);
    
    const maintenanceRate = (variableCosts.maintenance_percent || 5) / 100;
    const managementRate = (variableCosts.management_percent || 0) / 100;
    const variableExpenses = effectiveIncome * (maintenanceRate + managementRate) + 
                           (variableCosts.utilities_per_unit || 0) * (revenue.total_units || 1);
    
    const totalExpenses = fixedCosts + variableExpenses;
    const noi = effectiveIncome - totalExpenses;
    const operatingMargin = (noi / effectiveIncome) * 100;

    return {
      gross_monthly_income: parseFloat(grossIncome.toFixed(2)),
      effective_monthly_income: parseFloat(effectiveIncome.toFixed(2)),
      total_monthly_expenses: parseFloat(totalExpenses.toFixed(2)),
      net_operating_income: parseFloat(noi.toFixed(2)),
      operating_margin: parseFloat(operatingMargin.toFixed(1)),
      expense_ratio: parseFloat(((totalExpenses / effectiveIncome) * 100).toFixed(1))
    };
  }

  createMultiYearProjection(revenue, fixedCosts, variableCosts, parameters, initialInvestment) {
    const years = parameters.analysis_period_years || 10;
    const rentGrowth = (revenue.annual_rent_increase || 3) / 100;
    const expenseGrowth = 0.025; // 2.5% expense growth
    const projection = [];

    let currentRent = revenue.monthly_rent_per_unit;
    let currentFixed = fixedCosts;
    let cumulativeCashFlow = -initialInvestment;

    for (let year = 1; year <= years; year++) {
      if (year > 1) {
        currentRent *= (1 + rentGrowth);
        currentFixed *= (1 + expenseGrowth);
      }

      const annualRent = currentRent * (revenue.total_units || 1) * 12;
      const annualOther = (revenue.other_monthly_income || 0) * 12;
      const vacancyLoss = annualRent * ((variableCosts.vacancy_rate || 5) / 100);
      const effectiveIncome = annualRent + annualOther - vacancyLoss;
      
      const annualFixed = currentFixed * 12;
      const annualVariable = effectiveIncome * ((variableCosts.maintenance_percent || 5) / 100 + 
                                                 (variableCosts.management_percent || 0) / 100);
      
      const annualCashFlow = effectiveIncome - annualFixed - annualVariable;
      cumulativeCashFlow += annualCashFlow;

      projection.push({
        year: year,
        annual_income: parseFloat(effectiveIncome.toFixed(2)),
        annual_expenses: parseFloat((annualFixed + annualVariable).toFixed(2)),
        annual_cash_flow: parseFloat(annualCashFlow.toFixed(2)),
        cumulative_cash_flow: parseFloat(cumulativeCashFlow.toFixed(2)),
        roi_to_date: parseFloat(((cumulativeCashFlow / initialInvestment) * 100).toFixed(2))
      });
    }

    return projection;
  }

  analyzeTargetCashFlow(revenue, fixedCosts, variableCosts, targetCashFlow) {
    if (targetCashFlow === 0) {
      return null;
    }

    // Calculate current cash flow
    const current = this.calculateCurrentPerformance(revenue, fixedCosts, variableCosts);
    const currentCashFlow = current.net_operating_income;
    const gap = targetCashFlow - currentCashFlow;

    if (currentCashFlow >= targetCashFlow) {
      return {
        target_achieved: true,
        current_cash_flow: currentCashFlow,
        target_cash_flow: targetCashFlow,
        surplus: parseFloat((currentCashFlow - targetCashFlow).toFixed(2))
      };
    }

    // Calculate what's needed to reach target
    const rentIncrease = (gap / ((revenue.total_units || 1) * (1 - (variableCosts.vacancy_rate || 5) / 100))) / 
                        (1 - (variableCosts.maintenance_percent || 5) / 100 - (variableCosts.management_percent || 0) / 100);
    const rentIncreasePercent = (rentIncrease / revenue.monthly_rent_per_unit) * 100;

    // Or expense reduction needed
    const expenseReduction = gap;
    const expenseReductionPercent = (expenseReduction / (fixedCosts + current.total_monthly_expenses - fixedCosts)) * 100;

    return {
      target_achieved: false,
      current_cash_flow: currentCashFlow,
      target_cash_flow: targetCashFlow,
      gap: parseFloat(gap.toFixed(2)),
      rent_increase_needed: parseFloat(rentIncrease.toFixed(2)),
      rent_increase_percent: parseFloat(rentIncreasePercent.toFixed(1)),
      expense_reduction_needed: parseFloat(expenseReduction.toFixed(2)),
      expense_reduction_percent: parseFloat(expenseReductionPercent.toFixed(1))
    };
  }

  assessRisk(breakevenOccupancy, sensitivity, revenue) {
    const riskFactors = [];
    let riskScore = 0;

    // Occupancy risk
    if (breakevenOccupancy > 90) {
      riskFactors.push({
        factor: 'High Breakeven Occupancy',
        severity: 'High',
        description: 'Little margin for vacancy'
      });
      riskScore += 3;
    } else if (breakevenOccupancy > 80) {
      riskFactors.push({
        factor: 'Moderate Breakeven Occupancy',
        severity: 'Medium',
        description: 'Limited vacancy cushion'
      });
      riskScore += 2;
    }

    // Sensitivity risk
    if (sensitivity.rent_elasticity > 1.5) {
      riskFactors.push({
        factor: 'High Rent Sensitivity',
        severity: 'High',
        description: 'Small rent changes have large impact'
      });
      riskScore += 2;
    }

    // Concentration risk
    if ((revenue.total_units || 1) === 1) {
      riskFactors.push({
        factor: 'Single Unit Risk',
        severity: 'Medium',
        description: 'All income from one tenant'
      });
      riskScore += 2;
    }

    let overallRisk;
    if (riskScore >= 5) {
      overallRisk = 'High Risk';
    } else if (riskScore >= 3) {
      overallRisk = 'Moderate Risk';
    } else {
      overallRisk = 'Low Risk';
    }

    return {
      overall_risk: overallRisk,
      risk_score: riskScore,
      risk_factors: riskFactors,
      breakeven_margin: parseFloat((100 - breakevenOccupancy).toFixed(1))
    };
  }

  formatCostBreakdown(costs) {
    const breakdown = [];
    const costNames = {
      mortgage_payment: 'Mortgage Payment',
      property_tax: 'Property Tax',
      insurance: 'Insurance',
      hoa_fees: 'HOA Fees',
      property_management: 'Property Management'
    };

    const total = Object.values(costs).reduce((sum, cost) => sum + (cost || 0), 0);

    Object.entries(costs).forEach(([key, value]) => {
      if (value > 0) {
        breakdown.push({
          category: costNames[key] || key,
          monthly_amount: value,
          annual_amount: value * 12,
          percentage: total > 0 ? parseFloat(((value / total) * 100).toFixed(1)) : 0
        });
      }
    });

    return breakdown.sort((a, b) => b.monthly_amount - a.monthly_amount);
  }

  generateRecommendations(breakevenOccupancy, timeToPositive, riskAssessment, targetAnalysis) {
    const recommendations = [];

    // Breakeven occupancy recommendations
    if (breakevenOccupancy > 90) {
      recommendations.push({
        type: 'Warning',
        category: 'Occupancy',
        message: `High breakeven occupancy of ${breakevenOccupancy}%`,
        action: 'Consider reducing costs or increasing rents to improve margin'
      });
    } else if (breakevenOccupancy < 70) {
      recommendations.push({
        type: 'Positive',
        category: 'Occupancy',
        message: `Strong margin with ${breakevenOccupancy}% breakeven`,
        action: 'Good cushion for market downturns'
      });
    }

    // Time to positive cash flow
    if (!timeToPositive.achievable) {
      recommendations.push({
        type: 'Critical',
        category: 'Cash Flow',
        message: 'Property has negative cash flow',
        action: 'Restructure financing or improve revenue to achieve positive flow'
      });
    } else if (timeToPositive.years > 5) {
      recommendations.push({
        type: 'Caution',
        category: 'ROI Timeline',
        message: `Long ${timeToPositive.years} year payback period`,
        action: 'Consider if you have sufficient liquidity for this timeline'
      });
    }

    // Risk recommendations
    if (riskAssessment.overall_risk === 'High Risk') {
      recommendations.push({
        type: 'Risk Alert',
        category: 'Overall Risk',
        message: 'Multiple high-risk factors identified',
        action: 'Build larger reserves and have contingency plans'
      });
    }

    // Target achievement
    if (targetAnalysis && !targetAnalysis.target_achieved) {
      if (targetAnalysis.rent_increase_percent < 10) {
        recommendations.push({
          type: 'Opportunity',
          category: 'Target Achievement',
          message: `Only ${targetAnalysis.rent_increase_percent}% rent increase needed`,
          action: 'Target is achievable with modest rent growth'
        });
      }
    }

    // General optimization
    recommendations.push({
      type: 'Best Practice',
      category: 'Optimization',
      message: 'Regular review of expenses and rents',
      action: 'Annual analysis to maintain healthy margins'
    });

    return recommendations;
  }
}