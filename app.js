import { Router } from "express";

import AuthRouter from "./Routers/AuthRouter.js";
import CustumerRouter from "./Routers/CustumerRouter.js";
import WithdrawRouter from "./Routers/WithdrawRouter.js";
import RepaymentsRouter from "./Routers/RepaymentsRouter.js";
import ReportRouter from "./Routers/ReportRouter.js";
import NotificationRouter from "./Routers/NotificationRouter.js";
import EarlyPayoffManagmentRouter from "./Routers/EarlyPayoffManagmentRouter.js";
import SupportRouter from "./Routers/SupportRouter.js";
import CreditUpgardeRequestRouter from "./Routers/CreditUpgardeRequestRouter.js";
import FundingBalanceRouter from "./Routers/FundingBalanceRouter.js";
import DiscountRouter from "./Routers/DiscountRouter.js";

const router = Router();

router.use("/api", AuthRouter);
router.use("/api", CustumerRouter);
router.use("/api", WithdrawRouter);
router.use("/api", RepaymentsRouter);
router.use("/api", ReportRouter);
router.use("/api", NotificationRouter);
router.use("/api", EarlyPayoffManagmentRouter);
router.use("/api", SupportRouter);
router.use("/api", CreditUpgardeRequestRouter);
router.use("/api", FundingBalanceRouter);
router.use("/api", DiscountRouter);

export default router;
