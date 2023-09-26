import Tabs from './views/Tabs'
import { OutputMesh } from './Meshes/OutputMesh/'
import { BaseMesh } from './Meshes/BaseMesh'
import { useReducer, useState } from 'react'
import { useGenerateMesh } from './api/useQueryMesh'
import {
  activeMeshPropStateReducer,
  meshReducer,
  meshMetadataReducer
} from './reducers/meshReducer'
import { ErrorBoundary } from 'react-error-boundary'
import Error from './views/Error'
export default function App () {
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
  const [meshId, setMeshId] = useState(
    window.localStorage.getItem('meshId') ?? ''
  )
  const [baseActive, setBaseActive] = useState(!meshId)
  const { mutate } = useGenerateMesh()

  const styles = {
    buttonStyles:
      'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
    inputStyles:
      'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
  }
  function generateMesh () {
    try {
      mutate(baseMesh, {
        onSuccess (response) {
          if (response?.success) {
            setMeshId(response.meta.task_id)
            //  save mesh Id to local local storage
            window.localStorage.setItem('meshId', response.meta.task_id)
            setBaseActive(false)
          } else window.alert(response?.message)
        },
        onError (err) {
          console.log(err)
          window.alert('Failed to generate mesh. Please try again later.')
        }
      })
    } catch (err) {
      console.log(err)
      window.alert(err)
    }
  }

  return (
    <Tabs
      activeTab={{
        baseActive,
        setBaseActive,
        outputNotReady: meshId.length === 0
      }}
    >
      {
        /* eslint-disable multiline-ternary */
        baseActive ? (
          <ErrorBoundary FallbackComponent={Error}>
            <BaseMesh
              styles={styles}
              state={{
                baseMesh,
                baseMeshDispatch,
                activeProp: {
                  activeMeshPropState,
                  activeMeshPropStateDispatch
                },
                meshMetadata: { meshMetadataState, meshMetadataDispatch },
                generateMesh
              }}
            />
          </ErrorBoundary>
        ) : (
          <OutputMesh id={meshId} />
        )
      }
    </Tabs>
  )
}
