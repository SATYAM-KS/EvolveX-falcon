import React, { useState } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import "./style.css";

const TopProjects = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "DeFi Yield Farming Platform",
      description: "A comprehensive DeFi platform built on Aptos with automated yield farming strategies and liquidity management.",
      author: "Alice Developer",
      authorId: "user1",
      category: "DeFi",
      tags: ["aptos", "defi", "yield-farming", "smart-contracts"],
      downloads: 1250,
      rating: 4.9,
      stars: 89,
      language: "Move",
      lastUpdated: "2 days ago",
      isTopProject: true,
      codeUrl: "https://github.com/example/defi-platform",
      demoUrl: "https://demo.example.com",
      image: null
    },
    {
      id: 2,
      title: "NFT Marketplace with Royalties",
      description: "Complete NFT marketplace solution with creator royalties, auction system, and cross-chain compatibility.",
      author: "Bob Blockchain",
      authorId: "user2",
      category: "NFT",
      tags: ["nft", "marketplace", "royalties", "auction"],
      downloads: 980,
      rating: 4.8,
      stars: 67,
      language: "Move",
      lastUpdated: "5 days ago",
      isTopProject: true,
      codeUrl: "https://github.com/example/nft-marketplace",
      demoUrl: "https://nft-demo.example.com",
      image: null
    },
    {
      id: 3,
      title: "Multi-Sig Wallet Implementation",
      description: "Secure multi-signature wallet with customizable approval thresholds and emergency recovery features.",
      author: "Charlie Crypto",
      authorId: "user3",
      category: "Security",
      tags: ["wallet", "multisig", "security", "governance"],
      downloads: 750,
      rating: 4.7,
      stars: 45,
      language: "Move",
      lastUpdated: "1 week ago",
      isTopProject: true,
      codeUrl: "https://github.com/example/multisig-wallet",
      demoUrl: "https://wallet-demo.example.com",
      image: null
    },
    {
      id: 4,
      title: "DAO Governance System",
      description: "Decentralized governance platform with voting mechanisms, proposal system, and treasury management.",
      author: "Diana DAO",
      authorId: "user4",
      category: "Governance",
      tags: ["dao", "governance", "voting", "treasury"],
      downloads: 620,
      rating: 4.6,
      stars: 38,
      language: "Move",
      lastUpdated: "3 days ago",
      isTopProject: false,
      codeUrl: "https://github.com/example/dao-governance",
      demoUrl: "https://dao-demo.example.com",
      image: null
    },
    {
      id: 5,
      title: "Cross-Chain Bridge Protocol",
      description: "Secure bridge protocol for transferring assets between Aptos and other blockchains with minimal fees.",
      author: "Eve Exchange",
      authorId: "user5",
      category: "Bridge",
      tags: ["bridge", "cross-chain", "interoperability", "defi"],
      downloads: 890,
      rating: 4.8,
      stars: 52,
      language: "Move",
      lastUpdated: "4 days ago",
      isTopProject: false,
      codeUrl: "https://github.com/example/cross-chain-bridge",
      demoUrl: "https://bridge-demo.example.com",
      image: null
    },
    {
      id: 6,
      title: "Automated Market Maker (AMM)",
      description: "High-performance AMM with concentrated liquidity and advanced trading features for DeFi protocols.",
      author: "Frank Finance",
      authorId: "user6",
      category: "DeFi",
      tags: ["amm", "dex", "liquidity", "trading"],
      downloads: 1100,
      rating: 4.9,
      stars: 73,
      language: "Move",
      lastUpdated: "1 day ago",
      isTopProject: false,
      codeUrl: "https://github.com/example/amm-protocol",
      demoUrl: "https://amm-demo.example.com",
      image: null
    }
  ]);

  const topProjects = projects.filter(project => project.isTopProject);

  const downloadProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      // Create sample Move code based on project
      let moveCode = '';
      
      switch(project.category) {
        case 'DeFi':
          moveCode = `module ${project.author.toLowerCase().replace(/\s+/g, '_')}::${project.title.toLowerCase().replace(/\s+/g, '_')} {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    
    struct YieldFarm has key {
        total_staked: u64,
        reward_rate: u64,
    }
    
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        move_to(account, YieldFarm {
            total_staked: 0,
            reward_rate: 100, // 1% APY
        });
    }
    
    public entry fun stake(account: &signer, amount: u64) {
        // Implementation for staking functionality
    }
    
    public entry fun unstake(account: &signer, amount: u64) {
        // Implementation for unstaking functionality
    }
}`;
          break;
        case 'NFT':
          moveCode = `module ${project.author.toLowerCase().replace(/\s+/g, '_')}::${project.title.toLowerCase().replace(/\s+/g, '_')} {
    use std::string::String;
    use std::signer;
    use aptos_framework::object;
    
    struct NFT has key {
        name: String,
        description: String,
        image_uri: String,
        creator: address,
        royalty_percentage: u64,
    }
    
    public entry fun mint_nft(
        creator: &signer,
        name: String,
        description: String,
        image_uri: String,
        royalty_percentage: u64,
    ) {
        let creator_addr = signer::address_of(creator);
        let nft = NFT {
            name,
            description,
            image_uri,
            creator: creator_addr,
            royalty_percentage,
        };
        move_to(creator, nft);
    }
}`;
          break;
        case 'Security':
          moveCode = `module ${project.author.toLowerCase().replace(/\s+/g, '_')}::${project.title.toLowerCase().replace(/\s+/g, '_')} {
    use std::signer;
    use std::vector;
    
    struct MultiSigWallet has key {
        owners: vector<address>,
        required_signatures: u64,
        nonce: u64,
    }
    
    struct Transaction has store {
        to: address,
        value: u64,
        data: vector<u8>,
        executed: bool,
    }
    
    public entry fun create_wallet(
        account: &signer,
        owners: vector<address>,
        required_signatures: u64,
    ) {
        let account_addr = signer::address_of(account);
        move_to(account, MultiSigWallet {
            owners,
            required_signatures,
            nonce: 0,
        });
    }
}`;
          break;
        default:
          moveCode = `module ${project.author.toLowerCase().replace(/\s+/g, '_')}::${project.title.toLowerCase().replace(/\s+/g, '_')} {
    use std::signer;
    
    struct ${project.title.replace(/\s+/g, '')} has key {
        // Project implementation
    }
    
    public entry fun initialize(account: &signer) {
        // Initialize the project
    }
}`;
      }
      
      // Create and download the file
      const blob = new Blob([moveCode], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}.move`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const starProject = (projectId) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, stars: project.stars + 1 }
        : project
    ));
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="top-projects-container">
      <div className="projects-header">
        <h1>Top Projects</h1>
        <p>Discover amazing projects built by our developer community</p>
      </div>

      {/* Top 3 Projects */}
      <div className="top-projects-grid">
        {topProjects.map((project, index) => (
          <div key={project.id} className={`top-project-card rank-${index + 1}`}>
            <div className="project-rank">
              <span className="rank-number">#{index + 1}</span>
            </div>
            <div className="project-header">
              <div className="project-category">{project.category}</div>
            </div>
            <div className="project-content">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <div className="project-tags">
                {project.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span key={tagIndex} className="tag">#{tag}</span>
                ))}
              </div>
              <div className="project-stats">
                <div className="stat">
                  <span>Downloads</span>
                  <span>{formatNumber(project.downloads)}</span>
                </div>
                <div className="stat">
                  <span>Rating</span>
                  <span>{project.rating}</span>
                </div>
                <div className="stat">
                  <span>Author</span>
                  <span>{project.author}</span>
                </div>
              </div>
              <div className="project-actions">
                <button 
                  className="download-btn"
                  onClick={() => downloadProject(project.id)}
                >
                  Download Code
                </button>
                <button 
                  className="star-btn"
                  onClick={() => starProject(project.id)}
                >
                  Star {project.stars}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className="view-more-section">
        <button 
          className="view-more-btn"
          onClick={() => navigate('/projects')}
        >
          View More Projects
        </button>
      </div>

    </div>
  );
};

export default TopProjects;
