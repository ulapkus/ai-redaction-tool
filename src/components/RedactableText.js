import React from "react";

export default function RedactableText({
  text,
  redactedRanges,
  aiRedactions = [],
  onRedactionClick,
}) {
  // apply a single redaction to parts array
  const applyRedaction = (parts, redactionText, createSpan) => {
    const newParts = [];
    parts.forEach((part) => {
      if (typeof part === "string") {
        const segments = part.split(redactionText);

        segments.forEach((segment, i) => {
          newParts.push(segment);
          if (i < segments.length - 1) {
            newParts.push(createSpan(i));
          }
        });
      } else {
        newParts.push(part);
      }
    });
    return newParts;
  };

  let parts = [text];

  // apply ai-detected redactions (yellow highlights)
  aiRedactions.forEach((redaction) => {
    const statusClass =
      {
        approved: "ai-redacted approved",
        rejected: "ai-redacted rejected",
        pending: "ai-redacted pending",
      }[redaction.status] || "ai-redacted pending";

    const tooltip =
      {
        approved: "Redacted",
        rejected: "Not Redacted",
        pending: "Pending Redaction",
      }[redaction.status] || "Pending Redaction";

    parts = applyRedaction(parts, redaction.text, (i) => (
      <span
        key={`ai-${redaction.id}-${i}`}
        className={statusClass}
        onClick={(e) => onRedactionClick?.(redaction.text, e)}
        data-tooltip={tooltip}
      >
        {redaction.text}
      </span>
    ));
  });

  // apply manual redactions
  redactedRanges.forEach((redactedText) => {
    parts = applyRedaction(parts, redactedText, (i) => (
      <span
        key={`manual-${redactedText}-${i}`}
        className="user-redacted"
        data-tooltip="Redacted"
      >
        {redactedText}
      </span>
    ));
  });

  return <>{parts}</>;
}
