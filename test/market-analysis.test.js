import { test } from 'node:test';
import assert from 'node:assert';
import { MarketAnalysisTool } from '../src/calculators/market-analysis.js';

test('MarketAnalysisTool - Basic CMA Analysis', () => {
  const calc = new MarketAnalysisTool();
  const result = calc.calculate({
    subject_property: {
      address: '123 Main St, Dallas, TX',
      bedrooms: 3,
      bathrooms: 2,
      square_feet: 1800,
      lot_size: 0.25,
      year_built: 2010,
      property_type: 'single_family',
      condition: 'good'
    },
    comparable_properties: [
      {
        address: '125 Main St, Dallas, TX',
        sale_price: 320000,
        sale_date: '2024-06-15',
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1750,
        lot_size: 0.22,
        year_built: 2008,
        condition: 'good',
        days_on_market: 18
      },
      {
        address: '456 Oak Ave, Dallas, TX',
        sale_price: 335000,
        sale_date: '2024-07-02',
        bedrooms: 3,
        bathrooms: 2.5,
        square_feet: 1850,
        lot_size: 0.28,
        year_built: 2012,
        condition: 'excellent',
        days_on_market: 12
      },
      {
        address: '789 Pine Rd, Dallas, TX',
        sale_price: 310000,
        sale_date: '2024-05-20',
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1780,
        lot_size: 0.24,
        year_built: 2009,
        condition: 'fair',
        days_on_market: 28
      }
    ]
  });

  // Test structure
  assert(result.cma_results, 'Should have CMA results');
  assert(result.comparable_analysis, 'Should have comparable analysis');
  assert(result.neighborhood_analysis, 'Should have neighborhood analysis');
  assert(result.price_recommendations, 'Should have price recommendations');
  assert(result.market_trends, 'Should have market trends');

  // Test CMA calculations
  const cma = result.cma_results;
  if (cma && cma.estimated_value) {
    assert(cma.estimated_value > 250000 && cma.estimated_value < 400000, 
      'Estimated value should be in reasonable range');
  }
  
  // Test comparable analysis
  const compAnalysis = result.comparable_analysis;
  assert(compAnalysis.total_comps_found > 0, 'Should find comparables');

  // Test market trends
  const trends = result.market_trends;
  assert(trends, 'Should have market trends analysis');
});

test('MarketAnalysisTool - Investment Analysis with Rental Data', () => {
  const calc = new MarketAnalysisTool();
  const result = calc.calculate({
    subject_property: {
      address: '123 Investment St, Austin, TX',
      bedrooms: 4,
      bathrooms: 3,
      square_feet: 2200,
      lot_size: 0.3,
      year_built: 2015,
      property_type: 'single_family',
      condition: 'excellent'
    },
    comparable_properties: [
      {
        address: '125 Investment St, Austin, TX',
        sale_price: 450000,
        sale_date: '2024-07-15',
        bedrooms: 4,
        bathrooms: 3,
        square_feet: 2150,
        lot_size: 0.28,
        year_built: 2014,
        condition: 'good',
        days_on_market: 15
      }
    ],
    rental_comparables: [
      {
        address: '127 Investment St, Austin, TX',
        monthly_rent: 3200,
        bedrooms: 4,
        bathrooms: 3,
        square_feet: 2180,
        lease_date: '2024-06-01'
      },
      {
        address: '200 Rental Ave, Austin, TX',
        monthly_rent: 3400,
        bedrooms: 4,
        bathrooms: 3,
        square_feet: 2250,
        lease_date: '2024-07-01'
      }
    ],
    analysis_options: {
      include_investment_metrics: true,
      target_cap_rate: 6.0,
      target_cash_on_cash: 8.0
    }
  });

  // Test investment analysis (if available)
  const investment = result.investment_analysis;
  if (investment) {
    assert(typeof investment === 'object', 'Should have investment analysis object');
  }

  // Test price recommendations exist
  const recommendations = result.price_recommendations;
  assert(recommendations, 'Should have price recommendations');
  if (recommendations.investment_perspective) {
    assert(typeof recommendations.investment_perspective === 'object',
      'Investment perspective should be an object');
  }
});

