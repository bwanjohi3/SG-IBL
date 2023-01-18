CREATE TABLE [card].[documentCard]( -- table that stores link between card and respective document
    documentCardId bigint IDENTITY(1, 1), -- id of the card to document link
    cardId bigint NOT NULL, -- id of the card
    documentId bigint NOT NULL, -- id of the document linked to the card
 CONSTRAINT pkdocumentCardId PRIMARY KEY CLUSTERED (documentCardId),
 CONSTRAINT fkdocumentCardId_cardId FOREIGN KEY (cardId) REFERENCES card.card (cardId),
 CONSTRAINT fkdocumentCardId_documentId FOREIGN KEY(documentId) REFERENCES document.document (documentId)
)
