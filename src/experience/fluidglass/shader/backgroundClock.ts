// @ts-nocheck
import { createShader } from "../createShader";
import vertex from "./default.vert";
import fragment from "./backgroundClock.frag";

const FLAG_bgcolor = [0, 0, 0];
const FLAG_color1 = [0.68, 0.68, 0.68];
const FLAG_color2 = [0.12, 0.12, 0.12];
const FLAG_color3 = [0.92, 0.92, 0.92];

const shader = createShader(vertex, fragment, {
  uSize: { value: [0, 0] },
  parallax: { value: [0, 0] },
  clockHands: { value: [0, 0, 0] },
  bgcolor: { value: FLAG_bgcolor },
  circlecolor1: { value: FLAG_color1 },
  circlecolor2: { value: FLAG_color2 },
  circlecolor3: { value: FLAG_color3 },
});

export default function (target, parallax) {
  const now = new Date();
  shader(target, {
    parallax,
    uSize: [target.width, target.height],
    clockHands: [
      now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 60 / 60,
      now.getMinutes() +
        now.getSeconds() / 60 +
        now.getMilliseconds() / 1000 / 60,
      now.getSeconds() + now.getMilliseconds() / 1000,
    ],
  });
}
