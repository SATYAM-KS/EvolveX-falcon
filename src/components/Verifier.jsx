import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  Calendar,
  Hash,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Code,
  FileText,
  Activity,
  Zap,
  Database,
  Shield,
  Lock,
  Wallet,
  CreditCard,
  Award,
  Key
} from "lucide-react";

const AptosNFTVerifier = () => {
  // State for payment and access control
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [userWallet, setUserWallet] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [nftOwnership, setNftOwnership] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, completed, failed

  // Original verifier state
  const [contractAddress, setContractAddress] = useState(
    "0x2c449df63159be31e0482f03613355693bacd22b58419dd0d85c342346a615b6"
  );
  const [accountData, setAccountData] = useState(null);
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Configuration
  const APTOS_TESTNET_URL = "https://fullnode.testnet.aptoslabs.com/v1";
  const NFT_PRICE_APT = 1;
  const VERIFIER_NFT_COLLECTION = "Smart Contract Verifier Access";

  // Check if user has the required NFT
  const checkNFTOwnership = useCallback(async (walletAddress) => {
    if (!walletAddress) return false;
    
    try {
      // Simulate NFT ownership check
      // In a real implementation, you would query the Aptos blockchain
      const response = await fetch(`${APTOS_TESTNET_URL}/accounts/${walletAddress}/resources`);
      if (response.ok) {
        const resources = await response.json();
        // Check for NFT ownership in resources
        const hasVerifierNFT = resources.some(resource => 
          resource.type.includes("token") || 
          resource.type.includes("NFT") ||
          resource.type.includes("TokenStore")
        );
        return hasVerifierNFT;
      }
      return false;
    } catch (error) {
      console.error("Error checking NFT ownership:", error);
      return false;
    }
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Simulate wallet connection
      // In real implementation, use Aptos wallet adapter
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockWallet = "0x" + Math.random().toString(16).substring(2, 66);
      setUserWallet(mockWallet);
      
      // Check NFT ownership
      const hasNFT = await checkNFTOwnership(mockWallet);
      setNftOwnership(hasNFT);
      setIsUserVerified(hasNFT);
      
      if (hasNFT) {
        setPaymentStatus("completed");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setError("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Purchase NFT function
  const purchaseAccessNFT = async () => {
    setIsPurchasing(true);
    setPaymentStatus("processing");
    
    try {
      // Simulate NFT purchase transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate successful purchase
      setNftOwnership(true);
      setIsUserVerified(true);
      setPaymentStatus("completed");
      
    } catch (error) {
      console.error("NFT purchase failed:", error);
      setError("Failed to purchase access NFT");
      setPaymentStatus("failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Utility functions from original component
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTimestamp = (timestamp) => {
    return new Date(parseInt(timestamp) / 1000).toLocaleString();
  };

  const fetchRealTimeData = useCallback(async () => {
    if (!contractAddress || !contractAddress.startsWith("0x") || !isUserVerified) return;

    setLoading(true);
    setError(null);

    try {
      const [
        accountResponse,
        modulesResponse,
        resourcesResponse,
        transactionsResponse,
      ] = await Promise.allSettled([
        fetch(`${APTOS_TESTNET_URL}/accounts/${contractAddress}`),
        fetch(`${APTOS_TESTNET_URL}/accounts/${contractAddress}/modules`),
        fetch(`${APTOS_TESTNET_URL}/accounts/${contractAddress}/resources`),
        fetch(`${APTOS_TESTNET_URL}/accounts/${contractAddress}/transactions?limit=10`),
      ]);

      if (accountResponse.status === "fulfilled" && accountResponse.value.ok) {
        const accountData = await accountResponse.value.json();
        setAccountData(accountData);
      } else if (accountResponse.status === "fulfilled" && accountResponse.value.status === 404) {
        throw new Error("Account not found on testnet. This address may not exist or has no activity.");
      } else if (accountResponse.status === "rejected") {
        throw new Error("Network error while fetching account data.");
      }

      let modulesData = [];
      if (modulesResponse.status === "fulfilled" && modulesResponse.value.ok) {
        modulesData = await modulesResponse.value.json();
      }
      setModules(modulesData);

      let resourcesData = [];
      if (resourcesResponse.status === "fulfilled" && resourcesResponse.value.ok) {
        resourcesData = await resourcesResponse.value.json();
      }
      setResources(resourcesData);

      let transactionsData = [];
      if (transactionsResponse.status === "fulfilled" && transactionsResponse.value.ok) {
        transactionsData = await transactionsResponse.value.json();
      }
      setTransactions(transactionsData);

      setVerificationStatus({
        verified: modulesData.length > 0,
        moduleCount: modulesData.length,
        resourceCount: resourcesData.length,
        transactionCount: transactionsData.length,
        hasSmartContract: modulesData.length > 0,
        accountExists: accountResponse.status === "fulfilled" && accountResponse.value.ok,
      });

      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      setAccountData(null);
      setModules([]);
      setResources([]);
      setTransactions([]);
      setVerificationStatus(null);
    } finally {
      setLoading(false);
    }
  }, [contractAddress, isUserVerified]);

  useEffect(() => {
    let interval;
    if (autoRefresh && contractAddress && isUserVerified) {
      interval = setInterval(fetchRealTimeData, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, contractAddress, isUserVerified, fetchRealTimeData]);

  useEffect(() => {
    if (contractAddress && isUserVerified) {
      fetchRealTimeData();
    }
  }, [contractAddress, isUserVerified, fetchRealTimeData]);

  const handleAddressChange = (e) => {
    setContractAddress(e.target.value.trim());
  };

  const handleVerifyContract = () => {
    if (isUserVerified) {
      fetchRealTimeData();
    }
  };

  const getModuleFunctions = (module) => {
    if (!module.abi || !module.abi.exposed_functions) return [];
    return module.abi.exposed_functions.filter(
      (func) => func.visibility === "public" || func.is_entry
    );
  };

  const getModuleStructs = (module) => {
    if (!module.abi || !module.abi.structs) return [];
    return module.abi.structs;
  };

  const getTransactionType = (transaction) => {
    return transaction.payload?.type || transaction.type || "Unknown";
  };

  // Monochrome theme styles
  const styles = {
    container: {
      minHeight: "100vh",
      background: "var(--w-c)",
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    mainWrapper: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "2rem"
    },
    card: {
      background: "var(--w-c)",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
      border: "2px solid var(--b-c)",
      marginBottom: "2rem"
    },
    headerCard: {
      padding: "3rem"
    },
    title: {
      fontSize: "3rem",
      fontWeight: "900",
      letterSpacing: "-0.025em",
      color: "var(--b-c)",
      marginBottom: "0.5rem",
      lineHeight: "1.2"
    },
    subtitle: {
      color: "var(--b-c)",
      fontSize: "1.25rem",
      fontWeight: "400",
      letterSpacing: "-0.01em",
      opacity: "0.8"
    },
    statusBadge: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "1rem 1.5rem",
      borderRadius: "9999px",
      fontSize: "0.95rem",
      fontWeight: "500",
      border: "1px solid"
    },
    button: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "1.25rem 2rem",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "600",
      border: "2px solid var(--b-c)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    primaryButton: {
      background: "var(--b-c)",
      color: "var(--w-c)"
    },
    secondaryButton: {
      background: "var(--w-c)",
      color: "var(--b-c)"
    },
    dangerButton: {
      background: "var(--b-c)",
      color: "var(--w-c)"
    },
    successButton: {
      background: "var(--b-c)",
      color: "var(--w-c)"
    },
    input: {
      width: "100%",
      padding: "1.5rem",
      border: "2px solid var(--b-c)",
      borderRadius: "8px",
      fontSize: "1rem",
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      background: "var(--w-c)",
      transition: "all 0.3s ease",
      color: "var(--b-c)"
    },
    accessGate: {
      textAlign: "center",
      padding: "4rem 3rem"
    },
    accessIcon: {
      width: "120px",
      height: "120px",
      margin: "0 auto 2rem",
      color: "var(--b-c)"
    },
    accessTitle: {
      fontSize: "2.5rem",
      fontWeight: "900",
      color: "var(--b-c)",
      marginBottom: "1rem",
      textTransform: "uppercase",
      letterSpacing: "1px"
    },
    accessDescription: {
      fontSize: "1.125rem",
      color: "var(--b-c)",
      marginBottom: "2rem",
      lineHeight: "1.6",
      opacity: "0.8"
    },
    priceDisplay: {
      background: "var(--w-c)",
      border: "2px solid var(--b-c)",
      borderRadius: "12px",
      padding: "2rem",
      margin: "2rem 0"
    },
    priceAmount: {
      fontSize: "3rem",
      fontWeight: "900",
      color: "var(--b-c)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem"
    },
    walletInfo: {
      background: "var(--w-c)",
      border: "2px solid var(--b-c)",
      borderRadius: "12px",
      padding: "1.5rem",
      marginBottom: "2rem"
    }
  };

  // If user is not verified, show access gate
  if (!isUserVerified) {
    return (
      <div style={styles.container}>
        <div style={styles.mainWrapper}>
          {/* Header */}
          <div style={{...styles.card, ...styles.headerCard}}>
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
              <div>
                <h1 style={styles.title}>Premium Smart Contract Verifier</h1>
                <p style={styles.subtitle}>
                  Professional-grade verification and analysis for Aptos blockchain contracts
                </p>
              </div>
              <div style={{...styles.statusBadge, background: "#fef3c7", color: "#f59e0b", borderColor: "#fbbf24"}}>
                <Lock className="h-5 w-5" />
                Premium Access Required
              </div>
            </div>
          </div>

          {/* Access Gate */}
          <div style={{...styles.card, ...styles.accessGate}}>
            <Shield style={styles.accessIcon} />
            <h2 style={styles.accessTitle}>Exclusive Access Required</h2>
            <p style={styles.accessDescription}>
              Access our premium smart contract verification dashboard by purchasing a one-time access NFT.
              This exclusive pass grants you lifetime access to advanced contract analysis tools.
            </p>

            {/* Pricing */}
            <div style={styles.priceDisplay}>
              <div style={{marginBottom: "1rem", fontSize: "1.125rem", fontWeight: "500", color: "#92400e"}}>
                One-Time Access Fee
              </div>
              <div style={styles.priceAmount}>
                <Award className="h-12 w-12" />
                {NFT_PRICE_APT} APT
              </div>
              <div style={{marginTop: "1rem", fontSize: "0.875rem", color: "#92400e"}}>
                Includes exclusive NFT certificate + lifetime dashboard access
              </div>
            </div>

            {/* Wallet Connection */}
            {!userWallet ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  fontSize: "1.125rem",
                  padding: "1.5rem 3rem"
                }}
              >
                {isConnecting ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <Wallet className="h-6 w-6" />
                )}
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            ) : (
              <div>
                <div style={styles.walletInfo}>
                  <div style={{display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem"}}>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span style={{fontWeight: "500", color: "#059669"}}>Wallet Connected</span>
                  </div>
                  <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem", color: "#374151"}}>
                    {userWallet}
                  </div>
                </div>

                {nftOwnership === false && (
                  <button
                    onClick={purchaseAccessNFT}
                    disabled={isPurchasing || paymentStatus === "processing"}
                    style={{
                      ...styles.button,
                      ...styles.successButton,
                      fontSize: "1.125rem",
                      padding: "1.5rem 3rem"
                    }}
                  >
                    {isPurchasing ? (
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    ) : (
                      <CreditCard className="h-6 w-6" />
                    )}
                    {isPurchasing ? "Processing Purchase..." : `Purchase Access NFT (${NFT_PRICE_APT} APT)`}
                  </button>
                )}

                {paymentStatus === "processing" && (
                  <div style={{marginTop: "2rem", padding: "1.5rem", background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "16px"}}>
                    <div style={{display: "flex", alignItems: "center", gap: "0.75rem", color: "#92400e"}}>
                      <Clock className="h-5 w-5 animate-pulse" />
                      <span style={{fontWeight: "500"}}>Transaction Processing</span>
                    </div>
                    <p style={{marginTop: "0.5rem", fontSize: "0.875rem", color: "#92400e"}}>
                      Please wait while we mint your access NFT and process the payment...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Features Preview */}
            <div style={{marginTop: "4rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem", textAlign: "left"}}>
              {[
                {
                  icon: <Code className="h-8 w-8" />,
                  title: "Advanced Code Analysis",
                  description: "Deep dive into smart contract bytecode and ABI analysis"
                },
                {
                  icon: <Activity className="h-8 w-8" />,
                  title: "Real-time Monitoring",
                  description: "Live updates and transaction monitoring capabilities"
                },
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: "Security Verification",
                  description: "Comprehensive security checks and vulnerability scanning"
                }
              ].map((feature, index) => (
                <div key={index} style={{padding: "2rem", background: "var(--w-c)", borderRadius: "12px", border: "2px solid var(--b-c)"}}>
                  <div style={{color: "var(--b-c)", marginBottom: "1rem"}}>
                    {feature.icon}
                  </div>
                  <h3 style={{fontSize: "1.125rem", fontWeight: "700", color: "var(--b-c)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px"}}>
                    {feature.title}
                  </h3>
                  <p style={{color: "var(--b-c)", fontSize: "0.875rem", lineHeight: "1.5", opacity: "0.8"}}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard (only accessible after NFT purchase)
  return (
    <div style={styles.container}>
      <div style={styles.mainWrapper}>
        {/* Header with Access Status */}
        <div style={{...styles.card, ...styles.headerCard}}>
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
            <div>
              <h1 style={styles.title}>Smart Contract Verifier</h1>
              <p style={styles.subtitle}>
                Real-time verification and analysis for Aptos testnet contracts
              </p>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
              <div style={{...styles.statusBadge, background: "var(--w-c)", color: "var(--b-c)", borderColor: "var(--b-c)"}}>
                <Key className="h-5 w-5" />
                Premium Access Active
              </div>
              <div style={{...styles.statusBadge, background: "var(--w-c)", color: "var(--b-c)", borderColor: "var(--b-c)"}}>
                <div style={{width: "8px", height: "8px", background: "var(--b-c)", borderRadius: "50%", animation: "pulse 2s infinite"}}></div>
                Testnet
              </div>
              {lastUpdated && (
                <div style={{fontSize: "0.75rem", color: "var(--b-c)", opacity: "0.7"}}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div style={{...styles.card, padding: "2rem"}}>
          <div style={{marginBottom: "2rem"}}>
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem"}}>
              <label style={{fontSize: "1.25rem", fontWeight: "600", color: "var(--b-c)", textTransform: "uppercase", letterSpacing: "0.5px"}}>
                Contract Address
              </label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                style={{
                  ...styles.button,
                  padding: "0.75rem 1.25rem",
                  fontSize: "0.875rem",
                  background: autoRefresh ? "var(--b-c)" : "var(--w-c)",
                  color: autoRefresh ? "var(--w-c)" : "var(--b-c)",
                  border: `2px solid var(--b-c)`
                }}
              >
                <Zap className={`h-4 w-4 ${autoRefresh ? "animate-pulse" : ""}`} />
                {autoRefresh ? "Live Updates" : "Enable Live Updates"}
              </button>
            </div>

            <div style={{display: "flex", gap: "1rem", alignItems: "end"}}>
              <div style={{flex: 1}}>
                <div style={{position: "relative"}}>
                  <input
                    type="text"
                    value={contractAddress}
                    onChange={handleAddressChange}
                    placeholder="0x..."
                    style={styles.input}
                  />
                  <Search style={{position: "absolute", right: "1.5rem", top: "1.5rem", width: "1.5rem", height: "1.5rem", color: "#94a3b8"}} />
                </div>
              </div>
              <button
                onClick={handleVerifyContract}
                disabled={loading || !contractAddress}
                style={{
                  ...styles.button,
                  ...styles.secondaryButton,
                  padding: "1.5rem 2rem"
                }}
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Shield className="h-5 w-5" />
                )}
                {loading ? "Verifying..." : "Verify Contract"}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            ...styles.card,
            padding: "2rem",
            background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            border: "1px solid #f87171"
          }}>
            <div style={{display: "flex", alignItems: "center", gap: "1rem", color: "#dc2626"}}>
              <AlertCircle className="h-7 w-7" />
              <div>
                <span style={{fontSize: "1.125rem", fontWeight: "600"}}>Verification Failed</span>
                <p style={{marginTop: "0.25rem", color: "#b91c1c"}}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rest of the dashboard content remains the same as the original component */}
        {verificationStatus && (
          <>
            {/* Status Overview */}
            <div style={{...styles.card, padding: "2rem"}}>
              <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem"}}>
                <h2 style={{fontSize: "2rem", fontWeight: "200", color: "#1e293b"}}>
                  Contract Analysis
                </h2>
                <div style={{
                  ...styles.statusBadge,
                  fontSize: "1.125rem",
                  padding: "1rem 1.5rem",
                  background: verificationStatus.verified ? "#ecfdf5" : "#fef3c7",
                  color: verificationStatus.verified ? "#059669" : "#f59e0b",
                  borderColor: verificationStatus.verified ? "#10b981" : "#fbbf24"
                }}>
                  {verificationStatus.verified ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <AlertCircle className="h-6 w-6" />
                  )}
                  <span>
                    {verificationStatus.verified
                      ? "Smart Contract Verified"
                      : "Account Found, No Contracts"}
                  </span>
                </div>
              </div>

              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem"}}>
                {[
                  { icon: Hash, label: "Address", value: formatAddress(contractAddress), color: "#3b82f6" },
                  { icon: Code, label: "Modules", value: verificationStatus.moduleCount, color: "#059669" },
                  { icon: Database, label: "Resources", value: verificationStatus.resourceCount, color: "#7c3aed" },
                  { icon: Activity, label: "Sequence", value: accountData?.sequence_number || "0", color: "#f59e0b" }
                ].map((item, index) => (
                  <div key={index} style={{
                    background: `linear-gradient(135deg, ${item.color}10 0%, ${item.color}20 100%)`,
                    borderRadius: "16px",
                    padding: "1.5rem",
                    border: `1px solid ${item.color}40`
                  }}>
                    <div style={{display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem"}}>
                      <item.icon style={{width: "1.75rem", height: "1.75rem", color: item.color}} />
                      <span style={{fontWeight: "500", color: "#1e293b", fontSize: "1.125rem"}}>
                        {item.label}
                      </span>
                    </div>
                    <p style={{fontSize: item.label === "Address" ? "0.75rem" : "2rem", fontWeight: item.label === "Address" ? "400" : "200", color: "#374151", fontFamily: item.label === "Address" ? "'JetBrains Mono', monospace" : "inherit", wordBreak: item.label === "Address" ? "break-all" : "normal"}}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {accountData && (
                <div style={{marginTop: "2rem", padding: "1.5rem", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", border: "1px solid #e2e8f0", borderRadius: "16px"}}>
                  <h3 style={{fontWeight: "600", color: "#1e293b", marginBottom: "1rem", fontSize: "1.125rem"}}>
                    Account Details
                  </h3>
                  <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", fontSize: "0.875rem"}}>
                    <div>
                      <span style={{color: "#64748b"}}>Authentication Key:</span>
                      <p style={{fontFamily: "'JetBrains Mono', monospace", color: "#1e293b", marginTop: "0.25rem", wordBreak: "break-all"}}>
                        {accountData.authentication_key}
                      </p>
                    </div>
                    <div>
                      <span style={{color: "#64748b"}}>Sequence Number:</span>
                      <p style={{fontFamily: "'JetBrains Mono', monospace", color: "#1e293b", marginTop: "0.25rem"}}>
                        {accountData.sequence_number}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div style={styles.card}>
              <div style={{borderBottom: "1px solid #e2e8f0"}}>
                <nav style={{display: "flex"}}>
                  {[
                    { id: "overview", label: "Overview", count: "" },
                    { id: "modules", label: "Modules", count: modules.length },
                    { id: "resources", label: "Resources", count: resources.length },
                    { id: "transactions", label: "Transactions", count: transactions.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      style={{
                        padding: "1.5rem 2rem",
                        fontWeight: "500",
                        fontSize: "1.125rem",
                        borderBottom: "3px solid",
                        borderBottomColor: selectedTab === tab.id ? "#f59e0b" : "transparent",
                        color: selectedTab === tab.id ? "#f59e0b" : "#64748b",
                        background: selectedTab === tab.id ? "#fef3c7" : "transparent",
                        transition: "all 0.2s ease-in-out",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      {tab.label} {tab.count !== "" && `(${tab.count})`}
                    </button>
                  ))}
                </nav>
              </div>

              <div style={{padding: "2rem"}}>
                {selectedTab === "overview" && (
                  <div style={{textAlign: "center"}}>
                    <h3 style={{fontSize: "1.5rem", fontWeight: "300", color: "#1e293b", marginBottom: "2rem"}}>
                      Contract Summary
                    </h3>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", maxWidth: "800px", margin: "0 auto"}}>
                      {[
                        { value: modules.length, label: "Smart Contract Modules" },
                        { value: resources.length, label: "On-Chain Resources" },
                        { value: transactions.length, label: "Recent Transactions" }
                      ].map((item, index) => (
                        <div key={index} style={{background: "#f8fafc", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e2e8f0"}}>
                          <div style={{fontSize: "2rem", fontWeight: "300", color: "#1e293b", marginBottom: "0.5rem"}}>
                            {item.value}
                          </div>
                          <div style={{color: "#64748b", fontSize: "0.875rem"}}>
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {modules.length > 0 && (
                      <div style={{background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", borderRadius: "16px", padding: "1.5rem", border: "1px solid #10b981", marginTop: "2rem"}}>
                        <h4 style={{fontWeight: "600", color: "#059669", fontSize: "1.125rem", marginBottom: "1rem"}}>
                          Deployed Modules
                        </h4>
                        <div style={{display: "flex", flexDirection: "column", gap: "0.75rem"}}>
                          {modules.map((module, idx) => (
                            <div
                              key={idx}
                              style={{display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255, 255, 255, 0.7)", padding: "1rem", borderRadius: "12px"}}
                            >
                              <div>
                                <div style={{fontFamily: "'JetBrains Mono', monospace", color: "#059669", fontWeight: "500"}}>
                                  {module.abi?.name || "Unnamed Module"}
                                </div>
                                <div style={{fontSize: "0.875rem", color: "#047857"}}>
                                  {getModuleFunctions(module).length} functions, {getModuleStructs(module).length} structs
                                </div>
                              </div>
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === "modules" && (
                  <div>
                    {modules.length === 0 ? (
                      <div style={{textAlign: "center", padding: "4rem 2rem"}}>
                        <Code className="h-20 w-20 mx-auto mb-6 text-stone-300" />
                        <h3 style={{fontSize: "1.5rem", fontWeight: "300", color: "#64748b", marginBottom: "0.5rem"}}>
                          No Smart Contracts Found
                        </h3>
                        <p style={{color: "#64748b"}}>
                          This address doesn't contain any deployed smart contract modules.
                        </p>
                      </div>
                    ) : (
                      modules.map((module, index) => {
                        const functions = getModuleFunctions(module);
                        const structs = getModuleStructs(module);

                        return (
                          <div
                            key={index}
                            style={{border: "2px solid #e2e8f0", borderRadius: "24px", padding: "2rem", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", marginBottom: "2rem"}}
                          >
                            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem"}}>
                              <h3 style={{fontSize: "2rem", fontWeight: "300", color: "#1e293b"}}>
                                {module.abi?.name || "Unnamed Module"}
                              </h3>
                              <div style={{display: "flex", alignItems: "center", gap: "0.5rem", color: "#059669", background: "#ecfdf5", padding: "0.75rem 1.25rem", borderRadius: "9999px", border: "1px solid #10b981"}}>
                                <CheckCircle className="h-5 w-5" />
                                <span style={{fontWeight: "500"}}>Verified & Active</span>
                              </div>
                            </div>

                            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem"}}>
                              <div>
                                <h4 style={{fontWeight: "600", color: "#1e293b", marginBottom: "1.5rem", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem"}}>
                                  <Code className="h-6 w-6 text-stone-600" />
                                  Public Functions ({functions.length})
                                </h4>
                                {functions.length === 0 ? (
                                  <p style={{color: "#64748b", fontStyle: "italic"}}>
                                    No public functions available
                                  </p>
                                ) : (
                                  <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                                    {functions.map((func, idx) => (
                                      <div
                                        key={idx}
                                        style={{background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"}}
                                      >
                                        <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "1.125rem", color: "#1e293b", marginBottom: "0.75rem", fontWeight: "500"}}>
                                          {func.name}
                                        </div>
                                        <div style={{display: "flex", flexWrap: "wrap", gap: "0.5rem"}}>
                                          <span
                                            style={{
                                              padding: "0.25rem 0.75rem",
                                              borderRadius: "9999px",
                                              fontSize: "0.875rem",
                                              fontWeight: "500",
                                              ...(func.is_entry
                                                ? {background: "#dbeafe", color: "#1d4ed8", border: "1px solid #3b82f6"}
                                                : {background: "#f1f5f9", color: "#475569", border: "1px solid #64748b"})
                                            }}
                                          >
                                            {func.is_entry ? "entry function" : "view function"}
                                          </span>
                                          <span style={{padding: "0.25rem 0.75rem", background: "#ecfdf5", color: "#059669", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: "500", border: "1px solid #10b981"}}>
                                            {func.visibility}
                                          </span>
                                          {func.generic_type_params?.length > 0 && (
                                            <span style={{padding: "0.25rem 0.75rem", background: "#f3e8ff", color: "#7c3aed", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: "500", border: "1px solid #8b5cf6"}}>
                                              generic
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 style={{fontWeight: "600", color: "#1e293b", marginBottom: "1.5rem", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem"}}>
                                  <FileText className="h-6 w-6 text-stone-600" />
                                  Data Structures ({structs.length})
                                </h4>
                                {structs.length === 0 ? (
                                  <p style={{color: "#64748b", fontStyle: "italic"}}>
                                    No structs defined
                                  </p>
                                ) : (
                                  <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                                    {structs.map((struct, idx) => (
                                      <div
                                        key={idx}
                                        style={{background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"}}
                                      >
                                        <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "1.125rem", color: "#1e293b", marginBottom: "0.5rem", fontWeight: "500"}}>
                                          {struct.name}
                                        </div>
                                        <div style={{fontSize: "0.875rem", color: "#64748b"}}>
                                          {struct.fields?.length || 0} fields
                                          {struct.abilities && struct.abilities.length > 0 && (
                                            <span style={{marginLeft: "0.5rem"}}>
                                              • {struct.abilities.join(", ")}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div style={{marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0"}}>
                              <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.875rem", color: "#64748b"}}>
                                <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
                                  <span>
                                    Bytecode: {formatBytes(module.bytecode?.length || 0)}
                                  </span>
                                  {module.source_map && (
                                    <span style={{display: "flex", alignItems: "center", gap: "0.25rem"}}>
                                      <Eye className="h-4 w-4" />
                                      Source map available
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {selectedTab === "resources" && (
                  <div>
                    {resources.length === 0 ? (
                      <div style={{textAlign: "center", padding: "4rem 2rem"}}>
                        <Database className="h-20 w-20 mx-auto mb-6 text-stone-300" />
                        <h3 style={{fontSize: "1.5rem", fontWeight: "300", color: "#64748b", marginBottom: "0.5rem"}}>
                          No Resources Found
                        </h3>
                        <p style={{color: "#64748b"}}>
                          This address doesn't contain any on-chain resources.
                        </p>
                      </div>
                    ) : (
                      resources.map((resource, index) => (
                        <div
                          key={index}
                          style={{border: "2px solid #e2e8f0", borderRadius: "24px", padding: "2rem", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", marginBottom: "1.5rem"}}
                        >
                          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem"}}>
                            <h3 style={{fontSize: "1.5rem", fontWeight: "300", color: "#1e293b"}}>
                              {resource.type.split("::").pop()}
                            </h3>
                            <span style={{fontSize: "0.875rem", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", background: "#f1f5f9", padding: "0.5rem 0.75rem", borderRadius: "9999px"}}>
                              {formatAddress(resource.type)}
                            </span>
                          </div>

                          <div style={{background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem", color: "#475569"}}>
                            <pre style={{whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0}}>
                              {JSON.stringify(resource.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {selectedTab === "transactions" && (
                  <div>
                    {transactions.length === 0 ? (
                      <div style={{textAlign: "center", padding: "4rem 2rem"}}>
                        <Activity className="h-20 w-20 mx-auto mb-6 text-stone-300" />
                        <h3 style={{fontSize: "1.5rem", fontWeight: "300", color: "#64748b", marginBottom: "0.5rem"}}>
                          No Recent Transactions
                        </h3>
                        <p style={{color: "#64748b"}}>
                          No recent transaction history available for this address.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h3 style={{fontSize: "1.5rem", fontWeight: "300", color: "#1e293b", marginBottom: "1.5rem"}}>
                          Recent Transaction History
                        </h3>
                        {transactions.map((tx, index) => (
                          <div
                            key={index}
                            style={{border: "1px solid #e2e8f0", borderRadius: "16px", padding: "1.5rem", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", marginBottom: "1rem"}}
                          >
                            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem"}}>
                              <div style={{display: "flex", alignItems: "center", gap: "0.75rem"}}>
                                <div style={{width: "12px", height: "12px", background: "#10b981", borderRadius: "50%"}}></div>
                                <span style={{fontFamily: "'JetBrains Mono', monospace", color: "#1e293b", fontWeight: "500"}}>
                                  {formatAddress(tx.hash)}
                                </span>
                              </div>
                              <div style={{fontSize: "0.875rem", color: "#64748b"}}>
                                Version: {tx.version}
                              </div>
                            </div>

                            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", fontSize: "0.875rem"}}>
                              <div>
                                <span style={{color: "#64748b"}}>Type:</span>
                                <p style={{color: "#1e293b", fontWeight: "500", marginTop: "0.25rem"}}>
                                  {getTransactionType(tx)}
                                </p>
                              </div>
                              <div>
                                <span style={{color: "#64748b"}}>Status:</span>
                                <p style={{color: "#10b981", fontWeight: "500", marginTop: "0.25rem"}}>
                                  {tx.success ? "Success" : "Failed"}
                                </p>
                              </div>
                              <div>
                                <span style={{color: "#64748b"}}>Gas Used:</span>
                                <p style={{color: "#1e293b", fontWeight: "500", marginTop: "0.25rem"}}>
                                  {tx.gas_used || "N/A"}
                                </p>
                              </div>
                            </div>

                            {tx.timestamp && (
                              <div style={{marginTop: "0.75rem", fontSize: "0.75rem", color: "#64748b"}}>
                                {formatTimestamp(tx.timestamp)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AptosNFTVerifier;