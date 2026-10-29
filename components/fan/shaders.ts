// Ported from holo/src/three/shaders.ts: the same persistence-of-vision disc and LED strip.
export const discVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Persistence-of-vision disc.
 * Each blade leaves an exponentially fading trail behind it (uSweep radians of
 * "retained light"). At 700 rpm the trails overlap and the whole picture reads
 * as solid; slowed down, you see two arcs sweeping the image into existence.
 */
export const discFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uAngle;
  uniform float uSweep;
  uniform float uRings;
  uniform float uTime;
  uniform float uGain;
  varying vec2 vUv;

  const float PI = 3.141592653589793;
  const float TAU = 6.283185307179586;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;
    float theta = atan(p.y, p.x);

    float sum = 0.0;
    for (int k = 0; k < 2; k++) {
      float a = uAngle + float(k) * PI + PI * 0.5;
      float d = mod(a - theta, TAU);
      sum += exp(-d / uSweep);
    }
    float I = 1.0 - exp(-sum * 1.4);

    float ring = 1.0 - smoothstep(0.18, 0.5, abs(fract(r * 72.0) - 0.5));
    float rings = mix(1.0, 0.25 + 0.75 * ring, uRings);

    vec3 col = texture2D(uTex, vUv).rgb;
    float flicker = 0.97 + 0.03 * sin(uTime * 38.0 + r * 24.0);
    float edge = 1.0 - smoothstep(0.955, 1.0, r);
    // the real rotor sits behind the picture, so the image runs all the way to the centre
    col *= I * rings * flicker * edge * uGain;
    // The canvas floats over a photograph: emit light only, with alpha following the brightest channel
    // so the transparent frame stays transparent where the disc is dark.
    gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
  }
`;

export const ledVertex = discVertex;
export const glassVertex = discVertex;

/**
 * Clear acrylic cover: no body, only the light it catches. A faint rim where the edge of the
 * disc refracts, a soft specular glint on the upper left, and a barely-there sheen across the face.
 */
export const glassFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;
    float theta = atan(p.y, p.x);

    float rim = smoothstep(0.90, 0.985, r) * (1.0 - smoothstep(0.985, 1.0, r));
    // glint: a bright arc on the upper-left rim, fading with angular distance
    float ang = abs(mod(theta - 2.35 + 3.14159, 6.28318) - 3.14159);
    float glint = exp(-ang * ang * 3.2);
    // a second, dimmer catch-light on the lower right
    float ang2 = abs(mod(theta + 0.75 + 3.14159, 6.28318) - 3.14159);
    float glint2 = exp(-ang2 * ang2 * 6.0) * 0.35;
    // diagonal sheen across the face, drifting slowly so the surface reads as glass, not haze
    float sheen = smoothstep(0.55, 0.0, abs(p.x * 0.6 - p.y * 0.8 + 0.15 + 0.08 * sin(uTime * 0.6))) * 0.045 * (1.0 - r * 0.6);

    float a = rim * (0.05 + 0.38 * glint + 0.8 * glint2) + sheen;
    gl_FragColor = vec4(vec3(1.0) * a, a);
  }
`;

/** One blade's LED strip: samples the picture along its own radius. */
export const ledFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uAngle;
  uniform float uOffset;
  uniform float uRIn;
  uniform float uGlow;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    float r = mix(uRIn, 1.0, vUv.y);
    float th = uAngle + uOffset;
    vec2 uv = 0.5 + 0.5 * r * vec2(cos(th), sin(th));
    vec3 c = texture2D(uTex, uv).rgb;
    float dots = smoothstep(0.5, 0.32, abs(fract(vUv.y * 64.0) - 0.5));
    float strip = smoothstep(0.5, 0.28, abs(vUv.x - 0.5));
    float mask = dots * strip;
    vec3 lit = c * uGlow * mask;
    vec3 unlit = vec3(0.035) * mask;
    gl_FragColor = vec4(lit + unlit, mask * uOpacity);
  }
`;

/** The streak needs the disc-space position of each fragment so it can dim where the picture is lit. */
export const streakVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vDisc;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vDisc = world.xy * 0.5 + 0.5; // the picture disc is radius 1 at the origin
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/** The LED bar as the eye keeps it at 700 rpm: a soft blue-white streak with the bright LED line down the middle. */
export const streakFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform sampler2D uTex;
  varying vec2 vUv;
  varying vec2 vDisc;

  void main() {
    float x = vUv.x * 2.0 - 1.0;   // along the bar
    float y = vUv.y * 2.0 - 1.0;   // across it
    float ends = 1.0 - smoothstep(0.55, 1.0, abs(x));
    float hubGap = smoothstep(0.08, 0.2, abs(x));
    // a wide soft body (the blur of the bar itself) with the bright LED core down its middle
    float body = exp(-y * y * 2.2) * 0.42;
    float edge = exp(-y * y * 9.0) * 0.25;
    float line = exp(-y * y * 160.0) * 0.9;
    float dots = 0.75 + 0.25 * (0.5 + 0.5 * sin(x * 160.0 + uTime * 4.0));
    // the bar passes behind the product: where the picture is lit, the picture wins
    vec3 pic = texture2D(uTex, clamp(vDisc, 0.0, 1.0)).rgb;
    float lit = max(pic.r, max(pic.g, pic.b));
    float behind = 1.0 - smoothstep(0.12, 0.45, lit) * 0.85;
    float a = (body + edge + line * dots) * ends * hubGap * behind;
    vec3 col = mix(vec3(0.40, 0.56, 1.0), vec3(0.86, 0.93, 1.0), line) * a;
    gl_FragColor = vec4(col, a);
  }
`;
