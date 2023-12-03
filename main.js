import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js'

import projects from './projects.js'

let scene, camera, renderer, effect, geometry, material;
let files = [];
let groups = [];
let diskRadius = 5;
let diskNum = 3;

function lerp(a, b, t) {
  t = Math.min(Math.max(t, 0), 1)
  return a + (b - a) * t
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x444488);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  let controls = new OrbitControls(camera, renderer.domElement);
  console.log(controls)
  geometry = new THREE.BoxGeometry(1, 1, 1)
  material = new THREE.MeshToonMaterial({ /*color: 0x00ff00*/ });

  let ambientLight = new THREE.AmbientLight(0xffffff, 2);
  let light = new THREE.PointLight(0xffffff, 7);
  light.position.set(5, 5, 2);
  let light2 = new THREE.PointLight(0xffffff, 3);
  light2.position.set(-8, -5, 2);
  scene.add(ambientLight, light, light2);

  let diskGeo = new THREE.CylinderGeometry(diskRadius, diskRadius, 0.3);
  let diskMaterial = new THREE.MeshToonMaterial({ color: 0x8888cc, transparent: true, opacity: 0.6 });

  let spacing = 3;

  for (let i = 0; i < diskNum; i++) {
    groups.push(new THREE.Group());
    scene.add(groups[i]);
    groups[i].position.set(0, i * spacing - diskNum * spacing / 2, 0);
    let disk = new THREE.Mesh(diskGeo, diskMaterial);
    groups[i].add(disk);
  }

  files = []

  let i = 0
  projects.forEach(project => {
    const $parent = document.getElementById("dumpling-container")

    const $main = document.createElement("div")
    $main.innerHTML = `
      <a-dumpling
        title="${project.title}"
        id="${project.id}"
        temperament="sanguine"
        no-feelings
        no-back
        maximize
        hidden
        layer="project"
        w=90
        h=90
      >
        <d-iframe src="${project.url}"></d-iframe>
      </a-dumpling>
    `
    const $info = document.createElement("div")
    $info.innerHTML = `
      <a-dumpling
        title="${project.title}"
        id="${project.id}-info"
        temperament="phlegmatic"
        no-feelings
        no-back
        maximize
        hidden
        layer="info"
      >
        <div>by ${project.author}</div>
      </a-dumpling>
    `

    $parent.appendChild($main)
    $parent.appendChild($info)

    const file = new FileRepresentation(project.id, groups[Math.floor(i++ % diskNum)])

    files.push(file)
  })

  //files.forEach(f => f.mesh.parent(disks[0]))

  effect = new OutlineEffect(renderer);

}


class FileRepresentation {
  isOpen = false

  constructor(targetId, group) {
    this.material = material.clone()
    const texture = new THREE.TextureLoader().load(`static/img/${targetId}.png`)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    // texture.repeat.set( 4, 4 );
    this.material.map = texture

    this.mesh = new THREE.Mesh(geometry, this.material)
    const randomScale = lerp(0.8, 1.4, Math.random())
    this.mesh.scale.x = randomScale
    this.mesh.scale.y = randomScale
    this.mesh.scale.z = randomScale
    this.mesh.rotation.y = Math.random() * Math.PI * 2
    this.mesh.rotation.x = Math.random() * Math.PI * 0.02
    this.mesh.rotation.z = Math.random() * Math.PI * 0.02
    const randomAngle = Math.random() * Math.PI * 2
    const randomRadius = lerp(0.1, 0.9, Math.random()) * diskRadius
    this.mesh.position.set(
      randomRadius * Math.cos(randomAngle),
      0.5,
      randomRadius * Math.sin(randomAngle)
    )

    this.mesh.file = this

    group.add(this.mesh)

    this.target = document.getElementById(targetId)
    this.targetInfo = document.getElementById(`${targetId}-info`)

    this.target.addEventListener("show-frame", (e) => {
      this.isOpen = true
      // this.mesh.material.color.set(0x0000ff)
      e.preventDefault()
    })

    this.target.addEventListener("hide-frame", (e) => {
      this.isOpen = false
      // this.mesh.material.color.set(0xaa00aa)
      e.preventDefault()
      this.targetInfo.hide()
    })
  }

  toggle() {
    this.target.toggle()
    this.targetInfo.toggle()
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

