import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MapControls } from 'three/addons/controls/MapControls.js'

import { useEffect, useState, useRef } from 'react'

export default function Viz ({ coordinates, elements, isBaseMesh }) {
  const refContainer = useRef()
  const [renderer, setRenderer] = useState()
  const is3D = useState(coordinates[0].length > 2)[0]
  const [camera, setCamera] = useState()

  useEffect(() => {
    const fontLoader = new FontLoader()
    const { scene, renderer, camera } = setupScene()
    fontLoader.load('fonts/helvetica.json', font => {
      drawPoints(scene, font)
      connectElements(font, scene)
      setupOrbitControls(camera, renderer)
    })

    let req = null
    const animate = () => {
      req = window.requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()
    return () => {
      window.cancelAnimationFrame(req)
      renderer.dispose()
    }
  }, [coordinates, elements])
  useEffect(() => {
    renderer && camera && window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])

  function setupScene () {
    const { current: container } = refContainer
    // if (container && !renderer) {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 4

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.hasChildNodes()
      ? container.replaceChildren(renderer.domElement)
      : container.appendChild(renderer.domElement)
    setRenderer(renderer)
    setCamera(camera)
    scene.position.set(-1, -0.5, 0)
    return { scene, camera, renderer }
  }
  function setupOrbitControls (camera, renderer) {
    const orbitControls = new OrbitControls(camera, renderer.domElement)
    const mapControls = new MapControls(camera, renderer.domElement)
    mapControls.screenSpacePanning = true
    orbitControls.enableZoom = true
    orbitControls.enablePan = is3D
    orbitControls.enableRotate = is3D
    return orbitControls
  }
  function drawPoints (scene, font) {
    const pointGeometry = new THREE.SphereGeometry(0.03)
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 'white' })
    const textMaterial = new THREE.MeshBasicMaterial({ color: 'pink' })
    coordinates.forEach((coord, node) => {
      const [x, y, z] = coord
      const point = new THREE.Mesh(pointGeometry, pointMaterial)
      point.position.set(x, y, z || 0)
      scene.add(point)
      const textGeometry = new TextGeometry(node.toString(), {
        font,
        size: 0.02,
        height: 0.02
      })
      const pointLabel = new THREE.Mesh(textGeometry, textMaterial)
      pointLabel.position.set(x, y - 0.2, z - 0.2 || 0)
      // scene.add(pointLabel)
    })
  }

  function connectElements (font, scene) {
    // draw line between points to specify elements
    elements.forEach((el, elIndex) => {
      const points = []
      for (let i = 0; isBaseMesh ? i < el.length - 1 : i < el.length; i++) {
        coordinates
          .filter((_, node) => node === el[i])
          .forEach(([x, y, z]) => points.push(new THREE.Vector3(x, y, z || 0)))
      }
      const lineMaterial = new THREE.LineBasicMaterial({ color: 'green' })
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      geometry.computeBoundingBox() // compute bounding box
      const center = new THREE.Vector3()
      geometry.boundingBox.getCenter(center)
      // label element face
      const textGeometry = new TextGeometry(`${elIndex}`, {
        font,
        size: 0.04,
        height: 0.02
      })
      const labelMaterial = new THREE.MeshBasicMaterial({ color: 'yellow' })
      const elLabel = new THREE.Mesh(textGeometry, labelMaterial)
      elLabel.position.set(center.x, center.y, center.z)
      scene.add(elLabel)
      const line = new THREE.LineLoop(geometry, lineMaterial)
      scene.add(line)
    })
  }
  function handleWindowResize () {
    const width = refContainer.current.clientWidth
    const height = refContainer.current.clientHeight
    renderer.setSize(width, height)

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    // renderer.render(scen)
  }
  return <div ref={refContainer} style={{ width: '100%', height: '100%' }} />
}
