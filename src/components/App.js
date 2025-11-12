import React, { useState, useEffect } from "react";
import "../App.css";
import {
  fetchCurrentUser,
  fetchScanInfo,
  fetchDocuments,
  updateRedactionStatus,
  batchUpdateRedactions,
  addManualRedaction,
} from "../utils/mockApi";
import PoliceReportModal from "../components/PoliceReportModal";
import Error from "../components/Error";
import Loading from "../components/Loading";
import PendingRedactionButtons from "../components/PendingRedactionButtons";
import undoIcon from "../assets/undo.png";
import arrowIcon from "../assets/arrow.png";
import filterIcon from "../assets/filter.png";
import fileIcon from "../assets/file.png";

export default function App() {
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

  const handleApiResponse = (response, docId, errorMessage) => {
    if (response.success) {
      setDocuments((prevDocs) =>
        prevDocs.map((doc) => (doc.id === docId ? response.data.document : doc))
      );
      return true;
    } else {
      console.error(errorMessage, response.message);
      return false;
    }
  };

  const handleRedactionAction = (docId, redactionId, action) => {
    try {
      const response = updateRedactionStatus(
        docId,
        redactionId,
        action,
        currentUser
      );
      handleApiResponse(response, docId, "Failed to update redaction:");
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
      // deselect all redactions for document
      setSelectedRedactions((prev) =>
        prev.filter((id) => !docRedactionIds.includes(id))
      );
    } else {
      // select all redactions for document
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

      if (
        handleApiResponse(
          response,
          documentId,
          "Failed to bulk update redactions:"
        )
      ) {
        setSelectedRedactions([]);
      }
    } catch (err) {
      console.error("Error bulk updating redactions:", err);
    }
  };

  const openPoliceReport = (doc, e) => {
    e.stopPropagation();
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
      handleApiResponse(
        response,
        documentId,
        "Failed to add manual redaction:"
      );
    } catch (err) {
      console.error("Error adding manual redaction:", err);
    }
  };

  const renderStatusBadgeWithUndo = (status, docId, redactionId) => {
    const statusLabel = status === "approved" ? "Redacted" : "Kept";
    const statusClass = status === "approved" ? "approved" : "rejected";

    return (
      <div className="status-with-undo">
        <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
        <button
          className="btn-undo"
          onClick={() => handleRedactionAction(docId, redactionId, "pending")}
        >
          <img src={undoIcon} alt="Undo" className="undo-icon" />
        </button>
      </div>
    );
  };

  const renderUserInfo = (redaction) => {
    if (redaction.isManual) {
      return redaction.createdBy ? (
        <span className="user-info-cell">
          Badge #{redaction.createdByBadge}
        </span>
      ) : (
        <span className="no-user-info">—</span>
      );
    }
    return redaction.modifiedBy ? (
      <span className="user-info-cell">Badge #{redaction.modifiedByBadge}</span>
    ) : (
      <span className="no-user-info">—</span>
    );
  };

  const renderRedactionAction = (redaction, docId) => {
    if (redaction.isManual) {
      return <div className="manual-badge">Manual Redaction</div>;
    }

    if (redaction.status === "approved" || redaction.status === "rejected") {
      return renderStatusBadgeWithUndo(redaction.status, docId, redaction.id);
    }

    return (
      <>
        <button
          className="btn-approve"
          onClick={() => handleRedactionAction(docId, redaction.id, "approved")}
        >
          Redact
        </button>
        <button
          className="btn-reject"
          onClick={() => handleRedactionAction(docId, redaction.id, "rejected")}
        >
          Keep
        </button>
      </>
    );
  };

  const tableHeaders = [
    "File Name",
    "Review Status",
    "Redactions Detected",
    "Redactions Applied",
    "AI Suggestion Strength",
  ];

  const redactionsTableHeaders = [
    "Text",
    "Category",
    "Location",
    "AI Suggestion Strength",
    "Last Modified By",
    "Action",
  ];

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
            </div>

            <div className="documents-table">
              <div className="table-header">
                {tableHeaders.map((item) => (
                  <div className="col-main" key={item}>
                    {item}
                  </div>
                ))}
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
                        className={`expand-icon ${
                          expandedRows.includes(doc.id) ? "expanded" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                    <div className="col-file">
                      <span
                        className="filename-link"
                        onClick={(e) => openPoliceReport(doc, e)}
                      >
                        <img src={fileIcon} alt="File" className="file-icon" />
                        {doc.fileName}
                      </span>
                    </div>
                    <div className="col-main">{doc.reviewStatus}</div>
                    <div className="col-main">{doc.redactionsDetected}</div>
                    <div className="col-main">{doc.redactionsApplied}</div>
                    <div className="col-main">{doc.confidenceLevel}%</div>
                  </div>

                  {expandedRows.includes(doc.id) && (
                    <div className="redactions-detail">
                      {/* bulk action buttons */}
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
                              Redact Selected
                            </button>
                            <button
                              className="bulk-btn bulk-reject"
                              onClick={() =>
                                handleBulkAction(doc.id, "rejected")
                              }
                            >
                              Keep Selected
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
                          {redactionsTableHeaders.map((item) => (
                            <div className="col-heading" key={item}>
                              {item}
                              <img
                                src={arrowIcon}
                                alt="Arrow"
                                className="arrow-icon"
                              />
                            </div>
                          ))}
                          <div className="col-heading">
                            <img
                              src={filterIcon}
                              alt="Filter"
                              className="filter-icon"
                            />
                          </div>
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
                            <div className="table-text">{redaction.text}</div>
                            <div className="table-text">
                              {redaction.category}
                            </div>
                            <div className="table-text">
                              {redaction.location}
                            </div>
                            <div className="table-text">
                              {redaction.isManual
                                ? "N/A"
                                : `${redaction.confidence}%`}
                            </div>
                            <div className="table-text">
                              {renderUserInfo(redaction)}
                            </div>
                            <div className="col-action">
                              {renderRedactionAction(redaction, doc.id)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* approve all/reject all buttons at bottom of redactions table */}
                      <PendingRedactionButtons
                        document={doc}
                        onAction={handleRedactionAction}
                        className="table"
                      />
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
      />
    </div>
  );
}