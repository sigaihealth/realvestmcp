export class CapitalGainsTaxCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        property_details: {
          type: 'object',
          properties: {
            sale_price: { type: 'number', minimum: 0 },
            original_purchase_price: { type: 'number', minimum: 0 },
            purchase_date: { type: 'string' },
            sale_date: { type: 'string' },
            property_type: { 
              type: 'string', 
              enum: ['primary_residence', 'investment_property', 'vacation_home', 'commercial'] 
            }
          },
          required: ['sale_price', 'original_purchase_price', 'purchase_date', 'sale_date', 'property_type']
        },
        property_improvements: {
          type: 'object',
          properties: {
            capital_improvements: { type: 'number', minimum: 0 },
            selling_expenses: { type: 'number', minimum: 0 },
            buying_expenses: { type: 'number', minimum: 0 }
          }
        },
        depreciation_details: {
          type: 'object',
          properties: {
            total_depreciation_taken: { type: 'number', minimum: 0 },
            years_as_rental: { type: 'number', minimum: 0 },
            annual_depreciation: { type: 'number', minimum: 0 }
          }
        },
        taxpayer_profile: {
          type: 'object',
          properties: {
            filing_status: { 
              type: 'string', 
              enum: ['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household'] 
            },
            annual_income: { type: 'number', minimum: 0 },
            other_capital_gains: { type: 'number' },
            other_capital_losses: { type: 'number' },
            state_of_residence: { type: 'string' },
            years_in_primary_residence: { type: 'number', minimum: 0 }
          }
        },
        tax_strategies: {
          type: 'object',
          properties: {
            consider_1031_exchange: { type: 'boolean' },
            installment_sale_option: { type: 'boolean' },
            charitable_remainder_trust: { type: 'boolean' },
            opportunity_zone_investment: { type: 'boolean' },
            harvest_losses: { type: 'boolean' }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            compare_tax_years: { type: 'boolean' },
            state_tax_analysis: { type: 'boolean' },
            strategy_comparison: { type: 'boolean' },
            timing_optimization: { type: 'boolean' }
          }
        }
      },
      required: ['property_details', 'taxpayer_profile']
    };
  }

  calculate(params) {
    const {
      property_details,
      property_improvements = {},
      depreciation_details = {},
      taxpayer_profile,
      tax_strategies = {},
      analysis_options = {}
    } = params;

    // Calculate capital gain/loss
    const gain_loss_analysis = this.calculateCapitalGainLoss(
      property_details, 
      property_improvements, 
      depreciation_details
    );
    
    // Calculate tax liability
    const tax_calculation = this.calculateTaxLiability(
      gain_loss_analysis, 
      taxpayer_profile, 
      property_details
    );
    
    // Calculate state taxes if requested
    const state_tax_analysis = analysis_options.state_tax_analysis && taxpayer_profile.state_of_residence
      ? this.calculateStateTaxes(gain_loss_analysis, taxpayer_profile)
      : null;
    
    // Primary residence exclusion analysis
    const primary_residence_analysis = property_details.property_type === 'primary_residence'
      ? this.analyzePrimaryResidenceExclusion(gain_loss_analysis, taxpayer_profile)
      : null;
    
    // Tax strategy analysis
    const strategy_analysis = analysis_options.strategy_comparison
      ? this.analyzeStrategies(gain_loss_analysis, tax_calculation, tax_strategies, taxpayer_profile)
      : null;
    
    // Timing optimization
    const timing_analysis = analysis_options.timing_optimization
      ? this.optimizeTiming(gain_loss_analysis, taxpayer_profile, property_details)
      : null;
    
    // Year comparison
    const year_comparison = analysis_options.compare_tax_years
      ? this.compareAcrossTaxYears(gain_loss_analysis, taxpayer_profile)
      : null;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      gain_loss_analysis,
      tax_calculation,
      primary_residence_analysis,
      strategy_analysis,
      taxpayer_profile
    );

    return {
      transaction_summary: {
        sale_price: property_details.sale_price,
        purchase_price: property_details.original_purchase_price,
        holding_period: this.calculateHoldingPeriod(property_details.purchase_date, property_details.sale_date),
        property_type: property_details.property_type,
        gain_or_loss: gain_loss_analysis.net_capital_gain,
        gain_type: gain_loss_analysis.net_capital_gain > 0 ? 'Capital Gain' : 'Capital Loss'
      },
      gain_loss_analysis,
      tax_calculation,
      state_tax_analysis,
      primary_residence_analysis,
      strategy_analysis,
      timing_analysis,
      year_comparison,
      recommendations
    };
  }

  calculateCapitalGainLoss(property_details, improvements = {}, depreciation = {}) {
    const {
      sale_price,
      original_purchase_price,
      purchase_date,
      sale_date
    } = property_details;

    const {
      capital_improvements = 0,
      selling_expenses = 0,
      buying_expenses = 0
    } = improvements;

    const {
      total_depreciation_taken = 0
    } = depreciation;

    // Calculate adjusted basis
    const adjusted_basis = original_purchase_price + capital_improvements + buying_expenses - total_depreciation_taken;
    
    // Calculate net proceeds
    const net_proceeds = sale_price - selling_expenses;
    
    // Calculate gains
    const gross_capital_gain = net_proceeds - adjusted_basis;
    const depreciation_recapture = Math.min(total_depreciation_taken, Math.max(0, gross_capital_gain));
    const capital_gain_after_recapture = Math.max(0, gross_capital_gain - depreciation_recapture);
    
    // Determine holding period
    const holding_period = this.calculateHoldingPeriod(purchase_date, sale_date);
    const is_long_term = holding_period.total_days >= 365;

    return {
      original_basis: original_purchase_price,
      capital_improvements,
      buying_expenses,
      selling_expenses,
      total_depreciation_taken,
      adjusted_basis,
      net_proceeds,
      gross_capital_gain,
      depreciation_recapture,
      capital_gain_after_recapture,
      net_capital_gain: gross_capital_gain,
      holding_period,
      is_long_term,
      gain_breakdown: {
        ordinary_income: depreciation_recapture,
        capital_gain: capital_gain_after_recapture,
        total_gain: gross_capital_gain
      }
    };
  }

  calculateHoldingPeriod(purchase_date, sale_date) {
    const purchase = new Date(purchase_date);
    const sale = new Date(sale_date);
    const total_days = Math.floor((sale - purchase) / (1000 * 60 * 60 * 24));
    const years = Math.floor(total_days / 365);
    const remaining_days = total_days % 365;
    const months = Math.floor(remaining_days / 30);

    return {
      total_days,
      years,
      months,
      display: `${years} years, ${months} months`
    };
  }

  calculateTaxLiability(gain_analysis, taxpayer_profile, property_details) {
    const { filing_status, annual_income, other_capital_gains = 0, other_capital_losses = 0 } = taxpayer_profile;
    const { net_capital_gain, depreciation_recapture, capital_gain_after_recapture, is_long_term } = gain_analysis;

    // For primary residence, apply exclusion first
    let taxable_gain = net_capital_gain;
    if (property_details.property_type === 'primary_residence') {
      const primary_analysis = this.analyzePrimaryResidenceExclusion(gain_analysis, taxpayer_profile);
      taxable_gain = primary_analysis.taxable_gain_after_exclusion;
    }

    // Get tax brackets and rates
    const tax_brackets = this.getTaxBrackets(filing_status);
    const ltcg_brackets = this.getLongTermCapitalGainsBrackets(filing_status);
    
    // Calculate net capital position using taxable gain
    const net_capital_position = taxable_gain + other_capital_gains - Math.abs(other_capital_losses);
    
    let federal_tax = 0;
    let depreciation_recapture_tax = 0;
    let capital_gains_tax = 0;
    let net_investment_income_tax = 0;

    if (net_capital_position > 0) {
      // Depreciation recapture at 25% (or ordinary rate if lower)
      const ordinary_rate = this.getOrdinaryTaxRate(annual_income, tax_brackets);
      const recapture_rate = Math.min(0.25, ordinary_rate);
      depreciation_recapture_tax = depreciation_recapture * recapture_rate;

      // Capital gains tax
      if (is_long_term && capital_gain_after_recapture > 0) {
        const ltcg_rate = this.getLongTermCapitalGainsRate(annual_income, ltcg_brackets);
        capital_gains_tax = capital_gain_after_recapture * ltcg_rate;
      } else if (capital_gain_after_recapture > 0) {
        // Short-term capital gains taxed as ordinary income
        capital_gains_tax = capital_gain_after_recapture * ordinary_rate;
      }

      // Net Investment Income Tax (3.8% for high earners)
      if (this.isSubjectToNIIT(annual_income, filing_status)) {
        const niit_gain = Math.max(0, net_capital_position);
        net_investment_income_tax = niit_gain * 0.038;
      }

      federal_tax = depreciation_recapture_tax + capital_gains_tax + net_investment_income_tax;
    }

    // Calculate effective tax rate
    const effective_rate = net_capital_position > 0 ? (federal_tax / net_capital_position) * 100 : 0;

    return {
      net_capital_position,
      federal_tax_liability: Math.round(federal_tax),
      tax_breakdown: {
        depreciation_recapture_tax: Math.round(depreciation_recapture_tax),
        capital_gains_tax: Math.round(capital_gains_tax),
        net_investment_income_tax: Math.round(net_investment_income_tax)
      },
      effective_tax_rate: Math.round(effective_rate * 100) / 100,
      marginal_rates: {
        ordinary_rate: Math.round(this.getOrdinaryTaxRate(annual_income, tax_brackets) * 100),
        ltcg_rate: is_long_term ? Math.round(this.getLongTermCapitalGainsRate(annual_income, ltcg_brackets) * 100) : null,
        depreciation_recapture_rate: 25
      },
      after_tax_proceeds: Math.round(gain_analysis.net_proceeds - federal_tax)
    };
  }

  getTaxBrackets(filing_status) {
    // 2024 tax brackets (simplified)
    const brackets = {
      single: [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: 95375, rate: 0.22 },
        { min: 95375, max: 182050, rate: 0.24 },
        { min: 182050, max: 231250, rate: 0.32 },
        { min: 231250, max: 578125, rate: 0.35 },
        { min: 578125, max: Infinity, rate: 0.37 }
      ],
      married_filing_jointly: [
        { min: 0, max: 22000, rate: 0.10 },
        { min: 22000, max: 89450, rate: 0.12 },
        { min: 89450, max: 190750, rate: 0.22 },
        { min: 190750, max: 364200, rate: 0.24 },
        { min: 364200, max: 462500, rate: 0.32 },
        { min: 462500, max: 693750, rate: 0.35 },
        { min: 693750, max: Infinity, rate: 0.37 }
      ]
    };

    return brackets[filing_status] || brackets.single;
  }

  getLongTermCapitalGainsBrackets(filing_status) {
    // 2024 long-term capital gains brackets
    const brackets = {
      single: [
        { min: 0, max: 44625, rate: 0.00 },
        { min: 44625, max: 492300, rate: 0.15 },
        { min: 492300, max: Infinity, rate: 0.20 }
      ],
      married_filing_jointly: [
        { min: 0, max: 89250, rate: 0.00 },
        { min: 89250, max: 553850, rate: 0.15 },
        { min: 553850, max: Infinity, rate: 0.20 }
      ]
    };

    return brackets[filing_status] || brackets.single;
  }

  getOrdinaryTaxRate(income, brackets) {
    for (let bracket of brackets) {
      if (income >= bracket.min && income < bracket.max) {
        return bracket.rate;
      }
    }
    return brackets[brackets.length - 1].rate;
  }

  getLongTermCapitalGainsRate(income, brackets) {
    for (let bracket of brackets) {
      if (income >= bracket.min && income < bracket.max) {
        return bracket.rate;
      }
    }
    return brackets[brackets.length - 1].rate;
  }

  isSubjectToNIIT(income, filing_status) {
    const thresholds = {
      single: 200000,
      married_filing_jointly: 250000,
      married_filing_separately: 125000,
      head_of_household: 200000
    };

    return income > (thresholds[filing_status] || 200000);
  }

  calculateStateTaxes(gain_analysis, taxpayer_profile) {
    const state = taxpayer_profile.state_of_residence;
    const { net_capital_gain } = gain_analysis;

    // State tax rates (simplified - actual rates vary)
    const state_rates = {
      'CA': { rate: 0.133, name: 'California' },
      'NY': { rate: 0.109, name: 'New York' },
      'NJ': { rate: 0.1075, name: 'New Jersey' },
      'HI': { rate: 0.11, name: 'Hawaii' },
      'OR': { rate: 0.099, name: 'Oregon' },
      'MN': { rate: 0.0985, name: 'Minnesota' },
      'DC': { rate: 0.095, name: 'District of Columbia' },
      'VT': { rate: 0.088, name: 'Vermont' },
      'CT': { rate: 0.069, name: 'Connecticut' },
      'ID': { rate: 0.058, name: 'Idaho' },
      'TX': { rate: 0, name: 'Texas' },
      'FL': { rate: 0, name: 'Florida' },
      'NV': { rate: 0, name: 'Nevada' },
      'WA': { rate: 0, name: 'Washington' },
      'WY': { rate: 0, name: 'Wyoming' },
      'SD': { rate: 0, name: 'South Dakota' },
      'TN': { rate: 0, name: 'Tennesse' },
      'AK': { rate: 0, name: 'Alaska' },
      'NH': { rate: 0, name: 'New Hampshire' }
    };

    const state_info = state_rates[state] || { rate: 0.06, name: state }; // Default 6% for unlisted states
    const state_tax = Math.max(0, net_capital_gain) * state_info.rate;

    return {
      state: state_info.name,
      state_tax_rate: Math.round(state_info.rate * 100),
      state_tax_liability: Math.round(state_tax),
      combined_tax_rate: state_info.rate * 100, // Will be combined with federal elsewhere
      no_state_tax: state_info.rate === 0
    };
  }

  analyzePrimaryResidenceExclusion(gain_analysis, taxpayer_profile) {
    const { filing_status, years_in_primary_residence = 0 } = taxpayer_profile;
    const { net_capital_gain } = gain_analysis;

    // Section 121 exclusion limits
    const exclusion_limits = {
      single: 250000,
      married_filing_jointly: 500000,
      married_filing_separately: 250000,
      head_of_household: 250000
    };

    const max_exclusion = exclusion_limits[filing_status] || 250000;
    const qualifies_for_exclusion = years_in_primary_residence >= 2;
    
    let excluded_gain = 0;
    let taxable_gain = net_capital_gain;

    if (qualifies_for_exclusion && net_capital_gain > 0) {
      excluded_gain = Math.min(net_capital_gain, max_exclusion);
      taxable_gain = Math.max(0, net_capital_gain - excluded_gain);
    }

    return {
      qualifies_for_exclusion,
      years_resided: years_in_primary_residence,
      max_exclusion_allowed: max_exclusion,
      excluded_gain: Math.round(excluded_gain),
      taxable_gain_after_exclusion: Math.round(taxable_gain),
      tax_savings: Math.round(excluded_gain * 0.15), // Approximate savings at 15% rate
      requirements: {
        ownership_test: 'Must own home for 2 of last 5 years',
        use_test: 'Must use as primary residence for 2 of last 5 years',
        frequency_test: 'Can only use exclusion once every 2 years'
      }
    };
  }

  analyzeStrategies(gain_analysis, tax_calculation, strategies = {}, taxpayer_profile) {
    const strategy_results = [];
    const { net_capital_gain } = gain_analysis;
    const { federal_tax_liability } = tax_calculation;

    // 1031 Exchange Analysis
    if (strategies.consider_1031_exchange && net_capital_gain > 0) {
      strategy_results.push({
        strategy: '1031 Like-Kind Exchange',
        tax_savings: federal_tax_liability,
        requirements: [
          'Both properties must be investment or business use',
          'Identify replacement property within 45 days',
          'Complete exchange within 180 days',
          'Use qualified intermediary'
        ],
        pros: ['Defer all capital gains tax', 'Step up in basis', 'Portfolio diversification'],
        cons: ['Complex process', 'Time constraints', 'Limited property types'],
        suitability: net_capital_gain > 100000 ? 'Highly Suitable' : 'Suitable'
      });
    }

    // Installment Sale
    if (strategies.installment_sale_option && net_capital_gain > 0) {
      const annual_tax_savings = federal_tax_liability * 0.3; // Spread over multiple years
      strategy_results.push({
        strategy: 'Installment Sale',
        tax_savings: annual_tax_savings,
        requirements: [
          'Payments received over multiple years',
          'At least one payment in year after sale',
          'Pro-rata recognition of gain'
        ],
        pros: ['Spread tax burden', 'Lower tax brackets', 'Steady income stream'],
        cons: ['Collection risk', 'Time value of money', 'Interest rate risk'],
        suitability: taxpayer_profile.annual_income > 200000 ? 'Suitable' : 'Less Suitable'
      });
    }

    // Charitable Remainder Trust
    if (strategies.charitable_remainder_trust && net_capital_gain > 500000) {
      strategy_results.push({
        strategy: 'Charitable Remainder Trust',
        tax_savings: federal_tax_liability * 0.7,
        requirements: [
          'Minimum trust value typically $100,000+',
          'Income stream for life or term',
          'Remainder goes to charity'
        ],
        pros: ['Tax deduction', 'Income stream', 'Philanthropic goals', 'Diversification'],
        cons: ['Irrevocable', 'Complex setup', 'Charity gets remainder'],
        suitability: 'Suitable for Large Gains Only'
      });
    }

    // Opportunity Zone Investment
    if (strategies.opportunity_zone_investment && net_capital_gain > 0) {
      const potential_savings = federal_tax_liability * 0.85; // Up to 85% elimination
      strategy_results.push({
        strategy: 'Opportunity Zone Investment',
        tax_savings: potential_savings,
        requirements: [
          'Invest in qualified opportunity zone',
          'Hold investment for 10+ years',
          'Invest within 180 days of sale'
        ],
        pros: ['10% gain reduction after 5 years', '15% after 7 years', 'Tax-free growth after 10 years'],
        cons: ['Geographic limitations', 'Long holding period', 'Investment risk'],
        suitability: 'Good for Long-Term Investors'
      });
    }

    // Tax Loss Harvesting
    if (strategies.harvest_losses && taxpayer_profile.other_capital_losses > 0) {
      const loss_benefit = Math.min(taxpayer_profile.other_capital_losses, net_capital_gain) * 0.15;
      strategy_results.push({
        strategy: 'Tax Loss Harvesting',
        tax_savings: loss_benefit,
        requirements: [
          'Realize losses in same tax year',
          'Avoid wash sale rules',
          '$3,000 annual limit for excess losses'
        ],
        pros: ['Immediate tax benefit', 'Portfolio rebalancing', 'Simple to execute'],
        cons: ['Limited by available losses', 'Wash sale restrictions'],
        suitability: 'Always Suitable'
      });
    }

    return {
      available_strategies: strategy_results,
      best_strategy: strategy_results.length > 0 ? strategy_results.reduce((best, current) => 
        current.tax_savings > best.tax_savings ? current : best
      ) : null,
      combined_strategies: strategy_results.length > 1 ? 
        'Multiple strategies can often be combined for optimal results' : null
    };
  }

  optimizeTiming(gain_analysis, taxpayer_profile, property_details) {
    const { net_capital_gain } = gain_analysis;
    const { annual_income } = taxpayer_profile;
    
    const timing_scenarios = [];

    // Current year sale
    const current_year_tax = this.calculateTaxLiability(gain_analysis, taxpayer_profile, property_details);
    timing_scenarios.push({
      scenario: 'Sell This Year',
      tax_liability: current_year_tax.federal_tax_liability,
      effective_rate: current_year_tax.effective_tax_rate,
      considerations: ['Current income level', 'Available deductions', 'Market conditions']
    });

    // Next year sale (assuming similar income)
    const next_year_profile = { ...taxpayer_profile, annual_income: annual_income * 1.03 }; // 3% increase
    const next_year_tax = this.calculateTaxLiability(gain_analysis, next_year_profile, property_details);
    timing_scenarios.push({
      scenario: 'Sell Next Year',
      tax_liability: next_year_tax.federal_tax_liability,
      effective_rate: next_year_tax.effective_tax_rate,
      considerations: ['Potential income changes', 'Tax law changes', 'Market appreciation risk']
    });

    // Retirement year sale (lower income scenario)
    if (annual_income > 100000) {
      const retirement_profile = { ...taxpayer_profile, annual_income: annual_income * 0.4 };
      const retirement_tax = this.calculateTaxLiability(gain_analysis, retirement_profile, property_details);
      timing_scenarios.push({
        scenario: 'Sell in Retirement',
        tax_liability: retirement_tax.federal_tax_liability,
        effective_rate: retirement_tax.effective_tax_rate,
        considerations: ['Lower income tax bracket', 'Potential NIIT avoidance', 'Market risk over time']
      });
    }

    return {
      timing_scenarios,
      optimal_timing: timing_scenarios.reduce((best, current) => 
        current.tax_liability < best.tax_liability ? current : best
      ),
      timing_factors: [
        'Current vs future income levels',
        'Available tax deductions',
        'Potential tax law changes',
        'Market appreciation/depreciation',
        'Personal financial needs'
      ]
    };
  }

  compareAcrossTaxYears(gain_analysis, taxpayer_profile) {
    const years = [2024, 2025, 2026];
    const comparisons = [];

    years.forEach(year => {
      // Simplified - in reality, tax brackets change yearly
      const year_tax = this.calculateTaxLiability(gain_analysis, taxpayer_profile, {});
      comparisons.push({
        tax_year: year,
        federal_tax: year_tax.federal_tax_liability,
        effective_rate: year_tax.effective_tax_rate,
        bracket_changes: year === 2024 ? 'Current brackets' : 'Projected brackets (subject to change)'
      });
    });

    return {
      year_comparisons: comparisons,
      tax_planning_notes: [
        'Tax brackets adjust annually for inflation',
        'Major tax law changes may affect future rates',
        'State tax laws may also change',
        'Consider timing sales around income fluctuations'
      ]
    };
  }

  generateRecommendations(gain_analysis, tax_calculation, primary_residence, strategy_analysis, taxpayer_profile) {
    const recommendations = [];
    const { net_capital_gain } = gain_analysis;
    const { federal_tax_liability, effective_tax_rate } = tax_calculation;

    // Tax liability assessment
    if (federal_tax_liability > 50000) {
      recommendations.push({
        category: 'Tax Planning',
        recommendation: '🎯 Consider tax deferral strategies',
        reasoning: `High tax liability of $${federal_tax_liability.toLocaleString()} warrants advanced planning`,
        priority: 'High'
      });
    } else if (federal_tax_liability > 15000) {
      recommendations.push({
        category: 'Tax Planning',
        recommendation: '📊 Review tax optimization options',
        reasoning: 'Moderate tax liability presents planning opportunities',
        priority: 'Medium'
      });
    }

    // Primary residence exclusion
    if (primary_residence && !primary_residence.qualifies_for_exclusion) {
      recommendations.push({
        category: 'Primary Residence',
        recommendation: '🏠 Consider delaying sale to qualify for exclusion',
        reasoning: `Need ${2 - primary_residence.years_resided} more years to qualify for $${primary_residence.max_exclusion_allowed.toLocaleString()} exclusion`,
        priority: 'High'
      });
    }

    // Strategy recommendations
    if (strategy_analysis && strategy_analysis.best_strategy) {
      recommendations.push({
        category: 'Tax Strategy',
        recommendation: `✨ Implement ${strategy_analysis.best_strategy.strategy}`,
        reasoning: `Could save $${strategy_analysis.best_strategy.tax_savings.toLocaleString()} in taxes`,
        priority: 'High'
      });
    }

    // Income-based recommendations
    if (taxpayer_profile.annual_income > 400000) {
      recommendations.push({
        category: 'High Earner Strategy',
        recommendation: '💼 Focus on tax deferral and income smoothing',
        reasoning: 'High income level subjects gains to maximum tax rates',
        priority: 'Medium'
      });
    }

    // Timing recommendations
    if (effective_tax_rate > 25) {
      recommendations.push({
        category: 'Timing',
        recommendation: '📅 Consider timing optimization',
        reasoning: 'High effective tax rate suggests potential for better timing',
        priority: 'Medium'
      });
    }

    // Professional advice
    if (net_capital_gain > 100000 || federal_tax_liability > 25000) {
      recommendations.push({
        category: 'Professional Advice',
        recommendation: '🤝 Consult with tax professional',
        reasoning: 'Complex transaction warrants professional tax planning',
        priority: 'High'
      });
    }

    return {
      recommendations,
      overall_assessment: this.getOverallTaxAssessment(effective_tax_rate, federal_tax_liability),
      key_action_items: [
        'Review all available tax strategies',
        'Consider timing optimization',
        'Evaluate deferral opportunities',
        'Plan for estimated tax payments',
        'Document all qualifying expenses'
      ]
    };
  }

  getOverallTaxAssessment(effective_rate, tax_liability) {
    if (effective_rate > 25 || tax_liability > 75000) {
      return 'High Impact - Requires Strategic Planning';
    } else if (effective_rate > 15 || tax_liability > 25000) {
      return 'Significant Impact - Consider Optimization';
    } else if (effective_rate > 5 || tax_liability > 5000) {
      return 'Moderate Impact - Standard Planning Appropriate';
    } else {
      return 'Low Impact - Minimal Tax Consequences';
    }
  }
}