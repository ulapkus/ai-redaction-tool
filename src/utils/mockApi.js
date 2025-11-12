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
      documentData: [
        "On October 14, 2024, at approximately 22:45 hours, I, Officer Sarah Martinez, Badge #4571, was dispatched to 123 Sydney Street in response to a domestic disturbance call. Dispatch advised that a neighbor reported hearing loud arguing and what sounded like objects being thrown.",
        "Upon arrival at 22:52 hours, I observed the front door was partially open. I announced my presence and was greeted by the victim, identified as Emily Rodriguez (DOB: 03/22/1987). The victim appeared visibly distressed, with tears streaming down her face. I observed a fresh bruise forming on her left cheek and redness around her neck area.",
        "The victim stated that her husband, Michael Rodriguez (DOB: 07/15/1985), had become enraged during an argument about finances. She reported that he grabbed her by the throat and pushed her against the wall. She stated that he then struck her in the face with an open hand. The victim also reported that the suspect threw a glass vase, which shattered against the wall near where she was standing.",
        "I observed broken glass on the living room floor and a hole in the drywall consistent with the victim's statement. The suspect was located in the bedroom and was detained without incident. The suspect appeared to be under the influence of alcohol, exhibiting slurred speech and the odor of an alcoholic beverage on his breath.",
        "The suspect declined to provide a statement and requested legal counsel. Medical assistance was offered to the victim, who initially declined but later agreed to be photographed for evidence documentation. Photos were taken of visible injuries and the crime scene.",
        "A witness, Jennifer Thompson, residing at 125 Sydney Street, provided a statement indicating she heard loud arguing and the sound of breaking glass at approximately 22:40 hours. She stated she called 911 out of concern for her neighbor's safety.",
        "The suspect was placed under arrest for Domestic Violence - Assault in the Third Degree and Endangering Welfare. He was transported to Greenville Police Department for booking and processing. The victim was provided with information regarding victim services and a restraining order process.",
      ],
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
      documentData: [
        "This is the content for document 2. On October 16, 2024, at 456 Main Avenue, officers responded to a domestic violence call involving Sarah Johnson (DOB: 05/14/1992) and David Johnson.",
        "The investigation is ongoing with multiple witnesses being interviewed.",
      ],
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
      documentData: [
        "This is the content for document 3. On October 14, 2024, at 789 Park Boulevard, officers responded to a domestic incident involving Maria Garcia and other parties.",
        "The case has been fully processed and all redactions have been applied.",
      ],
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

  const redaction = document.redactions.find(
    (redact) => redact.id === redactionId
  );

  redaction.status = status;

  if (currentUser) {
    redaction.modifiedBy = currentUser.name;
    redaction.modifiedByBadge = currentUser.badge;
    redaction.modifiedAt = new Date().toISOString();
  }

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

      if (currentUser) {
        redaction.modifiedBy = currentUser.name;
        redaction.modifiedByBadge = currentUser.badge;
        redaction.modifiedAt = new Date().toISOString();
      }
    }
  });

  const approvedCount = document.redactions.filter(
    (redaction) => redaction.status === "approved"
  ).length;
  document.redactionsApplied = approvedCount;

  return {
    success: true,
    data: { document },
  };
};
