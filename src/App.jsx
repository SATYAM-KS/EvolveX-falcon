import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { File404 } from "./components/File404";
import { UnderDev } from "./components/UnderDev";
import { Hero } from "./components/Hero";
import { CiVolumeHigh, CiVolumeMute } from "react-icons/ci";
import mp3 from "./assets/bg.mp3";
import { Documentation } from "./components/Documentation";
import { Login } from "./components/Login";
import { Trend } from "./containers/Trend";
import { Blog } from "./containers/Blog";
import BlockFree from "./components/Block";
import Developer from "./components/Developer";
// import Verifier from "./components/Verifier";
import Library from "./components/Library";
import AptosVerifier from "./components/Verifier";
import EnhancedAptosVerifier from "./components/AptosVerifier";
import Rewards from "./components/Rewards";
import Community from "./components/Community";

// Create an Auth Context
const AuthContext = React.createContext();
const WalletContext = React.createContext();

function App() {
  const [isMuted, setIsMuted] = useState(true);
  const [user, setUser] = useState(null); // Store user data including email

  // Function to handle login
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Persist user data
  };
  const [walletAddr, setWalletAddr] = useState(null);

  const connectWallet = async () => {
    if (!window.aptos) return alert("Install Petra wallet");
    try {
      const res = await window.aptos.connect();
      setWalletAddr(res.address);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };
  const disconnectWallet = async () => {
    if (window.aptos) {
      await window.aptos.disconnect();
      setWalletAddr(null);
    }
  };
  // Function to handle logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Check for existing user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const BackgroundSound = () => {
    const audioRef = React.useRef(null);

    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.muted = isMuted;
        if (!isMuted) {
          audioRef.current
            .play()
            .catch((e) => console.log("Autoplay prevented:", e));
        }
      }
    }, []);
    return (
      <>
        <audio ref={audioRef} src={mp3} loop autoPlay muted={isMuted}>
          Your browser does not support the audio element.
        </audio>
        <button onClick={toggleMute} className="sound-toggle">
          {isMuted ? <CiVolumeMute /> : <CiVolumeHigh />}
        </button>
      </>
    );
  };

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user && location.pathname !== "/evolvex-signin") {
      return (
        <Navigate to="/evolvex-signin" state={{ from: location }} replace />
      );
    }
    return children;
  };
  useEffect(() => {
    window.addEventListener("beforeunload", logout);
    return () => window.removeEventListener("beforeunload", logout);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <WalletContext.Provider
        value={{ walletAddr, connectWallet, disconnectWallet }}
      >
        {" "}
        <BackgroundSound />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/evolvex-signin" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Hero />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evolvex-blockchain"
              element={
                <ProtectedRoute>
                  <BlockFree />
                </ProtectedRoute>
              }
            />

            <Route
              path="/evolvex-creative-agentic-ai"
              element={
                <ProtectedRoute>
                  <UnderDev />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evolvex-student-agentic-ai"
              element={
                <ProtectedRoute>
                  <UnderDev />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business"
              element={
                <ProtectedRoute>
                  <Trend />
                </ProtectedRoute>
              }
            />
            <Route path="/library/:id" element={<Library />} />
            <Route path="/blog/:id" element={<Blog />} />
            <Route
              path="/evolvex-documentation"
              element={
                <ProtectedRoute>
                  <Documentation />
                </ProtectedRoute>
              }
            />
            <Route path="/developer" element={<Developer />} />
            <Route path="/verifier" element={<EnhancedAptosVerifier />} />
            <Route 
              path="/rewards" 
              element={
                <ProtectedRoute>
                  <Rewards />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community" 
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<File404 />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </WalletContext.Provider>
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => React.useContext(AuthContext);
// eslint-disable-next-line react-refresh/only-export-components
export const useWallet = () => React.useContext(WalletContext); 

export default App;
