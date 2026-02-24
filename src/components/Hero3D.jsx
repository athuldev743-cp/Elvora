// src/components/Hero3D.jsx
// @ts-nocheck
/* eslint-disable react/no-unknown-property */
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  Suspense,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  ContactShadows,
  useGLTF,
  Clone,
} from "@react-three/drei";
import * as THREE from "three";

/* ===================== ASSETS ===================== */
const BANANA_URL = "/banana.glb";
useGLTF.preload(BANANA_URL);

/* ===================== GAME TUNING ===================== */
const GAME_SECONDS = 60;

const BASE_SPAWN = 0.85;
const MIN_SPAWN = 0.25;
const BASE_FALL_SPEED = 0.45;
const MAX_FALL_SPEED = 0.85;
const MAX_ONSCREEN = 25;

const CONTAINER_LERP = 0.85;

/* ===================== BANANA MODEL ===================== */
function RealisticBanana(props) {
  const { scene } = useGLTF(BANANA_URL);
  return (
    <group {...props}>
      <Clone
        object={scene}
        inject={<meshLambertMaterial color="#FFE24A" emissive="#2a1f00" />}
      />
    </group>
  );
}

/* ===================== CAMERA ===================== */
function CameraRig() {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.lookAt(0, 0.6, 0);
  }, [camera]);
  return null;
}

/* ===================== RESIZE KICK ===================== */
function ForceResizeOnMount() {
  const { gl, camera } = useThree();

  useEffect(() => {
    const kick = () => {
      gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight, false);
      camera.updateProjectionMatrix();
      window.dispatchEvent(new Event("resize"));
    };

    kick();
    const t1 = setTimeout(kick, 50);
    const t2 = setTimeout(kick, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [gl, camera]);

  return null;
}

/* ===================== FALLING BANANA ===================== */
function FallingBanana({
  id,
  nx,
  speed,
  onCatch,
  onRemove,
  containerNxRef,
  isMobile,
  active,
}) {
  const g = useRef(null);
  const nyRef = useRef(1.1);
  const isCaught = useRef(false);
  const prevJarNxRef = useRef(containerNxRef.current);

  const { viewport, camera } = useThree();
  const tmp = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, dt) => {
    if (!active) return; // ✅ pause physics
    if (!g.current || isCaught.current) return;

    nyRef.current -= speed * dt;
    g.current.rotation.y += dt * 2.6;
    g.current.rotation.z += dt * 1.6;

    // ✅ Robust world projection at z=0 (mobile-safe)
    const v = viewport.getCurrentViewport(camera, tmp.current);
    const worldX = (nx - 0.5) * v.width;
    const worldY = (nyRef.current - 0.5) * v.height;

    g.current.position.set(worldX, worldY, 0);

    const currentJarNx = containerNxRef.current;
    const prevJarNx = prevJarNxRef.current;
    prevJarNxRef.current = currentJarNx;

    if (nyRef.current <= 0.25 && nyRef.current >= -0.05) {
      const catchTolerance = isMobile ? 0.2 : 0.15;
      const minSweep = Math.min(currentJarNx, prevJarNx) - catchTolerance;
      const maxSweep = Math.max(currentJarNx, prevJarNx) + catchTolerance;

      if (nx >= minSweep && nx <= maxSweep) {
        isCaught.current = true;
        g.current.visible = false;
        onCatch();
        setTimeout(() => onRemove(id), 0);
        return;
      }
    }

    if (nyRef.current < -0.1) onRemove(id);
  });

  return (
    <group ref={g} scale={0.09}>
      <RealisticBanana />
    </group>
  );
}

