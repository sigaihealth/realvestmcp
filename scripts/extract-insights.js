#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';

const INSIGHTS_DIR = '/Users/yonghuang/code/book/website/temp_realvestai/insights';
const OUTPUT_FILE = '/Users/yonghuang/code/book/website/temp_realvestai/mcp-server/src/data/insights.json';

function extractMetadata(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const filename = basename(filePath);
  
  // Skip index.html
  if (filename === 'index.html') return null;
  
  // Extract title
  const titleMatch = content.match(/<title>(.*?)\s*\|\s*RealVest<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Extract description
  const descMatch = content.match(/<meta name="description" content="([^"]+)"/);
  const description = descMatch ? descMatch[1] : '';
  
  // Extract category from breadcrumb or content
  let category = 'Investment Strategy'; // default
  
  // Try to categorize based on title/content
  if (title.toLowerCase().includes('airbnb') || title.toLowerCase().includes('rental')) {
    category = 'Rental Strategy';
  } else if (title.toLowerCase().includes('market') || title.toLowerCase().includes('rate')) {
    category = 'Market Analysis';
  } else if (title.toLowerCase().includes('beginner') || title.toLowerCase().includes('first')) {
    category = 'Getting Started';
  } else if (title.toLowerCase().includes('financing') || title.toLowerCase().includes('loan')) {
    category = 'Creative Financing';
  } else if (title.toLowerCase().includes('mistake') || title.toLowerCase().includes('analysis')) {
    category = 'Investment Psychology';
  }
  
  // Extract date from article-date if exists
  const dateMatch = content.match(/<div class="article-date">([^<]+)<\/div>/);
  const dateText = dateMatch ? dateMatch[1].trim() : '';
  
  // Parse date or use file creation date
  let date = '2024-01-01'; // default
  if (dateText) {
    // Convert "August 15, 2024" to "2024-08-15"
    const months = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    
    const parts = dateText.match(/(\w+)\s+(\d+),\s+(\d{4})/);
    if (parts) {
      const month = months[parts[1]] || '01';
      const day = parts[2].padStart(2, '0');
      date = `${parts[3]}-${month}-${day}`;
    }
  }
  
  return {
    title,
    url: `https://www.realvest.ai/insights/${filename}`,
    category,
    date,
    summary: description,
    filename
  };
}

// Get all HTML files
const files = readdirSync(INSIGHTS_DIR)
  .filter(f => f.endsWith('.html'))
  .map(f => join(INSIGHTS_DIR, f));

// Extract metadata from each file
const articles = files
  .map(extractMetadata)
  .filter(Boolean) // Remove nulls
  .sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending

// Get unique categories
const categories = [...new Set(articles.map(a => a.category))].sort();

// Create the data structure
const insightsData = {
  articles,
  categories,
  total_articles: articles.length,
  last_updated: new Date().toISOString()
};

// Create directory if it doesn't exist
import { mkdirSync } from 'fs';
mkdirSync('/Users/yonghuang/code/book/website/temp_realvestai/mcp-server/src/data', { recursive: true });

// Write to file
writeFileSync(OUTPUT_FILE, JSON.stringify(insightsData, null, 2));

console.log(`Extracted ${articles.length} articles`);
console.log(`Categories: ${categories.join(', ')}`);
console.log(`Output written to: ${OUTPUT_FILE}`);