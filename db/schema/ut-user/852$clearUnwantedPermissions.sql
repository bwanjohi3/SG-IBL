
delete from core.itemTranslation where itemnameid in (select itemnameid from core.itemName where itemName in ('Manage External Systems','Manage Content Items and Translations',
'Manage Errors','Manage Generic Users'))

delete from [user].role where fieldofworkid in 
(select itemnameid from core.itemName where itemName in ('Manage External Systems','Manage Content Items and Translations',
'Manage Errors','Manage Generic Users'))

delete from core.itemName where itemName in ('Manage External Systems','Manage Content Items and Translations','Manage Errors','Manage Generic Users')

