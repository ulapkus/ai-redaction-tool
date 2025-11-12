import React from "react";

export default function PendingRedactionButtons({ document, onAction, className = "table" }) {
  const handleAllPending = (action) => {
    const pendingRedactions = document.redactions.filter(
      (red) => red.status === "pending" && !red.isManual
    );

    pendingRedactions.forEach((redaction) => {
      onAction(document.id, redaction.id, action);
    });
  };

  return (
    <div className={`${className}-bottom-actions`}>
      <button
        className={`${className}-approve-all-btn`}
        onClick={() => handleAllPending("approved")}
      >
        Redact All Pending
      </button>
      <button
        className={`${className}-reject-all-btn`}
        onClick={() => handleAllPending("rejected")}
      >
        Keep All Pending
      </button>
    </div>
  );
}