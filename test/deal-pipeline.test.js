import { test } from 'node:test';
import assert from 'node:assert';
import { DealPipelineTracker } from '../src/calculators/deal-pipeline.js';

test('DealPipelineTracker - Basic Pipeline Analysis', () => {
  const tracker = new DealPipelineTracker();
  const result = tracker.calculate({
    deals: [
      {
        deal_id: 'deal-001',
        property_address: '123 Main St, Austin, TX',
        deal_type: 'single_family',
        current_stage: 'under_contract',
        financial_projections: {
          purchase_price: 350000,
          projected_arv: 425000,
          monthly_rent: 2500,
          monthly_expenses: 800,
          down_payment: 70000
        },
        timeline: {
          date_discovered: '2024-07-01',
          contract_date: '2024-08-01'
        }
      },
      {
        deal_id: 'deal-002',
        property_address: '456 Oak Ave, Dallas, TX',
        deal_type: 'multi_family',
        current_stage: 'due_diligence',
        financial_projections: {
          purchase_price: 850000,
          projected_arv: 950000,
          monthly_rent: 6000,
          monthly_expenses: 2000,
          down_payment: 170000
        },
        timeline: {
          date_discovered: '2024-07-15',
          contract_date: '2024-08-10'
        }
      }
    ]
  });

  // Test structure
  assert(result.pipeline_summary, 'Should have pipeline summary');
  assert(result.deals, 'Should have deals analysis');
  assert(result.insights, 'Should have insights');
  assert(result.recommendations, 'Should have recommendations');

  // Test pipeline summary
  const summary = result.pipeline_summary;
  assert(summary.total_deals === 2, 'Should count total deals');
  assert(summary.total_pipeline_value === 1200000, 'Should calculate total pipeline value');
  assert(summary.active_deals === 2, 'Should count active deals');
  assert(summary.completed_deals === 0, 'Should count completed deals');

  // Test deals analysis
  const deals = result.deals;
  assert(Array.isArray(deals), 'Deals should be an array');
  assert(deals.length === 2, 'Should analyze all deals');

  const deal1 = deals.find(d => d.deal_id === 'deal-001');
  assert(deal1, 'Should include first deal');
  assert(deal1.deal_metrics, 'Should calculate deal metrics');
  assert(typeof deal1.deal_metrics.deal_score === 'number', 'Should assign numeric deal score');
  assert(deal1.completion_percentage > 0, 'Should calculate completion percentage');
});

test('DealPipelineTracker - Multiple Deals with Different Stages', () => {
  const tracker = new DealPipelineTracker();
  const result = tracker.calculate({
    deals: [
      {
        deal_id: 'deal-001',
        property_address: '123 Main St',
        deal_type: 'single_family',
        current_stage: 'lead',
        financial_projections: {
          purchase_price: 200000,
          projected_arv: 280000
        }
      },
      {
        deal_id: 'deal-002',
        property_address: '456 Oak Ave',
        deal_type: 'multi_family',
        current_stage: 'completed',
        financial_projections: {
          purchase_price: 500000,
          projected_arv: 600000
        }
      },
      {
        deal_id: 'deal-003',
        property_address: '789 Pine St',
        deal_type: 'fix_flip',
        current_stage: 'dead',
        financial_projections: {
          purchase_price: 150000,
          projected_arv: 220000
        }
      }
    ]
  });

  const summary = result.pipeline_summary;
  assert(summary.total_deals === 3, 'Should count all deals including dead ones');
  assert(summary.active_deals === 1, 'Should count only active deals');
  assert(summary.completed_deals === 1, 'Should count completed deals');
  assert(summary.dead_deals === 1, 'Should count dead deals');
});

test('DealPipelineTracker - Deal Scoring System', () => {
  const tracker = new DealPipelineTracker();
  
  // High-profit deal
  const result = tracker.calculate({
    deals: [{
      deal_id: 'high-profit',
      property_address: '123 High St',
      deal_type: 'fix_flip',
      current_stage: 'under_contract',
      financial_projections: {
        purchase_price: 200000,
        projected_arv: 320000, // 60% profit margin
        rehab_budget: 20000
      }
    }]
  });

  const deal = result.deals[0];
  assert(deal.deal_metrics.deal_score >= 0, 'Should calculate deal score');
  assert(deal.deal_metrics.deal_score <= 100, 'Score should be within valid range');
  assert(deal.deal_metrics.total_return > 0, 'Should calculate positive total return');
});

