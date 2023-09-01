import { useState } from 'react'
export default function Splits ({ nodes }) {
  const defaultSplits = [
    [0, 1, 2],
    [0, 3, 2],
    [1, 4, 2]
  ]
  const [splits, setSplits] = useState([])
  const [newSplit, setNewSplit] = useState(['', '', ''])
  function addSplits () {
    const newSplitComplete = newSplit.every(cell => cell !== '')
    if (newSplitComplete) {
      // if (splits.length === 0) {
      setSplits(prev => [...prev, newSplit])
      setNewSplit(['', '', ''])
      // } else console.log('greater')
    } else window.alert('Enter the first set of splits!')
  }

  function populateNodes () {
    const nodesArray = []
    for (let i = 0; i < nodes; i++) nodesArray.push(i)
    return nodesArray
  }
  function removeSplit (index) {
    setSplits(prev => prev.filter((_, rowIndex) => index !== rowIndex))
  }
  function updatenewSplit (e, cell) {
    let cellIndex
    if (cell === 'node1') cellIndex = 0
    else if (cell === 'node2') cellIndex = 1
    else cellIndex = 2
    setNewSplit(prev =>
      prev.map((cell, index) => {
        if (index === cellIndex) {
          return isNaN(parseInt(e.target.value)) ? '' : parseInt(e.target.value)
        } else return cell
      })
    )
  }
  console.log(splits)
  function printNodes () {
    return populateNodes().map((option, index) => (
      <option value={option} key={index}>
        {option}
      </option>
    ))
  }
  return (
    <form id='splits' className='my-10'>
      <div className='my-6'>
        {splits.length > 0 &&
          splits.map((split, index) => (
            <div key={index} className='flex space-x-6 bg-red-400'>
              <div className='inline-block'>Node 1 : {split[0]} </div>

              <div className='inline-block'>Node 2 : {split[1]} </div>

              <div className='inline-block'>NumSplits : {split[2]} </div>
              <button
                type='button'
                className='mr-auto bg-blue-400 rounded-md p-1'
                onClick={e => removeSplit(index)}
              >
                Remove
              </button>
            </div>
          ))}
      </div>

      <div>
        Node 1:{' '}
        <select
          defaultValue='Choose Node'
          // value={newSplit[0]}
          onChange={e => updatenewSplit(e, 'node1')}
        >
          <option disabled value='Choose Node'>
            Choose Node
          </option>
          {printNodes()}
        </select>
        Node 2:{' '}
        <select
          defaultValue='Choose Node'
          // value={newSplit[1]}
          onChange={e => updatenewSplit(e, 'node2')}
        >
          <option disabled value='Choose Node'>
            Choose Node
          </option>
          {printNodes()}
        </select>
        Num Splits
        <input
          value={newSplit[2]}
          onChange={e => updatenewSplit(e, 'numSplits')}
          type='text'
          pattern={/^[2-9]\d*$/}
        />
      </div>

      <div>
        <button
          type='button'
          onClick={addSplits}
          className='bg-yellow-50 p-1 text-black rounded-md'
        >
          New Split
        </button>
      </div>
      <div>
        <button id='' type='button' className='bg-blue-300 p-2 rounded-md'>
          Generate Mesh
        </button>
      </div>
    </form>
  )
}