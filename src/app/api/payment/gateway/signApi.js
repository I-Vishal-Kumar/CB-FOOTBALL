// utils/signApi.js
import crypto from 'crypto';

// Generate MD5 hash for signing
export const sign = (signSource, key) => {
  if (key) {
    signSource += `&key=${key}`;
  }
  return crypto.createHash('md5').update(signSource).digest('hex');
};

// Validate a signature
export const validateSignByKey = (signSource, key, providedSign) => {
  if (key) {
    signSource += `&key=${key}`;
  }
  const generatedSign = crypto.createHash('md5').update(signSource).digest('hex');
  return generatedSign === providedSign;
};
