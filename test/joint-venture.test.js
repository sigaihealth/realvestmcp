import { test } from 'node:test';
import assert from 'node:assert';
import { JointVentureCalculator } from '../src/calculators/joint-venture.js';

test('JointVentureCalculator - Basic Joint Venture Analysis', () => {
  const calc = new JointVentureCalculator();
  const result = calc.calculate({
    project_details: {
      project_type: 'fix_flip',
      total_investment: 300000,
      expected_profit: 120000
    },
    partners: [
      {
        partner_id: 'partner_1',
        partner_name: 'John Smith',
        role: 'general_partner',
        cash_contribution: 150000,
        sweat_equity_hours: 200,
        sweat_equity_rate: 50
      },
      {
        partner_id: 'partner_2',
        partner_name: 'Jane Doe',
        role: 'limited_partner',
        cash_contribution: 150000,
        sweat_equity_hours: 0,
        sweat_equity_rate: 0
      }
    ]
  });

  // Test structure
  assert(result.project_summary, 'Should have project summary');
  assert(result.partner_analysis, 'Should have partner analysis');
  assert(result.split_scenarios, 'Should have split scenarios');
  assert(result.fairness_analysis, 'Should have fairness analysis');
  assert(result.recommendations, 'Should have recommendations');

  // Test project summary
  const summary = result.project_summary;
  assert(summary.number_of_partners === 2, 'Should count total partners');
  assert(summary.total_investment === 300000, 'Should calculate total investment');
  assert(summary.roi_percentage === 40, 'Should calculate expected ROI (120k/300k = 40%)');

  // Test partner analysis
  const partners = result.partner_analysis;
  assert(Array.isArray(partners), 'Partners should be an array');
  assert(partners.length === 2, 'Should analyze all partners');

  const partner1 = partners.find(p => p.partner_id === 'partner_1');
  assert(partner1, 'Should include first partner');
  assert(partner1.contributions.cash_contribution === 150000, 'Should calculate cash contribution');
  assert(partner1.contributions.sweat_equity_value > 0, 'Should value sweat equity');
  assert(partner1.contributions.total_contribution > 150000, 'Should include sweat equity value');

  const partner2 = partners.find(p => p.partner_id === 'partner_2');
  assert(partner2, 'Should include second partner');
  assert(partner2.contributions.cash_contribution === 150000, 'Should calculate cash contribution');
  assert(partner2.contributions.sweat_equity_value === 0, 'Should have no sweat equity');
});

test('JointVentureCalculator - Split Scenarios Generation', () => {
  const calc = new JointVentureCalculator();
  const result = calc.calculate({
    project_details: {
      project_type: 'buy_hold',
      total_investment: 500000,
      expected_profit: 150000
    },
    partners: [
      {
        partner_id: 'partner_1',
        partner_name: 'Partner One',
        role: 'general_partner',
        cash_contribution: 200000,
        sweat_equity_hours: 100,
        sweat_equity_rate: 50
      },
      {
        partner_id: 'partner_2',
        partner_name: 'Partner Two',
        role: 'limited_partner',
        cash_contribution: 300000,
        sweat_equity_hours: 0,
        sweat_equity_rate: 0
      }
    ]
  });

  const scenarios = result.split_scenarios;
  assert(Array.isArray(scenarios), 'Split scenarios should be an array');
  assert(scenarios.length >= 2, 'Should provide multiple split scenarios');

  scenarios.forEach(scenario => {
    assert(scenario.scenario_name, 'Each scenario should have a name');
    assert(Array.isArray(scenario.partner_returns), 'Should have partner returns');
    assert(scenario.partner_returns.length === 2, 'Should split for all partners');
    assert(typeof scenario.scenario_score === 'number', 'Should have scenario score');
    
    // Test that profit amounts are reasonable
    const totalProfit = scenario.partner_returns.reduce((sum, ret) => sum + ret.return, 0);
    assert(Math.abs(totalProfit - 150000) < 10000, 'Profit amounts should be close to total expected profit');
  });
});

test('JointVentureCalculator - Risk Assessment', () => {
  const calc = new JointVentureCalculator();
  const result = calc.calculate({
    project_details: {
      project_type: 'commercial',
      total_investment: 5000000,
      expected_profit: 1500000
    },
    partners: [
      {
        partner_id: 'experienced_partner',
        partner_name: 'Veteran Developer',
        role: 'general_partner',
        cash_contribution: 1000000,
        sweat_equity_hours: 500,
        sweat_equity_rate: 100,
        guarantor_liability: true,
        project_management: true
      },
      {
        partner_id: 'new_partner',
        partner_name: 'First Timer',
        role: 'limited_partner',
        cash_contribution: 4000000,
        sweat_equity_hours: 0,
        sweat_equity_rate: 0
      }
    ]
  });

  const risk = result.risk_assessment;
  assert(risk, 'Should include risk assessment');
  assert(Array.isArray(risk.identified_risks), 'Should identify specific risks');
  assert(risk.identified_risks.length > 0, 'Should identify at least one risk');
  assert(['High', 'Medium', 'Low'].includes(risk.overall_risk_level), 'Should assign valid risk level');

  // Should identify capital risk due to large investment
  const capitalRisk = risk.identified_risks.find(r => r.category === 'Capital Risk');
  assert(capitalRisk, 'Should identify capital risk with large investment');
});

