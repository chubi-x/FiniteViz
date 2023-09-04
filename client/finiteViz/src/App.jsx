import Tabs from './views/Tabs'
import { OutputMesh } from './Meshes/OutputMesh/OutputMesh'
import { BaseMesh } from './Meshes/BaseMesh'
import { useReducer, useState } from 'react'
import { meshReducer } from './reducers/meshReducer'

export default function App () {
  const [baseActive, setBaseActive] = useState(true)
  const [baseMesh, baseMeshDispatch] = useReducer(meshReducer, {
    coordinates: [],
    elements: [],
    splitting: []
  })
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

    console.log(await response.json())
  }

  return (
    <Tabs activeTab={{ baseActive, setBaseActive }}>
      {baseActive && (
        <BaseMesh
          state={{
            baseMesh,
            baseMeshDispatch
          }}
          generateMesh={generateMesh}
        />
      )}
      {!baseActive && <OutputMesh newMesh={newMesh} />}
    </Tabs>
  )
}
