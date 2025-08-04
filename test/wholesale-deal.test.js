import { test } from 'node:test';
import assert from 'node:assert';
import { WholesaleDealAnalyzer } from '../src/calculators/wholesale-deal.js';

test('WholesaleDealAnalyzer - Basic Wholesale Deal Analysis', () => {
  const calc = new WholesaleDealAnalyzer();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'fair',
      square_footage: 1500,
      bedrooms: 3,
      bathrooms: 2
    },
    purchase_details: {
      contract_price: 80000,
      earnest_money: 1000,
      seller_motivation: 'high',
      days_on_market: 45
    },
    market_analysis: {
      arv: 150000,
      repair_estimates: 25000
    },
    wholesale_strategy: {
      assignment_fee: 12000
    }
  });

  // Test structure
  assert(result.property_summary, 'Should have property summary');
  assert(result.deal_metrics, 'Should have deal metrics');
  assert(result.profitability_analysis, 'Should have profitability analysis');
  assert(result.recommendations, 'Should have recommendations');

  // Test deal metrics
  const metrics = result.deal_metrics;
  assert(metrics.contract_price === 80000, 'Should preserve contract price');
  assert(metrics.arv === 150000, 'Should preserve ARV');
  assert(metrics.assignment_fee === 12000, 'Should preserve assignment fee');
  assert(metrics.buyer_acquisition_cost === 92000, 'Should calculate buyer acquisition cost');
  assert(metrics.wholesale_spread > 0, 'Should calculate positive wholesale spread');
  assert(metrics.buyer_roi > 0, 'Should calculate buyer ROI');

  // Test profitability
  const profitability = result.profitability_analysis;
  assert(profitability.gross_profit === 12000, 'Should calculate gross profit');
  assert(profitability.net_profit > 0, 'Should calculate positive net profit');
  assert(profitability.estimated_days_to_assign > 0, 'Should estimate assignment timeline');
  assert(profitability.profitability_rating, 'Should provide profitability rating');
});

test('WholesaleDealAnalyzer - Deal Quality Grading', () => {
  const calc = new WholesaleDealAnalyzer();
  
  // Test A-grade deal
  const excellentDeal = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'good'
    },
    purchase_details: {
      contract_price: 60000,
      seller_motivation: 'very_high'
    },
    market_analysis: {
      arv: 120000,
      repair_estimates: 15000
    },
    wholesale_strategy: {
      assignment_fee: 15000
    }
  });

  assert(['A', 'B'].includes(excellentDeal.deal_metrics.deal_quality_metrics.deal_grade), 
    'Should grade excellent deal as A or B');

  // Test poor deal
  const poorDeal = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'poor'
    },
    purchase_details: {
      contract_price: 95000,
      seller_motivation: 'low'
    },
    market_analysis: {
      arv: 110000,
      repair_estimates: 20000
    },
    wholesale_strategy: {
      assignment_fee: 3000
    }
  });

  assert(['C', 'D'].includes(poorDeal.deal_metrics.deal_quality_metrics.deal_grade), 
    'Should grade poor deal as C or D');
});

test('WholesaleDealAnalyzer - Buyer Analysis', () => {
  const calc = new WholesaleDealAnalyzer();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'fair'
    },
    purchase_details: {
      contract_price: 75000
    },
    market_analysis: {
      arv: 140000,
      repair_estimates: 20000
    },
    wholesale_strategy: {
      assignment_fee: 10000
    },
    analysis_options: {
      calculate_buyer_analysis: true
    }
  });

  const buyerAnalysis = result.buyer_analysis;
  assert(buyerAnalysis, 'Should include buyer analysis when requested');
  assert(buyerAnalysis.buyer_acquisition_cost === 85000, 'Should calculate buyer acquisition cost');
  assert(buyerAnalysis.total_investment === 105000, 'Should calculate total investment');
  assert(buyerAnalysis.gross_profit > 0, 'Should calculate positive gross profit for buyer');
  assert(buyerAnalysis.seventy_percent_rule, 'Should analyze 70% rule compliance');
  assert(buyerAnalysis.seventy_percent_rule.max_allowable_offer > 0, 'Should calculate MAO');
  assert(buyerAnalysis.financing_analysis, 'Should include financing analysis');
  assert(buyerAnalysis.buyer_deal_quality, 'Should rate buyer deal quality');
});

