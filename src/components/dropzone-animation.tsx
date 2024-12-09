import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// Separate plane mesh creation function
const createPlaneMesh = () => {
    const plane = new THREE.PlaneGeometry(2, 2);
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            iTime: { value: 0.0 },
            iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            iTransparency: { value: 1.0 },
        },
        vertexShader: `
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `,
        transparent: true,
        fragmentShader: `
            uniform float iTime;
            uniform vec2 iResolution;
            uniform float iTransparency;

            // Hash function for generating pseudo-random noise
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }

            // Smooth noise function
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                    u.y
                );
            }

            void mainImage(out vec4 fragColor, in vec2 fragCoord) {
                vec2 uv = fragCoord / iResolution.xy;

                float aspectRatio = iResolution.x / iResolution.y;
                vec2 center = vec2(0.5, 0.5); // Center remains at (0.5, 0.5)

                vec2 scaledUV = vec2(uv.x * aspectRatio, uv.y);
                vec2 scaledCenter = vec2(center.x * aspectRatio, center.y);

                vec2 offset = scaledUV - scaledCenter;

                vec2 quadSize = vec2(0.5 * aspectRatio, 0.5);
                vec2 edge = smoothstep(quadSize, quadSize - vec2(0.01), abs(offset));

                float time = iTime * 2.0;
                float noiseValue = noise(offset * 10.0 + vec2(time));

                float fresnel = pow(1.0 - dot(normalize(offset), vec2(0.0, 0.0)), 3.0);
                float smoke = fresnel * (0.5 + 0.5 * noiseValue);

                float glow = (1.0 - edge.x * edge.y) * smoke;

                vec3 borderColor = vec3(0.5, 0.0, 1.0); // Purple

                vec3 finalColor = borderColor * glow;
                float alpha = glow; // Alpha depends on the glow intensity

                fragColor = vec4(finalColor, alpha * iTransparency);
            }

            void main() {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `,
    });

    return new THREE.Mesh(plane, shaderMaterial);
};

export const AnimatedDropzone: React.FC<{ className?: string; transparency?: number }> = ({ className, transparency = 1.0 }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    useEffect(() => {
        const mountElement = mountRef.current;
        if (!mountElement) return;

        // Create a renderer only if there isn't one already
        if (!rendererRef.current) {
            const renderer = new THREE.WebGLRenderer({ alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            mountElement.appendChild(renderer.domElement);
            rendererRef.current = renderer;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        const planeMesh = createPlaneMesh();
        scene.add(planeMesh);
        camera.position.z = 1;

        const animate = (time: number) => {
            planeMesh.material.uniforms.iTime.value = time * 0.001;
            planeMesh.material.uniforms.iTransparency.value = transparency;
            rendererRef.current?.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate(0);

        const handleResize = () => {
            rendererRef.current?.setSize(window.innerWidth, window.innerHeight);
            planeMesh.material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [transparency]);

    return <div className={cn("fixed inset-0 -z-50", className)} ref={mountRef} />;
};

