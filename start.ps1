# fli - one command to run the whole project automatically.
# Starts MySQL, creates the database, auto-creates all tables (Sequelize),
# seeds demo data (only if empty), starts backend + frontend, opens browser.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function PortInUse($port) {
  try { return [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop) } catch { return $false }
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  FLI AUTO RUNNER" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 1) Node.js
Write-Host "[1/7] Checking Node.js..." -ForegroundColor Yellow
node --version | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Node.js not found. Install Node 18+ and retry." }

# 2) MySQL service
Write-Host "[2/7] Checking MySQL..." -ForegroundColor Yellow
$mysqlRunning = @(Get-Service | Where-Object { $_.Name -match "mysql" -and $_.Status -eq "Running" }).Count -gt 0
if (-not $mysqlRunning) {
  $svc = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
  if ($svc) { Write-Host "      Starting MySQL80..."; Start-Service -Name "MySQL80"; Start-Sleep -Seconds 6 }
}
$mysqlRunning = @(Get-Service | Where-Object { $_.Name -match "mysql" -and $_.Status -eq "Running" }).Count -gt 0
if (-not $mysqlRunning) { throw "MySQL is not running. Start MySQL80 manually and retry." }
Write-Host "      MySQL is running."

# 3) Dependencies
Write-Host "[3/7] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) { Write-Host "      Installing (first run)..."; npm install }
Write-Host "      node_modules present."

# 4) Database + tables
Write-Host "[4/7] Creating database + all tables automatically..." -ForegroundColor Yellow
node auto.cjs
if ($LASTEXITCODE -ne 0) { throw "Database/tables setup failed." }

# 5) Backend
Write-Host "[5/7] Starting backend API on :5000..." -ForegroundColor Yellow
if (PortInUse 5000) { Write-Host "      Port 5000 already in use - backend assumed running." }
else { Start-Process -FilePath "node.exe" -ArgumentList "src/backend/server.js" -WorkingDirectory $PSScriptRoot -WindowStyle Minimized }

# 6) Frontend
Write-Host "[6/7] Starting frontend on :5173..." -ForegroundColor Yellow
if (PortInUse 5173) { Write-Host "      Port 5173 already in use - frontend assumed running." }
else { Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev:client" -WorkingDirectory $PSScriptRoot -WindowStyle Minimized }

# 7) Wait + open browser
Write-Host "[7/7] Waiting for servers..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  [OK] Everything is running!" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend  : http://localhost:5000/api" -ForegroundColor Green
Write-Host "  Admin    : admin@flipkart.store / Admin@1234" -ForegroundColor Green
Write-Host "  Customer : customer@flipkart.store / Customer@1234" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
