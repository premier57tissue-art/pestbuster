require('dotenv').config();
const express = require('express');
const cors = require('cors');
const toyyibpayRouter = require('./routes/toyyibpay');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/payments/toyyibpay', toyyibpayRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Toyyibpay backend listening on port ${port}`);
});

