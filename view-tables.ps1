# view-tables.ps1 - Automatically shows every created table + columns + row count
$ErrorActionPreference = "Stop"
$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$db = "flipkart_db"
$env:MYSQL_PWD = "Bharathi@123"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  ALL CREATED TABLES - flipkart_db" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$tables = & $mysql -u root $db -N -e "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='$db' ORDER BY TABLE_NAME;"

foreach ($t in $tables) {
  $rowCount = (& $mysql -u root $db -N -e ("SELECT COUNT(*) FROM " + $t + ";") | Select-Object -First 1).Trim()
  $cols = & $mysql -u root $db -e ("SHOW COLUMNS FROM " + $t + ";")
  Write-Host ""
  Write-Host ("TABELLA: " + $t + "  |  rows: " + $rowCount) -ForegroundColor Yellow
  Write-Host ("  columns: " + (($cols -split "`n" | Select-Object -Skip 1 | ForEach-Object { ($_ -split "`t")[0] }) -join ", "))
}

Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  [DONE] All tables shown above" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
