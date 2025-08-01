export class HouseHackingCalculator {
  getSchema() {
    return {
      type: 'object',
      properties: {
        purchase_price: { type: 'number', description: 'Purchase price of the property' },
        down_payment: { type: 'number', description: 'Down payment amount' },
        monthly_rent_unit2: { type: 'number', description: 'Monthly rent from second unit' },
        owner_expenses: { type: 'number', description: 'Owner monthly housing expenses' }
      },
      required: ['purchase_price', 'down_payment', 'monthly_rent_unit2', 'owner_expenses']
    };
  }

  evaluate(params) {
    // Simplified implementation for now
    const { purchase_price, down_payment, monthly_rent_unit2, owner_expenses } = params;
    const net_housing_cost = owner_expenses - monthly_rent_unit2;
    
    return {
      gross_housing_cost: owner_expenses,
      rental_income: monthly_rent_unit2,
      net_housing_cost,
      monthly_savings: owner_expenses - net_housing_cost,
      annual_savings: (owner_expenses - net_housing_cost) * 12
    };
  }
}