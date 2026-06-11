# 3D Rubik's Cube

A candy-colored, fully playable Rubik's cube in the browser. Drag a face to turn a layer, scramble it, and solve it — a GSAP celebration (jump, spin, explosion, reassembly) plays when you genuinely win.

**Live demo:** https://vivian-chi.github.io/3d-cube/

## How to play

- **Drag a face** of the cube to turn that layer — the turn axis is inferred from the face you grabbed and the direction you drag.
- **Drag the background** to orbit the whole cube.
- **🔀 Scramble** shuffles with ~24 rapid random turns; solving after a scramble triggers the celebration (Reset never does).
- **↺ Reset** snaps the cube back to solved.
- **🎨 Palette** cycles three color themes: Marshmallow, Candy, Jelly Rainbow.

## Tech

- [React 19](https://react.dev) + TypeScript + [Vite](https://vite.dev)
- [three.js](https://threejs.org) via [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) and [drei](https://github.com/pmndrs/drei)
- [GSAP](https://gsap.com) for the solve-celebration timeline

The soft "marshmallow" look comes from a milky transmissive glass body per cubelet with matte rounded sticker tiles, ACES tone mapping, and warm/cool three-point lighting.

Cube state lives in refs, not React state: each of the 27 cubelets tracks logical grid coordinates plus a committed position/quaternion, and `useFrame` animates one 90° turn at a time. Solve detection checks face-color uniformity from each sticker's rotated normal, so a whole-cube rotation still counts as solved. See [docs/specs](docs/specs/) for the celebration design doc.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint
```

Pushes to `main` deploy to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The Vite `base` is `/3d-cube/`, so the repo must be named `3d-cube` (or update `vite.config.ts`).

## License

[MIT](LICENSE)
