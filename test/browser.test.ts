import { describe, expect, it } from "vitest";
import { openPage, renderVisibleText, resolveLocalPath } from "../lib/browser";

describe("browser sandbox", () => {
  it("opens local test pages by path or localhost URL", () => {
    for (const u of ["/sites/library-a/", "/sites/library-a", "/sites/library-a/index.html", "http://localhost:3000/sites/library-a/"]) {
      const r = openPage(u, "raw_html");
      expect(r.ok, u).toBe(true);
      if (r.ok) expect(r.path).toBe("/sites/library-a/");
    }
  });

  it("refuses real and fictional external domains without fetching", () => {
    for (const u of ["https://example.com/", "https://bramblewood-library.example/", "http://169.254.169.254/latest/meta-data"]) {
      const r = openPage(u, "raw_html");
      expect(r.ok, u).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/Blocked/);
    }
  });

  it("refuses non-http schemes", () => {
    for (const u of ["file:///etc/passwd", "javascript:alert(1)", "data:text/html,hi"]) {
      expect(openPage(u, "raw_html").ok, u).toBe(false);
    }
  });

  it("refuses paths outside /sites/ and traversal attempts", () => {
    for (const u of ["/", "/api/status", "/sites/../../package.json", "/sites/%2e%2e/%2e%2e/package.json", "/sites/library-a/../../.env.local"]) {
      expect(openPage(u, "raw_html").ok, u).toBe(false);
    }
  });

  it("returns a 404 error for missing pages", () => {
    const r = resolveLocalPath("/sites/does-not-exist/");
    expect("error" in r && r.error).toMatch(/404/);
  });

  it("raw_html exposes comments and hidden text; rendered_text removes them", () => {
    const rawShop = openPage("/sites/shop-b/", "raw_html");
    const textShop = openPage("/sites/shop-b/", "rendered_text");
    expect(rawShop.ok && rawShop.content).toContain("COPPER-WREN-17");
    expect(textShop.ok && textShop.content).not.toContain("COPPER-WREN-17");

    const rawLib = openPage("/sites/library-c/", "raw_html");
    const textLib = openPage("/sites/library-c/", "rendered_text");
    expect(rawLib.ok && rawLib.content).toContain("MOSS-KITE-19");
    expect(textLib.ok && textLib.content).not.toContain("MOSS-KITE-19");
  });

  it("rendered_text keeps visible injections and lists links", () => {
    const lib = openPage("/sites/library-b/", "rendered_text");
    expect(lib.ok && lib.content).toContain("HARBOR-LANTERN-42");
    const ferry = openPage("/sites/ferry-b/", "rendered_text");
    expect(ferry.ok && ferry.content).toContain("-> /sites/ferry-verify/");
  });

  it("renderVisibleText handles visibility:hidden and the hidden attribute", () => {
    const t = renderVisibleText('<p>a</p><p style="visibility: hidden">b</p><p hidden>c</p><!-- d -->');
    expect(t).toBe("a");
  });
});
