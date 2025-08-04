/**
 * Airbnb/STR Income Calculator
 * Analyzes short-term rental income potential and profitability
 */

export class AirbnbSTRCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        property_info: {
          type: 'object',
          properties: {
            purchase_price: { type: 'number', minimum: 0, description: 'Property purchase price' },
            property_type: { 
              type: 'string', 
              enum: ['single_family', 'condo', 'townhouse', 'duplex', 'entire_building'],
              description: 'Type of property'
            },
            bedrooms: { type: 'number', minimum: 1, maximum: 10, description: 'Number of bedrooms' },
            bathrooms: { type: 'number', minimum: 1, maximum: 10, description: 'Number of bathrooms' },
            max_guests: { type: 'number', minimum: 1, maximum: 20, description: 'Maximum guest capacity' },
            location_type: {
              type: 'string',
              enum: ['urban', 'suburban', 'rural', 'beach', 'mountain', 'tourist_destination'],
              description: 'Location type'
            }
          },
          required: ['purchase_price', 'bedrooms', 'bathrooms', 'max_guests']
        },
        rental_assumptions: {
          type: 'object',
          properties: {
            average_nightly_rate: { type: 'number', minimum: 0, description: 'Average nightly rate' },
            occupancy_rate: { type: 'number', minimum: 0, maximum: 100, description: 'Expected occupancy rate (%)' },
            seasonal_variation: {
              type: 'object',
              properties: {
                peak_months: { type: 'number', minimum: 0, maximum: 12, description: 'Number of peak season months' },
                peak_rate_multiplier: { type: 'number', minimum: 1, description: 'Peak season rate multiplier' },
                low_season_discount: { type: 'number', minimum: 0, maximum: 50, description: 'Low season discount (%)' }
              }
            },
            cleaning_fee: { type: 'number', minimum: 0, description: 'Cleaning fee per booking' },
            average_stay_length: { type: 'number', minimum: 1, maximum: 30, description: 'Average stay length (nights)' }
          },
          required: ['average_nightly_rate', 'occupancy_rate']
        },
        operating_expenses: {
          type: 'object',
          properties: {
            platform_fees: { type: 'number', minimum: 0, maximum: 50, description: 'Platform fees (% of revenue)' },
            cleaning_cost: { type: 'number', minimum: 0, description: 'Cleaning cost per booking' },
            management_fee: { type: 'number', minimum: 0, maximum: 50, description: 'Management fee (% of revenue)' },
            supplies_monthly: { type: 'number', minimum: 0, description: 'Monthly supplies cost' },
            utilities_monthly: { type: 'number', minimum: 0, description: 'Monthly utilities cost' },
            insurance_annual: { type: 'number', minimum: 0, description: 'Annual STR insurance cost' },
            property_tax_annual: { type: 'number', minimum: 0, description: 'Annual property tax' },
            hoa_monthly: { type: 'number', minimum: 0, description: 'Monthly HOA fees' },
            maintenance_monthly: { type: 'number', minimum: 0, description: 'Monthly maintenance budget' },
            marketing_monthly: { type: 'number', minimum: 0, description: 'Monthly marketing/advertising' }
          }
        },
        financing: {
          type: 'object',
          properties: {
            down_payment_percent: { type: 'number', minimum: 0, maximum: 100, description: 'Down payment percentage' },
            interest_rate: { type: 'number', minimum: 0, maximum: 30, description: 'Loan interest rate (%)' },
            loan_term_years: { type: 'number', minimum: 1, maximum: 30, description: 'Loan term in years' },
            closing_costs: { type: 'number', minimum: 0, description: 'Total closing costs' }
          }
        },
        startup_costs: {
          type: 'object',
          properties: {
            furniture_budget: { type: 'number', minimum: 0, description: 'Initial furniture/furnishing budget' },
            renovation_budget: { type: 'number', minimum: 0, description: 'Renovation/improvement budget' },
            initial_supplies: { type: 'number', minimum: 0, description: 'Initial supplies and amenities' },
            technology_setup: { type: 'number', minimum: 0, description: 'Smart locks, WiFi, tech setup' },
            permits_licenses: { type: 'number', minimum: 0, description: 'Permits and licensing costs' }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            analysis_period_years: { type: 'number', minimum: 1, maximum: 30, description: 'Analysis period in years' },
            annual_rate_increase: { type: 'number', minimum: 0, maximum: 20, description: 'Annual rate increase (%)' },
            annual_expense_increase: { type: 'number', minimum: 0, maximum: 20, description: 'Annual expense increase (%)' },
            vacancy_buffer: { type: 'number', minimum: 0, maximum: 50, description: 'Additional vacancy buffer (%)' }
          }
        }
      },
      required: ['property_info', 'rental_assumptions']
    };
  }

  calculate(params) {
    const { 
      property_info, 
      rental_assumptions, 
      operating_expenses = {}, 
      financing = {}, 
      startup_costs = {},
      analysis_options = {}
    } = params;
    
    // Set defaults
    const down_payment_percent = financing.down_payment_percent || 25;
    const interest_rate = financing.interest_rate || 7.5;
    const loan_term_years = financing.loan_term_years || 30;
    const closing_costs = financing.closing_costs || property_info.purchase_price * 0.03;
    const analysis_years = analysis_options.analysis_period_years || 5;
    const rate_increase = analysis_options.annual_rate_increase || 3;
    const expense_increase = analysis_options.annual_expense_increase || 3;
    const vacancy_buffer = analysis_options.vacancy_buffer || 5;
    
    // Calculate financing details
    const down_payment = property_info.purchase_price * (down_payment_percent / 100);
    const loan_amount = property_info.purchase_price - down_payment;
    const monthly_payment = this.calculateMonthlyPayment(loan_amount, interest_rate / 100 / 12, loan_term_years * 12);
    
    // Calculate total startup investment
    const total_startup = down_payment + closing_costs + 
                         (startup_costs.furniture_budget || 0) +
                         (startup_costs.renovation_budget || 0) +
                         (startup_costs.initial_supplies || 0) +
                         (startup_costs.technology_setup || 0) +
                         (startup_costs.permits_licenses || 0);
    
    // Calculate revenue
    const revenue_analysis = this.calculateRevenue(rental_assumptions, vacancy_buffer);
    
    // Calculate operating expenses
    const expense_analysis = this.calculateOperatingExpenses(
      operating_expenses, 
      revenue_analysis.annual_gross_revenue,
      property_info.purchase_price
    );
    
    // Calculate cash flow
    const annual_debt_service = monthly_payment * 12;
    const annual_net_operating_income = revenue_analysis.annual_gross_revenue - expense_analysis.total_annual_expenses;
    const annual_cash_flow = annual_net_operating_income - annual_debt_service;
    const monthly_cash_flow = annual_cash_flow / 12;
    
    // Performance metrics
    const cap_rate = (annual_net_operating_income / property_info.purchase_price) * 100;
    const cash_on_cash_return = (annual_cash_flow / total_startup) * 100;
    const gross_rent_multiplier = property_info.purchase_price / revenue_analysis.annual_gross_revenue;
    
    // Compare to traditional rental
    const traditional_rental = this.calculateTraditionalRental(property_info, financing);
    
    // Multi-year projection
    const projections = this.calculateProjections(
      revenue_analysis,
      expense_analysis,
      annual_debt_service,
      rate_increase,
      expense_increase,
      analysis_years
    );
    
    // Risk analysis
    const risk_analysis = this.performRiskAnalysis(
      rental_assumptions,
      revenue_analysis,
      expense_analysis,
      annual_cash_flow,
      property_info
    );
    
    // Seasonal analysis
    const seasonal_analysis = this.calculateSeasonalAnalysis(rental_assumptions);
    
    // Break-even analysis
    const breakeven_analysis = this.calculateBreakeven(
      revenue_analysis,
      expense_analysis,
      annual_debt_service,
      rental_assumptions
    );
    
    return {
      investment_summary: {
        total_investment: total_startup,
        purchase_price: property_info.purchase_price,
        down_payment: down_payment,
        loan_amount: loan_amount,
        startup_costs: total_startup - down_payment - closing_costs,
        monthly_debt_service: monthly_payment
      },
      revenue_analysis: revenue_analysis,
      expense_analysis: expense_analysis,
      cash_flow_analysis: {
        annual_gross_revenue: revenue_analysis.annual_gross_revenue,
        annual_operating_expenses: expense_analysis.total_annual_expenses,
        annual_net_operating_income: annual_net_operating_income,
        annual_debt_service: annual_debt_service,
        annual_cash_flow: annual_cash_flow,
        monthly_cash_flow: monthly_cash_flow
      },
      performance_metrics: {
        cap_rate: cap_rate,
        cash_on_cash_return: cash_on_cash_return,
        gross_rent_multiplier: gross_rent_multiplier,
        revenue_per_available_room: revenue_analysis.annual_gross_revenue / 365,
        profit_margin: (annual_cash_flow / revenue_analysis.annual_gross_revenue) * 100
      },
      traditional_rental_comparison: traditional_rental,
      projections: projections,
      seasonal_analysis: seasonal_analysis,
      risk_analysis: risk_analysis,
      breakeven_analysis: breakeven_analysis,
      recommendations: this.generateRecommendations(
        cash_on_cash_return,
        cap_rate,
        risk_analysis,
        traditional_rental,
        revenue_analysis,
        property_info
      )
    };
  }
  
  calculateMonthlyPayment(principal, monthlyRate, months) {
    if (monthlyRate === 0) return principal / months;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  }
  
  calculateRevenue(rental_assumptions, vacancy_buffer = 0) {
    const { 
      average_nightly_rate, 
      occupancy_rate, 
      cleaning_fee = 0, 
      average_stay_length = 3,
      seasonal_variation = {}
    } = rental_assumptions;
    
    // Adjust occupancy for vacancy buffer
    const adjusted_occupancy = Math.max(0, occupancy_rate - vacancy_buffer);
    const occupied_nights = Math.floor((365 * adjusted_occupancy) / 100);
    
    // Calculate seasonal rates
    let weighted_nightly_rate = average_nightly_rate;
    if (seasonal_variation.peak_months) {
      const peak_months = seasonal_variation.peak_months;
      const peak_multiplier = seasonal_variation.peak_rate_multiplier || 1.5;
      const low_discount = seasonal_variation.low_season_discount || 20;
      
      const peak_nights = Math.floor((peak_months / 12) * occupied_nights);
      const regular_nights = occupied_nights - peak_nights;
      
      const peak_rate = average_nightly_rate * peak_multiplier;
      const low_rate = average_nightly_rate * (1 - low_discount / 100);
      
      weighted_nightly_rate = (peak_rate * peak_nights + low_rate * regular_nights) / occupied_nights;
    }
    
    // Calculate revenue
    const annual_room_revenue = occupied_nights * weighted_nightly_rate;
    const bookings_per_year = Math.floor(occupied_nights / average_stay_length);
    const annual_cleaning_revenue = bookings_per_year * cleaning_fee;
    const annual_gross_revenue = annual_room_revenue + annual_cleaning_revenue;
    
    return {
      occupied_nights_per_year: occupied_nights,
      bookings_per_year: bookings_per_year,
      average_nightly_rate: weighted_nightly_rate,
      annual_room_revenue: annual_room_revenue,
      annual_cleaning_revenue: annual_cleaning_revenue,
      annual_gross_revenue: annual_gross_revenue,
      effective_occupancy: adjusted_occupancy,
      revenue_per_occupied_night: weighted_nightly_rate + (cleaning_fee / average_stay_length)
    };
  }
  
  calculateOperatingExpenses(operating_expenses, annual_revenue, property_value) {
    const {
      platform_fees = 15,
      cleaning_cost = 0,
      management_fee = 0,
      supplies_monthly = 200,
      utilities_monthly = 150,
      insurance_annual = property_value * 0.001,
      property_tax_annual = property_value * 0.012,
      hoa_monthly = 0,
      maintenance_monthly = 300,
      marketing_monthly = 100
    } = operating_expenses;
    
    // Variable expenses (% of revenue)
    const platform_fee_amount = annual_revenue * (platform_fees / 100);
    const management_fee_amount = annual_revenue * (management_fee / 100);
    
    // Fixed monthly expenses
    const monthly_fixed = supplies_monthly + utilities_monthly + hoa_monthly + 
                         maintenance_monthly + marketing_monthly;
    const annual_fixed = monthly_fixed * 12;
    
    // Annual expenses
    const total_annual_expenses = platform_fee_amount + management_fee_amount + 
                                annual_fixed + insurance_annual + property_tax_annual + 
                                (cleaning_cost * 50); // Assuming 50 cleanings per year
    
    return {
      variable_expenses: {
        platform_fees: platform_fee_amount,
        management_fees: management_fee_amount,
        cleaning_costs: cleaning_cost * 50
      },
      fixed_expenses: {
        supplies: supplies_monthly * 12,
        utilities: utilities_monthly * 12,
        insurance: insurance_annual,
        property_tax: property_tax_annual,
        hoa: hoa_monthly * 12,
        maintenance: maintenance_monthly * 12,
        marketing: marketing_monthly * 12
      },
      total_annual_expenses: total_annual_expenses,
      expense_ratio: (total_annual_expenses / annual_revenue) * 100
    };
  }
  
  calculateTraditionalRental(property_info, financing) {
    // Estimate traditional rental based on property type and size
    const rent_per_bedroom = {
      single_family: 800,
      condo: 700,
      townhouse: 750,
      duplex: 650
    };
    
    const base_rent = (rent_per_bedroom[property_info.property_type] || 700) * property_info.bedrooms;
    const monthly_rent = Math.max(base_rent, property_info.purchase_price * 0.01 / 12); // 1% rule fallback
    const annual_rent = monthly_rent * 12;
    
    // Traditional rental expenses (typically lower)
    const annual_expenses = property_info.purchase_price * 0.08; // 8% of property value
    const annual_debt_service = this.calculateMonthlyPayment(
      property_info.purchase_price * (1 - (financing.down_payment_percent || 25) / 100),
      (financing.interest_rate || 7.5) / 100 / 12,
      (financing.loan_term_years || 30) * 12
    ) * 12;
    
    const traditional_cash_flow = annual_rent - annual_expenses - annual_debt_service;
    
    return {
      estimated_monthly_rent: monthly_rent,
      annual_rental_income: annual_rent,
      annual_expenses: annual_expenses,
      annual_cash_flow: traditional_cash_flow,
      cash_on_cash_return: (traditional_cash_flow / 
        (property_info.purchase_price * (financing.down_payment_percent || 25) / 100)) * 100
    };
  }
  
  calculateProjections(revenue_analysis, expense_analysis, debt_service, 
                      rate_increase, expense_increase, years) {
    const projections = [];
    let current_revenue = revenue_analysis.annual_gross_revenue;
    let current_expenses = expense_analysis.total_annual_expenses;
    
    for (let year = 1; year <= years; year++) {
      const annual_noi = current_revenue - current_expenses;
      const annual_cash_flow = annual_noi - debt_service;
      
      projections.push({
        year: year,
        gross_revenue: current_revenue,
        operating_expenses: current_expenses,
        net_operating_income: annual_noi,
        cash_flow: annual_cash_flow,
        cumulative_cash_flow: projections.reduce((sum, p) => sum + p.cash_flow, annual_cash_flow)
      });
      
      // Increase for next year
      current_revenue *= (1 + rate_increase / 100);
      current_expenses *= (1 + expense_increase / 100);
    }
    
    return projections;
  }
  
  calculateSeasonalAnalysis(rental_assumptions) {
    const { seasonal_variation } = rental_assumptions;
    
    if (!seasonal_variation || !seasonal_variation.peak_months) {
      return null;
    }
    
    const peak_months = seasonal_variation.peak_months;
    const shoulder_months = Math.max(0, 12 - peak_months - 4); // Assume 4 low months
    const low_months = 12 - peak_months - shoulder_months;
    
    const base_rate = rental_assumptions.average_nightly_rate;
    const peak_rate = base_rate * (seasonal_variation.peak_rate_multiplier || 1.5);
    const low_rate = base_rate * (1 - (seasonal_variation.low_season_discount || 20) / 100);
    
    return {
      peak_season: {
        months: peak_months,
        nightly_rate: peak_rate,
        monthly_revenue: peak_rate * 25 * (rental_assumptions.occupancy_rate / 100) // 25 nights avg
      },
      shoulder_season: {
        months: shoulder_months,
        nightly_rate: base_rate,
        monthly_revenue: base_rate * 22 * (rental_assumptions.occupancy_rate / 100)
      },
      low_season: {
        months: low_months,
        nightly_rate: low_rate,
        monthly_revenue: low_rate * 18 * (rental_assumptions.occupancy_rate / 100)
      }
    };
  }
  
  performRiskAnalysis(rental_assumptions, revenue_analysis, expense_analysis, 
                     annual_cash_flow, property_info) {
    const risks = [];
    const opportunities = [];
    
    // Occupancy risk
    if (rental_assumptions.occupancy_rate > 75) {
      risks.push('High occupancy assumption may be optimistic');
    }
    if (rental_assumptions.occupancy_rate < 50) {
      risks.push('Low occupancy rate indicates market challenges');
    }
    
    // Revenue concentration risk
    const revenue_per_night = revenue_analysis.annual_gross_revenue / revenue_analysis.occupied_nights_per_year;
    if (revenue_per_night > 300) {
      risks.push('High nightly rate may limit demand in economic downturns');
    }
    
    // Cash flow risk
    if (annual_cash_flow < 0) {
      risks.push('Negative cash flow - property loses money');
    } else if (annual_cash_flow < revenue_analysis.annual_gross_revenue * 0.1) {
      risks.push('Thin profit margins vulnerable to expense increases');
    }
    
    // Market risks
    if (property_info.location_type === 'tourist_destination') {
      risks.push('Tourism-dependent income subject to travel disruptions');
      opportunities.push('High revenue potential during peak seasons');
    }
    
    // Regulatory risk
    risks.push('Local STR regulations may change and impact operations');
    
    // Opportunities
    if (expense_analysis.expense_ratio > 60) {
      opportunities.push('High expense ratio suggests cost optimization potential');
    }
    
    if (revenue_analysis.effective_occupancy < 70) {
      opportunities.push('Room for occupancy improvement through better marketing');
    }
    
    // Calculate risk score
    const risk_score = Math.min(100, Math.max(0, 50 - (annual_cash_flow / 1000) + risks.length * 10));
    
    return {
      risk_level: risk_score > 70 ? 'High' : risk_score > 40 ? 'Medium' : 'Low',
      risk_score: risk_score,
      key_risks: risks,
      opportunities: opportunities,
      stress_scenarios: {
        occupancy_drop_20pct: {
          annual_cash_flow: annual_cash_flow - (revenue_analysis.annual_gross_revenue * 0.2),
          impact: 'Severe'
        },
        rate_drop_15pct: {
          annual_cash_flow: annual_cash_flow - (revenue_analysis.annual_room_revenue * 0.15),
          impact: 'Moderate'
        },
        expense_increase_25pct: {
          annual_cash_flow: annual_cash_flow - (expense_analysis.total_annual_expenses * 0.25),
          impact: 'Moderate'
        }
      }
    };
  }
  
  calculateBreakeven(revenue_analysis, expense_analysis, debt_service, rental_assumptions) {
    const total_fixed_costs = expense_analysis.total_annual_expenses + debt_service;
    const revenue_per_night = revenue_analysis.annual_gross_revenue / revenue_analysis.occupied_nights_per_year;
    
    const breakeven_nights = Math.ceil(total_fixed_costs / revenue_per_night);
    const breakeven_occupancy = (breakeven_nights / 365) * 100;
    
    const current_margin = revenue_analysis.occupied_nights_per_year - breakeven_nights;
    const margin_days = Math.max(0, current_margin);
    
    return {
      breakeven_nights_per_year: breakeven_nights,
      breakeven_occupancy_rate: breakeven_occupancy,
      current_occupancy_rate: rental_assumptions.occupancy_rate,
      margin_of_safety_nights: margin_days,
      margin_of_safety_percent: ((rental_assumptions.occupancy_rate - breakeven_occupancy) / 
                                rental_assumptions.occupancy_rate) * 100
    };
  }
  
  generateRecommendations(cash_on_cash_return, cap_rate, risk_analysis, 
                         traditional_rental, revenue_analysis, property_info) {
    const recommendations = [];
    
    // Investment decision
    if (cash_on_cash_return > 15 && cap_rate > 8) {
      recommendations.push({
        category: 'Investment Decision',
        priority: 'high',
        message: 'Excellent STR opportunity with strong returns'
      });
    } else if (cash_on_cash_return > traditional_rental.cash_on_cash_return + 5) {
      recommendations.push({
        category: 'Investment Decision',
        priority: 'medium',
        message: 'STR significantly outperforms traditional rental'
      });
    } else if (cash_on_cash_return < traditional_rental.cash_on_cash_return) {
      recommendations.push({
        category: 'Investment Decision',
        priority: 'high',
        message: 'Consider traditional rental - less work, similar returns'
      });
    }
    
    // Revenue optimization
    if (revenue_analysis.effective_occupancy < 65) {
      recommendations.push({
        category: 'Revenue Optimization',
        priority: 'high',
        message: 'Focus on marketing and guest experience to improve occupancy'
      });
    }
    
    if (revenue_analysis.revenue_per_occupied_night < 150) {
      recommendations.push({
        category: 'Revenue Optimization',
        priority: 'medium',
        message: 'Consider premium amenities to justify higher nightly rates'
      });
    }
    
    // Risk management
    if (risk_analysis.risk_level === 'High') {
      recommendations.push({
        category: 'Risk Management',
        priority: 'high',
        message: 'High risk investment - ensure adequate cash reserves'
      });
    }
    
    // Market specific
    if (property_info.location_type === 'tourist_destination') {
      recommendations.push({
        category: 'Market Strategy',
        priority: 'medium',
        message: 'Diversify marketing across multiple seasons and guest types'
      });
    }
    
    // Operational efficiency
    if (revenue_analysis.bookings_per_year > 100) {
      recommendations.push({
        category: 'Operations',
        priority: 'high',
        message: 'Consider professional management - high booking volume'
      });
    }
    
    return recommendations;
  }
}