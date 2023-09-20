import { useEffect } from 'react'
import Table from '../../views/Table'
export default function Coordinates ({
  state,
  numDims,
  numNodes,
  showElements,
  styles
}) {
  const { coordinates, baseMeshDispatch } = state
  const initialCoordinates = Array.from({ length: numNodes }, () =>
    new Array(numDims).fill('')
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
      newCoords = initialCoordinates.slice()
    } else {
      if (numDims <= 3) {
        newCoords = initialCoordinates.map((_, index) => {
          return numDims === 3
            ? [...coordinates[index], '']
            : coordinates[index]?.slice(0, 2)
        })
      } else newCoords = coordinates.slice()
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
  return (
    <>
      <form id='coordinates' className='mt-10'>
        <h1 className='text-2xl font-bold mb-5'>Nodes</h1>

        <div className='space-y-3'>
          {coordinates.length > 0 && (
            <Table
              isBaseMesh
              is3D={coordinates[0].length > 2}
              cellSetter={setCoordinate}
              itemList={coordinates}
              styles=''
            />
          )}
          <button
            disabled={!checkCoordinatesComplete()}
            onClick={defineElements}
            type='button'
            className={` w-full ${
              !checkCoordinatesComplete() ? 'cursor-not-allowed' : ''
            } ${buttonStyles}`}
          >
            Define Element Nodes
          </button>
        </div>
      </form>
    </>
  )
}
