import { useEffect, useState } from 'react'
import { NumericFormat } from 'react-number-format'
export default function Coordinates ({
  state,
  numDims,
  numNodes,
  showElements
}) {
  const { coordinates, baseMeshDispatch } = state
  const initialCoordinates = Array.from({ length: numNodes }, () =>
    new Array(numDims < 3 ? 2 : 3).fill('')
  )
  const [useDefaultCoordinates] = useState(true)

  // const defaultCoordinates = [
  //   [0.0, 0.0],
  //   [1.0, 0.0],
  //   [1.0, 1.0],
  //   [0.0, 1.0],
  //   [2.0, 0.0],
  //   [2.0, 2.0],
  //   [0.0, 2.0]
  // ]
  const defaultCoordinates = [
    [0.0, 0.0],
    [1.0, 0.0],
    [1.0, 1.0],
    [0.0, 1.0],
    [2.0, 0.0],
    [2.0, 2.0],
    [0.0, 2.0]
  ]

  useEffect(() => {
    if (coordinates.length === 0) {
      baseMeshDispatch({
        type: 'coordinates',
        payload: useDefaultCoordinates ? defaultCoordinates : initialCoordinates
      })
    }
  }, [])
  const checkCoordinatesComplete = () =>
    coordinates.every(node => node.every(coord => coord !== ''))
  function defineElements () {
    showElements(true)
  }
  function setCoordinate (i, j, value) {
    const val = value === '' || isNaN(value) ? '' : value
    baseMeshDispatch({
      type: 'coordinates',
      payload: coordinates.map((row, rowIndex) =>
        rowIndex === i ? [...row.slice(0, j), val, ...row.slice(j + 1)] : row
      )
    })
  }
  function makeCoordsInputs () {
    const nodes = []
    for (let i = 0; i < numNodes; i++) nodes.push(i)
    return nodes
  }

  return (
    <>
      <form id='coordinates'>
        <div>
          <h1>Nodes</h1>
          <div className='space-y-3'>
            {coordinates.length > 0 &&
              makeCoordsInputs().map((node, index) => (
                <div className='node' key={index}>
                  x:{' '}
                  <NumericFormat
                    value={coordinates[node][0]}
                    onValueChange={({ floatValue }) =>
                      setCoordinate(node, 0, floatValue)
                    }
                  />
                  y:{' '}
                  <NumericFormat
                    value={coordinates[node][1]}
                    onValueChange={({ floatValue }) =>
                      setCoordinate(node, 1, floatValue)
                    }
                  />
                  {numDims > 2 && (
                    <>
                      z:{' '}
                      <NumericFormat
                        value={coordinates[node][2]}
                        onValueChange={({ floatValue }) =>
                          setCoordinate(node, 2, floatValue)
                        }
                      />
                    </>
                  )}
                </div>
              ))}
          </div>
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
    </>
  )
}