test('WholesaleDealAnalyzer - Risk Assessment', () => {
  const calc = new WholesaleDealAnalyzer();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'distressed'
    },
    purchase_details: {
      contract_price: 90000,
      seller_motivation: 'low',
      inspection_period_days: 5
    },
    market_analysis: {
      arv: 130000,
      repair_estimates: 35000,
      market_trend: 'declining'
    },
    wholesale_strategy: {
      assignment_fee: 5000
    },
    analysis_options: {
      risk_assessment: true
    }
  });

  const riskAnalysis = result.risk_assessment;
  assert(riskAnalysis, 'Should include risk analysis when requested');
  assert(Array.isArray(riskAnalysis.identified_risks), 'Should identify specific risks');
  assert(riskAnalysis.identified_risks.length > 0, 'Should identify multiple risks for challenging deal');
  assert(riskAnalysis.risk_score > 0, 'Should calculate risk score');
  assert(riskAnalysis.overall_risk_level, 'Should assign overall risk level');
  assert(Array.isArray(riskAnalysis.risk_mitigation_strategies), 'Should provide mitigation strategies');

  // Check for specific high-risk conditions
  const riskCategories = riskAnalysis.identified_risks.map(risk => risk.category);
  assert(riskCategories.includes('Property Risk'), 'Should identify property risk for distressed condition');
  assert(riskCategories.includes('Market Risk'), 'Should identify market risk for declining market');
});

test('WholesaleDealAnalyzer - Exit Strategies', () => {
  const calc = new WholesaleDealAnalyzer();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'good'
    },
    purchase_details: {
      contract_price: 70000,
      earnest_money: 2000
    },
    market_analysis: {
      arv: 130000,
      repair_estimates: 18000
    },
    wholesale_strategy: {
      assignment_fee: 12000
    },
    analysis_options: {
      include_exit_strategies: true
    }
  });

  const exitStrategies = result.exit_strategies;
  assert(exitStrategies, 'Should include exit strategies when requested');
  assert(Array.isArray(exitStrategies.available_strategies), 'Should provide multiple strategies');
  assert(exitStrategies.available_strategies.length >= 3, 'Should have at least 3 exit strategies');
  
  const strategyNames = exitStrategies.available_strategies.map(s => s.strategy);
  assert(strategyNames.includes('Wholesale Assignment'), 'Should include wholesale assignment');
  assert(strategyNames.includes('Double Close'), 'Should include double close option');
  
  assert(exitStrategies.recommended_strategy, 'Should recommend best strategy');
  assert(exitStrategies.strategy_comparison, 'Should provide strategy comparison');
  assert(exitStrategies.strategy_comparison.highest_profit, 'Should identify highest profit strategy');
});

test('WholesaleDealAnalyzer - Market Timing Analysis', () => {
  const calc = new WholesaleDealAnalyzer();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'good'
    },
    purchase_details: {
      contract_price: 80000,
      days_on_market: 20
    },
    market_analysis: {
      arv: 140000,
      market_trend: 'appreciating',
      neighborhood_grade: 'B'
    },
    wholesale_strategy: {
      assignment_fee: 10000
    },
    analysis_options: {
      market_timing: true
    }
  });

  const marketTiming = result.market_timing;
  assert(marketTiming, 'Should include market timing when requested');
  assert(Array.isArray(marketTiming.timing_factors), 'Should identify timing factors');
  assert(typeof marketTiming.timing_score === 'number', 'Should calculate timing score');
  assert(marketTiming.timing_rating, 'Should provide timing rating');
  assert(Array.isArray(marketTiming.recommendations), 'Should provide timing recommendations');
  
  // Check for positive factors in good market
  const positiveFactors = marketTiming.timing_factors.filter(f => f.impact === 'Positive');
  assert(positiveFactors.length > 0, 'Should identify positive timing factors');
});

test('WholesaleDealAnalyzer - Profitability Ratings', () => {
  const calc = new WholesaleDealAnalyzer();
  
  // Test high profitability scenario
  const highProfitResult = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'good'
    },
    purchase_details: {
      contract_price: 50000
    },
    market_analysis: {
      arv: 120000,
      repair_estimates: 15000
    },
    wholesale_strategy: {
      assignment_fee: 18000,
      buyer_list_size: 100
    }
  });

  const highProfit = highProfitResult.profitability_analysis;
  assert(['Excellent', 'Very Good', 'Good'].includes(highProfit.profitability_rating), 
    'Should rate high profit deal favorably');
  assert(highProfit.net_profit > 10000, 'Should calculate high net profit');

  // Test low profitability scenario
  const lowProfitResult = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'fair'
    },
    purchase_details: {
      contract_price: 85000
    },
    market_analysis: {
      arv: 110000,
      repair_estimates: 20000
    },
    wholesale_strategy: {
      assignment_fee: 3000,
      buyer_list_size: 20
    }
  });

  const lowProfit = lowProfitResult.profitability_analysis;
  assert(['Poor', 'Fair'].includes(lowProfit.profitability_rating), 
    'Should rate low profit deal unfavorably');
});

