declare @attachmentSize document.attachmentSizeTT

insert into @attachmentSize (attachmentSizeId, description)
VALUES ('original', 'original size');

MERGE into document.attachmentSize as dd
    using @attachmentSize d on dd.attachmentSizeId=d.attachmentSizeId

    WHEN NOT MATCHED BY TARGET THEN
        INSERT (attachmentSizeId, description)
        VALUES (attachmentSizeId, description);
