// src/components/Hero3D.jsx
// @ts-nocheck
/* eslint-disable react/no-unknown-property */
import React, {
  useEffect, useLayoutEffect, useRef, useState, Suspense, useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, ContactShadows, useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";

/* ===================== ASSETS ===================== */
const BANANA_URL = "/banana.glb";
useGLTF.preload(BANANA_URL);

/* ===================== GAME TUNING ===================== */
const GAME_SECONDS       = 60;
const BASE_SPAWN         = 0.85;
const MIN_SPAWN          = 0.25;
const BASE_FALL_SPEED    = 0.45;
const MAX_FALL_SPEED     = 0.85;
const MAX_ONSCREEN       = 25;
const CONTAINER_LERP     = 0.85;
const MAX_LIVES          = 3;
const EVIL_SPAWN_CHANCE  = 0.22; // probability each spawn is evil

const MOUTH_Y_RATIO      = 0.05;
const OPENING_HALF_WIDTH = 0.38;
const JAR_CENTER_OFFSET  = 0.04;
const CATCH_Y_TOLERANCE  = 0.06;

/* ===================== AUDIO ENGINE ===================== */
let _ctx = null;
function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

function playCatchSound(score = 0) {
  try {
    const ctx = getCtx(); const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(1.0, now);
    master.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    master.connect(ctx.destination);
    const sub = ctx.createOscillator(); sub.type = "sine";
    sub.frequency.setValueAtTime(90 + Math.min(score * 2, 40), now);
    sub.frequency.exponentialRampToValueAtTime(38, now + 0.35);
    const subG = ctx.createGain(); subG.gain.setValueAtTime(1.2, now);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    sub.connect(subG); subG.connect(master); sub.start(now); sub.stop(now + 0.45);
    const mid = ctx.createOscillator(); mid.type = "triangle";
    mid.frequency.setValueAtTime(130, now);
    mid.frequency.exponentialRampToValueAtTime(65, now + 0.2);
    const midG = ctx.createGain(); midG.gain.setValueAtTime(0.7, now);
    midG.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    mid.connect(midG); midG.connect(master); mid.start(now); mid.stop(now + 0.28);
    const shimmer = ctx.createOscillator(); shimmer.type = "sine";
    shimmer.frequency.setValueAtTime(520 + Math.min(score * 6, 200), now);
    shimmer.frequency.exponentialRampToValueAtTime(320, now + 0.18);
    const shimG = ctx.createGain(); shimG.gain.setValueAtTime(0.22, now);
    shimG.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    shimmer.connect(shimG); shimG.connect(master); shimmer.start(now); shimmer.stop(now + 0.22);
  } catch (e) {}
}

function playMilestoneSound() {
  try {
    const ctx = getCtx();
    [65, 98, 131, 196].forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.1;
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = "sine"; osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.3);
      g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t + 0.38);
    });
    [392, 523, 659, 784].forEach((freq, i) => {
      const t = ctx.currentTime + 0.05 + i * 0.09;
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = "sine"; osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t + 0.28);
    });
  } catch (e) {}
}

function playMissSound() {
  try {
    const ctx = getCtx(); const now = ctx.currentTime;
    const osc = ctx.createOscillator(); osc.type = "sine";
    osc.frequency.setValueAtTime(120, now); osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.5, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(g); g.connect(ctx.destination); osc.start(now); osc.stop(now + 0.3);
  } catch (e) {}
}

