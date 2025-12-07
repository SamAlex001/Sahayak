import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { MedicalRecordModel } from "../models/MedicalRecord";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads", "medical-records");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and documents are allowed"));
    }
  },
});

// Get all medical records for the authenticated user
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const records = await MedicalRecordModel.find({ userId: req.userId! })
      .sort({ date: -1, createdAt: -1 })
      .lean();
    res.json(records);
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({ error: "Failed to fetch medical records" });
  }
});

// Create a new medical record with optional file upload
router.post(
  "/",
  requireAuth,
  upload.single("attachment"),
  async (req: AuthRequest, res) => {
    try {
      const { date, type, description } = req.body;

      if (!date || !type || !description) {
        return res.status(400).json({
          error: "date, type, and description are required",
        });
      }

      const recordData: any = {
        userId: req.userId!,
        date,
        type,
        description,
      };

      // If file was uploaded, add file information
      if (req.file) {
        recordData.attachmentName = req.file.originalname;
        recordData.attachmentPath = req.file.path;
        recordData.attachmentUrl = `/api/medical-records/files/${req.file.filename}`;
      }

      const record = await MedicalRecordModel.create(recordData);

      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating medical record:", error);
      res.status(500).json({ error: "Failed to create medical record" });
    }
  }
);

// Serve uploaded files
router.get("/files/:filename", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Verify the file belongs to a record owned by the user
    const record = await MedicalRecordModel.findOne({
      userId: req.userId!,
      attachmentPath: filePath,
    });

    if (!record) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({ error: "Failed to serve file" });
  }
});

// Delete a medical record
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecordModel.findOneAndDelete({
      _id: id,
      userId: req.userId!,
    });

    if (!record) {
      return res.status(404).json({ error: "Medical record not found" });
    }

    // Delete associated file if it exists
    if (record.attachmentPath && fs.existsSync(record.attachmentPath)) {
      fs.unlinkSync(record.attachmentPath);
    }

    res.json({ success: true, message: "Medical record deleted" });
  } catch (error) {
    console.error("Error deleting medical record:", error);
    res.status(500).json({ error: "Failed to delete medical record" });
  }
});

// Update a medical record
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { date, type, description, attachmentName } = req.body;

    const record = await MedicalRecordModel.findOneAndUpdate(
      { _id: id, userId: req.userId! },
      { date, type, description, attachmentName },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ error: "Medical record not found" });
    }

    res.json(record);
  } catch (error) {
    console.error("Error updating medical record:", error);
    res.status(500).json({ error: "Failed to update medical record" });
  }
});

export default router;