test('JointVentureCalculator - Legal Considerations', () => {
  const calc = new JointVentureCalculator();
  const result = calc.calculate({
    project_details: {
      project_type: 'fix_flip',
      total_investment: 250000,
      expected_profit: 75000
    },
    partners: [
      {
        partner_id: 'gp',
        partner_name: 'General Partner',
        role: 'general_partner',
        cash_contribution: 50000,
        sweat_equity_hours: 300,
        sweat_equity_rate: 75
      },
      {
        partner_id: 'lp',
        partner_name: 'Limited Partner',
        role: 'limited_partner',
        cash_contribution: 200000,
        sweat_equity_hours: 0,
        sweat_equity_rate: 0
      }
    ]
  });

  const legal = result.legal_considerations;
  assert(legal, 'Should include legal considerations');
  assert(Array.isArray(legal.legal_requirements), 'Should have legal requirements');
  assert(legal.legal_requirements.length > 0, 'Should have multiple legal requirements');
  assert(Array.isArray(legal.recommended_professionals), 'Should recommend professionals');
  assert(legal.estimated_legal_costs, 'Should estimate legal costs');
});

test('JointVentureCalculator - Fairness Analysis', () => {
  const calc = new JointVentureCalculator();
  const result = calc.calculate({
    project_details: {
      project_type: 'buy_hold',
      total_investment: 600000,
      expected_profit: 180000
    },
    partners: [
      {
        partner_id: 'balanced_partner',
        partner_name: 'Balanced Contributor',
        role: 'general_partner',
        cash_contribution: 300000,
        sweat_equity_hours: 150,
        sweat_equity_rate: 75,
        property_management: true
      },
      {
        partner_id: 'cash_heavy_partner',
        partner_name: 'Cash Heavy',
        role: 'limited_partner',
        cash_contribution: 300000,
        sweat_equity_hours: 0,
        sweat_equity_rate: 0
      }
    ]
  });

  const fairness = result.fairness_analysis;
  const partners = result.partner_analysis;
  
  partners.forEach(partner => {
    assert(partner.partner_id, 'Should identify partner');
    assert(typeof partner.fairness_score === 'number', 'Should calculate fairness score');
    assert(partner.fairness_score >= 0 && partner.fairness_score <= 100, 'Fairness should be 0-100');
  });

  assert(typeof fairness.overall_fairness_score === 'number', 'Should have overall fairness score');
  assert(fairness.overall_fairness_score >= 0 && fairness.overall_fairness_score <= 100, 
         'Overall fairness should be 0-100');
  assert(Array.isArray(fairness.potential_disputes), 'Should identify potential disputes');
});

test('JointVentureCalculator - Exit Strategy Analysis', () => {
  const calc = new JointVentureCalculator();
  const result = calc.calculate({
    project_details: {
      project_type: 'development',
      total_investment: 1200000,
      expected_profit: 400000,
      project_duration_months: 18
    },
    partners: [
      {
        partner_id: 'developer',
        partner_name: 'Master Developer',
        role: 'general_partner',
        cash_contribution: 400000,
        sweat_equity_hours: 600,
        sweat_equity_rate: 100
      },
      {
        partner_id: 'investor',
        partner_name: 'Passive Investor',
        role: 'limited_partner',
        cash_contribution: 800000,
        sweat_equity_hours: 0,
        sweat_equity_rate: 0
      }
    ]
  });

  const exitAnalysis = result.exit_analysis;
  assert(exitAnalysis, 'Should include exit analysis');
  assert(Array.isArray(exitAnalysis.available_strategies), 'Should provide exit strategies');
  assert(exitAnalysis.available_strategies.length >= 2, 'Should have multiple exit strategies');
  
  exitAnalysis.available_strategies.forEach(strategy => {
    assert(strategy.strategy, 'Each exit strategy should have a name');
    assert(strategy.description, 'Should have description');
    assert(Array.isArray(strategy.pros), 'Should list pros');
    assert(Array.isArray(strategy.cons), 'Should list cons');
    assert(typeof strategy.suitability_score === 'number', 'Should have suitability score');
  });

  assert(exitAnalysis.recommended_strategy, 'Should recommend a strategy');
  assert(Array.isArray(exitAnalysis.exit_provisions_needed), 'Should provide needed provisions');
});

