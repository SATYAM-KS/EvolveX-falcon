import React, { useState, useCallback } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper,
} from "@mui/material";

// Import your new API functions
import { analyzeWithGemini } from "../api/geminiApi";
import { fetchFullContent } from "../api/jinaApi";
import { fetchNewsArticles } from "../api/newsApi";
import { fetchAptosPriceData } from "../api/twelveDataApi";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const FALLBACK_APTOS_DATA = [
  { datetime: "2025-09-06", close: "7.50" },
  { datetime: "2025-09-07", close: "7.65" },
  { datetime: "2025-09-08", close: "7.45" },
  { datetime: "2025-09-09", close: "7.80" },
  { datetime: "2025-09-10", close: "7.75" },
];

export const Trend = () => {
  const [analysisData, setAnalysisData] = useState([]);
  const [aptosPriceData, setAptosPriceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [jobSaturationData, setJobSaturationData] = useState({});
  const [aiGeneratedTitles, setAiGeneratedTitles] = useState([]);

  const predictJobSaturation = useCallback(async (analyses) => {
    const sectors = {
      DeFi: { score: 50, count: 0 },
      "NFTs/Gaming": { score: 50, count: 0 },
      Infrastructure: { score: 50, count: 0 },
    };
    analyses.forEach((item) => {
      let scoreAdjustment = 0;
      if (item.Developer_Activity === "High") scoreAdjustment -= 15;
      if (item.Developer_Activity === "Low") scoreAdjustment += 10;
      if (item.Adoption_Potential === "High") scoreAdjustment -= 10;
      if (item.Security_Concerns === "Detected") scoreAdjustment += 15;
      if (item.Regulatory_News === "Unfavorable") scoreAdjustment += 10;
      if (item.Overall_Sentiment === "Negative") scoreAdjustment += 5;

      const sector = item.Sector || "Infrastructure";
      if (sector.includes("DeFi")) {
        sectors.DeFi.score += scoreAdjustment;
      } else if (sector.includes("NFT") || sector.includes("Gaming")) {
        sectors["NFTs/Gaming"].score += scoreAdjustment;
      } else {
        sectors.Infrastructure.score += scoreAdjustment;
      }
    });

    const jobSaturation = {};
    for (const [sector, data] of Object.entries(sectors)) {
      const finalScore = Math.max(0, Math.min(100, data.score));
      let level;
      if (finalScore < 35) level = "Low";
      else if (finalScore < 65) level = "Medium";
      else level = "High";
      jobSaturation[sector] = { level, score: finalScore };
    }
    return jobSaturation;
  }, []);

  const fetchWeb3News = useCallback(
    async (topic) => {
      setLoading(true);
      setError(null);
      setArticles([]);
      setAnalysisData([]);
      setJobSaturationData({});

      // Handle price data fetching with its own try/catch
      fetchAptosPriceData()
        .then((priceData) => setAptosPriceData(priceData))
        .catch((err) => {
          console.error(err);
          setError("Using fallback market data due to API limitations.");
          setAptosPriceData(FALLBACK_APTOS_DATA);
        });

      try {
        // 1. Fetch articles
        const articleList = (await fetchNewsArticles(topic)).slice(0, 5);

        // 2. Process them in parallel
        const processingPromises = articleList.map(async (article) => {
          const fullContent = await fetchFullContent(article.url);
          const analysis = await analyzeWithGemini(
            fullContent || article.description,
            article.title
          );
          return { article, analysis, aiTitle: article.title };
        });

        const processedArticles = await Promise.all(processingPromises);
        const analyses = processedArticles.map((item) => item.analysis);

        // 3. Update state with all results
        setArticles(processedArticles.map((item) => item.article));
        setAnalysisData(analyses);
        setAiGeneratedTitles(processedArticles.map((item) => item.aiTitle));
        setJobSaturationData(await predictJobSaturation(analyses));
      } catch (error) {
        console.error("Error in news processing pipeline:", error.message);
        setError(`Failed to fetch and analyze news: ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    [predictJobSaturation]
  );

  // --- Chart Preparation Functions ---
  const prepareSentimentData = () => {
    if (!analysisData.length) return { labels: [], datasets: [] };
    const sentimentCounts = analysisData.reduce(
      (acc, { Overall_Sentiment }) => {
        acc[Overall_Sentiment] = (acc[Overall_Sentiment] || 0) + 1;
        return acc;
      },
      {}
    );
    return {
      labels: Object.keys(sentimentCounts),
      datasets: [
        {
          data: Object.values(sentimentCounts),
          backgroundColor: ["#4CAF50", "#F44336", "#FFC107", "#36A2EB"],
        },
      ],
    };
  };

  const prepareJobSaturationData = () => {
    if (!Object.keys(jobSaturationData).length)
      return { labels: [], datasets: [] };
    const sectors = Object.keys(jobSaturationData);
    const scores = sectors.map((sector) => jobSaturationData[sector].score);
    const colors = scores.map((score) =>
      score < 35 ? "#4CAF50" : score < 65 ? "#FFC107" : "#F44336"
    );
    return {
      labels: sectors,
      datasets: [
        {
          label: "Job Saturation Score (Higher is Worse)",
          data: scores,
          backgroundColor: colors,
        },
      ],
    };
  };

  const prepareAptosPriceData = () => {
    if (!aptosPriceData.length) return { labels: [], datasets: [] };
    return {
      labels: aptosPriceData.map((item) => item.datetime),
      datasets: [
        {
          label: "APT/USD Price",
          data: aptosPriceData.map((item) => parseFloat(item.close).toFixed(2)),
          borderColor: "#36A2EB",
          tension: 0.1,
        },
      ],
    };
  };

  return (
    <div
      className="moyai"
      style={{
        maxWidth: "1250px",
        fontFamily: "Poppins",
        margin: "auto",
      }}
    >
      <div className="digva">
        <Typography variant="h4" gutterBottom>
          Aptos & Web3 Trends Dashboard
        </Typography>

        {error && (
          <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: "#fff9c4" }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        <div className="topic-selector" style={{ margin: "16px 0" }}>
          <Typography gutterBottom>Select a topic to analyze:</Typography>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="topic-button"
              onClick={() => fetchWeb3News('"Aptos" AND "Ecosystem"')}
              disabled={loading}
            >
              Aptos Ecosystem
            </button>
            <button
              className="topic-button"
              onClick={() => fetchWeb3News('"DeFi" AND ("Aptos" OR "Solana")')}
              disabled={loading}
            >
              DeFi Trends
            </button>
            <button
              className="topic-button"
              onClick={() => fetchWeb3News('"NFT" OR "Web3 Gaming"')}
              disabled={loading}
            >
              NFTs & Gaming
            </button>
            <button
              className="topic-button"
              onClick={() => fetchWeb3News('"Blockchain Layer 1" Regulation')}
              disabled={loading}
            >
              L1 Regulation
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "32px 0",
          }}
        >
          <CircularProgress />
          <Typography variant="h6" style={{ marginLeft: "16px" }}>
            Scraping and Analyzing News...
          </Typography>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <>
          <div className="row1">
            <div className="pie">
              <div className="pi">
                {/* <Typography variant="h6" align="center">
                  Sentiment Distribution
                </Typography> */}
                <Pie data={prepareSentimentData()} />
              </div>
            </div>
            <div className="bar">
              <div className="ba">
                <Typography variant="h6" align="center">
                  Web3 Job Saturation
                </Typography>
                <Bar
                  data={prepareJobSaturationData()}
                  options={{ scales: { y: { min: 0, max: 100 } } }}
                />
              </div>
            </div>
          </div>
          <div className="row2">
            <div className="nif">
              <div className="ni">
                <Typography variant="h6" align="center">
                  APT/USD Price Trend
                </Typography>
                <Line data={prepareAptosPriceData()} />
              </div>
            </div>
            <div>
              <Typography variant="h5" gutterBottom>
                Latest Analyzed Articles
              </Typography>
              <List>
                {articles.map((article, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => window.open(article.url, "_blank")}
                  >
                    <ListItemText
                      primary={
                        <strong>
                          {aiGeneratedTitles[index] || article.title}
                        </strong>
                      }
                      secondary={
                        `Sector: ${analysisData[index]?.Sector || "N/A"} | ` +
                        `Adoption: ${
                          analysisData[index]?.Adoption_Potential || "N/A"
                        } | ` +
                        `Dev Activity: ${
                          analysisData[index]?.Developer_Activity || "N/A"
                        }`
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
