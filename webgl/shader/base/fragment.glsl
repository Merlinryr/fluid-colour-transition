precision highp float;

uniform vec2 uResolution;
uniform float uTime;

uniform int uAmount;
uniform float uSpeed;
uniform float uScale;
uniform float uProgress;
uniform float uCurtains;

uniform sampler2D tBackground;
uniform sampler2D tTransition;
uniform sampler2D tDiffuse;

varying vec2 vUv;

#define AMOUNT 6 // has to be int
#define PROGRESS 1.0 // has to be float

#include ../includes/hash.glsl
#include ../includes/coverTexture.glsl
#include ../includes/rotate.glsl
#include ../includes/noise.glsl


void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.y;

    // //////////////
    // Time control

    float t = uTime*uSpeed;

    // //////////////
    // UVs reworking

    vec2 newUv = (uv - vec2(0.5)*uResolution + vec2(0.5));
    vec2 uvDivided = fract(newUv*vec2(uCurtains, 0.0));
    vec2 uvBg = vUv;
    vec2 dispUv = newUv + rotate(3.1415926/4.)*uvDivided*uProgress; // Displacing UVs for grid
    uv *= uScale;

    // //////////////
    // Textures

    vec3 diffuse = coverTexture(tDiffuse, vec2(512.0, 512.0), vUv, uResolution).rgb;
    vec3 transition = coverTexture(tTransition, vec2(512.0, 512.0), vUv, uResolution).rgb;

    uvBg = fract(vUv*vec2(uCurtains, uCurtains));
    vec3 background = coverTexture(tBackground, vec2(3024.0, 4032.0), uvBg, uResolution).rgb;

    // //////////////
    // Colour Noise

    float h = noise(vec3(uv*2.,t));

    for (int n = 1; n < AMOUNT; n++){
        float i = float(n);
      uv -= vec2(0.7 / i * sin(i * uv.y+i + t*5. + h * i) + 0.8, 0.4 / i * sin(uv.x+4.-i+h + t*5. + 0.3 * i) + 1.6);
    }
    uv -= vec2(1.2 * sin(uv.x + t + h) + 1.8, 0.4 * sin(uv.y + t + 0.3*h) + 1.6);

    // //////////////
    // Mask properties
    
    vec2 center = vec2(0.5);
    float dist = distance(vUv, center);
    float thresh = 0.5 + noise(vec3(uv, t));
    float blur = .7;
    float smoothEdges = smoothstep(thresh, thresh + blur, dist); // Preventing gradient in the center

    // //////////////
    // Final Noise

    vec3 col = mix(vec3(0.0), vec3(2.0 * sin(dispUv.x), 0.0, 0.0) * 1.4, smoothEdges); // Applying grid UV's and center mask
    col *= (col + diffuse) - (col * diffuse); // Screen blending formula

    vec3 final = mix(col, background, PROGRESS);

    gl_FragColor = vec4(col, 1.0);
}