  styles
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
  function enterCoords () {
    if (numDims > 0 && nodesPerElement > 0 && numElements > 0) {
      setNumNodes(numElements + nodesPerElement)
      // setDisableEnterCoords(true)
      setShowCoordinates(true)
    } else {
      window.alert(
        'Enter the number of dimensions and nodes in your original mesh'
      )
    }
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
              onChange={e => setNumDims(parseInt(e.target.value))}
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
            />
          </label>
        </div>
        <button
          onClick={enterCoords}
          disabled={disableEnterCoords}
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
