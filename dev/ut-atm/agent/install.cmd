@echo off

echo ^>
echo ^> Registering service...
nssm.exe install UT_ATM "C:\\Program Files\\SoftwareGroup\\node.exe" index
echo ^>
echo ^> Starting services...
nssm.exe start UT_ATM
nssm.exe set UT_ATM Start SERVICE_AUTO_START
echo ^>
echo ^> Done
echo ^>
pause
