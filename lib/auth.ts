// lib/auth.ts
import bcrypt from "bcrypt";

// 🔐 For registration
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

// 🔐 For login (THIS was missing)
export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