test('DealPipelineTracker - Pipeline Analytics', () => {
  const tracker = new DealPipelineTracker();
  const result = tracker.calculate({
    deals: [
      {
        deal_id: 'deal-001',
        property_address: '123 Main St',
        deal_type: 'single_family',
        current_stage: 'under_contract',
        financial_projections: {
          purchase_price: 200000
        }
      },
      {
        deal_id: 'deal-002',
        property_address: '456 Oak Ave',
        deal_type: 'multi_family',
        current_stage: 'due_diligence',
        financial_projections: {
          purchase_price: 500000
        }
      }
    ],
    analysis_options: {
      pipeline_analytics: true
    }
  });

  assert(result.pipeline_analytics, 'Should include pipeline analytics when requested');
  assert(Array.isArray(result.pipeline_analytics.stage_distribution), 'Should have stage distribution');
  assert(result.pipeline_analytics.deal_type_distribution, 'Should have deal type distribution');
  assert(result.pipeline_analytics.velocity_metrics, 'Should have velocity metrics');
  assert(Array.isArray(result.pipeline_analytics.bottlenecks), 'Should identify bottlenecks');
});

test('DealPipelineTracker - Performance Metrics', () => {
  const tracker = new DealPipelineTracker();
  const result = tracker.calculate({
    deals: [
      {
        deal_id: 'deal-001',
        property_address: '123 Main St',
        deal_type: 'single_family',
        current_stage: 'completed',
        financial_projections: {
          purchase_price: 200000,
          projected_arv: 280000,
          down_payment: 40000,
          monthly_rent: 2000,
          monthly_expenses: 500
        },
        timeline: {
          date_discovered: '2024-06-01',
          closing_date: '2024-08-01'
        }
      }
    ],
    analysis_options: {
      performance_metrics: true
    }
  });

  assert(result.performance_metrics, 'Should include performance metrics when requested');
  const metrics = result.performance_metrics;
  assert(metrics.total_deals_completed === 1, 'Should count completed deals');
  assert(metrics.total_deals_active === 0, 'Should count active deals');
  assert(typeof metrics.overall_roi === 'number', 'Should calculate ROI');
  assert(typeof metrics.success_rate === 'number', 'Should calculate success rate');
});

test('DealPipelineTracker - Timeline Analysis', () => {
  const tracker = new DealPipelineTracker();
  const result = tracker.calculate({
    deals: [
      {
        deal_id: 'deal-001',
        property_address: '123 Main St',
        deal_type: 'single_family',
        current_stage: 'financing',
        financial_projections: {
          purchase_price: 200000
        },
        timeline: {
          contract_date: '2024-07-01',
          financing_deadline: '2024-08-01' // Past deadline
        }
      }
    ],
    analysis_options: {
      timeline_analysis: true
    }
  });

  assert(result.timeline_analysis, 'Should include timeline analysis when requested');
  const timeline = result.timeline_analysis;
  assert(Array.isArray(timeline.timeline_issues), 'Should identify timeline issues');
  assert(Array.isArray(timeline.upcoming_deadlines), 'Should identify upcoming deadlines');
  assert(typeof timeline.deals_with_timeline_risks === 'number', 'Should count deals with risks');
});

test('DealPipelineTracker - Deal Type Distribution', () => {
  const tracker = new DealPipelineTracker();
  const result = tracker.calculate({
    deals: [
      {
        deal_id: 'deal-001',
        property_address: '123 Main St',
        deal_type: 'single_family',
        current_stage: 'lead',
        financial_projections: {
          purchase_price: 200000
        }
      },
      {
        deal_id: 'deal-002',
        property_address: '456 Oak Ave',
        deal_type: 'single_family',
        current_stage: 'offer_submitted',
        financial_projections: {
          purchase_price: 250000
        }
      },
      {
        deal_id: 'deal-003',
        property_address: '789 Pine St',
        deal_type: 'multi_family',
        current_stage: 'under_contract',
        financial_projections: {
          purchase_price: 600000
        }
      }
    ],
    analysis_options: {
      pipeline_analytics: true
    }
  });

  const analytics = result.pipeline_analytics;
  assert(analytics.deal_type_distribution, 'Should have deal type distribution');
  
  const singleFamily = analytics.deal_type_distribution.single_family;
  assert(singleFamily, 'Should include single family analysis');
  assert(singleFamily.count === 2, 'Should count single family deals');
  assert(singleFamily.percentage > 0, 'Should calculate percentage');

  const multiFamily = analytics.deal_type_distribution.multi_family;
  assert(multiFamily && multiFamily.count === 1, 'Should count multi family deals');
});

test('DealPipelineTracker - Recommendations Generation', () => {
  const tracker = new DealPipelineTracker();
  const result = tracker.calculate({
    deals: [
      {
        deal_id: 'low-volume-test',
        property_address: '123 Main St',
        deal_type: 'single_family',
        current_stage: 'lead',
        financial_projections: {
          purchase_price: 200000
        }
      }
    ]
  });

  const recommendations = result.recommendations;
  assert(recommendations, 'Should provide recommendations');
  assert(Array.isArray(recommendations.recommendations), 'Should have recommendations array');
  assert(recommendations.recommendations.length > 0, 'Should have at least one recommendation');
  
  // Should recommend increasing pipeline volume for low deal count
  const volumeRec = recommendations.recommendations.find(r => 
    r.category === 'Pipeline Management' && r.recommendation.includes('pipeline volume')
  );
  assert(volumeRec, 'Should recommend increasing pipeline volume');
});

