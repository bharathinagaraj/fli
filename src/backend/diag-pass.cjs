const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const env = fs.readFileSync("C:/flip/fli/src/backend/.env", "utf8");
function get(key) {
  const m = env.match(new RegExp("^" + key + "=(.*)$", "m"));
  return m ? m[1].trim() : undefined;
}
(async () => {
  const conn = await mysql.createConnection({
    host: get("DB_HOST"), port: get("DB_PORT"), user: get("DB_USER"),
    password: get("DB_PASSWORD"), database: get("DB_NAME"),
  });
  const [rows] = await conn.query("SELECT email, password FROM customers WHERE email = ?", ["kudo@flipkart.store"]);
  console.log(rows);
  if (rows.length) {
    const ok = await bcrypt.compare("Kudo@1234", rows[0].password);
    console.log("bcrypt compare:", ok);
  }
  await conn.end();
})().catch((e) => console.error("ERR:", e.message));
