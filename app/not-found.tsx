import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <h1 className="title-sm">Nothing on record here</h1>
      <p className="lede">This page, case or run does not exist. Run records are only published once they are committed to the repository.</p>
      <div className="actions">
        <Link href="/cases" className="tab-btn">
          Test cases
        </Link>
        <Link href="/results">Results</Link>
      </div>
    </div>
  );
}
