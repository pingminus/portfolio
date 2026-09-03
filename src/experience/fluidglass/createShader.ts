import { Renderer, Program, Mesh, Geometry, Texture, RenderTarget } from "ogl";

const renderer = new Renderer();
const gl = renderer.gl;

const geometry = new Geometry(gl, {
  position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
  uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
});

const mesh = new Mesh(gl, { geometry });

/**
 * Given vertex, fragment shader and unform object,
 * returns a function(target, unifrom)
 * that render the given shader on a fullscreen mesh, onto the given target
 * @param {string} vertex vertex shader code
 * @param {string} fragment fragment shader code
 * @param {object} uniforms uniform object
 * @returns function that renders
 */
function createShader(
  vertex: string,
  fragment: string,
  uniforms: Record<string, { value: unknown }> = {},
) {
  const program = new Program(gl, { vertex, fragment, uniforms });
  return function (
    target: RenderTarget | null,
    values: Record<string, unknown> = {},
  ) {
    mesh.program = program;
    for (const key in values) mesh.program.uniforms[key].value = values[key];
    if (target) renderer.render({ scene: mesh, target });
    else renderer.render({ scene: mesh });
  };
}

export { renderer, gl, createShader };
