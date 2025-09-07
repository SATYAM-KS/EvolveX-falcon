import React, { useState, useEffect } from 'react';
import { useAuth } from '../App'; // Adjust path if needed

export const WalletStatus = () => {
  const { user } = useAuth(); // Get user from your app's auth context
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Function to check connection status
    const checkWalletConnection = async () => {
      // Check only if the user is logged into your app
      if (user && window.aptos) {
        const connected = await window.aptos.isConnected();
        setIsConnected(connected);
      } else {
        setIsConnected(false);
      }
    };

    checkWalletConnection();
  }, [user]); // Re-check whenever the user's auth status changes

  // Don't render anything if not connected or no user
  if (!user || !isConnected) {
    return null;
  }

  // Render the connected status and address
  return (
    <div className="wallet-status">
      <span>{`${user.address.slice(0, 6)}...${user.address.slice(-4)}`}</span>
    </div>
  );
};