test('JointVentureCalculator - Recommendations Generation', () => {
  const calc = new JointVentureCalculator();
  const result = calc.calculate({
    project_details: {
      project_type: 'fix_flip',
      total_investment: 200000,
      expected_profit: 50000
    },
    partners: [
      {
        partner_id: 'inexperienced_gp',
        partner_name: 'New General Partner',
        role: 'general_partner',
        cash_contribution: 50000,
        sweat_equity_hours: 200,
        sweat_equity_rate: 50
      },
      {
        partner_id: 'experienced_lp',
        partner_name: 'Experienced Limited Partner',
        role: 'limited_partner',
        cash_contribution: 150000,
        sweat_equity_hours: 0,
        sweat_equity_rate: 0
      }
    ]
  });

  const recommendations = result.recommendations;
  assert(recommendations, 'Should provide recommendations');
  assert(Array.isArray(recommendations.recommendations), 'Should have recommendations array');
  assert(recommendations.recommendations.length > 0, 'Should have multiple recommendations');
  
  const categories = recommendations.recommendations.map(r => r.category);
  assert(categories.length > 0, 'Should have recommendation categories');
  
  // Should have some form of management or structure recommendation
  const hasManagementRec = recommendations.recommendations.some(r => 
    r.category.includes('Management') || r.category.includes('Structure') || r.category.includes('Split')
  );
  assert(hasManagementRec, 'Should have management, structure, or split recommendations');

  assert(Array.isArray(recommendations.success_metrics), 'Should provide success metrics');
  assert(recommendations.success_metrics.length > 0, 'Should have success metrics');
});

test('JointVentureCalculator - Schema Validation', () => {
  const calc = new JointVentureCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.project_details, 'Should have project_details property');
  assert(schema.properties.partners, 'Should have partners property');
  assert(schema.properties.split_structure, 'Should have split_structure property');
  assert(schema.properties.analysis_options, 'Should have analysis_options property');
  
  assert(schema.required.includes('project_details'), 'project_details should be required');
  assert(schema.required.includes('partners'), 'partners should be required');
  
  // Test project details schema
  const projectDetails = schema.properties.project_details;
  assert(projectDetails.properties.project_type, 'Should define project_type');
  assert(projectDetails.properties.total_investment, 'Should define total_investment');
  assert(projectDetails.properties.expected_profit, 'Should define expected_profit');
  assert(projectDetails.required.includes('project_type'), 'project_type should be required');
  assert(projectDetails.required.includes('total_investment'), 'total_investment should be required');
  
  // Test project type enum
  const projectTypeEnum = projectDetails.properties.project_type.enum;
  assert(projectTypeEnum.includes('fix_flip'), 'Should include fix_flip');
  assert(projectTypeEnum.includes('buy_hold'), 'Should include buy_hold');
  assert(projectTypeEnum.includes('development'), 'Should include development');
  
  // Test partners schema
  const partnersSchema = schema.properties.partners;
  assert(partnersSchema.type === 'array', 'Partners should be an array');
  assert(partnersSchema.items.type === 'object', 'Partner items should be objects');
  
  const partnerSchema = partnersSchema.items;
  assert(partnerSchema.properties.partner_id, 'Should define partner_id');
  assert(partnerSchema.properties.partner_name, 'Should define partner_name');
  assert(partnerSchema.properties.role, 'Should define role');
  assert(partnerSchema.properties.cash_contribution, 'Should define cash_contribution');
  assert(partnerSchema.required.includes('partner_id'), 'partner_id should be required');
  assert(partnerSchema.required.includes('partner_name'), 'partner_name should be required');
  assert(partnerSchema.required.includes('role'), 'role should be required');
  
  // Test role enum
  const roleEnum = partnerSchema.properties.role.enum;
  assert(roleEnum.includes('general_partner'), 'Should include general_partner');
  assert(roleEnum.includes('limited_partner'), 'Should include limited_partner');
});

test('JointVentureCalculator - Single Partner Edge Case', () => {
  const calc = new JointVentureCalculator();
  
  // Schema requires minItems: 2, so single partner should fail validation
  // Test basic functionality still works if we bypass validation
  try {
    const result = calc.calculate({
      project_details: {
        project_type: 'wholesale',
        total_investment: 25000,
        expected_profit: 15000
      },
      partners: [
        {
          partner_id: 'solo_partner',
          partner_name: 'Solo Investor',
          role: 'general_partner',
          cash_contribution: 25000,
          sweat_equity_hours: 100,
          sweat_equity_rate: 75
        }
      ]
    });

    const summary = result.project_summary;
    assert(summary.number_of_partners === 1, 'Should handle single partner');
    assert(summary.total_investment === 25000, 'Should calculate investment correctly');
  } catch (error) {
    // It's also acceptable for single partner to be rejected by validation
    assert(error.message.includes('partners'), 'Should mention partners in error');
  }
});