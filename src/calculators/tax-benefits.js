export class TaxBenefitsCalculator {
  constructor() {
    this.name = 'Real Estate Tax Benefits Calculator';
    this.description = 'Calculate depreciation, deductions, and tax savings for real estate investments';
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        property_details: {
          type: 'object',
          description: 'Property information',
          properties: {
            purchase_price: {
              type: 'number',
              description: 'Total property purchase price',
              minimum: 0
            },
            land_value: {
              type: 'number',
              description: 'Land value (not depreciable)',
              minimum: 0
            },
            closing_costs: {
              type: 'number',
              description: 'Closing costs (may be depreciable)',
              minimum: 0,
              default: 0
            },
            property_type: {
              type: 'string',
              description: 'Type of property',
              enum: ['residential_rental', 'commercial', 'mixed_use'],
              default: 'residential_rental'
            },
            placed_in_service_date: {
              type: 'string',
              description: 'Date property placed in service (YYYY-MM-DD)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            },
            cost_segregation: {
              type: 'boolean',
              description: 'Apply cost segregation study results',
              default: false
            }
          },
          required: ['purchase_price', 'land_value']
        },
        income_expenses: {
          type: 'object',
          description: 'Annual income and expenses',
          properties: {
            annual_rental_income: {
              type: 'number',
              description: 'Total annual rental income',
              minimum: 0
            },
            operating_expenses: {
              type: 'object',
              description: 'Annual operating expenses',
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
                repairs_maintenance: {
                  type: 'number',
                  minimum: 0,
                  default: 0
                },
                property_management: {
                  type: 'number',
                  minimum: 0,
                  default: 0
                },
                utilities: {
                  type: 'number',
                  minimum: 0,
                  default: 0
                },
                hoa_fees: {
                  type: 'number',
                  minimum: 0,
                  default: 0
                },
                advertising: {
                  type: 'number',
                  minimum: 0,
                  default: 0
                },
                professional_fees: {
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
            }
          },
          required: ['annual_rental_income']
        },
        loan_details: {
          type: 'object',
          description: 'Mortgage information',
          properties: {
            loan_amount: {
              type: 'number',
              description: 'Total loan amount',
              minimum: 0
            },
            interest_rate: {
              type: 'number',
              description: 'Annual interest rate (%)',
              minimum: 0,
              maximum: 20
            },
            loan_term_years: {
              type: 'number',
              description: 'Loan term in years',
              minimum: 1,
              maximum: 40,
              default: 30
            },
            points_paid: {
              type: 'number',
              description: 'Loan points paid',
              minimum: 0,
              default: 0
            }
          }
        },
        taxpayer_info: {
          type: 'object',
          description: 'Taxpayer information',
          properties: {
            filing_status: {
              type: 'string',
              description: 'Tax filing status',
              enum: ['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household'],
              default: 'single'
            },
            other_income: {
              type: 'number',
              description: 'Other taxable income (wages, etc.)',
              minimum: 0
            },
            state: {
              type: 'string',
              description: 'State of residence (for state tax)',
              default: 'CA'
            },
            real_estate_professional: {
              type: 'boolean',
              description: 'Qualifies as real estate professional',
              default: false
            },
            active_participation: {
              type: 'boolean',
              description: 'Actively participates in rental activity',
              default: true
            }
          },
          required: ['other_income']
        },
        cost_segregation_breakdown: {
          type: 'object',
          description: 'Cost segregation study results',
          properties: {
            personal_property_5yr: {
              type: 'number',
              description: 'Personal property (5-year)',
              minimum: 0,
              default: 0
            },
            land_improvements_15yr: {
              type: 'number',
              description: 'Land improvements (15-year)',
              minimum: 0,
              default: 0
            },
            bonus_depreciation_eligible: {
              type: 'boolean',
              description: 'Eligible for bonus depreciation',
              default: true
            }
          }
        },
        analysis_options: {
          type: 'object',
          description: 'Analysis settings',
          properties: {
            projection_years: {
              type: 'number',
              description: 'Years to project',
              minimum: 1,
              maximum: 30,
              default: 10
            },
            include_state_tax: {
              type: 'boolean',
              description: 'Include state tax calculations',
              default: true
            },
            bonus_depreciation_rate: {
              type: 'number',
              description: 'Bonus depreciation rate (%)',
              minimum: 0,
              maximum: 100,
              default: 60
            }
          }
        }
      },
      required: ['property_details', 'income_expenses', 'taxpayer_info']
    };
  }

  calculate(params) {
    const {
      property_details,
      income_expenses,
      loan_details = {},
      taxpayer_info,
      cost_segregation_breakdown = {},
      analysis_options = {}
    } = params;

    const {
      projection_years = 10,
      include_state_tax = true,
      bonus_depreciation_rate = 60
    } = analysis_options;

    // Calculate depreciable basis
    const depreciableBasis = this.calculateDepreciableBasis(property_details, cost_segregation_breakdown);

    // Calculate annual depreciation
    const depreciationSchedule = this.createDepreciationSchedule(
      depreciableBasis,
      property_details,
      cost_segregation_breakdown,
      bonus_depreciation_rate,
      projection_years
    );

    // Calculate mortgage interest
    const mortgageInterestSchedule = this.calculateMortgageInterest(loan_details, projection_years);

    // Calculate taxable income/loss for each year
    const taxAnalysis = [];
    let cumulativeTaxSavings = 0;
    let cumulativeDepreciation = 0;

    for (let year = 1; year <= projection_years; year++) {
      const yearAnalysis = this.analyzeYear(
        year,
        income_expenses,
        depreciationSchedule[year - 1],
        mortgageInterestSchedule[year - 1],
        taxpayer_info,
        include_state_tax
      );
      
      cumulativeTaxSavings += yearAnalysis.total_tax_savings;
      cumulativeDepreciation += depreciationSchedule[year - 1].total_depreciation;
      
      yearAnalysis.cumulative_tax_savings = cumulativeTaxSavings;
      yearAnalysis.cumulative_depreciation = cumulativeDepreciation;
      
      taxAnalysis.push(yearAnalysis);
    }

    // Calculate overall metrics
    const summary = this.calculateSummaryMetrics(
      property_details,
      taxAnalysis,
      depreciationSchedule,
      income_expenses
    );

    // Passive activity loss analysis
    const passiveLossAnalysis = this.analyzePassiveActivityLoss(
      taxAnalysis[0],
      taxpayer_info
    );

    // Cost segregation benefit analysis
    const costSegAnalysis = property_details.cost_segregation ? 
      this.analyzeCostSegregationBenefit(
        property_details,
        cost_segregation_breakdown,
        depreciationSchedule,
        taxpayer_info
      ) : null;

    // Tax planning strategies
    const strategies = this.generateTaxStrategies(
      property_details,
      taxpayer_info,
      taxAnalysis[0],
      passiveLossAnalysis
    );

    return {
      depreciation_analysis: {
        depreciable_basis: depreciableBasis,
        depreciation_schedule: depreciationSchedule,
        total_depreciation: depreciationSchedule.reduce((sum, year) => sum + year.total_depreciation, 0),
        recapture_amount: cumulativeDepreciation
      },
      annual_tax_analysis: taxAnalysis,
      summary_metrics: summary,
      passive_loss_analysis: passiveLossAnalysis,
      cost_segregation_analysis: costSegAnalysis,
      tax_strategies: strategies,
      effective_tax_rates: this.calculateEffectiveTaxRates(taxAnalysis, income_expenses),
      recommendations: this.generateRecommendations(
        summary,
        passiveLossAnalysis,
        taxpayer_info,
        taxAnalysis[0]
      )
    };
  }

  calculateDepreciableBasis(propertyDetails, costSegregation) {
    const { purchase_price, land_value, closing_costs = 0 } = propertyDetails;
    
    // Building value is purchase price minus land value
    const buildingValue = purchase_price - land_value;
    
    // Some closing costs can be added to basis
    const depreciableClosingCosts = closing_costs * 0.8; // Approximate 80% are depreciable
    
    const totalDepreciableBasis = buildingValue + depreciableClosingCosts;

    // Break down by depreciation period
    let breakdown;
    if (propertyDetails.cost_segregation && costSegregation) {
      breakdown = {
        personal_property_5yr: costSegregation.personal_property_5yr || 0,
        land_improvements_15yr: costSegregation.land_improvements_15yr || 0,
        building_27_5yr: totalDepreciableBasis - 
          (costSegregation.personal_property_5yr || 0) - 
          (costSegregation.land_improvements_15yr || 0)
      };
    } else {
      // Standard allocation without cost segregation
      breakdown = {
        personal_property_5yr: 0,
        land_improvements_15yr: 0,
        building_27_5yr: totalDepreciableBasis
      };
    }

    return {
      total: parseFloat(totalDepreciableBasis.toFixed(2)),
      breakdown: breakdown,
      land_value: land_value,
      building_percentage: parseFloat(((buildingValue / purchase_price) * 100).toFixed(2))
    };
  }

  createDepreciationSchedule(depreciableBasis, propertyDetails, costSegregation, bonusRate, years) {
    const schedule = [];
    const { property_type } = propertyDetails;
    const depreciationYears = property_type === 'commercial' ? 39 : 27.5;
    
    const { breakdown } = depreciableBasis;
    
    // Calculate bonus depreciation in year 1
    const bonusDepreciation = propertyDetails.cost_segregation && costSegregation.bonus_depreciation_eligible ?
      (breakdown.personal_property_5yr + breakdown.land_improvements_15yr) * (bonusRate / 100) : 0;

    // Remaining amounts after bonus depreciation
    const remaining5yr = breakdown.personal_property_5yr * (1 - bonusRate / 100);
    const remaining15yr = breakdown.land_improvements_15yr * (1 - bonusRate / 100);

    for (let year = 1; year <= years; year++) {
      const yearDepreciation = {
        year: year,
        building_depreciation: parseFloat((breakdown.building_27_5yr / depreciationYears).toFixed(2)),
        personal_property_depreciation: year <= 5 ? parseFloat((remaining5yr / 5).toFixed(2)) : 0,
        land_improvements_depreciation: year <= 15 ? parseFloat((remaining15yr / 15).toFixed(2)) : 0,
        bonus_depreciation: year === 1 ? parseFloat(bonusDepreciation.toFixed(2)) : 0,
        total_depreciation: 0
      };

      yearDepreciation.total_depreciation = parseFloat((
        yearDepreciation.building_depreciation +
        yearDepreciation.personal_property_depreciation +
        yearDepreciation.land_improvements_depreciation +
        yearDepreciation.bonus_depreciation
      ).toFixed(2));

      schedule.push(yearDepreciation);
    }

    return schedule;
  }

  calculateMortgageInterest(loanDetails, years) {
    if (!loanDetails.loan_amount) return Array(years).fill({ interest_paid: 0 });

    const { loan_amount, interest_rate = 7, loan_term_years = 30 } = loanDetails;
    const monthlyRate = interest_rate / 100 / 12;
    const numPayments = loan_term_years * 12;
    
    const monthlyPayment = loan_amount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);

    const schedule = [];
    let remainingBalance = loan_amount;

    for (let year = 1; year <= years; year++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        yearlyInterest += interestPayment;
        yearlyPrincipal += principalPayment;
        remainingBalance -= principalPayment;
        
        if (remainingBalance <= 0) break;
      }

      schedule.push({
        year: year,
        interest_paid: parseFloat(yearlyInterest.toFixed(2)),
        principal_paid: parseFloat(yearlyPrincipal.toFixed(2)),
        remaining_balance: parseFloat(Math.max(0, remainingBalance).toFixed(2))
      });
    }

    return schedule;
  }

  analyzeYear(year, incomeExpenses, depreciation, mortgageInterest, taxpayerInfo, includeStateTax) {
    const { annual_rental_income, operating_expenses = {} } = incomeExpenses;
    
    // Calculate total operating expenses
    const totalOperatingExpenses = Object.values(operating_expenses).reduce((sum, expense) => sum + expense, 0);
    
    // Calculate net rental income before depreciation
    const netRentalIncomeBeforeDepreciation = annual_rental_income - totalOperatingExpenses - mortgageInterest.interest_paid;
    
    // Calculate taxable income/loss
    const taxableRentalIncome = netRentalIncomeBeforeDepreciation - depreciation.total_depreciation;
    
    // Apply passive activity loss rules
    const allowableRentalLoss = this.calculateAllowableRentalLoss(
      taxableRentalIncome,
      taxpayerInfo
    );

    // Calculate tax impact
    const { other_income, filing_status, state } = taxpayerInfo;
    const totalTaxableIncomeWithoutRental = other_income;
    const totalTaxableIncomeWithRental = other_income + allowableRentalLoss;
    
    // Calculate federal tax
    const federalTaxWithoutRental = this.calculateFederalTax(totalTaxableIncomeWithoutRental, filing_status);
    const federalTaxWithRental = this.calculateFederalTax(totalTaxableIncomeWithRental, filing_status);
    const federalTaxSavings = federalTaxWithoutRental - federalTaxWithRental;
    
    // Calculate state tax if applicable
    let stateTaxSavings = 0;
    if (includeStateTax) {
      const stateTaxWithoutRental = this.calculateStateTax(totalTaxableIncomeWithoutRental, state);
      const stateTaxWithRental = this.calculateStateTax(totalTaxableIncomeWithRental, state);
      stateTaxSavings = stateTaxWithoutRental - stateTaxWithRental;
    }

    // Calculate effective tax rate on rental income
    const marginalTaxRate = this.getMarginalTaxRate(other_income, filing_status);
    
    return {
      year: year,
      rental_income: annual_rental_income,
      operating_expenses: totalOperatingExpenses,
      mortgage_interest: mortgageInterest.interest_paid,
      depreciation: depreciation.total_depreciation,
      net_income_before_depreciation: netRentalIncomeBeforeDepreciation,
      taxable_rental_income: taxableRentalIncome,
      allowable_rental_loss: allowableRentalLoss,
      suspended_passive_loss: taxableRentalIncome < 0 ? Math.abs(taxableRentalIncome) - Math.abs(allowableRentalLoss) : 0,
      federal_tax_savings: parseFloat(federalTaxSavings.toFixed(2)),
      state_tax_savings: parseFloat(stateTaxSavings.toFixed(2)),
      total_tax_savings: parseFloat((federalTaxSavings + stateTaxSavings).toFixed(2)),
      effective_tax_rate: parseFloat(marginalTaxRate.toFixed(2)),
      after_tax_cash_flow: parseFloat((netRentalIncomeBeforeDepreciation + federalTaxSavings + stateTaxSavings).toFixed(2))
    };
  }

  calculateAllowableRentalLoss(rentalIncome, taxpayerInfo) {
    if (rentalIncome >= 0) return rentalIncome;
    
    const { other_income, real_estate_professional, active_participation, filing_status } = taxpayerInfo;
    
    // Real estate professionals can deduct all losses
    if (real_estate_professional) {
      return rentalIncome;
    }
    
    // Active participation allows up to $25,000 loss deduction
    if (active_participation) {
      const phaseoutStart = filing_status === 'married_filing_separately' ? 50000 : 100000;
      const phaseoutEnd = filing_status === 'married_filing_separately' ? 75000 : 150000;
      
      if (other_income <= phaseoutStart) {
        return Math.max(rentalIncome, -25000);
      } else if (other_income >= phaseoutEnd) {
        return 0; // No loss allowed
      } else {
        // Partial phaseout
        const phaseoutPercent = (other_income - phaseoutStart) / (phaseoutEnd - phaseoutStart);
        const allowableLoss = 25000 * (1 - phaseoutPercent);
        return Math.max(rentalIncome, -allowableLoss);
      }
    }
    
    // No active participation = no current year loss deduction
    return 0;
  }

  calculateFederalTax(taxableIncome, filingStatus) {
    // 2024 tax brackets
    const brackets = this.getFederalTaxBrackets(filingStatus);
    let tax = 0;
    let remainingIncome = Math.max(0, taxableIncome);
    
    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;
      
      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }
    
    return tax;
  }

  getFederalTaxBrackets(filingStatus) {
    // 2024 tax brackets
    const brackets = {
      single: [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 609350, rate: 0.35 },
        { min: 609350, max: Infinity, rate: 0.37 }
      ],
      married_filing_jointly: [
        { min: 0, max: 23200, rate: 0.10 },
        { min: 23200, max: 94300, rate: 0.12 },
        { min: 94300, max: 201050, rate: 0.22 },
        { min: 201050, max: 383900, rate: 0.24 },
        { min: 383900, max: 487450, rate: 0.32 },
        { min: 487450, max: 731200, rate: 0.35 },
        { min: 731200, max: Infinity, rate: 0.37 }
      ]
    };
    
    return brackets[filingStatus] || brackets.single;
  }

  getMarginalTaxRate(income, filingStatus) {
    const brackets = this.getFederalTaxBrackets(filingStatus);
    
    for (const bracket of brackets) {
      if (income >= bracket.min && income < bracket.max) {
        return bracket.rate * 100;
      }
    }
    
    return 37; // Top rate
  }

  calculateStateTax(taxableIncome, state) {
    // Simplified state tax rates
    const stateTaxRates = {
      CA: 0.093, // California top rate
      NY: 0.0882, // New York top rate
      TX: 0, // No state income tax
      FL: 0, // No state income tax
      WA: 0, // No state income tax
      // Add more states as needed
    };
    
    const rate = stateTaxRates[state] || 0.05; // Default 5%
    return taxableIncome * rate;
  }

  calculateSummaryMetrics(propertyDetails, taxAnalysis, depreciationSchedule, incomeExpenses) {
    const totalYears = taxAnalysis.length;
    const totalTaxSavings = taxAnalysis.reduce((sum, year) => sum + year.total_tax_savings, 0);
    const totalDepreciation = depreciationSchedule.reduce((sum, year) => sum + year.total_depreciation, 0);
    
    const avgAnnualTaxSavings = totalTaxSavings / totalYears;
    const firstYearTaxSavings = taxAnalysis[0].total_tax_savings;
    
    // Calculate cash-on-cash return with tax benefits
    const downPayment = propertyDetails.purchase_price * 0.2; // Assume 20% down
    const firstYearCashFlow = taxAnalysis[0].after_tax_cash_flow;
    const cashOnCashWithTax = (firstYearCashFlow / downPayment) * 100;
    
    // Calculate break-even tax rate
    const operatingIncome = incomeExpenses.annual_rental_income - 
      Object.values(incomeExpenses.operating_expenses || {}).reduce((sum, exp) => sum + exp, 0);
    const breakEvenTaxRate = operatingIncome > 0 ? (taxAnalysis[0].depreciation / operatingIncome) * 100 : 0;
    
    return {
      total_tax_savings: parseFloat(totalTaxSavings.toFixed(2)),
      average_annual_tax_savings: parseFloat(avgAnnualTaxSavings.toFixed(2)),
      first_year_tax_savings: parseFloat(firstYearTaxSavings.toFixed(2)),
      total_depreciation_taken: parseFloat(totalDepreciation.toFixed(2)),
      depreciation_recapture_liability: parseFloat((totalDepreciation * 0.25).toFixed(2)), // 25% recapture rate
      cash_on_cash_return_after_tax: parseFloat(cashOnCashWithTax.toFixed(2)),
      break_even_tax_rate: parseFloat(breakEvenTaxRate.toFixed(2)),
      tax_equivalent_yield: this.calculateTaxEquivalentYield(
        firstYearCashFlow,
        downPayment,
        taxAnalysis[0].effective_tax_rate
      )
    };
  }

  calculateTaxEquivalentYield(afterTaxCashFlow, investment, taxRate) {
    const afterTaxYield = (afterTaxCashFlow / investment) * 100;
    const taxEquivalentYield = afterTaxYield / (1 - taxRate / 100);
    return parseFloat(taxEquivalentYield.toFixed(2));
  }

  analyzePassiveActivityLoss(firstYearAnalysis, taxpayerInfo) {
    const { taxable_rental_income, allowable_rental_loss, suspended_passive_loss } = firstYearAnalysis;
    const { other_income, real_estate_professional, active_participation } = taxpayerInfo;
    
    const analysis = {
      rental_income_classification: taxable_rental_income >= 0 ? 'Passive Income' : 'Passive Loss',
      total_passive_loss: Math.min(0, taxable_rental_income),
      allowable_current_year_loss: allowable_rental_loss < 0 ? allowable_rental_loss : 0,
      suspended_loss_carryforward: suspended_passive_loss,
      qualification_status: real_estate_professional ? 'Real Estate Professional' : 
                          active_participation ? 'Active Participant' : 'Passive Investor'
    };

    // Calculate phase-out impact
    if (active_participation && !real_estate_professional && other_income > 100000) {
      const phaseoutAmount = Math.min(50000, other_income - 100000);
      const phaseoutPercent = (phaseoutAmount / 50000) * 100;
      analysis.phase_out_impact = {
        income_over_threshold: phaseoutAmount,
        phase_out_percentage: parseFloat(phaseoutPercent.toFixed(2)),
        loss_reduction: parseFloat((25000 * phaseoutPercent / 100).toFixed(2))
      };
    }

    return analysis;
  }

  analyzeCostSegregationBenefit(propertyDetails, costSegregation, depreciationSchedule, taxpayerInfo) {
    // Calculate standard depreciation (without cost seg)
    const buildingValue = propertyDetails.purchase_price - propertyDetails.land_value;
    const standardAnnualDepreciation = buildingValue / 27.5;
    const standardFirstYearTax = standardAnnualDepreciation * (taxpayerInfo.marginal_tax_rate || 0.24);
    
    // Calculate cost seg depreciation
    const costSegFirstYear = depreciationSchedule[0].total_depreciation;
    const costSegFirstYearTax = costSegFirstYear * (taxpayerInfo.marginal_tax_rate || 0.24);
    
    // NPV comparison over 10 years
    const discountRate = 0.08;
    let standardNPV = 0;
    let costSegNPV = 0;
    
    for (let year = 1; year <= 10; year++) {
      const standardTaxSaving = standardAnnualDepreciation * (taxpayerInfo.marginal_tax_rate || 0.24);
      const costSegTaxSaving = depreciationSchedule[year - 1] ? 
        depreciationSchedule[year - 1].total_depreciation * (taxpayerInfo.marginal_tax_rate || 0.24) : 0;
      
      standardNPV += standardTaxSaving / Math.pow(1 + discountRate, year);
      costSegNPV += costSegTaxSaving / Math.pow(1 + discountRate, year);
    }
    
    return {
      first_year_additional_depreciation: parseFloat((costSegFirstYear - standardAnnualDepreciation).toFixed(2)),
      first_year_additional_tax_savings: parseFloat((costSegFirstYearTax - standardFirstYearTax).toFixed(2)),
      ten_year_npv_benefit: parseFloat((costSegNPV - standardNPV).toFixed(2)),
      cost_seg_roi: costSegregation.study_cost ? 
        parseFloat(((costSegNPV - standardNPV) / costSegregation.study_cost * 100).toFixed(2)) : null,
      recommendation: (costSegNPV - standardNPV) > (costSegregation.study_cost || 5000) ? 
        'Cost segregation provides positive ROI' : 'Cost segregation may not be cost-effective'
    };
  }

  generateTaxStrategies(propertyDetails, taxpayerInfo, firstYearAnalysis, passiveLossAnalysis) {
    const strategies = [];

    // Real estate professional status
    if (!taxpayerInfo.real_estate_professional && passiveLossAnalysis.suspended_loss_carryforward > 10000) {
      strategies.push({
        strategy: 'Real Estate Professional Status',
        description: 'Qualify as a real estate professional to deduct all passive losses',
        requirements: '750+ hours and more than half of working time in real estate',
        potential_benefit: `Deduct $${passiveLossAnalysis.suspended_loss_carryforward.toLocaleString()} in suspended losses`
      });
    }

    // Cost segregation
    if (!propertyDetails.cost_segregation && propertyDetails.purchase_price > 500000) {
      strategies.push({
        strategy: 'Cost Segregation Study',
        description: 'Accelerate depreciation through component analysis',
        requirements: 'Professional cost segregation study ($3,000-$10,000)',
        potential_benefit: 'Increase first-year depreciation by 20-30%'
      });
    }

    // Section 179 for qualifying property
    if (propertyDetails.property_type === 'commercial') {
      strategies.push({
        strategy: 'Section 179 Deduction',
        description: 'Immediate expensing for qualifying improvements',
        requirements: 'HVAC, roofing, fire protection, security systems',
        potential_benefit: 'Deduct up to $1.16M in qualifying expenses immediately'
      });
    }

    // Energy efficiency credits
    strategies.push({
      strategy: 'Energy Efficiency Tax Credits',
      description: 'Install solar panels or energy-efficient systems',
      requirements: 'Qualifying renewable energy or efficiency improvements',
      potential_benefit: '30% federal tax credit for solar, various credits for other improvements'
    });

    // Grouping elections
    if (passiveLossAnalysis.suspended_loss_carryforward > 0) {
      strategies.push({
        strategy: 'Grouping Election',
        description: 'Group rental activities to optimize loss utilization',
        requirements: 'Multiple rental properties with varying profitability',
        potential_benefit: 'Offset passive income with passive losses more effectively'
      });
    }

    // 1031 exchange planning
    strategies.push({
      strategy: '1031 Exchange Planning',
      description: 'Defer depreciation recapture and capital gains',
      requirements: 'Like-kind property exchange within strict timelines',
      potential_benefit: `Defer $${(firstYearAnalysis.cumulative_depreciation * 0.25).toLocaleString()} in recapture tax`
    });

    return strategies;
  }

  calculateEffectiveTaxRates(taxAnalysis, incomeExpenses) {
    const firstYear = taxAnalysis[0];
    const { annual_rental_income } = incomeExpenses;
    
    // Effective tax rate on rental income
    const taxSavingsRate = (firstYear.total_tax_savings / annual_rental_income) * 100;
    
    // After-tax return
    const preaxReturn = firstYear.net_income_before_depreciation;
    const afterTaxReturn = firstYear.after_tax_cash_flow;
    const effectiveTaxOnCashFlow = ((preaxReturn - afterTaxReturn) / preaxReturn) * 100;
    
    return {
      tax_savings_as_percent_of_income: parseFloat(taxSavingsRate.toFixed(2)),
      effective_tax_rate_on_cash_flow: parseFloat(effectiveTaxOnCashFlow.toFixed(2)),
      marginal_tax_rate: firstYear.effective_tax_rate,
      tax_shield_value: parseFloat((firstYear.depreciation * firstYear.effective_tax_rate / 100).toFixed(2))
    };
  }

  generateRecommendations(summary, passiveLossAnalysis, taxpayerInfo, firstYearAnalysis) {
    const recommendations = [];

    // High tax savings
    if (summary.first_year_tax_savings > 10000) {
      recommendations.push({
        type: 'Tax Benefit',
        priority: 'High',
        message: `Significant first-year tax savings of $${summary.first_year_tax_savings.toLocaleString()}`,
        action: 'Ensure proper documentation for all deductions'
      });
    }

    // Suspended losses
    if (passiveLossAnalysis.suspended_loss_carryforward > 25000) {
      recommendations.push({
        type: 'Passive Loss',
        priority: 'High',
        message: `Large suspended losses of $${passiveLossAnalysis.suspended_loss_carryforward.toLocaleString()}`,
        action: 'Consider strategies to utilize passive losses (RE professional status, grouping)'
      });
    }

    // Depreciation recapture planning
    if (summary.depreciation_recapture_liability > 50000) {
      recommendations.push({
        type: 'Exit Planning',
        priority: 'Medium',
        message: `Future recapture liability of $${summary.depreciation_recapture_liability.toLocaleString()}`,
        action: 'Plan for 1031 exchange or installment sale to defer recapture'
      });
    }

    // Active participation phaseout
    if (passiveLossAnalysis.phase_out_impact && passiveLossAnalysis.phase_out_impact.phase_out_percentage > 50) {
      recommendations.push({
        type: 'Income Planning',
        priority: 'Medium',
        message: 'Rental loss deduction significantly reduced due to income',
        action: 'Consider income deferral strategies or RE professional status'
      });
    }

    // Cost segregation opportunity
    if (!taxpayerInfo.cost_segregation && firstYearAnalysis.depreciation < 20000) {
      recommendations.push({
        type: 'Depreciation',
        priority: 'Medium',
        message: 'Potential to accelerate depreciation deductions',
        action: 'Evaluate cost segregation study ROI'
      });
    }

    // Record keeping
    recommendations.push({
      type: 'Compliance',
      priority: 'High',
      message: 'Maintain detailed records for all expenses and improvements',
      action: 'Use property management software or dedicated accounting system'
    });

    return recommendations;
  }
}