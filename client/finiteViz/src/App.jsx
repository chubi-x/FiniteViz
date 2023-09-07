import Tabs from './views/Tabs'
import { OutputMesh } from './Meshes/OutputMesh/'
import { BaseMesh } from './Meshes/BaseMesh'
import Splits from './Meshes/BaseMesh/Splits'
import { useReducer, useState } from 'react'
import { useGenerateMesh } from './api/useQueryMesh'
import {
  activeMeshPropStateReducer,
  meshReducer,
  meshMetadataReducer
} from './reducers/meshReducer'

export default function App () {
  const [baseActive, setBaseActive] = useState(true)
  const [baseMesh, baseMeshDispatch] = useReducer(meshReducer, {
    coordinates: [],
    elements: [],
    splitting: []
  })
  const [meshMetadataState, meshMetadataDispatch] = useReducer(
    meshMetadataReducer,
    {
      numDims: 2,
      numElements: 3,
      numNodes: 0,
      nodesPerElement: 4
    }
  )
  const [activeMeshPropState, activeMeshPropStateDispatch] = useReducer(
    activeMeshPropStateReducer,
    {
      showCoordinates: false,
      showElements: false,
      showBaseMesh: false,
      showSplits: false
    }
  )
  const { splitting } = baseMesh
  const [meshId, setMeshId] = useState('')
  const { mutate } = useGenerateMesh()

  function generateMesh () {
    mutate(baseMesh, {
      onSuccess (response) {
        if (response?.success) {
          setMeshId(response.meta.task_id)
          setBaseActive(false)
        } else window.alert(response?.message)
      },
      onError (err) {
        console.log(err)
        window.alert('Failed to generate mesh. Please try again later.')
      }
    })
  }

  return (
    <Tabs
      activeTab={{
        baseActive,
        setBaseActive,
        outputNotReady: meshId.length === 0
      }}
    >
      {baseActive && (
        <BaseMesh
          state={{
            baseMesh,
            baseMeshDispatch,
            activeProp: { activeMeshPropState, activeMeshPropStateDispatch },
            meshMetadata: { meshMetadataState, meshMetadataDispatch }
          }}
        >
          {activeMeshPropState.showSplits && (
            <Splits
              state={{ splitting, baseMeshDispatch }}
              generateMesh={generateMesh}
              nodes={meshMetadataState.numNodes}
            />
          )}
        </BaseMesh>
      )}
      {!baseActive && <OutputMesh newMesh={newMesh} />}
    </Tabs>
  )
}
