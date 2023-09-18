import { useEffect, useState } from 'react'
import { NumericFormat } from 'react-number-format'
export default function Coordinates ({
  state,
  numDims,
  numNodes,
  showElements,
  styles
}) {
  const { coordinates, baseMeshDispatch } = state
  const initialCoordinates = Array.from({ length: numNodes }, () =>
    new Array(numDims < 3 ? 2 : 3).fill('')
  )
  const { buttonStyles } = styles

  // const [useDefaultCoordinates] = useState(false)
  // const defaultCoordinates = [
  //   [0.0, 0.0],
  //   [1.0, 0.0],
  //   [1.0, 1.0],
  //   [0.0, 1.0],
  //   [2.0, 0.0],
  //   [2.0, 2.0],
  //   [0.0, 2.0]
  // ]

  useEffect(() => {
    let newCoords
    if (coordinates.length === 0) {
      newCoords = initialCoordinates
    } else {
      if (numDims <= 3) {
        newCoords = initialCoordinates.map((_, index) => {
          return numDims === 3
            ? [...coordinates[index], '']
            : coordinates[index]?.slice(0, 2)
        })
      } else newCoords = coordinates
    }
    baseMeshDispatch({
      type: 'coordinates',
      payload: newCoords
    })
  }, [numDims])
  useEffect(() => {
    // console.log(numNodes)
    if (coordinates.length === 0) {
      baseMeshDispatch({
        type: 'coordinates',
        payload: initialCoordinates
      })
    } else {
      let newCoords
      if (coordinates.length > numNodes) {
        newCoords = coordinates.slice(0, numNodes)
      } else newCoords = coordinates
      baseMeshDispatch({
        type: 'coordinates',
        payload: newCoords
      })
    }
  }, [numNodes])
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
            className={` w-full ${
              !checkCoordinatesComplete() ? 'cursor-not-allowed' : ''
            } ${buttonStyles}`}
      </form>
    </>
  )
}
