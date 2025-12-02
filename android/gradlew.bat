@rem Copyright 2015 the original author or authors.
@rem SPDX-License-Identifier: Apache-2.0

@echo off

set DIR=%~dp0
if "%DIR%" == "" set DIR=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIR%

set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

set CLASSPATH=%APP_HOME%\gradle\wrapper\gradle-wrapper.jar
set PROPERTIES=%APP_HOME%\gradle\wrapper\gradle-wrapper.properties

if not exist "%CLASSPATH%" (
  for /f "tokens=2 delims==" %%A in ('findstr /b distributionUrl "%PROPERTIES%" ^| findstr /r "gradle-[0-9][0-9.]*"') do set DIST_LINE=%%A
  for /f "tokens=2 delims=-" %%A in ("%DIST_LINE%") do set WRAPPER_VERSION=%%A
  if "%WRAPPER_VERSION%"=="" set WRAPPER_VERSION=8.14.3

  set WRAPPER_URL=https://repo.gradle.org/gradle/public/org/gradle/gradle-wrapper/%WRAPPER_VERSION%/gradle-wrapper-%WRAPPER_VERSION%.jar
  for %%A in ("%CLASSPATH%") do set WRAPPER_DIR=%%~dpA
  if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"

  powershell -NoLogo -NoProfile -Command "try { (New-Object System.Net.WebClient).DownloadFile('%WRAPPER_URL%', '%CLASSPATH%') } catch { Write-Error 'Failed to download Gradle wrapper from %WRAPPER_URL%' ; exit 1 }"
  if errorlevel 1 (
    echo Failed to download Gradle wrapper from %WRAPPER_URL%
    exit /b 1
  )
)

set JAVA_EXE=java.exe
if defined JAVA_HOME set JAVA_EXE=%JAVA_HOME%\bin\java.exe

"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% -Dorg.gradle.appname=%APP_BASE_NAME% -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
