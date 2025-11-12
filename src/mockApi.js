const mockData = {
  documents: [
    {
      id: 1,
      fileName: "DVReport_2024_001.pdf",
      reviewStatus: "In progress",
      redactionsDetected: 7,
      redactionsApplied: 3,
      confidenceLevel: 96,
      uploadDate: "2024-10-15T14:30:00Z",
      fileSize: "2.3 MB",
      documentUrl:
        "https://storage.example.com/police-reports/dvreport-2024-001.pdf",
      redactions: [
        {
          id: 1,
          text: "123 Sydney Street",
          category: "Address",
          location: "Page 1, Line 12",
          confidence: 96,
          status: "approved",
          modifiedBy: "Detective Sarah Martinez",
          modifiedByBadge: "4571",
          modifiedAt: "2024-10-15T14:35:00Z",
        },
        {
          id: 2,
          text: "Emily Rodriguez",
          category: "Name",
          location: "Page 1, Line 5",
          confidence: 98,
          status: "approved",
          modifiedBy: "Detective Sarah Martinez",
          modifiedByBadge: "4571",
          modifiedAt: "2024-10-15T14:36:00Z",
        },
        {
          id: 3,
          text: "03/22/1987",
          category: "DOB",
          location: "Page 1, Line 7",
          confidence: 99,
          status: "approved",
          modifiedBy: "Detective Sarah Martinez",
          modifiedByBadge: "4571",
          modifiedAt: "2024-10-15T14:37:00Z",
        },
        {
          id: 4,
          text: "Michael Rodriguez",
          category: "Name",
          location: "Page 2, Line 15",
          confidence: 97,
          status: "pending",
        },
        {
          id: 5,
          text: "07/15/1985",
          category: "DOB",
          location: "Page 2, Line 16",
          confidence: 98,
          status: "pending",
        },
        {
          id: 6,
          text: "Jennifer Thompson",
          category: "Name",
          location: "Page 3, Line 22",
          confidence: 95,
          status: "pending",
        },
        {
          id: 7,
          text: "125 Sydney Street",
          category: "Address",
          location: "Page 3, Line 23",
          confidence: 93,
          status: "rejected",
          modifiedBy: "Detective Sarah Martinez",
          modifiedByBadge: "4571",
          modifiedAt: "2024-10-15T14:38:00Z",
        },
      ],
    },
    {
      id: 2,
      fileName: "DVReport_2024_002.pdf",
      reviewStatus: "Pending Review",
      redactionsDetected: 35,
      redactionsApplied: 0,
      confidenceLevel: 94,
      uploadDate: "2024-10-16T09:15:00Z",
      fileSize: "1.8 MB",
      documentUrl:
        "https://storage.example.com/police-reports/dvreport-2024-002.pdf",
      redactions: [
        {
          id: 10,
          text: "456 Main Avenue",
          category: "Address",
          location: "Page 1, Line 3",
          confidence: 94,
          status: "pending",
        },
        {
          id: 11,
          text: "Sarah Johnson",
          category: "Name",
          location: "Page 1, Line 8",
          confidence: 97,
          status: "pending",
        },
        {
          id: 13,
          text: "05/14/1992",
          category: "DOB",
          location: "Page 1, Line 9",
          confidence: 96,
          status: "pending",
        },
        {
          id: 14,
          text: "David Johnson",
          category: "Name",
          location: "Page 2, Line 18",
          confidence: 98,
          status: "pending",
        },
      ],
    },
    {
      id: 3,
      fileName: "DVReport_2024_003.pdf",
      reviewStatus: "Completed",
      redactionsDetected: 28,
      redactionsApplied: 28,
      confidenceLevel: 98,
      uploadDate: "2024-10-14T16:45:00Z",
      fileSize: "1.5 MB",
      documentUrl:
        "https://storage.example.com/police-reports/dvreport-2024-003.pdf",
      redactions: [
        {
          id: 15,
          text: "789 Park Boulevard",
          category: "Address",
          location: "Page 1, Line 4",
          confidence: 95,
          status: "approved",
        },
        {
          id: 16,
          text: "Maria Garcia",
          category: "Name",
          location: "Page 1, Line 6",
          confidence: 99,
          status: "approved",
        },
      ],
    },
  ],

  scanInfo: {
    caseNumber: "GHP-21329",
    status: "Scan Complete",
    totalDocuments: 3,
    totalRedactions: 105,
    scanDate: "2024-10-17T10:00:00Z",
  },

  currentUser: {
    name: "Detective Sarah Martinez",
    badge: "4571",
    department: "Metro Police Department",
  },
};

export const fetchDocuments = () => {
  return {
    success: true,
    data: mockData.documents,
  };
};

export const fetchScanInfo = () => {
  return {
    success: true,
    data: mockData.scanInfo,
  };
};

export const fetchCurrentUser = () => {
  return {
    success: true,
    data: mockData.currentUser,
  };
};

export const updateRedactionStatus = (
  documentId,
  redactionId,
  status,
  currentUser
) => {
  const document = mockData.documents.find((doc) => doc.id === documentId);

  const redaction = document.redactions.find((redact) => redact.id === redactionId);

  redaction.status = status;

  // Track who made the change and when
  if (currentUser) {
    redaction.modifiedBy = currentUser.name;
    redaction.modifiedByBadge = currentUser.badge;
    redaction.modifiedAt = new Date().toISOString();
  }

  // Update document counts
  const approvedCount = document.redactions.filter(
    (redact) => redact.status === "approved"
  ).length;
  document.redactionsApplied = approvedCount;

  return {
    success: true,
    data: { redaction, document },
  };
};

export const addManualRedaction = (documentId, redactionData, currentUser) => {
  const document = mockData.documents.find((doc) => doc.id === documentId);

  const randomId = Math.floor(Math.random() * 1000000);

  const newRedaction = {
    id: randomId,
    text: redactionData.text,
    category: "Manual",
    // in the future: use the exact location
    location: redactionData.location || "Police Report",
    confidence: "N/A",
    status: "approved",
    isManual: true,
    createdBy: currentUser?.name,
    createdByBadge: currentUser?.badge,
    createdAt: new Date().toISOString(),
  };

  document.redactions.push(newRedaction);
  document.redactionsDetected += 1;
  document.redactionsApplied += 1;

  return {
    success: true,
    data: { redaction: newRedaction, document },
  };
};

export const batchUpdateRedactions = (
  documentId,
  redactionIds,
  status,
  currentUser
) => {
  const document = mockData.documents.find((doc) => doc.id === documentId);

  redactionIds.forEach((redactionId) => {
    const redaction = document.redactions.find((red) => red.id === redactionId);

    if (redaction) {
      redaction.status = status;

      // Track who made the bulk change and when
      if (currentUser) {
        redaction.modifiedBy = currentUser.name;
        redaction.modifiedByBadge = currentUser.badge;
        redaction.modifiedAt = new Date().toISOString();
      }
    }
  });

  // Update document counts
  const approvedCount = document.redactions.filter(
    (redaction) => redaction.status === "approved"
  ).length;
  document.redactionsApplied = approvedCount;

  return {
    success: true,
    data: { document },
  };
};
