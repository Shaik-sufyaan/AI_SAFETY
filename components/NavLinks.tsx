"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/threat-model", label: "Threat model" },
  { href: "/cases", label: "Test cases" },
  { href: "/method", label: "Method & scoring" },
  { href: "/results", label: "Results" },
  { href: "/limitations", label: "Limitations" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="nav caps" aria-label="Sections">
      <ol>
        {LINKS.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link href={l.href} aria-current={active ? "page" : undefined}>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
