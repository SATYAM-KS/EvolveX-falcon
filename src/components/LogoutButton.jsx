import React from "react";
import { useAuth } from "../App"; // Adjust path
import { useNavigate } from "react-router-dom";
import { PiSignOut } from "react-icons/pi";

export const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Disconnect from the wallet if it's available
    if (window.aptos && (await window.aptos.isConnected())) {
      await window.aptos.disconnect();
    }

    // Call your app's logout function and redirect
    logout();
    navigate("/evolvex-signin");
  };

  return (
    <button onClick={handleLogout} className="logout-button-class">
      <PiSignOut />
    </button>
  );
};
