'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as THREE from 'three';

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 8;

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.IcosahedronGeometry(1, 8);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        varying float vWave;

        void main() {
          vec3 transformed = position + normal * sin(uTime * 0.9 + position.y * 3.5 + position.x * 2.5) * 0.08;
          vWave = transformed.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        }
      `,
      fragmentShader: `
        varying float vWave;

        void main() {
          vec3 teal = vec3(0.07, 0.77, 0.77);
          vec3 gold = vec3(1.0, 0.9, 0.28);
          vec3 white = vec3(0.97, 0.99, 1.0);
          float mixA = smoothstep(-1.2, 1.2, vWave);
          float mixB = smoothstep(-0.2, 1.4, vWave);
          vec3 color = mix(teal, gold, mixA);
          color = mix(color, white, mixB * 0.35);
          gl_FragColor = vec4(color, 0.18);
        }
      `,
      wireframe: true,
    });

    const meshA = new THREE.Mesh(geometry, material);
    meshA.scale.setScalar(2.6);
    meshA.position.set(2.8, -0.8, -1.2);
    group.add(meshA);

    const meshB = new THREE.Mesh(geometry, material.clone());
    (meshB.material as THREE.ShaderMaterial).uniforms.uTime = { value: 0 };
    meshB.scale.setScalar(1.55);
    meshB.position.set(-3.2, 1.7, -2.4);
    group.add(meshB);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
    };

    resize();

    let frame = 0;
    let disposed = false;

    const animate = () => {
      if (disposed) return;

      frame = window.requestAnimationFrame(animate);

      const time = performance.now() * 0.001;
      (meshA.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
      (meshB.material as THREE.ShaderMaterial).uniforms.uTime.value = time + 1.7;

      group.rotation.z = Math.sin(time * 0.18) * 0.12;
      meshA.rotation.x += 0.0016;
      meshA.rotation.y += 0.0022;
      meshB.rotation.x -= 0.0014;
      meshB.rotation.z += 0.0018;

      renderer.render(scene, camera);
    };

    animate();
    window.addEventListener('resize', resize);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      geometry.dispose();
      material.dispose();
      (meshB.material as THREE.ShaderMaterial).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.95,
        '& canvas': {
          width: '100% !important',
          height: '100% !important',
          display: 'block',
          filter: 'blur(0.2px)',
        },
      }}
    />
  );
}