/* ===================== SCENE ===================== */
function GameScene({ bananas, onCatch, onRemove, containerNxRef, isMobile, active }) {
  return (
    <>
      <PerspectiveCamera makeDefault fov={40} position={[0, 3.0, 10]} />
      <CameraRig />

      <ambientLight intensity={1.35} />
      <directionalLight position={[10, 18, 10]} intensity={2.6} castShadow />
      <spotLight position={[-8, 10, 8]} angle={0.55} penumbra={1} intensity={1.0} />

      <mesh position={[0, -4.0, 0]} receiveShadow>
        <boxGeometry args={[60, 1, 60]} />
        <shadowMaterial transparent opacity={0.22} />
      </mesh>

      {bananas.map((b) => (
        <FallingBanana
          key={b.id}
          id={b.id}
          nx={b.nx}
          speed={b.speed}
          onCatch={onCatch}
          onRemove={onRemove}
          containerNxRef={containerNxRef}
          isMobile={isMobile}
          active={active}
        />
      ))}

      <ContactShadows
        position={[0, -2.7, 0]}
        opacity={0.55}
        scale={20}
        blur={1.4}
        far={4}
        color="#2d3748"
        frames={1}
      />
    </>
  );
}

/* ===================== SPARKLE ===================== */
function SparkleBurst() {
  return (
    <div style={{ position: "relative", width: 60, height: 60 }}>
      <style>{`
        @keyframes sparkleMove {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.5); }
        }
      `}</style>

      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 28;
        const y = Math.sin(angle) * 28;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 8,
              height: 8,
              background:
                "radial-gradient(circle, #fff 0%, #FFD700 60%, transparent 70%)",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              animation: "sparkleMove 0.4s ease-out forwards",
              ["--tx"]: `${x}px`,
              ["--ty"]: `${y}px`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ===================== MAIN ===================== */
export default function Hero3D({ containerDesktop, containerMobile, isMobile, paused = false }) {
  const wrapRef = useRef(null);
  const spawnRafRef = useRef(null);

  const [sparkles, setSparkles] = useState([]);
  const [gameState, setGameState] = useState("idle");
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [scoreUI, setScoreUI] = useState(0);
  const [bananas, setBananas] = useState([]);
  const [isBumping, setIsBumping] = useState(false);

  const audioPool = useRef([]);
  const poolIndex = useRef(0);
  const bgMusic = useRef(null);
  const gameOverMusic = useRef(null);

  const containerNxRef = useRef(0.5);
  const desiredNxRef = useRef(0.5);
  const overlayImgRef = useRef(null);

  const lastSpawnSide = useRef(1);
  const scoreRef = useRef(0);

  const running = gameState === "running";
  const active = running && !paused; // ✅ single control

  /* ---------- audio ---------- */
  useEffect(() => {
    audioPool.current = Array.from({ length: 30 }).map(() => {
      const audio = new Audio("/sounds/catch.mp3");
      audio.preload = "auto";
      return audio;
    });

    bgMusic.current = new Audio("/sounds/gameplay.mp3");
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.4;

    gameOverMusic.current = new Audio("/sounds/gameover.mp3");
    gameOverMusic.current.volume = 0.6;

    return () => {
      [bgMusic.current, gameOverMusic.current].forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, []);

  const playCatch = useCallback(() => {
    const audio = audioPool.current[poolIndex.current];
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = 0.8;
    const p = audio.play();
    if (p?.catch) p.catch(() => {});
    poolIndex.current = (poolIndex.current + 1) % audioPool.current.length;
  }, []);

  /* ---------- sparkles ---------- */
  const triggerSparkle = useCallback(() => {
    const id = Date.now() + Math.random();

    setSparkles((prev) => [
      ...prev,
      {
        id,
        x: containerNxRef.current,
      },
    ]);

    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== id));
    }, 420);
  }, []);

  /* ---------- spawn loop (single source of truth) ---------- */
  const startSpawnLoop = useCallback(() => {
    if (spawnRafRef.current) cancelAnimationFrame(spawnRafRef.current);

    let last = performance.now();
    let acc = 0;

    const tick = () => {
      // ✅ if paused or not running, stop the loop hard
      if (!active) {
        spawnRafRef.current = null;
        return;
      }

      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      acc += dt;

      const currentSpawnEvery = Math.max(
        MIN_SPAWN,
        BASE_SPAWN - scoreRef.current * 0.005
      );
      const currentFallSpeed = Math.min(
        MAX_FALL_SPEED,
        BASE_FALL_SPEED + scoreRef.current * 0.005
      );

      while (acc >= currentSpawnEvery) {
        acc -= currentSpawnEvery;

        setBananas((prev) => {
          if (prev.length >= MAX_ONSCREEN) return prev;

          lastSpawnSide.current *= -1;

          const minOffset = isMobile ? 0.35 : 0.2;
          const spread = isMobile ? 0.1 : 0.25;
          const randomOffset = minOffset + Math.random() * spread;

          const nx =
            lastSpawnSide.current === 1 ? 0.5 + randomOffset : 0.5 - randomOffset;

          return [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              nx,
              speed: currentFallSpeed * (0.85 + Math.random() * 0.35),
            },
          ];
        });
      }

      spawnRafRef.current = requestAnimationFrame(tick);
    };

    spawnRafRef.current = requestAnimationFrame(tick);
  }, [isMobile, active]);

  /* ---------- pause/resume effects (music + spawn) ---------- */
  useEffect(() => {
    if (!running) return;

    if (paused) {
      if (spawnRafRef.current) {
        cancelAnimationFrame(spawnRafRef.current);
        spawnRafRef.current = null;
      }
      if (bgMusic.current) bgMusic.current.pause();
      return;
    }

    // resume
    startSpawnLoop();
    if (bgMusic.current) bgMusic.current.play().catch(() => {});
  }, [paused, running, startSpawnLoop]);

  /* ---------- game control ---------- */
  const handleStartGame = useCallback(() => {
    setGameState("running");
    scoreRef.current = 0;
    setScoreUI(0);
    setBananas([]);
    setTimeLeft(GAME_SECONDS);

    containerNxRef.current = 0.5;
    desiredNxRef.current = 0.5;

    // start immediately
    // (if Home sets paused=true because user is scrolled, loop won't run anyway)
    // but we still set state properly
    // spawn will start from pause/resume effect or here if active
    if (!paused) startSpawnLoop();

    // unlock audio on user gesture
    audioPool.current.forEach((a) => {
      a.muted = true;
      a.play()
        .then(() => {
          a.pause();
          a.currentTime = 0;
          a.muted = false;
        })
        .catch(() => {});
    });

    if (gameOverMusic.current) {
      gameOverMusic.current.pause();
      gameOverMusic.current.currentTime = 0;
    }
    if (bgMusic.current) {
      bgMusic.current.currentTime = 0;
      if (!paused) bgMusic.current.play().catch(() => {});
    }
  }, [startSpawnLoop, paused]);

  const handleGameOver = useCallback(() => {
    setGameState("over");

    if (spawnRafRef.current) {
      cancelAnimationFrame(spawnRafRef.current);
      spawnRafRef.current = null;
    }

    if (bgMusic.current) bgMusic.current.pause();
    if (gameOverMusic.current) {
      gameOverMusic.current.currentTime = 0;
      gameOverMusic.current.play().catch(() => {});
    }
  }, []);

  /* ---------- timer (pause-safe, no drift) ---------- */
  const remainingMsRef = useRef(GAME_SECONDS * 1000);
  const lastTickRef = useRef(0);

  // reset timer when a new run starts
  useEffect(() => {
    if (!running) return;
    remainingMsRef.current = GAME_SECONDS * 1000;
    lastTickRef.current = performance.now();
    setTimeLeft(GAME_SECONDS);
  }, [running]);

  useEffect(() => {
    if (!running) return;

    const tick = () => {
      if (!active) {
        lastTickRef.current = performance.now(); // avoid big jump after resume
        return;
      }

      const now = performance.now();
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      remainingMsRef.current = Math.max(0, remainingMsRef.current - dt);

      const remaining = Math.ceil(remainingMsRef.current / 1000);
      setTimeLeft(remaining);
      setScoreUI(scoreRef.current);

      if (remainingMsRef.current <= 0) handleGameOver();
    };

    const t = setInterval(tick, 150);
    return () => clearInterval(t);
  }, [running, active, handleGameOver]);

  /* ---------- pointer -> desired Nx ---------- */
  const setDesiredFromClientX = (clientX) => {
    const el = wrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    let nx = (clientX - rect.left) / rect.width;

    const clampEdge = isMobile ? 0.12 : 0.1;
    nx = Math.max(clampEdge, Math.min(1 - clampEdge, nx));
    desiredNxRef.current = nx;
  };

  const onPointerDown = (e) => {
    if (active) setDesiredFromClientX(e.clientX);
  };
  const onPointerMove = (e) => {
    if (active) setDesiredFromClientX(e.clientX);
  };

  /* ---------- container lerp loop ---------- */
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      containerNxRef.current = THREE.MathUtils.lerp(
        containerNxRef.current,
        desiredNxRef.current,
        CONTAINER_LERP
      );

      if (overlayImgRef.current) {
        overlayImgRef.current.style.left = `${containerNxRef.current * 100}%`;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---------- resize observers ---------- */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const kickResize = () => window.dispatchEvent(new Event("resize"));

    const t1 = setTimeout(kickResize, 0);
    const t2 = setTimeout(kickResize, 80);
    const t3 = setTimeout(kickResize, 250);

    const ro = new ResizeObserver(() => kickResize());
    ro.observe(el);

    const vv = window.visualViewport;
    if (vv) vv.addEventListener("resize", kickResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro.disconnect();
      if (vv) vv.removeEventListener("resize", kickResize);
    };
  }, []);

  /* ---------- catch / remove ---------- */
  const onCatch = useCallback(() => {
    if (!active) return;
    scoreRef.current += 1;
    playCatch();
    setIsBumping(true);
    triggerSparkle();
    setTimeout(() => setIsBumping(false), 80);
  }, [playCatch, triggerSparkle, active]);

  const onRemove = useCallback((id) => {
    setBananas((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`hero-3d-container ${paused ? "game-paused" : ""}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        touchAction: "none",
        overflow: "hidden",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      {running && (
        <>
          <div className="scoreTopRight">{scoreUI}</div>
          <div className="timeTopLeft">{timeLeft}s</div>
        </>
      )}

      {paused && running && (
        <div className="pausedOverlay">
          <div className="pausedText">PAUSED</div>
          <p>Scroll back to top to resume</p>
        </div>
      )}

      {gameState === "idle" && (
        <button className="startBtn" onClick={handleStartGame}>
          START
        </button>
      )}

      {gameState === "over" && (
        <button className="startBtn" onClick={handleStartGame}>
          PLAY AGAIN ({scoreUI})
        </button>
      )}

      <img
        ref={overlayImgRef}
        src={isMobile ? containerMobile : containerDesktop}
        alt="Container"
        draggable={false}
        className="catchContainerOverlay"
        style={{
          left: "50%",
          transform: `translateX(-50%) scale(${isBumping ? 1.08 : 1})`,
        }}
      />

      {/* sparkles */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            bottom: "8%",
            left: `${s.x * 100}%`,
            transform: "translateX(-50%)",
            pointerEvents: "none",
            zIndex: 90,
          }}
        >
          <SparkleBurst />
        </div>
      ))}

      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ alpha: true }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          pointerEvents: "none",
        }}
      >
        <Suspense fallback={null}>
          <ForceResizeOnMount />
          <GameScene
            bananas={active ? bananas : []}
            onCatch={onCatch}
            onRemove={onRemove}
            containerNxRef={containerNxRef}
            isMobile={isMobile}
            active={active}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}