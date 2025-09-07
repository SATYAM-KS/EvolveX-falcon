import React from "react";
import { memberData } from "../data/Member";
import dashboardImg from "../assets/trends.jpg";
import analyticsImg from "../assets/trends.png";
import "./dl.css"

export const DocumentationLanding = () => {
  return (
    <div className="documentation-landing">
      {/* Documentation Section */}
      <div className="documentation-section">
        <h1>DOCUMENTATION</h1>
        <p className="documentation-description">
          EvolveX is a comprehensive blockchain development platform that
          combines AI-powered tools, smart contract verification, and
          educational resources. Built on the Aptos blockchain, it offers
          developers and verifiers a complete ecosystem for creating, verifying,
          and learning about smart contracts. With integrated Petra wallet
          support, gamified XP system, and course marketplace, EvolveX
          revolutionizes how developers interact with blockchain technology.
        </p>
        <div className="documentation-features">
          <div className="doc-feature-block">
            <p>Smart Contract Development</p>
          </div>
          <div className="doc-feature-block">
            <p>Contract Verification</p>
          </div>
          <div className="doc-feature-block">
            <p>Course Marketplace</p>
          </div>
          <div className="doc-feature-block">
            <p>XP & Rewards System</p>
          </div>
        </div>
      </div>

      {/* Platform Description Section */}
      <div className="platform-description-section">
        <p className="platform-description">
          EvolveX features a robust authentication system with Petra wallet
          integration for secure Aptos blockchain access. Developers can upload
          .move files or paste code directly for smart contract verification,
          earning 100 XP per verified contract. The platform includes a
          comprehensive course system where instructors can create and sell
          educational content, earning 80% revenue share. Verifiers can apply at
          1500 XP (0.75 APT) to review contracts and earn 0.1 APT per
          verification. The gamified XP system tracks progress, unlocks
          achievements, and maintains leaderboards, creating an engaging
          learning environment.
        </p>
        <div className="platform-visual">
          <div className="dashboard-section">
            <img
              src={dashboardImg}
              alt="Analytics Dashboard"
              className="dashboard-img"
            />
            <div className="cta-buttons">
              <button className="cta-btn">
                Complete Blockchain Development Platform
              </button>
              <button className="cta-btn">From Learning to Earning</button>
            </div>
          </div>
          <img
            src={analyticsImg}
            alt="Data Analytics"
            className="analytics-img"
          />
        </div>
      </div>

      {/* Key Features Section */}
      <div className="key-features-section">
        <h2>KEY FEATURES</h2>
        <div className="key-features-grid">
          <div className="key-feature-card">
            <h3>Authentication & Security</h3>
            <p>
              Petra Wallet Integration with Aptos blockchain for secure access
              and role-based permissions.
            </p>
          </div>
          <div className="key-feature-card">
            <h3>Developer Tools</h3>
            <p>
              Smart contract upload, verification, course creation with XP
              rewards and achievement system.
            </p>
          </div>
          <div className="key-feature-card">
            <h3>Verification System</h3>
            <p>
              Professional contract verification with earning opportunities and
              performance tracking.
            </p>
          </div>
          <div className="key-feature-card">
            <h3>Learning Platform</h3>
            <p>
              Interactive course marketplace with video, text, and quiz-based
              lessons.
            </p>
          </div>
          <div className="key-feature-card">
            <h3>Gamification</h3>
            <p>
              XP system, leaderboards, achievement badges, and token rewards for
              engagement.
            </p>
          </div>
          <div className="key-feature-card">
            <h3>Revenue Sharing</h3>
            <p>
              80% revenue to instructors, 20% to platform with transparent
              earning tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <h1>TEAM BEHIND EVOLVEX</h1>
        <div className="team-cards">
          {memberData.map((member, index) => (
            <div key={index} className="team-card">
              <img src={member.av} alt={member.name} className="team-avatar" />
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-email">{member.email}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
