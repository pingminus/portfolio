import { Flowmap, RenderTarget } from "ogl";
import { useEffect, useRef } from "react";
import { renderer, gl } from "./createShader";
import canvasRenderer from "./canvasRenderer";
import backgroundClock from "./shader/backgroundClock";
import displayTexture from "./shader/displayTexture";
import fluidVelocity from "./shader/fluidVelocity";
import initializePressure from "./shader/initializePressure";
import reactionDiffusion from "./shader/reactionDiffusion";
import advection from "./shader/advection";
import velocityCorrection from "./shader/velocityCorrection";
import velocityToPresure from "./shader/velocityToPresure";
import glassShading from "./shader/glassShading";
import { getUrlParam } from "./getUrlParam";

interface FluidGlassScreensaverProps {
  active: boolean;
}

const FADE_OUT_DURATION = 3000;
const GERMANY_FORM_DURATION = 900;
const GERMANY_HOLD_DURATION = 1800;
const GERMANY_DISSOLVE_DURATION = 1200;

function createRenderTarget(
  isDelayed: boolean,
  delayed: RenderTarget[],
  immediate: RenderTarget[],
) {
  const target = new RenderTarget(gl, {
    width: 512,
    height: 512,
    type: (gl as unknown as WebGL2RenderingContext).HALF_FLOAT,
    format: gl.RGBA,
    internalFormat: (gl as unknown as WebGL2RenderingContext).RGBA16F,
    depth: false,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
  });
  (isDelayed ? delayed : immediate).push(target);
  return target;
}

