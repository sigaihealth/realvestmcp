export class PropertyManagementCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        property_details: {
          type: 'object',
          properties: {
            property_type: { 
              type: 'string', 
              enum: ['single_family', 'duplex', 'triplex', 'fourplex', 'small_multifamily', 'large_multifamily', 'commercial', 'mixed_use'] 
            },
            total_units: { type: 'integer', minimum: 1, maximum: 1000 },
            property_value: { type: 'number', minimum: 0 },
            monthly_rent_per_unit: { type: 'number', minimum: 0 },
            property_age_years: { type: 'integer', minimum: 0, maximum: 200 },
            property_condition: { 
              type: 'string', 
              enum: ['excellent', 'good', 'fair', 'poor', 'needs_major_repair'] 
            },
            location_grade: { 
              type: 'string', 
              enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D'] 
            },
            tenant_quality: { 
              type: 'string', 
              enum: ['excellent', 'good', 'average', 'below_average', 'problematic'] 
            }
          },
          required: ['property_type', 'total_units', 'property_value', 'monthly_rent_per_unit']
        },
        management_options: {
          type: 'object',
          properties: {
            self_management: {
              type: 'object',
              properties: {
                owner_hourly_rate: { type: 'number', minimum: 0, maximum: 200 },
                estimated_hours_per_month: { type: 'number', minimum: 0, maximum: 200 },
                owner_experience_level: { 
                  type: 'string', 
                  enum: ['beginner', 'intermediate', 'experienced', 'expert'] 
                }
              }
            },
            professional_management: {
              type: 'object',
              properties: {
                management_fee_percentage: { type: 'number', minimum: 0, maximum: 20 },
                setup_fee: { type: 'number', minimum: 0 },
                leasing_fee: { type: 'number', minimum: 0 },
                maintenance_markup: { type: 'number', minimum: 0, maximum: 50 },
                vacancy_guarantee: { type: 'boolean' },
                tenant_placement_guarantee: { type: 'boolean' },
                services_included: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['tenant_screening', 'rent_collection', 'maintenance_coordination', 
                           'property_inspections', 'financial_reporting', 'legal_compliance',
                           'marketing', 'lease_preparation', 'eviction_handling', '24_7_emergency']
                  }
                }
              }
            }
          }
        },
        operational_expenses: {
          type: 'object',
          properties: {
            property_taxes_annual: { type: 'number', minimum: 0 },
            insurance_annual: { type: 'number', minimum: 0 },
            utilities_monthly: { type: 'number', minimum: 0 },
            maintenance_budget_annual: { type: 'number', minimum: 0 },
            capital_improvements_annual: { type: 'number', minimum: 0 },
            landscaping_monthly: { type: 'number', minimum: 0 },
            pest_control_monthly: { type: 'number', minimum: 0 },
            cleaning_monthly: { type: 'number', minimum: 0 },
            other_expenses_monthly: { type: 'number', minimum: 0 }
          }
        },
        market_conditions: {
          type: 'object',
          properties: {
            vacancy_rate: { type: 'number', minimum: 0, maximum: 100 },
            average_tenant_turnover_months: { type: 'number', minimum: 1, maximum: 120 },
            local_rent_growth_rate: { type: 'number', minimum: -10, maximum: 20 },
            market_competition_level: { 
              type: 'string', 
              enum: ['very_low', 'low', 'moderate', 'high', 'very_high'] 
            }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            comparison_analysis: { type: 'boolean' },
            scenario_modeling: { type: 'boolean' },
            efficiency_optimization: { type: 'boolean' },
            risk_assessment: { type: 'boolean' },
            roi_analysis: { type: 'boolean' }
          }
        }
      },
      required: ['property_details']
    };
  }

  calculate(params) {
    const {
      property_details,
      management_options = {},
      operational_expenses = {},
      market_conditions = {},
      analysis_options = {}
    } = params;

    // Calculate baseline property metrics
    const propertyMetrics = this.calculatePropertyMetrics(property_details, operational_expenses, market_conditions);

    // Analyze self-management option
    const selfManagementAnalysis = this.analyzeSelfManagement(
      property_details, 
      management_options.self_management || {}, 
      propertyMetrics
    );

    // Analyze professional management option
    const professionalManagementAnalysis = this.analyzeProfessionalManagement(
      property_details, 
      management_options.professional_management || {}, 
      propertyMetrics
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      propertyMetrics,
      selfManagementAnalysis,
      professionalManagementAnalysis,
      property_details
    );

    // Optional analyses
    const comparisonAnalysis = analysis_options.comparison_analysis
      ? this.performComparisonAnalysis(selfManagementAnalysis, professionalManagementAnalysis)
      : null;

    const scenarioModeling = analysis_options.scenario_modeling
      ? this.performScenarioModeling(property_details, propertyMetrics)
      : null;

    const efficiencyOptimization = analysis_options.efficiency_optimization
      ? this.optimizeEfficiency(property_details, propertyMetrics)
      : null;

    const riskAssessment = analysis_options.risk_assessment
      ? this.assessRisks(property_details, propertyMetrics, market_conditions)
      : null;

    const roiAnalysis = analysis_options.roi_analysis
      ? this.analyzeROI(property_details, selfManagementAnalysis, professionalManagementAnalysis)
      : null;

    return {
      property_overview: {
        property_type: property_details.property_type,
        total_units: property_details.total_units,
        property_value: property_details.property_value,
        monthly_gross_rent: propertyMetrics.monthly_gross_rent,
        annual_gross_rent: propertyMetrics.annual_gross_rent,
        gross_rent_multiplier: propertyMetrics.gross_rent_multiplier,
        cap_rate_estimate: propertyMetrics.estimated_cap_rate
      },
      self_management: selfManagementAnalysis,
      professional_management: professionalManagementAnalysis,
      cost_benefit_analysis: {
        monthly_cost_difference: professionalManagementAnalysis.monthly_cost - selfManagementAnalysis.monthly_cost,
        annual_cost_difference: professionalManagementAnalysis.annual_cost - selfManagementAnalysis.annual_cost,
        breakeven_analysis: this.calculateBreakevenAnalysis(selfManagementAnalysis, professionalManagementAnalysis),
        value_proposition: this.calculateValueProposition(selfManagementAnalysis, professionalManagementAnalysis)
      },
      recommendations,
      comparison_analysis: comparisonAnalysis,
      scenario_modeling: scenarioModeling,
      efficiency_optimization: efficiencyOptimization,
      risk_assessment: riskAssessment,
      roi_analysis: roiAnalysis
    };
  }

  calculatePropertyMetrics(propertyDetails, operationalExpenses, marketConditions) {
    const monthlyRentPerUnit = propertyDetails.monthly_rent_per_unit;
    const totalUnits = propertyDetails.total_units;
    const monthlyGrossRent = monthlyRentPerUnit * totalUnits;
    const annualGrossRent = monthlyGrossRent * 12;

    // Calculate vacancy-adjusted income
    const vacancyRate = (marketConditions.vacancy_rate || 5) / 100;
    const effectiveGrossIncome = annualGrossRent * (1 - vacancyRate);

    // Calculate operating expenses
    const annualOperatingExpenses = this.calculateAnnualOperatingExpenses(operationalExpenses, totalUnits);
    const netOperatingIncome = effectiveGrossIncome - annualOperatingExpenses;

    // Property metrics
    const grossRentMultiplier = propertyDetails.property_value / annualGrossRent;
    const estimatedCapRate = (netOperatingIncome / propertyDetails.property_value) * 100;

    return {
      monthly_gross_rent: monthlyGrossRent,
      annual_gross_rent: annualGrossRent,
      effective_gross_income: effectiveGrossIncome,
      annual_operating_expenses: annualOperatingExpenses,
      net_operating_income: netOperatingIncome,
      gross_rent_multiplier: grossRentMultiplier,
      estimated_cap_rate: estimatedCapRate,
      vacancy_rate: vacancyRate * 100
    };
  }

  calculateAnnualOperatingExpenses(expenses, totalUnits) {
    const {
      property_taxes_annual = 0,
      insurance_annual = 0,
      utilities_monthly = 0,
      maintenance_budget_annual = 0,
      capital_improvements_annual = 0,
      landscaping_monthly = 0,
      pest_control_monthly = 0,
      cleaning_monthly = 0,
      other_expenses_monthly = 0
    } = expenses;

    const monthlyExpenses = utilities_monthly + landscaping_monthly + pest_control_monthly + 
                           cleaning_monthly + other_expenses_monthly;

    return property_taxes_annual + insurance_annual + (monthlyExpenses * 12) + 
           maintenance_budget_annual + capital_improvements_annual;
  }

  analyzeSelfManagement(propertyDetails, selfManagementOptions, propertyMetrics) {
    const ownerHourlyRate = selfManagementOptions.owner_hourly_rate || 50;
    const estimatedHoursPerMonth = selfManagementOptions.estimated_hours_per_month || 
                                  this.estimateManagementHours(propertyDetails);
    const experienceLevel = selfManagementOptions.owner_experience_level || 'intermediate';

    // Calculate time costs
    const monthlyTimeCost = estimatedHoursPerMonth * ownerHourlyRate;
    const annualTimeCost = monthlyTimeCost * 12;

    // Calculate direct costs (tools, software, etc.)
    const monthlyDirectCosts = this.calculateSelfManagementDirectCosts(propertyDetails);
    const annualDirectCosts = monthlyDirectCosts * 12;

    // Total self-management costs
    const monthlyTotalCost = monthlyTimeCost + monthlyDirectCosts;
    const annualTotalCost = annualTimeCost + annualDirectCosts;

    // Experience multipliers
    const experienceMultipliers = {
      beginner: 1.5,
      intermediate: 1.2,
      experienced: 1.0,
      expert: 0.8
    };

    const adjustedMonthlyHours = estimatedHoursPerMonth * experienceMultipliers[experienceLevel];
    const adjustedMonthlyCost = adjustedMonthlyHours * ownerHourlyRate + monthlyDirectCosts;

    // Calculate efficiency metrics
    const costPerUnit = monthlyTotalCost / propertyDetails.total_units;
    const costAsPercentOfRent = (monthlyTotalCost / propertyMetrics.monthly_gross_rent) * 100;

    // Identify challenges and benefits
    const challenges = this.identifySelfManagementChallenges(propertyDetails, experienceLevel);
    const benefits = this.identifySelfManagementBenefits(propertyDetails);

    return {
      monthly_cost: adjustedMonthlyCost,
      annual_cost: adjustedMonthlyCost * 12,
      time_investment: {
        estimated_hours_per_month: adjustedMonthlyHours,
        hourly_rate_used: ownerHourlyRate,
        monthly_time_value: adjustedMonthlyHours * ownerHourlyRate
      },
      direct_costs: {
        monthly: monthlyDirectCosts,
        annual: annualDirectCosts,
        breakdown: this.getSelfManagementCostBreakdown(propertyDetails)
      },
      efficiency_metrics: {
        cost_per_unit: costPerUnit,
        cost_percentage_of_rent: costAsPercentOfRent,
        experience_adjustment_factor: experienceMultipliers[experienceLevel]
      },
      challenges,
      benefits,
      suitability_score: this.calculateSelfManagementSuitability(propertyDetails, experienceLevel)
    };
  }

  analyzeProfessionalManagement(propertyDetails, professionalOptions, propertyMetrics) {
    const managementFeePercentage = professionalOptions.management_fee_percentage || 
                                   this.getStandardManagementFee(propertyDetails.property_type);
    const setupFee = professionalOptions.setup_fee || 0;
    const leasingFee = professionalOptions.leasing_fee || propertyDetails.monthly_rent_per_unit;
    const maintenanceMarkup = professionalOptions.maintenance_markup || 10;

    // Calculate monthly management fee
    const monthlyManagementFee = (propertyMetrics.monthly_gross_rent * managementFeePercentage) / 100;

    // Calculate annual leasing costs (based on turnover)
    const averageTurnoverMonths = 24; // Assume 24-month average tenancy
    const annualTurnovers = propertyDetails.total_units / (averageTurnoverMonths / 12);
    const annualLeasingFees = annualTurnovers * leasingFee;

    // Calculate maintenance markup costs
    const estimatedAnnualMaintenance = propertyDetails.property_value * 0.01; // 1% of property value
    const annualMaintenanceMarkup = (estimatedAnnualMaintenance * maintenanceMarkup) / 100;

    // Total costs
    const monthlyTotalCost = monthlyManagementFee;
    const annualTotalCost = (monthlyManagementFee * 12) + annualLeasingFees + annualMaintenanceMarkup + setupFee;

    // Calculate value metrics
    const costPerUnit = monthlyTotalCost / propertyDetails.total_units;
    const costAsPercentOfRent = (monthlyTotalCost / propertyMetrics.monthly_gross_rent) * 100;

    // Identify services and benefits
    const servicesIncluded = professionalOptions.services_included || this.getStandardServices();
    const benefits = this.identifyProfessionalManagementBenefits(servicesIncluded);

    return {
      monthly_cost: monthlyTotalCost,
      annual_cost: annualTotalCost,
      fee_structure: {
        management_fee_percentage: managementFeePercentage,
        monthly_management_fee: monthlyManagementFee,
        setup_fee: setupFee,
        leasing_fee: leasingFee,
        maintenance_markup_percentage: maintenanceMarkup
      },
      annual_fees: {
        management_fees: monthlyManagementFee * 12,
        leasing_fees: annualLeasingFees,
        maintenance_markup: annualMaintenanceMarkup,
        total_additional_fees: annualLeasingFees + annualMaintenanceMarkup
      },
      efficiency_metrics: {
        cost_per_unit: costPerUnit,
        cost_percentage_of_rent: costAsPercentOfRent
      },
      services_included: servicesIncluded,
      benefits,
      suitability_score: this.calculateProfessionalManagementSuitability(propertyDetails, servicesIncluded)
    };
  }

  estimateManagementHours(propertyDetails) {
    const baseHours = {
      single_family: 3,
      duplex: 4,
      triplex: 5,
      fourplex: 6,
      small_multifamily: 8,
      large_multifamily: 15,
      commercial: 20,
      mixed_use: 12
    };

    const baseHoursPerMonth = baseHours[propertyDetails.property_type] || 5;
    const unitMultiplier = Math.max(1, propertyDetails.total_units / 4); // Additional time for more units
    
    return Math.round(baseHoursPerMonth * unitMultiplier);
  }

  calculateSelfManagementDirectCosts(propertyDetails) {
    // Software, tools, marketing, etc.
    const baseCosts = {
      property_management_software: 30,
      accounting_software: 15,
      background_check_services: 10,
      marketing_and_advertising: 25,
      legal_and_compliance: 20,
      maintenance_tools: 15
    };

    const totalUnits = propertyDetails.total_units;
    const unitScalingFactor = Math.min(2.0, 1 + (totalUnits - 1) * 0.1); // Scale with units but cap at 2x

    return Object.values(baseCosts).reduce((sum, cost) => sum + cost, 0) * unitScalingFactor;
  }

  getSelfManagementCostBreakdown(propertyDetails) {
    return [
      { category: 'Property Management Software', monthly_cost: 30, description: 'Rent collection, maintenance requests' },
      { category: 'Accounting Software', monthly_cost: 15, description: 'Financial tracking and reporting' },
      { category: 'Tenant Screening', monthly_cost: 10, description: 'Background and credit checks' },
      { category: 'Marketing & Advertising', monthly_cost: 25, description: 'Vacancy marketing, listing fees' },
      { category: 'Legal & Compliance', monthly_cost: 20, description: 'Legal forms, compliance monitoring' },
      { category: 'Tools & Supplies', monthly_cost: 15, description: 'Basic maintenance tools, supplies' }
    ];
  }

  identifySelfManagementChallenges(propertyDetails, experienceLevel) {
    const challenges = [];

    if (experienceLevel === 'beginner') {
      challenges.push({
        challenge: 'Learning Curve',
        severity: 'High',
        description: 'Significant time investment to learn property management',
        mitigation: 'Take property management courses, join landlord associations'
      });
    }

    if (propertyDetails.total_units > 10) {
      challenges.push({
        challenge: 'Scale Management',
        severity: 'Medium',
        description: 'Managing multiple units becomes time-intensive',
        mitigation: 'Implement systematic processes and consider partial outsourcing'
      });
    }

    challenges.push({
      challenge: 'Time Availability',
      severity: 'Medium',
      description: 'Emergency calls and tenant issues require flexible schedule',
      mitigation: 'Establish clear boundaries and emergency protocols'
    });

    challenges.push({
      challenge: 'Legal Compliance',
      severity: 'High',
      description: 'Keeping up with changing regulations and fair housing laws',
      mitigation: 'Regular legal updates, professional consultations'
    });

    return challenges;
  }

  identifySelfManagementBenefits(propertyDetails) {
    return [
      {
        benefit: 'Cost Savings',
        impact: 'High',
        description: 'No management fees, direct cost control'
      },
      {
        benefit: 'Direct Control',
        impact: 'High',
        description: 'Full control over tenant selection and property decisions'
      },
      {
        benefit: 'Personal Relationships',
        impact: 'Medium',
        description: 'Direct tenant relationships can improve retention'
      },
      {
        benefit: 'Learning Experience',
        impact: 'Medium',
        description: 'Develop valuable property management skills'
      },
      {
        benefit: 'Immediate Decisions',
        impact: 'Medium',
        description: 'No delays waiting for management company responses'
      }
    ];
  }

  getStandardManagementFee(propertyType) {
    const standardFees = {
      single_family: 8,
      duplex: 8,
      triplex: 7,
      fourplex: 7,
      small_multifamily: 6,
      large_multifamily: 5,
      commercial: 4,
      mixed_use: 6
    };

    return standardFees[propertyType] || 8;
  }

  getStandardServices() {
    return [
      'tenant_screening',
      'rent_collection',
      'maintenance_coordination',
      'property_inspections',
      'financial_reporting',
      'legal_compliance',
      'marketing',
      'lease_preparation'
    ];
  }

  identifyProfessionalManagementBenefits(servicesIncluded) {
    const benefitMap = {
      tenant_screening: 'Professional tenant vetting reduces bad tenant risk',
      rent_collection: 'Systematic collection process improves cash flow',
      maintenance_coordination: 'Established vendor network for efficient repairs',
      property_inspections: 'Regular inspections prevent major issues',
      financial_reporting: 'Professional accounting and tax preparation support',
      legal_compliance: 'Expert knowledge of landlord-tenant laws',
      marketing: 'Professional marketing reduces vacancy time',
      lease_preparation: 'Legally compliant lease agreements',
      eviction_handling: 'Expert handling of difficult tenant situations',
      '24_7_emergency': 'Round-the-clock emergency response'
    };

    return servicesIncluded.map(service => ({
      service,
      benefit: benefitMap[service] || 'Professional service delivery'
    }));
  }

  calculateBreakevenAnalysis(selfManagement, professionalManagement) {
    const monthlySavings = professionalManagement.monthly_cost - selfManagement.monthly_cost;
    const timeValuePerMonth = selfManagement.time_investment.monthly_time_value;

    return {
      monthly_cost_difference: monthlySavings,
      time_value_consideration: timeValuePerMonth,
      net_monthly_benefit: monthlySavings - timeValuePerMonth,
      payback_period_months: monthlySavings > 0 ? Math.abs(timeValuePerMonth / monthlySavings) : null,
      recommendation: monthlySavings > timeValuePerMonth ? 'Professional Management' : 'Self Management'
    };
  }

  calculateValueProposition(selfManagement, professionalManagement) {
    const costRatio = professionalManagement.monthly_cost / selfManagement.monthly_cost;
    const timeValue = selfManagement.time_investment.monthly_time_value;
    const professionalValue = professionalManagement.monthly_cost - timeValue;

    return {
      cost_multiplier: costRatio,
      time_value_recovery: timeValue,
      net_cost_of_professional: professionalValue,
      value_assessment: this.assessValueProposition(costRatio, timeValue, professionalValue)
    };
  }

  assessValueProposition(costRatio, timeValue, netCost) {
    if (costRatio <= 1.2 && timeValue > netCost) {
      return 'Excellent Value - Professional management costs less than time value';
    } else if (costRatio <= 1.5 && timeValue > netCost * 0.8) {
      return 'Good Value - Professional management provides significant time savings';
    } else if (costRatio <= 2.0) {
      return 'Fair Value - Consider based on personal preference and time availability';
    } else {
      return 'Poor Value - Self-management likely more cost-effective';
    }
  }

  calculateSelfManagementSuitability(propertyDetails, experienceLevel) {
    let score = 50;

    // Experience factor
    const experienceScores = { beginner: -15, intermediate: 0, experienced: 10, expert: 20 };
    score += experienceScores[experienceLevel];

    // Property type factor
    const propertyTypeScores = {
      single_family: 15,
      duplex: 10,
      triplex: 5,
      fourplex: 0,
      small_multifamily: -10,
      large_multifamily: -20,
      commercial: -25,
      mixed_use: -15
    };
    score += propertyTypeScores[propertyDetails.property_type] || 0;

    // Unit count factor
    if (propertyDetails.total_units <= 4) score += 10;
    else if (propertyDetails.total_units <= 10) score += 0;
    else score -= (propertyDetails.total_units - 10) * 2;

    return Math.max(0, Math.min(100, score));
  }

  calculateProfessionalManagementSuitability(propertyDetails, servicesIncluded) {
    let score = 50;

    // Property type factor
    const propertyTypeScores = {
      single_family: -10,
      duplex: -5,
      triplex: 0,
      fourplex: 5,
      small_multifamily: 15,
      large_multifamily: 25,
      commercial: 30,
      mixed_use: 20
    };
    score += propertyTypeScores[propertyDetails.property_type] || 0;

    // Unit count factor
    if (propertyDetails.total_units >= 20) score += 20;
    else if (propertyDetails.total_units >= 10) score += 10;
    else if (propertyDetails.total_units >= 5) score += 5;

    // Services factor
    score += servicesIncluded.length * 2;

    return Math.max(0, Math.min(100, score));
  }

  performComparisonAnalysis(selfManagement, professionalManagement) {
    return {
      cost_comparison: {
        monthly_difference: professionalManagement.monthly_cost - selfManagement.monthly_cost,
        annual_difference: professionalManagement.annual_cost - selfManagement.annual_cost,
        cost_ratio: professionalManagement.monthly_cost / selfManagement.monthly_cost
      },
      efficiency_comparison: {
        self_cost_per_unit: selfManagement.efficiency_metrics.cost_per_unit,
        professional_cost_per_unit: professionalManagement.efficiency_metrics.cost_per_unit,
        efficiency_advantage: selfManagement.efficiency_metrics.cost_per_unit < professionalManagement.efficiency_metrics.cost_per_unit ? 'Self Management' : 'Professional Management'
      },
      suitability_comparison: {
        self_management_score: selfManagement.suitability_score,
        professional_management_score: professionalManagement.suitability_score,
        recommended_approach: selfManagement.suitability_score > professionalManagement.suitability_score ? 'Self Management' : 'Professional Management'
      }
    };
  }

  performScenarioModeling(propertyDetails, propertyMetrics) {
    const scenarios = [
      {
        name: 'High Vacancy Scenario',
        vacancy_rate: 15,
        impact_description: 'Higher vacancy reduces effective income and increases management burden'
      },
      {
        name: 'Low Vacancy Scenario',
        vacancy_rate: 2,
        impact_description: 'Low vacancy maximizes income and reduces turnover costs'
      },
      {
        name: 'High Maintenance Scenario',
        maintenance_multiplier: 2.0,
        impact_description: 'Older property or deferred maintenance increases management time'
      },
      {
        name: 'Rent Growth Scenario',
        rent_growth_rate: 5,
        impact_description: 'Strong rent growth improves property performance'
      }
    ];

    return scenarios.map(scenario => {
      const adjustedMetrics = this.calculateScenarioMetrics(propertyDetails, propertyMetrics, scenario);
      return {
        ...scenario,
        adjusted_monthly_income: adjustedMetrics.monthly_income,
        adjusted_annual_income: adjustedMetrics.annual_income,
        management_impact: adjustedMetrics.management_impact
      };
    });
  }

  calculateScenarioMetrics(propertyDetails, baseMetrics, scenario) {
    let monthlyIncome = baseMetrics.monthly_gross_rent;
    let managementImpact = 'Neutral';

    if (scenario.vacancy_rate !== undefined) {
      const vacancyAdjustment = 1 - (scenario.vacancy_rate / 100);
      monthlyIncome *= vacancyAdjustment;
      managementImpact = scenario.vacancy_rate > 10 ? 'Increases self-management burden' : 'Minimal impact';
    }

    if (scenario.rent_growth_rate !== undefined) {
      monthlyIncome *= (1 + scenario.rent_growth_rate / 100);
      managementImpact = 'Increases property value and management complexity';
    }

    return {
      monthly_income: monthlyIncome,
      annual_income: monthlyIncome * 12,
      management_impact: managementImpact
    };
  }

  optimizeEfficiency(propertyDetails, propertyMetrics) {
    const recommendations = [];

    // Technology optimization
    recommendations.push({
      category: 'Technology',
      recommendation: 'Implement property management software',
      estimated_savings: 200,
      implementation_cost: 360,
      payback_months: 2
    });

    // Process optimization
    if (propertyDetails.total_units > 4) {
      recommendations.push({
        category: 'Process',
        recommendation: 'Standardize lease terms and procedures',
        estimated_savings: 150,
        implementation_cost: 0,
        payback_months: 0
      });
    }

    // Maintenance optimization
    recommendations.push({
      category: 'Maintenance',
      recommendation: 'Establish preferred vendor relationships',
      estimated_savings: 300,
      implementation_cost: 100,
      payback_months: 0.33
    });

    return {
      optimization_opportunities: recommendations,
      total_potential_annual_savings: recommendations.reduce((sum, rec) => sum + rec.estimated_savings, 0),
      total_implementation_cost: recommendations.reduce((sum, rec) => sum + rec.implementation_cost, 0)
    };
  }

  assessRisks(propertyDetails, propertyMetrics, marketConditions) {
    const risks = [];

    // Market risks
    if (marketConditions.vacancy_rate > 10) {
      risks.push({
        category: 'Market Risk',
        risk: 'High Vacancy Rate',
        severity: 'High',
        impact: 'Reduced income and increased management burden',
        mitigation: 'Competitive pricing, property improvements, professional marketing'
      });
    }

    // Property-specific risks
    if (propertyDetails.property_age_years > 30) {
      risks.push({
        category: 'Property Risk',
        risk: 'Aging Property Systems',
        severity: 'Medium',
        impact: 'Increasing maintenance costs and tenant complaints',
        mitigation: 'Preventive maintenance program, capital improvement planning'
      });
    }

    // Management risks
    if (propertyDetails.total_units > 10) {
      risks.push({
        category: 'Management Risk',
        risk: 'Scale Complexity',
        severity: 'Medium',
        impact: 'Increased time requirements and operational complexity',
        mitigation: 'Systematic processes, consider professional management'
      });
    }

    return {
      identified_risks: risks,
      overall_risk_level: this.calculateOverallRiskLevel(risks),
      risk_mitigation_priority: risks.sort((a, b) => {
        const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }).slice(0, 3)
    };
  }

  calculateOverallRiskLevel(risks) {
    const highRisks = risks.filter(r => r.severity === 'High').length;
    const mediumRisks = risks.filter(r => r.severity === 'Medium').length;

    if (highRisks >= 2) return 'High';
    if (highRisks >= 1 || mediumRisks >= 3) return 'Medium';
    return 'Low';
  }

  analyzeROI(propertyDetails, selfManagement, professionalManagement) {
    const propertyValue = propertyDetails.property_value;
    const annualRent = propertyDetails.monthly_rent_per_unit * propertyDetails.total_units * 12;

    const selfManagementROI = {
      annual_net_income: annualRent - selfManagement.annual_cost,
      roi_percentage: ((annualRent - selfManagement.annual_cost) / propertyValue) * 100,
      cash_on_cash_return: ((annualRent - selfManagement.annual_cost) / (propertyValue * 0.25)) * 100 // Assuming 25% down
    };

    const professionalManagementROI = {
      annual_net_income: annualRent - professionalManagement.annual_cost,
      roi_percentage: ((annualRent - professionalManagement.annual_cost) / propertyValue) * 100,
      cash_on_cash_return: ((annualRent - professionalManagement.annual_cost) / (propertyValue * 0.25)) * 100
    };

    return {
      self_management: selfManagementROI,
      professional_management: professionalManagementROI,
      roi_difference: selfManagementROI.roi_percentage - professionalManagementROI.roi_percentage,
      better_roi_option: selfManagementROI.roi_percentage > professionalManagementROI.roi_percentage ? 'Self Management' : 'Professional Management'
    };
  }

  generateRecommendations(propertyMetrics, selfManagement, professionalManagement, propertyDetails) {
    const recommendations = [];

    // Primary recommendation based on analysis
    const costDifference = professionalManagement.monthly_cost - selfManagement.monthly_cost;
    const timeValue = selfManagement.time_investment.monthly_time_value;

    if (timeValue > costDifference * 1.2) {
      recommendations.push({
        category: 'Primary Recommendation',
        recommendation: 'Choose Professional Management',
        reasoning: 'Time value exceeds additional cost by significant margin',
        priority: 'High',
        expected_benefit: 'More time for other investments and activities'
      });
    } else if (selfManagement.suitability_score > 70) {
      recommendations.push({
        category: 'Primary Recommendation',
        recommendation: 'Consider Self Management',
        reasoning: 'Good fit based on property type and experience level',
        priority: 'High',
        expected_benefit: 'Cost savings and direct control'
      });
    } else {
      recommendations.push({
        category: 'Primary Recommendation',
        recommendation: 'Hybrid Approach',
        reasoning: 'Consider self-managing with selective outsourcing',
        priority: 'High',
        expected_benefit: 'Balance of cost control and professional expertise'
      });
    }

    // Property-specific recommendations
    if (propertyDetails.total_units > 20) {
      recommendations.push({
        category: 'Scale Management',
        recommendation: 'Professional management strongly recommended',
        reasoning: 'Large portfolio requires systematic management approach',
        priority: 'High',
        expected_benefit: 'Improved efficiency and tenant satisfaction'
      });
    }

    // Efficiency recommendations
    recommendations.push({
      category: 'Efficiency',
      recommendation: 'Implement property management software',
      reasoning: 'Streamlines operations regardless of management choice',
      priority: 'Medium',
      expected_benefit: 'Reduced administrative time and improved record keeping'
    });

    // Financial optimization
    if (propertyMetrics.estimated_cap_rate < 6) {
      recommendations.push({
        category: 'Financial',
        recommendation: 'Focus on expense reduction and rent optimization',
        reasoning: 'Low cap rate indicates need for improved property performance',
        priority: 'High',
        expected_benefit: 'Improved cash flow and property value'
      });
    }

    return {
      recommendations,
      implementation_timeline: this.createImplementationTimeline(recommendations),
      success_metrics: [
        'Reduced vacancy rates',
        'Improved tenant satisfaction',
        'Lower operating costs per unit',
        'Increased net operating income',
        'Better cash flow consistency'
      ]
    };
  }

  createImplementationTimeline(recommendations) {
    const highPriority = recommendations.filter(r => r.priority === 'High');
    const mediumPriority = recommendations.filter(r => r.priority === 'Medium');

    return [
      {
        phase: 'Immediate (0-30 days)',
        tasks: highPriority.slice(0, 2).map(r => r.recommendation)
      },
      {
        phase: 'Short Term (1-3 months)',
        tasks: [...highPriority.slice(2), ...mediumPriority.slice(0, 2)].map(r => r.recommendation)
      },
      {
        phase: 'Medium Term (3-6 months)',
        tasks: mediumPriority.slice(2).map(r => r.recommendation)
      }
    ];
  }
}