test('DealPipelineTracker - Conversion Rates', () => {
  const tracker = new DealPipelineTracker();
  const result = tracker.calculate({
    deals: [
      {
        deal_id: 'deal-001',
        property_address: '123 Main St',
        deal_type: 'single_family',
        current_stage: 'completed',
        financial_projections: {
          purchase_price: 200000
        }
      },
      {
        deal_id: 'deal-002',
        property_address: '456 Oak Ave',
        deal_type: 'single_family',
        current_stage: 'under_contract',
        financial_projections: {
          purchase_price: 250000
        }
      }
    ],
    analysis_options: {
      stage_conversion_rates: true
    }
  });

  assert(result.conversion_rates, 'Should include conversion rates when requested');
  const conversions = result.conversion_rates;
  assert(Array.isArray(conversions.stage_conversions), 'Should have stage conversions');
  assert(typeof conversions.overall_conversion === 'number', 'Should calculate overall conversion');
  assert(Array.isArray(conversions.drop_off_analysis), 'Should analyze drop-offs');
});

test('DealPipelineTracker - Schema Validation', () => {
  const tracker = new DealPipelineTracker();
  const schema = tracker.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.deals, 'Should have deals property');
  assert(schema.properties.deals.type === 'array', 'Deals should be an array');
  assert(schema.properties.deals.items.type === 'object', 'Deal items should be objects');
  
  const dealSchema = schema.properties.deals.items;
  assert(dealSchema.properties.deal_id, 'Should define deal_id');
  assert(dealSchema.properties.current_stage, 'Should define current_stage');
  assert(dealSchema.properties.financial_projections, 'Should define financial_projections');
  
  assert(dealSchema.required.includes('deal_id'), 'deal_id should be required');
  assert(dealSchema.required.includes('current_stage'), 'current_stage should be required');
  assert(dealSchema.required.includes('property_address'), 'property_address should be required');
  
  // Test stage enum values
  const stageEnum = dealSchema.properties.current_stage.enum;
  assert(stageEnum.includes('lead'), 'Should include lead stage');
  assert(stageEnum.includes('under_contract'), 'Should include under_contract stage');
  assert(stageEnum.includes('completed'), 'Should include completed stage');
  assert(stageEnum.includes('dead'), 'Should include dead stage');
});

test('DealPipelineTracker - Empty Pipeline', () => {
  const tracker = new DealPipelineTracker();
  const result = tracker.calculate({
    deals: []
  });

  const summary = result.pipeline_summary;
  assert(summary.total_deals === 0, 'Should handle empty pipeline');
  assert(summary.total_pipeline_value === 0, 'Should show zero pipeline value');
  assert(summary.active_deals === 0, 'Should show zero active deals');
  
  assert(Array.isArray(result.deals), 'Should return empty array for deals');
  assert(result.deals.length === 0, 'Deals should be empty');
  
  assert(Array.isArray(result.insights), 'Should still provide insights');
  assert(result.recommendations, 'Should still provide recommendations');
  
  // Should recommend pipeline building when empty
  const volumeInsight = result.insights.find(i => 
    i.type === 'Pipeline Volume' && i.insight.includes('Low deal volume')
  );
  assert(volumeInsight, 'Should identify low pipeline volume');
});

test('DealPipelineTracker - Deal Scoring with Financial Metrics', () => {
  const tracker = new DealPipelineTracker();
  const result = tracker.calculate({
    deals: [{
      deal_id: 'rental-deal',
      property_address: '123 Rental St',
      deal_type: 'single_family',
      current_stage: 'under_contract',
      financial_projections: {
        purchase_price: 200000,
        monthly_rent: 2000,
        monthly_expenses: 800,
        down_payment: 40000
      },
      property_details: {
        property_condition: 'good'
      }
    }]
  });

  const deal = result.deals[0];
  const metrics = deal.deal_metrics;
  
  assert(typeof metrics.cap_rate === 'number', 'Should calculate cap rate');
  assert(typeof metrics.cash_on_cash_return === 'number', 'Should calculate cash-on-cash return');
  assert(typeof metrics.breakeven_ratio === 'number', 'Should calculate breakeven ratio');
  assert(metrics.cap_rate > 0, 'Cap rate should be positive for profitable deal');
  assert(metrics.breakeven_ratio > 1, 'Should have positive cash flow (breakeven > 1)');
});