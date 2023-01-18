@echo off
echo.
set UT_APP=server/ctp
set UT_ENV=prod
set NODE_PATH=./dev/
node.exe index-ctp.js --preserve-symlinks --nolazy --max_old_space_size=500000