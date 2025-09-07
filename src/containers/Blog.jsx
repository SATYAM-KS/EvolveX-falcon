// src/components/Blog.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Typography, CircularProgress, Box } from "@mui/material";

const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY;
const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;

export const Blog = () => {
  const [blogContent, setBlogContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { article, analysis } = location.state || {};

  const generateBlogContent = async (title, analysis) => {
    const prompt = `
      Write a detailed blog post (500-700 words) based on the following news article title and analysis data. 
      Include an engaging introduction, key insights from the analysis, and a conclusion. Use a professional yet conversational tone. 
      Do not repeat the exact analysis values verbatim; instead, weave them into the narrative naturally.

      Title: ${title}
      Analysis Data: ${JSON.stringify(analysis)}
      Provide the response as plain text without JSON formatting.
    `;

    try {
      const response = await fetch(
        "https://api.together.xyz/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOGETHER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        }
      );

      const result = await response.json();
      if (!result.choices || !result.choices[0]) {
        throw new Error("Invalid response from Together AI");
      }
      return result.choices[0].message.content;
    } catch (error) {
      console.error("Error generating blog content:", error);
      return "Failed to generate blog content. Please try again later.";
    }
  };

  const fetchBlogImage = async (title) => {
    const query = encodeURIComponent(title.split(" ").slice(0, 3).join(" "));
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${UNSPLASH_API_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Unsplash API request failed");
      const data = await response.json();
      return data.results[0]?.urls?.regular || "https://picsum.photos/512"; // Use Lorem Picsum as fallback
    } catch (error) {
      console.error("Error fetching image from Unsplash:", error);
      return "https://picsum.photos/512"; // Reliable fallback
    }
  };

  useEffect(() => {
    const fetchBlogData = async () => {
      if (!article || !analysis) {
        setBlogContent("No article data available.");
        setImageUrl("https://picsum.photos/512");
        setLoading(false);
        return;
      }

      setLoading(true);
      const content = await generateBlogContent(article.title, analysis);
      const image = await fetchBlogImage(article.title);
      setBlogContent(content);
      setImageUrl(image);
      setLoading(false);
    };

    fetchBlogData();
  }, [article, analysis]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Poppins",
      }}
    >
      <Typography variant="h4" gutterBottom>
        {article?.title || "Blog Post"}
      </Typography>
      <Box mb={3}>
        <img
          src={imageUrl}
          alt={article?.title || "Blog Image"}
          style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
        />
        <Typography variant="caption" display="block" mt={1}>
          Image from Unsplash
        </Typography>
      </Box>
      <Typography
        variant="body1"
        component="div"
        sx={{ whiteSpace: "pre-wrap" }}
      >
        {blogContent}
      </Typography>
    </Box>
  );
};
