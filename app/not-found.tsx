import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <span className="section-index">404 / A WRONG TURN</span>
      <h1>
        Nothing here.
        <br />
        <span>Plenty to explore.</span>
      </h1>
      <p>This page doesn’t exist, or has moved somewhere new.</p>
      <Link className="button button-primary" href="/">
        Back to the good stuff ↗
      </Link>
    </main>
  );
}