test('WholesaleDealAnalyzer - 70% Rule Analysis', () => {
  const calc = new WholesaleDealAnalyzer();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'good'
    },
    purchase_details: {
      contract_price: 60000
    },
    market_analysis: {
      arv: 150000,
      repair_estimates: 20000
    },
    wholesale_strategy: {
      assignment_fee: 8000
    },
    analysis_options: {
      calculate_buyer_analysis: true
    }
  });

  const buyerAnalysis = result.buyer_analysis;
  const seventyRule = buyerAnalysis.seventy_percent_rule;
  
  // 70% rule: ARV * 0.7 - repair costs = $150k * 0.7 - $20k = $85k max offer
  // Buyer pays: $60k + $8k = $68k (should meet rule)
  assert(seventyRule.max_allowable_offer === 85000, 'Should calculate correct MAO (150k * 0.7 - 20k)');
  assert(seventyRule.actual_offer === 68000, 'Should show actual buyer offer');
  assert(seventyRule.meets_rule === true, 'Should meet 70% rule');
  assert(seventyRule.margin === 17000, 'Should calculate margin above rule');
});

test('WholesaleDealAnalyzer - Assignment Timeline Estimation', () => {
  const calc = new WholesaleDealAnalyzer();
  
  // Test with large buyer list and A-grade deal
  const fastAssignment = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'excellent'
    },
    purchase_details: {
      contract_price: 50000
    },
    market_analysis: {
      arv: 120000,
      repair_estimates: 10000
    },
    wholesale_strategy: {
      assignment_fee: 15000,
      buyer_list_size: 150
    }
  });

  const fastTimeline = fastAssignment.profitability_analysis.estimated_days_to_assign;
  assert(fastTimeline <= 25, 'Should estimate faster assignment for good deal with large buyer list');

  // Test with small buyer list and poor deal
  const slowAssignment = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'poor'
    },
    purchase_details: {
      contract_price: 90000
    },
    market_analysis: {
      arv: 110000,
      repair_estimates: 25000
    },
    wholesale_strategy: {
      assignment_fee: 2000,
      buyer_list_size: 15
    }
  });

  const slowTimeline = slowAssignment.profitability_analysis.estimated_days_to_assign;
  assert(slowTimeline >= 35, 'Should estimate slower assignment for poor deal with small buyer list');
});

test('WholesaleDealAnalyzer - Recommendations Generation', () => {
  const calc = new WholesaleDealAnalyzer();
  const result = calc.calculate({
    property_details: {
      property_type: 'single_family',
      condition: 'poor'
    },
    purchase_details: {
      contract_price: 95000,
      seller_motivation: 'low'
    },
    market_analysis: {
      arv: 120000,
      repair_estimates: 30000,
      market_trend: 'declining'
    },
    wholesale_strategy: {
      assignment_fee: 2000
    },
    analysis_options: {
      risk_assessment: true
    }
  });

  const recommendations = result.recommendations;
  assert(Array.isArray(recommendations), 'Should provide recommendations array');
  assert(recommendations.length > 0, 'Should have specific recommendations');
  
  recommendations.forEach(rec => {
    assert(rec.category, 'Each recommendation should have category');
    assert(rec.priority, 'Each recommendation should have priority');
    assert(rec.recommendation, 'Each recommendation should have description');
    assert(rec.action, 'Each recommendation should have specific action');
    assert(['High', 'Medium', 'Low'].includes(rec.priority), 'Priority should be valid');
  });

  // Check for specific recommendations based on the challenging scenario
  const categories = recommendations.map(rec => rec.category);
  const highPriorityRecs = recommendations.filter(rec => rec.priority === 'High');
  assert(highPriorityRecs.length > 0, 'Should have high priority recommendations for challenging deal');
});

test('WholesaleDealAnalyzer - Schema Validation', () => {
  const calc = new WholesaleDealAnalyzer();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.property_details, 'Should have property_details property');
  assert(schema.properties.purchase_details, 'Should have purchase_details property');
  assert(schema.properties.market_analysis, 'Should have market_analysis property');
  assert(schema.properties.wholesale_strategy, 'Should have wholesale_strategy property');
  assert(schema.properties.analysis_options, 'Should have analysis_options property');
  
  assert(schema.required.includes('property_details'), 'property_details should be required');
  assert(schema.required.includes('purchase_details'), 'purchase_details should be required');
  assert(schema.required.includes('market_analysis'), 'market_analysis should be required');
  assert(schema.required.includes('wholesale_strategy'), 'wholesale_strategy should be required');
  
  // Test nested schema structure
  const propertyDetails = schema.properties.property_details;
  assert(propertyDetails.properties.property_type, 'Should define property_type');
  assert(propertyDetails.properties.condition, 'Should define condition');
  assert(propertyDetails.required.includes('property_type'), 'property_type should be required');
  assert(propertyDetails.required.includes('condition'), 'condition should be required');
});