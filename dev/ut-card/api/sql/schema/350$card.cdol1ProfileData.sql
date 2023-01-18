CREATE TABLE [card].[cdol1ProfileData] (  --table for cdol1 profile data
    cdol1ProfileDataId int IDENTITY(1, 1) NOT NULL, -- the id of the cdol1 profile data
    cdol1ProfileId int NOT NULL, --the link to the cdol1 profile
    tag varchar(16) NOT NULL, -- the tag
    len int NOT NULL, --the cdol1 tag len
    [order] tinyint NOT NULL, --the cdol1 tag order
    CONSTRAINT [pkCdol1ProfileData] PRIMARY KEY CLUSTERED (cdol1ProfileDataId),
    CONSTRAINT [fkCdol1ProfileData_Cdol1ProfileId] FOREIGN KEY(cdol1ProfileId) REFERENCES [card].[cdol1Profile] (cdol1ProfileId)
)