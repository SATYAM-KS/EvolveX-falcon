// src/api/jinaApi.js

export const fetchFullContent = async (url) => {
  if (!url) return "";
  const jinaUrl = `https://r.jina.ai/${url}`;
  try {
    const response = await fetch(jinaUrl, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return "";
    return await response.text();
  } catch (error) {
    console.error("Error fetching content with Jina:", error);
    return ""; // Return empty string on error
  }
};