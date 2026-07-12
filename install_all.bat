@echo off
echo Installing dependencies for Financial Analyst Client...
cd Financial_Analyst\client
call npm install
cd ..\..

echo Installing dependencies for Financial Analyst Server...
cd Financial_Analyst\server
call npm install
cd ..\..

echo Installing dependencies for Dispatcher Frontend...
cd dispatcher\frontend
call npm install
cd ..\..

echo Installing dependencies for Dispatcher Backend...
cd dispatcher\backend
call npm install
cd ..\..

echo Installing dependencies for Safety Officer Frontend...
cd safety_officer\frontend
call npm install
cd ..\..

echo Installing dependencies for Safety Officer Backend...
cd safety_officer\backend
call npm install
cd ..\..

echo Done installing dependencies.
