require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const { sequelize } = require("./config/database");
const { Customer } = require("./models");

function normalize(email, password) {
  email = typeof email === "string" ? email.trim().toLowerCase() : "";
  password = typeof password === "string" ? password.trim() : "";
  return { email, password };
}

(async () => {
  const { email, password } = normalize("customer@flipkart.store", "Customer@1234");
  const customer = await Customer.scope("withPassword").findOne({ where: { email } });
  if (!customer) {
    console.log("NOT FOUND -> login would fell through to staff table");
  } else {
    console.log("found:", customer.email, "| password match:", await customer.comparePassword(password));
  }
  await sequelize.close();
})().catch((e) => { console.error("ERR:", e); process.exit(1); });