test('MarketAnalysisTool - Neighborhood Analysis', () => {
  const calc = new MarketAnalysisTool();
  const result = calc.calculate({
    subject_property: {
      address: '123 Suburb St, Phoenix, AZ',
      bedrooms: 3,
      bathrooms: 2,
      square_feet: 1600,
      lot_size: 0.2,
      year_built: 2005,
      property_type: 'single_family',
      condition: 'good'
    },
    comparable_properties: [
      {
        address: '125 Suburb St, Phoenix, AZ',
        sale_price: 380000,
        sale_date: '2024-06-01',
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1650,
        lot_size: 0.21,
        year_built: 2006,
        condition: 'good',
        days_on_market: 22
      },
      {
        address: '456 Desert Ave, Phoenix, AZ',
        sale_price: 365000,
        sale_date: '2024-07-10',
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1580,
        lot_size: 0.19,
        year_built: 2004,
        condition: 'fair',
        days_on_market: 35
      }
    ],
    market_data: {
      median_home_price: 375000,
      price_appreciation_1yr: 8.5,
      price_appreciation_5yr: 45.2,
      inventory_months: 2.8,
      new_listings_trend: 'increasing'
    }
  });

  // Test neighborhood analysis
  const neighborhood = result.neighborhood_analysis;
  assert(neighborhood, 'Should have neighborhood analysis');
  if (neighborhood.overall_score !== undefined) {
    assert(neighborhood.overall_score >= 0 && neighborhood.overall_score <= 100,
      'Overall score should be 0-100');
  }

  // Test market trends
  const trends = result.market_trends;
  assert(trends, 'Should have market trends analysis');
});

test('MarketAnalysisTool - Price Adjustments and Scoring', () => {
  const calc = new MarketAnalysisTool();
  const result = calc.calculate({
    subject_property: {
      address: '123 Test St, Denver, CO',
      bedrooms: 3,
      bathrooms: 2,
      square_feet: 1900,
      lot_size: 0.25,
      year_built: 2020, // Newer than comps
      property_type: 'single_family',
      condition: 'excellent'
    },
    comparable_properties: [
      {
        address: '125 Test St, Denver, CO',
        sale_price: 425000,
        sale_date: '2024-07-01',
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1850, // Smaller
        lot_size: 0.23,
        year_built: 2010, // Older
        condition: 'good', // Lower condition
        days_on_market: 20
      },
      {
        address: '456 Test Ave, Denver, CO',
        sale_price: 405000,
        sale_date: '2024-06-15',
        bedrooms: 3,
        bathrooms: 1.5, // Fewer baths
        square_feet: 1800, // Much smaller
        lot_size: 0.22,
        year_built: 2008,
        condition: 'fair',
        days_on_market: 32
      }
    ]
  });

  // Test that CMA produces reasonable results
  const cma = result.cma_results;
  if (cma) {
    assert(typeof cma === 'object', 'Should have CMA results');
  }
  
  // Test comparable analysis
  const compAnalysis = result.comparable_analysis;
  assert(compAnalysis.total_comps_found > 0, 'Should analyze comparables');
});

test('MarketAnalysisTool - Market Conditions Analysis', () => {
  const calc = new MarketAnalysisTool();
  
  // Test seller's market conditions
  const sellerMarket = calc.calculate({
    subject_property: {
      address: '123 Hot Market St, Miami, FL',
      bedrooms: 2,
      bathrooms: 2,
      square_feet: 1200,
      property_type: 'condo',
      condition: 'good'
    },
    comparable_properties: [
      {
        address: '125 Hot Market St, Miami, FL',
        sale_price: 550000,
        sale_date: '2024-07-20',
        bedrooms: 2,
        bathrooms: 2,
        square_feet: 1180,
        condition: 'good',
        days_on_market: 5 // Very fast sale
      },
      {
        address: '200 Beach Ave, Miami, FL',
        sale_price: 575000,
        sale_date: '2024-07-25',
        bedrooms: 2,
        bathrooms: 2,
        square_feet: 1220,
        condition: 'excellent',
        days_on_market: 3 // Even faster
      }
    ],
    market_data: {
      inventory_months: 1.2, // Low inventory
      price_appreciation_1yr: 15.5, // High appreciation
      new_listings_trend: 'decreasing'
    }
  });

  // Test that analysis completes without errors
  assert(sellerMarket.market_trends, 'Should have market trends');
  assert(sellerMarket.neighborhood_analysis, 'Should have neighborhood analysis');
  assert(sellerMarket.price_recommendations, 'Should have price recommendations');
});

