@echo off
echo Cleaning and building Job Portal Backend...
echo.

echo Finding Java installation...
where java > temp_java_path.txt
set /p JAVA_PATH=<temp_java_path.txt
del temp_java_path.txt

echo Found Java at: %JAVA_PATH%
set JAVA_HOME=%JAVA_PATH:\bin\java.exe=%
echo Setting JAVA_HOME to: %JAVA_HOME%

set PATH=%JAVA_HOME%\bin;%PATH%

echo.
echo Java Version:
java -version
echo.

echo Deleting target directory...
if exist target rmdir /s /q target

echo Cleaning Maven...
call mvn clean

echo Compiling project...
call mvn compile

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS: Project compiled successfully!
    echo ========================================
    echo.
    echo To run the application:
    echo   mvn spring-boot:run
    echo.
    echo Test endpoints:
    echo   http://localhost:8080/api/test/health
    echo   http://localhost:8080/api/h2-console
    echo.
) else (
    echo.
    echo ========================================
    echo FAILED: Compilation error occurred.
    echo ========================================
)

pause