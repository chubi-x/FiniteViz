import Tabs from './views/Tabs'
import { OutputMesh } from './Meshes/OutputMesh/OutputMesh'
import { BaseMesh } from './Meshes/BaseMesh'
import { useReducer, useState } from 'react'
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
  const { coordinates, elements, splitting } = baseMesh
  const [newMesh, setNewMesh] = useState({})

  async function generateMesh () {
    const response = await fetch('http://localhost:3000/message', {
      method: 'POST',
      body: JSON.stringify({ elements, coordinates, splitting }),
      // credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json'
      }
    })
    const resdata = await response.json()
    console.log(resdata)

    const id = resdata.meta.id
    const res = await fetch(`http://localhost:3000/poll/${id}`)
    const result = await res.json()
    console.log(result)
    // setNewMesh(result.data.payload)
    setBaseActive(false)
  }

  return (
    <Tabs activeTab={{ baseActive, setBaseActive }}>
      {baseActive && (
        <BaseMesh
          state={{
            baseMesh,
            baseMeshDispatch,
            activeProp: { activeMeshPropState, activeMeshPropStateDispatch },
            meshMetadata: { meshMetadataState, meshMetadataDispatch }
          }}
          generateMesh={generateMesh}
        />
      )}
      {!baseActive && <OutputMesh newMesh={newMesh} />}
    </Tabs>
  )
}
