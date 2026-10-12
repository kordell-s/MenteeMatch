import type { Claim, Level, Person, Role, Skill, Source } from "./types";

/** Every person and figure here is invented for a demo. Nothing is NCBA data. */
export const ORG = {
  name: "National Commercial Bank of Anguilla",
  short: "NCBA",
  staff: "about 180 staff (illustrative)",
};

export const SKILLS: Skill[] = [
  { id: "credit_analysis", name: "Credit analysis" },
  { id: "fin_statements", name: "Financial statements" },
  { id: "excel", name: "Excel modelling" },
  { id: "risk_rating", name: "Risk rating" },
  { id: "report_writing", name: "Report writing" },
  { id: "client_rel", name: "Client relationships" },
  { id: "product_knowledge", name: "Product knowledge" },
  { id: "sales", name: "Sales conversations" },
  { id: "aml_kyc", name: "AML/KYC" },
  { id: "reg_reporting", name: "Regulatory reporting" },
  { id: "investigations", name: "Investigations" },
  { id: "policy_writing", name: "Policy writing" },
  { id: "risk_frameworks", name: "Risk frameworks" },
  { id: "data_analysis", name: "Data analysis" },
  { id: "digital_channels", name: "Digital channels" },
  { id: "product_ownership", name: "Product ownership" },
  { id: "vendor_mgmt", name: "Vendor management" },
  { id: "presentation", name: "Presentation" },
];

const req = (skill: string, level: Level) => ({ skill, level });

export const ROLES: Role[] = [
  { id: "credit_analyst", title: "Credit Analyst", reqs: [req("credit_analysis", 2), req("fin_statements", 2), req("excel", 2), req("risk_rating", 1), req("report_writing", 1)] },
  { id: "relationship_officer", title: "Relationship Officer", reqs: [req("client_rel", 2), req("product_knowledge", 2), req("credit_analysis", 1), req("sales", 2), req("aml_kyc", 1)] },
  { id: "compliance_officer", title: "Compliance / AML Officer", reqs: [req("aml_kyc", 3), req("reg_reporting", 2), req("investigations", 2), req("policy_writing", 1)] },
  { id: "risk_officer", title: "Risk Officer", reqs: [req("risk_frameworks", 2), req("data_analysis", 2), req("reg_reporting", 2), req("presentation", 1), req("aml_kyc", 1)] },
  { id: "digital_lead", title: "Digital Banking Lead", reqs: [req("digital_channels", 2), req("product_ownership", 2), req("vendor_mgmt", 1), req("data_analysis", 1)] },
];

