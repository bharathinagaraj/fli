# view-data.ps1 - Shows all backend data stored in MySQL (flipkart_db)
$ErrorActionPreference = "Stop"
$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$db = "flipkart_db"
$env:MYSQL_PWD = "Bharathi@123"

if (-not (Test-Path $mysql)) {
  Write-Host "mysql.exe not found at: $mysql" -ForegroundColor Red
  exit 1
}

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  BACKEND DATA VIEWER  (flipkart_db)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 1) Tables + row counts
Write-Host "`n[1] TABLES & ROW COUNTS" -ForegroundColor Yellow
& $mysql -u root $db -e "SELECT TABLE_NAME AS table_name, TABLE_ROWS AS row_count FROM information_schema.TABLES WHERE TABLE_SCHEMA='$db' ORDER BY TABLE_NAME;"

# 2) Users
Write-Host "`n[2] USERS" -ForegroundColor Yellow
& $mysql -u root $db -e "SELECT name, email, role, phone, is_active FROM users;"

# 3) Categories
Write-Host "`n[3] CATEGORIES (first 15)" -ForegroundColor Yellow
& $mysql -u root $db -e "SELECT name, slug FROM categories LIMIT 15;"

# 4) Products
Write-Host "`n[4] PRODUCTS (first 10)" -ForegroundColor Yellow
& $mysql -u root $db -e "SELECT name, brand, price, stock_quantity FROM products LIMIT 10;"

# 5) Orders + items (products bought by customers)
Write-Host "`n[5] ORDERS / PRODUCTS BOUGHT" -ForegroundColor Yellow
& $mysql -u root $db -e "SELECT o.order_number, c.name AS customer, o.status, o.total, oi.name AS product, oi.quantity FROM orders o JOIN customers c ON c.id=o.customer_id JOIN order_items oi ON oi.order_id=o.id;"

# 6) Guest visits
Write-Host "`n[6] GUEST VISITS" -ForegroundColor Yellow
& $mysql -u root $db -e "SELECT session_id, ip, page, visited_at FROM guest_visits;"

# 7) Login logs
Write-Host "`n[7] LOGIN LOGS" -ForegroundColor Yellow
& $mysql -u root $db -e "SELECT email, ip, login_at FROM login_logs ORDER BY login_at DESC;"

# 8) Signup logs
Write-Host "`n[8] SIGNUP LOGS" -ForegroundColor Yellow
& $mysql -u root $db -e "SELECT email, ip, signed_up_at FROM signup_logs;"

Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue

Write-Host "`n==============================================" -ForegroundColor Green
Write-Host "  [DONE] Full backend data shown above" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
