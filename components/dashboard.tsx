"use client";
import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Reorder } from "motion/react";
import {
  ArrowUpRightIcon,
  UserIcon,
  SquaresFourIcon,
  PathIcon,
  StackIcon,
  SignOutIcon,
  FloppyDiskIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  DotsSixVerticalIcon,
  XIcon,
  UploadSimpleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import {
  profileSchema,
  type Profile,
  type Portfolio,
  type Project,
} from "@/lib/schema";
import { updatePortfolioAction, logoutAction } from "@/app/actions";
import { PortfolioView } from "./portfolio";

type Tab = "profile" | "projects" | "experience" | "skills";
const tabs = [
  { id: "profile" as const, label: "Profile", icon: UserIcon },
  { id: "projects" as const, label: "Projects", icon: SquaresFourIcon },
  { id: "experience" as const, label: "Experience", icon: PathIcon },
  { id: "skills" as const, label: "Skills", icon: StackIcon },
];
export function Dashboard({
  initialData,
  quickMode = false,
  initialTab = "profile",
}: {
  initialData: Portfolio;
  quickMode?: boolean;
  initialTab?: Tab;
}) {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [preview, setPreview] = useState(false);
  const quick = quickMode;
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState("");
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "projects" | "experiences" | "skills";
    id: string;
  } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const savedSnapshot = useRef(JSON.stringify(initialData));
  const profileForm = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData.profile,
    mode: "onBlur",
  });
  const {
    register,
    formState: { errors },
    getValues,
    setValue,
    trigger,
  } = profileForm;
  useEffect(() => {
    if (!dirty) return;
    const before = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty]);
  useEffect(() => {
    if (preview) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [preview]);
  function update<K extends keyof Portfolio>(key: K, value: Portfolio[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setDirty(true);
    setStatus("");
  }
  function updateProject(id: string, patch: Partial<Project>) {
    update(
      "projects",
      data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }
  function move(
    type: "projects" | "experiences" | "skills",
    index: number,
    delta: number,
  ) {
    const items = [...data[type]];
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    setData((d) => ({ ...d, [type]: items }));
    setDirty(true);
  }
  async function save() {
    setStatus("");
    if (!(await trigger())) {
      setTab("profile");
      setStatus("Check the highlighted profile fields.");
      return;
    }
    const next = { ...data, profile: getValues() };
    const submitted = JSON.stringify(next);
    startTransition(async () => {
      const result = await updatePortfolioAction(next);
      if (result.error) setStatus(result.error);
      else {
        savedSnapshot.current = submitted;
        setDirty(
          JSON.stringify({ ...data, profile: getValues() }) !== submitted,
        );
        setStatus("Published. Your portfolio is up to date.");
      }
    });
  }
  function reset() {
    const saved = JSON.parse(savedSnapshot.current) as Portfolio;
    setData(saved);
    profileForm.reset(saved.profile);
    setDirty(false);
    setStatus("Changes discarded.");
  }
  const previewData = { ...data, profile: getValues() };
  return (
    <div className={`dashboard ${quick ? "quick-dashboard" : ""}`}>
      {quick && (
        <div className="quick-background" inert>
          <PortfolioView data={previewData} preview />
        </div>
      )}
      <aside className="dashboard-sidebar">
        <Link className="brand" href="/">
          GK<span>.</span>
        </Link>
        <span className="section-index">YOUR LITTLE CORNER</span>
        <div className="workspace-label">
          <span className="workspace-avatar">GK</span>
          <span>
            <b>Portfolio workspace</b>
            <small>Personal edition</small>
          </span>
        </div>
        <nav aria-label="Workspace sections">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => {
                setTab(t.id);
                setEditing(null);
              }}
            >
              <t.icon size={19} />
              {t.label}
              {t.id === "projects" && <span>{data.projects.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/" target="_blank" className="text-link">
            Visit your portfolio <ArrowUpRightIcon size={16} />
          </Link>
          <form action={logoutAction}>
            <button className="text-link">
              <SignOutIcon size={16} /> Sign out
            </button>
          </form>
          <span className="session-label">
            <span className="status-dot" /> Owner session active
          </span>
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-header">
          <span>
            <span className="breadcrumb">Workspace /</span>{" "}
            {tabs.find((t) => t.id === tab)?.label}
          </span>
          <div>
            <span className={`save-status ${dirty ? "unsaved" : ""}`}>
              {dirty ? "Unsaved changes" : "All changes saved"}
            </span>
            <button
              className="button button-outline button-sm"
              onClick={() => setPreview(true)}
            >
              <EyeIcon size={16} /> Preview
            </button>
            {quick && (
              <Link
                href="/"
                aria-label="Close quick edit"
                className="icon-button"
              >
                <XIcon size={22} />
              </Link>
            )}
          </div>
        </header>
        <main className="editor-content">
          <div className="editor-heading">
            <div>
              <span className="section-index">MAKE IT YOURS</span>
              <h1>
                {tab === "profile"
                  ? "A little about you."
                  : tab === "projects"
                    ? "Things you’ve made."
                    : tab === "experience"
                      ? "Your journey so far."
                      : "Your creative toolkit."}
              </h1>
              <p>
                {tab === "profile"
                  ? "Introduce yourself. Tell your story. Let your personality through."
                  : tab === "projects"
                    ? "Good work deserves a good home. Add, edit, and arrange your projects."
                    : tab === "experience"
                      ? "The people, places, and projects that shaped your path."
                      : "The tools you reach for to turn an idea into something real."}
              </p>
            </div>
          </div>
          <div className="demo-notice">
            The starting content is a demonstration. Replace the project
            concepts, contact email, and profile with your real information.
          </div>
          <fieldset disabled={pending} className="editor-fieldset">
            {tab === "profile" && (
              <div
                className="profile-editor"
                onChange={() => {
                  setDirty(true);
                  setStatus("");
                }}
              >
                <section className="editor-panel">
                  <div className="panel-heading">
                    <h2>The introduction</h2>
                    <p>The first things people get to know about you.</p>
                  </div>
                  <div className="form-grid">
                    <label>
                      Full name
                      <input {...register("fullName")} />
                      {errors.fullName && (
                        <small className="form-error">
                          {errors.fullName.message}
                        </small>
                      )}
                    </label>
                    <label>
                      Headline / role
                      <input {...register("headline")} />
                      {errors.headline && (
                        <small className="form-error">
                          {errors.headline.message}
                        </small>
                      )}
                    </label>
                    <label>
                      Location
                      <input {...register("location")} />
                    </label>
                    <label>
                      Contact email
                      <input type="email" {...register("email")} />
                      {errors.email && (
                        <small className="form-error">
                          {errors.email.message}
                        </small>
                      )}
                    </label>
                    <label className="full-width">
                      Short bio
                      <textarea rows={3} {...register("shortBio")} />
                      {errors.shortBio && (
                        <small className="form-error">
                          {errors.shortBio.message}
                        </small>
                      )}
                      <small>
                        Shown in the hero. Keep it personal and to the point.
                      </small>
                    </label>
                    <label className="full-width">
                      About you
                      <textarea rows={7} {...register("aboutMarkdown")} />
                      {errors.aboutMarkdown && (
                        <small className="form-error">
                          {errors.aboutMarkdown.message}
                        </small>
                      )}
                      <small>Separate paragraphs with a blank line.</small>
                    </label>
                  </div>
                </section>
                <section className="editor-panel">
                  <div className="panel-heading">
                    <h2>Open to what’s next?</h2>
                    <p>Let people know when you’re available.</p>
                  </div>
                  <label className="toggle-label">
                    <span>
                      <b>Available for opportunities</b>
                      <small>
                        Show the green availability indicator on your portfolio.
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      {...register("isAvailable")}
                    />
                  </label>
                  <label>
                    Availability message
                    <input {...register("availabilityTxt")} />
                    {errors.availabilityTxt && (
                      <small className="form-error">
                        {errors.availabilityTxt.message}
                      </small>
                    )}
                  </label>
                </section>
                <section className="editor-panel">
                  <div className="panel-heading">
                    <h2>A face. A story. A résumé.</h2>
                    <p>
                      Upload your portrait and the latest version of your
                      résumé.
                    </p>
                  </div>
                  <div className="form-grid">
                    <MediaUploader
                      key={`avatar-${getValues("avatarUrl")}`}
                      label="Profile photo"
                      accept="image/png,image/jpeg,image/webp"
                      initialUrl={getValues("avatarUrl")}
                      onUpload={(url) => {
                        setValue("avatarUrl", url, { shouldDirty: true });
                        setDirty(true);
                      }}
                      crop
                    />
                    <MediaUploader
                      label="Résumé (PDF)"
                      accept="application/pdf"
                      initialUrl={getValues("resumeUrl")}
                      onUpload={(url) => {
                        setValue("resumeUrl", url, { shouldDirty: true });
                        setDirty(true);
                      }}
                    />
                  </div>
                </section>
                <section className="editor-panel">
                  <div className="panel-heading">
                    <h2>Elsewhere on the internet</h2>
                    <p>
                      Your social profiles, design explorations, or open source
                      work.
                    </p>
                  </div>
                  {getValues("socialLinks").map((s, i) => (
                    <div className="social-editor-row" key={i}>
                      <label>
                        Platform
                        <input
                          {...register(`socialLinks.${i}.platform`)}
                          defaultValue={s.platform}
                          placeholder="GitHub"
                        />
                      </label>
                      <label>
                        URL
                        <input
                          {...register(`socialLinks.${i}.url`)}
                          defaultValue={s.url}
                          type="url"
                          placeholder="https://…"
                        />
                      </label>
                      <button
                        type="button"
                        aria-label={`Remove ${s.platform || "social link"}`}
                        className="icon-button danger"
                        onClick={() => {
                          setValue(
                            "socialLinks",
                            getValues("socialLinks").filter((_, n) => n !== i),
                          );
                          setDirty(true);
                          setData({ ...data });
                        }}
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  ))}
                  {errors.socialLinks && (
                    <p className="form-error">
                      Each social link needs a name and a valid http(s) URL.
                    </p>
                  )}
                  <button
                    className="text-link"
                    onClick={() => {
                      setValue("socialLinks", [
                        ...getValues("socialLinks"),
                        { platform: "", url: "" },
                      ]);
                      setDirty(true);
                      setData({ ...data });
                    }}
                  >
                    <PlusIcon size={17} /> Add social link
                  </button>
                </section>
              </div>
            )}

            {tab === "projects" && (
              <>
                <div className="editor-list-top">
                  <span className="small-label">
                    {data.projects.length} PROJECTS · DRAG TO REORDER
                  </span>
                  <button
                    className="button button-primary button-sm"
                    onClick={() => {
                      const id = crypto.randomUUID();
                      update("projects", [
                        ...data.projects,
                        {
                          id,
                          title: "Untitled project",
                          slug: `project-${id.slice(0, 8)}`,
                          summary: "A short description of your new project.",
                          content:
                            "## The idea\nTell the story behind your work.",
                          thumbnail: "",
                          techStack: [],
                          liveUrl: "",
                          repoUrl: "",
                          featured: false,
                          published: false,
                          year: String(new Date().getFullYear()),
                          category: "Design · Development",
                          visual: "forma",
                        },
                      ]);
                      setEditing(id);
                    }}
                  >
                    <PlusIcon size={16} /> Add project
                  </button>
                </div>
                <Reorder.Group
                  axis="y"
                  values={data.projects}
                  onReorder={(items) => update("projects", items)}
                  className="project-editor-list"
                >
                  {data.projects.map((p, i) => (
                    <Reorder.Item
                      value={p}
                      key={p.id}
                      className="editor-panel project-editor-item"
                    >
                      <div className="project-editor-top">
                        <DotsSixVerticalIcon
                          className="drag-handle"
                          size={23}
                        />
                        <button
                          className="project-edit-title"
                          onClick={() =>
                            setEditing(editing === p.id ? null : p.id)
                          }
                        >
                          <b>{p.title}</b>
                          <span>/{p.slug}</span>
                        </button>
                        <span
                          className={`publication-badge ${p.published ? "published" : ""}`}
                        >
                          {p.published ? "Published" : "Draft"}
                        </span>
                        <button
                          className="icon-button"
                          aria-label={`Move ${p.title} up`}
                          disabled={i === 0}
                          onClick={() => move("projects", i, -1)}
                        >
                          <ArrowUpIcon size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Move ${p.title} down`}
                          disabled={i === data.projects.length - 1}
                          onClick={() => move("projects", i, 1)}
                        >
                          <ArrowDownIcon size={16} />
                        </button>
                        <button
                          className="icon-button danger"
                          aria-label={`Delete ${p.title}`}
                          onClick={() =>
                            setDeleteTarget({ type: "projects", id: p.id })
                          }
                        >
                          <TrashIcon size={17} />
                        </button>
                      </div>
                      {editing === p.id && (
                        <div className="project-edit-fields form-grid">
                          <label>
                            Project title
                            <input
                              value={p.title}
                              onChange={(e) =>
                                updateProject(p.id, { title: e.target.value })
                              }
                            />
                          </label>
                          <label>
                            URL slug
                            <input
                              value={p.slug}
                              onChange={(e) =>
                                updateProject(p.id, { slug: e.target.value })
                              }
                            />
                          </label>
                          <label>
                            Category
                            <input
                              value={p.category}
                              onChange={(e) =>
                                updateProject(p.id, {
                                  category: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label>
                            Year
                            <input
                              value={p.year}
                              onChange={(e) =>
                                updateProject(p.id, { year: e.target.value })
                              }
                            />
                          </label>
                          <label className="full-width">
                            Summary
                            <textarea
                              value={p.summary}
                              onChange={(e) =>
                                updateProject(p.id, { summary: e.target.value })
                              }
                              rows={2}
                            />
                          </label>
                          <label className="full-width">
                            Case study
                            <textarea
                              value={p.content}
                              onChange={(e) =>
                                updateProject(p.id, { content: e.target.value })
                              }
                              rows={9}
                            />
                            <small>
                              Use ## headings and blank lines to structure your
                              story.
                            </small>
                          </label>
                          <label className="full-width">
                            Technologies
                            <input
                              defaultValue={p.techStack.join(", ")}
                              onChange={(e) => {
                                updateProject(p.id, {
                                  techStack: e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                });
                              }}
                              placeholder="Next.js, TypeScript, Figma"
                            />
                          </label>
                          <label>
                            Live website URL
                            <input
                              type="url"
                              value={p.liveUrl}
                              onChange={(e) =>
                                updateProject(p.id, { liveUrl: e.target.value })
                              }
                            />
                          </label>
                          <label>
                            Repository URL
                            <input
                              type="url"
                              value={p.repoUrl}
                              onChange={(e) =>
                                updateProject(p.id, { repoUrl: e.target.value })
                              }
                            />
                          </label>
                          <label>
                            Default cover design
                            <select
                              value={p.visual}
                              onChange={(e) =>
                                updateProject(p.id, {
                                  visual: e.target.value as Project["visual"],
                                })
                              }
                            >
                              <option value="forma">
                                Forma · Product interface
                              </option>
                              <option value="wander">
                                Wander · Editorial travel
                              </option>
                              <option value="north">
                                North · Creative studio
                              </option>
                            </select>
                          </label>
                          <MediaUploader
                            key={`cover-${p.id}-${p.thumbnail}`}
                            label="Custom cover image"
                            accept="image/png,image/jpeg,image/webp"
                            initialUrl={p.thumbnail}
                            onUpload={(url) =>
                              updateProject(p.id, { thumbnail: url })
                            }
                          />
                          <label className="check-label">
                            <input
                              type="checkbox"
                              checked={p.published}
                              onChange={(e) =>
                                updateProject(p.id, {
                                  published: e.target.checked,
                                })
                              }
                            />{" "}
                            Published on portfolio
                          </label>
                          <label className="check-label">
                            <input
                              type="checkbox"
                              checked={p.featured}
                              onChange={(e) =>
                                updateProject(p.id, {
                                  featured: e.target.checked,
                                })
                              }
                            />{" "}
                            Featured project
                          </label>
                        </div>
                      )}
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                {!data.projects.length && (
                  <div className="empty-state">
                    Your next project starts here. Add your first one above.
                  </div>
                )}
              </>
            )}

            {tab === "experience" && (
              <>
                <div className="editor-list-top">
                  <span className="small-label">
                    {data.experiences.length} CHAPTERS
                  </span>
                  <button
                    className="button button-primary button-sm"
                    onClick={() =>
                      update("experiences", [
                        ...data.experiences,
                        {
                          id: crypto.randomUUID(),
                          role: "New role",
                          company: "Company or organization",
                          period: "2026 — Present",
                          description: "",
                          current: false,
                        },
                      ])
                    }
                  >
                    <PlusIcon size={16} /> Add experience
                  </button>
                </div>
                {data.experiences.map((e, i) => (
                  <section className="editor-panel" key={e.id}>
                    <div className="panel-heading inline-heading">
                      <h2>{e.role}</h2>
                      <div>
                        <button
                          className="icon-button"
                          aria-label="Move experience up"
                          onClick={() => move("experiences", i, -1)}
                          disabled={i === 0}
                        >
                          <ArrowUpIcon size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label="Move experience down"
                          onClick={() => move("experiences", i, 1)}
                          disabled={i === data.experiences.length - 1}
                        >
                          <ArrowDownIcon size={16} />
                        </button>
                        <button
                          className="icon-button danger"
                          aria-label={`Delete ${e.role}`}
                          onClick={() =>
                            setDeleteTarget({ type: "experiences", id: e.id })
                          }
                        >
                          <TrashIcon size={17} />
                        </button>
                      </div>
                    </div>
                    <div className="form-grid">
                      <label>
                        Role
                        <input
                          value={e.role}
                          onChange={(event) =>
                            update(
                              "experiences",
                              data.experiences.map((x) =>
                                x.id === e.id
                                  ? { ...x, role: event.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Company / organization
                        <input
                          value={e.company}
                          onChange={(event) =>
                            update(
                              "experiences",
                              data.experiences.map((x) =>
                                x.id === e.id
                                  ? { ...x, company: event.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Period
                        <input
                          value={e.period}
                          onChange={(event) =>
                            update(
                              "experiences",
                              data.experiences.map((x) =>
                                x.id === e.id
                                  ? { ...x, period: event.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="check-label">
                        <input
                          type="checkbox"
                          checked={e.current}
                          onChange={(event) =>
                            update(
                              "experiences",
                              data.experiences.map((x) =>
                                x.id === e.id
                                  ? { ...x, current: event.target.checked }
                                  : x,
                              ),
                            )
                          }
                        />{" "}
                        Current role
                      </label>
                      <label className="full-width">
                        Description
                        <textarea
                          rows={3}
                          value={e.description}
                          onChange={(event) =>
                            update(
                              "experiences",
                              data.experiences.map((x) =>
                                x.id === e.id
                                  ? { ...x, description: event.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                    </div>
                  </section>
                ))}
              </>
            )}

            {tab === "skills" && (
              <>
                <div className="editor-list-top">
                  <span className="small-label">
                    {data.skills.length} TOOLS IN YOUR KIT
                  </span>
                  <button
                    className="button button-primary button-sm"
                    onClick={() =>
                      update("skills", [
                        ...data.skills,
                        {
                          id: crypto.randomUUID(),
                          name: "New skill",
                          category: "Frontend",
                          description: "",
                        },
                      ])
                    }
                  >
                    <PlusIcon size={16} /> Add skill
                  </button>
                </div>
                {data.skills.map((s, i) => (
                  <section className="editor-panel skill-editor" key={s.id}>
                    <div className="form-grid">
                      <label>
                        Skill name
                        <input
                          value={s.name}
                          onChange={(e) =>
                            update(
                              "skills",
                              data.skills.map((x) =>
                                x.id === s.id
                                  ? { ...x, name: e.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Category
                        <select
                          value={s.category}
                          onChange={(e) =>
                            update(
                              "skills",
                              data.skills.map((x) =>
                                x.id === s.id
                                  ? {
                                      ...x,
                                      category: e.target
                                        .value as typeof s.category,
                                    }
                                  : x,
                              ),
                            )
                          }
                        >
                          {["Frontend", "Backend", "Tools", "Design"].map(
                            (c) => (
                              <option key={c}>{c}</option>
                            ),
                          )}
                        </select>
                      </label>
                      <label className="full-width">
                        How you use it
                        <input
                          value={s.description}
                          onChange={(e) =>
                            update(
                              "skills",
                              data.skills.map((x) =>
                                x.id === s.id
                                  ? { ...x, description: e.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="skill-editor-actions">
                      <button
                        className="icon-button"
                        aria-label={`Move ${s.name} up`}
                        onClick={() => move("skills", i, -1)}
                        disabled={i === 0}
                      >
                        <ArrowUpIcon size={16} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Move ${s.name} down`}
                        onClick={() => move("skills", i, 1)}
                        disabled={i === data.skills.length - 1}
                      >
                        <ArrowDownIcon size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        aria-label={`Delete ${s.name}`}
                        onClick={() =>
                          setDeleteTarget({ type: "skills", id: s.id })
                        }
                      >
                        <TrashIcon size={17} />
                      </button>
                    </div>
                  </section>
                ))}
              </>
            )}
          </fieldset>
          <div
            role="status"
            className={`editor-message ${status.startsWith("Published") ? "success" : ""}`}
          >
            {status}
          </div>
          <div className="editor-save-bar">
            <span>
              <span className={`status-dot ${dirty ? "amber" : ""}`} />
              {dirty
                ? "Ready when you are. Save to publish your changes."
                : "Your little corner of the web is up to date."}
            </span>
            <div>
              <button
                className="button button-quiet button-sm"
                onClick={reset}
                disabled={!dirty || pending}
              >
                Discard changes
              </button>
              <button
                className="button button-primary button-sm"
                onClick={save}
                disabled={pending || !dirty}
              >
                <FloppyDiskIcon size={17} />
                {pending ? "Publishing…" : "Save & publish"}
              </button>
            </div>
          </div>
        </main>
      </div>
      <dialog
        className="preview-dialog"
        ref={dialogRef}
        onCancel={() => setPreview(false)}
      >
        <div className="preview-toolbar">
          <span>
            <EyeIcon size={17} /> Live preview · Your unsaved changes
          </span>
          <button
            className="icon-button"
            onClick={() => setPreview(false)}
            aria-label="Close preview"
          >
            <XIcon size={22} />
          </button>
        </div>
        {preview && <PortfolioView data={previewData} preview />}
      </dialog>
      {deleteTarget && (
        <div className="modal-backdrop">
          <div
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <h2 id="delete-title">Remove this item?</h2>
            <p>
              It will be removed when you save and publish. You can discard your
              changes before then.
            </p>
            <div>
              <button
                className="button button-outline button-sm"
                autoFocus
                onClick={() => setDeleteTarget(null)}
              >
                Keep it
              </button>
              <button
                className="button button-danger button-sm"
                onClick={() => {
                  const { type, id } = deleteTarget;
                  setData((d) => ({
                    ...d,
                    [type]: d[type].filter((x) => x.id !== id),
                  }));
                  setDirty(true);
                  setDeleteTarget(null);
                }}
              >
                Remove item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaUploader({
  label,
  accept,
  initialUrl,
  onUpload,
  crop = false,
}: {
  label: string;
  accept: string;
  initialUrl: string;
  onUpload: (url: string) => void;
  crop?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState(initialUrl);
  const [cropImage, setCropImage] = useState<{
    file: File;
    src: string;
  } | null>(null);
  const [cropRatio, setCropRatio] = useState("1");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState(50);
  const cropRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (cropImage) cropRef.current?.showModal();
    return () => {
      if (cropImage) URL.revokeObjectURL(cropImage.src);
    };
  }, [cropImage]);
  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/media", {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      setUrl(result.url);
      onUpload(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  function select(file?: File) {
    if (!file) return;
    if (!accept.split(",").includes(file.type)) {
      setError("Choose a supported file type.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Please choose a file smaller than 8 MB.");
      return;
    }
    if (crop && file.type.startsWith("image/")) {
      setZoom(1);
      setPosition(50);
      setCropImage({ file, src: URL.createObjectURL(file) });
    } else void upload(file);
  }
  function cropAndUpload() {
    const image = imageRef.current;
    if (!image || !cropImage) return;
    const ratio = Number(cropRatio),
      outWidth = 1000,
      outHeight = outWidth / ratio;
    const scale =
      Math.max(outWidth / image.naturalWidth, outHeight / image.naturalHeight) *
      zoom;
    const canvas = document.createElement("canvas");
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      image,
      (outWidth - image.naturalWidth * scale) / 2,
      ((outHeight - image.naturalHeight * scale) * position) / 100,
      image.naturalWidth * scale,
      image.naturalHeight * scale,
    );
    canvas.toBlob(
      (blob) => {
        if (blob) {
          void upload(
            new File([blob], "portrait.webp", { type: "image/webp" }),
          );
          cropRef.current?.close();
          setCropImage(null);
        }
      },
      "image/webp",
      0.9,
    );
  }
  return (
    <div className="media-field">
      <span className="field-label">{label}</span>
      <div
        className={`upload-zone ${busy ? "busy" : ""}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!busy) select(e.dataTransfer.files[0]);
        }}
      >
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <UploadSimpleIcon size={24} />
          <b>
            {busy
              ? "Uploading…"
              : url
                ? "Replace file"
                : "Click to upload or drop a file"}
          </b>
          <small>
            {accept.includes("pdf")
              ? "PDF · up to 8 MB"
              : "JPG, PNG, WebP · up to 8 MB"}
          </small>
        </button>
        <input
          ref={input}
          type="file"
          accept={accept}
          aria-label={label}
          hidden
          onChange={(e) => {
            select(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {url && (
        <div className="media-current">
          <a href={url} target="_blank" rel="noreferrer">
            View current file ↗
          </a>
          <button
            type="button"
            className="text-link danger"
            onClick={() => {
              setUrl("");
              onUpload("");
            }}
          >
            Remove
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <dialog
        ref={cropRef}
        className="crop-dialog"
        onCancel={() => setCropImage(null)}
      >
        {cropImage && (
          <>
            <h2>Make it picture perfect.</h2>
            <div className="crop-preview" style={{ aspectRatio: cropRatio }}>
              <Image
                width={1000}
                height={1250}
                unoptimized
                ref={imageRef}
                src={cropImage.src}
                alt="Crop preview"
                style={{
                  objectPosition: `50% ${position}%`,
                  transform: `scale(${zoom})`,
                  transformOrigin: `50% ${position}%`,
                }}
              />
            </div>
            <label>
              Aspect ratio
              <select
                value={cropRatio}
                onChange={(e) => setCropRatio(e.target.value)}
              >
                <option value="1">Square · 1:1</option>
                <option value="0.8">Portrait · 4:5</option>
              </select>
            </label>
            <label>
              Zoom
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>
            <label>
              Vertical position
              <input
                type="range"
                min="0"
                max="100"
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
              />
            </label>
            <div className="crop-actions">
              <button
                type="button"
                className="button button-outline button-sm"
                onClick={() => {
                  cropRef.current?.close();
                  setCropImage(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-primary button-sm"
                onClick={cropAndUpload}
              >
                <CheckIcon size={16} /> Crop & upload
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
