// @ts-nocheck
import { RenderTarget, Texture } from "ogl";
import { createShader } from "../createShader";
import vertex from "./default.vert";
import fragment from "./fluidVelocity.frag";

const shader = createShader(vertex, fragment, {
  pressureMap: { value: 0 },
  velocityMap: { value: 0 },
  flowMap: { value: 0 },
  uSize: { value: [0, 0] },
  gravity: { value: [0, -0.00055] },
  viscosity: { value: 0.16 },
  drag: { value: 0.0018 },
  velocityDecay: { value: 0.9985 },
  pressureStrength: { value: 0.006 },
  flowStrength: { value: 0.1 },
  floorLevel: { value: 0.16 },
  floorResistance: { value: 0.94 },
});

export const FLUID_PHYSICS = {
  gravity: [0, -0.00055] as [number, number],
  viscosity: 0.16,
  drag: 0.0018,
  velocityDecay: 0.9985,
  pressureStrength: 0.006,
  flowStrength: 0.1,
  floorLevel: 0.16,
  floorResistance: 0.94,
};

/**
 * Get velocity from pressure map
 * @param {RenderTarget} target
 * @param {Texture} pressureMap
 * @param {Texture} velocityMap
 * @param {Texture} flowMap
 */
export default function (target, pressureMap, velocityMap, flowMap) {
  shader(target, {
    pressureMap,
    velocityMap,
    flowMap,
    uSize: [target.width, target.height],
    gravity: FLUID_PHYSICS.gravity,
    viscosity: FLUID_PHYSICS.viscosity,
    drag: FLUID_PHYSICS.drag,
    velocityDecay: FLUID_PHYSICS.velocityDecay,
    pressureStrength: FLUID_PHYSICS.pressureStrength,
    flowStrength: FLUID_PHYSICS.flowStrength,
    floorLevel: FLUID_PHYSICS.floorLevel,
    floorResistance: FLUID_PHYSICS.floorResistance,
  });
}
