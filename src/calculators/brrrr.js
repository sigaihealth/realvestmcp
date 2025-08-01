export class BRRRRCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        purchase_price: {
          type: 'number',
          description: 'Purchase price of the property',
          minimum: 0
        },
        rehab_cost: {
          type: 'number',
          description: 'Total rehabilitation/renovation costs',
          minimum: 0
        },
        after_repair_value: {
          type: 'number',
          description: 'Estimated value after repairs (ARV)',
          minimum: 0
        },
        monthly_rent: {
          type: 'number',
          description: 'Expected monthly rental income',
          minimum: 0
        },
        down_payment_percent: {
          type: 'number',
          description: 'Down payment percentage for initial purchase',
          default: 20,
          minimum: 0,
          maximum: 100
        },
        purchase_interest_rate: {
          type: 'number',
          description: 'Interest rate for purchase loan (%)',
          default: 8.0
        },
        refinance_ltv: {
          type: 'number',
          description: 'Loan-to-value ratio for refinance (e.g., 0.75 for 75%)',
          default: 0.75,
          minimum: 0,
          maximum: 1
        },
        refinance_interest_rate: {
          type: 'number',
          description: 'Interest rate for refinance loan (%)',
          default: 7.0
        },
        closing_costs: {
          type: 'number',
          description: 'Closing costs for purchase',
          default: 3000
        },
        refinance_closing_costs: {
          type: 'number',
          description: 'Closing costs for refinance',
          default: 3000
        },
        monthly_expenses: {
          type: 'number',
          description: 'Monthly operating expenses (property tax, insurance, maintenance, etc.)',
          default: 600
        },
        vacancy_rate: {
          type: 'number',
          description: 'Expected vacancy rate (%)',
          default: 5,
          minimum: 0,
          maximum: 100
        },
        holding_months: {
          type: 'number',
          description: 'Months to hold before refinancing',
          default: 6,
          minimum: 1
        }
      },
      required: ['purchase_price', 'rehab_cost', 'after_repair_value', 'monthly_rent']
    };
  }

  analyze(params) {
    const {
      purchase_price,
      rehab_cost,
      after_repair_value,
      monthly_rent,
      down_payment_percent = 20,
      purchase_interest_rate = 8.0,
      refinance_ltv = 0.75,
      refinance_interest_rate = 7.0,
      closing_costs = 3000,
      refinance_closing_costs = 3000,
      monthly_expenses = 600,
      vacancy_rate = 5,
      holding_months = 6
    } = params;

    // Initial investment calculations
    const down_payment = purchase_price * (down_payment_percent / 100);
    const initial_loan_amount = purchase_price - down_payment;
    const total_project_cost = purchase_price + rehab_cost + closing_costs;
    const cash_needed = down_payment + rehab_cost + closing_costs;

    // Monthly payment on initial loan
    const initial_monthly_rate = purchase_interest_rate / 100 / 12;
    const initial_payment = this.calculateMortgagePayment(
      initial_loan_amount,
      initial_monthly_rate,
      360 // 30 years
    );

    // Holding costs during rehab/stabilization
    const holding_costs = holding_months * (initial_payment + monthly_expenses);
    const total_cash_invested = cash_needed + holding_costs;

    // Refinance calculations
    const refinance_amount = after_repair_value * refinance_ltv;
    const cash_out = refinance_amount - initial_loan_amount - refinance_closing_costs;
    const cash_left_in_deal = total_cash_invested - cash_out;

    // New monthly payment after refinance
    const refinance_monthly_rate = refinance_interest_rate / 100 / 12;
    const refinance_payment = this.calculateMortgagePayment(
      refinance_amount,
      refinance_monthly_rate,
      360 // 30 years
    );

    // Cash flow calculations
    const effective_monthly_rent = monthly_rent * (1 - vacancy_rate / 100);
    const monthly_cash_flow = effective_monthly_rent - refinance_payment - monthly_expenses;
    const annual_cash_flow = monthly_cash_flow * 12;

    // Return calculations
    const cash_on_cash_return = cash_left_in_deal > 0 
      ? (annual_cash_flow / cash_left_in_deal) * 100 
      : Infinity;

    const total_return_year_one = annual_cash_flow + (after_repair_value - total_project_cost);
    const roi = (total_return_year_one / total_cash_invested) * 100;

    // Equity position
    const equity_after_refinance = after_repair_value - refinance_amount;
    const equity_capture = after_repair_value - total_project_cost;

    // Deal metrics
    const purchase_price_to_arv = (purchase_price / after_repair_value) * 100;
    const all_in_to_arv = (total_project_cost / after_repair_value) * 100;
    const rent_to_value = (monthly_rent / after_repair_value) * 100;

    // Success indicators
    const success_metrics = {
      positive_cash_flow: monthly_cash_flow > 0,
      cash_recovery: cash_out >= total_cash_invested * 0.8, // Recover 80%+ of investment
      equity_creation: equity_capture > 0,
      safe_ltv: refinance_ltv <= 0.75,
      good_cash_on_cash: cash_on_cash_return > 8,
      meets_one_percent: rent_to_value >= 1
    };

    const deal_score = Object.values(success_metrics).filter(v => v).length;
    const deal_rating = deal_score >= 5 ? 'Excellent' : 
                       deal_score >= 4 ? 'Good' : 
                       deal_score >= 3 ? 'Fair' : 'Poor';

    return {
      initial_investment: {
        purchase_price,
        down_payment: Math.round(down_payment),
        rehab_cost,
        closing_costs,
        holding_costs: Math.round(holding_costs),
        total_cash_needed: Math.round(total_cash_invested)
      },
      refinance_results: {
        after_repair_value,
        refinance_loan_amount: Math.round(refinance_amount),
        cash_out_amount: Math.round(cash_out),
        cash_left_in_deal: Math.round(cash_left_in_deal),
        new_monthly_payment: Math.round(refinance_payment)
      },
      cash_flow_analysis: {
        gross_monthly_rent: monthly_rent,
        effective_monthly_rent: Math.round(effective_monthly_rent),
        monthly_expenses,
        monthly_mortgage: Math.round(refinance_payment),
        net_monthly_cash_flow: Math.round(monthly_cash_flow),
        annual_cash_flow: Math.round(annual_cash_flow)
      },
      returns: {
        cash_on_cash_return: cash_on_cash_return === Infinity ? 'Infinite' : cash_on_cash_return.toFixed(1) + '%',
        total_roi: roi.toFixed(1) + '%',
        equity_captured: Math.round(equity_capture),
        equity_position: Math.round(equity_after_refinance)
      },
      deal_metrics: {
        purchase_to_arv: purchase_price_to_arv.toFixed(1) + '%',
        all_in_to_arv: all_in_to_arv.toFixed(1) + '%',
        rent_to_value: rent_to_value.toFixed(2) + '%',
        ltv_after_refi: (refinance_ltv * 100).toFixed(0) + '%'
      },
      success_indicators: success_metrics,
      overall_rating: {
        score: `${deal_score}/6`,
        rating: deal_rating,
        recommendation: deal_rating === 'Excellent' ? 'Strong BRRRR candidate' :
                       deal_rating === 'Good' ? 'Proceed with caution' :
                       'Consider negotiating better terms'
      }
    };
  }

  calculateMortgagePayment(principal, monthlyRate, months) {
    if (monthlyRate === 0) return principal / months;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  }
}