import React, { useState, useEffect } from "react";
// Icons replaced with emojis
import { CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../App";

import "./style.css";

const BlockFree = () => {
  const { user } = useAuth();
  
  // State management
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [isClient, setIsClient] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [newContract, setNewContract] = useState({
    title: "",
    description: "",
    amount: "",
    deadline: "",
    freelancerAddress: "",
  });
  const [showPostJobForm, setShowPostJobForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplications, setShowApplications] = useState(false);
  
  // Role management
  const [userRole, setUserRole] = useState(null); // 'verifier', 'developer', 'client', or null
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showVerifierNFT, setShowVerifierNFT] = useState(false);
  const [showDeveloperRegistration, setShowDeveloperRegistration] = useState(false);

  // Auto-connect wallet if user is already authenticated
  useEffect(() => {
    if (user && user.address && !account) {
      setAccount(user.address);
      // Try to get balance
      fetchBalance(user.address);
      // Check user role
      checkUserRole(user.address);
    }
  }, [user, account]);

  // Check user role from blockchain/localStorage
  const checkUserRole = async (address) => {
    try {
      // First check localStorage for cached role
      const cachedRole = localStorage.getItem(`userRole_${address}`);
      if (cachedRole) {
        setUserRole(cachedRole);
        return;
      }

      // Check if user is a verifier (has NFT)
      const isVerifier = await checkVerifierNFT(address);
      if (isVerifier) {
        setUserRole('verifier');
        localStorage.setItem(`userRole_${address}`, 'verifier');
        return;
      }

      // Check if user is a registered developer
      const isDeveloper = await checkDeveloperRegistration(address);
      if (isDeveloper) {
        setUserRole('developer');
        localStorage.setItem(`userRole_${address}`, 'developer');
        return;
      }

      // Default to client role
      setUserRole('client');
      localStorage.setItem(`userRole_${address}`, 'client');
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole('client');
    }
  };

  // Check if user has verifier NFT
  const checkVerifierNFT = async (address) => {
    try {
      // This would check the blockchain for NFT ownership
      // For now, we'll simulate this with localStorage
      const hasNFT = localStorage.getItem(`verifierNFT_${address}`);
      return hasNFT === 'true';
    } catch (error) {
      console.error('Error checking verifier NFT:', error);
      return false;
    }
  };

  // Check if user is registered as developer
  const checkDeveloperRegistration = async (address) => {
    try {
      // This would check the blockchain for developer registration
      // For now, we'll simulate this with localStorage
      const isRegistered = localStorage.getItem(`developer_${address}`);
      return isRegistered === 'true';
    } catch (error) {
      console.error('Error checking developer registration:', error);
      return false;
    }
  };

  // Function to fetch balance
  const fetchBalance = async (address) => {
    try {
      // Method 1: Try Petra wallet's getBalance method first
      if (window.aptos && window.aptos.getBalance) {
        const balance = await window.aptos.getBalance();
        const aptBalance = parseFloat(balance) / 100000000;
        setBalance(aptBalance);
        return;
      }
    } catch (walletError) {
      // Continue to API method if wallet method fails
    }

    try {
      // Method 2: Use Aptos API to get real balance
      const response = await fetch(`https://fullnode.mainnet.aptoslabs.com/v1/accounts/${address}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`);
      
      if (response.ok) {
        const data = await response.json();
        const balance = parseFloat(data.data.coin.value) / 100000000; // Convert from octas to APT
        setBalance(balance);
      } else {
        setBalance(0);
      }
    } catch (error) {
      setBalance(0);
    }
  };

  // Connect to Petra wallet
  const connectWallet = async () => {
    setLoading(true);
    try {
      if (!window.aptos) {
        alert("Petra Wallet not found. Please install the extension.");
        setLoading(false);
        return;
      }
      await window.aptos.connect();
      const accountInfo = await window.aptos.account();
      setAccount(accountInfo.address);
      
      // Fetch balance using the new function
      await fetchBalance(accountInfo.address);
      
      // Check user role and show role selection if needed
      await checkUserRole(accountInfo.address);
      
      // If no role is set, show role selection
      if (!userRole) {
        setShowRoleSelection(true);
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  // Handle input changes for job form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContract({
      ...newContract,
      [name]: value,
    });
  };

  // Create new job posting
  const createJob = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const jobId = Math.floor(Math.random() * 1000000).toString();
      const newJob = {
        id: jobId,
        title: newContract.title,
        description: newContract.description,
        amount: parseFloat(newContract.amount),
        deadline: newContract.deadline,
        clientAddress: account,
        freelancerAddress: newContract.freelancerAddress || "Open to all",
        status: "open",
        created: new Date().toISOString().split("T")[0],
        applicants: [],
      };

      setContracts([...contracts, newJob]);
      setNewContract({
        title: "",
        description: "",
        amount: "",
        deadline: "",
        freelancerAddress: "",
      });
      setShowPostJobForm(false);

      showNotification("Job posted successfully!", "success");
      setLoading(false);
    }, 2000);
  };

  // Apply for a job
  const applyForJob = (jobId) => {
    setLoading(true);
    
    setTimeout(() => {
      const updatedContracts = contracts.map((job) => {
        if (job.id === jobId) {
          const newApplicant = {
            freelancerAddress: account,
            appliedAt: new Date().toISOString(),
            status: "pending"
          };
          
          return {
            ...job,
            applicants: [...(job.applicants || []), newApplicant]
          };
        }
        return job;
      });
      
      setContracts(updatedContracts);
      showNotification("Application submitted successfully!", "success");
      setLoading(false);
    }, 1500);
  };

  // View applications for a job
  const viewApplications = (job) => {
    setSelectedJob(job);
    setShowApplications(true);
  };

  // Close applications modal
  const closeApplications = () => {
    setShowApplications(false);
    setSelectedJob(null);
  };

  // Accept an application
  const acceptApplication = (jobId, applicantAddress) => {
    setLoading(true);
    
    setTimeout(() => {
      const updatedContracts = contracts.map((job) => {
        if (job.id === jobId) {
          const updatedApplicants = job.applicants.map(applicant => {
            if (applicant.freelancerAddress === applicantAddress) {
              return { ...applicant, status: "accepted" };
            }
            return { ...applicant, status: "rejected" };
          });
          
          return {
            ...job,
            applicants: updatedApplicants,
            status: "in_progress",
            freelancerAddress: applicantAddress
          };
        }
        return job;
      });
      
      setContracts(updatedContracts);
      showNotification("Application accepted! Job is now in progress.", "success");
      setLoading(false);
      closeApplications();
    }, 1500);
  };

  // Display notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 5000);
  };

  // Purchase Verifier NFT
  const purchaseVerifierNFT = async () => {
    setLoading(true);
    try {
      if (!window.aptos) {
        alert("Petra Wallet not found. Please install the extension.");
        setLoading(false);
        return;
      }

      // Simulate NFT purchase transaction
      // In a real implementation, this would interact with a smart contract
      const transaction = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        arguments: ["0x1::aptos_coin::AptosCoin", "100000000"], // 1 APT in octas
        type_arguments: ["0x1::aptos_coin::AptosCoin"]
      };

      // For demo purposes, we'll simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark user as verifier
      localStorage.setItem(`verifierNFT_${account}`, 'true');
      localStorage.setItem(`userRole_${account}`, 'verifier');
      setUserRole('verifier');
      setShowVerifierNFT(false);
      
      showNotification("Verifier NFT purchased successfully! You now have verifier access.", "success");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showNotification("Failed to purchase NFT. Please try again.", "error");
    }
  };

  // Register as Developer
  const registerAsDeveloper = async () => {
    setLoading(true);
    try {
      // Simulate developer registration
      // In a real implementation, this would interact with a smart contract
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mark user as developer
      localStorage.setItem(`developer_${account}`, 'true');
      localStorage.setItem(`userRole_${account}`, 'developer');
      setUserRole('developer');
      setShowDeveloperRegistration(false);
      
      showNotification("Successfully registered as developer! Welcome to the developer zone.", "success");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showNotification("Failed to register as developer. Please try again.", "error");
    }
  };

  // Handle role selection
  const handleRoleSelection = (role) => {
    if (role === 'verifier') {
      setShowVerifierNFT(true);
    } else if (role === 'developer') {
      setShowDeveloperRegistration(true);
    } else if (role === 'client') {
      setUserRole('client');
      localStorage.setItem(`userRole_${account}`, 'client');
      setShowRoleSelection(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">EVOLVEX BLOCKFREE</h1>
          <div className="account-area">
            {account ? (
              <div className="account-info">
                <span className="account-address">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                <span className="account-balance">{balance.toFixed(2)} APT</span>
                <button className="refresh-balance-btn" onClick={() => fetchBalance(account)} disabled={loading}>
                  {loading ? "..." : "Refresh"}
                </button>
                <button className="switch-role-btn" onClick={() => setShowRoleSelection(true)}>
                  Switch Role
                </button>
              </div>
            ) : (
              <button className="connect-wallet-btn" onClick={connectWallet} disabled={loading}>
                {loading ? "Connecting..." : "Connect Petra Wallet"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Notification */}
        {notification.show && (
          <div className={`notification ${notification.type === "success" ? "notification-success" : "notification-error"}`}>
            <div className="notification-content">
              {notification.type === "success" ? <CheckCircle className="notification-icon" /> : <AlertCircle className="notification-icon" />}
              <p>{notification.message}</p>
            </div>
          </div>
        )}

        {account ? (
          <div className="dashboard-layout">
            {/* Role Selection Modal */}
            {showRoleSelection && (
              <div className="modal-overlay">
                <div className="role-selection-modal">
                  <h2>Choose Your Role</h2>
                  <div className="role-options">
                    <div className="role-card" onClick={() => handleRoleSelection('verifier')}>
                      <div className="role-icon">🛡️</div>
                      <h3>Verifier</h3>
                      <p>Purchase NFT to verify code and earn rewards</p>
                      <div className="role-price">1 APT</div>
                    </div>
                    <div className="role-card" onClick={() => handleRoleSelection('developer')}>
                      <div className="role-icon">👨‍💻</div>
                      <h3>Developer</h3>
                      <p>Register to access developer tools and features</p>
                      <div className="role-price">Free</div>
                    </div>
                    <div className="role-card" onClick={() => handleRoleSelection('client')}>
                      <div className="role-icon">👤</div>
                      <h3>Client</h3>
                      <p>Post jobs and hire freelancers</p>
                      <div className="role-price">Free</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Verifier NFT Purchase Modal */}
            {showVerifierNFT && (
              <div className="modal-overlay">
                <div className="nft-purchase-modal">
                  <h2>Premium Code Verifier</h2>
                  <p>Professional blockchain code verification platform</p>
                  <div className="access-bar">
                    <span>🔒</span>
                    <span>Premium Access Required</span>
                  </div>
                  <div className="nft-details">
                    <div className="shield-icon">🛡️</div>
                    <h3>Exclusive Verifier Access</h3>
                    <p>Purchase a one-time access NFT to become a verified code reviewer. Earn rewards for helping secure the blockchain ecosystem.</p>
                    <div className="nft-price">
                      <span>Verifier Access NFT</span>
                      <div className="price">👑 1 APT</div>
                    </div>
                    <button 
                      className="connect-wallet-btn" 
                      onClick={purchaseVerifierNFT}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "🪙 Purchase NFT"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Developer Registration Modal */}
            {showDeveloperRegistration && (
              <div className="modal-overlay">
                <div className="developer-registration-modal">
                  <h2>Developer Registration</h2>
                  <p>Register your address to access the developer zone</p>
                  <div className="registration-details">
                    <div className="dev-icon">👨‍💻</div>
                    <h3>Developer Access</h3>
                    <p>Get access to developer tools, code verification, and project management features.</p>
                    <div className="registration-info">
                      <p><strong>Address:</strong> {account}</p>
                      <p><strong>Registration:</strong> Free</p>
                    </div>
                    <button 
                      className="connect-wallet-btn" 
                      onClick={registerAsDeveloper}
                      disabled={loading}
                    >
                      {loading ? "Registering..." : "Register as Developer"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Role-based Content */}
            {userRole === 'verifier' ? (
              <div className="verifier-dashboard">
                <h2>🛡️ Verifier Dashboard</h2>
                <p>Welcome to the verifier zone! You can now verify code and earn rewards.</p>
                <div className="verifier-stats">
                  <div className="stat-card">
                    <h3>Verified Projects</h3>
                    <span>0</span>
                  </div>
                  <div className="stat-card">
                    <h3>Earned Rewards</h3>
                    <span>0 APT</span>
                  </div>
                  <div className="stat-card">
                    <h3>Verification Score</h3>
                    <span>100%</span>
                  </div>
                </div>
                <div className="verifier-actions">
                  <button className="action-btn">View Pending Verifications</button>
                  <button className="action-btn">My Verification History</button>
                  <button className="action-btn">Earnings Report</button>
                </div>
                
                {/* Pending Verifications Section */}
                <div className="pending-verifications">
                  <h3>Pending Verifications</h3>
                  <div className="verification-list">
                    <div className="verification-item">
                      <div className="verification-header">
                        <h4>Smart Contract: TokenSwap</h4>
                        <span className="verification-status pending">Pending</span>
                      </div>
                      <div className="verification-details">
                        <p><strong>Developer:</strong> 0x1234...5678</p>
                        <p><strong>Submitted:</strong> 2 hours ago</p>
                        <p><strong>Reward:</strong> 2.5 APT</p>
                        <p><strong>Description:</strong> A decentralized token swap contract with automated market making functionality.</p>
                      </div>
                      <div className="verification-actions">
                        <button className="action-btn accept-btn">Accept Verification</button>
                        <button className="action-btn reject-btn">Reject</button>
                        <button className="action-btn">View Code</button>
                      </div>
                    </div>
                    
                    <div className="verification-item">
                      <div className="verification-header">
                        <h4>Smart Contract: NFT Marketplace</h4>
                        <span className="verification-status pending">Pending</span>
                      </div>
                      <div className="verification-details">
                        <p><strong>Developer:</strong> 0x9876...5432</p>
                        <p><strong>Submitted:</strong> 5 hours ago</p>
                        <p><strong>Reward:</strong> 3.0 APT</p>
                        <p><strong>Description:</strong> An NFT marketplace contract with bidding and auction features.</p>
                      </div>
                      <div className="verification-actions">
                        <button className="action-btn accept-btn">Accept Verification</button>
                        <button className="action-btn reject-btn">Reject</button>
                        <button className="action-btn">View Code</button>
                      </div>
                    </div>
                    
                    <div className="verification-item">
                      <div className="verification-header">
                        <h4>Smart Contract: DeFi Lending</h4>
                        <span className="verification-status pending">Pending</span>
                      </div>
                      <div className="verification-details">
                        <p><strong>Developer:</strong> 0x4567...8901</p>
                        <p><strong>Submitted:</strong> 1 day ago</p>
                        <p><strong>Reward:</strong> 4.0 APT</p>
                        <p><strong>Description:</strong> A decentralized lending protocol with collateral management.</p>
                      </div>
                      <div className="verification-actions">
                        <button className="action-btn accept-btn">Accept Verification</button>
                        <button className="action-btn reject-btn">Reject</button>
                        <button className="action-btn">View Code</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : userRole === 'developer' ? (
              <div className="developer-dashboard">
                <h2>👨‍💻 Developer Zone</h2>
                <p>Welcome to the developer zone! Access your development tools and projects.</p>
                <div className="developer-stats">
                  <div className="stat-card">
                    <h3>Active Projects</h3>
                    <span>0</span>
                  </div>
                  <div className="stat-card">
                    <h3>Code Submissions</h3>
                    <span>0</span>
                  </div>
                  <div className="stat-card">
                    <h3>Verification Status</h3>
                    <span>Pending</span>
                  </div>
                </div>
                <div className="developer-actions">
                  <button className="action-btn">Submit Code for Verification</button>
                  <button className="action-btn">My Projects</button>
                  <button className="action-btn">Verification History</button>
                </div>
              </div>
            ) : userRole === 'client' ? (
              <div className="client-dashboard">
                {/* Client View */}
                {isClient ? (
                  <div>
                    <div className="job-posting-section">
                  <div className="section-header">
                    <h2>Post a New Job</h2>
                    <button
                      className="post-job-btn" 
                      onClick={() => setShowPostJobForm(!showPostJobForm)}
                    >
                      {showPostJobForm ? "Cancel" : "Post Job"}
                    </button>
                  </div>

                  {showPostJobForm && (
                    <div className="job-form-container">
                      <form onSubmit={createJob}>
                        <div className="form-group">
                          <label className="form-label">Job Title</label>
                          <input
                            type="text"
                            name="title"
                            value={newContract.title}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="e.g., Website Development"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Job Description</label>
                          <textarea
                            name="description"
                            value={newContract.description}
                            onChange={handleInputChange}
                            className="form-textarea"
                            rows="4" 
                            placeholder="Describe the job requirements and deliverables..."
                            required
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Budget (APT)</label>
                            <input
                              type="number"
                              name="amount"
                              value={newContract.amount}
                              onChange={handleInputChange}
                              className="form-input"
                              step="0.01"
                              min="0.01"
                              placeholder="0.00"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Deadline</label>
                            <input
                              type="date"
                              name="deadline"
                              value={newContract.deadline}
                              onChange={handleInputChange}
                              className="form-input"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Specific Freelancer (Optional)</label>
                          <input
                            type="text"
                            name="freelancerAddress"
                            value={newContract.freelancerAddress}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="0x... (leave empty for open applications)"
                          />
                        </div>
                        <button type="submit" className="submit-job-btn" disabled={loading}>
                          {loading ? "Posting..." : "Post Job"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                <div className="posted-jobs-section">
                  <h2>Your Posted Jobs</h2>
                  {contracts.length > 0 ? (
                    <div className="jobs-list">
                      {contracts.map((job) => (
                        <div key={job.id} className="job-card">
                          <div className="job-header">
                            <h3 className="job-title">{job.title}</h3>
                            <span className={`job-status status-${job.status}`}>
                              {job.status === "open" ? "Open" : 
                               job.status === "in_progress" ? "In Progress" : 
                               job.status === "completed" ? "Completed" : "Closed"}
                            </span>
                          </div>
                          <p className="job-description">{job.description}</p>
                          <div className="job-details">
                            <span className="detail-badge">
                              <span className="detail-icon">💰</span> {job.amount} APT
                            </span>
                            <span className="detail-badge">
                              <span className="detail-icon">📄</span> Due: {job.deadline}
                            </span>
                            <span className="detail-badge">
                              <span className="detail-icon">👤</span> 
                              {job.freelancerAddress === "Open to all" ? "Open to all" : `${job.freelancerAddress.substring(0, 6)}...${job.freelancerAddress.substring(job.freelancerAddress.length - 4)}`}
                            </span>
                          </div>
                          <div className="job-actions">
                            <button 
                              className="action-btn view-applicants-btn"
                              onClick={() => viewApplications(job)}
                            >
                              View Applications ({job.applicants?.length || 0})
                            </button>
                            {job.status === "open" && (
                              <button className="action-btn close-job-btn">
                                Close Job
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-jobs-message">
                      <p>No jobs posted yet. Click "Post Job" to create your first job posting.</p>
                    </div>
                  )}
                    </div>
                  </div>
                ) : (
                  <div className="freelancer-dashboard">
                <h2>Available Jobs</h2>
                <p>Browse and apply to available freelance opportunities.</p>
                
                {contracts.length > 0 ? (
                  <div className="jobs-list">
                    {contracts.map((job) => (
                      <div key={job.id} className="job-card">
                        <div className="job-header">
                          <h3 className="job-title">{job.title}</h3>
                          <span className={`job-status status-${job.status}`}>
                            {job.status === "open" ? "Open" : 
                             job.status === "in_progress" ? "In Progress" : 
                             job.status === "completed" ? "Completed" : "Closed"}
                          </span>
                        </div>
                        <p className="job-description">{job.description}</p>
                        <div className="job-details">
                          <span className="detail-badge">
                            <span className="detail-icon">💰</span> {job.amount} APT
                          </span>
                          <span className="detail-badge">
                            <span className="detail-icon">📄</span> Due: {job.deadline}
                          </span>
                          <span className="detail-badge">
                            <span className="detail-icon">👤</span> 
                            Client: {job.clientAddress ? `${job.clientAddress.substring(0, 6)}...${job.clientAddress.substring(job.clientAddress.length - 4)}` : "Unknown"}
                          </span>
                        </div>
                        <div className="job-actions">
                          {job.status === "open" && (
                            <button 
                              className="action-btn apply-job-btn"
                              onClick={() => applyForJob(job.id)}
                              disabled={loading}
                            >
                              {loading ? "Applying..." : "Apply for Job"}
                            </button>
                          )}
                          <button className="action-btn view-details-btn">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-jobs-message">
                    <p>No available jobs at the moment. Check back later!</p>
                  </div>
                )}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-role-selected">
                <h2>No Role Selected</h2>
                <p>Please select a role to continue.</p>
                <button className="connect-wallet-btn" onClick={() => setShowRoleSelection(true)}>
                  Select Role
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="welcome-section">
            <h2>Welcome to EVOLVEX BLOCKFREE</h2>
            <p>Connect your Petra wallet to get started with the decentralized freelancing platform.</p>
            <div className="welcome-features">
              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3>Verifier</h3>
                <p>Purchase NFT to verify code and earn rewards</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👨‍💻</div>
                <h3>Developer</h3>
                <p>Register to access developer tools and features</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👤</div>
                <h3>Client</h3>
                <p>Post jobs and hire freelancers</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Applications Modal */}
      {showApplications && selectedJob && (
        <div className="modal-overlay">
          <div className="applications-modal">
            <div className="modal-header">
              <h3>Applications for "{selectedJob.title}"</h3>
              <button className="close-modal-btn" onClick={closeApplications}>
                ×
              </button>
            </div>
            
            <div className="applications-list">
              {selectedJob.applicants && selectedJob.applicants.length > 0 ? (
                selectedJob.applicants.map((applicant, index) => (
                  <div key={index} className="application-card">
                    <div className="application-header">
                      <div className="applicant-info">
                        <h4>Freelancer</h4>
                        <p className="applicant-address">
                          {applicant.freelancerAddress.substring(0, 6)}...{applicant.freelancerAddress.substring(applicant.freelancerAddress.length - 4)}
                        </p>
                        <p className="application-date">
                          Applied: {new Date(applicant.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`application-status status-${applicant.status}`}>
                        {applicant.status === "pending" ? "Pending" :
                         applicant.status === "accepted" ? "Accepted" : "Rejected"}
                      </div>
                    </div>
                    
                    {selectedJob.status === "open" && applicant.status === "pending" && (
                      <div className="application-actions">
                        <button 
                          className="action-btn accept-btn"
                          onClick={() => acceptApplication(selectedJob.id, applicant.freelancerAddress)}
                          disabled={loading}
                        >
                          {loading ? "Processing..." : "Accept Application"}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-applications">
                  <p>No applications yet for this job.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockFree;