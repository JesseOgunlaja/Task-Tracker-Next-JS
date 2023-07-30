import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(5, {
    message: "Username must be more than 5 characters",
  })
  .max(25, {
    message: "Username must be less than 25 characters",
  })
  .regex(/^[a-zA-Z0-9]+$/, {
    message: "No symbols or spaces allowed",
  });

export const emailSchema = z.string().email();

export const passwordSchema = z
  .string()
  .min(8, {
    message: "Password must be more than 8 characters",
  })
  .max(64, {
    message: "Password must be less than 64 characters",
  })
  .regex(/^(?=.*[\W_])[a-zA-Z0-9\W_]+$/, {
    message:
      "String must contain at least one symbol (non-alphanumeric character).",
  });

const types = ["to-do", "in-progress", "done"];
const priorities = ["Low", "Medium", "High"];

export const tasksSchema = z.array(
  z.object({
    title: z.string().max(40, { message: "Title too long" }),
    date: z.string().max(40, { message: "Date too long" }), // Corrected the message here
    type: z
      .string()
      .refine((val: string) => !types.every(type => val != type), {
        message: "Invalid type",
      }),
    description: z.string().max(250, { message: "Description too long" }),
    priority: z
      .string()
      .refine(
        (val: string) => !priorities.every((priority) => val != priority),
        {
          message: "Invalid priority",
        }
      ),
  }).strict()
);