import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import User from "../models/User.js";
import { isMongoConnected } from "../config/db.js";

const jwtSecret = process.env.JWT_SECRET || "society-secret";

const inMemoryUsers =
  globalThis.__SOCIETY_USERS__ ?? (globalThis.__SOCIETY_USERS__ = []);

const sanitizeUser = (user) => {
  const safeUser = { ...user };
  delete safeUser.password;
  delete safeUser.mfaCode;
  delete safeUser.mfaCodeExpiresAt;
  return safeUser;
};

const findUserByEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (isMongoConnected.value) {
    return User.findOne({ email: normalizedEmail }).lean();
  }

  return inMemoryUsers.find((user) => user.email === normalizedEmail) || null;
};

const findUserById = async (id) => {
  if (isMongoConnected.value) {
    return User.findById(id).lean();
  }

  return inMemoryUsers.find((user) => user._id === id) || null;
};

const createUserRecord = async (userData) => {
  if (isMongoConnected.value) {
    const user = await User.create(userData);
    return user.toObject();
  }

  const user = {
    _id: randomUUID(),
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  inMemoryUsers.push(user);
  return user;
};

const updateUserRecord = async (userId, data) => {
  if (isMongoConnected.value) {
    const updated = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    }).lean();
    return updated;
  }

  const userIndex = inMemoryUsers.findIndex((user) => user._id === userId);
  if (userIndex === -1) return null;

  inMemoryUsers[userIndex] = {
    ...inMemoryUsers[userIndex],
    ...data,
    updatedAt: new Date(),
  };

  return inMemoryUsers[userIndex];
};

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    jwtSecret,
    { expiresIn: "7d" },
  );

const generateMfaCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role = "resident",
      mfaEnabled = false,
      flatNumber,
      vehicleRegistrations = [],
      emergencyContacts = [],
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        message:
          "firstName, lastName, email, phone, and password are required.",
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const mfaCode = mfaEnabled ? generateMfaCode() : null;

    const newUser = await createUserRecord({
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      role,
      mfaEnabled: Boolean(mfaEnabled),
      mfaCode,
      mfaCodeExpiresAt: mfaCode ? new Date(Date.now() + 5 * 60 * 1000) : null,
      profile: {
        flatNumber: flatNumber || "",
        vehicleRegistrations,
        emergencyContacts,
      },
    });

    if (newUser.mfaEnabled) {
      return res.status(201).json({
        message:
          "Registration successful. MFA is enabled. Use the code below during login.",
        requiresMfa: true,
        mfaCode: newUser.mfaCode,
        user: sanitizeUser(newUser),
      });
    }

    const token = generateToken(newUser);

    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Failed to register user.",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (user.mfaEnabled) {
      const generatedCode = generateMfaCode();
      const updatedUser = await updateUserRecord(user._id, {
        mfaCode: generatedCode,
        mfaCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      return res.status(202).json({
        message: "MFA verification required.",
        requiresMfa: true,
        mfaCode: generatedCode,
        user: sanitizeUser(updatedUser),
      });
    }

    const token = generateToken(user);
    await updateUserRecord(user._id, { lastLoginAt: new Date() });

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Login failed.",
      error: error.message,
    });
  }
};

export const verifyMfa = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email and MFA code are required.",
      });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.mfaEnabled) {
      return res.status(400).json({
        message: "MFA is not enabled for this user.",
      });
    }

    const expiresAt = user.mfaCodeExpiresAt
      ? new Date(user.mfaCodeExpiresAt).getTime()
      : 0;
    if (
      !user.mfaCode ||
      String(user.mfaCode) !== String(code) ||
      Date.now() > expiresAt
    ) {
      return res.status(401).json({
        message: "Invalid or expired MFA code.",
      });
    }

    const token = generateToken(user);
    const updatedUser = await updateUserRecord(user._id, {
      mfaCode: null,
      mfaCodeExpiresAt: null,
      lastLoginAt: new Date(),
    });

    return res.status(200).json({
      message: "MFA verified successfully.",
      token,
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error("Verify MFA error:", error);
    return res.status(500).json({
      message: "MFA verification failed.",
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch profile.",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      flatNumber,
      vehicleRegistrations,
      emergencyContacts,
      familyMembers,
      tenantDetails,
    } = req.body;

    const updatedFields = {
      firstName,
      lastName,
      phone,
      profile: {
        flatNumber: flatNumber || req.user.flatNumber || "",
        vehicleRegistrations: vehicleRegistrations || [],
        emergencyContacts: emergencyContacts || [],
        familyMembers: familyMembers || [],
        tenantDetails: tenantDetails || null,
      },
    };

    Object.keys(updatedFields).forEach((key) => {
      if (updatedFields[key] === undefined) delete updatedFields[key];
    });

    if (updatedFields.profile) {
      Object.keys(updatedFields.profile).forEach((key) => {
        if (updatedFields.profile[key] === undefined)
          delete updatedFields.profile[key];
      });
    }

    const updatedUser = await updateUserRecord(req.user.id, updatedFields);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({
    message: "Logout successful. Token should be discarded on the client side.",
  });
};
