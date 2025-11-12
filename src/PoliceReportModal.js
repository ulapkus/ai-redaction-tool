import React, { useState } from "react";
import "./App.css";

// Helper component to render text with redactions
const RedactableText = ({
  text,
  redactedRanges,
  aiRedactions = [],
  onRedactionClick,
}) => {
  let parts = [text];

  // First, apply AI-detected redactions (yellow highlights - clickable)
  aiRedactions.forEach((redaction) => {
    const newParts = [];
    parts.forEach((part) => {
      if (typeof part === "string") {
        const segments = part.split(redaction.text);
        for (let i = 0; i < segments.length; i++) {
          newParts.push(segments[i]);
          if (i < segments.length - 1) {
            const className =
              redaction.status === "approved"
                ? "ai-redacted approved"
                : redaction.status === "rejected"
                ? "ai-redacted rejected"
                : "ai-redacted pending";

            const tooltipText =
              redaction.status === "approved"
                ? "Redacted"
                : redaction.status === "rejected"
                ? "Not Redacted"
                : "Pending Redaction";

            newParts.push(
              <span
                key={`ai-${redaction.id}-${i}`}
                className={className}
                onClick={(e) =>
                  onRedactionClick && onRedactionClick(redaction.text, e)
                }
                style={{
                  cursor:
                    redaction.status === "pending" ? "pointer" : "default",
                }}
                data-tooltip={tooltipText}
              >
                {redaction.text}
              </span>
            );
          }
        }
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });

  // Then, apply manual redactions (dark gray highlights)
  redactedRanges.forEach((redactedText) => {
    const newParts = [];
    parts.forEach((part) => {
      if (typeof part === "string") {
        const segments = part.split(redactedText);
        for (let i = 0; i < segments.length; i++) {
          newParts.push(segments[i]);
          if (i < segments.length - 1) {
            newParts.push(
              <span
                key={`manual-${redactedText}-${i}`}
                className="user-redacted"
                data-tooltip="Redacted"
              >
                {redactedText}
              </span>
            );
          }
        }
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });

  return <>{parts}</>;
};

function PoliceReportModal({
  isOpen,
  onClose,
  selectedDocument,
  documents,
  onRedactionAction,
  onAddManualRedaction,
}) {
  const [redactedRanges, setRedactedRanges] = useState([]);
  // this is the manually highlighted portion
  const [selectionMenu, setSelectionMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    text: "",
  });
  const [redactionActionMenu, setRedactionActionMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    redaction: null,
  });

  if (!isOpen || !selectedDocument) return null;

  const handleApproveAll = () => {
    const document = documents.find((doc) => doc.id === selectedDocument.id);
    const pendingRedactions = document?.redactions.filter(
      (red) => red.status === "pending" && !red.isManual
    );

    pendingRedactions?.forEach((redaction) => {
      onRedactionAction(selectedDocument.id, redaction.id, "approved");
    });
  };

  const handleRejectAll = () => {
    const document = documents.find((doc) => doc.id === selectedDocument.id);
    const pendingRedactions = document?.redactions.filter(
      (red) => red.status === "pending" && !red.isManual
    );

    pendingRedactions?.forEach((redaction) => {
      onRedactionAction(selectedDocument.id, redaction.id, "rejected");
    });
  };

  const handleClose = () => {
    setRedactedRanges([]);
    setSelectionMenu({ show: false, x: 0, y: 0, text: "" });
    setRedactionActionMenu({ show: false, x: 0, y: 0, redaction: null });
    onClose();
  };

  const handleRedactionClick = (text, event) => {
    event.stopPropagation();

    // Find the redaction in the current document
    const document = documents.find((doc) => doc.id === selectedDocument.id);
    const redaction = document?.redactions.find(
      (red) => red.text === text && !red.isManual
    );

    if (redaction && redaction.status === "pending") {
      const rect = event.target.getBoundingClientRect();
      setRedactionActionMenu({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.bottom + 5,
        redaction: redaction,
      });
    }
  };

  const handleRedactionQuickAction = (action) => {
    if (redactionActionMenu.redaction) {
      onRedactionAction(
        selectedDocument.id,
        redactionActionMenu.redaction.id,
        action
      );
      setRedactionActionMenu({ show: false, x: 0, y: 0, redaction: null });
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectionMenu({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        text: selectedText,
      });
    } else {
      setSelectionMenu({ show: false, x: 0, y: 0, text: "" });
    }
  };

  const handleRedactSelection = () => {
    if (selectionMenu.text) {
      // Add to redacted ranges for visual highlighting
      setRedactedRanges((prev) => [...prev, selectionMenu.text]);

      // Call parent callback to add manual redaction
      onAddManualRedaction(selectedDocument.id, {
        text: selectionMenu.text,
        location: "Police Report",
      });

      setSelectionMenu({ show: false, x: 0, y: 0, text: "" });
      window.getSelection().removeAllRanges();
    }
  };

  const currentDocument = documents.find((d) => d.id === selectedDocument.id);

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          ✕
        </button>

        <div className="redaction-controls">
          <div className="redaction-info">
            <h3>Redaction Tool</h3>
            <p>Highlight any text to redact sensitive information</p>
          </div>
        </div>

        {/* redaction option when highlighting a phrase */}
        {selectionMenu.show && (
          <div
            className="selection-menu"
            style={{
              position: "fixed",
              left: `${selectionMenu.x}px`,
              top: `${selectionMenu.y}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <button className="redact-btn" onClick={handleRedactSelection}>
              Redact
            </button>
          </div>
        )}

        {/* approve/reject options in document */}
        {redactionActionMenu.show && (
          <div
            className="redaction-action-menu"
            style={{
              position: "fixed",
              left: `${redactionActionMenu.x}px`,
              top: `${redactionActionMenu.y}px`,
              transform: "translateX(-50%)",
            }}
          >
            <button
              className="quick-approve-btn"
              onClick={() => handleRedactionQuickAction("approved")}
            >
              Redact
            </button>
            <button
              className="quick-reject-btn"
              onClick={() => handleRedactionQuickAction("rejected")}
            >
              Keep
            </button>
          </div>
        )}

        <div
          className="police-report"
          onMouseUp={handleTextSelection}
          onClick={() =>
            setRedactionActionMenu({
              show: false,
              x: 0,
              y: 0,
              redaction: null,
            })
          }
        >
          <h1>POLICE INCIDENT REPORT</h1>
          <div className="report-section">
            <h2>NARRATIVE</h2>
            <div className="narrative-text">
              <p>
                <RedactableText
                  text="On October 14, 2024, at approximately 22:45 hours, I, Officer Sarah Martinez, Badge #4571, was dispatched to 123 Sydney Street in response to a domestic disturbance call. Dispatch advised that a neighbor reported hearing loud arguing and what sounded like objects being thrown."
                  redactedRanges={redactedRanges}
                  aiRedactions={currentDocument?.redactions || []}
                  onRedactionClick={handleRedactionClick}
                />
              </p>
              <p>
                <RedactableText
                  text="Upon arrival at 22:52 hours, I observed the front door was partially open. I announced my presence and was greeted by the victim, identified as Emily Rodriguez (DOB: 03/22/1987). The victim appeared visibly distressed, with tears streaming down her face. I observed a fresh bruise forming on her left cheek and redness around her neck area."
                  redactedRanges={redactedRanges}
                  aiRedactions={currentDocument?.redactions || []}
                  onRedactionClick={handleRedactionClick}
                />
              </p>
              <p>
                <RedactableText
                  text="The victim stated that her husband, Michael Rodriguez (DOB: 07/15/1985), had become enraged during an argument about finances. She reported that he grabbed her by the throat and pushed her against the wall. She stated that he then struck her in the face with an open hand. The victim also reported that the suspect threw a glass vase, which shattered against the wall near where she was standing."
                  redactedRanges={redactedRanges}
                  aiRedactions={currentDocument?.redactions || []}
                  onRedactionClick={handleRedactionClick}
                />
              </p>
              <p>
                <RedactableText
                  text="I observed broken glass on the living room floor and a hole in the drywall consistent with the victim's statement. The suspect was located in the bedroom and was detained without incident. The suspect appeared to be under the influence of alcohol, exhibiting slurred speech and the odor of an alcoholic beverage on his breath."
                  redactedRanges={redactedRanges}
                  aiRedactions={currentDocument?.redactions || []}
                  onRedactionClick={handleRedactionClick}
                />
              </p>
              <p>
                <RedactableText
                  text="The suspect declined to provide a statement and requested legal counsel. Medical assistance was offered to the victim, who initially declined but later agreed to be photographed for evidence documentation. Photos were taken of visible injuries and the crime scene."
                  redactedRanges={redactedRanges}
                  aiRedactions={currentDocument?.redactions || []}
                  onRedactionClick={handleRedactionClick}
                />
              </p>
              <p>
                <RedactableText
                  text="A witness, Jennifer Thompson, residing at 125 Sydney Street, provided a statement indicating she heard loud arguing and the sound of breaking glass at approximately 22:40 hours. She stated she called 911 out of concern for her neighbor's safety."
                  redactedRanges={redactedRanges}
                  aiRedactions={currentDocument?.redactions || []}
                  onRedactionClick={handleRedactionClick}
                />
              </p>
              <p>
                <RedactableText
                  text="The suspect was placed under arrest for Domestic Violence - Assault in the Third Degree and Endangering Welfare. He was transported to Greenville Police Department for booking and processing. The victim was provided with information regarding victim services and a restraining order process."
                  redactedRanges={redactedRanges}
                  aiRedactions={currentDocument?.redactions || []}
                  onRedactionClick={handleRedactionClick}
                />
              </p>
            </div>
          </div>

          {/* Approve All / Reject All buttons at bottom of document */}
          <div className="document-bottom-actions">
            <button
              className="document-approve-all-btn"
              onClick={handleApproveAll}
            >
              Redact All Pending
            </button>
            <button
              className="document-reject-all-btn"
              onClick={handleRejectAll}
            >
              Keep All Pending
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoliceReportModal;
