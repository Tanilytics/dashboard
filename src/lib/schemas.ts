import { z } from "zod";

export const loginSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

const registerBaseSchema = z.object({
	email: z.email("Invalid email address"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain an uppercase letter")
		.regex(/[0-9]/, "Password must contain a number"),
	confirmPassword: z.string(),
});

export const registerInputSchema = registerBaseSchema.omit({
	confirmPassword: true,
});

export const registerSchema = registerBaseSchema.refine(
	(data) => data.password === data.confirmPassword,
	{
		message: "Passwords must match",
		path: ["confirmPassword"],
	},
);

export const createSiteSchema = z.object({
	name: z.string().min(1, "Site name is required").max(100),
	domain: z.string().min(1, "Domain is required").max(253),
});

export const updateSiteSettingsSchema = z.object({
	settings: z.record(z.string(), z.any()).optional(),
	retentionDays: z.number().int().min(30).optional(),
	rateLimitRps: z.number().int().min(1).optional(),
});

export const addMemberSchema = z.object({
	email: z.email("Invalid email address"),
	role: z.enum(["admin", "editor", "viewer"]),
});

export const dateRangeSchema = z.enum(["24h", "7d", "30d", "90d"]);

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterServerInput = z.infer<typeof registerInputSchema>;
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
