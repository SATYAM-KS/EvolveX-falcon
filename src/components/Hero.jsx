import React from "react";
import Evo from "./Evo";
import TopProjects from "./TopProjects";
import { DocumentationLanding } from "./DocumentationLanding";


export const Hero = () => {
  return (
    <div className="heroContainer hero-container">
      <div className="wrao">
        <Evo />
      </div>
      <TopProjects />
      <DocumentationLanding />
    </div>
  );
};
