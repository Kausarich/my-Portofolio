"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="not-found">
      <span className="section-index">SOMETHING WENT A LITTLE SIDEWAYS</span>
      <h1>
        Let’s try
        <br />
        <span>that again.</span>
      </h1>
      <p>The page couldn’t load. Try refreshing in a moment.</p>
      <button className="button button-primary" onClick={reset}>
        Try again ↗
      </button>
    </main>
  );
}
