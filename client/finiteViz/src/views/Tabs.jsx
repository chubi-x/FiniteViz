export default function Tabs ({ activeTab, children }) {
  const { baseActive, setBaseActive } = activeTab
  const setBg = active => {
    return active
      ? 'bg-white border-md rounded-lg text-indigo-900'
      : 'bg-gray-200'
  }
  const setActive = tab => {
    setBaseActive(!!tab.includes('Base'))
  }
  return (
    <>
      <ul className='grid w-full grid-flow-col text-center text-gray-500 bg-gray-200  rounded-lg p-1'>
        <li>
          <button
            onClick={e => setActive(e.target.innerText)}
            className={`flex w-full justify-center py-2 ${setBg(baseActive)}`}
          >
            Base Mesh
          </button>
        </li>
        <li>
          <button
            onClick={e => setActive(e.target.innerText)}
            className={`flex w-full justify-center rounded-lg ${setBg(
              !baseActive
            )}  py-2`}
          >
            Output Mesh
          </button>
        </li>
      </ul>
      {children}
    </>
  )
}
