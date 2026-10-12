/** Display labels for the Prisma `Skill` enum, grouped by field. MentorMatch covers many careers, not only tech. */
export const SKILL_GROUPS: { label: string; skills: string[] }[] = [
  {
    label: "Code",
    skills: ["JAVASCRIPT", "TYPESCRIPT", "REACT", "NODE_JS", "PYTHON", "JAVA", "CSHARP", "CPLUSPLUS", "GO", "RUBY", "PHP", "SQL", "NOSQL"],
  },
  {
    label: "Systems & cloud",
    skills: ["SYSTEM_DESIGN", "MICROSERVICES", "DEVOPS", "AWS", "AZURE", "DOCKER", "KUBERNETES"],
  },
  {
    label: "Data & AI",
    skills: ["DATA_SCIENCE", "MACHINE_LEARNING", "DEEP_LEARNING", "COMPUTER_VISION", "NLP", "MLOPS", "BIG_DATA", "STATISTICS"],
  },
  {
    label: "Mobile",
    skills: ["REACT_NATIVE", "FLUTTER", "IOS", "ANDROID", "SWIFT", "KOTLIN", "MOBILE_UI", "APP_STORE"],
  },
  {
    label: "Design",
    skills: ["UX", "UI", "FIGMA", "DESIGN_SYSTEMS", "ACCESSIBILITY", "PORTFOLIO_REVIEW", "MOTION_DESIGN", "USER_RESEARCH"],
  },
  {
    label: "Business",
    skills: ["FINANCE", "ACCOUNTING", "SALES", "OPERATIONS", "PROJECT_MANAGEMENT", "CONSULTING", "HUMAN_RESOURCES", "BUSINESS_STRATEGY", "MARKET_ANALYSIS", "STARTUPS"],
  },
  {
    label: "Aviation",
    skills: ["PILOT_TRAINING", "FLIGHT_OPERATIONS", "AIRCRAFT_MAINTENANCE", "AIR_TRAFFIC_CONTROL", "AVIATION_SAFETY", "AIRLINE_OPERATIONS", "AVIATION_MANAGEMENT"],
  },
  {
    label: "Product & marketing",
    skills: ["PRODUCT_MANAGEMENT", "AGILE", "SCRUM", "DIGITAL_MARKETING", "CONTENT_STRATEGY", "SEO", "SOCIAL_MEDIA", "BRANDING", "GROWTH_HACKING", "COPYWRITING", "STORYTELLING"],
  },
  {
    label: "Career",
    skills: ["INTERVIEW_PREP", "RESUME_REVIEW", "CAREER_COACHING", "PUBLIC_SPEAKING", "NETWORKING", "LEADERSHIP", "TEAM_MANAGEMENT"],
  },
];

const SPECIAL: Record<string, string> = {
  NODE_JS: "Node.js",
  TYPESCRIPT: "TypeScript",
  JAVASCRIPT: "JavaScript",
  CSHARP: "C#",
  CPLUSPLUS: "C++",
  SQL: "SQL",
  NOSQL: "NoSQL",
  AWS: "AWS",
  NLP: "NLP",
  MLOPS: "MLOps",
  UX: "UX",
  UI: "UI",
  SEO: "SEO",
  IOS: "iOS",
  REACT_NATIVE: "React Native",
  MOBILE_UI: "Mobile UI",
  DEVOPS: "DevOps",
  GO: "Go",
  HUMAN_RESOURCES: "HR",
  AIR_TRAFFIC_CONTROL: "Air traffic control",
  PHP: "PHP",
};

export function skillLabel(skill: string): string {
  if (SPECIAL[skill]) return SPECIAL[skill];
  return skill
    .toLowerCase()
    .split("_")
    .map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Skill overlap as intersection over union, the same measure the matcher uses. */
export function skillOverlap(a: string[], b: string[]) {
  const A = new Set(a.map((s) => s.toUpperCase()));
  const B = new Set(b.map((s) => s.toUpperCase()));
  const shared = [...A].filter((s) => B.has(s));
  const union = new Set([...A, ...B]).size;
  return { shared, score: union === 0 ? 0 : shared.length / union };
}

/** Plain-language labels for the other enums the UI shows. */
export const GOAL_LABELS: Record<string, string> = {
  LAND_FIRST_ROLE: "Land my first role",
  GET_CERTIFIED: "Earn a licence or certification",
  TRANSITION_CAREER: "Switch careers",
  INTERVIEW_PREP: "Prepare for interviews",
  RESUME_REVIEW: "Improve my résumé",
  BUILD_PROJECTS: "Build a portfolio of work",
  CAREER_GUIDANCE: "Get career guidance",
  NETWORKING: "Grow my network",
  PUBLIC_SPEAKING: "Speak with confidence",
  GET_INTO_TECH: "Get into tech",
  LEARN_CODING: "Learn to code",
  FIND_MENTOR: "Find a mentor",
};

export const LEVEL_LABELS: Record<string, string> = {
  STUDENT: "Student",
  ENTRY: "Entry level",
  MID: "Mid level",
  SENIOR: "Senior",
  LEAD: "Lead",
};

export const FIELD_LABELS: Record<string, string> = {
  TECHNOLOGY: "Tech",
  BUSINESS: "Business",
  AVIATION: "Aviation",
  DESIGN: "Design",
  MARKETING: "Marketing",
  HEALTH: "Health",
  CREATIVE: "Creative",
  MUSIC: "Music",
  OTHER: "Other",
};

/** Any SCREAMING_SNAKE enum value as a readable phrase. */
export function enumLabel(v: string): string {
  return GOAL_LABELS[v] ?? LEVEL_LABELS[v] ?? FIELD_LABELS[v] ?? skillLabel(v);
}
