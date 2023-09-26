import { useRef } from 'react'
import MeshMetadata from './MeshMetadata'
import Coordinates from './Coordinates'
import Elements from './Elements'
import Splits from './Splits'
import Viz from './Viz'
import { PanelGroup, Panel } from 'react-resizable-panels'
import ResizeHandle from '../../components/ResizeHandle'

export function BaseMesh ({ state, styles }) {
  const { baseMesh, baseMeshDispatch, activeProp, meshMetadata, generateMesh } =
    state
  const { meshMetadataState, meshMetadataDispatch } = meshMetadata
  const { numDims, numElements, numNodes, nodesPerElement } = meshMetadataState

  const { activeMeshPropState, activeMeshPropStateDispatch } = activeProp
  const { showCoordinates, showElements } = activeMeshPropState
  const { coordinates, elements, splitting } = baseMesh

  const vizParent = useRef()

  function clearMesh () {
    const types = ['coordinates', 'elements', 'splitting']
    types.forEach(type => {
      baseMeshDispatch({
        type,
        payload: []
      })
      activeMeshPropStateDispatch({ type, payload: false })
    })
    meshMetadataDispatch({ type: 'numDims', payload: 2 })
    meshMetadataDispatch({ type: 'numElements', payload: 0 })
    meshMetadataDispatch({ type: 'nodesPerElement', payload: 0 })
    meshMetadataDispatch({ type: 'numNodes', payload: 0 })
  }
  return (
    <PanelGroup direction='horizontal'>
      <Panel defaultSize={20} minSize={20} className='!overflow-y-scroll'>
        <>
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
              setShowCoordinates: payload =>
                activeMeshPropStateDispatch({ type: 'coordinates', payload }),
              setNumNodes: payload =>
                meshMetadataDispatch({ type: 'numNodes', payload })
            }}
            styles={styles}
          />
          {showCoordinates && (
            <Coordinates
              state={{ coordinates, baseMeshDispatch }}
              showElements={payload =>
                activeMeshPropStateDispatch({ type: 'elements', payload })
              } //   eslint-disable-line react/jsx-curly-newline
              numDims={numDims}
              numNodes={numNodes}
              styles={styles}
            />
          )}
          {showElements && (
            <Elements
              styles={styles}
              state={{
                elements,
                baseMeshDispatch,
                numElements,
                nodesPerElement
              }}
              showSplits={payload =>
                activeMeshPropStateDispatch({ type: 'splitting', payload })
              } //   eslint-disable-line react/jsx-curly-newline
              numNodes={numNodes}
            />
          )}
          {activeMeshPropState.showSplits && (
            <Splits
              styles={styles}
              state={{ splitting, baseMeshDispatch }}
              generateMesh={generateMesh}
              nodes={meshMetadataState.numNodes}
            />
          )}
          {(showCoordinates || showElements) && (
            <div className='mt-10'>
              <button
                onClick={clearMesh}
                className={`${styles.buttonStyles} !bg-red-600`}
              >
                Clear Mesh
              </button>
            </div>
          )}
        </>
      </Panel>
      {
        /* eslint-disable multiline-ternary */
        showCoordinates ? (
          <>
            <ResizeHandle />

            <Panel defaultSize={70} minSize={50}>
              <Viz
                elements={elements}
                is3D={coordinates.length > 0 && coordinates[0].length === 3}
                coordinates={coordinates}
                parent={vizParent}
                isBaseMesh
              />
            </Panel>
          </>
        ) : (
          <div className='w-2/3 flex justify-center items-center'>
            <h1 className='text-xl font-medium'>
              Enter Coordinates to show Visualisation
            </h1>
          </div>
        )
      }
    </PanelGroup>
  )
}
