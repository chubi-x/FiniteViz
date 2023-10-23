import { useState } from 'react'
import Table from '../../views/Table'
export default function Splits ({ nodes, state, generateMesh, styles }) {
  const { splitting, baseMeshDispatch } = state
  const { buttonStyles } = styles
  const [newSplit, setNewSplit] = useState(['', '', ''])
  const splitsComplete = () =>
    splitting.length > 0 &&
    splitting.every(split => split.every(cell => cell !== ''))

  const newSplitComplete = newSplit.every(cell => cell !== '')

  function addSplits () {
    baseMeshDispatch({ type: 'splitting', payload: [...splitting, newSplit] })
    setNewSplit(['', '', ''])
  }

  async function checkSplits () {
    if (splitsComplete()) {
      generateMesh()
    } else window.alert('Please enter at least 1 split sequence')
  }
  function populateNodes () {
    const nodesArray = []
    for (let i = 0; i < nodes; i++) nodesArray.push(i)
    return nodesArray
  }
  function removeSplit (index) {
    baseMeshDispatch({
      type: 'splitting',
      payload: splitting.filter((_, rowIndex) => index !== rowIndex)
    })
  }
  function updatenewSplit (e, cell) {
    let cellIndex
    let setSplits = true
    if (cell === 'node1') cellIndex = 0
    else if (cell === 'node2') cellIndex = 1
    else {
      cellIndex = 2
      if (!isNaN(parseInt(e.target.value)) && parseInt(e.target.value) < 2) {
        setSplits = false
      }
    }
    setSplits &&
      setNewSplit(prev =>
        prev.map((cell, index) => {
          if (index === cellIndex) {
            return isNaN(parseInt(e.target.value))
              ? ''
              : parseInt(e.target.value)
          } else return cell
        })
      )
  }
  function printNodes () {
    return populateNodes().map((option, index) => (
      <option value={option} key={index}>
        {option}
      </option>
    ))
  }
  const addSplitsRow = [
    <select
      className='text-black'
      key={0}
      defaultValue='Choose Node'
      onChange={e => updatenewSplit(e, 'node1')}
    >
      <option disabled value='Choose Node'>
        Choose Node
      </option>
      {printNodes()}
    </select>,
    <select
      className='text-black'
      key={1}
      defaultValue='Choose Node'
      // value={newSplit[1]}
      onChange={e => updatenewSplit(e, 'node2')}
    >
      <option disabled value='Choose Node'>
        Choose Node
      </option>
      {printNodes()}
    </select>,
    //    <NumericFormat
    //      key={2}
    //    className='bg-white px-6 py-4 dark:bg-gray-600 h-full w-full border'
    //    onValueChange={({ floatValue }) =>
    //      cellSetter(rowIndex, cellIndex, floatValue)
    //    }
    //  />
    <input
      key={2}
      className='bg-white px-6 py-4 dark:bg-gray-600 h-full w-full border'
      value={newSplit[2]}
      onChange={e => updatenewSplit(e, 'numSplits')}
      type='number'
      min={2}
      pattern={/^[2-9]\d*$/}
    />
  ]
  //   ( splitting.map((split, index) => (
  //     <div key={index} className='flex space-x-6 bg-red-400'>
  //       <div className='inline-block'>Node 1 : {split[0]} </div>

  //       <div className='inline-block'>Node 2 : {split[1]} </div>

  //       <div className='inline-block'>NumSplits : {split[2]} </div>
  //       <button
  //         type='button'
  //         className='mr-auto bg-blue-400 rounded-md p-1'
  //         onClick={e => removeSplit(index)}
  //       >
  //         Remove
  //       </button>
  //     </div>
  //  )))
  return (
    <form id='splitting' className='my-10 space-y-4'>
      <h1 className='text-2xl font-bold'>Splits</h1>

      <div className='my-6'>
        <Table
          styles={styles}
          itemList={splitting}
          isSplits
          lastRow={addSplitsRow}
          removeSplit={removeSplit}
        />
      </div>
      <div className='flex'>
        <button
          disabled={!newSplitComplete}
          type='button'
          onClick={addSplits}
          className={`${
            !newSplitComplete ? 'cursor-not-allowed' : ''
          } ${buttonStyles} w-auto ml-auto`}
        >
          Add Split
        </button>
      </div>
      <div>
        <button
          onClick={checkSplits}
          disabled={!splitsComplete()}
          id=''
          type='button'
          className={`
          
          ${!splitsComplete() ? 'cursor-not-allowed' : ''}
          ${buttonStyles} !bg-green-500`}
        >
          Generate Mesh
        </button>
      </div>
    </form>
  )
}
