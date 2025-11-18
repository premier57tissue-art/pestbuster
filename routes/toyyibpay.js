const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { amount, customerName, customerEmail, customerPhone, description } = req.body;

    // Validation
    if (!amount || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const params = new URLSearchParams({
      userSecretKey: process.env.TOYYIBPAY_SECRET_KEY,
      categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE,
      billName: description || 'Pembayaran',
      billDescription: description || 'Pembayaran',
      billAmount: Math.round(amount * 100).toString(), // Convert to sen
      billTo: customerName,
      billEmail: customerEmail,
      billPhone: customerPhone,
      billReturnUrl: process.env.BILL_RETURN_URL,
      billCallbackUrl: process.env.BILL_CALLBACK_URL,
      billPaymentChannel: '0',
      billChargeToCustomer: '1',
      billPriceSetting: '0',
      billPayorInfo: '0'
    });

    const response = await axios.post(
      `${process.env.TOYYIBPAY_BASE_URL}/createBill`,
      params
    );

    const bill = response.data?.[0];
    if (!bill?.BillCode) {
      return res.status(500).json({
        error: 'Toyyibpay response invalid',
        raw: response.data
      });
    }

    // Use production or sandbox URL based on environment
    const baseUrl = process.env.TOYYIBPAY_BASE_URL || 'https://dev.toyyibpay.com/index.php/api';
    const isProduction = baseUrl.includes('toyyibpay.com') && !baseUrl.includes('dev');
    const billUrl = isProduction 
      ? `https://toyyibpay.com/${bill.BillCode}`
      : `https://dev.toyyibpay.com/${bill.BillCode}`;

    res.json({
      billCode: bill.BillCode,
      billUrl: billUrl,
      status: bill.BillpaymentStatus || 'pending'
    });
  } catch (err) {
    console.error('createBill error:', err);
    res.status(500).json({ error: 'Toyyibpay createBill failed' });
  }
});

router.post('/callback', async (req, res) => {
  try {
    const { billcode, order_id, status_id, transaction_time, amount } = req.body;
    
    console.log('Toyyibpay callback received:', {
      billcode,
      order_id,
      status_id,
      transaction_time,
      amount
    });

    // TODO: Update payment status in your database here
    // Example: await updatePaymentStatus(billcode, status_id);

    res.json({ received: true });
  } catch (err) {
    console.error('callback error:', err);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

router.get('/status/:billCode', async (req, res) => {
  try {
    const { billCode } = req.params;

    if (!billCode) {
      return res.status(400).json({ error: 'billCode is required' });
    }

    const params = new URLSearchParams({
      userSecretKey: process.env.TOYYIBPAY_SECRET_KEY,
      billCode: billCode
    });

    const response = await axios.post(
      `${process.env.TOYYIBPAY_BASE_URL}/getBillTransactions`,
      params
    );

    res.json(response.data);
  } catch (err) {
    console.error('getBillTransactions failed:', err);
    res.status(500).json({ error: 'Failed to fetch bill transactions' });
  }
});

module.exports = router;

