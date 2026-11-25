import { test, expect } from "@playwright/test";

test("NCBA demo: wall, bench, climb, route, verify, payoff, reset", async ({ page }) => {
  await page.goto("/demo/ncba");

  // Beat 0
  await expect(page.getByText("Prepared for National Commercial Bank of Anguilla")).toBeVisible();
  await expect(page.getByText("Synthetic demo data")).toBeVisible();
  await page.getByRole("button", { name: "Open the wall" }).click();

  // Beat 1
  const callout = page.getByTestId("callout");
  await expect(callout).toContainText("AML/KYC");
  await expect(callout).toContainText("3 roles");
  await expect(callout).toContainText("4 people");

  // Beat 2
  await page.getByRole("button", { name: /^Compliance \/ AML Officer/ }).click();
  await expect(page.getByTestId("bench-row")).toHaveCount(4);

  // Keisha's cell before verification
  await page.getByRole("button", { name: /^Credit Analyst/ }).click();
  await expect(page.getByTestId("cell-keisha-fin_statements")).toHaveAttribute("data-state", "short");

  // Beat 3
  await page.getByRole("radio", { name: "Employee" }).click();
  await expect(page.getByRole("heading", { name: "Keisha Brooks" })).toBeVisible();
  await page.getByRole("button", { name: "Request Andre" }).click();
  await expect(page.getByText("Your manager has been notified.")).toBeVisible();

  // Beat 4
  await page.getByRole("radio", { name: "Mentor" }).click();
  await expect(page.getByTestId("milestone")).toHaveCount(4);
  const fin = page.getByTestId("milestone").filter({ hasText: "Financial statements · level 2" });
  await fin.getByRole("button", { name: "Mark reached" }).click();
  await expect(page.getByText("Confirm Keisha can now do Financial statements at level 2?")).toBeVisible();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(fin.getByText("Verified")).toBeVisible();

  // Beat 5
  await page.getByRole("radio", { name: "L&D admin" }).click();
  await page.getByRole("button", { name: /^Credit Analyst/ }).click();
  await expect(page.getByTestId("cell-keisha-fin_statements")).toHaveAttribute("data-state", "verified");

  // Reset
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("button", { name: "Open the wall" })).toBeVisible();
});
