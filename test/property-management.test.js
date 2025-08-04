import { test } from 'node:test';
import assert from 'node:assert';
import { PropertyManagementCalculator } from '../src/calculators/property-management.js';

test('PropertyManagementCalculator - Basic Property Management Analysis', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'duplex',
      total_units: 2,
      property_value: 400000,
      monthly_rent_per_unit: 1800,
      property_age_years: 15,
      property_condition: 'good',
      location_grade: 'B+',
      tenant_quality: 'good'
    },
    management_options: {
      self_management: {
        owner_hourly_rate: 60,
        estimated_hours_per_month: 8,
        owner_experience_level: 'intermediate'
      },
      professional_management: {
        management_fee_percentage: 8,
        setup_fee: 500,
        leasing_fee: 1800,
        maintenance_markup: 15
      }
    }
  });

  // Test structure
  assert(result.property_overview, 'Should have property overview');
  assert(result.self_management, 'Should have self management analysis');
  assert(result.professional_management, 'Should have professional management analysis');
  assert(result.cost_benefit_analysis, 'Should have cost benefit analysis');
  assert(result.recommendations, 'Should have recommendations');

  // Test property overview
  const overview = result.property_overview;
  assert(overview.property_type === 'duplex', 'Should preserve property type');
  assert(overview.total_units === 2, 'Should preserve unit count');
  assert(overview.monthly_gross_rent === 3600, 'Should calculate gross rent (2 * $1800)');
  assert(overview.annual_gross_rent === 43200, 'Should calculate annual gross rent');

  // Test self management analysis
  const selfMgmt = result.self_management;
  assert(typeof selfMgmt.monthly_cost === 'number', 'Should calculate monthly self-management cost');
  assert(typeof selfMgmt.annual_cost === 'number', 'Should calculate annual self-management cost');
  assert(selfMgmt.time_investment.estimated_hours_per_month > 0, 'Should estimate time investment');
  assert(selfMgmt.suitability_score >= 0 && selfMgmt.suitability_score <= 100, 'Should have valid suitability score');

  // Test professional management analysis
  const profMgmt = result.professional_management;
  assert(profMgmt.monthly_cost === 288, 'Should calculate 8% of $3600 monthly rent');
  assert(typeof profMgmt.annual_cost === 'number', 'Should calculate annual professional cost');
  assert(profMgmt.fee_structure.management_fee_percentage === 8, 'Should preserve management fee');
  assert(profMgmt.suitability_score >= 0 && profMgmt.suitability_score <= 100, 'Should have valid suitability score');

  // Test cost benefit analysis
  const costBenefit = result.cost_benefit_analysis;
  assert(typeof costBenefit.monthly_cost_difference === 'number', 'Should calculate monthly cost difference');
  assert(typeof costBenefit.annual_cost_difference === 'number', 'Should calculate annual cost difference');
  assert(costBenefit.breakeven_analysis, 'Should include breakeven analysis');
});

test('PropertyManagementCalculator - Single Family Property Analysis', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      total_units: 1,
      property_value: 300000,
      monthly_rent_per_unit: 2200,
      property_age_years: 8,
      property_condition: 'excellent'
    },
    management_options: {
      self_management: {
        owner_hourly_rate: 75,
        owner_experience_level: 'beginner'
      }
    }
  });

  const selfMgmt = result.self_management;
  
  // Beginner should have experience multiplier of 1.5
  assert(selfMgmt.efficiency_metrics.experience_adjustment_factor === 1.5, 
         'Should apply beginner experience multiplier');
  
  // Single family should have higher self-management suitability  
  assert(selfMgmt.suitability_score > 50, 'Single family should have reasonable self-management suitability');
  
  // Should identify beginner challenges
  const beginnerChallenge = selfMgmt.challenges.find(c => c.challenge === 'Learning Curve');
  assert(beginnerChallenge, 'Should identify learning curve challenge for beginners');
  assert(beginnerChallenge.severity === 'High', 'Learning curve should be high severity for beginners');
});

