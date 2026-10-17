// Runs only against a local instance and generated local test credentials.
// Install dev tooling with: npm install -D playwright axe-core
import { chromium } from "playwright";
import { readFile, mkdir, writeFile, unlink } from "node:fs/promises";
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const base = process.env.QA_URL || "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("This mutating QA script only runs against localhost.");
const privateAccess = await readFile(".owner-access.txt", "utf8");
const secretPath = privateAccess.match(/^URL: (.+)$/m)[1].trim();
const email = privateAccess.match(/^Email: (.+)$/m)[1].trim();
const password = privateAccess.match(/^Password: (.+)$/m)[1].trim();
const results = [];
const errors = [];
const record = (label, detail = true) => {
  results.push({ label, detail });
  console.log(`PASS: ${label}`);
};
await mkdir(".artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.QA_BROWSER ||
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydrat|uncaught|TypeError|ReferenceError/i.test(message.text())
    )
      errors.push(message.text());
  });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1 }).waitFor();
  assert.equal(
    await page
      .locator('a[href*="dashboard"],a[href*="portal-"],a[href="/login"]')
      .count(),
    0,
  );
  record("Public UI has no owner navigation");
  const source = await (await page.request.get(base)).text();
  assert(!source.includes(secretPath));
  record("Private route is absent from the public HTML payload");
  for (const route of [
    "/dashboard",
    "/dashboard/projects",
    "/login",
    "/admin",
    "/signin",
    "/wp-admin",
    "/api/auth/signin",
  ]) {
    assert.equal(
      (await page.request.get(`${base}${route}`)).status(),
      404,
      `Expected 404 for ${route}`,
    );
  }
  record("All seven anonymous/private route checks return HTTP 404");
  assert.equal(
    (
      await page.request.post(`${base}/api/media`, { data: "anonymous" })
    ).status(),
    401,
  );
  record("Anonymous uploads are rejected");
  for (const width of [1440, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base, { waitUntil: "domcontentloaded" });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      `Horizontal overflow at ${width}`,
    );
    await page.screenshot({
      path: `.artifacts/portfolio-${width}.png`,
      fullPage: true,
    });
    record(`Public layout has no horizontal overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "About", exact: true })
    .click();
  assert.equal(new URL(page.url()).hash, "#about");
  assert.equal(
    await page.getByRole("button", { name: "Open menu" }).count(),
    1,
  );
  record("Mobile navigation opens, navigates and closes");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  await page.screenshot({
    path: ".artifacts/portfolio-light.png",
    fullPage: true,
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  record("Light/dark theme toggle persists after reload");
  await page.getByRole("button", { name: /hello@example.com/ }).click();
  await page.getByRole("status").filter({ hasText: "Email copied" }).waitFor();
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    "hello@example.com",
  );
  record("Contact copies the actual email to the clipboard");
  await page.goto(`${base}/projects/forma`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Forma.", exact: true }).waitFor();
  assert((await page.getByRole("heading", { name: "The idea" }).count()) > 0);
  await page.screenshot({
    path: ".artifacts/case-study-mobile.png",
    fullPage: true,
  });
  record("Project case study loads and renders its content");
  await page.goto(`${base}${secretPath}`, { waitUntil: "domcontentloaded" });
  assert(
    (
      await page.locator('meta[name="robots"]').getAttribute("content")
    ).includes("noindex"),
  );
  await page.getByLabel("Email address").fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("incorrect-test-password");
  await page.getByRole("button", { name: "Enter your workspace" }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Unable to sign in" })
    .waitFor();
  record("Incorrect owner credentials are rejected");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Enter your workspace" }).click();
  await page.waitForURL("**/dashboard");
  await page.getByRole("heading", { name: "A little about you." }).waitFor();
  record("Owner sign-in opens the protected dashboard");
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      `Dashboard overflow at ${width}`,
    );
    await page.screenshot({
      path: `.artifacts/dashboard-${width}.png`,
      fullPage: true,
    });
  }
  record("Dashboard fits desktop, tablet and mobile viewports");
  const originalLocation = await page
    .getByLabel("Location", { exact: true })
    .inputValue();
  await page
    .getByLabel("Location", { exact: true })
    .fill("QA preview location");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByText("Based in QA preview location")
    .waitFor();
  await page.getByRole("button", { name: "Close preview" }).click();
  record("Live preview renders unsaved profile changes");
  await page.getByRole("button", { name: "Save & publish" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  const publicPage = await context.newPage();
  await publicPage.goto(base, { waitUntil: "domcontentloaded" });
  await publicPage.getByText("Based in QA preview location").waitFor();
  await publicPage.locator(".owner-pill").waitFor();
  assert.equal(await publicPage.locator(".owner-pill").count(), 1);
  record(
    "Save persists content, revalidates public view and displays owner tools",
  );
  await page.getByLabel("Location", { exact: true }).fill(originalLocation);
  await page.getByRole("button", { name: "Save & publish" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  record("Original profile content restored through the editor");
  await page
    .getByRole("button", { name: "Projects", exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Add project" }).click();
  await page
    .getByLabel("Project title", { exact: true })
    .fill("QA Temporary Project");
  await page
    .getByLabel("URL slug", { exact: true })
    .fill("qa-temporary-project");
  await page.getByRole("button", { name: "Save & publish" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  assert.equal(
    (await page.request.get(`${base}/projects/qa-temporary-project`)).status(),
    404,
  );
  const draftSource = await (await page.request.get(base)).text();
  assert(!draftSource.includes("QA Temporary Project"));
  record("Draft projects stay out of public pages and HTML payloads");
  await page.getByLabel("Published on portfolio").check();
  await page.getByRole("button", { name: "Save & publish" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  assert.equal(
    (await page.request.get(`${base}/projects/qa-temporary-project`)).status(),
    200,
  );
  record("Publishing makes the new project available immediately");
  await page
    .getByRole("button", { name: "Delete QA Temporary Project", exact: true })
    .click();
  await page.getByRole("button", { name: "Remove item", exact: true }).click();
  await page.getByRole("button", { name: "Save & publish" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  assert.equal(
    (await page.request.get(`${base}/projects/qa-temporary-project`)).status(),
    404,
  );
  record("Project deletion removes its public case study");
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page
    .getByLabel("Profile photo", { exact: true })
    .setInputFiles("public/images/dolomites.jpg");
  await page
    .getByRole("heading", { name: "Make it picture perfect." })
    .waitFor();
  await page.waitForFunction(() => {
    const image = document.querySelector(".crop-preview img");
    return image && image.complete && image.naturalWidth > 0;
  });
  await page.getByLabel("Aspect ratio").selectOption("0.8");
  const uploadResponse = page.waitForResponse(
    (r) => r.url().endsWith("/api/media") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Crop & upload" }).click();
  const uploaded = await uploadResponse;
  assert.equal(uploaded.status(), 200);
  const uploadedFile = (await uploaded.json()).url;
  await page.getByRole("link", { name: "View current file" }).waitFor();
  const mediaResponse = await page.request.get(base + uploadedFile);
  assert.equal(mediaResponse.headers()["content-type"], "image/webp");
  assert.equal(mediaResponse.status(), 200);
  const dimensions = await page.evaluate(async (url) => {
    const bitmap = await createImageBitmap(await (await fetch(url)).blob());
    return { width: bitmap.width, height: bitmap.height };
  }, uploadedFile);
  assert.equal(dimensions.width / dimensions.height, 0.8);
  record("Photo crop uploads a real 4:5 WebP image and serves it correctly");
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await page.getByRole("button", { name: "Save & publish" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  if (/^\/api\/media\/[a-f0-9-]{36}\.webp$/.test(uploadedFile))
    await unlink(path.join(".data", "media", path.basename(uploadedFile)));
  const rejected = await page.request.post(`${base}/api/media`, {
    headers: { Origin: base },
    multipart: {
      file: {
        name: "not-an-image.png",
        mimeType: "image/png",
        buffer: Buffer.from("This is not a valid PNG."),
      },
    },
  });
  assert.equal(rejected.status(), 400);
  record("Upload validation rejects a file with a forged image MIME type");
  const crossOrigin = await page.request.post(`${base}/api/media`, {
    headers: { Origin: "https://untrusted.example" }, data: "rejected before parsing",
  });
  assert.equal(crossOrigin.status(), 403);
  record("Authenticated uploads from an unrelated origin are rejected");
  await page.goto(`${base}/dashboard?quick=profile`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator(".quick-dashboard").waitFor();
  await page.screenshot({ path: ".artifacts/quick-edit.png", fullPage: true });
  record("Owner quick edit opens the editor drawer");
  const cookies = await context.cookies();
  assert(cookies.some((c) => c.name.includes("session-token") && c.httpOnly));
  record("Owner session cookie is HttpOnly");
  await page.goto(`${base}/dashboard`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL(base + "/");
  assert.equal((await page.request.get(`${base}/dashboard`)).status(), 404);
  record("Sign-out revokes access to the private dashboard");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const accessibility = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    });
    return result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({ html: n.html, summary: n.failureSummary })),
    }));
  });
  await writeFile(
    ".artifacts/accessibility.json",
    JSON.stringify(accessibility, null, 2),
  );
  assert.equal(errors.length, 0, `Browser errors: ${errors.join("; ")}`);
  record("No uncaught browser JavaScript errors");
  await writeFile(
    ".artifacts/browser-qa.json",
    JSON.stringify(
      {
        results,
        errors,
        accessibility,
        baseline:
          "No previous screenshot baseline exists; visual regression comparison is inconclusive.",
      },
      null,
      2,
    ),
  );
  console.log(
    `Completed ${results.length} checks. Accessibility findings: ${accessibility.length}. Screenshots: ${path.resolve(".artifacts")}`,
  );
} finally {
  await browser.close();
}
