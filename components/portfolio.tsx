"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowUpRightIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  CopyIcon,
  CheckIcon,
  MapPinIcon,
  CodeIcon,
  SparkleIcon,
  ArrowUpIcon,
  XIcon,
  ListIcon,
  DownloadSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  GlobeIcon,
} from "@phosphor-icons/react";
import type { Portfolio } from "@/lib/schema";
import { Magnetic, Orbital, Reveal, SmoothScroll, Spotlight } from "./motion";
import { ProjectArt } from "./project-art";

const sections = ["Work", "About", "Experience", "Contact"];
export function Navigation({
  name = "Gian Kausari",
  detail = false,
}: {
  name?: string;
  detail?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [active, setActive] = useState("");
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", scroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-20% 0px -55% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.toLowerCase());
      if (el) observer.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", scroll);
      observer.disconnect();
    };
  }, []);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-shell">
        <Link href="/" className="brand" aria-label={`${name} home`}>
          {initials}
          <span>.</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className={menu ? "nav-links open" : "nav-links"}
        >
          {sections.map((s) => (
            <a
              href={`${detail ? "/" : ""}#${s.toLowerCase()}`}
              key={s}
              className={active === s.toLowerCase() ? "active" : ""}
              onClick={() => setMenu(false)}
            >
              {active === s.toLowerCase() && (
                <motion.span className="nav-indicator" layoutId="active-nav" />
              )}
              {s}
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <button
            className="theme-toggle icon-button"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle color theme"
          >
            <SunIcon className="sun-icon" size={18} />
            <MoonIcon className="moon-icon" size={18} />
          </button>
          <a className="nav-contact" href={`${detail ? "/" : ""}#contact`}>
            Let’s talk <ArrowUpRightIcon size={15} />
          </a>
          <button
            className="mobile-menu icon-button"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
          >
            {menu ? <XIcon size={23} /> : <ListIcon size={23} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function ScrollBio({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "end 48%"],
  });
  const words = text.split(" ");
  return (
    <p ref={ref} className="about-statement">
      {words.map((word, i) => (
        <BioWord
          key={i}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
        >
          {word}
        </BioWord>
      ))}
    </p>
  );
}
function BioWord({
  children,
  progress,
  range,
}: {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.3, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}
function SkillIcon({ name }: { name: string }) {
  if (name === "React") return <span className="skill-react">⚛</span>;
  if (name === "Next.js") return <span className="skill-next">N</span>;
  if (name === "TypeScript") return <span className="skill-ts">TS</span>;
  if (name === "Figma") return <span className="skill-figma">◉</span>;
  if (name === "Tailwind CSS") return <span className="skill-tailwind">≈</span>;
  return <CodeIcon size={24} />;
}
export function PortfolioView({
  data,
  preview = false,
}: {
  data: Portfolio;
  preview?: boolean;
}) {
  const { profile, projects, skills, experiences } = data;
  const published = projects.filter((p) => p.published);
  const [allWork, setAllWork] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 60%"],
  });
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setToast("Email copied to clipboard");
    } catch {
      setToast("Could not copy. You can select the email address directly.");
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => {
      setCopied(false);
      setToast("");
    }, 3000);
  }
  return (
    <div className={preview ? "portfolio preview-portfolio" : "portfolio"}>
      {!preview && (
        <>
          <SmoothScroll />
          <Navigation name={profile.fullName} />
          <OwnerTools />
        </>
      )}
      <main id="top">
        <section className="hero section-shell" aria-labelledby="hero-title">
          <div className="hero-intro">
            <Reveal>
              <div className="hero-eyebrow">
                <span className="eyebrow-line" /> {profile.headline}
              </div>
              <h1 id="hero-title">
                Thoughtful code.
                <br />
                <span className="hero-muted">Meaningful</span>
                <br />
                <span className="hero-accent">
                  experiences<span className="hero-period">.</span>
                </span>
              </h1>
              <p className="hero-description">{profile.shortBio}</p>
              <div className="hero-actions">
                <Magnetic>
                  <a href="#work" className="button button-primary">
                    Explore my work <ArrowUpRightIcon size={19} />
                  </a>
                </Magnetic>
                <Magnetic>
                  <a href="#contact" className="button button-quiet">
                    Let’s connect <ArrowRightIcon size={17} />
                  </a>
                </Magnetic>
              </div>
            </Reveal>
          </div>
          <Reveal className="hero-visual" delay={0.18}>
            <Orbital />
          </Reveal>
          <div className="hero-bottom">
            <div className="hero-person">
              <span className="mini-monogram">
                {profile.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span>
                <b>Hey, I’m {profile.fullName.split(" ")[0]}.</b>
                <span className="hero-location">
                  <MapPinIcon size={12} /> Based in {profile.location}
                </span>
              </span>
            </div>
            {profile.isAvailable && (
              <span className="availability">
                <span className="status-dot" />
                {profile.availabilityTxt}
              </span>
            )}
            <a className="scroll-cue" href="#work">
              <span>SCROLL TO EXPLORE</span>
              <ArrowDownIcon size={15} />
            </a>
          </div>
        </section>

        <section
          id="work"
          className="work-section section-shell"
          aria-labelledby="work-heading"
        >
          <Reveal direction="left" distance={24}>
            <div className="section-top">
              <span className="section-index">01 / SELECTED WORK</span>
              <span className="section-aside">
                A few things I’ve put my heart into.
              </span>
            </div>
            <div className="section-heading">
              <h2 id="work-heading">
                Ideas turned <span>into experiences.</span>
              </h2>
              <span className="work-count">
                ({String(published.length).padStart(2, "0")})
              </span>
            </div>
          </Reveal>
          <div className="projects-grid">
            {(allWork ? published : published.slice(0, 3)).map((project, i) => (
              <Reveal
                key={project.id}
                className={`project-card ${i === 0 ? "project-featured" : ""}`}
                direction={i === 0 || i % 2 === 1 ? "left" : "right"}
                distance={36}
                delay={(i % 3) * 0.1}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="project-link"
                  aria-label={`View ${project.title} case study`}
                >
                  <Spotlight className="project-image">
                    <ProjectArt project={project} />
                    <div className="project-image-top">
                      <span className="project-number">0{i + 1}</span>
                      {project.featured && (
                        <span className="featured-badge">
                          <SparkleIcon size={11} /> FEATURED
                        </span>
                      )}
                    </div>
                    <span className="project-open">
                      <ArrowUpRightIcon size={24} />
                    </span>
                    <span className="project-hover-label">
                      View case study <ArrowUpRightIcon size={16} />
                    </span>
                  </Spotlight>
                  <div className="project-info">
                    <div>
                      <span className="project-category">
                        {project.category}
                      </span>
                      <h3>
                        {project.title}
                        <ArrowUpRightIcon size={22} />
                      </h3>
                      <p>{project.summary}</p>
                    </div>
                    <span className="project-year">{project.year}</span>
                  </div>
                </Link>
                <div className="project-tags">
                  {project.techStack.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
          {published.length > 3 && (
            <button
              className="button button-outline view-all"
              onClick={() => setAllWork(!allWork)}
            >
              {allWork
                ? "Show selected projects"
                : `View all ${published.length} projects`}
              <ArrowRightIcon size={17} />
            </button>
          )}
          <div className="work-footnote">
            <span>CONSIDERED DESIGN. PURPOSEFUL DEVELOPMENT.</span>
            <span>
              GOOD THINGS TAKE CURIOSITY. <SparkleIcon size={13} />
            </span>
          </div>
        </section>

        <section
          id="about"
          className="about-section section-shell"
          aria-labelledby="about-heading"
        >
          <Reveal className="about-side">
            <span className="section-index">02 / A LITTLE ABOUT ME</span>
            <div className="portrait-card">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  fill
                  sizes="300px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="portrait-graphic">
                  <span className="portrait-cross">+</span>
                  <span className="portrait-initials">
                    {profile.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                    <i>.</i>
                  </span>
                  <span className="portrait-caption">CURIOUS BY DEFAULT.</span>
                  <div className="portrait-orbit" />
                </div>
              )}
              <span className="portrait-sticker">
                <CodeIcon size={17} /> A human behind the pixels.
              </span>
            </div>
          </Reveal>
          <Reveal className="about-content">
            <span className="small-label">THE PERSON BEHIND THE WORK</span>
            <h2 id="about-heading">
              A developer’s mind.
              <br />
              <span>A designer’s eye.</span>
            </h2>
            <ScrollBio text={profile.aboutMarkdown.split("\n\n")[0]} />
            {profile.aboutMarkdown
              .split("\n\n")
              .slice(1)
              .map((p, i) => (
                <p className="about-secondary" key={i}>
                  {p}
                </p>
              ))}
            <div className="about-principles">
              <span>
                <CodeIcon size={17} /> Clean, considered code
              </span>
              <span>
                <SparkleIcon size={17} /> Details make the difference
              </span>
            </div>
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Download résumé <DownloadSimpleIcon size={17} />
              </a>
            )}
          </Reveal>
        </section>

        <section
          id="experience"
          className="experience-section section-shell"
          aria-labelledby="experience-heading"
        >
          <Reveal className="experience-intro">
            <span className="section-index">03 / THE JOURNEY</span>
            <h2 id="experience-heading">
              Always curious.
              <br />
              <span>Always evolving.</span>
            </h2>
            <p>
              Every project is a chance to learn something new and make
              something a little better.
            </p>
            <span className="experience-note">
              <span className="status-dot" /> A work in progress, in the best
              way.
            </span>
          </Reveal>
          <div className="timeline" ref={timelineRef}>
            <motion.div
              className="timeline-progress"
              style={{ scaleY: scrollYProgress }}
            />
            {experiences.map((e) => (
              <Reveal
                className={`timeline-item ${e.current ? "current" : ""}`}
                key={e.id}
              >
                <span className="timeline-dot" />
                <div className="timeline-top">
                  <span className="small-label">{e.period}</span>
                  {e.current && <span className="now-badge">NOW</span>}
                </div>
                <h3>{e.role}</h3>
                <span className="timeline-company">{e.company}</span>
                <p>{e.description}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="skills-section" aria-labelledby="skills-heading">
          <div className="section-shell skills-header">
            <span className="section-index" id="skills-heading">
              04 / TOOLS OF THE TRADE
            </span>
            <span className="section-aside">
              The right tools. A thoughtful approach.
            </span>
          </div>
          <div className="skills-track">
            <div className="skills-marquee">
              {[0, 1].map((copy) => (
                <div
                  className="skills-group"
                  aria-hidden={copy === 1 ? true : undefined}
                  key={copy}
                >
                  {skills.map((s) => (
                    <div
                      className="skill-item"
                      key={s.id}
                      tabIndex={copy === 0 ? 0 : -1}
                    >
                      <SkillIcon name={s.name} />
                      <span>{s.name}</span>
                      <span className="skill-tooltip">
                        {s.description || s.category}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="section-shell skill-categories">
            <span>FRONTEND</span>
            <span>BACKEND</span>
            <span>DESIGN</span>
            <span>AND A LITTLE BIT OF EVERYTHING IN BETWEEN.</span>
          </div>
        </section>

        <section
          id="contact"
          className="contact-section section-shell"
          aria-labelledby="contact-heading"
        >
          <Reveal>
            <div className="contact-top">
              <span className="section-index">05 / WHAT’S NEXT?</span>
              {profile.isAvailable && (
                <span className="availability">
                  <span className="status-dot" /> Open to something great
                </span>
              )}
            </div>
            <div className="contact-layout">
              <div>
                <h2 id="contact-heading">
                  Have something
                  <br />
                  in <span>mind?</span>
                  <span className="contact-asterisk">✳</span>
                </h2>
                <p>
                  A project, a possibility, or just a hello.
                  <br />
                  I’d love to hear from you.
                </p>
              </div>
              <Magnetic className="contact-circle-wrap">
                <a
                  className="contact-circle"
                  href={`mailto:${profile.email}`}
                  aria-label={`Send an email to ${profile.email}`}
                >
                  <ArrowUpRightIcon size={44} weight="light" />
                  <span>LET’S MAKE IT HAPPEN</span>
                </a>
              </Magnetic>
            </div>
            <div className="contact-bottom">
              <button className="email-copy" onClick={copyEmail}>
                <span>{profile.email}</span>
                {copied ? <CheckIcon size={21} /> : <CopyIcon size={21} />}
                <span className="email-copy-hint">
                  {copied ? "COPIED!" : "CLICK TO COPY"}
                </span>
              </button>
              <div className="social-links">
                {profile.socialLinks.map((s) => (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    key={s.platform}
                  >
                    {s.platform.toLowerCase().includes("github") ? (
                      <GithubLogoIcon size={18} />
                    ) : s.platform.toLowerCase().includes("linkedin") ? (
                      <LinkedinLogoIcon size={18} />
                    ) : (
                      <GlobeIcon size={18} />
                    )}
                    {s.platform}
                    <ArrowUpRightIcon size={13} />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <footer className="site-footer section-shell">
        <span>
          © {new Date().getFullYear()} {profile.fullName}
        </span>
        <span>Made with care. Built with intention.</span>
        <a href="#top">
          BACK TO TOP <ArrowUpIcon size={13} />
        </a>
      </footer>
      <div className="toast" role="status" aria-live="polite">
        {toast && (
          <span>
            <CheckIcon size={17} />
            {toast}
          </span>
        )}
      </div>
    </div>
  );
}

function OwnerTools() {
  const [owner, setOwner] = useState(false);
  useEffect(() => {
    fetch("/api/owner")
      .then((r) => r.json())
      .then((d) => setOwner(d.owner))
      .catch(() => {});
    const key = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "l"
      ) {
        e.preventDefault();
        window.location.assign(
          new URL("/api/owner-entry", window.location.origin).href,
        );
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  if (!owner) return null;
  return (
    <>
      <div className="owner-pill">
        <span className="status-dot" /> Owner mode
        <Link href="/dashboard?quick=profile">
          Quick edit <ArrowUpRightIcon size={14} />
        </Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>
      <div className="owner-section-tools" aria-label="Quick edit sections">
        <Link href="/dashboard?quick=profile">Edit profile</Link>
        <Link href="/dashboard?quick=projects">Edit work</Link>
        <Link href="/dashboard?quick=experience">Edit experience</Link>
        <Link href="/dashboard?quick=skills">Edit skills</Link>
      </div>
    </>
  );
}
