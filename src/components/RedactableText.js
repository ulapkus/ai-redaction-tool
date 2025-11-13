import React from "react";

export default function RedactableText({
  text,
  redactionList = [],
  onRedactionClick,
}) {
  const matches = [];
  redactionList.forEach((redaction) => {
    let index = 0;
    while ((index = text.indexOf(redaction.text, index)) !== -1) {
      matches.push({
        start: index,
        end: index + redaction.text.length,
        redaction,
      });
      index += 1;
    }
  });

  matches.sort((a, b) => a.start - b.start);

  const parts = [];
  let currentIndex = 0;

  matches.forEach((match, i) => {
    if (match.start > currentIndex) {
      parts.push(text.slice(currentIndex, match.start));
    }

    const statusClass =
      {
        approved: "ai-redacted approved",
        rejected: "ai-redacted rejected",
        pending: "ai-redacted pending",
      }[match.redaction.status] || "ai-redacted pending";

    const tooltip =
      {
        approved: "Redacted",
        rejected: "Not Redacted",
        pending: "Pending Redaction",
      }[match.redaction.status] || "Pending Redaction";

    parts.push(
      <span
        key={`redaction-${i}`}
        className={statusClass}
        onClick={(e) => onRedactionClick?.(match.redaction.text, e)}
        data-tooltip={tooltip}
      >
        {text.slice(match.start, match.end)}
      </span>
    );

    currentIndex = match.end;
  });

  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return <>{parts}</>;
}
