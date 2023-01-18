@echo off
echo.
set UT_APP=server/admin
set UT_ENV=prod
set NODE_PATH=./dev/
REM node.exe index.js --preserve-symlinks --nolazy --max_old_space_size=500000 > error_admin.log
node.exe index.js --preserve-symlinks --nolazy --max_old_space_size=500000
