/**
 * Market Analysis Tool
 * Analyzes market conditions, comps, and investment opportunities
 */

export class MarketAnalysisTool {
  getSchema() {
    return {
      type: 'object',
      properties: {
        subject_property: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Property address' },
            property_type: {
              type: 'string',
              enum: ['single_family', 'condo', 'townhouse', 'multi_family', 'commercial'],
              description: 'Type of property'
            },
            bedrooms: { type: 'number', minimum: 0, maximum: 20, description: 'Number of bedrooms' },
            bathrooms: { type: 'number', minimum: 0, maximum: 20, description: 'Number of bathrooms' },
            square_feet: { type: 'number', minimum: 0, description: 'Total square footage' },
            lot_size: { type: 'number', minimum: 0, description: 'Lot size in square feet' },
            year_built: { type: 'number', minimum: 1800, maximum: 2030, description: 'Year built' },
            asking_price: { type: 'number', minimum: 0, description: 'Current asking price' },
            estimated_rent: { type: 'number', minimum: 0, description: 'Estimated monthly rent' }
          },
          required: ['property_type', 'bedrooms', 'bathrooms', 'square_feet']
        },
        comparable_properties: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              address: { type: 'string', description: 'Comparable property address' },
              sale_price: { type: 'number', minimum: 0, description: 'Recent sale price' },
              sale_date: { type: 'string', description: 'Date of sale (YYYY-MM-DD)' },
              bedrooms: { type: 'number', minimum: 0, description: 'Number of bedrooms' },
              bathrooms: { type: 'number', minimum: 0, description: 'Number of bathrooms' },
              square_feet: { type: 'number', minimum: 0, description: 'Square footage' },
              lot_size: { type: 'number', minimum: 0, description: 'Lot size in square feet' },
              year_built: { type: 'number', minimum: 1800, maximum: 2030, description: 'Year built' },
              distance_miles: { type: 'number', minimum: 0, description: 'Distance from subject property' },
              condition: {
                type: 'string',
                enum: ['poor', 'fair', 'good', 'excellent'],
                description: 'Property condition'
              },
              monthly_rent: { type: 'number', minimum: 0, description: 'Monthly rent if rental' }
            },
            required: ['sale_price', 'sale_date', 'bedrooms', 'bathrooms', 'square_feet']
          },
          minItems: 1,
          maxItems: 20
        },
        rental_comparables: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              address: { type: 'string', description: 'Rental property address' },
              monthly_rent: { type: 'number', minimum: 0, description: 'Monthly rent amount' },
              lease_date: { type: 'string', description: 'Date of lease (YYYY-MM-DD)' },
              bedrooms: { type: 'number', minimum: 0, description: 'Number of bedrooms' },
              bathrooms: { type: 'number', minimum: 0, description: 'Number of bathrooms' },
              square_feet: { type: 'number', minimum: 0, description: 'Square footage' },
              lot_size: { type: 'number', minimum: 0, description: 'Lot size in square feet' },
              year_built: { type: 'number', minimum: 1800, maximum: 2030, description: 'Year built' },
              distance_miles: { type: 'number', minimum: 0, description: 'Distance from subject property' },
              condition: {
                type: 'string',
                enum: ['poor', 'fair', 'good', 'excellent'],
                description: 'Property condition'
              },
              units: { type: 'number', minimum: 1, description: 'Number of units (for multifamily)' }
            },
            required: ['monthly_rent', 'lease_date', 'bedrooms', 'bathrooms', 'square_feet']
          },
          maxItems: 20
        },
        market_data: {
          type: 'object',
          properties: {
            zip_code: { type: 'string', description: 'ZIP code of subject property' },
            city: { type: 'string', description: 'City name' },
            state: { type: 'string', description: 'State abbreviation' },
            median_home_price: { type: 'number', minimum: 0, description: 'Area median home price' },
            median_rent: { type: 'number', minimum: 0, description: 'Area median rent' },
            price_per_sqft: { type: 'number', minimum: 0, description: 'Average price per square foot' },
            rent_per_sqft: { type: 'number', minimum: 0, description: 'Average rent per square foot' },
            days_on_market: { type: 'number', minimum: 0, description: 'Average days on market' },
            inventory_months: { type: 'number', minimum: 0, description: 'Months of inventory' },
            appreciation_rate_1yr: { type: 'number', description: '1-year appreciation rate (%)' },
            appreciation_rate_5yr: { type: 'number', description: '5-year annualized appreciation rate (%)' },
            rental_vacancy_rate: { type: 'number', minimum: 0, maximum: 100, description: 'Rental vacancy rate (%)' },
            population_growth: { type: 'number', description: 'Annual population growth rate (%)' },
            employment_growth: { type: 'number', description: 'Annual employment growth rate (%)' },
            crime_score: { type: 'number', minimum: 0, maximum: 100, description: 'Crime safety score (100 = safest)' },
            school_rating: { type: 'number', minimum: 1, maximum: 10, description: 'School district rating' }
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            analysis_type: {
              type: 'string',
              enum: ['investment', 'primary_residence', 'flip', 'rental'],
              description: 'Type of analysis to perform'
            },
            max_comp_distance: { type: 'number', minimum: 0, maximum: 10, description: 'Maximum distance for comps (miles)' },
            max_comp_age: { type: 'number', minimum: 1, maximum: 365, description: 'Maximum age of comps (days)' },
            adjustment_factors: {
              type: 'object',
              properties: {
                condition_adjustments: {
                  type: 'object',
                  properties: {
                    poor: { type: 'number', description: 'Adjustment for poor condition (%)' },
                    fair: { type: 'number', description: 'Adjustment for fair condition (%)' },
                    good: { type: 'number', description: 'Adjustment for good condition (%)' },
                    excellent: { type: 'number', description: 'Adjustment for excellent condition (%)' }
                  }
                },
                size_adjustment_per_sqft: { type: 'number', description: 'Price adjustment per square foot difference' },
                age_adjustment_per_year: { type: 'number', description: 'Price adjustment per year of age difference' },
                lot_size_adjustment: { type: 'number', description: 'Adjustment for lot size differences (%)' }
              }
            }
          }
        }
      },
      required: ['subject_property', 'comparable_properties']
    };
  }

  calculate(params) {
    const { 
      subject_property, 
      comparable_properties, 
      market_data = {}, 
      analysis_options = {} 
    } = params;
    
    // Set defaults
    const analysis_type = analysis_options.analysis_type || 'investment';
    const max_comp_distance = analysis_options.max_comp_distance || 2.0;
    const max_comp_age = analysis_options.max_comp_age || 180;
    
    // Filter and score comparables
    const scored_comps = this.scoreComparables(
      subject_property, 
      comparable_properties, 
      max_comp_distance, 
      max_comp_age
    );
    
    // Perform CMA (Comparative Market Analysis)
    const cma_analysis = this.performCMA(
      subject_property, 
      scored_comps, 
      analysis_options.adjustment_factors
    );
    
    // Market trends analysis
    const market_trends = this.analyzeMarketTrends(market_data);
    
    // Investment analysis if applicable
    const investment_analysis = analysis_type === 'investment' || analysis_type === 'rental' ?
      this.performInvestmentAnalysis(subject_property, cma_analysis, market_data) : null;
    
    // Neighborhood analysis
    const neighborhood_analysis = this.analyzeNeighborhood(market_data);
    
    // Risk assessment
    const risk_assessment = this.assessMarketRisk(market_data, market_trends);
    
    // Price recommendations
    const price_recommendations = this.generatePriceRecommendations(
      cma_analysis, 
      market_trends, 
      analysis_type
    );
    
    // Market timing analysis
    const timing_analysis = this.analyzeMarketTiming(market_data, market_trends);
    
    return {
      subject_property_analysis: {
        ...subject_property,
        price_per_sqft: subject_property.asking_price ? 
          subject_property.asking_price / subject_property.square_feet : null,
        rent_per_sqft: subject_property.estimated_rent ? 
          (subject_property.estimated_rent * 12) / subject_property.square_feet : null
      },
      comparable_analysis: {
        total_comps_found: comparable_properties.length,
        qualified_comps: scored_comps.filter(c => c.score >= 70).length,
        best_comps: scored_comps.slice(0, 5),
        comp_statistics: this.calculateCompStatistics(scored_comps)
      },
      cma_results: cma_analysis,
      market_trends: market_trends,
      neighborhood_analysis: neighborhood_analysis,
      investment_analysis: investment_analysis,
      risk_assessment: risk_assessment,
      price_recommendations: price_recommendations,
      timing_analysis: timing_analysis,
      recommendations: this.generateRecommendations(
        cma_analysis,
        market_trends,
        investment_analysis,
        risk_assessment,
        analysis_type
      )
    };
  }
  
  scoreComparables(subject, comps, maxDistance, maxAge) {
    const currentDate = new Date();
    
    return comps.map(comp => {
      let score = 100;
      const reasons = [];
      
      // Age of sale
      const saleDate = new Date(comp.sale_date);
      const daysSinceSale = (currentDate - saleDate) / (1000 * 60 * 60 * 24);
      if (daysSinceSale > maxAge) {
        score -= 30;
        reasons.push(`Sale is ${Math.round(daysSinceSale)} days old`);
      } else if (daysSinceSale > 90) {
        score -= 10;
        reasons.push('Sale is over 90 days old');
      }
      
      // Distance
      if (comp.distance_miles > maxDistance) {
        score -= 25;
        reasons.push(`Distance (${comp.distance_miles} mi) exceeds preferred range`);
      } else if (comp.distance_miles > 1.0) {
        score -= 10;
        reasons.push('Distance over 1 mile');
      }
      
      // Bedroom/bathroom match
      if (comp.bedrooms !== subject.bedrooms) {
        score -= Math.abs(comp.bedrooms - subject.bedrooms) * 5;
        reasons.push(`Bedroom count differs by ${Math.abs(comp.bedrooms - subject.bedrooms)}`);
      }
      if (Math.abs(comp.bathrooms - subject.bathrooms) > 0.5) {
        score -= Math.abs(comp.bathrooms - subject.bathrooms) * 3;
        reasons.push('Bathroom count differs significantly');
      }
      
      // Square footage similarity
      const sqftDiff = Math.abs(comp.square_feet - subject.square_feet);
      const sqftPctDiff = sqftDiff / subject.square_feet;
      if (sqftPctDiff > 0.3) {
        score -= 20;
        reasons.push(`Square footage differs by ${Math.round(sqftPctDiff * 100)}%`);
      } else if (sqftPctDiff > 0.15) {
        score -= 10;
        reasons.push('Significant square footage difference');
      }
      
      // Age similarity
      if (comp.year_built && subject.year_built) {
        const ageDiff = Math.abs(comp.year_built - subject.year_built);
        if (ageDiff > 20) {
          score -= 10;
          reasons.push(`Age differs by ${ageDiff} years`);
        }
      }
      
      // Condition adjustment
      if (comp.condition) {
        const conditionScores = { poor: -15, fair: -5, good: 0, excellent: 5 };
        score += conditionScores[comp.condition] || 0;
        if (comp.condition === 'poor' || comp.condition === 'fair') {
          reasons.push(`${comp.condition} condition`);
        }
      }
      
      return {
        ...comp,
        score: Math.max(0, score),
        score_reasons: reasons,
        price_per_sqft: comp.sale_price / comp.square_feet,
        days_since_sale: Math.round(daysSinceSale)
      };
    }).sort((a, b) => b.score - a.score);
  }
  
  performCMA(subject, scoredComps, adjustmentFactors = {}) {
    const qualifiedComps = scoredComps.filter(c => c.score >= 60);
    
    if (qualifiedComps.length === 0) {
      return {
        estimated_value: null,
        confidence: 'low',
        error: 'No qualified comparables found'
      };
    }
    
    // Apply adjustments to comps
    const adjustedComps = qualifiedComps.map(comp => {
      let adjustedPrice = comp.sale_price;
      const adjustments = [];
      
      // Square footage adjustment
      if (adjustmentFactors.size_adjustment_per_sqft) {
        const sqftDiff = subject.square_feet - comp.square_feet;
        const sqftAdjustment = sqftDiff * adjustmentFactors.size_adjustment_per_sqft;
        adjustedPrice += sqftAdjustment;
        if (Math.abs(sqftAdjustment) > 1000) {
          adjustments.push(`Size: ${sqftAdjustment > 0 ? '+' : ''}$${Math.round(sqftAdjustment).toLocaleString()}`);
        }
      }
      
      // Age adjustment
      if (adjustmentFactors.age_adjustment_per_year && comp.year_built && subject.year_built) {
        const ageDiff = subject.year_built - comp.year_built;
        const ageAdjustment = ageDiff * adjustmentFactors.age_adjustment_per_year;
        adjustedPrice += ageAdjustment;
        if (Math.abs(ageAdjustment) > 500) {
          adjustments.push(`Age: ${ageAdjustment > 0 ? '+' : ''}$${Math.round(ageAdjustment).toLocaleString()}`);
        }
      }
      
      // Condition adjustment
      if (adjustmentFactors.condition_adjustments && comp.condition) {
        const conditionAdjustment = (adjustmentFactors.condition_adjustments[comp.condition] || 0) / 100 * comp.sale_price;
        adjustedPrice += conditionAdjustment;
        if (Math.abs(conditionAdjustment) > 1000) {
          adjustments.push(`Condition: ${conditionAdjustment > 0 ? '+' : ''}$${Math.round(conditionAdjustment).toLocaleString()}`);
        }
      }
      
      return {
        ...comp,
        adjusted_price: adjustedPrice,
        adjustments: adjustments,
        price_per_sqft_adjusted: adjustedPrice / comp.square_feet
      };
    });
    
    // Calculate value estimates using different methods
    const adjustedPrices = adjustedComps.map(c => c.adjusted_price);
    const weights = adjustedComps.map(c => c.score / 100);
    
    // Weighted average
    const weightedSum = adjustedPrices.reduce((sum, price, i) => sum + (price * weights[i]), 0);
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    const weightedAverage = weightedSum / weightSum;
    
    // Simple average of top 3 comps
    const top3Average = adjustedPrices.slice(0, 3).reduce((sum, price) => sum + price, 0) / Math.min(3, adjustedPrices.length);
    
    // Median
    const sortedPrices = [...adjustedPrices].sort((a, b) => a - b);
    const median = sortedPrices.length % 2 === 0 ? 
      (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2 :
      sortedPrices[Math.floor(sortedPrices.length / 2)];
    
    // Final estimate (weighted average of methods)
    const finalEstimate = (weightedAverage * 0.5) + (top3Average * 0.3) + (median * 0.2);
    
    // Confidence assessment
    const priceSpread = Math.max(...adjustedPrices) - Math.min(...adjustedPrices);
    const priceCV = this.calculateCoefficientOfVariation(adjustedPrices);
    
    let confidence;
    if (qualifiedComps.length >= 5 && priceCV < 0.15) {
      confidence = 'high';
    } else if (qualifiedComps.length >= 3 && priceCV < 0.25) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
    
    return {
      estimated_value: Math.round(finalEstimate),
      value_range: {
        low: Math.round(Math.min(...adjustedPrices)),
        high: Math.round(Math.max(...adjustedPrices))
      },
      confidence: confidence,
      price_per_sqft: Math.round(finalEstimate / subject.square_feet),
      valuation_methods: {
        weighted_average: Math.round(weightedAverage),
        top_3_average: Math.round(top3Average),
        median: Math.round(median)
      },
      adjusted_comparables: adjustedComps.slice(0, 5),
      statistics: {
        comp_count: qualifiedComps.length,
        price_spread: Math.round(priceSpread),
        coefficient_of_variation: priceCV,
        average_score: qualifiedComps.reduce((sum, c) => sum + c.score, 0) / qualifiedComps.length
      }
    };
  }
  
  analyzeMarketTrends(marketData) {
    if (!marketData || Object.keys(marketData).length === 0) {
      return {
        trend_direction: 'unknown',
        trend_strength: 'unknown',
        market_conditions: 'insufficient_data'
      };
    }
    
    const trends = {
      price_trend: this.categorizeTrend(marketData.appreciation_rate_1yr, [0, 5, 10]),
      inventory_level: this.categorizeInventory(marketData.inventory_months),
      market_velocity: this.categorizeVelocity(marketData.days_on_market),
      population_trend: this.categorizeTrend(marketData.population_growth, [0, 1, 3]),
      employment_trend: this.categorizeTrend(marketData.employment_growth, [0, 2, 5])
    };
    
    // Overall market condition
    const positiveIndicators = Object.values(trends).filter(t => 
      t === 'strong_positive' || t === 'moderate_positive' || t === 'fast' || t === 'low'
    ).length;
    
    const negativeIndicators = Object.values(trends).filter(t => 
      t === 'strong_negative' || t === 'moderate_negative' || t === 'slow' || t === 'high'
    ).length;
    
    let marketCondition;
    if (positiveIndicators >= 3) {
      marketCondition = 'strong_buyers_market';
    } else if (positiveIndicators >= 2) {
      marketCondition = 'moderate_buyers_market';
    } else if (negativeIndicators >= 3) {
      marketCondition = 'sellers_market';
    } else {
      marketCondition = 'balanced_market';
    }
    
    return {
      ...trends,
      overall_market_condition: marketCondition,
      market_strength_score: this.calculateMarketStrength(marketData),
      trend_summary: this.generateTrendSummary(trends, marketCondition)
    };
  }
  
  performInvestmentAnalysis(subject, cmaResults, marketData) {
    if (!cmaResults.estimated_value || !subject.estimated_rent) {
      return {
        analysis_possible: false,
        reason: 'Insufficient data for investment analysis'
      };
    }
    
    const propertyValue = subject.asking_price || cmaResults.estimated_value;
    const monthlyRent = subject.estimated_rent;
    const annualRent = monthlyRent * 12;
    
    // Basic investment metrics
    const grossRentMultiplier = propertyValue / annualRent;
    const monthlyGrossYield = (monthlyRent / propertyValue) * 100;
    const annualGrossYield = monthlyGrossYield * 12;
    
    // Cap rate estimation (assuming 40% expense ratio)
    const estimatedExpenseRatio = 0.40;
    const noi = annualRent * (1 - estimatedExpenseRatio);
    const capRate = (noi / propertyValue) * 100;
    
    // Cash-on-cash estimation (assuming 25% down)
    const downPayment = propertyValue * 0.25;
    const loanAmount = propertyValue * 0.75;
    const monthlyPayment = this.calculateMonthlyPayment(loanAmount, 0.07, 30);
    const annualDebtService = monthlyPayment * 12;
    const annualCashFlow = noi - annualDebtService;
    const cashOnCashReturn = (annualCashFlow / downPayment) * 100;
    
    // 1% rule and 2% rule
    const onePercentRule = monthlyRent / propertyValue >= 0.01;
    const twoPercentRule = monthlyRent / propertyValue >= 0.02;
    
    // Rent-to-price ratio analysis
    const marketMedianRent = marketData.median_rent || 0;
    const marketMedianPrice = marketData.median_home_price || 0;
    const marketRentRatio = marketMedianPrice > 0 ? (marketMedianRent * 12) / marketMedianPrice : 0;
    const subjectRentRatio = annualRent / propertyValue;
    
    return {
      analysis_possible: true,
      basic_metrics: {
        gross_rent_multiplier: grossRentMultiplier,
        monthly_gross_yield: monthlyGrossYield,
        annual_gross_yield: annualGrossYield,
        estimated_cap_rate: capRate,
        estimated_cash_on_cash: cashOnCashReturn
      },
      rule_analysis: {
        one_percent_rule: onePercentRule,
        two_percent_rule: twoPercentRule,
        rent_to_price_ratio: subjectRentRatio,
        market_rent_ratio: marketRentRatio,
        ratio_comparison: subjectRentRatio > marketRentRatio ? 'above_market' : 'below_market'
      },
      cash_flow_estimate: {
        annual_rent: annualRent,
        estimated_noi: noi,
        estimated_cash_flow: annualCashFlow,
        down_payment_25pct: downPayment,
        monthly_payment_estimate: monthlyPayment
      },
      investment_grade: this.gradeInvestment(capRate, cashOnCashReturn, onePercentRule)
    };
  }
  
  analyzeNeighborhood(marketData) {
    if (!marketData) {
      return { analysis_available: false };
    }
    
    const scores = {
      safety: marketData.crime_score || 50,
      schools: marketData.school_rating ? marketData.school_rating * 10 : 50,
      growth: this.scoreGrowth(marketData.population_growth, marketData.employment_growth),
      affordability: this.scoreAffordability(marketData.median_home_price, marketData.median_rent)
    };
    
    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
    
    let neighborhoodGrade;
    if (overallScore >= 80) neighborhoodGrade = 'A';
    else if (overallScore >= 70) neighborhoodGrade = 'B';
    else if (overallScore >= 60) neighborhoodGrade = 'C';
    else if (overallScore >= 50) neighborhoodGrade = 'D';
    else neighborhoodGrade = 'F';
    
    return {
      analysis_available: true,
      scores: scores,
      overall_score: Math.round(overallScore),
      neighborhood_grade: neighborhoodGrade,
      strengths: this.identifyNeighborhoodStrengths(scores),
      concerns: this.identifyNeighborhoodConcerns(scores)
    };
  }
  
  assessMarketRisk(marketData, marketTrends) {
    const risks = [];
    const opportunities = [];
    
    // Price appreciation risk
    if (marketData.appreciation_rate_1yr > 15) {
      risks.push({
        category: 'Price Risk',
        level: 'High',
        description: 'Rapid price appreciation may indicate bubble conditions'
      });
    }
    
    // Inventory risk
    if (marketData.inventory_months < 2) {
      risks.push({
        category: 'Supply Risk',
        level: 'Medium',
        description: 'Very low inventory may lead to unsustainable price increases'
      });
    } else if (marketData.inventory_months > 8) {
      opportunities.push({
        category: 'Buyer Opportunity',
        description: 'High inventory provides negotiation leverage'
      });
    }
    
    // Economic risk
    if (marketData.employment_growth < 0) {
      risks.push({
        category: 'Economic Risk',
        level: 'High',
        description: 'Declining employment may impact property values and rental demand'
      });
    }
    
    // Population trends
    if (marketData.population_growth < 0) {
      risks.push({
        category: 'Demographic Risk',
        level: 'Medium',
        description: 'Population decline may reduce long-term demand'
      });
    } else if (marketData.population_growth > 2) {
      opportunities.push({
        category: 'Growth Opportunity',
        description: 'Strong population growth supports property demand'
      });
    }
    
    // Rental market risk
    if (marketData.rental_vacancy_rate > 10) {
      risks.push({
        category: 'Rental Risk',
        level: 'Medium',
        description: 'High vacancy rate indicates rental market challenges'
      });
    }
    
    const riskScore = risks.reduce((score, risk) => {
      return score + (risk.level === 'High' ? 30 : risk.level === 'Medium' ? 20 : 10);
    }, 0);
    
    let overallRisk = 'Low';
    if (riskScore >= 60) overallRisk = 'High';
    else if (riskScore >= 30) overallRisk = 'Medium';
    
    return {
      overall_risk_level: overallRisk,
      risk_score: riskScore,
      identified_risks: risks,
      opportunities: opportunities,
      risk_mitigation: this.generateRiskMitigation(risks)
    };
  }
  
  generatePriceRecommendations(cmaResults, marketTrends, analysisType) {
    if (!cmaResults.estimated_value) {
      return {
        recommendations_available: false,
        reason: 'CMA analysis failed'
      };
    }
    
    const estimatedValue = cmaResults.estimated_value;
    const recommendations = {};
    
    // Buying recommendations
    if (analysisType === 'investment' || analysisType === 'primary_residence') {
      const maxOffer = estimatedValue * 0.95; // Start 5% below estimated value
      const walkAwayPrice = estimatedValue * 1.10; // Don't pay more than 10% above value
      
      recommendations.buying = {
        initial_offer: Math.round(maxOffer),
        max_offer: Math.round(estimatedValue),
        walk_away_price: Math.round(walkAwayPrice),
        negotiation_strategy: this.getNegotiationStrategy(marketTrends.overall_market_condition)
      };
    }
    
    // Selling recommendations
    if (analysisType === 'flip') {
      const listPrice = estimatedValue * 1.05; // List 5% above estimated value
      const minAcceptable = estimatedValue * 0.95; // Accept down to 5% below value
      
      recommendations.selling = {
        suggested_list_price: Math.round(listPrice),
        minimum_acceptable: Math.round(minAcceptable),
        pricing_strategy: this.getPricingStrategy(marketTrends.overall_market_condition)
      };
    }
    
    // Market timing advice
    recommendations.timing = this.getTimingAdvice(marketTrends);
    
    return {
      recommendations_available: true,
      estimated_market_value: estimatedValue,
      confidence_level: cmaResults.confidence,
      ...recommendations
    };
  }
  
  analyzeMarketTiming(marketData, marketTrends) {
    const indicators = {
      price_momentum: marketTrends.price_trend,
      inventory_trend: marketTrends.inventory_level,
      economic_indicators: [marketTrends.population_trend, marketTrends.employment_trend],
      market_velocity: marketTrends.market_velocity
    };
    
    // Score timing (1-10 scale)
    let timingScore = 5; // Neutral
    
    if (indicators.price_momentum === 'strong_positive') timingScore += 2;
    else if (indicators.price_momentum === 'moderate_positive') timingScore += 1;
    else if (indicators.price_momentum === 'moderate_negative') timingScore -= 1;
    else if (indicators.price_momentum === 'strong_negative') timingScore -= 2;
    
    if (indicators.inventory_trend === 'low') timingScore += 1;
    else if (indicators.inventory_trend === 'high') timingScore -= 1;
    
    const positiveEconomic = indicators.economic_indicators.filter(i => 
      i === 'strong_positive' || i === 'moderate_positive').length;
    timingScore += positiveEconomic - 1; // +1 for each positive, -1 for neutral baseline
    
    if (indicators.market_velocity === 'fast') timingScore += 1;
    else if (indicators.market_velocity === 'slow') timingScore -= 1;
    
    timingScore = Math.max(1, Math.min(10, timingScore));
    
    let timingRecommendation;
    if (timingScore >= 8) timingRecommendation = 'excellent_time_to_buy';
    else if (timingScore >= 6) timingRecommendation = 'good_time_to_buy';
    else if (timingScore >= 4) timingRecommendation = 'neutral_timing';
    else timingRecommendation = 'consider_waiting';
    
    return {
      timing_score: timingScore,
      timing_recommendation: timingRecommendation,
      key_factors: this.identifyKeyTimingFactors(indicators),
      seasonal_considerations: this.getSeasonalAdvice()
    };
  }
  
  // Helper methods
  calculateMonthlyPayment(principal, rate, years) {
    const monthlyRate = rate / 12;
    const numPayments = years * 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  }
  
  calculateCoefficientOfVariation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return stdDev / mean;
  }
  
  calculateCompStatistics(comps) {
    const prices = comps.map(c => c.sale_price);
    const pricesPerSqft = comps.map(c => c.price_per_sqft);
    
    return {
      average_price: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      median_price: this.calculateMedian(prices),
      average_price_per_sqft: pricesPerSqft.reduce((sum, p) => sum + p, 0) / pricesPerSqft.length,
      median_price_per_sqft: this.calculateMedian(pricesPerSqft),
      price_range: { min: Math.min(...prices), max: Math.max(...prices) }
    };
  }
  
  calculateMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  categorizeTrend(value, thresholds) {
    if (value === undefined || value === null) return 'unknown';
    if (value >= thresholds[2]) return 'strong_positive';
    if (value >= thresholds[1]) return 'moderate_positive';
    if (value >= thresholds[0]) return 'stable';
    if (value >= -thresholds[1]) return 'moderate_negative';
    return 'strong_negative';
  }
  
  categorizeInventory(months) {
    if (months === undefined || months === null) return 'unknown';
    if (months < 3) return 'low';
    if (months < 6) return 'balanced';
    return 'high';
  }
  
  categorizeVelocity(days) {
    if (days === undefined || days === null) return 'unknown';
    if (days < 30) return 'fast';
    if (days < 60) return 'moderate';
    return 'slow';
  }
  
  calculateMarketStrength(marketData) {
    let score = 50; // Base score
    
    if (marketData.appreciation_rate_1yr > 5) score += 10;
    if (marketData.inventory_months < 4) score += 10;
    if (marketData.days_on_market < 45) score += 10;
    if (marketData.population_growth > 1) score += 10;
    if (marketData.employment_growth > 2) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }
  
  generateRecommendations(cmaResults, marketTrends, investmentAnalysis, riskAssessment, analysisType) {
    const recommendations = [];
    
    // CMA-based recommendations
    if (cmaResults.confidence === 'high') {
      recommendations.push({
        category: 'Valuation',
        priority: 'high',
        message: `Strong comparable data supports estimated value of $${cmaResults.estimated_value.toLocaleString()}`
      });
    } else if (cmaResults.confidence === 'low') {
      recommendations.push({
        category: 'Valuation',
        priority: 'high',
        message: 'Limited comparable data - consider additional market research or professional appraisal'
      });
    }
    
    // Investment-specific recommendations
    if (investmentAnalysis && investmentAnalysis.analysis_possible) {
      if (investmentAnalysis.rule_analysis.one_percent_rule) {
        recommendations.push({
          category: 'Investment',
          priority: 'high',
          message: 'Property meets 1% rule - strong cash flow potential'
        });
      }
      
      if (investmentAnalysis.basic_metrics.estimated_cap_rate > 8) {
        recommendations.push({
          category: 'Investment',
          priority: 'medium',
          message: 'High cap rate indicates good investment opportunity'
        });
      }
    }
    
    // Market timing recommendations
    if (marketTrends.overall_market_condition === 'strong_buyers_market') {
      recommendations.push({
        category: 'Timing',
        priority: 'high',
        message: 'Favorable market conditions for buyers - good time to purchase'
      });
    } else if (marketTrends.overall_market_condition === 'sellers_market') {
      recommendations.push({
        category: 'Timing',
        priority: 'medium',
        message: 'Competitive market - be prepared to act quickly and consider above-asking offers'
      });
    }
    
    // Risk-based recommendations
    if (riskAssessment.overall_risk_level === 'High') {
      recommendations.push({
        category: 'Risk Management',
        priority: 'high',
        message: 'High market risk identified - consider conservative financing and exit strategies'
      });
    }
    
    return recommendations;
  }
  
  // Additional helper methods for various calculations...
  gradeInvestment(capRate, cocReturn, onePercentRule) {
    let score = 0;
    if (capRate > 10) score += 3;
    else if (capRate > 8) score += 2;
    else if (capRate > 6) score += 1;
    
    if (cocReturn > 15) score += 3;
    else if (cocReturn > 10) score += 2;
    else if (cocReturn > 5) score += 1;
    
    if (onePercentRule) score += 2;
    
    if (score >= 6) return 'A';
    if (score >= 4) return 'B';
    if (score >= 2) return 'C';
    return 'D';
  }
  
  scoreGrowth(popGrowth, empGrowth) {
    const avgGrowth = ((popGrowth || 0) + (empGrowth || 0)) / 2;
    if (avgGrowth > 3) return 90;
    if (avgGrowth > 1) return 75;
    if (avgGrowth > 0) return 60;
    if (avgGrowth > -1) return 40;
    return 20;
  }
  
  scoreAffordability(medianPrice, medianRent) {
    if (!medianPrice || !medianRent) return 50;
    const rentRatio = (medianRent * 12) / medianPrice;
    if (rentRatio > 0.15) return 80;
    if (rentRatio > 0.12) return 70;
    if (rentRatio > 0.08) return 60;
    if (rentRatio > 0.05) return 40;
    return 20;
  }
  
  identifyNeighborhoodStrengths(scores) {
    const strengths = [];
    if (scores.safety > 75) strengths.push('High safety rating');
    if (scores.schools > 75) strengths.push('Excellent schools');
    if (scores.growth > 75) strengths.push('Strong population and job growth');
    if (scores.affordability > 75) strengths.push('Good rental yield potential');
    return strengths;
  }
  
  identifyNeighborhoodConcerns(scores) {
    const concerns = [];
    if (scores.safety < 40) concerns.push('Safety concerns');
    if (scores.schools < 40) concerns.push('Poor school ratings');
    if (scores.growth < 40) concerns.push('Declining population/employment');
    if (scores.affordability < 40) concerns.push('Low rental yields');
    return concerns;
  }
  
  generateRiskMitigation(risks) {
    const mitigation = [];
    
    risks.forEach(risk => {
      switch (risk.category) {
        case 'Price Risk':
          mitigation.push('Consider conservative purchase price and financing');
          break;
        case 'Economic Risk':
          mitigation.push('Focus on properties with diverse tenant base');
          break;
        case 'Rental Risk':
          mitigation.push('Budget for extended vacancy periods');
          break;
        default:
          mitigation.push('Monitor market conditions closely');
      }
    });
    
    return [...new Set(mitigation)]; // Remove duplicates
  }
  
  getTimingAdvice(marketTrends) {
    const condition = marketTrends.overall_market_condition;
    
    const advice = {
      strong_buyers_market: 'Excellent time to buy - negotiate aggressively',
      moderate_buyers_market: 'Good buying conditions - reasonable negotiations expected',
      balanced_market: 'Neutral market - focus on property-specific value',
      sellers_market: 'Competitive environment - be prepared to pay market value'
    };
    
    return advice[condition] || 'Monitor market conditions';
  }
  
  getNegotiationStrategy(marketCondition) {
    const strategies = {
      strong_buyers_market: 'Aggressive negotiations, multiple contingencies acceptable',
      moderate_buyers_market: 'Standard negotiations, reasonable contingencies',
      balanced_market: 'Fair market offers, minimal contingencies',
      sellers_market: 'Competitive offers, waive contingencies if possible'
    };
    
    return strategies[marketCondition] || 'Standard negotiation approach';
  }
  
  getPricingStrategy(marketCondition) {
    const strategies = {
      strong_buyers_market: 'Price competitively, expect negotiations',
      moderate_buyers_market: 'Market pricing, some negotiation room',
      balanced_market: 'Fair market pricing',
      sellers_market: 'Premium pricing, expect multiple offers'
    };
    
    return strategies[marketCondition] || 'Market-based pricing';
  }
  
  identifyKeyTimingFactors(indicators) {
    const factors = [];
    
    if (indicators.price_momentum && indicators.price_momentum.includes('positive')) {
      factors.push('Rising prices favor buyers entering now');
    }
    if (indicators.inventory_trend === 'high') {
      factors.push('High inventory provides buyer leverage');
    }
    if (indicators.market_velocity === 'fast') {
      factors.push('Fast-moving market requires quick decisions');
    }
    
    return factors;
  }
  
  getSeasonalAdvice() {
    const month = new Date().getMonth() + 1;
    
    if (month >= 3 && month <= 6) {
      return 'Spring/early summer: Peak buying season with most inventory';
    } else if (month >= 7 && month <= 9) {
      return 'Late summer: Good inventory, motivated sellers';
    } else if (month >= 10 && month <= 12) {
      return 'Fall/winter: Lower inventory but less competition';
    } else {
      return 'Winter: Lowest inventory but best deals from motivated sellers';
    }
  }
  
  generateTrendSummary(trends, marketCondition) {
    const positiveTrends = Object.values(trends).filter(t => 
      t.includes('positive') || t === 'fast' || t === 'low').length;
    
    let summary = `Market shows ${positiveTrends} positive indicators out of ${Object.keys(trends).length}. `;
    
    switch (marketCondition) {
      case 'strong_buyers_market':
        summary += 'Strong conditions favor buyers with multiple positive trends.';
        break;
      case 'moderate_buyers_market':
        summary += 'Generally favorable conditions for buyers.';
        break;
      case 'balanced_market':
        summary += 'Balanced conditions with mixed indicators.';
        break;
      case 'sellers_market':
        summary += 'Market conditions favor sellers with limited inventory.';
        break;
      default:
        summary += 'Market conditions are mixed with uncertain trends.';
    }
    
    return summary;
  }
}