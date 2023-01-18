ALTER FUNCTION [rule].assignment(
    @splitNameId bigint,
    @map [core].[map] READONLY
) RETURNS TABLE AS RETURN (
    SELECT
        [description],
        [percent],
        [minValue],
        [maxValue],
        core.mapReplace(debit, @map) debit,
        core.mapReplace(credit, @map) credit,
        (SELECT
            [name],
            core.mapReplace([value], @map) as [value]
         FROM
            [rule].[splitAnalytic] [rows]
        WHERE
            [rows].splitAssignmentId = b.splitAssignmentId
        FOR XML AUTO, TYPE, ROOT
        ) analytics
    FROM
        [rule].splitAssignment b
    WHERE
        splitNameId = @splitNameId
)