// EVIL CATCH — extremely violent explosion sound: noise burst + sub slam + distorted scream
function playEvilCatchSound() {
  try {
    const ctx = getCtx(); const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(1.4, now);
    master.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    master.connect(ctx.destination);

    // White noise burst — crackling explosion texture
    const bufSize = ctx.sampleRate * 0.9;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const noise = ctx.createBufferSource(); noise.buffer = buf;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass"; noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(60, now + 0.5);
    const noiseG = ctx.createGain(); noiseG.gain.setValueAtTime(1.5, now);
    noiseG.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    noise.connect(noiseFilter); noiseFilter.connect(noiseG); noiseG.connect(master);
    noise.start(now); noise.stop(now + 0.9);

    // Sub slam — massive low-end thud dropping from 80hz to 20hz
    const sub = ctx.createOscillator(); sub.type = "sine";
    sub.frequency.setValueAtTime(80, now);
    sub.frequency.exponentialRampToValueAtTime(20, now + 0.6);
    const subG = ctx.createGain(); subG.gain.setValueAtTime(2.0, now);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    sub.connect(subG); subG.connect(master); sub.start(now); sub.stop(now + 0.75);

    // Distorted scream — sawtooth at mid-freq for evil character
    const scream = ctx.createOscillator(); scream.type = "sawtooth";
    scream.frequency.setValueAtTime(220, now);
    scream.frequency.exponentialRampToValueAtTime(55, now + 0.4);
    const dist = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i * 2) / 256 - 1; curve[i] = (Math.PI + 400) * x / (Math.PI + 400 * Math.abs(x)); }
    dist.curve = curve;
    const screamG = ctx.createGain(); screamG.gain.setValueAtTime(0.9, now);
    screamG.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    scream.connect(dist); dist.connect(screamG); screamG.connect(master);
    scream.start(now); scream.stop(now + 0.5);

    // High crack — sharp transient snap
    const crack = ctx.createOscillator(); crack.type = "square";
    crack.frequency.setValueAtTime(2400, now);
    crack.frequency.exponentialRampToValueAtTime(80, now + 0.06);
    const crackG = ctx.createGain(); crackG.gain.setValueAtTime(0.8, now);
    crackG.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    crack.connect(crackG); crackG.connect(master); crack.start(now); crack.stop(now + 0.08);

    // Container shatter — multiple detuned hits for glass-breaking feel
    [180, 243, 310, 420].forEach((f, i) => {
      const t = now + i * 0.04;
      const o = ctx.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.3, t + 0.12);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.18);
    });
  } catch (e) {}
}

// CONTAINER BLAST — final explosion when all lives gone
function playContainerBlastSound() {
  try {
    const ctx = getCtx(); const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(1.8, now);
    master.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    master.connect(ctx.destination);

    // Massive noise explosion
    const bufSize = ctx.sampleRate * 1.8;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const noise = ctx.createBufferSource(); noise.buffer = buf;
    const noiseF = ctx.createBiquadFilter(); noiseF.type = "lowpass";
    noiseF.frequency.setValueAtTime(3000, now);
    noiseF.frequency.exponentialRampToValueAtTime(40, now + 1.5);
    const noiseG = ctx.createGain(); noiseG.gain.setValueAtTime(2.5, now);
    noiseG.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    noise.connect(noiseF); noiseF.connect(noiseG); noiseG.connect(master);
    noise.start(now); noise.stop(now + 1.8);

    // Deep sub bomb
    const sub = ctx.createOscillator(); sub.type = "sine";
    sub.frequency.setValueAtTime(60, now); sub.frequency.exponentialRampToValueAtTime(15, now + 1.2);
    const subG = ctx.createGain(); subG.gain.setValueAtTime(3.0, now);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    sub.connect(subG); subG.connect(master); sub.start(now); sub.stop(now + 1.5);

    // Reverb tail — multiple decaying hits
    [0, 0.15, 0.35, 0.6, 0.9].forEach((t, i) => {
      const o = ctx.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(120 - i * 18, now + t);
      o.frequency.exponentialRampToValueAtTime(20, now + t + 0.3);
      const g = ctx.createGain(); g.gain.setValueAtTime(1.2 - i * 0.2, now + t);
      g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.35);
      o.connect(g); g.connect(master); o.start(now + t); o.stop(now + t + 0.4);
    });
  } catch (e) {}
}

function playGameOverSound() {
  try {
    const ctx = getCtx();
    [{ f: 392, t: 0.0 }, { f: 349, t: 0.18 }, { f: 294, t: 0.36 }, { f: 196, t: 0.54 }, { f: 131, t: 0.76 }]
      .forEach(({ f, t }) => {
        const now = ctx.currentTime + t;
        [f, f / 2].forEach((freq, i) => {
          const o = ctx.createOscillator(); o.type = "sine";
          o.frequency.setValueAtTime(freq, now);
          const g = ctx.createGain(); g.gain.setValueAtTime(i === 0 ? 0.45 : 0.35, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + (i === 0 ? 0.4 : 0.5));
          o.connect(g); g.connect(ctx.destination);
          o.start(now); o.stop(now + (i === 0 ? 0.45 : 0.55));
        });
      });
  } catch (e) {}
}

