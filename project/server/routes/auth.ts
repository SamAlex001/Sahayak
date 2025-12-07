import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await UserModel.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(409).json({ error: "email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      email: normalizedEmail,
      passwordHash,
      fullName,
      role,
    });
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "failed to sign up";
    console.error("Signup error:", message);
    return res.status(500).json({ error: message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: "invalid credentials" });
    if (!user.passwordHash || typeof user.passwordHash !== "string") {
      // Guard against legacy/malformed users without passwordHash
      return res.status(401).json({ error: "invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "failed to log in";
    console.error("Login error:", message);
    return res.status(500).json({ error: message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "missing token" });
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await UserModel.findById(payload.sub).lean();
    if (!user) return res.status(404).json({ error: "user not found" });
    return res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid token";
    console.error("Auth me error:", message);
    return res.status(401).json({ error: message });
  }
});

export default router;
