import React from "react";
import { Link } from "react-router-dom";

export const File404 = () => {
  return (
    <div className="f4">
      <h1>Oops!</h1>
      <p>404-Page not Found !</p>
      <Link to="/">Homepage</Link>
    </div>
  );
};
