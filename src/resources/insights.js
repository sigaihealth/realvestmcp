import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class InsightsResource {
  constructor() {
    // Load insights data from JSON file
    const dataPath = join(__dirname, '..', 'data', 'insights.json');
    try {
      const data = readFileSync(dataPath, 'utf-8');
      this.insightsData = JSON.parse(data);
    } catch (error) {
      // Fallback to sample data if file doesn't exist
      this.insightsData = {
        articles: [
          {
            title: "How Real Estate Investors Thrived When Mortgage Rates Hit 18%",
            url: "https://www.realvest.ai/insights/high-rate-investing-history.html",
            category: "Market Analysis",
            date: "2024-08-15",
            summary: "Historical lessons from the 1980s high-rate environment and strategies that worked."
          }
        ],
        categories: ["Market Analysis"],
        total_articles: 1
      };
    }
  }

  async getAll() {
    return {
      articles: this.insightsData.articles,
      categories: this.insightsData.categories,
      total_articles: this.insightsData.total_articles
    };
  }

  async search(query) {
    // Simple search implementation
    const searchLower = query.toLowerCase();
    return this.insightsData.articles.filter(article => 
      article.title.toLowerCase().includes(searchLower) ||
      article.summary.toLowerCase().includes(searchLower) ||
      article.category.toLowerCase().includes(searchLower)
    );
  }

  async getByCategory(category) {
    return this.insightsData.articles.filter(article => 
      article.category.toLowerCase() === category.toLowerCase()
    );
  }
}