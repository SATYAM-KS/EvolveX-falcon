import React, { useEffect, useState } from "react";
import { useAuth } from "../App"; // Adjust path as needed
import { useNavigate } from "react-router-dom";
import sorc from "../assets/trends.png";

export const Login = () => {
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleConnect = async () => {
    setError(""); // Reset any previous errors

    // 1. Check if the Petra wallet object exists on the window
    if (!window.aptos) {
      setError("Petra Wallet not found. Please install the extension.");
      // Optionally, redirect to the Petra website
      window.open("https://petra.app/", "_blank");
      return;
    }

    try {
      // 2. Connect to the wallet
      await window.aptos.connect();
      
      // 3. Get the user's account information
      const account = await window.aptos.account();

      // 4. Structure the user data and call your login function
      const userData = {
        address: account.address,
        publicKey: account.publicKey,
        wallet: "Petra", // Manually set the wallet name
      };

      login(userData);
      navigate("/"); // Redirect on successful login

    } catch (err) {
      // Handle errors, such as the user rejecting the connection
      console.error("Wallet connection error:", err);
      if (err.code === 4001) { // EIP-1193 user rejected request error
        setError("Connection request rejected by user.");
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="lplt">
        <h2>
          <span>EVOLVEX</span> <br /> CONNECT WALLET
        </h2>

        {/* This button now triggers our manual connection logic */}
        <button
          type="button"
          onClick={handleConnect}
          className="connect-wallet-btn"
        >
          Connect Petra Wallet
        </button>

        {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}

        <p style={{ marginTop: "20px", fontSize: "0.8rem", color: "gray" }}>
          By connecting your wallet, you agree to our Terms of Service.
        </p>
      </div>
      <img src={sorc} alt="Market Analysis" className="mrktan" />
    </div>
  );
};