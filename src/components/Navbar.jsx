import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App"; // Adjust path
// import { LogoutButton } from './LogoutButton'; // Make sure you have this component
import { WalletStatus } from "./WalletStatus"; // <-- 1. Import the new component
import "./style.css"; // Assuming you have a CSS file for styling
import { LogoutButton } from "./LogOutButton";

export const Navbar = () => {
  const { user } = useAuth();
  const explorerUrl = user
    ? `https://explorer.aptoslabs.com/account/${user.address}?network=testnet`
    : "#";

  return (
    <div className="navb">
      <nav className="nav">
        <div className="rg">
          <Link to="/business">Business</Link>
          <Link to="/evolvex-blockchain">Freelance</Link>
          <Link to="/rewards">Rewards</Link>
        </div>
        <Link to="/" className="logo">
          <h1>EVOLVEX</h1>
        </Link>
        <div className="lg">
          <Link to="/developer">Developer</Link>
          <Link to="/verifier">Verifier</Link>
          <Link to="/community">Community</Link>
          {/* Conditionally render based on user login status */}
          {user ? (
            // onclick send the user to
            // https://explorer.aptoslabs.com/account/0x0000000000000000000000000000000000000000000000000026fc6052404a78?network=testnet
            // where the address is the user's wallet address
            <div className="user-info">
              {user ? (
                <Link to={explorerUrl} target="_blank" rel="noopener noreferrer">
                  <WalletStatus />
                </Link>
              ) : (
                console.log("No user logged in")
              )}
              <LogoutButton />
            </div>
          ) : (
            console.log("No user logged in")
          )}
        </div>
      </nav>
    </div>
  );
};
