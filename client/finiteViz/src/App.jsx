import Tabs from './views/Tabs'
import { OutputMesh } from './Meshes/OutputMesh/OutputMesh'
import { BaseMesh } from './Meshes/BaseMesh'
import { useState } from 'react'

export default function App () {
  const [baseActive, setBaseActive] = useState(true)

  return (
    <Tabs activeTab={{ baseActive, setBaseActive }}>
      {baseActive ? <BaseMesh /> : <OutputMesh />}
    </Tabs>
  )
}
