CREATE PROCEDURE [card].[config.fetch] -- this SP returns information to populate drop-downs, grids etc. based on user permissions
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

exec [card].[statusAction.fetch] @meta = @meta

exec [card].[reason.list] @meta = @meta
