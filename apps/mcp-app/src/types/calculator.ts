import { z } from "zod";

// Calculator operation types
export type CalculatorOperation =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "power"
  | "sqrt";

// Calculator input schema
export const CalculatorSchema = z.object({
  operation: z.enum(["add", "subtract", "multiply", "divide", "power", "sqrt"]),
  a: z.number(),
  b: z.number().optional(),
});

// Calculator input type
export type CalculatorInput = z.infer<typeof CalculatorSchema>;

// Calculator function signature
export type CalculatorFunction = (a: number, b?: number) => number;

// Calculator functions interface
export interface CalculatorFunctions {
  add: (a: number, b: number) => number;
  subtract: (a: number, b: number) => number;
  multiply: (a: number, b: number) => number;
  divide: (a: number, b: number) => number;
  power: (a: number, b: number) => number;
  sqrt: (a: number) => number;
}

// Calculator result interface
export interface CalculatorResult {
  result: number;
  expression: string;
  operation: CalculatorOperation;
}
