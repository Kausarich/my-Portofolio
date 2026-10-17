import Image from "next/image";
import type { Project } from "@/lib/schema";

export function ProjectArt({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  if (project.thumbnail)
    return (
      <div className="custom-project-art">
        <Image
          src={project.thumbnail}
          alt={`${project.title} project preview`}
          fill
          sizes="(max-width: 767px) 90vw, 600px"
          className="object-cover"
          unoptimized
          priority={priority}
        />
      </div>
    );
  if (project.visual === "forma")
    return (
      <div className="project-art forma-art" aria-hidden="true">
        <div className="forma-window">
          <aside className="forma-sidebar">
            <b className="forma-logo">
              f<span>forma</span>
            </b>
            <span className="mock-workspace">Your workspace⌄</span>
            <span className="mock-nav-item selected">▦ &nbsp; Overview</span>
            <span className="mock-nav-item">◷ &nbsp; My tasks</span>
            <span className="mock-nav-item">▤ &nbsp; Projects</span>
            <span className="mock-nav-item">◉ &nbsp; Team</span>
            <small>WORKSPACE</small>
            <span className="mock-nav-item">● &nbsp; Design team</span>
            <span className="mock-nav-item">● &nbsp; Development</span>
            <div className="mock-sidebar-bottom">
              <span className="tiny-avatar">J</span> Jamie Chen <span>⌘ K</span>
            </div>
          </aside>
          <div className="forma-main">
            <header>
              <span>
                Workspace <i>/</i> Overview
              </span>
              <span>
                ⌕ &nbsp; ◌ &nbsp; <b className="tiny-avatar">J</b>
              </span>
            </header>
            <div className="mock-greeting">
              <div>
                <small>MONDAY, OCTOBER 12</small>
                <h4>A little focus. Big possibilities.</h4>
                <p>Here’s what’s happening in your workspace today.</p>
              </div>
              <span className="mock-new">+ New project</span>
            </div>
            <div className="mock-stats">
              <div>
                <span>Projects in progress ↗</span>
                <b>
                  12 <small>+2 this month</small>
                </b>
                <div className="mini-bars">▂ ▃ ▅ ▃ ▆ ▅ ▇ █</div>
              </div>
              <div>
                <span>Tasks completed ↗</span>
                <b>
                  48 <small>↑ 16.2%</small>
                </b>
                <div className="mini-line" />
              </div>
              <div>
                <span>Focus time ↗</span>
                <b>
                  32<span>h</span> <small>This week</small>
                </b>
                <div className="mini-bars muted">▃ ▆ ▄ █ ▆ ▄ ▇ ▅</div>
              </div>
            </div>
            <div className="mock-projects-heading">
              <b>
                Your projects <span>4</span>
              </b>
              <span>View all →</span>
            </div>
            <div className="mock-project-rows">
              {[
                "Website redesign",
                "Brand exploration",
                "Mobile experience",
              ].map((t, i) => (
                <div key={t}>
                  <span className={`mock-folder folder-${i}`}>▧</span>
                  <span>
                    <b>{t}</b>
                    <small>
                      {
                        [
                          "Design · 12 tasks",
                          "Branding · 8 tasks",
                          "Product · 16 tasks",
                        ][i]
                      }
                    </small>
                  </span>
                  <span className="mock-progress">
                    <i style={{ width: `${75 - i * 18}%` }} />
                  </span>
                  <span>{75 - i * 18}%</span>
                  <span className="mock-avatars">JD &nbsp; AC</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  if (project.visual === "wander")
    return (
      <div className="project-art wander-art" aria-hidden="true">
        <div className="wander-window">
          <div className="wander-photo" />
          <header>
            <b>
              wander<span>®</span>
            </b>
            <span>Discover &nbsp;&nbsp; Our story &nbsp;&nbsp; Journal</span>
            <span className="wander-button">Let’s go ↗</span>
          </header>
          <div className="wander-copy">
            <small>FOR THE WILD AT HEART</small>
            <h4>
              Less ordinary.
              <br />
              <em>More out there.</em>
            </h4>
            <p>
              Places that stay with you.
              <br />
              Journeys that change you.
            </p>
            <span className="wander-discover">Find your next adventure ↗</span>
          </div>
          <div className="wander-bottom">
            <span>01 — THE DOLOMITES, ITALY</span>
            <span>EXPLORE SLOWLY. FEEL EVERYTHING.</span>
          </div>
        </div>
      </div>
    );
  return (
    <div className="project-art north-art" aria-hidden="true">
      <div className="north-window">
        <header>
          <b>
            north<span>®</span>
          </b>
          <span>Independent by nature. &nbsp; ↗</span>
        </header>
        <div className="north-title">
          A different
          <br />
          kind of <em>north.</em>
          <span className="north-asterisk">✳</span>
        </div>
        <div className="north-rule" />
        <footer>
          <span>
            GOOD PEOPLE.
            <br />
            THOUGHTFUL DESIGN.
          </span>
          <span>
            BRAND STRATEGY
            <br />& DIGITAL EXPERIENCES
          </span>
          <b>
            STUDIO
            <br />
            NORTH ↗
          </b>
        </footer>
      </div>
    </div>
  );
}