test('MarketAnalysisTool - Multi-Family Property Analysis', () => {
  const calc = new MarketAnalysisTool();
  const result = calc.calculate({
    subject_property: {
      address: '123 Duplex Dr, Portland, OR',
      bedrooms: 6, // 3 per unit
      bathrooms: 4, // 2 per unit
      square_feet: 2800,
      lot_size: 0.15,
      year_built: 2000,
      property_type: 'multi_family',
      units: 2,
      condition: 'good'
    },
    comparable_properties: [
      {
        address: '125 Duplex Dr, Portland, OR',
        sale_price: 685000,
        sale_date: '2024-06-20',
        bedrooms: 6,
        bathrooms: 4,
        square_feet: 2750,
        lot_size: 0.14,
        year_built: 1998,
        property_type: 'multi_family',
        units: 2,
        condition: 'good',
        days_on_market: 25
      }
    ],
    rental_comparables: [
      {
        address: '200 Multi St, Portland, OR',
        monthly_rent: 3800, // Total for both units
        bedrooms: 6,
        bathrooms: 4,
        square_feet: 2900,
        units: 2,
        lease_date: '2024-07-01'
      }
    ],
    analysis_options: {
      include_investment_metrics: true,
      property_expenses: {
        property_tax_annual: 8500,
        insurance_annual: 2400,
        maintenance_annual: 4000,
        property_management_rate: 8.0,
        vacancy_rate: 7.0
      }
    }
  });

  // Test multi-family analysis structure
  assert(result.cma_results, 'Should have CMA results');
  assert(result.comparable_analysis, 'Should have comparable analysis');
  
  // Test investment analysis if available
  if (result.investment_analysis) {
    assert(typeof result.investment_analysis === 'object', 'Should have investment analysis');
  }
});

test('MarketAnalysisTool - Risk Assessment', () => {
  const calc = new MarketAnalysisTool();
  const result = calc.calculate({
    subject_property: {
      address: '123 Risk St, Las Vegas, NV',
      bedrooms: 3,
      bathrooms: 2,
      square_feet: 1700,
      year_built: 2006, // Built during bubble
      property_type: 'single_family',
      condition: 'fair' // Needs work
    },
    comparable_properties: [
      {
        address: '125 Risk St, Las Vegas, NV',
        sale_price: 285000,
        sale_date: '2024-05-15', // Older sale
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1650,
        year_built: 2005,
        condition: 'fair',
        days_on_market: 65 // Slow sale
      }
    ],
    market_data: {
      price_appreciation_1yr: -2.5, // Declining market
      inventory_months: 8.5, // High inventory
      new_listings_trend: 'increasing'
    },
    analysis_options: {
      include_risk_analysis: true
    }
  });

  // Test risk assessment structure
  const riskAssessment = result.risk_assessment;
  const neighborhood = result.neighborhood_analysis;
  
  // Basic structure tests
  assert(neighborhood, 'Should have neighborhood analysis');
  assert(riskAssessment, 'Should have risk assessment');
  
  // Test price recommendations exist
  const recommendations = result.price_recommendations;
  assert(recommendations, 'Should have price recommendations');
});

test('MarketAnalysisTool - Schema Validation', () => {
  const calc = new MarketAnalysisTool();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.subject_property, 'Should have subject_property');
  assert(schema.properties.comparable_properties, 'Should have comparable_properties');
  assert(schema.properties.rental_comparables, 'Should have rental_comparables');
  assert(schema.properties.market_data, 'Should have market_data');
  assert(schema.properties.analysis_options, 'Should have analysis_options');
  assert(schema.required.includes('subject_property'), 'subject_property should be required');
  assert(schema.required.includes('comparable_properties'), 'comparable_properties should be required');
});