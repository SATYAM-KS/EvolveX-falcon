// src/api/newsApi.js

// Using your provided GNews API Key
const GNEWS_API_KEY = "b2923d8c391df0bf64424d4db99c3e16";

export const fetchNewsArticles = async (topic) => {
  // GNews URL is different from NewsAPI
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    topic
  )}&lang=en&apikey=${GNEWS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GNews API error: ${response.status}`);
    }

    const newsData = await response.json();
    if (!newsData.articles || newsData.articles.length === 0) {
      throw new Error("No articles found for this topic via GNews.");
    }

    // Return the articles, which will be processed by your Trend.jsx component
    return newsData.articles;

  } catch (error) {
    console.error("Failed to fetch news from GNews:", error);
    // On error, return an empty array to prevent the app from crashing
    return [];
  }
};