test('PropertyManagementCalculator - Large Multi-Family Analysis', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'large_multifamily',
      total_units: 25,
      property_value: 2500000,
      monthly_rent_per_unit: 1500,
      property_condition: 'fair',
      tenant_quality: 'average'
    },
    management_options: {
      professional_management: {
        management_fee_percentage: 5,
        services_included: [
          'tenant_screening',
          'rent_collection', 
          'maintenance_coordination',
          'property_inspections',
          'financial_reporting',
          'legal_compliance',
          'marketing',
          'lease_preparation',
          '24_7_emergency'
        ]
      }
    }
  });

  const profMgmt = result.professional_management;
  const selfMgmt = result.self_management;
  
  // Large multifamily should favor professional management
  assert(profMgmt.suitability_score > selfMgmt.suitability_score, 
         'Large multifamily should favor professional management');
  
  // Should calculate significant monthly rent
  assert(result.property_overview.monthly_gross_rent === 37500, 'Should calculate $37,500 monthly gross rent');
  
  // Professional management fee should be lower percentage for large properties
  assert(profMgmt.fee_structure.management_fee_percentage === 5, 
         'Should use lower fee percentage for large multifamily');
  
  // Should identify scale management challenges for self-management
  const scaleChallenge = selfMgmt.challenges.find(c => c.challenge === 'Scale Management');
  assert(scaleChallenge, 'Should identify scale management challenge');
});

test('PropertyManagementCalculator - Comparison Analysis', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'triplex',
      total_units: 3,
      property_value: 450000,
      monthly_rent_per_unit: 1600
    },
    analysis_options: {
      comparison_analysis: true
    }
  });

  const comparison = result.comparison_analysis;
  assert(comparison, 'Should include comparison analysis when requested');
  assert(comparison.cost_comparison, 'Should provide cost comparison');
  assert(comparison.efficiency_comparison, 'Should provide efficiency comparison');
  assert(comparison.suitability_comparison, 'Should provide suitability comparison');
  
  assert(typeof comparison.cost_comparison.monthly_difference === 'number', 'Should calculate monthly difference');
  assert(typeof comparison.cost_comparison.cost_ratio === 'number', 'Should calculate cost ratio');
  assert(['Self Management', 'Professional Management'].includes(comparison.efficiency_comparison.efficiency_advantage), 
         'Should identify efficiency advantage');
  assert(['Self Management', 'Professional Management'].includes(comparison.suitability_comparison.recommended_approach), 
         'Should recommend an approach');
});

test('PropertyManagementCalculator - Scenario Modeling', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'fourplex',
      total_units: 4,
      property_value: 600000,
      monthly_rent_per_unit: 1400
    },
    analysis_options: {
      scenario_modeling: true
    }
  });

  const scenarios = result.scenario_modeling;
  assert(scenarios, 'Should include scenario modeling when requested');
  assert(Array.isArray(scenarios), 'Scenario modeling should be an array');
  assert(scenarios.length >= 3, 'Should provide multiple scenarios');
  
  scenarios.forEach(scenario => {
    assert(scenario.name, 'Each scenario should have a name');
    assert(scenario.impact_description, 'Each scenario should have impact description');
    assert(typeof scenario.adjusted_monthly_income === 'number', 'Should calculate adjusted monthly income');
    assert(typeof scenario.adjusted_annual_income === 'number', 'Should calculate adjusted annual income');
    assert(scenario.management_impact, 'Should describe management impact');
  });
  
  // Should include high and low vacancy scenarios
  const highVacancyScenario = scenarios.find(s => s.name === 'High Vacancy Scenario');
  const lowVacancyScenario = scenarios.find(s => s.name === 'Low Vacancy Scenario');
  assert(highVacancyScenario, 'Should include high vacancy scenario');
  assert(lowVacancyScenario, 'Should include low vacancy scenario');
});

test('PropertyManagementCalculator - Efficiency Optimization', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'small_multifamily',
      total_units: 6,
      property_value: 720000,
      monthly_rent_per_unit: 1300
    },
    analysis_options: {
      efficiency_optimization: true
    }
  });

  const optimization = result.efficiency_optimization;
  assert(optimization, 'Should include efficiency optimization when requested');
  assert(Array.isArray(optimization.optimization_opportunities), 'Should provide optimization opportunities');
  assert(optimization.optimization_opportunities.length > 0, 'Should have multiple optimization opportunities');
  assert(typeof optimization.total_potential_annual_savings === 'number', 'Should calculate total potential savings');
  assert(typeof optimization.total_implementation_cost === 'number', 'Should calculate implementation cost');
  
  optimization.optimization_opportunities.forEach(opp => {
    assert(opp.category, 'Should have category');
    assert(opp.recommendation, 'Should have recommendation');
    assert(typeof opp.estimated_savings === 'number', 'Should have estimated savings');
    assert(typeof opp.implementation_cost === 'number', 'Should have implementation cost');
    assert(typeof opp.payback_months === 'number', 'Should have payback period');
  });
  
  // Should include technology optimization
  const techOpp = optimization.optimization_opportunities.find(o => o.category === 'Technology');
  assert(techOpp, 'Should include technology optimization opportunity');
});

