import React, { useState, useEffect } from "react";
import "./App.css";
import {
  fetchCurrentUser,
  fetchScanInfo,
  fetchDocuments,
  updateRedactionStatus,
  batchUpdateRedactions,
  addManualRedaction,
} from "./mockApi";
import PoliceReportModal from "./PoliceReportModal";
import Error from "./Error";
import Loading from "./Loading";
import undoIcon from "./undo.png";

function App() {
  const [documents, setDocuments] = useState([]);
  const [scanInfo, setScanInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedRows, setExpandedRows] = useState([1]);
  const [selectedRedactions, setSelectedRedactions] = useState([]);
  const [showPoliceReport, setShowPoliceReport] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      try {
        setLoading(true);
        setError(null);

        const userResponse = fetchCurrentUser();
        if (userResponse.success) {
          setCurrentUser(userResponse.data);
        }

        const caseResponse = fetchScanInfo();
        if (caseResponse.success) {
          setScanInfo(caseResponse.data);
        }

        const docsResponse = fetchDocuments();
        if (docsResponse.success) {
          setDocuments(docsResponse.data);
          console.log(docsResponse.data);
        } else {
          setError(docsResponse.message);
        }
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleRow = (docId) => {
    setExpandedRows((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleRedactionAction = (docId, redactionId, action) => {
    try {
      const response = updateRedactionStatus(
        docId,
        redactionId,
        action,
        currentUser
      );

      if (response.success) {
        // Update local state with the response data
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.id === docId ? response.data.document : doc
          )
        );
      } else {
        console.error("Failed to update redaction:", response.message);
      }
    } catch (err) {
      console.error("Error updating redaction:", err);
    }
  };

  const toggleRedactionSelection = (redactionId) => {
    setSelectedRedactions((prev) =>
      prev.includes(redactionId)
        ? prev.filter((id) => id !== redactionId)
        : [...prev, redactionId]
    );
  };

  const toggleSelectAllRedactions = (doc) => {
    const docRedactionIds = doc.redactions.map((r) => r.id);
    const allSelected = docRedactionIds.every((id) =>
      selectedRedactions.includes(id)
    );

    if (allSelected) {
      // Deselect all redactions for this document
      setSelectedRedactions((prev) =>
        prev.filter((id) => !docRedactionIds.includes(id))
      );
    } else {
      // Select all redactions for this document
      setSelectedRedactions((prev) => {
        const newSelections = [...prev];
        docRedactionIds.forEach((id) => {
          if (!newSelections.includes(id)) {
            newSelections.push(id);
          }
        });
        return newSelections;
      });
    }
  };

  const handleBulkAction = (documentId, status) => {
    if (selectedRedactions.length === 0) return;

    try {
      const response = batchUpdateRedactions(
        documentId,
        selectedRedactions,
        status,
        currentUser
      );

      if (response.success) {
        // Update local state with the response data
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.id === documentId ? response.data.document : doc
          )
        );
        // Clear selections after bulk action
        setSelectedRedactions([]);
      } else {
        console.error("Failed to bulk update redactions:", response.message);
      }
    } catch (err) {
      console.error("Error bulk updating redactions:", err);
    }
  };

  const handleApproveAllPending = (doc) => {
    const pendingRedactions = doc.redactions.filter(
      (red) => red.status === "pending" && !red.isManual
    );

    pendingRedactions.forEach((redaction) => {
      handleRedactionAction(doc.id, redaction.id, "approved");
    });
  };

  const handleRejectAllPending = (doc) => {
    const pendingRedactions = doc.redactions.filter(
      (red) => red.status === "pending" && !red.isManual
    );

    pendingRedactions.forEach((redaction) => {
      handleRedactionAction(doc.id, redaction.id, "rejected");
    });
  };

  const openPoliceReport = (doc, e) => {
    e.stopPropagation(); // Prevent row expansion
    setSelectedDocument(doc);
    setShowPoliceReport(true);
  };

  const closePoliceReport = () => {
    setShowPoliceReport(false);
    setSelectedDocument(null);
  };

  const handleAddManualRedaction = (documentId, redactionData) => {
    try {
      const response = addManualRedaction(
        documentId,
        redactionData,
        currentUser
      );

      if (response.success) {
        // Update local state with the response data
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.id === documentId ? response.data.document : doc
          )
        );
      } else {
        console.error("Failed to add manual redaction:", response.message);
      }
    } catch (err) {
      console.error("Error adding manual redaction:", err);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <div className="header-left">
            <h1 className="case-id">{scanInfo?.caseNumber || "Loading..."}</h1>
            <p className="scan-status">
              Scan Status: {scanInfo?.status || "Loading..."}
            </p>
          </div>
          <div className="header-right">
            {currentUser && (
              <div className="user-info">
                <div className="user-name">{currentUser.name}</div>
                <div className="user-badge">Badge #{currentUser.badge}</div>
              </div>
            )}
          </div>
        </div>

        {loading && <Loading />}

        {error && <Error error={error} />}

        {!loading && !error && (
          <>
            <div className="controls-section">
              <h2 className="section-title">Documents to review:</h2>
              <div className="controls">
                <select className="control-dropdown">
                  <option value="all">Category</option>
                  <option value="address">Address</option>
                  <option value="name">Name</option>
                  <option value="phone">Phone</option>
                </select>
                <select className="control-dropdown">
                  <option value="confidence">Sort By</option>
                  <option value="confidence-desc">
                    Confidence (High to Low)
                  </option>
                  <option value="confidence-asc">
                    Confidence (Low to High)
                  </option>
                  <option value="location">Location</option>
                </select>
                <select className="control-dropdown">
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
                <div className="col-confidence">AI Suggestion Strength</div>
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
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                          <path
                            d="M14 2v6h6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                          <path
                            d="M16 13H8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M16 17H8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10 9H8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
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
                      {/* Bulk Action Buttons */}
                      {selectedRedactions.length > 0 && (
                        <div className="bulk-actions">
                          <div className="bulk-actions-info">
                            <span className="selected-count">
                              {selectedRedactions.length} item
                              {selectedRedactions.length > 1 ? "s" : ""}{" "}
                              selected
                            </span>
                          </div>
                          <div className="bulk-actions-buttons">
                            <button
                              className="bulk-btn bulk-approve"
                              onClick={() =>
                                handleBulkAction(doc.id, "approved")
                              }
                            >
                              Redact All
                            </button>
                            <button
                              className="bulk-btn bulk-reject"
                              onClick={() =>
                                handleBulkAction(doc.id, "rejected")
                              }
                            >
                              Keep All
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="redactions-table">
                        <div className="redactions-header">
                          <div className="col-checkbox">
                            <input
                              type="checkbox"
                              checked={
                                doc.redactions.length > 0 &&
                                doc.redactions.every((r) =>
                                  selectedRedactions.includes(r.id)
                                )
                              }
                              onChange={() => toggleSelectAllRedactions(doc)}
                            />
                          </div>
                          <div className="col-heading">Text</div>
                          <div className="col-heading">Category</div>
                          <div className="col-heading">Location</div>
                          <div className="col-heading">AI Suggestion Strength</div>
                          <div className="col-heading">
                            Last Modified By
                          </div>
                          <div className="col-heading">Action</div>
                        </div>
                        {doc.redactions.map((redaction) => (
                          <div key={redaction.id} className="redaction-row">
                            <div className="col-checkbox">
                              <input
                                type="checkbox"
                                checked={selectedRedactions.includes(
                                  redaction.id
                                )}
                                onChange={() =>
                                  toggleRedactionSelection(redaction.id)
                                }
                              />
                            </div>
                            <div className="col-heading">{redaction.text}</div>
                            <div className="col-heading">
                              {redaction.category}
                            </div>
                            <div className="col-heading">
                              {redaction.location}
                            </div>
                            <div className="col-heading">
                              {redaction.isManual
                                ? "N/A"
                                : `${redaction.confidence}%`}
                            </div>
                            <div className="col-heading">
                              {redaction.isManual ? (
                                redaction.createdBy ? (
                                  <span
                                    className="user-info-cell"
                                    title={`Created by Badge #${
                                      redaction.createdByBadge
                                    } on ${new Date(
                                      redaction.createdAt
                                    ).toLocaleString()}`}
                                  >
                                    Badge #{redaction.createdByBadge}
                                  </span>
                                ) : (
                                  <span className="no-user-info">—</span>
                                )
                              ) : redaction.modifiedBy ? (
                                <span
                                  className="user-info-cell"
                                  title={`Modified by Badge #${
                                    redaction.modifiedByBadge
                                  } on ${new Date(
                                    redaction.modifiedAt
                                  ).toLocaleString()}`}
                                >
                                  Badge #{redaction.modifiedByBadge}
                                </span>
                              ) : (
                                <span className="no-user-info">—</span>
                              )}
                            </div>
                            <div className="col-action">
                              {redaction.isManual ? (
                                <span className="manual-badge">
                                  Manual Redaction
                                </span>
                              ) : redaction.status === "approved" ? (
                                <div className="status-with-undo">
                                  <span className="status-badge approved">
                                    Redacted
                                  </span>
                                  <button
                                    className="btn-undo"
                                    onClick={() =>
                                      handleRedactionAction(
                                        doc.id,
                                        redaction.id,
                                        "pending"
                                      )
                                    }
                                    title="Undo"
                                  >
                                    <img
                                      src={undoIcon}
                                      alt="Undo"
                                      className="undo-icon"
                                    />
                                  </button>
                                </div>
                              ) : redaction.status === "rejected" ? (
                                <div className="status-with-undo">
                                  <span className="status-badge rejected">
                                     Kept
                                  </span>
                                  <button
                                    className="btn-undo"
                                    onClick={() =>
                                      handleRedactionAction(
                                        doc.id,
                                        redaction.id,
                                        "pending"
                                      )
                                    }
                                    title="Undo"
                                  >
                                    <img
                                      src={undoIcon}
                                      alt="Undo"
                                      className="undo-icon"
                                    />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    className="btn-approve"
                                    onClick={() =>
                                      handleRedactionAction(
                                        doc.id,
                                        redaction.id,
                                        "approved"
                                      )
                                    }
                                  >
                                    Redact
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
                                  >
                                    Keep
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Approve All / Reject All buttons at bottom of redactions table */}
                      <div className="table-bottom-actions">
                        <button
                          className="table-approve-all-btn"
                          onClick={() => handleApproveAllPending(doc)}
                        >
                          Redact All Pending
                        </button>
                        <button
                          className="table-reject-all-btn"
                          onClick={() => handleRejectAllPending(doc)}
                        >
                          Keep All Pending
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <PoliceReportModal
        isOpen={showPoliceReport}
        onClose={closePoliceReport}
        selectedDocument={selectedDocument}
        documents={documents}
        onRedactionAction={handleRedactionAction}
        onAddManualRedaction={handleAddManualRedaction}
        // onRemoveManualRedaction={handleRemoveManualRedaction}
      />
    </div>
  );
}

export default App;