function playStartSound() {
  try {
    const ctx = getCtx();
    [{ f: 131, t: 0.00, dur: 0.12 }, { f: 165, t: 0.12, dur: 0.10 },
     { f: 196, t: 0.22, dur: 0.10 }, { f: 131, t: 0.32, dur: 0.08 },
     { f: 262, t: 0.40, dur: 0.15 }, { f: 196, t: 0.55, dur: 0.10 },
     { f: 262, t: 0.65, dur: 0.25 }].forEach(({ f, t, dur }) => {
      const now = ctx.currentTime + t;
      const o = ctx.createOscillator(); o.type = "triangle";
      o.frequency.setValueAtTime(f, now);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.55, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur + 0.05);
      o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + dur + 0.08);
    });
    [{ f: 523, t: 0.00, dur: 0.10 }, { f: 659, t: 0.12, dur: 0.10 },
     { f: 784, t: 0.24, dur: 0.10 }, { f: 659, t: 0.36, dur: 0.08 },
     { f: 1047, t: 0.45, dur: 0.20 }, { f: 784, t: 0.65, dur: 0.25 }].forEach(({ f, t, dur }) => {
      const now = ctx.currentTime + t;
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(f, now);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur + 0.05);
      o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + dur + 0.08);
    });
  } catch (e) {}
}

/* ===================== SUB-COMPONENTS ===================== */

function RealisticBanana({ evil = false, ...props }) {
  const { scene } = useGLTF(BANANA_URL);
  return (
    <group {...props}>
      <Clone
        object={scene}
        inject={
          evil
            ? <meshLambertMaterial color="#0a0a0a" emissive="#1a0000" />
            : <meshLambertMaterial color="#FFE24A" emissive="#2a1f00" />
        }
      />
    </group>
  );
}

function CameraRig() {
  const { camera } = useThree();
  useLayoutEffect(() => { camera.lookAt(0, 0.6, 0); }, [camera]);
  return null;
}

function ForceResizeOnMount() {
  const { gl, camera } = useThree();
  useEffect(() => {
    gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight, false);
    camera.updateProjectionMatrix();
  }, [gl, camera]);
  return null;
}

function FallingBanana({ id, nx, speed, evil, onCatch, onEvilCatch, onRemove, active, catchRectRef }) {
  const groupRef = useRef(null);
  const nyRef    = useRef(1.1);
  const isCaught = useRef(false);
  const { viewport, camera } = useThree();
  const originVec = useRef(new THREE.Vector3(0, 0, 0));
  const projVec   = useRef(new THREE.Vector3());

  const projectToScreen = useCallback((worldX, worldY) => {
    projVec.current.set(worldX, worldY, 0).project(camera);
    return {
      screenX: (projVec.current.x + 1) / 2,
      screenY: (1 - projVec.current.y) / 2,
    };
  }, [camera]);

  useFrame((_, dt) => {
    if (!active || !groupRef.current || isCaught.current) return;
    nyRef.current -= speed * dt;
    const v      = viewport.getCurrentViewport(camera, originVec.current);
    const worldX = (nx - 0.5) * v.width;
    const worldY = (nyRef.current - 0.5) * v.height;
    groupRef.current.position.set(worldX, worldY, 0);

    const jarX         = catchRectRef.current.jarX ?? 0.5;
    const mouthScreenY = catchRectRef.current.yMax ?? 0.82;
    const jarW         = catchRectRef.current.jarWidthNormalized ?? 0.2;
    const { screenX: bananaScreenX, screenY: bananaScreenY } = projectToScreen(worldX, worldY);

    const adjustedJarX = jarX + jarW * JAR_CENTER_OFFSET;
    const halfOpen     = jarW * OPENING_HALF_WIDTH;
    const insideX      = bananaScreenX >= adjustedJarX - halfOpen && bananaScreenX <= adjustedJarX + halfOpen;
    const nearMouth    = bananaScreenY >= mouthScreenY - CATCH_Y_TOLERANCE && bananaScreenY <= mouthScreenY + CATCH_Y_TOLERANCE;

    if (insideX && nearMouth) {
      isCaught.current = true;
      groupRef.current.visible = false;
      if (evil) onEvilCatch(nx);
      else onCatch(nx);
      requestAnimationFrame(() => onRemove(id));
      return;
    }
    if (bananaScreenY > 1.15) { if (!evil) playMissSound(); onRemove(id); }
  });

  // Evil bananas are bigger and have a red glow aura
  const scale = evil ? 0.15 : 0.09;
  return (
    <group ref={groupRef} scale={scale}>
      {evil && (
        <mesh>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.18} />
        </mesh>
      )}
      <RealisticBanana evil={evil} />
    </group>
  );
}

