export class DebtToIncomeCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        monthly_income: {
          type: 'number',
          description: 'Monthly gross income in dollars',
          minimum: 0
        },
        proposed_housing_payment: {
          type: 'number',
          description: 'Proposed monthly housing payment (PITI + HOA)',
          minimum: 0
        },
        car_payments: {
          type: 'number',
          description: 'Monthly car loan/lease payments',
          default: 0
        },
        credit_card_minimums: {
          type: 'number',
          description: 'Monthly credit card minimum payments',
          default: 0
        },
        student_loans: {
          type: 'number',
          description: 'Monthly student loan payments',
          default: 0
        },
        personal_loans: {
          type: 'number',
          description: 'Monthly personal loan payments',
          default: 0
        },
        child_support_alimony: {
          type: 'number',
          description: 'Monthly child support or alimony payments',
          default: 0
        },
        other_debts: {
          type: 'number',
          description: 'Other monthly debt obligations',
          default: 0
        },
        loan_type: {
          type: 'string',
          description: 'Type of loan being considered',
          enum: ['conventional', 'fha', 'va', 'usda'],
          default: 'conventional'
        }
      },
      required: ['monthly_income', 'proposed_housing_payment']
    };
  }

  calculate(params) {
    const {
      monthly_income,
      proposed_housing_payment,
      car_payments = 0,
      credit_card_minimums = 0,
      student_loans = 0,
      personal_loans = 0,
      child_support_alimony = 0,
      other_debts = 0,
      loan_type = 'conventional'
    } = params;

    // Calculate total monthly debts (excluding proposed housing)
    const totalMonthlyDebts = car_payments + credit_card_minimums + student_loans + 
                             personal_loans + child_support_alimony + other_debts;

    // Calculate DTI ratios
    const frontEndRatio = (proposed_housing_payment / monthly_income) * 100;
    const backEndRatio = ((proposed_housing_payment + totalMonthlyDebts) / monthly_income) * 100;

    // Get limits based on loan type
    const limits = this.getLimitsForLoanType(loan_type);

    // Calculate qualification status
    const frontEndStatus = this.getQualificationStatus(frontEndRatio, limits.frontEnd);
    const backEndStatus = this.getQualificationStatus(backEndRatio, limits.backEnd);
    const overallStatus = this.getOverallStatus(frontEndStatus, backEndStatus);

    // Calculate maximum affordable payments
    const maxHousingPayment = monthly_income * (limits.frontEnd / 100);
    const maxTotalDebtPayment = monthly_income * (limits.backEnd / 100);
    const maxAffordableHousing = Math.min(maxHousingPayment, maxTotalDebtPayment - totalMonthlyDebts);

    // Calculate debt breakdown
    const debtBreakdown = this.calculateDebtBreakdown({
      car_payments,
      credit_card_minimums,
      student_loans,
      personal_loans,
      child_support_alimony,
      other_debts
    }, totalMonthlyDebts);

    return {
      income_analysis: {
        monthly_income: monthly_income,
        annual_income: monthly_income * 12
      },
      proposed_payment: {
        housing_payment: proposed_housing_payment,
        total_monthly_debts: totalMonthlyDebts,
        total_obligations: proposed_housing_payment + totalMonthlyDebts
      },
      dti_ratios: {
        front_end: {
          ratio: frontEndRatio.toFixed(1) + '%',
          limit: limits.frontEnd + '%',
          status: frontEndStatus,
          amount_over_under: proposed_housing_payment - maxHousingPayment
        },
        back_end: {
          ratio: backEndRatio.toFixed(1) + '%',
          limit: limits.backEnd + '%',
          status: backEndStatus,
          amount_over_under: (proposed_housing_payment + totalMonthlyDebts) - maxTotalDebtPayment
        }
      },
      qualification: {
        overall_status: overallStatus,
        loan_type: loan_type,
        front_end_passes: frontEndStatus === 'Excellent' || frontEndStatus === 'Good',
        back_end_passes: backEndStatus === 'Excellent' || backEndStatus === 'Good',
        likely_approval: overallStatus === 'Likely Approved'
      },
      maximum_affordable: {
        housing_payment: Math.round(maxAffordableHousing),
        current_proposal: proposed_housing_payment,
        difference: Math.round(maxAffordableHousing - proposed_housing_payment),
        percentage_of_max_used: ((proposed_housing_payment / maxAffordableHousing) * 100).toFixed(1) + '%'
      },
      debt_breakdown: debtBreakdown,
      recommendations: this.generateRecommendations(frontEndRatio, backEndRatio, limits, totalMonthlyDebts, monthly_income),
      improvement_strategies: this.getImprovementStrategies(frontEndRatio, backEndRatio, limits, totalMonthlyDebts, monthly_income)
    };
  }

  getLimitsForLoanType(loanType) {
    const limits = {
      conventional: { frontEnd: 28, backEnd: 36 },
      fha: { frontEnd: 31, backEnd: 43 },
      va: { frontEnd: 41, backEnd: 41 }, // VA uses residual income method primarily
      usda: { frontEnd: 29, backEnd: 41 }
    };

    return limits[loanType] || limits.conventional;
  }

  getQualificationStatus(ratio, limit) {
    if (ratio <= limit * 0.8) return 'Excellent';
    if (ratio <= limit) return 'Good';
    if (ratio <= limit * 1.1) return 'Marginal';
    return 'Poor';
  }

  getOverallStatus(frontEndStatus, backEndStatus) {
    if (frontEndStatus === 'Poor' || backEndStatus === 'Poor') return 'Likely Declined';
    if (frontEndStatus === 'Marginal' || backEndStatus === 'Marginal') return 'Manual Underwriting';
    if (frontEndStatus === 'Good' && backEndStatus === 'Good') return 'Likely Approved';
    return 'Excellent Candidate';
  }

  calculateDebtBreakdown(debts, totalDebts) {
    const breakdown = [];
    
    Object.entries(debts).forEach(([key, value]) => {
      if (value > 0) {
        const percentage = ((value / totalDebts) * 100).toFixed(1);
        breakdown.push({
          type: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          amount: value,
          percentage: percentage + '%'
        });
      }
    });

    return breakdown.sort((a, b) => b.amount - a.amount);
  }

  generateRecommendations(frontEndRatio, backEndRatio, limits, totalDebts, monthlyIncome) {
    const recommendations = [];

    if (frontEndRatio > limits.frontEnd) {
      const reduction = Math.ceil((frontEndRatio - limits.frontEnd) / 100 * monthlyIncome);
      recommendations.push(`Reduce proposed housing payment by $${reduction} to meet front-end DTI requirements.`);
    }

    if (backEndRatio > limits.backEnd) {
      const reduction = Math.ceil((backEndRatio - limits.backEnd) / 100 * monthlyIncome);
      recommendations.push(`Reduce total debt obligations by $${reduction} to meet back-end DTI requirements.`);
    }

    if (totalDebts > monthlyIncome * 0.2) {
      recommendations.push('Consider debt consolidation to reduce monthly obligations.');
    }

    if (frontEndRatio <= limits.frontEnd * 0.8 && backEndRatio <= limits.backEnd * 0.8) {
      recommendations.push('Excellent DTI ratios! You may qualify for better interest rates.');
    }

    return recommendations;
  }

  getImprovementStrategies(frontEndRatio, backEndRatio, limits, totalDebts, monthlyIncome) {
    const strategies = [];

    if (frontEndRatio > limits.frontEnd || backEndRatio > limits.backEnd) {
      strategies.push({
        strategy: 'Increase Income',
        description: 'Consider side income, overtime, or job advancement',
        potential_impact: 'Major improvement in DTI ratios'
      });

      strategies.push({
        strategy: 'Pay Down High-Interest Debt',
        description: 'Focus on credit cards and personal loans first',
        potential_impact: 'Directly improves back-end ratio'
      });

      strategies.push({
        strategy: 'Consider Different Loan Type',
        description: 'FHA loans allow higher DTI ratios (43% back-end)',
        potential_impact: 'May qualify with current debt levels'
      });
    }

    if (totalDebts > monthlyIncome * 0.15) {
      strategies.push({
        strategy: 'Debt Consolidation',
        description: 'Combine multiple debts into one lower payment',
        potential_impact: 'Reduce monthly obligations by 10-30%'
      });
    }

    strategies.push({
      strategy: 'Lower Housing Budget',
      description: 'Look for homes in lower price ranges',
      potential_impact: 'Immediate qualification improvement'
    });

    return strategies;
  }
}