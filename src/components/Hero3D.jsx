// @ts-nocheck
/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, ContactShadows, useGLTF, Clone } from "@react-three/drei";
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
      <Clone object={scene} inject={<meshLambertMaterial color="#FFE24A" emissive="#2a1f00" />} />
    </group>
  );
}

/* ===================== CAMERA ===================== */
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 3.0, 10);
    camera.lookAt(0, 0.6, 0);
  }, [camera]);
  return null;
}

/* ===================== FALLING BANANA ===================== */
function FallingBanana({ id, nx, speed, onCatch, onRemove, containerNxRef, isMobile }) {
  const g = useRef(null);
  const nyRef = useRef(1.1); 
  const isCaught = useRef(false);
  const prevJarNxRef = useRef(containerNxRef.current);
  
  const { viewport } = useThree();

  useFrame((_, dt) => {
    if (!g.current || isCaught.current) return;

    nyRef.current -= speed * dt;
    g.current.rotation.y += dt * 2.6;
    g.current.rotation.z += dt * 1.6;

    // Project Percentage Math directly onto the 3D Canvas
    const worldX = (nx - 0.5) * viewport.width;
    const worldY = (nyRef.current - 0.5) * viewport.height;
    g.current.position.set(worldX, worldY, 0);

    const currentJarNx = containerNxRef.current;
    const prevJarNx = prevJarNxRef.current;
    prevJarNxRef.current = currentJarNx;

    if (nyRef.current <= 0.25 && nyRef.current >= -0.05) {
      const catchTolerance = isMobile ? 0.20 : 0.15; 
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

    if (nyRef.current < -0.1) {
      onRemove(id);
    }
  });

  return (
    <group ref={g} scale={0.09}>
      <RealisticBanana />
    </group>
  );
}

/* ===================== SCENE ===================== */
function GameScene({ bananas, onCatch, onRemove, containerNxRef, isMobile }) {
  return (
    <>
      <PerspectiveCamera makeDefault fov={40} />
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
        />
      ))}

      <ContactShadows position={[0, -2.7, 0]} opacity={0.55} scale={20} blur={1.4} far={4} color="#2d3748" frames={1} />
    </>
  );
}

