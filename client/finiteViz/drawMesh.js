import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
// import { FontLoader } from "three/"
// THREE.F
export default function visualise() {
  const app = document.getElementById("app");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, app.clientWidth / app.clientHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(app.clientWidth, app.clientHeight);
  app.appendChild(renderer.domElement);

  const coordinates = [
    [0.0, 0.0],
    [1.0, 0.0],
    [1.0, 1.0],
    [0.0, 1.0],
    [2.0, 0.0],
    [2.0, 2.0],
    [0.0, 2.0]
  ];
  const elements = [
    [0, 1, 2, 3, 1],
    [1, 4, 5, 2, 1],
    [3, 2, 5, 6, 1]
  ];
  // const geometry = new THREE.BufferGeometry();

  const fontLoader = new FontLoader();
  fontLoader.load("fonts/helvetica.json", (font) => {
    const pointGeometry = new THREE.SphereGeometry(0.05);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: "white" });
    const textMaterial = new THREE.MeshBasicMaterial({ color: "pink" });
    coordinates.forEach((coord, node) => {
      const [x, y] = coord;
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.position.set(x, y, 0);
      scene.add(point);
      const textGeometry = new TextGeometry(node.toString(), {
        font,
        size: 0.1,
        height: 0.02
      });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(x - 0.01, y - 0.3, 0);
      scene.add(textMesh);
    });
  });

  //draw line between points to specify elements
  elements.forEach((el) => {
    let points = [];
    for (let i = 0; i < el.length - 1; i++) {
      points.push(coordinates.filter((coord, node) => node === el[i]).map(([x, y], index) => new THREE.Vector2(x, y)));
    }
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const geometry = new THREE.BufferGeometry().setFromPoints(points.flat());
    const line = new THREE.LineLoop(geometry, lineMaterial);
    scene.add(line);
  });

  camera.position.z = 4;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

