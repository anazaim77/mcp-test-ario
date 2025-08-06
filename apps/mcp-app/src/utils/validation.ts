import { z } from "zod";
import { CalculatorInput, CalculatorSchema } from "../types/calculator";

// Validation schemas
export const validateCalculatorInput = (input: unknown): CalculatorInput => {
  return CalculatorSchema.parse(input);
};

// Generic validation function
export const validateInput = <T>(schema: z.ZodSchema<T>, input: unknown): T => {
  return schema.parse(input);
};

// Error handling for validation
export const handleValidationError = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    return `Validation error: ${error.errors.map((e) => e.message).join(", ")}`;
  }
  return error instanceof Error ? error.message : "Unknown validation error";
};

// Type guard for checking if value is a valid number
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
};

// Type guard for checking if value is a valid integer
export const isValidInteger = (value: unknown): value is number => {
  return isValidNumber(value) && Number.isInteger(value);
};
