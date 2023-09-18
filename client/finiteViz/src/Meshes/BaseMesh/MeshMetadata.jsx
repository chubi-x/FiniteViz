import { NumericFormat } from 'react-number-format'
export default function MeshMetadata ({
  dims,
  elements,
  nodes,
  children,
  styles
}) {
  const { numDims, setNumDims } = dims
  const { numElements, setNumElements } = elements
  const {
    nodesPerElement,
    setNodesPerElement,
    setShowCoordinates,
    setNumNodes
  } = nodes
  const { buttonStyles, inputStyles } = styles
  const enableEnterCoords =
    numDims > 0 && nodesPerElement > 0 && numElements > 0

  function updateNumNodes () {
    let numNodes
    if (numDims === 2 || (numElements > 1 && numDims === 3)) {
      numNodes = numElements + nodesPerElement
    } else numNodes = nodesPerElement
    console.log(numNodes)
    setNumNodes(numNodes)
  }
  function enterCoords () {
    updateNumNodes()
    setShowCoordinates(true)
  }
  function updateNumDims (e) {
    const val = parseInt(e.target.value)
    if (val === 2 || val === 3) {
      setNumDims(val)
      updateNumNodes()
    } else e.preventDefault()
  }
  function updateElements (e, setter) {
    const val = parseInt(e.target.value)
    if (!isNaN(val)) setter(val)
    else setter('')
  }
  return (
    <>
      <form className='form flex flex-col space-y-4 mx-auto'>
        <h1 className='text-2xl font-bold'>Mesh Properties</h1>
        <div>
          <label htmlFor='numDims'>
            Num Dims
            <input
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              id='numDims'
              value={numDims}
              onChange={e => updateNumDims(e)}
              type='number'
              max='3'
              min='2'
            />
          </label>
        </div>
        <div>
          <label htmlFor='numElements'>
            Num Elements
            <NumericFormat
              className={inputStyles}
              onChange={e => updateElements(e, setNumElements)}
              value={numElements}
            />
          </label>
        </div>
        <div>
          <label htmlFor='nodesPerElement'>
            Nodes Per Element
            <NumericFormat
              className={inputStyles}
              value={nodesPerElement}
              onChange={e => updateElements(e, setNodesPerElement)}
            />
          </label>
        </div>
        <button
          onClick={enterCoords}
          disabled={!enableEnterCoords}
          type='button'
          className={` ${
            !enableEnterCoords ? 'cursor-not-allowed' : ''
          } ${buttonStyles}`}
        >
          Update Node Coordinates
        </button>
      </form>
      {children}
    </>
  )
}
