const { ZarinPal } = require("zarinpal-node-sdk");

const zarinpal = new ZarinPal({
  merchantId: process.env.ZARINPAL_UUID,
  sandbox: true,
  accessToken: process.env.ZARINPAL_SECRET,
});
module.exports = zarinpal;
