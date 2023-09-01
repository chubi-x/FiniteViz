import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { useEffect, useState, useRef } from 'react'

export default function Viz ({ coordinates, elements }) {
  const refContainer = useRef()
  const [renderer, setRenderer] = useState()
  const [camera, setCamera] = useState()
  useEffect(() => {
    const fontLoader = new FontLoader()
    const { scene, renderer, camera } = setupScene()

    fontLoader.load('fonts/helvetica.json', font => {
      drawPoints(scene, font)
      connectElements(font, scene)
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
    // }
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
    return { scene, camera, renderer }
  }
  function drawPoints (scene, font) {
    const pointGeometry = new THREE.SphereGeometry(0.03)
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 'white' })
    const textMaterial = new THREE.MeshBasicMaterial({ color: 'pink' })
    coordinates.forEach((coord, node) => {
      const [x, y] = coord
      const point = new THREE.Mesh(pointGeometry, pointMaterial)
      point.position.set(x, y, 0)
      scene.add(point)
      const textGeometry = new TextGeometry(node.toString(), {
        font,
        size: 0.07,
        height: 0.02
      })
      const textMesh = new THREE.Mesh(textGeometry, textMaterial)
      textMesh.position.set(x, y - 0.2, 0)
      scene.add(textMesh)
    })
  }
  function connectElements (font, scene) {
    // draw line between points to specify elements
    elements.forEach((el, elIndex) => {
      const points = []
      for (let i = 0; i < el.length - 1; i++) {
        coordinates
          .filter((_, node) => node === el[i])
          .forEach(([x, y]) => points.push(new THREE.Vector2(x, y)))
      }
      const lineMaterial = new THREE.LineBasicMaterial({ color: 'green' })
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      geometry.computeBoundingBox() // compute bounding box
      const center = new THREE.Vector3()
      geometry.boundingBox.getCenter(center)
      // label element face
      const textGeometry = new TextGeometry(`El ${elIndex}`, {
        font,
        size: 0.1,
        height: 0.02
      })
      const labelMaterial = new THREE.MeshBasicMaterial({ color: 'yellow' })
      const elLabel = new THREE.Mesh(textGeometry, labelMaterial)
      elLabel.position.set(center.x, center.y, 0)
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