function GameScene({ bananas, onCatch, onEvilCatch, onRemove, active, catchRectRef }) {
  return (
    <>
      <PerspectiveCamera makeDefault fov={40} position={[0, 3.0, 10]} />
      <CameraRig />
      <ambientLight intensity={1.35} />
      <directionalLight position={[10, 18, 10]} intensity={2.6} castShadow />
      {bananas.map((b) => (
        <FallingBanana
          key={b.id} id={b.id} nx={b.nx} speed={b.speed} evil={b.evil}
          onCatch={onCatch} onEvilCatch={onEvilCatch} onRemove={onRemove}
          active={active} catchRectRef={catchRectRef}
        />
      ))}
      <ContactShadows position={[0, -2.7, 0]} opacity={0.5} scale={20} blur={1.5} far={4} color="#2d3748" />
    </>
  );
}

function SparkleBurst({ evil = false }) {
  const particles = [
    ...Array.from({ length: 16 }).map((_, i) => ({
      angle: (i / 16) * Math.PI * 2,
      distance: 45 + Math.random() * 35,
      size: 5 + Math.random() * 5,
      duration: 0.35 + Math.random() * 0.15,
      delay: 0,
      color: evil ? (i % 2 === 0 ? "#ff2200" : "#ff6600") : (i % 3 === 0 ? "#fff" : i % 3 === 1 ? "#FFD700" : "#FFA500"),
    })),
    ...Array.from({ length: 8 }).map((_, i) => ({
      angle: (i / 8) * Math.PI * 2 + Math.PI / 8,
      distance: 70 + Math.random() * 40,
      size: 12 + Math.random() * 8,
      duration: 0.55 + Math.random() * 0.15,
      delay: 0.03,
      color: evil ? (i % 2 === 0 ? "#ff0000" : "#880000") : (i % 2 === 0 ? "#FFD700" : "#fff"),
    })),
  ];

  const centerColor = evil ? "#ff2200" : "#FFD700";
  const glowColor   = evil ? "rgba(255,0,0,0.7)" : "rgba(255,215,0,0.7)";

  return (
    <div style={{ position: "relative", width: 120, height: 120 }}>
      <style>{`
        @keyframes sparkleMove {
          0%   { opacity: 1; transform: translate(-50%,-50%) scale(1.2); }
          60%  { opacity: 0.8; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); }
        }
        @keyframes sparklePulse {
          0%   { opacity: 1;   transform: translate(-50%,-50%) scale(1.5); }
          40%  { opacity: 0.9; transform: translate(-50%,-50%) scale(2.5); }
          100% { opacity: 0;   transform: translate(-50%,-50%) scale(0.5); }
        }
        @keyframes evilShake {
          0%,100% { transform: translate(-50%,-50%) scale(1.5) rotate(0deg); }
          20%     { transform: translate(-48%,-52%) scale(2.8) rotate(-8deg); }
          40%     { transform: translate(-52%,-48%) scale(3.2) rotate(6deg); }
          60%     { transform: translate(-49%,-51%) scale(2.6) rotate(-4deg); }
          80%     { transform: translate(-51%,-49%) scale(2.0) rotate(3deg); }
        }
      `}</style>
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: evil ? 48 : 36, height: evil ? 48 : 36,
        background: `radial-gradient(circle, #fff 0%, ${centerColor} 40%, transparent 70%)`,
        borderRadius: "50%",
        animation: evil ? "evilShake 0.5s ease-out forwards" : "sparklePulse 0.4s ease-out forwards",
        boxShadow: `0 0 ${evil ? 32 : 18}px ${evil ? 16 : 8}px ${glowColor}`,
      }} />
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: "50%", top: "50%",
          width: p.size, height: p.size,
          background: `radial-gradient(circle, #fff 0%, ${p.color} 50%, transparent 75%)`,
          borderRadius: "50%",
          animation: `sparkleMove ${p.duration}s ${p.delay}s ease-out forwards`,
          boxShadow: `0 0 ${p.size * 0.8}px ${p.size * 0.4}px ${p.color}88`,
          "--tx": `${Math.cos(p.angle) * p.distance * (evil ? 1.8 : 1)}px`,
          "--ty": `${Math.sin(p.angle) * p.distance * (evil ? 1.8 : 1)}px`,
        }} />
      ))}
    </div>
  );
}

