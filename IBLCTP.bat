@echo off
echo.
set UT_APP=server/ctp
set UT_ENV=dev
set NODE_PATH=./dev/
node.exe index-ctp.js --preserve-symlinks