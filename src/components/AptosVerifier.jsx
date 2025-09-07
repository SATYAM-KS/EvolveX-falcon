/* eslint-disable react-hooks/exhaustive-deps */
// EnhancedAptosVerifier.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";
import {
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Lock,
  Wallet,
  CreditCard,
  Award,
  Key,
  RefreshCw,
  AlertTriangle,
  User,
  Calendar,
} from "lucide-react";
import FetchVeriData from "./FetchVeriData.jsx";
import Verification from "./Verification.jsx";
import PushToBchain from "./PushToBchain.jsx";
import "./bchain.css";

// Aptos SDK
import { AptosClient } from "aptos";

const EnhancedAptosVerifier = () => {
  // State
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [userWallet, setUserWallet] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [nftOwnership, setNftOwnership] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentView, setCurrentView] = useState("projects");
  const [monthlyVerifications, setMonthlyVerifications] = useState(0);
  const [verifierProfile, setVerifierProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Config
  const APTOS_TESTNET_URL = "https://fullnode.testnet.aptoslabs.com/v1";
  const client = new AptosClient(APTOS_TESTNET_URL);
  const NFT_PRICE_APT = 1;
  const MAX_MONTHLY_VERIFICATIONS = 3;
  // this should be the on-chain module / contract address or collector address
  const BLOCKCHAIN_ADDRESS =
    "0x2c449df63159be31e0482f03613355693bacd22b58419dd0d85c342346a615b6";

  // load verifier profile + monthly usage
  const loadVerifierProfile = useCallback(
    async (walletAddress) => {
      if (!walletAddress) return;
      setLoading(true);
      try {
        const profileQuery = query(
          collection(db, "verifiers"),
          where("walletAddress", "==", walletAddress)
        );
        const profileSnapshot = await getDocs(profileQuery);
        let profile = null;
        if (!profileSnapshot.empty) {
          profile = {
            id: profileSnapshot.docs[0].id,
            ...profileSnapshot.docs[0].data(),
          };
        }

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let monthlyCount = 0;
        const projectsSnapshot = await getDocs(
          query(collection(db, "projects"))
        );
        projectsSnapshot.docs.forEach((ds) => {
          const project = ds.data();
          if (project.verifications) {
            project.verifications.forEach((v) => {
              // this expects submittedAt to be a serializable date or Firestore timestamp
              const submitted = v.submittedAt
                ? new Date(
                    v.submittedAt.seconds
                      ? v.submittedAt.seconds * 1000
                      : v.submittedAt
                  )
                : null;
              if (v.verifierId === walletAddress && submitted) {
                if (
                  submitted.getMonth() === currentMonth &&
                  submitted.getFullYear() === currentYear
                )
                  monthlyCount++;
              }
            });
          }
        });

        setVerifierProfile(profile);
        setMonthlyVerifications(monthlyCount);
      } catch (err) {
        console.error("Error loading verifier profile:", err);
        setError("Failed to load verifier profile");
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // check NFT ownership on-chain + firestore
  const checkNFTOwnership = useCallback(
    async (walletAddress) => {
      if (!walletAddress) return false;
      try {
        const resources = await client.getAccountResources(walletAddress);
        const hasVerifierNFT = resources.some(
          (r) =>
            r.type.includes("token") ||
            r.type.includes("NFT") ||
            r.type.includes("TokenStore")
        );

        const nftQuery = query(
          collection(db, "nft_purchases"),
          where("buyerAddress", "==", walletAddress),
          where("nftType", "==", "verifier_access")
        );
        const nftSnapshot = await getDocs(nftQuery);
        const hasPurchaseRecord = !nftSnapshot.empty;
        return hasVerifierNFT || hasPurchaseRecord;
      } catch (err) {
        console.error("Error checking NFT ownership:", err);
        return false;
      }
    },
    [client]
  );

  // connect to Petra (real) and load profile
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (!window.aptos)
        throw new Error("Petra Wallet not found. Install Petra and try again.");
      await window.aptos.connect();
      const account = await window.aptos.account();
      setUserWallet(account.address);

      const hasNFT = await checkNFTOwnership(account.address);
      setNftOwnership(hasNFT);
      setIsUserVerified(hasNFT);

      if (hasNFT) {
        setPaymentStatus("completed");
        await loadVerifierProfile(account.address);
      }
    } catch (err) {
      console.error("connectWallet error:", err);
      setError(err.message || "Wallet connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  // purchase access: simple transfer to collector address + firestore records
  const purchaseAccessNFT = async () => {
    setIsPurchasing(true);
    setPaymentStatus("processing");
    try {
      if (!userWallet) throw new Error("Wallet not connected");
      if (!window.aptos) throw new Error("Petra Wallet not available");

      // Build an Aptos coin transfer to the BLOCKCHAIN_ADDRESS (collector)
      const octas = (NFT_PRICE_APT * 1e8).toString(); // Aptos uses 10^8
      const txPayload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [BLOCKCHAIN_ADDRESS, octas],
      };

      const pendingTx = await window.aptos.signAndSubmitTransaction(txPayload);
      // wait for completion using SDK
      await client.waitForTransaction(pendingTx.hash);

      // add verifier profile in Firestore
      const verifierData = {
        walletAddress: userWallet,
        nftPurchaseDate: serverTimestamp(),
        verificationsCount: 0,
        totalRating: 0,
        status: "active",
        nftTokenId: `verifier_${Date.now()}`,
        purchasePrice: NFT_PRICE_APT,
      };
      await addDoc(collection(db, "verifiers"), verifierData);

      const purchaseRecord = {
        buyerAddress: userWallet,
        nftType: "verifier_access",
        price: NFT_PRICE_APT,
        purchaseDate: serverTimestamp(),
        transactionHash: pendingTx.hash,
        status: "completed",
      };
      await addDoc(collection(db, "nft_purchases"), purchaseRecord);

      setNftOwnership(true);
      setIsUserVerified(true);
      setPaymentStatus("completed");
      await loadVerifierProfile(userWallet);
    } catch (err) {
      console.error("purchaseAccessNFT error:", err);
      setError(err.message || "NFT purchase failed");
      setPaymentStatus("failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  // selection, verification complete handlers
  const handleSelectProject = (project) => {
    if (monthlyVerifications >= MAX_MONTHLY_VERIFICATIONS) {
      setError(
        `You have reached your monthly verification limit (${MAX_MONTHLY_VERIFICATIONS})`
      );
      return;
    }
    setSelectedProject(project);
    setCurrentView("verification");
  };

  // eslint-disable-next-line no-unused-vars
  const handleVerificationComplete = async (verification) => {
    try {
      setMonthlyVerifications((p) => p + 1);
      if (verifierProfile) {
        const verifierRef = doc(db, "verifiers", verifierProfile.id);
        await updateDoc(verifierRef, {
          verificationsCount: (verifierProfile.verificationsCount || 0) + 1,
          lastVerificationDate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // refresh project snapshot and if >=3 verifs, show blockchain view
      const projectsQ = query(
        collection(db, "projects"),
        where("__name__", "==", selectedProject.id)
      );
      const snap = await getDocs(projectsQ);
      if (!snap.empty) {
        const proj = { id: snap.docs[0].id, ...snap.docs[0].data() };
        if (proj.verifications && proj.verifications.length >= 3) {
          setSelectedProject(proj);
          setCurrentView("blockchain");
          return;
        }
      }
      setCurrentView("projects");
      setSelectedProject(null);
    } catch (err) {
      console.error("handleVerificationComplete error:", err);
      setError("Failed to update verification status");
    }
  };

  const handleBackToProjects = () => {
    setCurrentView("projects");
    setSelectedProject(null);
    setError(null);
  };

  useEffect(() => {
    if (userWallet && isUserVerified) {
      loadVerifierProfile(userWallet);
    }
  }, [userWallet, isUserVerified, loadVerifierProfile]);

  const formatAddress = (address) =>
    address ? `${address.slice(0, 10)}...${address.slice(-8)}` : "";

  // UI (keeps your original look + components)
  if (!isUserVerified) {
    return (
      <div className="fetch-veri-container">
        <div className="project-summary-card">
          <div className="summary-header">
            <Shield className="summary-icon" style={{ color: "#6366f1" }} />
            <div>
              <h2
                style={{
                  fontSize: "3rem",
                  fontWeight: "200",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                Premium Code Verifier
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "1.25rem",
                  margin: "0.5rem 0 0 0",
                }}
              >
                Professional blockchain code verification platform
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 1.5rem",
              background: "#fef3c7",
              color: "#f59e0b",
              borderRadius: "9999px",
              border: "1px solid #fbbf24",
              justifyContent: "center",
              marginTop: "2rem",
            }}
          >
            <Lock style={{ width: "1.5rem", height: "1.5rem" }} />
            Premium Access Required
          </div>
        </div>

        <div
          className="verification-summary-card"
          style={{ textAlign: "center", padding: "4rem" }}
        >
          <Shield
            style={{
              width: "120px",
              height: "120px",
              margin: "0 auto 2rem",
              color: "#6366f1",
            }}
          />
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "300",
              color: "#1e293b",
              marginBottom: "1rem",
            }}
          >
            Exclusive Verifier Access
          </h2>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#64748b",
              marginBottom: "2rem",
              lineHeight: "1.6",
            }}
          >
            Purchase a one-time access NFT to become a verified code reviewer.
            Earn rewards for helping secure the blockchain ecosystem.
          </p>

          <div
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)",
              border: "1px solid #f59e0b",
              borderRadius: "16px",
              padding: "2rem",
              margin: "2rem 0",
            }}
          >
            <div
              style={{
                marginBottom: "1rem",
                fontSize: "1.125rem",
                fontWeight: "500",
                color: "#92400e",
              }}
            >
              Verifier Access NFT
            </div>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "600",
                color: "#f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Award style={{ width: "3rem", height: "3rem" }} />{" "}
              {NFT_PRICE_APT} APT
            </div>
          </div>

          {!userWallet ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="upload-btn primary"
              style={{ maxWidth: "400px", margin: "0 auto" }}
            >
              {isConnecting ? (
                <RefreshCw className="btn-icon animate-pulse" />
              ) : (
                <Wallet className="btn-icon" />
              )}
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                  border: "1px solid #10b981",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <CheckCircle
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      color: "#059669",
                    }}
                  />
                  <span style={{ fontWeight: "500", color: "#059669" }}>
                    Wallet Connected
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.875rem",
                    color: "#374151",
                  }}
                >
                  {userWallet}
                </div>
              </div>

              {nftOwnership === false && (
                <button
                  onClick={purchaseAccessNFT}
                  disabled={isPurchasing || paymentStatus === "processing"}
                  className="upload-btn primary"
                  style={{ maxWidth: "400px", margin: "0 auto" }}
                >
                  {isPurchasing ? (
                    <RefreshCw className="btn-icon animate-pulse" />
                  ) : (
                    <CreditCard className="btn-icon" />
                  )}
                  {isPurchasing
                    ? "Processing Purchase..."
                    : `Purchase Access (${NFT_PRICE_APT} APT)`}
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="error-banner">
            <AlertTriangle className="error-icon" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="fetch-veri-container">
      <div className="verification-header">
        <div className="project-info">
          <h1 style={{ fontSize: "3rem", fontWeight: "200", margin: 0 }}>
            Code Verifier Dashboard
          </h1>
          <div className="project-meta">
            <span>
              <User className="meta-icon" />
              {formatAddress(userWallet)}
            </span>
            <span>
              <Calendar className="meta-icon" />
              Verified since {new Date().toLocaleDateString()}
            </span>
            <span>
              <Shield className="meta-icon" />
              Active Verifier
            </span>
          </div>
        </div>

        <div className="verification-status">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem 1.5rem",
                background: "#ecfdf5",
                color: "#059669",
                borderRadius: "9999px",
                border: "1px solid #10b981",
              }}
            >
              <Key style={{ width: "1.5rem", height: "1.5rem" }} /> Premium
              Access Active
            </div>
          </div>

          <div className="verifications-count">
            Monthly Usage: {monthlyVerifications}/{MAX_MONTHLY_VERIFICATIONS}
          </div>
          <div className="monthly-limit">
            {MAX_MONTHLY_VERIFICATIONS - monthlyVerifications} verifications
            remaining
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle className="error-icon" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: "auto",
              padding: "0.25rem",
              background: "none",
              border: "none",
              color: "#dc2626",
              cursor: "pointer",
            }}
          >
            <XCircle style={{ width: "1rem", height: "1rem" }} />
          </button>
        </div>
      )}

      <div className="project-summary-card">
        <div
          style={{
            display: "flex",
            gap: "1rem",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "1rem",
          }}
        >
          <button
            onClick={handleBackToProjects}
            className={
              currentView === "projects" ? "filter-btn active" : "filter-btn"
            }
          >
            Available Projects
          </button>
          <button
            onClick={() => selectedProject && setCurrentView("verification")}
            disabled={!selectedProject}
            className={
              currentView === "verification"
                ? "filter-btn active"
                : "filter-btn"
            }
          >
            {selectedProject ? "Current Verification" : "No Project Selected"}
          </button>
          <button
            onClick={() => {
              if (
                selectedProject &&
                selectedProject.verifications &&
                selectedProject.verifications.length >= 3
              )
                setCurrentView("blockchain");
            }}
            disabled={
              !selectedProject ||
              !selectedProject.verifications ||
              selectedProject.verifications.length < 3
            }
            className={
              currentView === "blockchain" ? "filter-btn active" : "filter-btn"
            }
          >
            Blockchain Upload
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner" />{" "}
          <span>Loading verifier data...</span>
        </div>
      )}

      {!loading && currentView === "projects" && (
        <FetchVeriData
          onSelectProject={handleSelectProject}
          userWallet={userWallet}
        />
      )}

      {!loading && currentView === "verification" && selectedProject && (
        <Verification
          project={selectedProject}
          userWallet={userWallet}
          onBack={handleBackToProjects}
          onVerificationComplete={handleVerificationComplete}
          monthlyVerifications={monthlyVerifications}
          maxMonthlyVerifications={MAX_MONTHLY_VERIFICATIONS}
        />
      )}

      {!loading && currentView === "blockchain" && selectedProject && (
        <PushToBchain
          project={selectedProject}
          userWallet={userWallet}
          client={client}
          blockchainAddress={BLOCKCHAIN_ADDRESS}
        />
      )}
    </div>
  );
};

export default EnhancedAptosVerifier;
