import "dotenv/config";
import express from "express";
import cors from "cors";
import toyyibpayRouter from "./routes/toyyibpay";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/payments/toyyibpay", toyyibpayRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Toyyibpay backend listening on port ${port}`);
});