// Life bar — 3 heart segments that drain on evil catch
function LifeBar({ lives }) {
  return (
    <div style={{
      position: "absolute", bottom: 24, left: "50%",
      transform: "translateX(-50%)",
      zIndex: 150,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      pointerEvents: "none",
    }}>
      {/* Bar track */}
      <div style={{
        width: 160, height: 14,
        background: "rgba(0,0,0,0.45)",
        borderRadius: 99,
        border: "2px solid rgba(255,255,255,0.25)",
        overflow: "hidden",
        boxShadow: "0 0 12px rgba(255,0,0,0.3)",
      }}>
        <div style={{
          height: "100%",
          width: `${(lives / MAX_LIVES) * 100}%`,
          background: lives === 3
            ? "linear-gradient(90deg, #00e676, #69f0ae)"
            : lives === 2
            ? "linear-gradient(90deg, #ffb300, #ffd740)"
            : "linear-gradient(90deg, #ff1744, #ff6d00)",
          borderRadius: 99,
          transition: "width 0.3s ease, background 0.3s ease",
          boxShadow: lives === 1 ? "0 0 10px 3px rgba(255,0,0,0.7)" : "none",
        }} />
      </div>
      {/* Hearts */}
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: MAX_LIVES }).map((_, i) => (
          <span key={i} style={{
            fontSize: 18,
            filter: i < lives ? "drop-shadow(0 0 4px #ff4444)" : "grayscale(1) opacity(0.3)",
            transition: "filter 0.3s ease",
          }}>❤️</span>
        ))}
      </div>
    </div>
  );
}