test('PropertyManagementCalculator - Risk Assessment', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'commercial',
      total_units: 15,
      property_value: 1800000,
      monthly_rent_per_unit: 2200,
      property_age_years: 35,
      property_condition: 'poor'
    },
    market_conditions: {
      vacancy_rate: 12,
      market_competition_level: 'high'
    },
    analysis_options: {
      risk_assessment: true
    }
  });

  const risk = result.risk_assessment;
  assert(risk, 'Should include risk assessment when requested');
  assert(Array.isArray(risk.identified_risks), 'Should identify specific risks');
  assert(risk.identified_risks.length > 0, 'Should identify multiple risks');
  assert(['High', 'Medium', 'Low'].includes(risk.overall_risk_level), 'Should assign valid risk level');
  assert(Array.isArray(risk.risk_mitigation_priority), 'Should provide risk mitigation priorities');
  
  // Should identify market risk due to high vacancy
  const marketRisk = risk.identified_risks.find(r => r.category === 'Market Risk');
  assert(marketRisk, 'Should identify market risk with high vacancy rate');
  assert(marketRisk.severity === 'High', 'High vacancy should be high severity risk');
  
  // Should identify property risk due to age and condition
  const propertyRisk = risk.identified_risks.find(r => r.category === 'Property Risk');
  assert(propertyRisk, 'Should identify property risk with old, poor condition property');
  
  // Should identify management risk due to large size
  const managementRisk = risk.identified_risks.find(r => r.category === 'Management Risk');
  assert(managementRisk, 'Should identify management risk with 15+ units');
});

test('PropertyManagementCalculator - ROI Analysis', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'duplex',
      total_units: 2,
      property_value: 350000,
      monthly_rent_per_unit: 1700
    },
    analysis_options: {
      roi_analysis: true
    }
  });

  const roi = result.roi_analysis;
  assert(roi, 'Should include ROI analysis when requested');
  assert(roi.self_management, 'Should calculate self-management ROI');
  assert(roi.professional_management, 'Should calculate professional management ROI');
  assert(typeof roi.roi_difference === 'number', 'Should calculate ROI difference');
  assert(['Self Management', 'Professional Management'].includes(roi.better_roi_option), 
         'Should identify better ROI option');
  
  const selfROI = roi.self_management;
  const profROI = roi.professional_management;
  
  assert(typeof selfROI.annual_net_income === 'number', 'Should calculate self-management net income');
  assert(typeof selfROI.roi_percentage === 'number', 'Should calculate self-management ROI percentage');
  assert(typeof selfROI.cash_on_cash_return === 'number', 'Should calculate cash-on-cash return');
  
  assert(typeof profROI.annual_net_income === 'number', 'Should calculate professional management net income');
  assert(typeof profROI.roi_percentage === 'number', 'Should calculate professional management ROI percentage');
  assert(typeof profROI.cash_on_cash_return === 'number', 'Should calculate cash-on-cash return');
});

test('PropertyManagementCalculator - Recommendations Generation', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'small_multifamily',
      total_units: 8,
      property_value: 800000,
      monthly_rent_per_unit: 1500
    },
    management_options: {
      self_management: {
        owner_experience_level: 'experienced'
      }
    }
  });

  const recommendations = result.recommendations;
  assert(recommendations, 'Should provide recommendations');
  assert(Array.isArray(recommendations.recommendations), 'Should have recommendations array');
  assert(recommendations.recommendations.length > 0, 'Should have multiple recommendations');
  assert(recommendations.implementation_timeline, 'Should provide implementation timeline');
  assert(Array.isArray(recommendations.success_metrics), 'Should provide success metrics');
  
  // Should have primary recommendation
  const primaryRec = recommendations.recommendations.find(r => r.category === 'Primary Recommendation');
  assert(primaryRec, 'Should include primary recommendation');
  assert(primaryRec.priority === 'High', 'Primary recommendation should be high priority');
  
  // Should provide timeline phases
  const timeline = recommendations.implementation_timeline;
  assert(Array.isArray(timeline), 'Implementation timeline should be array');
  assert(timeline.length >= 2, 'Should have multiple timeline phases');
  
  timeline.forEach(phase => {
    assert(phase.phase, 'Each phase should have name');
    assert(Array.isArray(phase.tasks), 'Each phase should have tasks');
  });
});

