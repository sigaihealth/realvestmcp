export class JointVentureCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        project_details: {
          type: 'object',
          properties: {
            project_type: { 
              type: 'string', 
              enum: ['fix_flip', 'buy_hold', 'development', 'wholesale', 'brrrr', 'commercial'] 
            },
            total_investment: { type: 'number', minimum: 0 },
            expected_profit: { type: 'number', minimum: 0 },
            project_duration_months: { type: 'number', minimum: 1, maximum: 120 },
            estimated_arv: { type: 'number', minimum: 0 },
            purchase_price: { type: 'number', minimum: 0 },
            rehab_budget: { type: 'number', minimum: 0 },
            holding_costs: { type: 'number', minimum: 0 },
            selling_costs: { type: 'number', minimum: 0 }
          },
          required: ['project_type', 'total_investment', 'expected_profit']
        },
        partners: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              partner_id: { type: 'string' },
              partner_name: { type: 'string' },
              role: { 
                type: 'string', 
                enum: ['money_partner', 'sweat_equity', 'general_partner', 'limited_partner', 'property_finder', 'project_manager'] 
              },
              cash_contribution: { type: 'number', minimum: 0 },
              sweat_equity_hours: { type: 'number', minimum: 0 },
              sweat_equity_rate: { type: 'number', minimum: 0 },
              credit_score_contribution: { type: 'boolean' },
              property_management: { type: 'boolean' },
              construction_management: { type: 'boolean' },
              deal_sourcing: { type: 'boolean' },
              guarantor_liability: { type: 'boolean' },
              split_percentage: { type: 'number', minimum: 0, maximum: 100 },
              preferred_return: { type: 'number', minimum: 0, maximum: 50 },
              profit_split: { type: 'number', minimum: 0, maximum: 100 },
              loss_liability_cap: { type: 'number', minimum: 0 }
            },
            required: ['partner_id', 'partner_name', 'role']
          },
          minItems: 2
        },
        split_structure: {
          type: 'object',
          properties: {
            split_method: { 
              type: 'string', 
              enum: ['percentage', 'waterfall', 'preferred_return', 'hybrid'] 
            },
            preferred_return_rate: { type: 'number', minimum: 0, maximum: 50 },
            promote_threshold: { type: 'number', minimum: 0, maximum: 100 },
            promote_percentage: { type: 'number', minimum: 0, maximum: 100 },
            cash_flow_split: {
              type: 'object',
              properties: {
                operations: { type: 'string', enum: ['percentage', 'fixed', 'waterfall'] },
                sale_proceeds: { type: 'string', enum: ['percentage', 'fixed', 'waterfall'] }
              }
            }
          }
        },
        management_structure: {
          type: 'object',
          properties: {
            decision_making: { type: 'string', enum: ['majority', 'unanimous', 'managing_partner', 'weighted'] },
            management_fee: { type: 'number', minimum: 0, maximum: 10 },
            asset_management_fee: { type: 'number', minimum: 0, maximum: 5 },
            performance_fee: { type: 'number', minimum: 0, maximum: 50 },
            exit_strategy: { type: 'string', enum: ['flip', 'hold', 'refinance', 'syndicate'] }
          }
        },
        risk_allocation: {
          type: 'object',
          properties: {
            cost_overrun_responsibility: { type: 'string', enum: ['proportional', 'managing_partner', 'money_partner', 'shared'] },
            timeline_delay_penalty: { type: 'boolean' },
            performance_guarantees: { type: 'boolean' },
            personal_guarantees: { type: 'array', items: { type: 'string' } }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            scenario_analysis: { type: 'boolean' },
            sensitivity_analysis: { type: 'boolean' },
            tax_implications: { type: 'boolean' },
            legal_structure_comparison: { type: 'boolean' }
          }
        }
      },
      required: ['project_details', 'partners']
    };
  }

  calculate(params) {
    const {
      project_details,
      partners,
      split_structure = {},
      management_structure = {},
      risk_allocation = {},
      analysis_options = {}
    } = params;

    // Validate partner splits add up to 100%
    this.validatePartnerSplits(partners);

    // Calculate individual partner contributions and returns
    const partner_analysis = partners.map(partner => this.analyzePartner(partner, project_details));

    // Calculate split scenarios
    const split_scenarios = this.calculateSplitScenarios(
      project_details, 
      partner_analysis, 
      split_structure
    );

    // Analyze fairness and risk distribution
    const fairness_analysis = this.analyzeFairness(partner_analysis, split_scenarios);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      partner_analysis, 
      split_scenarios, 
      fairness_analysis,
      management_structure,
      risk_allocation
    );

    // Optional analyses
    const scenario_analysis = analysis_options.scenario_analysis
      ? this.performScenarioAnalysis(project_details, partner_analysis, split_structure)
      : null;

    const sensitivity_analysis = analysis_options.sensitivity_analysis
      ? this.performSensitivityAnalysis(project_details, partner_analysis)
      : null;

    const tax_analysis = analysis_options.tax_implications
      ? this.analyzeTaxImplications(partner_analysis, management_structure)
      : null;

    const legal_structure_analysis = analysis_options.legal_structure_comparison
      ? this.compareLegalStructures(project_details, partner_analysis)
      : null;

    return {
      project_summary: {
        total_investment: project_details.total_investment,
        expected_profit: project_details.expected_profit,
        roi_percentage: (project_details.expected_profit / project_details.total_investment) * 100,
        project_duration_months: project_details.project_duration_months || 12,
        number_of_partners: partners.length
      },
      partner_analysis,
      split_scenarios,
      fairness_analysis,
      risk_assessment: this.assessRisks(partner_analysis, risk_allocation),
      cash_flow_projections: this.projectCashFlows(project_details, partner_analysis, split_structure),
      exit_analysis: this.analyzeExitStrategies(project_details, partner_analysis, management_structure),
      legal_considerations: this.identifyLegalConsiderations(partners, management_structure),
      recommendations,
      scenario_analysis,
      sensitivity_analysis,
      tax_analysis,
      legal_structure_analysis
    };
  }

  validatePartnerSplits(partners) {
    const totalSplit = partners.reduce((sum, partner) => sum + (partner.split_percentage || 0), 0);
    
    if (Math.abs(totalSplit - 100) > 0.01 && totalSplit > 0) {
      throw new Error(`Partner splits must add up to 100%. Current total: ${totalSplit}%`);
    }
  }

  analyzePartner(partner, project_details) {
    const cash_contribution = partner.cash_contribution || 0;
    const sweat_equity_value = (partner.sweat_equity_hours || 0) * (partner.sweat_equity_rate || 0);
    const total_contribution = cash_contribution + sweat_equity_value;

    // Calculate contribution percentage
    const contribution_percentage = project_details.total_investment > 0 
      ? (total_contribution / project_details.total_investment) * 100 
      : 0;

    // Calculate expected returns based on split
    const split_percentage = partner.split_percentage || (contribution_percentage > 0 ? contribution_percentage : 100 / 2); // Default to equal split
    const expected_return = (project_details.expected_profit * split_percentage) / 100;
    const total_expected_return = total_contribution + expected_return;

    // Calculate ROI
    const partner_roi = total_contribution > 0 ? (expected_return / total_contribution) * 100 : 0;

    // Risk assessment
    const risk_factors = this.assessPartnerRisk(partner);

    // Value-add assessment
    const value_add_score = this.calculateValueAddScore(partner);

    return {
      ...partner,
      contributions: {
        cash_contribution,
        sweat_equity_value,
        total_contribution,
        contribution_percentage
      },
      returns: {
        split_percentage,
        expected_return,
        total_expected_return,
        partner_roi
      },
      risk_factors,
      value_add_score,
      fairness_score: this.calculateFairnessScore(contribution_percentage, split_percentage, value_add_score)
    };
  }

  assessPartnerRisk(partner) {
    const risks = [];
    
    if (partner.guarantor_liability) {
      risks.push({
        type: 'Guarantor Liability',
        level: 'High',
        description: 'Personal guarantee exposes partner to unlimited liability',
        mitigation: 'Consider liability caps or limited guarantee structures'
      });
    }

    if (partner.role === 'general_partner') {
      risks.push({
        type: 'Management Liability',
        level: 'Medium',
        description: 'General partner has unlimited liability and fiduciary duties',
        mitigation: 'Obtain adequate insurance and clear operating agreements'
      });
    }

    if ((partner.cash_contribution || 0) > 100000) {
      risks.push({
        type: 'Capital Risk',
        level: 'Medium',
        description: 'Significant capital at risk in single project',
        mitigation: 'Diversify investments and maintain adequate reserves'
      });
    }

    return risks;
  }

  calculateValueAddScore(partner) {
    let score = 0;
    const weights = {
      cash: 0.3,
      sweat_equity: 0.2,
      expertise: 0.3,
      networks: 0.1,
      guarantees: 0.1
    };

    // Cash contribution score
    if (partner.cash_contribution > 0) {
      score += 25 * weights.cash;
    }

    // Sweat equity score
    if (partner.sweat_equity_hours > 0) {
      score += Math.min(25, (partner.sweat_equity_hours / 100) * 25) * weights.sweat_equity;
    }

    // Expertise score
    const expertiseRoles = ['project_manager', 'general_partner'];
    if (expertiseRoles.includes(partner.role)) {
      score += 25 * weights.expertise;
    }

    // Property management
    if (partner.property_management) score += 15 * weights.expertise;
    if (partner.construction_management) score += 20 * weights.expertise;
    if (partner.deal_sourcing) score += 15 * weights.networks;

    // Credit and guarantees
    if (partner.credit_score_contribution) score += 15 * weights.guarantees;
    if (partner.guarantor_liability) score += 10 * weights.guarantees;

    return Math.min(100, Math.round(score));
  }

  calculateFairnessScore(contribution_percentage, split_percentage, value_add_score) {
    // Fair split should align with contribution + value-add
    const expected_split = (contribution_percentage * 0.6) + (value_add_score * 0.004); // Convert value-add to percentage
    const fairness_delta = Math.abs(split_percentage - expected_split);
    
    // Score decreases as the delta increases
    let fairness_score = 100 - (fairness_delta * 2);
    fairness_score = Math.max(0, Math.min(100, fairness_score));
    
    return Math.round(fairness_score);
  }

  calculateSplitScenarios(project_details, partner_analysis, split_structure) {
    const scenarios = [];

    // Scenario 1: Current proposed splits
    scenarios.push({
      scenario_name: 'Proposed Split',
      description: 'Based on current partner split percentages',
      partner_returns: partner_analysis.map(partner => ({
        partner_id: partner.partner_id,
        partner_name: partner.partner_name,
        investment: partner.contributions.total_contribution,
        return: partner.returns.expected_return,
        total_return: partner.returns.total_expected_return,
        roi_percentage: partner.returns.partner_roi
      })),
      scenario_score: this.calculateScenarioScore(partner_analysis, 'proposed')
    });

    // Scenario 2: Contribution-based split
    const contribution_based = partner_analysis.map(partner => {
      const total_contributions = partner_analysis.reduce((sum, p) => sum + p.contributions.total_contribution, 0);
      const contribution_split = total_contributions > 0 
        ? (partner.contributions.total_contribution / total_contributions) * 100 
        : 100 / partner_analysis.length;
      
      const expected_return = (project_details.expected_profit * contribution_split) / 100;
      return {
        partner_id: partner.partner_id,
        partner_name: partner.partner_name,
        investment: partner.contributions.total_contribution,
        return: expected_return,
        total_return: partner.contributions.total_contribution + expected_return,
        roi_percentage: partner.contributions.total_contribution > 0 
          ? (expected_return / partner.contributions.total_contribution) * 100 
          : 0,
        split_percentage: contribution_split
      };
    });

    scenarios.push({
      scenario_name: 'Contribution-Based',
      description: 'Split based purely on financial and sweat equity contributions',
      partner_returns: contribution_based,
      scenario_score: this.calculateScenarioScore(contribution_based, 'contribution')
    });

    // Scenario 3: Value-add weighted split
    const total_value_score = partner_analysis.reduce((sum, p) => sum + p.value_add_score, 0);
    const value_weighted = partner_analysis.map(partner => {
      const value_weight = total_value_score > 0 ? partner.value_add_score / total_value_score : 1 / partner_analysis.length;
      const contribution_weight = partner.contributions.contribution_percentage / 100;
      const blended_split = (value_weight * 0.4 + contribution_weight * 0.6) * 100;
      
      const expected_return = (project_details.expected_profit * blended_split) / 100;
      return {
        partner_id: partner.partner_id,
        partner_name: partner.partner_name,
        investment: partner.contributions.total_contribution,
        return: expected_return,
        total_return: partner.contributions.total_contribution + expected_return,
        roi_percentage: partner.contributions.total_contribution > 0 
          ? (expected_return / partner.contributions.total_contribution) * 100 
          : 0,
        split_percentage: blended_split
      };
    });

    scenarios.push({
      scenario_name: 'Value-Add Weighted',
      description: 'Split weighted by both contributions and value-add capabilities',
      partner_returns: value_weighted,
      scenario_score: this.calculateScenarioScore(value_weighted, 'value_weighted')
    });

    // Scenario 4: Preferred return structure (if applicable)
    if (split_structure.preferred_return_rate && split_structure.preferred_return_rate > 0) {
      const preferred_return_scenario = this.calculatePreferredReturnScenario(
        project_details, 
        partner_analysis, 
        split_structure
      );
      scenarios.push(preferred_return_scenario);
    }

    return scenarios;
  }

  calculatePreferredReturnScenario(project_details, partner_analysis, split_structure) {
    const preferred_rate = split_structure.preferred_return_rate / 100;
    const project_duration_years = (project_details.project_duration_months || 12) / 12;
    
    const partner_returns = partner_analysis.map(partner => {
      const investment = partner.contributions.cash_contribution || 0; // Only cash gets preferred return
      const preferred_return = investment * preferred_rate * project_duration_years;
      
      // Remaining profit after preferred returns
      const total_preferred = partner_analysis.reduce((sum, p) => {
        const cash = p.contributions.cash_contribution || 0;
        return sum + (cash * preferred_rate * project_duration_years);
      }, 0);
      
      const remaining_profit = Math.max(0, project_details.expected_profit - total_preferred);
      const promote_split = (partner.split_percentage || 50) / 100;
      const promote_share = remaining_profit * promote_split;
      
      const total_return = preferred_return + promote_share;
      
      return {
        partner_id: partner.partner_id,
        partner_name: partner.partner_name,
        investment: partner.contributions.total_contribution,
        preferred_return,
        promote_share,
        return: total_return,
        total_return: partner.contributions.total_contribution + total_return,
        roi_percentage: partner.contributions.total_contribution > 0 
          ? (total_return / partner.contributions.total_contribution) * 100 
          : 0
      };
    });

    return {
      scenario_name: 'Preferred Return',
      description: `${split_structure.preferred_return_rate}% preferred return on cash invested, then profit split`,
      partner_returns,
      scenario_score: this.calculateScenarioScore(partner_returns, 'preferred_return')
    };
  }

  calculateScenarioScore(partner_returns, scenario_type) {
    // Score based on fairness, feasibility, and partner satisfaction
    let score = 50;
    
    // Check for reasonable ROI distribution
    const rois = partner_returns.map(p => p.roi_percentage || 0);
    const roi_variance = this.calculateVariance(rois);
    
    // Lower variance in ROIs generally indicates fairer distribution
    if (roi_variance < 100) score += 20;
    else if (roi_variance < 500) score += 10;
    else score -= 10;
    
    // Check for negative returns
    const negative_returns = partner_returns.filter(p => (p.return || 0) < 0).length;
    if (negative_returns === 0) score += 15;
    else score -= negative_returns * 10;
    
    // Scenario-specific adjustments
    switch (scenario_type) {
      case 'contribution':
        score += 10; // Bonus for being contribution-based
        break;
      case 'value_weighted':
        score += 15; // Bonus for considering value-add
        break;
      case 'preferred_return':
        score += 5; // Conservative bonus for structured approach
        break;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  analyzeFairness(partner_analysis, split_scenarios) {
    const fairness_metrics = {
      overall_fairness_score: 0,
      contribution_alignment: 0,
      value_add_recognition: 0,
      risk_reward_balance: 0,
      potential_disputes: []
    };

    // Calculate overall fairness based on individual partner fairness scores
    const avg_fairness = partner_analysis.reduce((sum, p) => sum + p.fairness_score, 0) / partner_analysis.length;
    fairness_metrics.overall_fairness_score = Math.round(avg_fairness);

    // Contribution alignment
    const total_contribution = partner_analysis.reduce((sum, p) => sum + p.contributions.total_contribution, 0);
    let contribution_alignment = 0;
    
    partner_analysis.forEach(partner => {
      const contribution_pct = total_contribution > 0 ? (partner.contributions.total_contribution / total_contribution) * 100 : 0;
      const split_pct = partner.returns.split_percentage;
      const alignment = 100 - Math.abs(contribution_pct - split_pct);
      contribution_alignment += alignment;
    });
    fairness_metrics.contribution_alignment = Math.round(contribution_alignment / partner_analysis.length);

    // Value-add recognition
    const total_value_score = partner_analysis.reduce((sum, p) => sum + p.value_add_score, 0);
    let value_recognition = 0;
    
    partner_analysis.forEach(partner => {
      const value_pct = total_value_score > 0 ? (partner.value_add_score / total_value_score) * 100 : 0;
      const split_pct = partner.returns.split_percentage;
      
      // Higher value-add should generally correlate with higher split
      if (value_pct > 0) {
        const recognition = Math.min(100, (split_pct / value_pct) * 50);
        value_recognition += recognition;
      }
    });
    fairness_metrics.value_add_recognition = Math.round(value_recognition / partner_analysis.length);

    // Identify potential disputes
    partner_analysis.forEach(partner => {
      if (partner.fairness_score < 60) {
        fairness_metrics.potential_disputes.push({
          partner_id: partner.partner_id,
          partner_name: partner.partner_name,
          issue: 'Low fairness score - split may not align with contributions',
          severity: partner.fairness_score < 40 ? 'High' : 'Medium',
          suggested_action: 'Review split percentage relative to total contribution and value-add'
        });
      }

      // Check for disproportionate risk/reward
      const high_risk_roles = ['general_partner', 'project_manager'];
      if (high_risk_roles.includes(partner.role) && partner.returns.split_percentage < 30) {
        fairness_metrics.potential_disputes.push({
          partner_id: partner.partner_id,
          partner_name: partner.partner_name,
          issue: 'High responsibility role with potentially low compensation',
          severity: 'Medium',
          suggested_action: 'Consider management fees or higher profit split for operational partners'
        });
      }
    });

    // Risk-reward balance
    const high_risk_partners = partner_analysis.filter(p => p.risk_factors.length > 0);
    let risk_reward_balance = 100;
    
    high_risk_partners.forEach(partner => {
      const risk_level = partner.risk_factors.some(r => r.level === 'High') ? 3 : 2;
      const expected_return_multiple = partner.returns.partner_roi / 100;
      
      // High risk should correlate with higher returns
      if (risk_level > 2 && expected_return_multiple < 0.2) {
        risk_reward_balance -= 20;
      }
    });
    fairness_metrics.risk_reward_balance = Math.max(0, risk_reward_balance);

    return fairness_metrics;
  }

  assessRisks(partner_analysis, risk_allocation) {
    const risks = [];

    // Partnership structure risks
    risks.push({
      category: 'Partnership Structure',
      level: 'Medium',
      description: 'Multiple partners increase complexity and potential for disputes',
      mitigation: 'Establish clear operating agreement with dispute resolution mechanisms'
    });

    // Capital risk
    const total_cash = partner_analysis.reduce((sum, p) => sum + (p.contributions.cash_contribution || 0), 0);
    if (total_cash > 500000) {
      risks.push({
        category: 'Capital Risk',
        level: 'High',
        description: 'Large capital investment concentrated in single project',
        mitigation: 'Consider phased investment or additional investors to spread risk'
      });
    }

    // Management risk
    const managing_partners = partner_analysis.filter(p => 
      ['general_partner', 'project_manager'].includes(p.role)
    );
    
    if (managing_partners.length === 0) {
      risks.push({
        category: 'Management Risk',
        level: 'High',
        description: 'No clearly designated managing partner',
        mitigation: 'Assign clear management responsibilities and decision-making authority'
      });
    } else if (managing_partners.length > 1) {
      risks.push({
        category: 'Management Risk',
        level: 'Medium',
        description: 'Multiple managing partners may create conflicts',
        mitigation: 'Define clear areas of responsibility and tie-breaking mechanisms'
      });
    }

    // Exit strategy risk
    risks.push({
      category: 'Exit Strategy',
      level: 'Medium',
      description: 'Partners may have different exit timeline preferences',
      mitigation: 'Establish buy-out provisions and exit strategy agreement upfront'
    });

    // Legal structure risk
    risks.push({
      category: 'Legal Structure',
      level: 'Medium',
      description: 'Improper legal structure may expose partners to liability',
      mitigation: 'Consult with attorney to establish appropriate entity (LLC, Partnership, etc.)'
    });

    return {
      identified_risks: risks,
      overall_risk_level: this.calculateOverallRiskLevel(risks),
      risk_mitigation_priority: this.prioritizeRiskMitigation(risks)
    };
  }

  projectCashFlows(project_details, partner_analysis, split_structure) {
    const duration_months = project_details.project_duration_months || 12;
    const monthly_projections = [];

    // Simplified cash flow projection
    for (let month = 1; month <= duration_months; month++) {
      const is_investment_month = month <= 3; // Assume investment in first 3 months
      const is_exit_month = month === duration_months;

      const monthly_cash_flow = {
        month,
        total_cash_out: is_investment_month ? project_details.total_investment / 3 : 0,
        total_cash_in: is_exit_month ? project_details.total_investment + project_details.expected_profit : 0,
        net_cash_flow: 0,
        partner_distributions: []
      };

      // Calculate partner-specific cash flows
      partner_analysis.forEach(partner => {
        const partner_investment = is_investment_month ? partner.contributions.cash_contribution / 3 : 0;
        const partner_return = is_exit_month ? partner.returns.total_expected_return : 0;
        
        monthly_cash_flow.partner_distributions.push({
          partner_id: partner.partner_id,
          cash_out: partner_investment,
          cash_in: partner_return,
          net: partner_return - partner_investment
        });
      });

      monthly_cash_flow.net_cash_flow = monthly_cash_flow.total_cash_in - monthly_cash_flow.total_cash_out;
      monthly_projections.push(monthly_cash_flow);
    }

    return {
      monthly_projections,
      summary: {
        total_investment: project_details.total_investment,
        total_returns: project_details.total_investment + project_details.expected_profit,
        net_profit: project_details.expected_profit,
        project_irr: this.calculateProjectIRR(monthly_projections)
      }
    };
  }

  analyzeExitStrategies(project_details, partner_analysis, management_structure) {
    const exit_strategies = [];

    // Sale exit
    exit_strategies.push({
      strategy: 'Sale',
      description: 'Sell property and distribute proceeds according to partnership agreement',
      timeline: `${project_details.project_duration_months || 12} months`,
      pros: ['Clean exit', 'Immediate liquidity', 'Clear profit distribution'],
      cons: ['Market timing risk', 'Transaction costs', 'Capital gains taxes'],
      suitability_score: 85
    });

    // Refinance and hold
    if (project_details.project_type !== 'fix_flip') {
      exit_strategies.push({
        strategy: 'Refinance and Hold',
        description: 'Refinance to return capital, hold for cash flow',
        timeline: 'Ongoing',
        pros: ['Retain ownership', 'Ongoing cash flow', 'Potential appreciation'],
        cons: ['Ongoing management', 'Market risk', 'Partner coordination needed'],
        suitability_score: 70
      });
    }

    // Buyout provisions
    exit_strategies.push({
      strategy: 'Partner Buyout',
      description: 'One partner buys out others based on agreed valuation',
      timeline: 'Variable',
      pros: ['Flexibility', 'Avoid forced sale', 'Reward active partners'],
      cons: ['Valuation disputes', 'Financing requirements', 'Complex negotiations'],
      suitability_score: 60
    });

    return {
      available_strategies: exit_strategies,
      recommended_strategy: exit_strategies.reduce((best, current) => 
        current.suitability_score > best.suitability_score ? current : best
      ),
      exit_provisions_needed: [
        'Right of first refusal',
        'Valuation methodology',
        'Forced sale triggers',
        'Distribution waterfall',
        'Dispute resolution process'
      ]
    };
  }

  identifyLegalConsiderations(partners, management_structure) {
    const considerations = [];

    // Entity structure
    considerations.push({
      category: 'Entity Structure',
      priority: 'High',
      consideration: 'Choose appropriate legal entity (LLC, LP, Corporation)',
      details: 'LLC typically preferred for real estate JVs due to flexibility and tax benefits'
    });

    // Operating agreement
    considerations.push({
      category: 'Operating Agreement',
      priority: 'High',
      consideration: 'Draft comprehensive operating agreement',
      details: 'Must cover management, distributions, transfers, dissolution, and dispute resolution'
    });

    // Securities compliance
    if (partners.length > 2) {
      considerations.push({
        category: 'Securities Law',
        priority: 'High',
        consideration: 'Review securities law compliance',
        details: 'Large partnerships may trigger securities registration requirements'
      });
    }

    // Tax elections
    considerations.push({
      category: 'Tax Structure',
      priority: 'Medium',
      consideration: 'Make appropriate tax elections',
      details: 'Consider partnership tax treatment vs. corporate taxation'
    });

    // Personal guarantees
    const guarantors = partners.filter(p => p.guarantor_liability);
    if (guarantors.length > 0) {
      considerations.push({
        category: 'Personal Guarantees',
        priority: 'High',
        consideration: 'Document personal guarantee terms and limits',
        details: 'Clearly define scope, duration, and release conditions'
      });
    }

    return {
      legal_requirements: considerations,
      recommended_professionals: [
        'Real Estate Attorney',
        'Tax Accountant/CPA',
        'Securities Attorney (if applicable)'
      ],
      estimated_legal_costs: this.estimateLegalCosts(partners.length, management_structure)
    };
  }

  performScenarioAnalysis(project_details, partner_analysis, split_structure) {
    const scenarios = [
      {
        name: 'Best Case',
        profit_multiplier: 1.5,
        description: 'Project exceeds expectations by 50%'
      },
      {
        name: 'Base Case',
        profit_multiplier: 1.0,
        description: 'Project meets expectations'
      },
      {
        name: 'Worst Case',
        profit_multiplier: 0.5,
        description: 'Project underperforms by 50%'
      },
      {
        name: 'Break Even',
        profit_multiplier: 0.0,
        description: 'Project breaks even (no profit)'
      }
    ];

    return scenarios.map(scenario => {
      const adjusted_profit = project_details.expected_profit * scenario.profit_multiplier;
      const scenario_returns = partner_analysis.map(partner => {
        const adjusted_return = (adjusted_profit * partner.returns.split_percentage) / 100;
        const total_return = partner.contributions.total_contribution + adjusted_return;
        const roi = partner.contributions.total_contribution > 0 
          ? (adjusted_return / partner.contributions.total_contribution) * 100 
          : 0;

        return {
          partner_id: partner.partner_id,
          partner_name: partner.partner_name,
          investment: partner.contributions.total_contribution,
          return: adjusted_return,
          total_return,
          roi_percentage: roi
        };
      });

      return {
        scenario_name: scenario.name,
        description: scenario.description,
        total_profit: adjusted_profit,
        partner_returns: scenario_returns,
        scenario_health: this.assessScenarioHealth(scenario_returns)
      };
    });
  }

  performSensitivityAnalysis(project_details, partner_analysis) {
    const sensitivity_variables = [
      { name: 'Total Investment', base_value: project_details.total_investment, range: [-20, -10, 0, 10, 20] },
      { name: 'Expected Profit', base_value: project_details.expected_profit, range: [-50, -25, 0, 25, 50] },
      { name: 'Project Duration', base_value: project_details.project_duration_months || 12, range: [-3, -1, 0, 3, 6] }
    ];

    return sensitivity_variables.map(variable => {
      const sensitivity_results = variable.range.map(percentage_change => {
        const adjusted_value = variable.base_value * (1 + percentage_change / 100);
        
        // Recalculate partner returns based on adjusted variable
        let impact_multiplier = 1;
        if (variable.name === 'Expected Profit') {
          impact_multiplier = adjusted_value / variable.base_value;
        }

        const adjusted_returns = partner_analysis.map(partner => {
          const adjusted_return = partner.returns.expected_return * impact_multiplier;
          const roi = partner.contributions.total_contribution > 0 
            ? (adjusted_return / partner.contributions.total_contribution) * 100 
            : 0;

          return {
            partner_id: partner.partner_id,
            return_change: adjusted_return - partner.returns.expected_return,
            roi_change: roi - partner.returns.partner_roi
          };
        });

        return {
          percentage_change,
          adjusted_value,
          partner_impacts: adjusted_returns
        };
      });

      return {
        variable: variable.name,
        base_value: variable.base_value,
        sensitivity_results
      };
    });
  }

  analyzeTaxImplications(partner_analysis, management_structure) {
    const tax_considerations = [];

    // Partnership taxation
    tax_considerations.push({
      category: 'Partnership Taxation',
      implication: 'Pass-through taxation - profits/losses flow to partners',
      planning_opportunity: 'Partners can use losses to offset other income'
    });

    // Depreciation allocation
    tax_considerations.push({
      category: 'Depreciation',
      implication: 'Depreciation deductions allocated based on ownership percentage',
      planning_opportunity: 'Higher-income partners may benefit more from depreciation'
    });

    // Management fees
    if (management_structure.management_fee > 0) {
      tax_considerations.push({
        category: 'Management Fees',
        implication: 'Management fees are ordinary income to recipient',
        planning_opportunity: 'Consider structuring as carried interest for capital gains treatment'
      });
    }

    return {
      tax_structure_analysis: tax_considerations,
      recommended_elections: [
        'Partnership tax treatment (Form 1065)',
        'Section 754 election for step-up basis',
        'Consider opportunity zone benefits if applicable'
      ],
      annual_tax_requirements: [
        'File partnership return (Form 1065)',
        'Issue K-1s to all partners',
        'Track basis adjustments',
        'Maintain capital account records'
      ]
    };
  }

  compareLegalStructures(project_details, partner_analysis) {
    const structures = [
      {
        structure: 'LLC',
        pros: ['Flexible management', 'Pass-through taxation', 'Limited liability', 'No corporate formalities'],
        cons: ['Self-employment tax on active members', 'Limited life in some states'],
        suitability_score: 90,
        formation_cost: 1500,
        ongoing_costs: 500
      },
      {
        structure: 'Limited Partnership',
        pros: ['Clear GP/LP distinction', 'No SE tax on LP distributions', 'Established case law'],
        cons: ['GP unlimited liability', 'More complex structure', 'Less operational flexibility'],
        suitability_score: 75,
        formation_cost: 2500,
        ongoing_costs: 750
      },
      {
        structure: 'Corporation + Partnership',
        pros: ['Corporate liability protection', 'Sophisticated tax planning', 'Easy transfer of interests'],
        cons: ['Double taxation risk', 'Complex structure', 'Higher compliance costs'],
        suitability_score: 50,
        formation_cost: 5000,
        ongoing_costs: 2000
      }
    ];

    return {
      structure_comparison: structures,
      recommended_structure: structures.reduce((best, current) => 
        current.suitability_score > best.suitability_score ? current : best
      ),
      decision_factors: [
        'Number of partners',
        'Active vs. passive involvement',
        'Tax considerations',
        'Future fundraising plans',
        'Exit strategy timeline'
      ]
    };
  }

  generateRecommendations(partner_analysis, split_scenarios, fairness_analysis, management_structure, risk_allocation) {
    const recommendations = [];

    // Split structure recommendations
    const best_scenario = split_scenarios.reduce((best, current) => 
      current.scenario_score > best.scenario_score ? current : best
    );
    
    recommendations.push({
      category: 'Split Structure',
      recommendation: `Consider the "${best_scenario.scenario_name}" approach`,
      reasoning: `This scenario scored ${best_scenario.scenario_score}/100 and provides the most balanced approach`,
      priority: 'High'
    });

    // Fairness improvements
    if (fairness_analysis.overall_fairness_score < 70) {
      recommendations.push({
        category: 'Fairness',
        recommendation: 'Review and adjust partner splits',
        reasoning: `Overall fairness score of ${fairness_analysis.overall_fairness_score}/100 suggests potential issues`,
        priority: 'High'
      });
    }

    // Management structure
    const managing_partners = partner_analysis.filter(p => 
      ['general_partner', 'project_manager'].includes(p.role)
    );
    
    if (managing_partners.length === 0) {
      recommendations.push({
        category: 'Management',
        recommendation: 'Designate a managing partner or project manager',
        reasoning: 'Clear management structure is essential for project success',
        priority: 'High'
      });
    }

    // Risk mitigation
    const high_risk_partners = partner_analysis.filter(p => 
      p.risk_factors.some(r => r.level === 'High')
    );
    
    if (high_risk_partners.length > 0) {
      recommendations.push({
        category: 'Risk Management',
        recommendation: 'Address high-risk partner situations',
        reasoning: `${high_risk_partners.length} partners have high-risk exposures that need mitigation`,
        priority: 'High'
      });
    }

    // Legal documentation
    recommendations.push({
      category: 'Legal',
      recommendation: 'Engage qualified legal counsel',
      reasoning: 'Professional documentation is critical for partnership success and dispute prevention',
      priority: 'High'
    });

    // Performance tracking
    recommendations.push({
      category: 'Operations',
      recommendation: 'Establish regular reporting and communication protocols',
      reasoning: 'Regular updates help maintain partner alignment and identify issues early',
      priority: 'Medium'
    });

    return {
      recommendations,
      implementation_timeline: this.createImplementationTimeline(recommendations),
      success_metrics: [
        'All partners sign operating agreement',
        'Project milestones met on schedule',
        'Regular partner communications maintained',
        'No major disputes or conflicts',
        'Project achieves target returns'
      ]
    };
  }

  // Helper methods
  calculateVariance(numbers) {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDifferences.reduce((sum, sq) => sum + sq, 0) / numbers.length;
  }

  calculateOverallRiskLevel(risks) {
    const high_risks = risks.filter(r => r.level === 'High').length;
    const medium_risks = risks.filter(r => r.level === 'Medium').length;
    
    if (high_risks >= 2) return 'High';
    if (high_risks >= 1 || medium_risks >= 3) return 'Medium';
    return 'Low';
  }

  prioritizeRiskMitigation(risks) {
    return risks
      .sort((a, b) => {
        const priority_order = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priority_order[b.level] - priority_order[a.level];
      })
      .slice(0, 3); // Top 3 priorities
  }

  calculateProjectIRR(monthly_projections) {
    // Simplified IRR calculation
    const cash_flows = monthly_projections.map(month => month.net_cash_flow);
    
    // Simple approximation - in practice would use iterative calculation
    const total_investment = Math.abs(cash_flows.filter(cf => cf < 0).reduce((sum, cf) => sum + cf, 0));
    const total_returns = cash_flows.filter(cf => cf > 0).reduce((sum, cf) => sum + cf, 0);
    const duration_years = monthly_projections.length / 12;
    
    if (total_investment === 0 || duration_years === 0) return 0;
    
    const irr = Math.pow(total_returns / total_investment, 1 / duration_years) - 1;
    return Math.round(irr * 100 * 10) / 10;
  }

  assessScenarioHealth(scenario_returns) {
    const negative_returns = scenario_returns.filter(r => r.return < 0).length;
    const low_roi_returns = scenario_returns.filter(r => r.roi_percentage < 10).length;
    
    if (negative_returns === 0 && low_roi_returns === 0) return 'Excellent';
    if (negative_returns === 0 && low_roi_returns <= 1) return 'Good';
    if (negative_returns <= 1) return 'Fair';
    return 'Poor';
  }

  estimateLegalCosts(partner_count, management_structure) {
    let base_cost = 3000; // Base LLC formation and operating agreement
    
    // Additional cost per partner beyond 2
    if (partner_count > 2) {
      base_cost += (partner_count - 2) * 500;
    }
    
    // Complex management structures
    if (management_structure.management_fee || management_structure.performance_fee) {
      base_cost += 1500;
    }
    
    return {
      formation_costs: base_cost,
      ongoing_legal_costs: Math.round(base_cost * 0.2), // 20% annually
      total_first_year: Math.round(base_cost * 1.2)
    };
  }

  createImplementationTimeline(recommendations) {
    const timeline = [];
    
    // Sort by priority
    const high_priority = recommendations.filter(r => r.priority === 'High');
    const medium_priority = recommendations.filter(r => r.priority === 'Medium');
    
    // Phase 1: Critical items (0-2 weeks)
    timeline.push({
      phase: 'Phase 1 (0-2 weeks)',
      tasks: high_priority.slice(0, 2).map(r => r.recommendation)
    });
    
    // Phase 2: Important items (2-6 weeks)
    timeline.push({
      phase: 'Phase 2 (2-6 weeks)',
      tasks: [...high_priority.slice(2), ...medium_priority.slice(0, 2)].map(r => r.recommendation)
    });
    
    // Phase 3: Remaining items (6-12 weeks)
    timeline.push({
      phase: 'Phase 3 (6-12 weeks)',
      tasks: medium_priority.slice(2).map(r => r.recommendation)
    });
    
    return timeline;
  }
}