// Container explosion — full screen blast overlay when lives = 0
function ContainerExplosion({ onDone }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    playContainerBlastSound();
    const frames = [0,1,2,3,4,5,6,7,8];
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setFrame(i);
      if (i >= frames.length) { clearInterval(iv); setTimeout(onDone, 400); }
    }, 80);
    return () => clearInterval(iv);
  }, [onDone]);

  const shards = Array.from({ length: 24 }).map((_, i) => ({
    angle: (i / 24) * 360,
    dist: 80 + Math.random() * 200,
    size: 8 + Math.random() * 28,
    color: ["#ff2200","#ff6600","#ff9900","#ffcc00","#fff"][Math.floor(Math.random()*5)],
    rot: Math.random() * 720,
  }));

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 500,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `rgba(255,${Math.max(0,80-frame*20)},0,${Math.min(0.85, frame*0.12)})`,
      pointerEvents: "none",
    }}>
      <style>{`
        @keyframes shardFly {
          0%   { opacity: 1; transform: translate(-50%,-50%) rotate(0deg) translate(0px,0px); }
          100% { opacity: 0; transform: translate(-50%,-50%) rotate(var(--rot)) translate(var(--dist),0px); }
        }
        @keyframes blastRing {
          0%   { transform: translate(-50%,-50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(4); opacity: 0; }
        }
      `}</style>
      {/* Blast rings */}
      {[0, 0.1, 0.2].map((delay, i) => (
        <div key={i} style={{
          position: "absolute", left: "50%", top: "50%",
          width: 120, height: 120, borderRadius: "50%",
          border: `${8 - i*2}px solid ${["#ff2200","#ff8800","#ffcc00"][i]}`,
          animation: `blastRing 0.6s ${delay}s ease-out forwards`,
          boxShadow: `0 0 40px 20px ${["rgba(255,34,0,0.5)","rgba(255,136,0,0.4)","rgba(255,204,0,0.3)"][i]}`,
        }} />
      ))}
      {/* Shards */}
      {shards.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: "50%", top: "50%",
          width: s.size, height: s.size * 0.4,
          background: s.color,
          borderRadius: 2,
          boxShadow: `0 0 ${s.size}px ${s.color}`,
          animation: `shardFly 0.7s ease-out forwards`,
          "--dist": `${s.dist}px`,
          "--rot": `${s.rot}deg`,
          transform: `translate(-50%,-50%) rotate(${s.angle}deg)`,
        }} />
      ))}
      {/* Flash text */}
      {frame > 2 && (
        <div style={{
          position: "absolute",
          fontSize: 48, fontWeight: 1000,
          color: "#fff",
          textShadow: "0 0 20px #ff0000, 0 0 40px #ff6600",
          letterSpacing: 4,
          animation: "sparklePulse 0.4s ease-out",
        }}>💥 DESTROYED!</div>
      )}
    </div>
  );
}

