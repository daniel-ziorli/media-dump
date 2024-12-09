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
                // Normalize the fragment coordinates to the range [0, 1]
                vec2 uv = fragCoord / iResolution.xy;

                // Center the UV coordinates
                vec2 center = vec2(0.5, 0.5);
                vec2 offset = uv - center;

                // Define the size of the quad
                vec2 quadSize = vec2(0.5, 0.49); // Width and height of the quad

                // Determine if the pixel is near the edge of the quad
                vec2 edge = smoothstep(quadSize, quadSize - vec2(0.02), abs(offset));

                // Add time-based animated noise for a smoky effect
                float time = iTime * 2.0; // Adjust the speed of the animation
                float noiseValue = noise(offset * 10.0 + vec2(time));

                // Modulate the Fresnel effect with noise to simulate smoke
                float fresnel = pow(1.0 - dot(normalize(offset), vec2(0.0, 0.0)), 3.0);
                float smoke = fresnel * (0.5 + 0.5 * noiseValue);

                // Combine the edge detection and the smoky effect
                float glow = (1.0 - edge.x * edge.y) * smoke;

                // Set colors: purple glow for the border
                vec3 borderColor = vec3(0.5, 0.0, 1.0); // Purple

                // Mix the colors for the border, make the background fully transparent
                vec3 finalColor = borderColor * glow;
                float alpha = glow; // Alpha depends on the glow intensity

                // Output the final color with alpha
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

    useEffect(() => {
        const mountElement = mountRef.current;
        if (!mountElement) return;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountElement.appendChild(renderer.domElement);

        const planeMesh = createPlaneMesh();
        scene.add(planeMesh);
        camera.position.z = 1;

        const animate = (time: number) => {
            planeMesh.material.uniforms.iTime.value = time * 0.001;
            planeMesh.material.uniforms.iTransparency.value = transparency;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate(0);

        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            planeMesh.material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            mountElement?.removeChild(renderer.domElement);
            window.removeEventListener("resize", handleResize);
        };
    }, [transparency]);

    return <div className={cn("fixed inset-0 -z-50", className)} ref={mountRef} />;
};

