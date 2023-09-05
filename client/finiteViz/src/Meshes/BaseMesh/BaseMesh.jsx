import { useEffect, useRef } from 'react'
import MeshMetadata from './MeshMetadata'
import Coordinates from './Coordinates'
import Elements from './Elements'
import Splits from './Splits'
import Viz from './Viz'
export function BaseMesh ({ state, generateMesh }) {
  const { baseMesh, baseMeshDispatch, activeProp, meshMetadata } = state
  const { meshMetadataState, meshMetadataDispatch } = meshMetadata
  const { numDims, numElements, numNodes, nodesPerElement } = meshMetadataState

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
          dims={{
            numDims,
            setNumDims: payload =>
              meshMetadataDispatch({ type: 'numDims', payload })
          }}
          elements={{
            numElements,
            setNumElements: payload =>
              meshMetadataDispatch({ type: 'numElements', payload })
          }}
          nodes={{
            nodesPerElement,
            setNodesPerElement: payload =>
              meshMetadataDispatch({ type: 'nodesPerElement', payload }),
            setShowCoordinates: () =>
              activeMeshPropStateDispatch({ type: 'coordinates' }),
            setNumNodes: payload =>
              meshMetadataDispatch({ type: 'numNodes', payload })
          }}
        />
        {showCoordinates && (
          <Coordinates
            state={{ coordinates, baseMeshDispatch }}
            showElements={() =>
              activeMeshPropStateDispatch({ type: 'elements' })
            } //   eslint-disable-line react/jsx-curly-newline
            numDims={numDims}
            numNodes={numNodes}
          />
        )}
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
            } //   eslint-disable-line react/jsx-curly-newline
            vizBaseMesh={() =>
              activeMeshPropStateDispatch({ type: 'baseMesh' })
            } //   eslint-disable-line react/jsx-curly-newline
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