/* ===================== MAIN ===================== */
export default function Hero3D({ containerDesktop, containerMobile, isMobile }) {
  const wrapRef = useRef(null);

  const audioPool = useRef([]);
  const poolIndex = useRef(0);
  const bgMusic = useRef(null);
  const gameOverMusic = useRef(null);

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
      [bgMusic.current, gameOverMusic.current].forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const containerNxRef = useRef(0.5); 
  const desiredNxRef = useRef(0.5);
  const overlayImgRef = useRef(null);

  const [gameState, setGameState] = useState("idle");
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [scoreUI, setScoreUI] = useState(0);
  const [bananas, setBananas] = useState([]);
  const [isBumping, setIsBumping] = useState(false); 
  
  const lastSpawnSide = useRef(1);
  const scoreRef = useRef(0);

  const running = gameState === "running";

  const playCatch = useCallback(() => {
    const audio = audioPool.current[poolIndex.current];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.8;
      const playPromise = audio.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
      poolIndex.current = (poolIndex.current + 1) % audioPool.current.length;
    }
  }, []);

  const handleStartGame = () => {
    setGameState("running");
    scoreRef.current = 0;
    setScoreUI(0);
    setBananas([]);
    containerNxRef.current = 0.5;
    desiredNxRef.current = 0.5;

    audioPool.current.forEach(audio => {
      audio.muted = true;
      audio.play().then(() => { audio.pause(); audio.currentTime = 0; audio.muted = false; }).catch(() => {});
    });

    if (gameOverMusic.current) {
      gameOverMusic.current.pause();
      gameOverMusic.current.currentTime = 0;
    }
    if (bgMusic.current) {
      bgMusic.current.currentTime = 0;
      bgMusic.current.play().catch(() => {});
    }
  };

  const handleGameOver = useCallback(() => {
    setGameState("over");
    if (bgMusic.current) bgMusic.current.pause();
    if (gameOverMusic.current) {
      gameOverMusic.current.currentTime = 0;
      gameOverMusic.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    setTimeLeft(GAME_SECONDS);
    const started = performance.now();

    const t = setInterval(() => {
      const elapsed = (performance.now() - started) / 1000;
      const remaining = Math.max(0, Math.ceil(GAME_SECONDS - elapsed));
      setTimeLeft(remaining);
      setScoreUI(scoreRef.current);
      if (remaining <= 0) handleGameOver();
    }, 200);

    return () => clearInterval(t);
  }, [running, handleGameOver]);

  // SPAWN LOOP
  useEffect(() => {
    if (!running) return;

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      acc += dt;

      const currentSpawnEvery = Math.max(MIN_SPAWN, BASE_SPAWN - scoreRef.current * 0.005);
      const currentFallSpeed = Math.min(MAX_FALL_SPEED, BASE_FALL_SPEED + scoreRef.current * 0.005);
while (acc >= currentSpawnEvery) {
        acc -= currentSpawnEvery;

        setBananas((prev) => {
          if (prev.length >= MAX_ONSCREEN) return prev;
          
          lastSpawnSide.current *= -1; 
          
          // === THE ANTI-CLUSTER FIX (EXTREME EDGES) ===
          // minOffset 0.35 means we start 35% away from the exact center (0.5).
          // This forces bananas into the 15% and 85% columns of the screen.
          const minOffset = isMobile ? 0.35 : 0.20; 
          
          // spread 0.10 means they can push up to 10% further out.
          // This results in mobile bananas strictly spawning between 5%-15% (Left) and 85%-95% (Right).
          const spread = isMobile ? 0.10 : 0.25;    
          
          const randomOffset = minOffset + Math.random() * spread; 
          const nx = lastSpawnSide.current === 1 ? 0.5 + randomOffset : 0.5 - randomOffset;

          return [
            ...prev,
            { 
              id: `${Date.now()}-${Math.random()}`, 
              nx, 
              speed: currentFallSpeed * (0.85 + Math.random() * 0.35) 
            },
          ];
        });
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, isMobile]); 

  const setDesiredFromClientX = (clientX) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let nx = (clientX - rect.left) / rect.width; 
    
    // Safely keeps the container fully visible inside the screen
    const clampEdge = isMobile ? 0.12 : 0.10; 
    nx = Math.max(clampEdge, Math.min(1 - clampEdge, nx)); 
    desiredNxRef.current = nx;
  };

  const onPointerDown = (e) => { if (running) setDesiredFromClientX(e.clientX); };
  const onPointerMove = (e) => { if (running) setDesiredFromClientX(e.clientX); };

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      containerNxRef.current = THREE.MathUtils.lerp(containerNxRef.current, desiredNxRef.current, CONTAINER_LERP);

      if (overlayImgRef.current) {
        overlayImgRef.current.style.left = `${containerNxRef.current * 100}%`;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onCatch = useCallback(() => {
    scoreRef.current += 1;
    playCatch();
    setIsBumping(true);
    setTimeout(() => setIsBumping(false), 80); 
  }, [playCatch]);

  const onRemove = useCallback((id) => {
    setBananas((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <div
      ref={wrapRef}
      className="hero-3d-container"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none", overflow: "hidden" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      {running && (
        <>
          <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, fontSize: 32, fontWeight: 'bold', color: 'white', textShadow: '2px 2px 4px black' }}>
            {scoreUI}
          </div>
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, fontSize: 24, color: 'white', textShadow: '2px 2px 4px black' }}>
            {timeLeft}s
          </div>
        </>
      )}

      {gameState === "idle" && (
        <button 
          onClick={handleStartGame} 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 20, 
            padding: 'clamp(12px, 3vw, 15px) clamp(24px, 6vw, 40px)', 
            fontSize: 'clamp(18px, 6vw, 28px)', 
            backgroundColor: '#FFD700', 
            border: 'none', 
            borderRadius: '15px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            maxWidth: '90vw', 
            whiteSpace: 'nowrap'
          }}>
          START
        </button>
      )}

      {gameState === "over" && (
        <button 
          onClick={handleStartGame} 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 20, 
            padding: 'clamp(12px, 3vw, 15px) clamp(24px, 6vw, 40px)', 
            fontSize: 'clamp(18px, 6vw, 28px)', 
            backgroundColor: '#FFD700', 
            border: 'none', 
            borderRadius: '15px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            maxWidth: '90vw', 
            whiteSpace: 'nowrap' 
          }}>
          PLAY AGAIN ({scoreUI})
        </button>
      )}

      <img
        ref={overlayImgRef}
        src={isMobile ? containerMobile : containerDesktop}
        alt="Container"
        draggable={false}
        style={{
          position: "absolute",
          bottom: "5%",         
          left: "50%", 
          transform: `translateX(-50%) scale(${isBumping ? 1.08 : 1})`,
          transition: "transform 0.08s ease-out", 
          zIndex: 5,
          pointerEvents: "none",
          width: isMobile ? "min(140px, 35vw)" : "200px", 
          height: "auto"
        }}
      />

      <Canvas shadows dpr={[1, 2]} gl={{ alpha: true }} style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}>
        <Suspense fallback={null}>
          <GameScene bananas={running ? bananas : []} onCatch={onCatch} onRemove={onRemove} containerNxRef={containerNxRef} isMobile={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}