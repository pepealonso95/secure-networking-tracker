import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const password = process.env.E2E_PASSWORD;
const apiUrl = process.env.E2E_API_URL;
const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;

async function signUp(page: Page, label: string) {
  const email = `privacy-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill(`Privacy ${label}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/contacts$/, { timeout: 15_000 });
}

async function readJwt(page: Page): Promise<string> {
  const token = await page.evaluate(async (base) => {
    const response = await fetch(`${base}/get-session`, { credentials: "include" });
    const data = await response.json();
    return response.headers.get("set-auth-jwt") ?? data?.session?.token ?? null;
  }, authUrl);
  if (!token) throw new Error("Neon Auth did not return a session JWT");
  return token;
}

test.describe("two-account privacy", () => {
  test.skip(!password || !apiUrl || !authUrl, "Set E2E_PASSWORD, E2E_API_URL, and NEXT_PUBLIC_NEON_AUTH_URL");
  test.skip(({ isMobile }) => Boolean(isMobile), "The API privacy boundary is viewport-independent");

  test("user B cannot list, update, or delete user A's contact", async ({ browser }) => {
    const contextA: BrowserContext = await browser.newContext();
    const pageA = await contextA.newPage();
    await signUp(pageA, "user-a");

    const contactName = `Only user A ${Date.now()}`;
    const createPromise = pageA.waitForResponse((response) => response.url().endsWith("/api/contacts") && response.request().method() === "POST");
    await pageA.getByRole("button", { name: "Add contact" }).first().click();
    await pageA.getByLabel("Name").fill(contactName);
    await pageA.getByRole("button", { name: "Add contact" }).last().click();
    const createResponse = await createPromise;
    const created = (await createResponse.json()).data as { id: number };
    await expect(pageA.locator("p:visible").filter({ hasText: contactName }).first()).toBeVisible();

    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await signUp(pageB, "user-b");
    await expect(pageB.getByText(contactName)).toHaveCount(0);

    const tokenB = await readJwt(pageB);
    const listResponse = await pageB.request.get(`${apiUrl}/api/contacts`, { headers: { Authorization: `Bearer ${tokenB}` } });
    expect((await listResponse.json()).data).toEqual([]);

    const updateResponse = await pageB.request.patch(`${apiUrl}/api/contacts/${created.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
      data: { name: "User B tried to overwrite this" },
    });
    expect(updateResponse.status()).toBe(404);

    const deleteResponse = await pageB.request.delete(`${apiUrl}/api/contacts/${created.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect(deleteResponse.status()).toBe(404);

    await pageA.reload();
    await expect(pageA.locator("p:visible").filter({ hasText: contactName }).first()).toBeVisible();
    await pageA.getByRole("button", { name: `Delete ${contactName}` }).click();
    await pageA.getByRole("button", { name: "Delete contact" }).click();
    await expect(pageA.locator("p:visible").filter({ hasText: contactName })).toHaveCount(0);

    await contextA.close();
    await contextB.close();
  });
});
