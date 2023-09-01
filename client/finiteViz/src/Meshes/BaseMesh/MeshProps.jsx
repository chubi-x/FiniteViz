import { useState } from 'react'
export default function MeshProps ({ dims, elements, nodes, children }) {
  const { numDims, setNumDims } = dims
  const { numElements, setNumElements } = elements
  const { nodesPerElement, setNodesPerElement, setShowCoordinates, setNumNodes } = nodes
  const [disableEnterCoords, setDisableEnterCoords] = useState(false)
  function enterCoords () {
    if (numDims > 0 && nodesPerElement > 0 && numElements > 0) {
      setNumNodes(numElements + nodesPerElement)
      setDisableEnterCoords(true)
      setShowCoordinates(true)
    } else window.alert('Enter the number of dimensions and nodes in your original mesh')
  }
  return (
    <>
      <form className='form flex flex-col w-1/4 space-y-3 mx-auto'>
        <div>
          <label htmlFor='numDims'>
            Num Dims
            <input id='numDims' value={numDims} onChange={(e) => setNumDims(parseInt(e.target.value))} type='number' max='3' min='2' />
          </label>
        </div>
        <div>
          <label htmlFor='numElements'>
            Num Elements
            <input id='numElements' type='number' onChange={(e) => setNumElements(parseInt(e.target.value))} value={numElements} />
          </label>
        </div>
        <div>
          <label htmlFor='nodesPerElement'>
            Nodes Per Element
            <input id='nodesPerElement' type='number' onChange={(e) => setNodesPerElement(parseInt(e.target.value))} value={nodesPerElement} />
          </label>
        </div>
        <button onClick={enterCoords} disabled={disableEnterCoords} type='button' className='bg-blue-300 p-2 rounded-md'>
          Enter Node Coordinates
        </button>
      </form>
      {children}
    </>
  )
}
