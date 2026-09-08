const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { sequelize } = require("./config/database");
const { Customer, Cart } = require("./models");

const NAME = "kudo";
const EMAIL = "kudo@flipkart.store";
const PASSWORD = "Kudo@1234";

(async () => {
  await sequelize.authenticate();
  const [customer, created] = await Customer.findOrCreate({
    where: { email: EMAIL },
    defaults: { name: NAME, email: EMAIL, password: PASSWORD, phone: "+91 90000 00004" },
  });
  if (!created) {
    // reset password so credentials are guaranteed correct
    customer.password = PASSWORD;
    await customer.save();
  }
  await Cart.findOrCreate({ where: { customerId: customer.id }, defaults: { customerId: customer.id } });
  console.log("KUDO ACCOUNT:", created ? "created" : "password reset");
  console.log("  email:   " + EMAIL);
  console.log("  password:" + PASSWORD);
  await sequelize.close();
})().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
