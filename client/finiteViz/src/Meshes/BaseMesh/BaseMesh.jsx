import { useEffect, useRef, useState } from 'react'
import MeshProps from './MeshProps'
import Coordinates from './Coordinates'
import Elements from './Elements'
import Splits from './Splits'
import Viz from './Viz'
export function BaseMesh ({ state, generateMesh, children }) {
  const [numDims, setNumDims] = useState(2)
  const [numElements, setNumElements] = useState(3)
  const [numNodes, setNumNodes] = useState(0)
  const [nodesPerElement, setNodesPerElement] = useState(4)
  const [showCoordinates, setShowCoordinates] = useState(false)
  const [showElements, setShowElements] = useState(false)
  const [showSplits, setShowSplits] = useState(false)
  const [showBaseMesh, setShowBaseMesh] = useState(false)

  const { baseMesh, baseMeshDispatch } = state
  const { coordinates, elements, splitting } = baseMesh
  // const [coordinates, setCoordinates] = useState([])
  // const [elements, setElements] = useState([])
  // const [splitting, setSplitting] = useState([])

  const vizParent = useRef()

  useEffect(() => {}, [])
  return (
    <div className='w-full flex'>
      <div className='w-1/2'>
        <MeshProps
          dims={{ numDims, setNumDims }}
          elements={{ numElements, setNumElements }}
          nodes={{
            nodesPerElement,
            setNodesPerElement,
            setShowCoordinates,
            setNumNodes
          }}
        />
        {showCoordinates && (
          <Coordinates
            // coordinatesState={{ coordinates, setCoordinates }}
            state={{ coordinates, baseMeshDispatch }}
            showElements={setShowElements}
            numDims={numDims}
            numNodes={numNodes}
          >
            {showElements && (
              <Elements
                // elementsState={{ elements, setElements }}
                state={{
                  elements,
                  baseMeshDispatch,
                  numElements,
                  nodesPerElement
                }}
                showSplits={setShowSplits}
                vizBaseMesh={setShowBaseMesh}
                numNodes={numNodes}
              />
            )}
            {showSplits && (
              <Splits
                // state={{ splitting, setSplitting }}
                state={{ splitting, baseMeshDispatch }}
                generateMesh={generateMesh}
                nodes={numNodes}
              />
            )}
          </Coordinates>
        )}
      </div>
      <div className='w-1/2 h-full'>
        {showBaseMesh && (
          <Viz
            elements={elements}
            coordinates={coordinates}
            parent={vizParent}
          />
        )}
      </div>
    </div>
  )
}
