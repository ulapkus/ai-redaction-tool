import React, { useState } from "react";
import "../App.css";
import RedactableText from "./RedactableText";
import PendingRedactionButtons from "../components/PendingRedactionButtons";

export default function PoliceReportModal({
  isOpen,
  onClose,
  selectedDocument,
  documents,
  onRedactionAction,
  onAddManualRedaction,
}) {
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

  // closes the modal
  const handleClose = () => {
    setSelectionMenu({ show: false, x: 0, y: 0, text: "" });
    setRedactionActionMenu({ show: false, x: 0, y: 0, redaction: null });
    onClose();
  };

  // displays redact/keep buttons when clicking on a highlighted redaction in the document
  const handleRedactionClick = (text, event) => {
    event.stopPropagation();

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

  console.log(redactionActionMenu);

  // approve/reject redaction in the document
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

  // displays redaction button when highlighting in the document
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

  // handles the redaction button
  const handleRedactSelection = () => {
    if (selectionMenu.text) {

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
          <h3>Redaction Tool</h3>
          <p>Highlight any text to redact sensitive information</p>
        </div>

        {/* redact button when highlighting a phrase */}
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

        {/* render document content from the database */}
        {selectedDocument.documentData && (
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
                {selectedDocument.documentData.map((paragraph) => (
                  <p key={paragraph}>
                    <RedactableText
                      text={paragraph}
                      redactionList={currentDocument?.redactions || []}
                      onRedactionClick={handleRedactionClick}
                    />
                  </p>
                ))}
              </div>
            </div>

            {/* approve all/reject all buttons at bottom of document */}
            <PendingRedactionButtons
              document={currentDocument}
              onAction={onRedactionAction}
              className="document"
            />
          </div>
        )}
      </div>
    </div>
  );
}
