import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import "./style.css";

const Rewards = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [userStats, setUserStats] = useState({
    totalEarned: 0,
    totalVerified: 0,
    currentStreak: 0,
    level: 1
  });
  const [loading, setLoading] = useState(false);

  // Mock data for rewards
  const availableRewards = [
    {
      id: 1,
      title: "Code Verification",
      description: "Verify smart contracts and earn APT tokens",
      reward: "0.5 APT",
      difficulty: "Easy",
      category: "Verification",
      icon: "🔍"
    },
    {
      id: 2,
      title: "Bug Report",
      description: "Report critical bugs in verified contracts",
      reward: "1.0 APT",
      difficulty: "Medium",
      category: "Security",
      icon: "🐛"
    },
    {
      id: 3,
      title: "Code Review",
      description: "Provide detailed code reviews for projects",
      reward: "2.0 APT",
      difficulty: "Hard",
      category: "Review",
      icon: "📝"
    },
    {
      id: 4,
      title: "Community Help",
      description: "Help other developers in the community",
      reward: "0.25 APT",
      difficulty: "Easy",
      category: "Community",
      icon: "🤝"
    },
    {
      id: 5,
      title: "Security Audit",
      description: "Conduct comprehensive security audits",
      reward: "5.0 APT",
      difficulty: "Expert",
      category: "Security",
      icon: "🛡️"
    },
    {
      id: 6,
      title: "Documentation",
      description: "Write comprehensive documentation",
      reward: "1.5 APT",
      difficulty: "Medium",
      category: "Documentation",
      icon: "📚"
    }
  ];

  // Mock user achievements
  const achievements = [
    {
      id: 1,
      title: "First Verification",
      description: "Complete your first code verification",
      icon: "🎯",
      unlocked: true,
      reward: "0.5 APT"
    },
    {
      id: 2,
      title: "Verification Master",
      description: "Complete 10 verifications",
      icon: "🏆",
      unlocked: false,
      reward: "2.0 APT"
    },
    {
      id: 3,
      title: "Community Helper",
      description: "Help 5 community members",
      icon: "🌟",
      unlocked: false,
      reward: "1.0 APT"
    },
    {
      id: 4,
      title: "Security Expert",
      description: "Find 3 critical security issues",
      icon: "🔒",
      unlocked: false,
      reward: "5.0 APT"
    }
  ];

  const handleClaimReward = (rewardId) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const reward = availableRewards.find(r => r.id === rewardId);
      if (reward) {
        setUserStats(prev => ({
          ...prev,
          totalEarned: prev.totalEarned + parseFloat(reward.reward)
        }));
        setRewards(prev => [...prev, reward]);
      }
      setLoading(false);
    }, 1000);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "#22c55e";
      case "Medium": return "#f59e0b";
      case "Hard": return "#ef4444";
      case "Expert": return "#8b5cf6";
      default: return "#6b7280";
    }
  };

  return (
    <div className="rewards-container">
      <div className="rewards-header">
        <h1>🏆 Rewards Center</h1>
        <p>Earn APT tokens by contributing to the EVOLVEX ecosystem</p>
      </div>

      {user ? (
        <div className="rewards-content">
          {/* User Stats */}
          <div className="user-stats-section">
            <h2>Your Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Total Earned</h3>
                  <span className="stat-value">{userStats.totalEarned} APT</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>Verifications</h3>
                  <span className="stat-value">{userStats.totalVerified}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-info">
                  <h3>Current Streak</h3>
                  <span className="stat-value">{userStats.currentStreak} days</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <h3>Level</h3>
                  <span className="stat-value">{userStats.level}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Available Rewards */}
          <div className="rewards-section">
            <h2>Available Rewards</h2>
            <div className="rewards-grid">
              {availableRewards.map((reward) => (
                <div key={reward.id} className="reward-card">
                  <div className="reward-header">
                    <div className="reward-icon">{reward.icon}</div>
                    <div className="reward-title">{reward.title}</div>
                    <div 
                      className="reward-difficulty"
                      style={{ backgroundColor: getDifficultyColor(reward.difficulty) }}
                    >
                      {reward.difficulty}
                    </div>
                  </div>
                  <div className="reward-content">
                    <p className="reward-description">{reward.description}</p>
                    <div className="reward-category">{reward.category}</div>
                    <div className="reward-amount">{reward.reward}</div>
                    <button 
                      className="claim-btn"
                      onClick={() => handleClaimReward(reward.id)}
                      disabled={loading}
                    >
                      {loading ? "Claiming..." : "Claim Reward"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-grid">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-content">
                    <h3>{achievement.title}</h3>
                    <p>{achievement.description}</p>
                    <div className="achievement-reward">{achievement.reward}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="leaderboard-section">
            <h2>Top Contributors</h2>
            <div className="leaderboard">
              <div className="leaderboard-item">
                <div className="rank">1</div>
                <div className="user-info">
                  <div className="username">CryptoMaster</div>
                  <div className="user-stats">15.5 APT earned</div>
                </div>
                <div className="user-level">Level 5</div>
              </div>
              <div className="leaderboard-item">
                <div className="rank">2</div>
                <div className="user-info">
                  <div className="username">BlockDev</div>
                  <div className="user-stats">12.0 APT earned</div>
                </div>
                <div className="user-level">Level 4</div>
              </div>
              <div className="leaderboard-item">
                <div className="rank">3</div>
                <div className="user-info">
                  <div className="username">CodeReviewer</div>
                  <div className="user-stats">10.5 APT earned</div>
                </div>
                <div className="user-level">Level 4</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Connect your wallet to start earning rewards and participating in the EVOLVEX ecosystem.</p>
          <button className="connect-wallet-btn">Connect Wallet</button>
        </div>
      )}
    </div>
  );
};

export default Rewards;