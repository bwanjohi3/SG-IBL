CREATE TABLE [card].[documentApplication]( -- table that stores link between application and respective document
    documentApplicationId bigint IDENTITY(1, 1), -- id of the application to document link
    applicationId int NOT NULL, -- id of the apllication
    documentId bigint NOT NULL, -- id of the document linked to the application
 CONSTRAINT pkDocumentApplication PRIMARY KEY CLUSTERED (documentApplicationId),
 CONSTRAINT fkDocumentApplication_applicationId FOREIGN KEY (applicationId) REFERENCES [card].[application] (applicationId),
 CONSTRAINT fkDocumentApplication_documentId FOREIGN KEY(documentId) REFERENCES document.document (documentId)
)