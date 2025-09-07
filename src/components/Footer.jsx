import React from "react";
import { Link } from "react-router-dom";
import vd from "../assets/back.mp4";

export const Footer = () => {
  return (
    <div className="fwrap">
      <video className="vdi" src={vd} autoPlay loop muted />
      <Link to="/">
        <h1>Evolvex</h1>
      </Link>
      <p>
        Evolvex AI is a next-gen AI-powered multi-agent system designed to
        revolutionize software development, business intelligence, and creative
        automation. By integrating advanced AI models, RAG, and autonomous
        agents, we streamline workflows, enhance productivity, and drive
        innovation. Experience the future of AI-driven efficiency with Evolvex
        AI.
      </p>
      <ul className="ls">
        <li>
          <Link to="/evolvex-code-agentic-ai">Developer</Link>
        </li>
        <li>
          <Link to="/evolvex-creative-business-ai">Business</Link>
        </li>
        <li>
          <Link to="/evolvex-documentation">Documentation</Link>
        </li>
      </ul>
      <p className="cpy">All right reserved - Falcons 2025</p>
    </div>
  );
};
