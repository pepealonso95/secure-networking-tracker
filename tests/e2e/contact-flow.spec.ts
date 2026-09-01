import { expect, test } from "@playwright/test";
import path from "node:path";

const password = process.env.E2E_PASSWORD;

test.describe("authenticated contact flow", () => {
  test.skip(!password, "Set E2E_PASSWORD to run live authentication tests");

  test("signup, CRUD, persistence, filters, validation, and signout", async ({ page }, testInfo) => {
    const email = `network-keeper-${testInfo.project.name}-${Date.now()}@example.com`;
    const originalName = `Maya Chen ${Date.now()}`;
    const updatedName = `Maya Chen updated ${Date.now()}`;

    await page.goto("/sign-up");
    await page.getByLabel("Name").fill("Network Keeper Tester");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/contacts$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Your people" })).toBeVisible();

    await page.getByRole("button", { name: "Add contact" }).first().click();
    await page.getByLabel("Name").fill(originalName);
    await page.getByLabel("Company").fill("Berkeley Haas");
    await page.getByLabel("Role").fill("Product leader");
    await page.getByLabel("Where you met").fill("AI founders dinner");
    await page.getByRole("combobox", { name: "Priority", exact: true }).click();
    await page.getByRole("option", { name: "High" }).click();
    await page.getByLabel("Notes").fill("Follow up about secure product design.");
    await page.getByRole("button", { name: "Add contact" }).last().click();
    await expect(page.locator("p:visible").filter({ hasText: originalName }).first()).toBeVisible();

    await page.reload();
    await expect(page.locator("p:visible").filter({ hasText: originalName }).first()).toBeVisible();

    await page.getByRole("button", { name: `Edit ${originalName}` }).click();
    await page.getByLabel("Name").fill(updatedName);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.locator("p:visible").filter({ hasText: updatedName }).first()).toBeVisible();

    await page.getByLabel("Search contacts").fill("secure product");
    await expect(page.locator("p:visible").filter({ hasText: updatedName }).first()).toBeVisible();
    await page.getByLabel("Filter by priority").click();
    await page.getByRole("option", { name: "Low priority" }).click();
    await expect(page.getByRole("heading", { name: "No contacts match" })).toBeVisible();
    await page.getByLabel("Filter by priority").click();
    await page.getByRole("option", { name: "All priorities" }).click();
    await page.getByLabel("Search contacts").fill("");

    if (process.env.CAPTURE_EVIDENCE) {
      await page.addStyleTag({ content: "header .text-xs { visibility: hidden; }" });
      await page.screenshot({
        path: path.join(process.cwd(), "docs", "evidence", "screenshots", `${testInfo.project.name}-contacts.png`),
        fullPage: true,
      });
    }

    await page.getByRole("button", { name: "Add contact" }).first().click();
    await page.getByRole("button", { name: "Add contact" }).last().click();
    await expect(page.getByText("Name is required")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    await page.getByRole("button", { name: `Delete ${updatedName}` }).click();
    await page.getByRole("button", { name: "Delete contact" }).click();
    await expect(page.locator("p:visible").filter({ hasText: updatedName })).toHaveCount(0);

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/sign-in$/, { timeout: 15_000 });

    if (process.env.CAPTURE_EVIDENCE && testInfo.project.name === "desktop-chromium") {
      const closeToasts = page.getByRole("button", { name: "Close toast" });
      await expect(closeToasts).toHaveCount(0, { timeout: 10_000 });
      await page.screenshot({
        path: path.join(process.cwd(), "docs", "evidence", "screenshots", "sign-in.png"),
        fullPage: true,
      });
    }

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/contacts$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Add the first person" })).toBeVisible();
  });
});
