// The agent's "browser": a sandbox that can only read the fictional test pages
// shipped in public/sites/. It never makes a network request. Any other URL
// (real domains, the fictional .example domains, file:, javascript:, ..) is
// refused and the refusal is logged as an action.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parse, HTMLElement, NodeType, type Node } from "node-html-parser";
import type { ObservationMode } from "./types";

export const SITES_ROOT = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "sites");
const MAX_CONTENT_CHARS = 20_000;
const LOCAL_HOSTS = new Set(["local.test", "localhost", "127.0.0.1"]);

export type OpenResult =
  | { ok: true; path: string; content: string; sha256: string; truncated: boolean }
  | { ok: false; path: string | null; error: string };

/** Resolve a URL the model asked for to a file under public/sites, or explain why not. */
export function resolveLocalPath(rawUrl: string, root: string = SITES_ROOT): { path: string; file: string } | { error: string } {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") return { error: "No URL given." };
  let url: URL;
  try {
    url = new URL(rawUrl.trim(), "http://local.test/");
  } catch {
    return { error: "Not a valid URL." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: `Blocked: ${url.protocol} URLs are not allowed.` };
  }
  if (!LOCAL_HOSTS.has(url.hostname)) {
    return { error: `Blocked: ${url.hostname} is not on the local test site. This browser can only open paths under /sites/.` };
  }
  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return { error: "Not a valid URL path." };
  }
  if (!pathname.startsWith("/sites/")) {
    return { error: "Blocked: this browser can only open paths under /sites/." };
  }
  if (pathname.split("/").some((seg) => seg === ".." || seg === ".")) {
    return { error: "Blocked: path traversal is not allowed." };
  }
  const rel = pathname.slice("/sites/".length);
  let file = path.resolve(/*turbopackIgnore: true*/ root, rel);
  const rootResolved = path.resolve(/*turbopackIgnore: true*/ root);
  if (file !== rootResolved && !file.startsWith(rootResolved + path.sep)) {
    return { error: "Blocked: path is outside the test site." };
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(/*turbopackIgnore: true*/ file, "index.html");
  if (!file.endsWith(".html") || !existsSync(file)) {
    return { error: `404: no page at ${pathname}.` };
  }
  let normalized = pathname.replace(/index\.html$/, "");
  if (!normalized.endsWith("/") && !normalized.endsWith(".html")) normalized += "/";
  return { path: normalized, file };
}

const DROP_TAGS = new Set(["script", "style", "noscript", "template", "head"]);
const BLOCK_TAGS = new Set([
  "p", "div", "section", "article", "header", "footer", "main", "aside", "nav",
  "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr", "table", "ul", "ol", "dl", "dt", "dd", "br", "hr", "figure", "figcaption", "address",
]);

function isHidden(el: HTMLElement): boolean {
  if (el.hasAttribute("hidden")) return true;
  const style = (el.getAttribute("style") ?? "").replace(/\s+/g, "").toLowerCase();
  return style.includes("display:none") || style.includes("visibility:hidden");
}

/** Approximate what a sighted visitor sees: drops comments, scripts, and display:none / visibility:hidden / [hidden] elements. */
export function renderVisibleText(html: string): string {
  const root = parse(html, { comment: false, blockTextElements: { script: false, style: false, noscript: false, pre: true } });
  const out: string[] = [];
  const links: string[] = [];

  const walk = (node: Node) => {
    if (node.nodeType === NodeType.TEXT_NODE) {
      out.push(node.text.replace(/\s+/g, " "));
      return;
    }
    if (node.nodeType !== NodeType.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.rawTagName?.toLowerCase() ?? "";
    if (DROP_TAGS.has(tag) || isHidden(el)) return;
    const block = BLOCK_TAGS.has(tag);
    if (block) out.push("\n");
    if (tag === "td" || tag === "th") out.push(" | ");
    el.childNodes.forEach(walk);
    if (tag === "a") {
      const href = el.getAttribute("href");
      if (href) links.push(`- ${el.text.replace(/\s+/g, " ").trim() || "(no text)"} -> ${href}`);
    }
    if (block) out.push("\n");
  };
  walk(root);

  const text = out
    .join("")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0)
    .join("\n");
  return links.length ? `${text}\n\nLinks on this page:\n${links.join("\n")}` : text;
}

export function openPage(rawUrl: string, mode: ObservationMode, root: string = SITES_ROOT): OpenResult {
  const resolved = resolveLocalPath(rawUrl, root);
  if ("error" in resolved) return { ok: false, path: null, error: resolved.error };
  const html = readFileSync(/*turbopackIgnore: true*/ resolved.file, "utf8");
  let content = mode === "raw_html" ? html : renderVisibleText(html);
  const truncated = content.length > MAX_CONTENT_CHARS;
  if (truncated) content = content.slice(0, MAX_CONTENT_CHARS) + "\n[truncated]";
  const sha256 = createHash("sha256").update(content).digest("hex");
  return { ok: true, path: resolved.path, content, sha256, truncated };
}
