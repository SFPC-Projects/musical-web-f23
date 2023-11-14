import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

let scene, camera, renderer, effect, geometry, material;
let files = [];
let groups = [];
let diskRadius = 5;
let diskNum = 3;

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x444488);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 15;

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  let controls = new OrbitControls(camera, renderer.domElement);
  console.log(controls)
  geometry = new THREE.SphereGeometry(0.5, 32, 32)
  material = new THREE.MeshToonMaterial({ color: 0x00ff00 });

  let ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  let light = new THREE.PointLight(0xffffff, 5);
  light.position.set(5, 5, 2);
  let light2 = new THREE.PointLight(0xffffff, 2);
  light2.position.set(-8, -5, 2);
  scene.add(ambientLight, light, light2);

  let diskGeo = new THREE.CylinderGeometry(diskRadius, diskRadius, 0.3);
  let diskMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });

  let spacing = 3;

  for (let i = 0; i < diskNum; i++) {
    groups.push(new THREE.Group());
    scene.add(groups[i]);
    groups[i].position.set(0, i * spacing - diskNum * spacing / 2, 0);
    let disk = new THREE.Mesh(diskGeo, diskMaterial);
    groups[i].add(disk);
  }

  files = [
    new FileRepresentation("test", groups[Math.floor(Math.random() * 3)]),
    new FileRepresentation("test2", groups[Math.floor(Math.random() * 3)]),
  ]
  //files.forEach(f => f.mesh.parent(disks[0]))

  effect = new OutlineEffect(renderer);

}


class FileRepresentation {
  isOpen = false

  constructor(targetId, group) {

    this.material = material.clone()
    this.mesh = new THREE.Mesh(geometry, this.material)
    this.mesh.position.set(Math.random() * diskRadius, 0.5, Math.random() * diskRadius)
    this.mesh.file = this
    group.add(this.mesh);

    this.target = document.getElementById(targetId)

    this.target.addEventListener("show-frame", (e) => {
      this.isOpen = true
      this.mesh.material.color.set(0x0000ff)
      e.preventDefault()
    })

    this.target.addEventListener("hide-frame", (e) => {
      this.isOpen = false
      this.mesh.material.color.set(0xaa00aa)
      e.preventDefault()
    })
  }

  toggle() {
    this.target.toggle()
  }
}

// for collision
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

function OnPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1
}

function OnPointerDown(event) {
  const intersects = raycaster.intersectObjects(scene.children)
  for (let i = 0; i < intersects.length; i++) {
    const obj = intersects[i].object
    if (obj.file) {
      obj.file.toggle()
    }
  }
}

let lastTime = 0
function animate(current) {
  const dt = current - lastTime
  requestAnimationFrame(animate)

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointer, camera);

  groups.forEach(g => g.rotation.y += 0.0001 * dt)

  effect.render(scene, camera)
  lastTime = current
}

window.addEventListener('pointermove', OnPointerMove)
window.addEventListener('pointerdown', OnPointerDown)

init()
requestAnimationFrame(animate)

