import express from "express";
import {
    createContact,
    getAllContacts,
    deleteContact,
} from "../Controllers/SupportCtrl.js";

const router = express.Router();

router.post("/contact", createContact);
router.get("/contact", getAllContacts);
router.delete("/contact/:id", deleteContact);

export default router;
