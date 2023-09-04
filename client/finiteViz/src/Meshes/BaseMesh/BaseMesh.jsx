import { useEffect, useRef, useState } from 'react'
import MeshMetadata from './MeshMetadata'
import Coordinates from './Coordinates'
import Elements from './Elements'
import Splits from './Splits'
import Viz from './Viz'
export function BaseMesh ({ state, generateMesh }) {
  const [numDims, setNumDims] = useState(2)
  const [numElements, setNumElements] = useState(3)
  const [numNodes, setNumNodes] = useState(0)
  const [nodesPerElement, setNodesPerElement] = useState(4)

  const { baseMesh, baseMeshDispatch, activeProp } = state
  const { activeMeshPropState, activeMeshPropStateDispatch } = activeProp
  const { showCoordinates, showBaseMesh, showElements, showSplits } =
    activeMeshPropState
  const { coordinates, elements, splitting } = baseMesh

  const vizParent = useRef()

  useEffect(() => {}, [])
  return (
    <div className='w-full flex'>
      <div className='w-1/2'>
        <MeshMetadata
          dims={{ numDims, setNumDims }}
          elements={{ numElements, setNumElements }}
          nodes={{
            nodesPerElement,
            setNodesPerElement,
            setShowCoordinates: () =>
              activeMeshPropStateDispatch({ type: 'coordinates' }),
            setNumNodes
          }}
        />
        {showCoordinates && (
          <Coordinates
            state={{ coordinates, baseMeshDispatch }}
            showElements={() =>
              activeMeshPropStateDispatch({ type: 'elements' })
            }
            numDims={numDims}
            numNodes={numNodes}
          >
            {showElements && (
              <Elements
                state={{
                  elements,
                  baseMeshDispatch,
                  numElements,
                  nodesPerElement
                }}
                showSplits={() =>
                  activeMeshPropStateDispatch({ type: 'splitting' })
                }
                vizBaseMesh={() =>
                  activeMeshPropStateDispatch({ type: 'baseMesh' })
                }
                numNodes={numNodes}
              />
            )}
            {showSplits && (
              <Splits
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
