@echo off
echo =====================================================
echo   FintechIQ - Transaction Intelligence Platform
echo   Database: Supabase Cloud PostgreSQL
echo =====================================================
echo.

set "JDK_PATH=C:\Users\mayur\tools\java21\jdk-21.0.6+7"
set "MVN_PATH=C:\Users\mayur\tools\maven\apache-maven-3.9.6"
set "JAVA_HOME=%JDK_PATH%"
set "PATH=%JDK_PATH%\bin;%MVN_PATH%\bin;%PATH%"

REM === Load environment variables from .env file ===
echo Loading environment from backend\.env ...
for /f "usebackq tokens=1,* delims==" %%A in (`findstr /v "^#" backend\.env`) do (
    if not "%%A"=="" (
        set "%%A=%%B"
    )
)

echo.
echo [CHECK] Java version:
java -version
echo.
echo [CHECK] Database: %SPRING_DATASOURCE_URL%
echo [CHECK] Groq AI:  %GROQ_API_KEY%
echo.

echo [BACKEND] Starting Spring Boot (connecting to Supabase)...
start "FintechIQ Backend" cmd /k "set JAVA_HOME=%JDK_PATH% && set PATH=%JDK_PATH%\bin;%MVN_PATH%\bin;%PATH% && cd backend && mvn spring-boot:run"

echo.
echo [FRONTEND] Starting React dev server...
start "FintechIQ Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================
echo   Services starting! Open:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8080
echo   Health:   http://localhost:8080/actuator/health
echo.
echo   Login Credentials:
echo   User:  user@fintech.com  / user1234
echo   Admin: admin@fintech.com / admin123
echo =====================================================
pause
