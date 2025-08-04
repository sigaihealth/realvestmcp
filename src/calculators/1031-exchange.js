/**
 * 1031 Exchange Calculator
 * Analyzes like-kind exchange tax benefits and qualification requirements
 */

export class Exchange1031Calculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        relinquished_property: {
          type: 'object',
          properties: {
            sale_price: { type: 'number', minimum: 0, description: 'Sale price of relinquished property' },
            original_cost_basis: { type: 'number', minimum: 0, description: 'Original cost basis' },
            improvements_made: { type: 'number', minimum: 0, description: 'Capital improvements made' },
            depreciation_taken: { type: 'number', minimum: 0, description: 'Total depreciation taken' },
            selling_expenses: { type: 'number', minimum: 0, description: 'Real estate commissions and selling costs' },
            property_type: {
              type: 'string',
              enum: ['residential_rental', 'commercial', 'industrial', 'land', 'multi_family'],
              description: 'Type of relinquished property'
            },
            ownership_years: { type: 'number', minimum: 1, description: 'Years owned' }
          },
          required: ['sale_price', 'original_cost_basis']
        },
        replacement_property: {
          type: 'object',
          properties: {
            purchase_price: { type: 'number', minimum: 0, description: 'Purchase price of replacement property' },
            closing_costs: { type: 'number', minimum: 0, description: 'Closing costs and acquisition expenses' },
            improvement_budget: { type: 'number', minimum: 0, description: 'Planned improvements to replacement property' },
            property_type: {
              type: 'string',
              enum: ['residential_rental', 'commercial', 'industrial', 'land', 'multi_family'],
              description: 'Type of replacement property'
            },
            financing: {
              type: 'object',
              properties: {
                loan_amount: { type: 'number', minimum: 0, description: 'New loan amount' },
                interest_rate: { type: 'number', minimum: 0, maximum: 30, description: 'Interest rate (%)' },
                loan_term_years: { type: 'number', minimum: 1, maximum: 30, description: 'Loan term in years' }
              }
            }
          },
          required: ['purchase_price']
        },
        taxpayer_info: {
          type: 'object',
          properties: {
            filing_status: {
              type: 'string',
              enum: ['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household'],
              description: 'Tax filing status'
            },
            ordinary_income: { type: 'number', minimum: 0, description: 'Ordinary income for the year' },
            state: { type: 'string', description: 'State for tax calculations' },
            depreciation_recapture_rate: { type: 'number', minimum: 0, maximum: 50, description: 'Depreciation recapture tax rate (%)' },
            capital_gains_rate: { type: 'number', minimum: 0, maximum: 50, description: 'Capital gains tax rate (%)' }
          }
        },
        exchange_details: {
          type: 'object',
          properties: {
            qualified_intermediary_fee: { type: 'number', minimum: 0, description: 'QI fees and exchange costs' },
            exchange_type: {
              type: 'string',
              enum: ['simultaneous', 'delayed', 'reverse', 'build_to_suit'],
              description: 'Type of 1031 exchange'
            },
            identification_period_days: { type: 'number', minimum: 1, maximum: 45, description: 'Days to identify replacement property' },
            exchange_period_days: { type: 'number', minimum: 1, maximum: 180, description: 'Days to complete exchange' }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            alternative_scenario: {
              type: 'string',
              enum: ['taxable_sale', 'installment_sale', 'charitable_remainder_trust'],
              description: 'Alternative scenario to compare'
            },
            holding_period_years: { type: 'number', minimum: 1, maximum: 30, description: 'Planned holding period for replacement property' },
            net_investment_income_tax: { type: 'boolean', description: 'Subject to 3.8% NIIT' }
          }
        }
      },
      required: ['relinquished_property', 'replacement_property']
    };
  }

  calculate(params) {
    const { 
      relinquished_property, 
      replacement_property, 
      taxpayer_info = {}, 
      exchange_details = {},
      analysis_options = {}
    } = params;
    
    // Set defaults
    const qi_fee = exchange_details.qualified_intermediary_fee || 3000;
    const depreciation_recapture_rate = taxpayer_info.depreciation_recapture_rate || 25;
    const capital_gains_rate = taxpayer_info.capital_gains_rate || 20;
    const niit_rate = analysis_options.net_investment_income_tax ? 3.8 : 0;
    const holding_period = analysis_options.holding_period_years || 10;
    
    // Calculate relinquished property metrics
    const adjusted_basis = relinquished_property.original_cost_basis + 
                          (relinquished_property.improvements_made || 0) - 
                          (relinquished_property.depreciation_taken || 0);
    
    const net_sale_proceeds = relinquished_property.sale_price - 
                             (relinquished_property.selling_expenses || 0);
    
    const total_gain = net_sale_proceeds - adjusted_basis;
    const depreciation_recapture = Math.min(
      relinquished_property.depreciation_taken || 0, 
      Math.max(0, total_gain)
    );
    const capital_gain = Math.max(0, total_gain - depreciation_recapture);
    
    // Calculate tax implications without exchange
    const taxable_scenario = this.calculateTaxableScenario(
      depreciation_recapture,
      capital_gain,
      depreciation_recapture_rate,
      capital_gains_rate,
      niit_rate
    );
    
    // Calculate 1031 exchange requirements
    const exchange_requirements = this.calculate1031Requirements(
      net_sale_proceeds,
      replacement_property,
      qi_fee
    );
    
    // Calculate cash flow impact
    const cash_flow_analysis = this.calculateCashFlowImpact(
      relinquished_property,
      replacement_property,
      exchange_requirements,
      taxable_scenario
    );
    
    // Calculate long-term benefits
    const long_term_benefits = this.calculateLongTermBenefits(
      exchange_requirements.deferred_tax,
      replacement_property,
      holding_period,
      capital_gains_rate
    );
    
    // Qualification analysis
    const qualification_analysis = this.analyzeQualification(
      relinquished_property,
      replacement_property,
      exchange_details
    );
    
    // Risk analysis
    const risk_analysis = this.performRiskAnalysis(
      exchange_requirements,
      exchange_details,
      replacement_property
    );
    
    // Alternative scenarios
    const alternatives = this.calculateAlternatives(
      relinquished_property,
      replacement_property,
      taxable_scenario,
      analysis_options
    );
    
    return {
      relinquished_property_analysis: {
        sale_price: relinquished_property.sale_price,
        adjusted_basis: adjusted_basis,
        net_proceeds: net_sale_proceeds,
        total_gain: total_gain,
        depreciation_recapture: depreciation_recapture,
        capital_gain: capital_gain
      },
      tax_analysis: {
        without_exchange: taxable_scenario,
        with_1031_exchange: {
          deferred_taxes: exchange_requirements.deferred_tax,
          immediate_tax_savings: taxable_scenario.total_tax,
          qi_fees: qi_fee,
          net_tax_benefit: taxable_scenario.total_tax - qi_fee
        }
      },
      exchange_requirements: exchange_requirements,
      cash_flow_analysis: cash_flow_analysis,
      qualification_analysis: qualification_analysis,
      long_term_analysis: long_term_benefits,
      risk_analysis: risk_analysis,
      alternative_scenarios: alternatives,
      recommendations: this.generateRecommendations(
        exchange_requirements,
        qualification_analysis,
        risk_analysis,
        taxable_scenario,
        replacement_property
      )
    };
  }
  
  calculateTaxableScenario(depreciation_recapture, capital_gain, 
                          recapture_rate, cg_rate, niit_rate) {
    const federal_depreciation_tax = depreciation_recapture * (recapture_rate / 100);
    const federal_capital_gains_tax = capital_gain * (cg_rate / 100);
    const niit_tax = (depreciation_recapture + capital_gain) * (niit_rate / 100);
    
    const total_federal_tax = federal_depreciation_tax + federal_capital_gains_tax + niit_tax;
    const estimated_state_tax = (depreciation_recapture + capital_gain) * 0.05; // 5% average
    const total_tax = total_federal_tax + estimated_state_tax;
    
    return {
      depreciation_recapture_tax: federal_depreciation_tax,
      capital_gains_tax: federal_capital_gains_tax,
      niit_tax: niit_tax,
      estimated_state_tax: estimated_state_tax,
      total_federal_tax: total_federal_tax,
      total_tax: total_tax
    };
  }
  
  calculate1031Requirements(net_proceeds, replacement_property, qi_fee) {
    const total_replacement_cost = replacement_property.purchase_price + 
                                  (replacement_property.closing_costs || 0) +
                                  (replacement_property.improvement_budget || 0);
    
    // Equal or greater value test
    const value_test_met = total_replacement_cost >= net_proceeds;
    const value_shortfall = Math.max(0, net_proceeds - total_replacement_cost);
    
    // Equal or greater debt test
    const old_loan_assumed = 0; // Assume paid off for simplicity
    const new_loan = replacement_property.financing?.loan_amount || 0;
    const debt_test_met = new_loan >= old_loan_assumed;
    
    // Boot calculation (taxable portion)
    const cash_boot = Math.max(0, net_proceeds - total_replacement_cost);
    const mortgage_boot = Math.max(0, old_loan_assumed - new_loan);
    const total_boot = cash_boot + mortgage_boot;
    
    // Exchange qualification
    const fully_qualified = value_test_met && debt_test_met && total_boot === 0;
    
    // Deferred tax calculation
    const exchange_percentage = fully_qualified ? 100 : 
                               Math.max(0, (total_replacement_cost - total_boot) / net_proceeds * 100);
    
    return {
      minimum_replacement_value: net_proceeds,
      actual_replacement_value: total_replacement_cost,
      value_test_met: value_test_met,
      value_shortfall: value_shortfall,
      debt_test_met: debt_test_met,
      cash_boot: cash_boot,
      mortgage_boot: mortgage_boot,
      total_boot: total_boot,
      fully_qualified: fully_qualified,
      exchange_percentage: exchange_percentage,
      deferred_tax: 0, // Will be calculated based on gain
      qi_fee: qi_fee
    };
  }
  
  calculateCashFlowImpact(relinquished_prop, replacement_prop, exchange_req, taxable_scenario) {
    const cash_from_sale = relinquished_prop.sale_price - 
                          (relinquished_prop.selling_expenses || 0);
    
    const cash_needed = replacement_prop.purchase_price + 
                       (replacement_prop.closing_costs || 0) +
                       (replacement_prop.improvement_budget || 0) +
                       exchange_req.qi_fee;
    
    const new_loan = replacement_prop.financing?.loan_amount || 0;
    const cash_required = cash_needed - new_loan;
    
    // With 1031 exchange
    const exchange_cash_position = cash_from_sale - cash_required;
    
    // Without 1031 exchange (after taxes)
    const taxable_cash_position = cash_from_sale - taxable_scenario.total_tax - cash_required;
    
    const cash_advantage = exchange_cash_position - taxable_cash_position;
    
    return {
      cash_from_sale: cash_from_sale,
      cash_needed_for_replacement: cash_required,
      with_1031_exchange: {
        available_cash: exchange_cash_position,
        cash_remaining: Math.max(0, exchange_cash_position)
      },
      without_1031_exchange: {
        available_cash: taxable_cash_position,
        cash_remaining: Math.max(0, taxable_cash_position)
      },
      cash_advantage_of_1031: cash_advantage,
      additional_borrowing_capacity: taxable_scenario.total_tax
    };
  }
  
  calculateLongTermBenefits(deferred_tax, replacement_prop, holding_period, cg_rate) {
    const property_value = replacement_prop.purchase_price;
    const annual_appreciation = 0.035; // 3.5% average
    const future_value = property_value * Math.pow(1 + annual_appreciation, holding_period);
    
    // Assume no additional depreciation recapture on replacement property
    const future_gain = future_value - property_value;
    const future_tax = future_gain * (cg_rate / 100);
    
    // Time value of deferred tax assuming 7% discount rate
    const discount_rate = 0.07;
    const present_value_of_future_tax = future_tax / Math.pow(1 + discount_rate, holding_period);
    
    const tax_deferral_benefit = deferred_tax - present_value_of_future_tax;
    
    return {
      holding_period_years: holding_period,
      projected_future_value: future_value,
      projected_future_gain: future_gain,
      projected_future_tax: future_tax,
      present_value_of_future_tax: present_value_of_future_tax,
      tax_deferral_benefit: tax_deferral_benefit,
      effective_tax_rate_reduction: holding_period > 10 ? 15 : 10 // Simplified
    };
  }
  
  analyzeQualification(relinquished_prop, replacement_prop, exchange_details) {
    const requirements = [];
    const potential_issues = [];
    
    // Like-kind requirement
    const like_kind_properties = ['residential_rental', 'commercial', 'industrial', 'multi_family'];
    const like_kind_qualified = like_kind_properties.includes(relinquished_prop.property_type) &&
                               like_kind_properties.includes(replacement_prop.property_type);
    
    requirements.push({
      requirement: 'Like-Kind Property',
      met: like_kind_qualified,
      description: 'Both properties must be held for investment or business use'
    });
    
    // Timing requirements
    const identification_days = exchange_details.identification_period_days || 45;
    const exchange_days = exchange_details.exchange_period_days || 180;
    
    requirements.push({
      requirement: '45-Day Identification Rule',
      met: identification_days <= 45,
      description: 'Must identify replacement property within 45 days'
    });
    
    requirements.push({
      requirement: '180-Day Exchange Rule',
      met: exchange_days <= 180,
      description: 'Must complete exchange within 180 days'
    });
    
    // Investment use requirement
    const investment_use = relinquished_prop.ownership_years >= 1;
    requirements.push({
      requirement: 'Investment/Business Use',
      met: investment_use,
      description: 'Property must be held for investment or business use'
    });
    
    // Potential disqualifying issues
    if (relinquished_prop.property_type === 'personal_residence') {
      potential_issues.push('Personal residence does not qualify for 1031 exchange');
    }
    
    if (replacement_prop.property_type === 'personal_residence') {
      potential_issues.push('Cannot exchange into personal residence');
    }
    
    const overall_qualification = requirements.every(req => req.met) && potential_issues.length === 0;
    
    return {
      overall_qualified: overall_qualification,
      requirements: requirements,
      potential_issues: potential_issues,
      qualification_percentage: (requirements.filter(req => req.met).length / requirements.length) * 100
    };
  }
  
  performRiskAnalysis(exchange_req, exchange_details, replacement_prop) {
    const risks = [];
    const mitigation_strategies = [];
    
    // Timing risk
    const exchange_type = exchange_details.exchange_type || 'delayed';
    if (exchange_type === 'delayed') {
      risks.push({
        risk: 'Timing Risk',
        level: 'Medium',
        description: 'Must identify and close on replacement property within strict deadlines'
      });
      mitigation_strategies.push('Have backup replacement properties identified');
    }
    
    // Market risk
    if (replacement_prop.purchase_price > 1000000) {
      risks.push({
        risk: 'Market Risk',
        level: 'Medium',
        description: 'High-value properties may have limited liquidity'
      });
    }
    
    // Financing risk
    if (replacement_prop.financing?.loan_amount > 0) {
      risks.push({
        risk: 'Financing Risk',
        level: 'Medium',
        description: 'Must secure financing within exchange period'
      });
      mitigation_strategies.push('Pre-qualify for financing before starting exchange');
    }
    
    // Boot risk
    if (exchange_req.total_boot > 0) {
      risks.push({
        risk: 'Taxable Boot',
        level: 'High',
        description: `$${exchange_req.total_boot.toLocaleString()} will be taxable`
      });
      mitigation_strategies.push('Increase replacement property value or add debt');
    }
    
    // Qualified Intermediary risk
    risks.push({
      risk: 'QI Risk',
      level: 'Low',
      description: 'Risk of QI mishandling exchange funds'
    });
    mitigation_strategies.push('Choose well-established, bonded qualified intermediary');
    
    const overall_risk_level = risks.some(r => r.level === 'High') ? 'High' :
                              risks.some(r => r.level === 'Medium') ? 'Medium' : 'Low';
    
    return {
      overall_risk_level: overall_risk_level,
      identified_risks: risks,
      mitigation_strategies: mitigation_strategies,
      success_probability: exchange_req.fully_qualified ? 85 : 70
    };
  }
  
  calculateAlternatives(relinquished_prop, replacement_prop, taxable_scenario, options) {
    const alternatives = [];
    
    // Taxable sale alternative
    alternatives.push({
      strategy: 'Taxable Sale',
      immediate_tax: taxable_scenario.total_tax,
      net_proceeds: relinquished_prop.sale_price - 
                   (relinquished_prop.selling_expenses || 0) - 
                   taxable_scenario.total_tax,
      pros: ['Immediate liquidity', 'No timing constraints', 'Flexibility in next investment'],
      cons: ['Immediate tax liability', 'Reduced reinvestment capital']
    });
    
    // Installment sale alternative
    if (options.alternative_scenario === 'installment_sale') {
      const installment_periods = 5;
      const annual_tax = taxable_scenario.total_tax / installment_periods;
      
      alternatives.push({
        strategy: 'Installment Sale',
        immediate_tax: 0,
        annual_tax: annual_tax,
        total_tax: taxable_scenario.total_tax,
        pros: ['Spread tax liability over time', 'Steady income stream'],
        cons: ['Interest rate risk', 'Buyer default risk', 'Still fully taxable']
      });
    }
    
    // Opportunity Zone investment
    alternatives.push({
      strategy: 'Opportunity Zone Investment',
      tax_deferral: taxable_scenario.capital_gains_tax,
      potential_tax_elimination: taxable_scenario.capital_gains_tax * 0.85, // 85% if held 10+ years
      pros: ['Tax deferral until 2026', 'Potential tax elimination', 'Economic development'],
      cons: ['Limited investment options', 'Regulatory complexity', 'New program risks']
    });
    
    return alternatives;
  }
  
  generateRecommendations(exchange_req, qualification, risk_analysis, 
                         taxable_scenario, replacement_prop) {
    const recommendations = [];
    
    // Primary recommendation
    if (qualification.overall_qualified && exchange_req.fully_qualified) {
      recommendations.push({
        category: 'Primary Strategy',
        priority: 'high',
        message: `Proceed with 1031 exchange - saves $${taxable_scenario.total_tax.toLocaleString()} in immediate taxes`
      });
    } else if (qualification.qualification_percentage > 80) {
      recommendations.push({
        category: 'Primary Strategy',
        priority: 'medium',
        message: 'Address qualification issues before proceeding with exchange'
      });
    } else {
      recommendations.push({
        category: 'Primary Strategy',
        priority: 'high',
        message: 'Consider taxable sale - exchange qualification uncertain'
      });
    }
    
    // Timing recommendations
    if (risk_analysis.identified_risks.some(r => r.risk === 'Timing Risk')) {
      recommendations.push({
        category: 'Timing',
        priority: 'high',
        message: 'Identify multiple backup properties and pre-arrange financing'
      });
    }
    
    // Value recommendations
    if (!exchange_req.value_test_met) {
      recommendations.push({
        category: 'Exchange Structure',
        priority: 'high',
        message: `Increase replacement property value by $${exchange_req.value_shortfall.toLocaleString()} to avoid boot`
      });
    }
    
    // Professional guidance
    recommendations.push({
      category: 'Professional Services',
      priority: 'high',
      message: 'Engage qualified intermediary and tax advisor before listing property'
    });
    
    // Long-term strategy
    if (replacement_prop.purchase_price > 2000000) {
      recommendations.push({
        category: 'Long-term Strategy',
        priority: 'medium',
        message: 'Consider diversifying into multiple smaller properties'
      });
    }
    
    return recommendations;
  }
}