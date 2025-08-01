import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MarketDataResource {
  constructor() {
    // Load market data from JSON file
    const dataPath = join(__dirname, '..', 'data', 'market-data.json');
    try {
      const data = readFileSync(dataPath, 'utf-8');
      this.marketData = JSON.parse(data);
    } catch (error) {
      // Fallback to sample data if file doesn't exist
      this.marketData = {
        mortgage_rates: { current: { rates: {} } },
        home_prices: {},
        rental_market: {},
        investor_metrics: {},
        economic_indicators: {}
      };
    }
  }

  async getCurrent() {
    const { mortgage_rates, home_prices, rental_market, economic_indicators, market_trends } = this.marketData;
    
    return {
      mortgage_rates: {
        conventional_30_year: mortgage_rates.current.rates['30_year_fixed']?.rate || 7.125,
        conventional_15_year: mortgage_rates.current.rates['15_year_fixed']?.rate || 6.625,
        fha_30_year: mortgage_rates.current.rates['fha_30_year']?.rate || 6.875,
        va_30_year: mortgage_rates.current.rates['va_30_year']?.rate || 6.750,
        jumbo_30_year: mortgage_rates.current.rates['jumbo_30_year']?.rate || 7.375,
        arm_5_1: mortgage_rates.current.rates['5_1_arm']?.rate || 5.95,
        trends: {
          week_over_week: mortgage_rates.current.rates['30_year_fixed']?.change_from_last_week || 0,
          direction: mortgage_rates.current.rates['30_year_fixed']?.trend || 'stable'
        },
        last_updated: mortgage_rates.current.date || new Date().toISOString()
      },
      market_trends: {
        home_price_appreciation_yoy: home_prices.national?.year_over_year_change || 3.2,
        inventory_months_supply: home_prices.national?.inventory_months || 3.8,
        median_home_price: home_prices.national?.median_price || 412000,
        price_per_sqft: home_prices.national?.price_per_sqft || 225,
        market_insights: market_trends || []
      },
      economic_indicators: {
        inflation_rate: economic_indicators.inflation_rate || 3.2,
        fed_funds_rate: economic_indicators.fed_funds_rate || 5.5,
        unemployment_rate: economic_indicators.unemployment_rate || 3.9,
        gdp_growth: economic_indicators.gdp_growth || 2.1,
        consumer_confidence: economic_indicators.consumer_confidence || 104.7
      },
      rental_metrics: {
        national_average_rent: rental_market.national_average_rent || 1895,
        rent_growth_yoy: rental_market.year_over_year_change || 2.8,
        vacancy_rate: rental_market.vacancy_rate || 6.2,
        rent_to_price_ratio: rental_market.rent_to_price_ratio || 0.0046
      },
      regional_data: {
        hottest_markets: home_prices.top_markets?.filter(m => m.market_temp === 'hot').map(m => m.metro) || ["Miami, FL"],
        cooling_markets: home_prices.top_markets?.filter(m => m.market_temp === 'cooling').map(m => m.metro) || ["Austin, TX"],
        best_cash_flow_markets: rental_market.top_rental_markets?.map(m => m.city) || ["Columbus, OH", "Kansas City, MO"],
        balanced_markets: home_prices.top_markets?.filter(m => m.market_temp === 'balanced').map(m => m.metro) || ["Phoenix, AZ"]
      }
    };
  }

  async getRateHistory() {
    const historical = this.marketData.mortgage_rates.historical || {};
    const current = this.marketData.mortgage_rates.current?.rates['30_year_fixed']?.rate || 7.125;
    
    return {
      current_rate: current,
      one_year_ago: historical.one_year_ago?.['30_year_fixed'] || 6.35,
      six_months_ago: historical.six_months_ago?.['30_year_fixed'] || 7.15,
      peak_2023: historical.peak_2023 || { rate: 7.79, date: "October 2023" },
      forecast: this.marketData.mortgage_rates.forecast || {},
      historical_context: [
        { period: "Current", rate: current },
        { period: "1 Year Ago", rate: historical.one_year_ago?.['30_year_fixed'] || 6.35 },
        { period: "6 Months Ago", rate: historical.six_months_ago?.['30_year_fixed'] || 7.15 },
        { period: "2023 Peak", rate: historical.peak_2023?.['30_year_fixed'] || 7.79 },
        { period: "Pre-Pandemic (2019)", rate: 3.94 },
        { period: "Historical Low (2021)", rate: 2.65 }
      ]
    };
  }

  async getInvestorMetrics() {
    const { investor_metrics, home_prices, rental_market } = this.marketData;
    
    return {
      cap_rates: investor_metrics.cap_rates || {},
      cash_on_cash_returns: investor_metrics.cash_on_cash_returns || {},
      market_sentiment: investor_metrics.market_sentiment || {},
      top_markets_by_metric: {
        appreciation: home_prices.top_markets?.sort((a, b) => b.yoy_change - a.yoy_change).slice(0, 3) || [],
        cash_flow: rental_market.top_rental_markets || [],
        balanced: home_prices.top_markets?.filter(m => m.market_temp === 'balanced') || []
      },
      investment_tips: [
        "Focus on markets with 3-6 months inventory for balanced opportunities",
        "Consider markets where rent growth outpaces home price appreciation",
        "Look for areas with population growth and job diversification",
        "Cash-on-cash returns above 8% indicate strong rental markets"
      ]
    };
  }

  async getMarketByLocation(location) {
    // Find market data for specific location
    const market = this.marketData.home_prices.top_markets?.find(
      m => m.metro.toLowerCase().includes(location.toLowerCase())
    );
    
    if (market) {
      return {
        location: market.metro,
        median_price: market.median_price,
        year_over_year_change: market.yoy_change,
        inventory_months: market.inventory_months,
        market_temperature: market.market_temp,
        analysis: this.getMarketAnalysis(market.market_temp, market.yoy_change)
      };
    }
    
    return {
      location: location,
      data: "Market-specific data not available",
      national_comparison: this.marketData.home_prices.national,
      suggestion: "Compare with national averages above for general market context"
    };
  }

  getMarketAnalysis(temp, yoyChange) {
    const analyses = {
      hot: "Seller's market with multiple offers common. Consider making strong initial offers.",
      cooling: "Shifting toward buyer's market. More negotiation room and longer decision time.",
      balanced: "Equal opportunity for buyers and sellers. Good time for fair deals.",
      competitive: "Fast-moving market. Be prepared to act quickly with pre-approvals ready."
    };
    
    return analyses[temp] || "Market conditions vary. Consult local real estate professionals.";
  }
}