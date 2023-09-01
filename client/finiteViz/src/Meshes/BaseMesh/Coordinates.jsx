import { useEffect, useState } from 'react'
export default function Coordinates ({
  coordinatesState,
  numDims,
  numNodes,
  showElements,
  children
}) {
  const { coordinates, setCoordinates } = coordinatesState
  // const [coordinatesComplete, setCoordinatesComplete] = useState(false)
  const initialCoordinates = Array.from({ length: numNodes }, () =>
    new Array(numDims < 3 ? 2 : 3).fill('')
  )
  const [useDefaultCoordinates] = useState(true)

  const defaultCoordinates = [
    [0.0, 0.0],
    [1.0, 0.0],
    [1.0, 1.0],
    [0.0, 1.0],
    [2.0, 0.0],
    [2.0, 2.0],
    [0.0, 2.0]
  ]

  useEffect(
    () =>
      setCoordinates(
        useDefaultCoordinates ? defaultCoordinates : initialCoordinates
      ),
    []
  )
  // console.log(numNodes, coordinates)
  const checkCoordinatesComplete = () =>
    coordinates.every(node => node.every(coord => coord !== ''))

  // console.log(checkCoordinatesComplete())
  function defineElements () {
    showElements(true)
    // setCoordinatesComplete(
    //   coordinates.every(node => node.every(coord => coord !== ''))
    // )
  }
  function setCoordinate (i, j, value) {
    setCoordinates(prevCoordinates => {
      const val = value === '' || isNaN(value) ? '' : value
      return prevCoordinates.map((row, rowIndex) =>
        rowIndex === i ? [...row.slice(0, j), val, ...row.slice(j + 1)] : row
      )
    })
  }
  function makeCoordsInputs () {
    const nodes = []
    for (let i = 0; i < numNodes; i++) {
      const node = {}
      node.x = (
        <input
          className='x-coords'
          pattern='/^[0-9]*$/'
          onChange={e => setCoordinate(i, 0, parseInt(e.target.value))}
          value={coordinates[i][0]}
        />
      )
      node.y = (
        <input
          className='y-coords'
          pattern='/^[0-9]*$/'
          onChange={e => setCoordinate(i, 1, parseInt(e.target.value))}
          value={coordinates[i][1]}
        />
      )
      if (numDims > 2) {
        node.z = (
          <input
            className='z-coords'
            pattern='/^[0-9]*$/'
            onChange={e => setCoordinate(i, 2, parseInt(e.target.value))}
            value={coordinates[i][2]}
          />
        )
      }
      nodes.push(node)
    }
    return nodes
  }

  return (
    <>
      <form id='coordinates'>
        <div>
          <h1>Nodes</h1>
          {coordinates.length > 0 &&
            makeCoordsInputs().map((coord, index) => (
              <div className='node' key={index}>
                {' '}
                Node {index}:
                <div>
                  x: {coord.x}
                  y: {coord.y}
                  {coord?.z && <>z: {coord.z}</>}
                </div>
              </div>
            ))}
        </div>
        <button
          disabled={!checkCoordinatesComplete()}
          onClick={defineElements}
          type='button'
          className='bg-blue-300 p-2 rounded-md'
        >
          Define Element Nodes
        </button>
      </form>
      {children}
    </>
  )
}
