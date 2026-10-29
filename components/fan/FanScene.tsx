"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { discFragment, discVertex, glassFragment, glassVertex, ledFragment, ledVertex, streakFragment, streakVertex } from "./shaders";

// Ported from holo/src/three/Fan.tsx + HoloScene.tsx: the same rotor, LED strips and POV disc,
// at a fixed 700 rpm with the cover on, rendered on a transparent canvas over the room photo.
const BLADES = 2;
const R_IN = 0.1;
const FULL_SPEED = 11.7; // rev/s (≈ 700 rpm)

const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/** A muted looping video texture for one clip; falls back to the poster when autoplay is refused. */
function useClipTexture(src: string, poster: string, active: boolean) {
  const video = useMemo(() => {
    const v = document.createElement("video");
    v.src = src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = active ? "auto" : "metadata";
    v.crossOrigin = "anonymous";
    return v;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
  const [texture, setTexture] = useState<THREE.Texture>(() => {
    const t = new THREE.VideoTexture(video);
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  });
  useEffect(() => {
    let cancelled = false;
    if (active) {
      video.currentTime = 0;
      video.play().catch(() => {
        if (cancelled) return;
        new THREE.TextureLoader().load(poster, (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          if (!cancelled) setTexture(t);
        });
      });
    } else {
      video.pause();
    }
    return () => {
      cancelled = true;
    };
  }, [video, poster, active]);
  return texture;
}

type ClipProps = { src: string; poster: string };

function Fan({ textures, active }: { textures: THREE.Texture[]; active: number }) {
  const rotor = useRef<THREE.Group>(null!);
  const angle = useRef(0);
  const glowLight = useRef<THREE.PointLight>(null!);
  const gain = useRef(0);
  const shown = useRef(active);

  const discMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: discVertex,
        fragmentShader: discFragment,
        uniforms: {
          uTex: { value: textures[active] },
          uAngle: { value: 0 },
          uSweep: { value: 6 },
          uRings: { value: 0 },
          uTime: { value: 0 },
          uGain: { value: 0 },
        },
        transparent: true,
        // pure additive, premultiplied: light adds to the room behind, darkness adds nothing
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    // the material is created once; the texture swaps through the uniform
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const ledMats = useMemo(
    () =>
      Array.from(
        { length: BLADES },
        (_, k) =>
          new THREE.ShaderMaterial({
            vertexShader: ledVertex,
            fragmentShader: ledFragment,
            uniforms: {
              uTex: { value: textures[active] },
              uAngle: { value: 0 },
              uOffset: { value: k * Math.PI + Math.PI / 2 },
              uRIn: { value: R_IN },
              uGlow: { value: 2.2 },
              uOpacity: { value: 0 },
            },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const bladeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#141416", roughness: 0.55, metalness: 0.4, transparent: true, opacity: 0, side: THREE.DoubleSide }),
    [],
  );
  // the LED bar at 700 rpm: the eye keeps a soft streak across the disc with the bright LED line down its middle
  const streakMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: streakVertex,
        fragmentShader: streakFragment,
        uniforms: { uTime: { value: 0 }, uTex: { value: textures[active] } },
        transparent: true,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
        depthWrite: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  // the clear cover: light only, additive, so the room shows through it untouched
  const coverMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: glassVertex,
        fragmentShader: glassFragment,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 30);
    const s = FULL_SPEED;
    angle.current = (angle.current + s * d * Math.PI * 2) % (Math.PI * 2);
    rotor.current.rotation.z = angle.current;

    // cross-dissolve: fade the picture out, swap the clip, fade back in
    const target = shown.current === active ? 1.35 : 0;
    gain.current += (target - gain.current) * Math.min(1, d * 6);
    if (shown.current !== active && gain.current < 0.05) {
      shown.current = active;
      discMat.uniforms.uTex.value = textures[active];
      streakMat.uniforms.uTex.value = textures[active];
      for (const m of ledMats) m.uniforms.uTex.value = textures[active];
    }

    const sweep = Math.max(0.04, s * Math.PI * 2 * 0.085);
    discMat.uniforms.uAngle.value = angle.current;
    discMat.uniforms.uSweep.value = sweep;
    discMat.uniforms.uRings.value = 1 - smooth((sweep - 1.2) / 3.0);
    discMat.uniforms.uTime.value += d;
    discMat.uniforms.uGain.value = gain.current;
    coverMat.uniforms.uTime.value += d;
    streakMat.uniforms.uTime.value += d;

    const bladeVis = 1 - smooth((s - 2.5) / 3.5);
    bladeMat.opacity = bladeVis;
    for (const m of ledMats) {
      m.uniforms.uAngle.value = angle.current;
      m.uniforms.uOpacity.value = bladeVis;
    }
    glowLight.current.intensity = 0.4 + 0.9 * (1 - bladeVis);
  });

  return (
    <group>
      {/* The motor sits behind the picture on the real unit and the picture hides it, so nothing is modelled
          behind the disc; the pole starts below the disc's edge. */}
      <mesh position={[0, -1.72, -0.2]}>
        <cylinderGeometry args={[0.055, 0.06, 1.3, 32]} />
        <meshStandardMaterial color="#111113" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* the blur the eye keeps of the LED bar, fixed where the comps show it (upper left to lower right) */}
      <mesh position={[0, 0, 0.02]} rotation={[0, 0, -0.712]} material={streakMat}>
        <planeGeometry args={[2.0, 0.3]} />
      </mesh>

      {/* rotor: the hub sits behind the picture on the real unit, so only the blades are modelled */}
      <group ref={rotor}>
        {Array.from({ length: BLADES }, (_, k) => (
          <group key={k} rotation={[0, 0, k * Math.PI]}>
            <mesh position={[0, R_IN + 0.45, 0]} material={bladeMat}>
              <planeGeometry args={[0.075, 0.9]} />
            </mesh>
            <mesh position={[0, R_IN + 0.45, 0.004]} material={ledMats[k]}>
              <planeGeometry args={[0.05, 0.9]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* picture */}
      <mesh position={[0, 0, 0.012]} material={discMat}>
        <circleGeometry args={[1, 160]} />
      </mesh>

      {/* clear protective cover: only its reflections */}
      <mesh position={[0, 0, 0.09]} material={coverMat}>
        <circleGeometry args={[1.07, 128]} />
      </mesh>

      <pointLight ref={glowLight} position={[0, 0.2, 1.4]} color="#bfe6ff" intensity={1} distance={5} decay={2} />
    </group>
  );
}

function Clips({ clips, active }: { clips: ClipProps[]; active: number }) {
  // one texture per clip so a tab switch never waits on a load
  const t0 = useClipTexture(clips[0].src, clips[0].poster, active === 0);
  const t1 = useClipTexture(clips[1].src, clips[1].poster, active === 1);
  const t2 = useClipTexture(clips[2].src, clips[2].poster, active === 2);
  const t3 = useClipTexture(clips[3].src, clips[3].poster, active === 3);
  return <Fan textures={[t0, t1, t2, t3]} active={active} />;
}

type Props = { clips: ClipProps[]; active: number; running?: boolean; lowPower?: boolean; className?: string };

export default function FanScene({ clips, active, running = true, lowPower = false, className }: Props) {
  return (
    <Canvas
      className={className}
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0.05, 5.4], fov: 32, near: 0.1, far: 40 }}
      gl={{ antialias: !lowPower, powerPreference: "high-performance", alpha: true, stencil: false, premultipliedAlpha: true }}
      frameloop={running ? "always" : "never"}
      style={{ position: "absolute", inset: 0, background: "transparent" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={0.22} />
      <spotLight position={[2.5, 3.5, 3.5]} angle={0.55} penumbra={1} intensity={60} color="#ffe2b8" />
      <pointLight position={[-3, -1.5, 2.5]} intensity={8} color="#9fb4ff" />
      <Clips clips={clips} active={active} />
    </Canvas>
  );
}
