import { getPortfolio } from "@/lib/store";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/portfolio";
import { ProjectArt } from "@/components/project-art";
import { Reveal } from "@/components/motion";
import type { Metadata } from "next";
export const revalidate = 3600;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getPortfolio()).projects.find(
    (p) => p.slug === slug && p.published,
  );
  return { title: p?.title ?? "Project not found", description: p?.summary };
}
export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPortfolio();
  const projects = data.projects.filter((p) => p.published);
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <>
      <Navigation name={data.profile.fullName} detail />
      <main className="case-study section-shell">
        <Link className="text-link case-back" href="/#work">
          ← Back to selected work
        </Link>
        <Reveal>
          <div className="section-top">
            <span className="section-index">{project.category}</span>
            <span className="small-label">{project.year}</span>
          </div>
          <h1>
            {project.title}
            <span>.</span>
          </h1>
          <p className="case-summary">{project.summary}</p>
          <div className="case-meta">
            <div className="project-tags">
              {project.techStack.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="case-links">
              {project.liveUrl && (
                <a
                  className="text-link"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live website ↗
                </a>
              )}
              {project.repoUrl && (
                <a
                  className="text-link"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Source code ↗
                </a>
              )}
            </div>
          </div>
          <div className="case-art">
            <ProjectArt project={project} priority />
          </div>
        </Reveal>
        <article className="case-content">
          {project.content.split(/\n\n+/).map((block, i) => {
            if (block.startsWith("## ")) {
              const [title, ...body] = block.split("\n");
              return (
                <section key={i}>
                  <span className="section-index">0{i + 1}</span>
                  <div>
                    <h2>{title.slice(3)}</h2>
                    {body.length > 0 && <p>{body.join("\n")}</p>}
                  </div>
                </section>
              );
            }
            return <p key={i}>{block}</p>;
          })}
        </article>
        {next && next.id !== project.id && (
          <Link href={`/projects/${next.slug}`} className="next-project">
            <span className="section-index">UP NEXT</span>
            <strong>{next.title} ↗</strong>
          </Link>
        )}
        <Link href="/#contact" className="text-link">
          Let’s build something together ↗
        </Link>
      </main>
    </>
  );
}