export function roleById(id: string): Role {
  const r = ROLES.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown role ${id}`);
  return r;
}

/** claim shorthand: c("excel", 2, "v") */
const c = (skill: string, level: Level, s: "v" | "s" | "h"): Claim => ({
  skill,
  level,
  source: ({ v: "verified", s: "self", h: "hr" } as const)[s] as Source,
});

export const PEOPLE: Person[] = [
  // Story
  { id: "keisha", name: "Keisha Brooks", title: "Customer Service Representative", team: "Customer Service", targetRoleId: "credit_analyst",
    claims: [c("report_writing", 1, "h"), c("credit_analysis", 1, "s"), c("fin_statements", 1, "s"), c("client_rel", 2, "s"), c("product_knowledge", 2, "h"), c("sales", 1, "s")] },
  { id: "andre", name: "Andre Hughes", title: "Credit Analyst", team: "Credit", roleId: "credit_analyst", madeMove: { from: "Teller", to: "credit_analyst", year: 2023 },
    claims: [c("credit_analysis", 3, "v"), c("fin_statements", 2, "v"), c("excel", 2, "v"), c("risk_rating", 2, "v"), c("report_writing", 2, "v"), c("client_rel", 1, "s")] },
  { id: "natalie", name: "Natalie Connor", title: "Credit Analyst", team: "Credit", roleId: "credit_analyst",
    claims: [c("credit_analysis", 2, "v"), c("fin_statements", 2, "v"), c("excel", 1, "v"), c("risk_rating", 1, "v"), c("report_writing", 2, "v")] },

  // Compliance bench (exactly four people within two skills)
  { id: "shanice", name: "Shanice Richardson", title: "Operations Officer", team: "Operations",
    claims: [c("aml_kyc", 3, "v"), c("reg_reporting", 2, "v"), c("investigations", 1, "s"), c("policy_writing", 1, "s")] },
  { id: "devon", name: "Devon Hodge", title: "Operations Officer", team: "Operations",
    claims: [c("aml_kyc", 2, "v"), c("reg_reporting", 2, "s"), c("investigations", 2, "s")] },
  { id: "tamara", name: "Tamara Gumbs", title: "Customer Service Representative", team: "Customer Service",
    claims: [c("aml_kyc", 2, "s"), c("reg_reporting", 1, "s"), c("investigations", 2, "v"), c("policy_writing", 1, "s")] },
  { id: "kareem", name: "Kareem Lake", title: "Teller", team: "Branch",
    claims: [c("aml_kyc", 3, "h"), c("reg_reporting", 2, "h"), c("investigations", 1, "s"), c("policy_writing", 1, "h")] },

  // Current role holders
  { id: "joy", name: "Joy Fleming", title: "Compliance Officer", team: "Compliance", roleId: "compliance_officer",
    claims: [c("aml_kyc", 3, "v"), c("reg_reporting", 2, "v"), c("investigations", 3, "v"), c("policy_writing", 2, "v")] },
  { id: "marlon", name: "Marlon Webster", title: "Risk Officer", team: "Risk", roleId: "risk_officer", madeMove: { from: "Operations Officer", to: "risk_officer", year: 2022 },
    claims: [c("risk_frameworks", 3, "v"), c("data_analysis", 2, "v"), c("reg_reporting", 2, "v"), c("presentation", 2, "v"), c("aml_kyc", 1, "v")] },
  { id: "sharon", name: "Sharon Banks", title: "Relationship Officer", team: "Retail Banking", roleId: "relationship_officer",
    claims: [c("client_rel", 3, "v"), c("product_knowledge", 2, "v"), c("credit_analysis", 1, "v"), c("sales", 2, "v"), c("aml_kyc", 1, "s")] },
  { id: "jerome", name: "Jerome Fleming", title: "Digital Banking Lead", team: "Digital", roleId: "digital_lead", madeMove: { from: "IT Support", to: "digital_lead", year: 2024 },
    claims: [c("digital_channels", 3, "v"), c("product_ownership", 2, "v"), c("vendor_mgmt", 2, "v"), c("data_analysis", 1, "v")] },

  // Other climbers
  { id: "alicia", name: "Alicia Rogers", title: "IT Support Specialist", team: "IT", targetRoleId: "digital_lead",
    claims: [c("digital_channels", 1, "s"), c("data_analysis", 1, "s"), c("vendor_mgmt", 1, "h")] },
  { id: "dwayne", name: "Dwayne Carty", title: "Teller", team: "Branch", targetRoleId: "relationship_officer",
    claims: [c("client_rel", 1, "s"), c("product_knowledge", 1, "h"), c("sales", 1, "s")] },
  { id: "monique", name: "Monique Harrigan", title: "Customer Service Representative", team: "Customer Service", targetRoleId: "relationship_officer",
    claims: [c("client_rel", 2, "s"), c("product_knowledge", 2, "s"), c("sales", 2, "s")] },
  { id: "leroy", name: "Leroy Proctor", title: "Operations Officer", team: "Operations", targetRoleId: "risk_officer",
    claims: [c("data_analysis", 1, "s"), c("reg_reporting", 1, "h"), c("presentation", 1, "s")] },
  { id: "trevor", name: "Trevor Hodge", title: "Operations Officer", team: "Operations", targetRoleId: "credit_analyst",
    claims: [c("fin_statements", 1, "s"), c("excel", 2, "s"), c("report_writing", 1, "s")] },

  // Everyone else (no target yet)
  { id: "kimberly", name: "Kimberly Lloyd", title: "Teller", team: "Branch", claims: [c("excel", 1, "s"), c("report_writing", 1, "h")] },
  { id: "omari", name: "Omari Smith", title: "IT Support Specialist", team: "IT",
    claims: [c("data_analysis", 2, "v"), c("digital_channels", 1, "s"), c("product_ownership", 1, "s")] },
  { id: "gail", name: "Gail Webster", title: "Branch Supervisor", team: "Branch",
    claims: [c("client_rel", 3, "v"), c("product_knowledge", 3, "v"), c("sales", 2, "v"), c("presentation", 2, "v"), c("report_writing", 2, "v")] },
  { id: "natasha", name: "Natasha Gumbs", title: "Customer Service Representative", team: "Customer Service", claims: [c("client_rel", 1, "h")] },
  { id: "sean", name: "Sean Mussington", title: "Teller", team: "Branch", claims: [c("product_knowledge", 1, "h"), c("sales", 1, "s")] },
  { id: "patrice", name: "Patrice Lake", title: "Operations Officer", team: "Operations", claims: [c("reg_reporting", 1, "s"), c("policy_writing", 1, "s")] },
  { id: "avery", name: "Avery Connor", title: "IT Support Specialist", team: "IT", claims: [c("vendor_mgmt", 1, "s"), c("digital_channels", 2, "s")] },
  { id: "hazel", name: "Hazel Brooks", title: "Finance Officer", team: "Finance",
    claims: [c("fin_statements", 2, "v"), c("excel", 3, "v"), c("report_writing", 2, "v"), c("data_analysis", 2, "s")] },
];

/** Friendlier milestone names for the scripted route. Other skills fall back to "<Skill> to level N". */
export const MILESTONE_TITLES: Record<string, string> = {
  credit_analysis: "Credit analysis in practice",
  fin_statements: "Reading financial statements",
  excel: "Excel modelling for credit",
  risk_rating: "Risk rating basics",
};

export const STORY = { employeeId: "keisha", mentorId: "andre", roleId: "credit_analyst" } as const;
