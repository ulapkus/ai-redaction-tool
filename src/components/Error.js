import React from "react";

const Error = ({ error }) => {
  return (
    <div className="error-container">
      <p className="error-message">⚠️ {error}</p>
      <button className="retry-btn" onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
};

export default Error;
