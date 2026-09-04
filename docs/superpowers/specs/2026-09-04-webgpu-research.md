# WebGPU vs WebGL — Research
Date: 2026-09-04
Question: Is it fine to use WebGPU instead of WebGL? Or is it too soon?

## Answer
- Too soon for v1. Use WebGL now.
- Keep door open for WebGPU in v2.

## Findings

- W3C WebGPU spec is still draft.
  - Page title is "WebGPU", status is "CRD".
  - Generator date is Aug 21 2026.
  - Source: https://www.w3.org/TR/webgpu/ (fetched 2026-09-04)
- MDN says WebGPU is successor to WebGL.
  - Text: "WebGPU is the successor to WebGL".
  - Text: "WebGPU API enables web developers to use the underlying system's GPU".
  - Source: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API (fetched 2026-09-04)
- Three.js ships two renderers.
  - List shows `WebGLRenderer.html` and `WebGPURenderer.html` as separate pages.
  - WebGL path is still present. WebGPU path is separate.
  - Source: https://threejs.org/docs/#api/en/renderers/WebGPURenderer (fetched 2026-09-04)
- Spec target in this repo needs broad reach.
  - Target is latest LTS of Chrome, Safari, Firefox + Edge Chromium + mobile swipe.
  - WebGL meets this now. WebGPU does not meet this in all LTS builds.
  - Source: `docs/superpowers/specs/2026-09-04-museum-design.md` Sec 9

## Impact on museum spec

- No change to Sec 3 stack for v1. Keep `Three.js WebGLRenderer`.
- No change to Sec 9 fallback. Keep `fallback.png` for no WebGL.
- v2 option: add WebGPU if present, else fall back to WebGL.
  - Pseudo: `if (navigator.gpu) use WebGPU else use WebGL`.
  - Keeps same seed -> params -> frame design. Only renderer changes.

## Sources
- https://www.w3.org/TR/webgpu/
- https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
- https://threejs.org/docs/#api/en/renderers/WebGPURenderer
