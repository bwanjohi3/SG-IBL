CREATE TABLE [card].[cdol1Profile] (  --table for cdol1 profiles
    cdol1ProfileId int IDENTITY(1, 1) NOT NULL, -- the id of cdol1 profiles
    cdol1ProfileName varchar(50) NOT NULL, -- the cdol1 profiles name
    CONSTRAINT [pkCdol1Profile] PRIMARY KEY CLUSTERED (cdol1ProfileId)
)