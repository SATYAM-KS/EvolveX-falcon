import React from "react";
import { memberData } from "../data/Member";
import rr1 from "../assets/action.jpg";
import cc2 from "../assets/cc2.png";
import c1 from "../assets/c1.png";
import { RiRobot3Line } from "react-icons/ri";
import { GiStumpRegrowth } from "react-icons/gi";
import { TbBusinessplan } from "react-icons/tb";
import { TbAutomation } from "react-icons/tb";

export const Documentation = () => {
  return (
    <div className="dwrp">
      <h1>DOCUMENTATION</h1>
      <p className="f">
        Evolvex AI is an advanced AI-powered multi-agent system designed to
        streamline software development workflows. By leveraging cutting-edge
        technologies like LangChain, AutoGen, Codium API, and
        Retrieval-Augmented Generation (RAG), it automates critical tasks such
        as code completion, bug detection, documentation generation, and
        intelligent knowledge retrieval. With a robust tech stack featuring
        Together AI (Mixtral-8x7B), ChromaDB, and FastAPI, Evolvex AI enhances
        efficiency, reduces manual effort, and empowers developers with
        AI-driven insights and automation.
      </p>
      <div className="igla1">
        <img src={c1} alt="c1" className="c1" />
        <div className="c2">
          <div>
            <RiRobot3Line />
            <p>Developer's Ai</p>
          </div>
          <div>
            <GiStumpRegrowth />
            <p>Business Analysis</p>
          </div>
          <div>
            <TbBusinessplan />
            <p>SAAS Trends</p>
          </div>
          <div>
            <TbAutomation />
            <p>Rag Implementation</p>
          </div>
        </div>
        <div className="c3"></div>
      </div>
      <p className="s">
        Evolvex AI is built on a modular architecture, integrating specialized
        AI agents to optimize software development. The RAG System efficiently
        loads, retrieves, and processes documents using ChromaDB for indexing
        and LLMChain for intelligent query handling. The Code Assistance Agents
        enhance coding efficiency with an AI-powered Code Completion Agent, a
        Bug Detection & Fixing Agent for automated debugging, and a Testing
        Generation Agent to improve test coverage. The Documentation Agents
        streamline project documentation through an AI-driven Docstring
        Generator and a README Generator for structured project overviews.
        Finally, Multi-Agent Collaboration ensures seamless coordination, with a
        Manager Agent overseeing tasks, while dedicated agents handle code
        accuracy, debugging, documentation, and knowledge retrieval.
      </p>
      <div className="igla2">
        <div className="cc1">
          <img src={rr1} alt="rr1" className="rr1" />
          <div className="rr2">
            <p>AI-Powered Multi-Agent Collaboration</p>
            <p>(RAG) for Smarter Development</p>
          </div>
        </div>
        <img src={cc2} alt="cc2" className="cc2" />
      </div>
      <div className="team">
        <h1>TEAM BEHIND EVOLVEX</h1>
        <div className="cards">
          {memberData.map((a, index) => (
            <div key={index} className="card">
              <img src={a.av} alt={a.name} />
              <h1>{a.name}</h1>
              <p>{a.role}</p>
              <p>{a.email}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