test('PropertyManagementCalculator - Expert Owner Scenario', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'triplex',
      total_units: 3,
      property_value: 480000,
      monthly_rent_per_unit: 1650
    },
    management_options: {
      self_management: {
        owner_hourly_rate: 100,
        owner_experience_level: 'expert'
      }
    }
  });

  const selfMgmt = result.self_management;
  
  // Expert should have experience multiplier of 0.8 (more efficient)
  assert(selfMgmt.efficiency_metrics.experience_adjustment_factor === 0.8, 
         'Should apply expert experience multiplier');
  
  // Expert should have high self-management suitability
  assert(selfMgmt.suitability_score > 70, 'Expert should have high self-management suitability');
  
  // Should not include learning curve challenge for expert
  const learningCurveChallenge = selfMgmt.challenges.find(c => c.challenge === 'Learning Curve');
  assert(!learningCurveChallenge, 'Should not include learning curve challenge for expert');
});

test('PropertyManagementCalculator - Mixed Use Property', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'mixed_use',
      total_units: 12,
      property_value: 1200000,
      monthly_rent_per_unit: 1800,
      property_condition: 'good',
      location_grade: 'A-'
    }
  });

  const overview = result.property_overview;
  assert(overview.monthly_gross_rent === 21600, 'Should calculate correct gross rent for 12 units');
  
  // Mixed use should have moderate suitability for both approaches
  const selfMgmt = result.self_management;
  const profMgmt = result.professional_management;
  
  assert(selfMgmt.suitability_score < profMgmt.suitability_score, 
         'Mixed use with 12 units should favor professional management');
  
  // Should use 6% management fee for mixed use
  assert(profMgmt.fee_structure.management_fee_percentage === 6, 
         'Should use 6% management fee for mixed use');
});

test('PropertyManagementCalculator - Commercial Property Analysis', () => {
  const calc = new PropertyManagementCalculator();
  const result = calc.calculate({
    property_details: {
      property_type: 'commercial',
      total_units: 8,
      property_value: 1600000,
      monthly_rent_per_unit: 2800
    }
  });

  const profMgmt = result.professional_management;
  
  // Commercial should use 4% management fee
  assert(profMgmt.fee_structure.management_fee_percentage === 4, 
         'Should use 4% management fee for commercial');
  
  // Commercial should strongly favor professional management
  assert(profMgmt.suitability_score > 80, 'Commercial should have high professional management suitability');
});

test('PropertyManagementCalculator - Schema Validation', () => {
  const calc = new PropertyManagementCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.property_details, 'Should have property_details property');
  assert(schema.properties.management_options, 'Should have management_options property');
  assert(schema.properties.operational_expenses, 'Should have operational_expenses property');
  assert(schema.properties.market_conditions, 'Should have market_conditions property');
  assert(schema.properties.analysis_options, 'Should have analysis_options property');
  
  assert(schema.required.includes('property_details'), 'property_details should be required');
  
  // Test property details schema
  const propertyDetails = schema.properties.property_details;
  assert(propertyDetails.properties.property_type, 'Should define property_type');
  assert(propertyDetails.properties.total_units, 'Should define total_units');
  assert(propertyDetails.properties.property_value, 'Should define property_value');
  assert(propertyDetails.properties.monthly_rent_per_unit, 'Should define monthly_rent_per_unit');
  
  // Test property type enum
  const propertyTypeEnum = propertyDetails.properties.property_type.enum;
  assert(propertyTypeEnum.includes('single_family'), 'Should include single_family');
  assert(propertyTypeEnum.includes('duplex'), 'Should include duplex');
  assert(propertyTypeEnum.includes('large_multifamily'), 'Should include large_multifamily');
  assert(propertyTypeEnum.includes('commercial'), 'Should include commercial');
  
  // Test management options schema
  const managementOptions = schema.properties.management_options;
  assert(managementOptions.properties.self_management, 'Should define self_management options');
  assert(managementOptions.properties.professional_management, 'Should define professional_management options');
  
  const selfMgmtSchema = managementOptions.properties.self_management;
  assert(selfMgmtSchema.properties.owner_hourly_rate, 'Should define owner_hourly_rate');
  assert(selfMgmtSchema.properties.owner_experience_level, 'Should define owner_experience_level');
  
  const profMgmtSchema = managementOptions.properties.professional_management;
  assert(profMgmtSchema.properties.management_fee_percentage, 'Should define management_fee_percentage');
  assert(profMgmtSchema.properties.services_included, 'Should define services_included');
});