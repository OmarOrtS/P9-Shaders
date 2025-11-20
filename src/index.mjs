// src/index.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, camera, renderer, material;
let clock = new THREE.Clock();

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 2.0;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const { vertexShader, fragmentShader } = createSpiralShader();

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
    },
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), material);
  scene.add(plane);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function createSpiralShader() {
  const vertexShader = `
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

  const fragmentShader = `
      uniform float uTime;
      varying vec2 vUv;
  
      void main() {
        vec2 p = vUv - 0.5;       // centro
        float r = length(p);      // radio
        float a = atan(p.y, p.x); // ángulo
    
        // Rotación progresiva → espiral
        a += uTime * 1.0;
    
        float radialFall = exp(-r * 4.0);
    
        float arms = 10.0;
    
        // Función espiral
        float spiral = tan(arms * a - 12.0 * r + uTime * 3.0);
    
        // Normalizar a rango 0-1
        spiral = 0.5 + 0.5 * spiral;
    
        float intensity = spiral * radialFall;
    
        gl_FragColor = vec4(vec3(intensity), 1.0);
    }
    `;

  return { vertexShader, fragmentShader };
}

export function animate() {
  requestAnimationFrame(animate);

  material.uniforms.uTime.value = clock.getElapsedTime();

  renderer.render(scene, camera);
}
