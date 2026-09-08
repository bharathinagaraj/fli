const mysql = require("mysql2/promise");

const env = require("fs").readFileSync("C:/flip/fli/src/backend/.env", "utf8");
function get(key) {
  const m = env.match(new RegExp("^" + key + "=(.*)$", "m"));
  return m ? m[1].trim() : undefined;
}

(async () => {
  const conn = await mysql.createConnection({
    host: get("DB_HOST"),
    port: get("DB_PORT"),
    user: get("DB_USER"),
    password: get("DB_PASSWORD"),
    database: get("DB_NAME"),
  });
  const [customers] = await conn.query("SELECT id, name, email, is_active FROM customers");
  console.log("=== CUSTOMERS ===");
  console.table(customers);
  const [users] = await conn.query("SELECT id, name, email, role, is_active FROM users");
  console.log("=== USERS (staff/admin) ===");
  console.table(users);
  await conn.end();
})().catch((e) => {
  console.error("ERR:", e.message);
});
