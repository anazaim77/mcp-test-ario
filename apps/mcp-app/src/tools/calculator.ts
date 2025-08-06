import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  CalculatorInput,
  CalculatorFunctions,
  CalculatorOperation,
  CalculatorSchema,
} from "../types/calculator";
import { logger } from "../utils/logger";

// Calculator functions implementation
export const calculatorFunctions: CalculatorFunctions = {
  add: (a: number, b: number): number => a + b,
  subtract: (a: number, b: number): number => a - b,
  multiply: (a: number, b: number): number => a * b,
  divide: (a: number, b: number): number => {
    if (b === 0) {
      throw new Error("Division by zero is not allowed");
    }
    return a / b;
  },
  power: (a: number, b: number): number => Math.pow(a, b),
  sqrt: (a: number): number => {
    if (a < 0) {
      throw new Error("Cannot calculate square root of negative number");
    }
    return Math.sqrt(a);
  },
};

// Calculator tool handler
export const calculatorHandler = async (
  args: CalculatorInput
): Promise<CallToolResult> => {
  const { operation, a, b } = args;

  logger.debug("Calculator tool called", { operation, a, b });

  try {
    let result: number;
    let expression: string;

    switch (operation) {
      case "add":
        if (b === undefined) {
          throw new Error("Second number 'b' is required for addition");
        }
        result = calculatorFunctions.add(a, b);
        expression = `${a} + ${b}`;
        break;

      case "subtract":
        if (b === undefined) {
          throw new Error("Second number 'b' is required for subtraction");
        }
        result = calculatorFunctions.subtract(a, b);
        expression = `${a} - ${b}`;
        break;

      case "multiply":
        if (b === undefined) {
          throw new Error("Second number 'b' is required for multiplication");
        }
        result = calculatorFunctions.multiply(a, b);
        expression = `${a} × ${b}`;
        break;

      case "divide":
        if (b === undefined) {
          throw new Error("Second number 'b' is required for division");
        }
        result = calculatorFunctions.divide(a, b);
        expression = `${a} ÷ ${b}`;
        break;

      case "power":
        if (b === undefined) {
          throw new Error("Second number 'b' is required for power operation");
        }
        result = calculatorFunctions.power(a, b);
        expression = `${a} ^ ${b}`;
        break;

      case "sqrt":
        result = calculatorFunctions.sqrt(a);
        expression = `√${a}`;
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const response = `Calculation result: ${expression} = ${result}`;
    logger.info("Calculator operation completed", {
      operation,
      result,
      expression,
    });

    return {
      content: [
        {
          type: "text",
          text: response,
        },
      ],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Calculator operation failed", {
      operation,
      error: errorMessage,
    });

    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
    };
  }
};

// Calculator tool configuration
export const calculatorTool = {
  name: "calculator",
  description:
    "Perform basic arithmetic operations: add, subtract, multiply, divide, power, and square root",
  inputSchema: {
    operation: z.enum([
      "add",
      "subtract",
      "multiply",
      "divide",
      "power",
      "sqrt",
    ]),
    a: z.number(),
    b: z.number().optional(),
  },
  handler: calculatorHandler,
};
