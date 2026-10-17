import { z } from "zod";
function httpUrl(v: string) {
  try {
    return ["https:", "http:"].includes(new URL(v).protocol);
  } catch {
    return false;
  }
}
const webUrl = z
  .string()
  .max(2000)
  .refine((v) => !v || httpUrl(v), "Use a complete http(s) URL");
const mediaUrl = z
  .string()
  .max(2000)
  .refine(
    (v) => !v || /^\/api\/media\/[a-zA-Z0-9.-]+$/.test(v) || httpUrl(v),
    "Upload a file or use an http(s) URL",
  );
export const profileSchema = z.object({
  fullName: z.string().min(2).max(80),
  headline: z.string().min(5).max(120),
  shortBio: z.string().min(10).max(600),
  aboutMarkdown: z.string().min(10).max(10000),
  location: z.string().max(120),
  email: z.email(),
  isAvailable: z.boolean(),
  availabilityTxt: z.string().min(2).max(100),
  avatarUrl: mediaUrl,
  resumeUrl: mediaUrl,
  socialLinks: z
    .array(
      z.object({
        platform: z.string().min(1).max(40),
        url: webUrl.refine(Boolean, "URL required"),
      }),
    )
    .max(10),
});
export const projectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(100),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase words separated by hyphens",
    ),
  summary: z.string().min(10).max(600),
  content: z.string().max(40000),
  thumbnail: mediaUrl,
  techStack: z.array(z.string().min(1).max(40)).max(15),
  liveUrl: webUrl,
  repoUrl: webUrl,
  featured: z.boolean(),
  published: z.boolean(),
  year: z.string().max(20),
  category: z.string().max(80),
  visual: z.enum(["forma", "wander", "north"]),
});
export const experienceSchema = z.object({
  id: z.string().min(1),
  role: z.string().min(2).max(100),
  company: z.string().min(2).max(100),
  period: z.string().min(2).max(80),
  description: z.string().max(2000),
  current: z.boolean(),
});
export const skillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  category: z.enum(["Frontend", "Backend", "Tools", "Design"]),
  description: z.string().max(200),
});
export const portfolioSchema = z
  .object({
    profile: profileSchema,
    projects: z.array(projectSchema).max(100),
    experiences: z.array(experienceSchema).max(50),
    skills: z.array(skillSchema).max(100),
  })
  .superRefine((v, ctx) => {
    for (const [key, values] of Object.entries({
      projects: v.projects,
      experiences: v.experiences,
      skills: v.skills,
    }))
      if (new Set(values.map((x) => x.id)).size !== values.length)
        ctx.addIssue({ code: "custom", message: "Duplicate IDs", path: [key] });
    if (new Set(v.projects.map((p) => p.slug)).size !== v.projects.length)
      ctx.addIssue({
        code: "custom",
        message: "Project slugs must be unique",
        path: ["projects"],
      });
  });
export type Profile = z.infer<typeof profileSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;