export function FluidGlassScreensaver({ active }: FluidGlassScreensaverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const lifecycleRef = useRef<{ start: () => void; stop: () => void } | null>(
    null,
  );
  activeRef.current = active;

  useEffect(() => {
    if (active) lifecycleRef.current?.start();
    else lifecycleRef.current?.stop();
  }, [active]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let alive = true;
    let flowmap: Flowmap | undefined;
    let pressure: RenderTarget;
    let background: RenderTarget;
    let pressureTemp: RenderTarget;
    let velocity: RenderTarget;
    let velocityTemp: RenderTarget;
    let frame = 0;
    let stopTimer: number | undefined;
    let introStartedAt = 0;
    let running = false;
    let initialized = false;
    let simulationSize: [number, number] = [512, 512];
    let resizeNeeded = true;
    const immediateTargets: RenderTarget[] = [];
    const delayedTargets: RenderTarget[] = [];
    const parallax = { x: 0, y: 0 };
    const motion = { x: 0, y: 0 };
    let hasOrientation = false;
    let previousTouch: { x: number; y: number } | undefined;
    const iteration = getUrlParam("iteration", 10, Number);
    const germanyTimeFormatter = new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const renderForeground = (
      canvas: HTMLCanvasElement,
      context: CanvasRenderingContext2D,
    ) => {
      context.fillStyle = "white";
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.textAlign = "center";
      context.textBaseline = "middle";
      const elapsed = performance.now() - introStartedAt;
      const germanyTime = germanyTimeFormatter.format(new Date());
      const germanyStart = 0;
      const germanyHoldStart = germanyStart + GERMANY_FORM_DURATION;
      const clockStart =
        germanyHoldStart + GERMANY_HOLD_DURATION + GERMANY_DISSOLVE_DURATION;

      if (elapsed >= germanyStart && elapsed < clockStart) {
        const formProgress = Math.min(
          1,
          (elapsed - germanyStart) / GERMANY_FORM_DURATION,
        );
        const dissolveProgress =
          elapsed > germanyHoldStart + GERMANY_HOLD_DURATION
            ? Math.min(
                1,
                (elapsed - germanyHoldStart - GERMANY_HOLD_DURATION) /
                  GERMANY_DISSOLVE_DURATION,
              )
            : 0;
        const titleProgress = formProgress * (1 - dissolveProgress);
        const scale = 0.82 + Math.min(1, formProgress) * 0.18;
        context.save();
        context.globalAlpha = titleProgress;
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(scale, scale);
        context.font = `700 ${Math.round(Math.min(canvas.width / 5.2, canvas.height / 2.8))}px Instrument Sans Variable`;
        context.fillText("GERMANY", 0, 0);
        context.restore();
      }

      context.globalAlpha =
        elapsed < clockStart ? 0 : Math.min(1, (elapsed - clockStart) / 700);
      if (canvas.width > canvas.height * 1.5) {
        const size = canvas.width / 8;
        context.font = `${Math.round(size)}px Roboto Mono`;
        context.fillText(germanyTime, canvas.width / 2, canvas.height / 2);
      } else {
        const size = canvas.height / 4;
        context.font = `${Math.round(size)}px Roboto Mono`;
        const [hours, minutes, seconds] = germanyTime.split(":");
        context.fillText(hours, canvas.width / 2, canvas.height / 2 - size);
        context.fillText(minutes, canvas.width / 2, canvas.height / 2);
        context.fillText(seconds, canvas.width / 2, canvas.height / 2 + size);
      }
      context.globalAlpha = 1;
    };

    const resize = () => {
      const rect = root.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      resizeNeeded = true;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!activeRef.current || !flowmap) return;
      const rect = root.getBoundingClientRect();
      flowmap.mouse.set(
        event.clientX / rect.width,
        (rect.bottom - event.clientY) / rect.height,
      );
      flowmap.velocity.set(
        (event.movementX / rect.width) * simulationSize[0],
        (event.movementY / rect.width) * simulationSize[1],
      );
      motion.x += event.movementX * 0.001;
      motion.y -= event.movementY * 0.001;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!activeRef.current || !flowmap || event.touches.length === 0) return;
      const touch = event.touches[0];
      const rect = root.getBoundingClientRect();
      event.preventDefault();
      flowmap.mouse.set(
        touch.clientX / rect.width,
        (rect.bottom - touch.clientY) / rect.height,
      );
      const previous = previousTouch ?? { x: touch.clientX, y: touch.clientY };
      flowmap.velocity.set(
        ((touch.clientX - previous.x) / rect.width) * simulationSize[0],
        ((touch.clientY - previous.y) / rect.width) * simulationSize[1],
      );
      previousTouch = { x: touch.clientX, y: touch.clientY };
    };

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null) hasOrientation = true;
      if (hasOrientation) {
        parallax.x = (event.beta ?? 0) / 45;
        parallax.y = (event.gamma ?? 0) / 45;
      }
    };

    window.addEventListener("resize", resize);

    const update = () => {
      if (!alive || !running || !flowmap) return;
      frame = requestAnimationFrame(update);
      flowmap.update();
      flowmap.velocity.set(0, 0);
      parallax.x += motion.x * 0.1;
      parallax.y += motion.y * 0.1;
      parallax.x *= 0.99;
      parallax.y *= 0.99;
      motion.x *= 0.8;
      motion.y *= 0.8;

      if (resizeNeeded) {
        resizeNeeded = false;
        displayTexture(pressureTemp, pressure.texture, false);
        displayTexture(velocityTemp, velocity.texture, false);
        const scale = Math.max(
          0.4,
          Math.min(
            0.8,
            (1024 / Math.min(renderer.width, renderer.height)) *
              window.devicePixelRatio,
          ),
        );
        const width = Math.round((renderer.width * scale) / 4) * 4;
        const height = Math.round((renderer.height * scale) / 4) * 4;
        simulationSize = [width, height];
        for (const target of immediateTargets) target.setSize(width, height);
        displayTexture(pressure, pressureTemp.texture, false);
        displayTexture(velocity, velocityTemp.texture, false);
        for (const target of delayedTargets) target.setSize(width, height);
      }

      fluidVelocity(
        velocityTemp,
        pressure.texture,
        velocity.texture,
        flowmap.mask.read.texture,
      );
      const maskTexture = canvasRenderer(renderer, renderForeground);
      for (let index = 0; index < iteration; index += 1) {
        velocityToPresure(pressureTemp, velocityTemp.texture);
        velocityCorrection(
          velocity,
          pressureTemp.texture,
          velocityTemp.texture,
        );
        advection(velocityTemp, velocity.texture, velocity.texture);
        advection(pressureTemp, pressure.texture, velocity.texture);
        reactionDiffusion(pressure, pressureTemp.texture, maskTexture);
      }
      displayTexture(velocity, velocityTemp.texture, false);
      backgroundClock(background, [parallax.x, parallax.y]);
      glassShading(renderer, pressure.texture, background.texture, [
        parallax.x,
        parallax.y,
      ]);
    };
    const start = () => {
      if (!alive) return;
      if (stopTimer !== undefined) {
        window.clearTimeout(stopTimer);
        stopTimer = undefined;
      }
      if (running) return;
      if (!initialized) {
        pressure = createRenderTarget(false, delayedTargets, immediateTargets);
        background = createRenderTarget(
          false,
          delayedTargets,
          immediateTargets,
        );
        pressureTemp = createRenderTarget(
          true,
          delayedTargets,
          immediateTargets,
        );
        velocity = createRenderTarget(false, delayedTargets, immediateTargets);
        velocityTemp = createRenderTarget(
          true,
          delayedTargets,
          immediateTargets,
        );
        flowmap = new Flowmap(gl, {
          size: 512,
          falloff: 0.12,
          alpha: 0.8,
          dissipation: 0.7,
        });
        initializePressure(pressure);
        initialized = true;
      }
      root.appendChild(gl.canvas);
      renderer.setSize(window.innerWidth, window.innerHeight);
      resize();
      introStartedAt = performance.now();
      running = true;
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("deviceorientation", onOrientation);
      frame = requestAnimationFrame(update);
    };

    const stop = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("deviceorientation", onOrientation);
      if (stopTimer !== undefined) window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => {
        stopTimer = undefined;
        if (!activeRef.current) {
          running = false;
          cancelAnimationFrame(frame);
        }
      }, FADE_OUT_DURATION);
    };

    lifecycleRef.current = { start, stop };

    return () => {
      alive = false;
      stop();
      if (stopTimer !== undefined) window.clearTimeout(stopTimer);
      window.removeEventListener("resize", resize);
      if (gl.canvas.parentElement === root) root.removeChild(gl.canvas);
      lifecycleRef.current = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="fluidglass-screensaver__canvas"
      aria-hidden={!active}
    />
  );
}
