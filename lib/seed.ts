import type { Portfolio } from "./schema";
// Editable demonstration content. Replace with real work and contact details.
export const seed: Portfolio = {
  profile: {
    fullName: "Gian Kausari",
    headline: "Frontend developer & creative thinker",
    shortBio:
      "I turn complex ideas into intuitive digital experiences. A little design thinking, a lot of thoughtful code, and an obsession with the details.",
    aboutMarkdown:
      "I’m Gian, a developer who cares as much about how things feel as how they work. I bring design and engineering together to build thoughtful experiences for the web.\n\nFrom the first wireframe to the last micro-interaction, I love finding that sweet spot between something beautiful and something useful. Always learning. Always making.",
    location: "Indonesia",
    email: "hello@example.com",
    isAvailable: true,
    availabilityTxt: "Available for opportunities",
    avatarUrl: "",
    resumeUrl: "",
    socialLinks: [],
  },
  projects: [
    {
      id: "forma",
      title: "Forma",
      slug: "forma",
      summary: "A calmer space to plan, focus, and do your best work.",
      content:
        "## The idea\nWork tools should help you find your flow. Forma is a product design and frontend concept that brings projects, priorities, and team updates into one considered workspace.\n\n## The approach\nA restrained palette, a clear information hierarchy, and purposeful motion keep the interface focused. Reusable components make every view feel familiar.\n\n## The details\nResponsive layouts, keyboard-friendly interactions, and accessible color contrast are part of the foundation. This is a demonstration case study; replace it with your own project and results.",
      thumbnail: "",
      techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
      liveUrl: "",
      repoUrl: "",
      featured: true,
      published: true,
      year: "2026",
      category: "Product design · Development",
      visual: "forma",
    },
    {
      id: "wander",
      title: "Wander",
      slug: "wander",
      summary: "Finding extraordinary places, a little off the beaten path.",
      content:
        "## The idea\nA travel discovery concept for curious people. Wander gives destinations room to tell their story, with immersive photography and simple, useful navigation.\n\n## The approach\nThe visual system pairs warm neutrals with landscape imagery. Content-first layouts adapt naturally from a desktop to a phone.\n\n## The details\nBuilt as a demonstration of an editorial travel experience. Replace this case study with your own process, links, and outcomes.",
      thumbnail: "",
      techStack: ["React", "Motion", "Figma"],
      liveUrl: "",
      repoUrl: "",
      featured: true,
      published: true,
      year: "2026",
      category: "Web design · Development",
      visual: "wander",
    },
    {
      id: "north",
      title: "Studio North",
      slug: "studio-north",
      summary: "An independent studio. A distinct point of view.",
      content:
        "## The idea\nAn expressive website concept for an independent creative studio. The project explores bold typography, generous spacing, and a warm editorial identity.\n\n## The approach\nThe design gives the studio’s work center stage. Subtle interactions make browsing feel considered and keep the focus on the content.\n\n## The details\nA demonstration project for this portfolio. Add your real creative brief, implementation decisions, and results here.",
      thumbnail: "",
      techStack: ["Next.js", "CSS", "Motion"],
      liveUrl: "",
      repoUrl: "",
      featured: false,
      published: true,
      year: "2026",
      category: "Brand experience · Development",
      visual: "north",
    },
  ],
  experiences: [
    {
      id: "independent",
      role: "Building for the web",
      company: "Independent projects",
      period: "Present",
      description:
        "Exploring the intersection of design and code through personal projects, interface experiments, and continuous learning.",
      current: true,
    },
    {
      id: "learning",
      role: "Learning by making",
      company: "Personal practice",
      period: "Ongoing",
      description:
        "Developing a foundation in modern frontend engineering, thoughtful user interfaces, and accessible experiences.",
      current: false,
    },
  ],
  skills: [
    {
      id: "next",
      name: "Next.js",
      category: "Frontend",
      description:
        "Server rendering, App Router, and full-stack web experiences.",
    },
    {
      id: "react",
      name: "React",
      category: "Frontend",
      description: "Reusable components and interactive interfaces.",
    },
    {
      id: "ts",
      name: "TypeScript",
      category: "Frontend",
      description: "Clear contracts and safer application code.",
    },
    {
      id: "tailwind",
      name: "Tailwind CSS",
      category: "Frontend",
      description: "Responsive layouts and consistent design systems.",
    },
    {
      id: "figma",
      name: "Figma",
      category: "Design",
      description: "From the first idea to interactive prototypes.",
    },
    {
      id: "node",
      name: "Node.js",
      category: "Backend",
      description: "APIs and server-side application logic.",
    },
    {
      id: "git",
      name: "Git",
      category: "Tools",
      description: "Version control and collaborative development.",
    },
    {
      id: "motion",
      name: "Motion",
      category: "Frontend",
      description: "Purposeful animation and micro-interactions.",
    },
  ],
};
