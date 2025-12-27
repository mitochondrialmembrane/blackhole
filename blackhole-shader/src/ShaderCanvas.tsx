import { useEffect, useRef } from "react";
import { createProgram } from "./gl";
import { VERT } from "./vert";
import { FRAG } from "./frag";



export function ShaderCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl", { antialias: false });
        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        // Fullscreen quad
        const quad = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]);

        const program = createProgram(gl, VERT, FRAG);
        gl.useProgram(program);

        const buf = gl.createBuffer();
        if (!buf) throw new Error("Failed to create buffer");
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

        const aPos = gl.getAttribLocation(program, "a_pos");
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(program, "u_resolution");
        const uTime = gl.getUniformLocation(program, "u_time");

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = Math.floor(window.innerWidth * dpr);
            const h = Math.floor(window.innerHeight * dpr);
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                canvas.style.width = "100%";
                canvas.style.height = "100%";
                gl.viewport(0, 0, w, h);
            }
            gl.uniform2f(uRes, canvas.width, canvas.height);
        };

        resize();
        window.addEventListener("resize", resize);

        let raf = 0;
        const t0 = performance.now();

        const frame = () => {
            const t = (performance.now() - t0) / 1000;
            gl.uniform1f(uTime, t);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(raf);
            gl.deleteBuffer(buf);
            gl.deleteProgram(program);
        };
    }, []);

    return <canvas ref={canvasRef} />;
}