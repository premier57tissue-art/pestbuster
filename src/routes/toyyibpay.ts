import { Router } from "express";
import axios from "axios";
import { z } from "zod";

const router = Router();

const createBillBody = z.object({
  amount: z.number().positive(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8),
  description: z.string().default("Pembayaran")
});

router.post("/create", async (req, res) => {
  const parsed = createBillBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const payload = parsed.data;

  const params = new URLSearchParams({
    userSecretKey: process.env.TOYYIBPAY_SECRET_KEY!,
    categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE!,
    billName: payload.description,
    billDescription: payload.description,
    billAmount: Math.round(payload.amount * 100).toString(),
    billTo: payload.customerName,
    billEmail: payload.customerEmail,
    billPhone: payload.customerPhone,
    billReturnUrl: process.env.BILL_RETURN_URL!,
    billCallbackUrl: process.env.BILL_CALLBACK_URL!,
    billPaymentChannel: "0",
    billChargeToCustomer: "1",
    billPriceSetting: "0",
    billPayorInfo: "0"
  });

  try {
    const response = await axios.post(
      `${process.env.TOYYIBPAY_BASE_URL}/createBill`,
      params
    );

    const bill = response.data?.[0];
    if (!bill?.BillCode) {
      return res.status(500).json({
        error: "Toyyibpay response invalid",
        raw: response.data
      });
    }

    // Use production or sandbox URL based on environment
    const baseUrl = process.env.TOYYIBPAY_BASE_URL || "https://dev.toyyibpay.com/index.php/api";
    const isProduction = baseUrl.includes("toyyibpay.com") && !baseUrl.includes("dev");
    const billUrl = isProduction 
      ? `https://toyyibpay.com/${bill.BillCode}`
      : `https://dev.toyyibpay.com/${bill.BillCode}`;

    res.json({
      billCode: bill.BillCode,
      billUrl: billUrl,
      status: bill.BillpaymentStatus || "pending"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Toyyibpay createBill failed" });
  }
});

const callbackBody = z.object({
  billcode: z.string(),
  order_id: z.string().optional(),
  status_id: z.string(),
  transaction_time: z.string().optional(),
  amount: z.string().optional()
});

router.post("/callback", async (req, res) => {
  const parsed = callbackBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data = parsed.data;
  console.log("Toyyibpay callback received:", data);

  // TODO: Update payment status in your database here
  // Example: await updatePaymentStatus(data.billcode, data.status_id);

  res.json({ received: true });
});

router.get("/status/:billCode", async (req, res) => {
  const { billCode } = req.params;

  if (!billCode) {
    return res.status(400).json({ error: "billCode is required" });
  }

  try {
    const params = new URLSearchParams({
      userSecretKey: process.env.TOYYIBPAY_SECRET_KEY!,
      billCode: billCode
    });

    const response = await axios.post(
      `${process.env.TOYYIBPAY_BASE_URL}/getBillTransactions`,
      params
    );

    res.json(response.data);
  } catch (err) {
    console.error("getBillTransactions failed:", err);
    res.status(500).json({ error: "Failed to fetch bill transactions" });
  }
});

export default router;