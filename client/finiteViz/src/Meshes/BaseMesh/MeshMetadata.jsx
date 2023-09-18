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
      <form className='form flex flex-col w-1/4 space-y-3 mx-auto'>
        <div>
          <label htmlFor='numDims'>
            Num Dims
            <input
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
          Enter Node Coordinates
        </button>
      </form>
      {children}
    </>
  )
}
