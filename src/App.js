import React, { useState } from "react";
import "./App.css";

// Helper component to render text with redactions
const RedactableText = ({ text, redactedRanges }) => {
  let parts = [text];

  // Split text by redacted ranges
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
                key={`redacted-${redactedText}-${i}`}
                className="user-redacted"
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

// Sample data structure
const initialDocuments = [
  {
    id: 1,
    fileName: "DVReport.pdf",
    reviewStatus: "In progress",
    redactionsDetected: 42,
    redactionsApplied: 42,
    confidenceLevel: 96,
    redactions: [
      {
        id: 1,
        text: "123 Sydney St...",
        category: "Address",
        location: "Page 3, Line 12",
        confidence: 96,
        status: "pending",
      },
      {
        id: 2,
        text: "123 Sydney St...",
        category: "Address",
        location: "Page 3, Line 12",
        confidence: 96,
        status: "pending",
      },
      {
        id: 3,
        text: "123 Sydney St...",
        category: "Address",
        location: "Page 3, Line 12",
        confidence: 96,
        status: "pending",
      },
      {
        id: 4,
        text: "John Smith",
        category: "Name",
        location: "Page 1, Line 5",
        confidence: 98,
        status: "pending",
      },
      {
        id: 5,
        text: "555-1234",
        category: "Phone",
        location: "Page 2, Line 8",
        confidence: 92,
        status: "pending",
      },
    ],
  },
  {
    id: 2,
    fileName: "DVReport.pdf",
    reviewStatus: "In progress",
    redactionsDetected: 42,
    redactionsApplied: 42,
    confidenceLevel: 96,
    redactions: [
      {
        id: 6,
        text: "456 Main Ave...",
        category: "Address",
        location: "Page 1, Line 3",
        confidence: 94,
        status: "pending",
      },
      {
        id: 7,
        text: "Jane Doe",
        category: "Name",
        location: "Page 2, Line 15",
        confidence: 97,
        status: "pending",
      },
    ],
  },
  {
    id: 3,
    fileName: "DVReport.pdf",
    reviewStatus: "In progress",
    redactionsDetected: 42,
    redactionsApplied: 42,
    confidenceLevel: 96,
    redactions: [
      {
        id: 8,
        text: "789 Park Blvd...",
        category: "Address",
        location: "Page 4, Line 20",
        confidence: 95,
        status: "pending",
      },
    ],
  },
];

function App() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [expandedRows, setExpandedRows] = useState([1]); // First row expanded by default
  const [selectedRedactions, setSelectedRedactions] = useState([]);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("confidence");
  const [confidenceThreshold, setConfidenceThreshold] = useState("90");
  const [showPoliceReport, setShowPoliceReport] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [redactedRanges, setRedactedRanges] = useState([]);
  const [selectionMenu, setSelectionMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    text: "",
  });

  const toggleRow = (docId) => {
    setExpandedRows((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleRedactionAction = (docId, redactionId, action) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              redactions: doc.redactions.map((red) =>
                red.id === redactionId ? { ...red, status: action } : red
              ),
            }
          : doc
      )
    );
  };

  const toggleRedactionSelection = (redactionId) => {
    setSelectedRedactions((prev) =>
      prev.includes(redactionId)
        ? prev.filter((id) => id !== redactionId)
        : [...prev, redactionId]
    );
  };

  const openPoliceReport = (doc, e) => {
    e.stopPropagation(); // Prevent row expansion
    setSelectedDocument(doc);
    setShowPoliceReport(true);
  };

  const closePoliceReport = () => {
    setShowPoliceReport(false);
    setSelectedDocument(null);
    setRedactedRanges([]);
    setSelectionMenu({ show: false, x: 0, y: 0, text: "" });
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
    if (selectionMenu.text && selectedDocument) {
      // Add to redacted ranges for visual highlighting
      setRedactedRanges((prev) => [...prev, selectionMenu.text]);

      // Add to the document's redactions list
      setDocuments((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === selectedDocument.id
            ? {
                ...doc,
                redactionsDetected: doc.redactionsDetected + 1,
                redactionsApplied: doc.redactionsApplied + 1,
                redactions: [
                  ...doc.redactions,
                  {
                    id: Date.now(), // Unique ID based on timestamp
                    text: selectionMenu.text,
                    category: "Manual",
                    location: "Police Report",
                    confidence: "N/A",
                    status: "accepted",
                    isManual: true,
                  },
                ],
              }
            : doc
        )
      );

      setSelectionMenu({ show: false, x: 0, y: 0, text: "" });
      window.getSelection().removeAllRanges();
    }
  };

  const handleUndoRedaction = (text) => {
    // Remove from visual redaction ranges
    setRedactedRanges((prev) => {
      const index = prev.indexOf(text);
      if (index > -1) {
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      }
      return prev;
    });

    // Remove from document's redactions list
    if (selectedDocument) {
      setDocuments((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === selectedDocument.id
            ? {
                ...doc,
                redactionsDetected: Math.max(0, doc.redactionsDetected - 1),
                redactionsApplied: Math.max(0, doc.redactionsApplied - 1),
                redactions: doc.redactions.filter(
                  (red) => !(red.isManual && red.text === text)
                ),
              }
            : doc
        )
      );
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1 className="case-id">GHP-21329</h1>
          <p className="scan-status">Scan Status: Complete</p>
        </div>

        <div className="controls-section">
          <h2 className="section-title">Documents to review:</h2>
          <div className="controls">
            <select
              className="control-dropdown"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">Category</option>
              <option value="address">Address</option>
              <option value="name">Name</option>
              <option value="phone">Phone</option>
            </select>
            <select
              className="control-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="confidence">Sort By</option>
              <option value="confidence-desc">Confidence (High to Low)</option>
              <option value="confidence-asc">Confidence (Low to High)</option>
              <option value="location">Location</option>
            </select>
            <select
              className="control-dropdown"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(e.target.value)}
            >
              <option value="90">Confidence Threshold</option>
              <option value="95">95%+</option>
              <option value="90">90%+</option>
              <option value="85">85%+</option>
              <option value="80">80%+</option>
            </select>
          </div>
        </div>

        <div className="documents-table">
          <div className="table-header">
            <div className="col-view">View Document</div>
            <div className="col-filename">File Name</div>
            <div className="col-status">Review Status</div>
            <div className="col-detected">Redactions Detected</div>
            <div className="col-applied">Redactions Applied</div>
            <div className="col-confidence">Overall Confidence Level</div>
          </div>

          {documents.map((doc) => (
            <div key={doc.id} className="document-row-wrapper">
              <div
                className={`document-row ${
                  expandedRows.includes(doc.id) ? "expanded" : ""
                }`}
                onClick={() => toggleRow(doc.id)}
              >
                <div className="col-view">
                  <span
                    className="icon-document"
                    onClick={(e) => openPoliceReport(doc, e)}
                  >
                    📄
                  </span>
                  <span
                    className={`expand-icon ${
                      expandedRows.includes(doc.id) ? "expanded" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
                <div className="col-filename">{doc.fileName}</div>
                <div className="col-status">{doc.reviewStatus}</div>
                <div className="col-detected">{doc.redactionsDetected}</div>
                <div className="col-applied">{doc.redactionsApplied}</div>
                <div className="col-confidence">{doc.confidenceLevel}%</div>
              </div>

              {expandedRows.includes(doc.id) && (
                <div className="redactions-detail">
                  <div className="redactions-table">
                    <div className="redactions-header">
                      <div className="col-checkbox"></div>
                      <div className="col-text">Text</div>
                      <div className="col-category">Category</div>
                      <div className="col-location">Location</div>
                      <div className="col-conf">Confidence Level</div>
                      <div className="col-action">Action</div>
                    </div>
                    {doc.redactions.map((redaction) => (
                      <div key={redaction.id} className="redaction-row">
                        <div className="col-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedRedactions.includes(redaction.id)}
                            onChange={() =>
                              toggleRedactionSelection(redaction.id)
                            }
                          />
                        </div>
                        <div className="col-text">{redaction.text}</div>
                        <div className="col-category">{redaction.category}</div>
                        <div className="col-location">{redaction.location}</div>
                        <div className="col-conf">
                          {redaction.isManual
                            ? "N/A"
                            : `${redaction.confidence}%`}
                        </div>
                        <div className="col-action">
                          {redaction.isManual ? (
                            <span className="manual-badge">
                              Manual Addition
                            </span>
                          ) : (
                            <>
                              <button
                                className="btn-accept"
                                onClick={() =>
                                  handleRedactionAction(
                                    doc.id,
                                    redaction.id,
                                    "accepted"
                                  )
                                }
                                disabled={redaction.status === "accepted"}
                              >
                                Accept
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() =>
                                  handleRedactionAction(
                                    doc.id,
                                    redaction.id,
                                    "rejected"
                                  )
                                }
                                disabled={redaction.status === "rejected"}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showPoliceReport && (
        <div className="modal-overlay" onClick={closePoliceReport}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePoliceReport}>
              ✕
            </button>

            {/* Redaction Controls */}
            <div className="redaction-controls">
              <div className="redaction-info">
                <h3>Redaction Tool</h3>
                <p>Highlight any text to redact sensitive information</p>
                {redactedRanges.length > 0 && (
                  <div className="redacted-items">
                    <strong>Redacted Items ({redactedRanges.length}):</strong>
                    <div className="redacted-list">
                      {redactedRanges.map((text, index) => (
                        <div key={index} className="redacted-item">
                          <span className="redacted-text">{text}</span>
                          <button
                            className="undo-btn"
                            onClick={() => handleUndoRedaction(text)}
                            title="Undo redaction"
                          >
                            ↶
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selection Menu */}
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
                  🔒 Redact
                </button>
              </div>
            )}

            <div className="police-report" onMouseUp={handleTextSelection}>
              <div className="report-header">
                <h1>POLICE INCIDENT REPORT</h1>
                <div className="agency-info">
                  <p>
                    <strong>GREENVILLE POLICE DEPARTMENT</strong>
                  </p>
                  <p>123 Main Street, Greenville, State 12345</p>
                  <p>Emergency: 911 | Non-Emergency: (555) 123-4567</p>
                </div>
              </div>

              <div className="report-section">
                <h2>INCIDENT INFORMATION</h2>
                <div className="report-grid">
                  <div className="report-field">
                    <span className="field-label">Case Number:</span>
                    <span className="field-value">GHP-21329</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Report Date:</span>
                    <span className="field-value">October 15, 2024</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Incident Date:</span>
                    <span className="field-value">October 14, 2024</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Time of Incident:</span>
                    <span className="field-value">22:45 hours</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Incident Type:</span>
                    <span className="field-value">Domestic Violence</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Location:</span>
                    <span className="field-value redacted">
                      123 Sydney Street, Greenville, ST 12345
                    </span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h2>REPORTING OFFICER</h2>
                <div className="report-grid">
                  <div className="report-field">
                    <span className="field-label">Officer Name:</span>
                    <span className="field-value">Officer Sarah Martinez</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Badge Number:</span>
                    <span className="field-value">4571</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Unit/Division:</span>
                    <span className="field-value">
                      Patrol Division - Unit 23
                    </span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h2>PARTIES INVOLVED</h2>

                <h3>Victim Information</h3>
                <div className="report-grid">
                  <div className="report-field">
                    <span className="field-label">Name:</span>
                    <span className="field-value redacted">
                      Emily Rodriguez
                    </span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">DOB:</span>
                    <span className="field-value redacted">03/22/1987</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Address:</span>
                    <span className="field-value redacted">
                      123 Sydney Street, Greenville, ST 12345
                    </span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Phone:</span>
                    <span className="field-value redacted">(555) 123-4567</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Race/Ethnicity:</span>
                    <span className="field-value">Hispanic</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Gender:</span>
                    <span className="field-value">Female</span>
                  </div>
                </div>

                <h3>Suspect Information</h3>
                <div className="report-grid">
                  <div className="report-field">
                    <span className="field-label">Name:</span>
                    <span className="field-value redacted">
                      Michael Rodriguez
                    </span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">DOB:</span>
                    <span className="field-value redacted">07/15/1985</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Address:</span>
                    <span className="field-value redacted">
                      123 Sydney Street, Greenville, ST 12345
                    </span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Phone:</span>
                    <span className="field-value redacted">(555) 987-6543</span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Relationship to Victim:</span>
                    <span className="field-value">Spouse</span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h2>WITNESS INFORMATION</h2>
                <div className="report-grid">
                  <div className="report-field">
                    <span className="field-label">Witness 1:</span>
                    <span className="field-value redacted">
                      Jennifer Thompson
                    </span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Address:</span>
                    <span className="field-value redacted">
                      125 Sydney Street, Greenville, ST 12345
                    </span>
                  </div>
                  <div className="report-field">
                    <span className="field-label">Phone:</span>
                    <span className="field-value redacted">(555) 234-5678</span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h2>NARRATIVE</h2>
                <div className="narrative-text">
                  <p>
                    <RedactableText
                      text="On October 14, 2024, at approximately 22:45 hours, I, Officer Sarah Martinez, Badge #4571, was dispatched to 123 Sydney Street in response to a domestic disturbance call. Dispatch advised that a neighbor reported hearing loud arguing and what sounded like objects being thrown."
                      redactedRanges={redactedRanges}
                    />
                  </p>
                  <p>
                    <RedactableText
                      text="Upon arrival at 22:52 hours, I observed the front door was partially open. I announced my presence and was greeted by the victim, identified as Emily Rodriguez (DOB: 03/22/1987). The victim appeared visibly distressed, with tears streaming down her face. I observed a fresh bruise forming on her left cheek and redness around her neck area."
                      redactedRanges={redactedRanges}
                    />
                  </p>
                  <p>
                    <RedactableText
                      text="The victim stated that her husband, Michael Rodriguez (DOB: 07/15/1985), had become enraged during an argument about finances. She reported that he grabbed her by the throat and pushed her against the wall. She stated that he then struck her in the face with an open hand. The victim also reported that the suspect threw a glass vase, which shattered against the wall near where she was standing."
                      redactedRanges={redactedRanges}
                    />
                  </p>
                  <p>
                    <RedactableText
                      text="I observed broken glass on the living room floor and a hole in the drywall consistent with the victim's statement. The suspect was located in the bedroom and was detained without incident. The suspect appeared to be under the influence of alcohol, exhibiting slurred speech and the odor of an alcoholic beverage on his breath."
                      redactedRanges={redactedRanges}
                    />
                  </p>
                  <p>
                    <RedactableText
                      text="The suspect declined to provide a statement and requested legal counsel. Medical assistance was offered to the victim, who initially declined but later agreed to be photographed for evidence documentation. Photos were taken of visible injuries and the crime scene."
                      redactedRanges={redactedRanges}
                    />
                  </p>
                  <p>
                    <RedactableText
                      text="A witness, Jennifer Thompson, residing at 125 Sydney Street, provided a statement indicating she heard loud arguing and the sound of breaking glass at approximately 22:40 hours. She stated she called 911 out of concern for her neighbor's safety."
                      redactedRanges={redactedRanges}
                    />
                  </p>
                  <p>
                    <RedactableText
                      text="The suspect was placed under arrest for Domestic Violence - Assault in the Third Degree and Endangering Welfare. He was transported to Greenville Police Department for booking and processing. The victim was provided with information regarding victim services and a restraining order process."
                      redactedRanges={redactedRanges}
                    />
                  </p>
                </div>
              </div>

              <div className="report-section">
                <h2>EVIDENCE COLLECTED</h2>
                <ul className="evidence-list">
                  <li>Digital photographs of victim's injuries (12 photos)</li>
                  <li>Digital photographs of crime scene (18 photos)</li>
                  <li>
                    Broken glass fragments from vase (collected and tagged)
                  </li>
                  <li>Victim's written statement</li>
                  <li>
                    Witness statement from{" "}
                    <span className="redacted">Jennifer Thompson</span>
                  </li>
                  <li>911 call recording</li>
                </ul>
              </div>

              <div className="report-section">
                <h2>ACTIONS TAKEN</h2>
                <ul className="actions-list">
                  <li>Suspect arrested and transported to GPD headquarters</li>
                  <li>Victim provided with victim advocacy information</li>
                  <li>Crime scene photographed and documented</li>
                  <li>Evidence collected and secured</li>
                  <li>Witness statement obtained</li>
                  <li>Emergency protective order filed</li>
                  <li>
                    Case forwarded to District Attorney's Office for prosecution
                  </li>
                </ul>
              </div>

              <div className="report-footer">
                <div className="signature-block">
                  <p>
                    <strong>Officer Signature:</strong> ___Sarah Martinez___
                  </p>
                  <p>
                    <strong>Badge Number:</strong> 4571
                  </p>
                  <p>
                    <strong>Date:</strong> October 15, 2024
                  </p>
                </div>
                <div className="signature-block">
                  <p>
                    <strong>Supervisor Review:</strong> ___Lieutenant James
                    Harrison___
                  </p>
                  <p>
                    <strong>Badge Number:</strong> 2103
                  </p>
                  <p>
                    <strong>Date:</strong> October 15, 2024
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
