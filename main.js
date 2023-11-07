import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )

const geometry = new THREE.BoxGeometry( 1, 1, 1 )
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )

class FileRepresentation {
  isOpen = false

  constructor(targetId, position) {
    this.material = material.clone()
    this.mesh = new THREE.Mesh( geometry, this.material )
    this.mesh.position.copy(position)
    this.mesh.file = this
    scene.add( this.mesh );

    this.target = document.getElementById(targetId)

    this.target.addEventListener("show-frame", (e) => {
      this.isOpen = true
      this.mesh.material.color.set( 0x0000ff )
      e.preventDefault()
    })

    this.target.addEventListener("hide-frame", (e) => {
      this.isOpen = false
      this.mesh.material.color.set( 0xaa00aa )
      e.preventDefault()
    })
  }

  update(dt) {
    this.mesh.rotation.x += 0.001 * dt
    this.mesh.rotation.y += 0.001 * dt
  }

  toggle() {
    this.target.toggle()
  }
}

const files = [
  new FileRepresentation("test", new THREE.Vector3(2, 2, -2)),
  new FileRepresentation("test2", new THREE.Vector3(0, 0, 0)),
]

camera.position.z = 5;

// for collision
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

function OnPointerMove( event ) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1
}

function OnPointerDown( event ) {
  const intersects = raycaster.intersectObjects( scene.children )
  for ( let i = 0; i < intersects.length; i ++ ) {
    const obj = intersects[ i ].object
    if (obj.file) {
      obj.file.toggle()
    }
  }
}

let lastTime = 0
function animate(current) {
  const dt = current - lastTime
  requestAnimationFrame( animate )

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera( pointer, camera )

  files.forEach(f => f.update(dt))

  renderer.render( scene, camera )
  lastTime = current
}

window.addEventListener( 'pointermove', OnPointerMove )
window.addEventListener( 'pointerdown', OnPointerDown )

requestAnimationFrame( animate )

