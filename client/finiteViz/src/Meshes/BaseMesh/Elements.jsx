import { useEffect } from 'react'
export default function Elements ({ state, numNodes, showSplits, styles }) {
  const { elements, baseMeshDispatch, nodesPerElement, numElements } = state
  const { buttonStyles } = styles
  // const defaultElements = [
  //   // [0, 1, 2, 3, 1],
  //   // [1, 4, 5, 2, 1],
  //   // [3, 2, 5, 6, 1]
  //   [0, 1, 2, 3, 4, 5, 6, 7]
  // ]
  const initialElements = Array.from({ length: numElements }, () =>
    new Array(nodesPerElement).fill('')
  )
  useEffect(() => {
    if (elements.length === 0) {
      baseMeshDispatch({
        type: 'elements',
        payload: initialElements
      })
    }
  }, [])
  const checkElementsComplete = () => {
    return elements.every(el => el.every(node => node !== ''))
  }
  function updateElements (i, j, value) {
    baseMeshDispatch({
      type: 'elements',
      payload: elements.map((row, rowIndex) =>
        rowIndex === i
          ? [...row.slice(0, j), parseInt(value), ...row.slice(j + 1)]
          : row
      )
    })
  }
  function elementOptions () {
    const options = []
    for (let i = 0; i < numNodes; i++) options.push(i)
    return options
  }
  function elementNodes () {
    const nodes = []
    for (let i = 0; i < nodesPerElement; i++) {
      nodes.push(i)
    }
    return nodes
  }
  function defineElements () {
    const elements = []
    for (let i = 0; i < numElements; i++) {
      elements.push(i)
    }
    return elements
  }
  return (
    <>
      <form id='elements' className='mt-8 space-y-4'>
        <h1 className='text-2xl font-bold'>Elements</h1>

        {elements.length > 0 &&
          defineElements().map((_, i) => (
            <div key={i}>
              <h1 className='text-lg font-medium'>Element {i}</h1>
              <div>
                {elementNodes().map((_, j) => (
                  <select
                    defaultValue='Choose Node'
                    onChange={e => updateElements(i, j, e.target.value)}
                    key={j}
                  >
                    <option disabled value='Choose Node'>
                      Choose Node
                    </option>
                    {elementOptions().map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          ))}
        <div className='space-x-3 flex'>
          <button
            id='defineSplits'
            onClick={() => showSplits(true)}
            disabled={!checkElementsComplete()}
            type='button'
            className={` ${
              !checkElementsComplete() ? 'cursor-not-allowed' : ''
            } ${buttonStyles}`}
          >
            Define Splits
          </button>
          <button
            type='button'
            onClick={() =>
              baseMeshDispatch({
                type: 'elements',
                payload: initialElements
              })
            } //  eslint-disable-line react/jsx-curly-newline
            className={`${styles.buttonStyles} !bg-red-600`}
          >
            Clear Elements
          </button>
        </div>
      </form>
    </>
  )
}