/* ===================== MAIN COMPONENT ===================== */
export default function Hero3D({ containerDesktop, containerMobile, isMobile, paused = false }) {
  const wrapRef       = useRef(null);
  const overlayImgRef = useRef(null);
  const catchRectRef  = useRef({ jarX: 0.5, yMax: 0.82, jarWidthNormalized: 0.2 });

  const [sparkles,       setSparkles]       = useState([]);
  const [gameState,      setGameState]      = useState("idle");
  const [timeLeft,       setTimeLeft]       = useState(GAME_SECONDS);
  const [scoreUI,        setScoreUI]        = useState(0);
  const [bananas,        setBananas]        = useState([]);
  const [isBumping,      setIsBumping]      = useState(false);
  const [lives,          setLives]          = useState(MAX_LIVES);
  const [isExploding,    setIsExploding]    = useState(false);
  const [screenShake,    setScreenShake]    = useState(false);
  const [evilFlash,      setEvilFlash]      = useState(false);

  const containerNxRef = useRef(0.5);
  const desiredNxRef   = useRef(0.5);
  const scoreRef       = useRef(0);
  const livesRef       = useRef(MAX_LIVES);
  const lastTickRef    = useRef(0);
  const remainingMsRef = useRef(GAME_SECONDS * 1000);

  const isRunning = gameState === "running";
  const active    = isRunning && !paused && !isExploding;

  const getCanvas = useCallback(() => wrapRef.current?.querySelector("canvas") ?? null, []);

  const updateCatchRect = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas || !overlayImgRef.current) return;
    const cRect = canvas.getBoundingClientRect();
    const iRect = overlayImgRef.current.getBoundingClientRect();
    if (iRect.height === 0 || iRect.width === 0) { requestAnimationFrame(updateCatchRect); return; }
    const mouthPx = iRect.top + iRect.height * MOUTH_Y_RATIO;
    catchRectRef.current.yMax               = (mouthPx - cRect.top) / cRect.height;
    catchRectRef.current.jarWidthNormalized = iRect.width / cRect.width;
  }, [getCanvas]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const target = isRunning ? desiredNxRef.current : 0.5;
      containerNxRef.current = THREE.MathUtils.lerp(containerNxRef.current, target, CONTAINER_LERP);
      if (overlayImgRef.current) {
        overlayImgRef.current.style.left = `${containerNxRef.current * 100}%`;
        const canvas = getCanvas();
        if (canvas && wrapRef.current) {
          const cRect    = canvas.getBoundingClientRect();
          const wRect    = wrapRef.current.getBoundingClientRect();
          const centerPx = wRect.left + containerNxRef.current * wRect.width;
          catchRectRef.current.jarX = (centerPx - cRect.left) / cRect.width;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isRunning, getCanvas]);

  const handlePointerMove = useCallback((e) => {
    if (!isRunning || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    desiredNxRef.current = Math.max(0.05, Math.min(0.95, (e.clientX - r.left) / r.width));
  }, [isRunning]);

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const handler = (e) => {
      if (!isRunning) return;
      e.preventDefault();
      const touch = e.touches[0]; if (!touch) return;
      const r = el.getBoundingClientRect();
      desiredNxRef.current = Math.max(0.05, Math.min(0.95, (touch.clientX - r.left) / r.width));
    };
    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, [isRunning]);

  const onRemove = useCallback((id) => {
    setBananas((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const onCatch = useCallback((atX) => {
    if (!active) return;
    scoreRef.current += 1;
    setScoreUI(scoreRef.current);
    if (scoreRef.current % 5 === 0) playMilestoneSound();
    else playCatchSound(scoreRef.current);
    const sid = `s-${performance.now()}`;
    setSparkles((prev) => [...prev, { id: sid, x: atX, evil: false }]);
    setTimeout(() => setSparkles((p) => p.filter((s) => s.id !== sid)), 600);
    setIsBumping(true);
    setTimeout(() => setIsBumping(false), 80);
  }, [active]);

  const onEvilCatch = useCallback((atX) => {
    if (!active) return;
    playEvilCatchSound();

    // Screen shake
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);

    // Red flash
    setEvilFlash(true);
    setTimeout(() => setEvilFlash(false), 350);

    // Evil sparkle
    const sid = `s-${performance.now()}`;
    setSparkles((prev) => [...prev, { id: sid, x: atX, evil: true }]);
    setTimeout(() => setSparkles((p) => p.filter((s) => s.id !== sid)), 700);

    // Decrease life
    const newLives = Math.max(0, livesRef.current - 1);
    livesRef.current = newLives;
    setLives(newLives);

    if (newLives <= 0) {
      // Trigger container explosion
      setBananas([]);
      setIsExploding(true);
    } else {
      // Jar bump on hit
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 200);
    }
  }, [active]);

  const handleExplosionDone = useCallback(() => {
    setIsExploding(false);
    setGameState("over");
    playGameOverSound();
  }, []);

  const handleStartGame = useCallback(() => {
    scoreRef.current       = 0;
    livesRef.current       = MAX_LIVES;
    remainingMsRef.current = GAME_SECONDS * 1000;
    lastTickRef.current    = performance.now();
    setScoreUI(0);
    setLives(MAX_LIVES);
    setBananas([]);
    setTimeLeft(GAME_SECONDS);
    setIsExploding(false);
    setEvilFlash(false);
    setScreenShake(false);
    setGameState("running");
    playStartSound();
    requestAnimationFrame(updateCatchRect);
  }, [updateCatchRect]);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      const now = performance.now();
      remainingMsRef.current = Math.max(0, remainingMsRef.current - (now - lastTickRef.current));
      lastTickRef.current = now;
      setTimeLeft(Math.ceil(remainingMsRef.current / 1000));
      if (remainingMsRef.current <= 0) { setGameState("over"); playGameOverSound(); }
    }, 100);
    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    let acc = 0; let last = performance.now(); let raf = 0;
    const tick = () => {
      const now = performance.now();
      acc += (now - last) / 1000; last = now;
      const rate = Math.max(MIN_SPAWN, BASE_SPAWN - scoreRef.current * 0.01);
      if (acc >= rate) {
        acc = 0;
        setBananas((prev) => {
          if (prev.length >= MAX_ONSCREEN) return prev;
          const isEvil = Math.random() < EVIL_SPAWN_CHANCE;
          return [...prev, {
            id:    `${now}-${Math.random()}`,
            nx:    0.15 + Math.random() * 0.7,
            speed: Math.min(MAX_FALL_SPEED, BASE_FALL_SPEED + scoreRef.current * 0.005) * (isEvil ? 0.75 : 1),
            evil:  isEvil,
          }];
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  useEffect(() => {
    const observer = new ResizeObserver(updateCatchRect);
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [updateCatchRect]);

  return (
    <div
      ref={wrapRef}
      className="hero-3d-container"
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        touchAction: active ? "none" : "auto",
        animation: screenShake ? "heroShake 0.5s ease-out" : "none",
      }}
      onPointerMove={handlePointerMove}
    >
      <style>{`
        @keyframes heroShake {
          0%,100% { transform: translate(0,0) rotate(0deg); }
          10%     { transform: translate(-8px,-4px) rotate(-1deg); }
          20%     { transform: translate(10px,6px) rotate(1.5deg); }
          30%     { transform: translate(-10px,2px) rotate(-1deg); }
          40%     { transform: translate(8px,-6px) rotate(1deg); }
          50%     { transform: translate(-6px,8px) rotate(-0.5deg); }
          60%     { transform: translate(6px,-4px) rotate(0.5deg); }
          70%     { transform: translate(-4px,4px) rotate(-0.3deg); }
          80%     { transform: translate(4px,-2px) rotate(0.2deg); }
          90%     { transform: translate(-2px,2px) rotate(-0.1deg); }
        }
        @keyframes evilFlashAnim {
          0%,100% { opacity: 0; }
          20%,60% { opacity: 0.55; }
        }
      `}</style>

      {/* Evil red screen flash */}
      {evilFlash && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 400,
          background: "radial-gradient(ellipse at center, rgba(255,0,0,0.0) 30%, rgba(255,0,0,0.7) 100%)",
          pointerEvents: "none",
          animation: "evilFlashAnim 0.35s ease-out forwards",
        }} />
      )}

      {/* IDLE */}
      {gameState === "idle" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <button className="startBtn" onClick={handleStartGame}>START</button>
        </div>
      )}

      {/* HUD */}
      {isRunning && (
        <>
          <div className="scoreTopRight">{scoreUI}</div>
          <div className="timeTopLeft">{timeLeft}s</div>
          {/* Evil warning label */}
          <div style={{
            position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
            zIndex: 80, pointerEvents: "none",
            fontSize: 11, fontWeight: 900, color: "rgba(255,80,80,0.9)",
            textShadow: "0 0 8px rgba(255,0,0,0.8)",
            letterSpacing: 1, textTransform: "uppercase",
          }}>⚠ Avoid black bananas</div>
        </>
      )}

      {/* GAME OVER */}
      {gameState === "over" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <button className="startBtn" onClick={handleStartGame}>PLAY AGAIN ({scoreUI})</button>
        </div>
      )}

      {/* JAR OVERLAY */}
      <img
        ref={overlayImgRef}
        src={isMobile ? containerMobile : containerDesktop}
        alt="Jar"
        onLoad={updateCatchRect}
        className="catchContainerOverlay"
        style={{
          position: "absolute",
          transform: `translateX(-50%) scale(${isBumping ? 1.12 : 1})`,
          transformOrigin: "center bottom",
          zIndex: 80,
          pointerEvents: "none",
          filter: lives === 1 ? "drop-shadow(0 0 12px rgba(255,0,0,0.9))" : "none",
          transition: "filter 0.3s ease",
        }}
      />

      {/* LIFE BAR */}
      {isRunning && <LifeBar lives={lives} />}

      {/* SPARKLES */}
      {sparkles.map((s) => (
        <div key={s.id} style={{
          position: "absolute",
          left: `${s.x * 100}%`,
          bottom: `calc(${catchRectRef.current.yMax ? (1 - catchRectRef.current.yMax) * 100 : 20}% - 60px)`,
          transform: "translateX(-50%)",
          zIndex: 100, pointerEvents: "none",
        }}>
          <SparkleBurst evil={s.evil} />
        </div>
      ))}

      {/* CONTAINER EXPLOSION */}
      {isExploding && <ContainerExplosion onDone={handleExplosionDone} />}

      {/* THREE.JS CANVAS */}
      <Canvas shadows dpr={[1, 2]} style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
        <Suspense fallback={null}>
          <ForceResizeOnMount />
          <GameScene
            bananas={bananas} onCatch={onCatch} onEvilCatch={onEvilCatch}
            onRemove={onRemove} active={active} catchRectRef={catchRectRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}