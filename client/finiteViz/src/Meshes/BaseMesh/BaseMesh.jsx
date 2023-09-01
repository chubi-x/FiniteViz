import { useState } from 'react'
import MeshProps from './MeshProps'
import Coordinates from './Coordinates'
import Elements from './Elements'
import Splits from './Splits'
import Viz from './Viz'
export function BaseMesh () {
  const [numDims, setNumDims] = useState(2)
  const [numElements, setNumElements] = useState(3)
  const [numNodes, setNumNodes] = useState(0)
  const [nodesPerElement, setNodesPerElement] = useState(4)
  const [showCoordinates, setShowCoordinates] = useState(false)
  const [showElements, setShowElements] = useState(false)
  const [showSplits, setShowSplits] = useState(false)
  const [showBaseMesh, setShowBaseMesh] = useState(false)

  const initialCoordinates = Array.from({ length: numNodes }, () =>
    new Array(numDims < 3 ? 2 : 3).fill('')
  )
  const [useDefaultCoordinates] = useState(true)
  const useDefaultElements = true

  const defaultCoordinates = [
    [0.0, 0.0],
    [1.0, 0.0],
    [1.0, 1.0],
    [0.0, 1.0],
    [2.0, 0.0],
    [2.0, 2.0],
    [0.0, 2.0]
  ]
  const [coordinates, setCoordinates] = useState(
    useDefaultCoordinates ? defaultCoordinates : initialCoordinates
  )
  const defaultElements = [
    [0, 1, 2, 3, 1],
    [1, 4, 5, 2, 1],
    [3, 2, 5, 6, 1]
  ]
  const initialElements = Array.from({ length: numElements }, () =>
    new Array(nodesPerElement).fill('')
  )
  const [elements, setElements] = useState(
    useDefaultElements ? defaultElements : initialElements
  )

  return (
    <>
      <MeshProps
        dims={{ numDims, setNumDims }}
        elements={{ numElements, setNumElements }}
        nodes={{
          nodesPerElement,
          setNodesPerElement,
          setShowCoordinates,
          setNumNodes
        }}
      >
        {showCoordinates && (
          <Coordinates
            coordinatesState={{ coordinates, setCoordinates }}
            showElements={setShowElements}
            numDims={numDims}
            numNodes={numNodes}
          >
            {showElements && (
              <Elements
                elementsState={{ elements, setElements, useDefaultElements }}
                showSplits={setShowSplits}
                vizBaseMesh={setShowBaseMesh}
                numNodes={numNodes}
                elementsProp={{ numElements, nodesPerElement }}
              >
                {showSplits && <Splits />}
              </Elements>
            )}
          </Coordinates>
        )}
        {showBaseMesh && <Viz elements={elements} coordinates={coordinates} />}
      </MeshProps>
    </>
  )
}
