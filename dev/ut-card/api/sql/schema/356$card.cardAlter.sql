IF NOT EXISTS (
  SELECT * 
  FROM   sys.columns 
  WHERE  object_id = OBJECT_ID(N'[card].[card]') 
         AND name = 'pvv'
)

BEGIN
    alter table card.card add pvv nvarchar(300);
END