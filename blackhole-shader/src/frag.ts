export const FRAG = `
precision highp float;

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = v_uv;
  gl_FragColor = vec4(uv.x, uv.y, 0.0, 1.0);
}
`;
