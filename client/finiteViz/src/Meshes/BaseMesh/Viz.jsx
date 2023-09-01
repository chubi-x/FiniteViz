import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { useEffect, useRef } from 'react'

export default function Viz ({ coordinates, elements }) {
  const refContainer = useRef()
  // const [renderer, setRenderer] = useState()
  useEffect(() => {
    // console.log('rendered')
    const { current: container } = refContainer
    // if (container && !renderer) {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.hasChildNodes() ? container.replaceChildren(renderer.domElement) : container.appendChild(renderer.domElement)
    // setRenderer(renderer)

    const fontLoader = new FontLoader()
    fontLoader.load('fonts/helvetica.json', (font) => {
      const pointGeometry = new THREE.SphereGeometry(0.03)
      const pointMaterial = new THREE.MeshBasicMaterial({ color: 'white' })

      const textMaterial = new THREE.MeshBasicMaterial({ color: 'pink' })
      // console.log(textMaterial)
      coordinates.forEach((coord, node) => {
        const [x, y] = coord
        const point = new THREE.Mesh(pointGeometry, pointMaterial)
        point.position.set(x, y, 0)
        scene.add(point)
        const textGeometry = new TextGeometry(node.toString(), {
          font,
          size: 0.1,
          height: 0.02
        })
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        textMesh.position.set(x - 0.01, y - 0.3, 0)
        scene.add(textMesh)
      })
      // draw line between points to specify elements
      elements.forEach((el, elIndex) => {
        const points = []
        for (let i = 0; i < el.length - 1; i++) {
          coordinates.filter((coord, node) => node === el[i])
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
        const elLabel = new THREE.Mesh(textGeometry, textMaterial)
        elLabel.position.set(center.x - 0.05, center.y, 0)
        scene.add(elLabel)
        const line = new THREE.LineLoop(geometry, lineMaterial)
        scene.add(line)
      })
    })

    camera.position.z = 4
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
  return <div style={{ height: '500px', width: '500px' }} ref={refContainer} />
}
