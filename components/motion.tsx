"use client";
import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useMotionTemplate,
} from "motion/react";
import Lenis from "lenis";

export function Spotlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const x = useMotionValue(-1000),
    y = useMotionValue(-1000);
  const sx = useSpring(x, { damping: 30, stiffness: 180 });
  const sy = useSpring(y, { damping: 30, stiffness: 180 });
  const light = useMotionTemplate`radial-gradient(350px circle at ${sx}px ${sy}px, rgba(160,145,255,.13), transparent 70%)`;
  return (
    <div
      className={className}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const bounds = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - bounds.left);
        y.set(e.clientY - bounds.top);
      }}
      onPointerLeave={() => {
        x.set(-1000);
        y.set(-1000);
      }}
    >
      {children}
      <motion.div
        className="card-spotlight"
        style={{ background: light }}
        aria-hidden="true"
      />
    </div>
  );
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, duration: 1.05 });
    return () => lenis.destroy();
  }, []);
  return null;
}
export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
  distance?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`reveal ${className}`}
      initial={{
        opacity: 0,
        x: direction === "left" ? -distance : direction === "right" ? distance : 0,
        y: direction === "up" ? distance : 0,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: reduced ? 0 : 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
export function Magnetic({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 20 }),
    sy = useSpring(y, { stiffness: 220, damping: 20 });
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const box = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - box.left - box.width / 2) * 0.16);
        y.set((e.clientY - box.top - box.height / 2) * 0.16);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
export function Orbital() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      className="orbital-scene"
      ref={ref}
      aria-hidden="true"
      onPointerMove={(e) => {
        if (
          e.pointerType !== "mouse" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const b = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty(
          "--rx",
          `${(e.clientY - b.top - b.height / 2) * -0.025}deg`,
        );
        e.currentTarget.style.setProperty(
          "--ry",
          `${(e.clientX - b.left - b.width / 2) * 0.025}deg`,
        );
      }}
      onPointerLeave={() => {
        ref.current?.style.setProperty("--rx", "0deg");
        ref.current?.style.setProperty("--ry", "0deg");
      }}
    >
      <div className="orbital-grid" />
      <div className="orbit-axis axis-x" />
      <div className="orbit-axis axis-y" />
      <span className="coordinate coordinate-top">
        FIG. 01 — THE INTERSECTION
      </span>
      <div className="sculpture">
        <div className="sculpture-core" />
        <div className="sculpture-ring ring-one" />
        <div className="sculpture-ring ring-two" />
        <div className="sculpture-ring ring-three" />
        <div className="orbit-satellite" />
      </div>
      <div className="floating-label label-code">
        <span className="label-symbol">&lt;/&gt;</span>
        <span>
          Built with intention
          <span className="label-caption">DESIGN MEETS DEVELOPMENT</span>
        </span>
      </div>
      <span className="coordinate coordinate-bottom">
        CREATIVE THINKING, PRECISE EXECUTION.
      </span>
      <span className="orbit-plus plus-one">+</span>
      <span className="orbit-plus plus-two">+</span>
    </div>
  );
}
