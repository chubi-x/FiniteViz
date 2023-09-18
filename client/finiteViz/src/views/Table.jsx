import { NumericFormat } from 'react-number-format'
export default function Table ({
  is3D,
  isElements,
  isBaseMesh,
  cellSetter,
  itemList,
  styles
}) {
  let headers = (
    <tr>
      <th scope='col' className='px-6 text-lg py-3' />
      <th scope='col' className='px-6 text-lg py-3'>
        X
      </th>
      <th scope='col' className='px-6 text-lg py-3'>
        Y
      </th>
      {is3D && (
        <th scope='col' className='px-6 text-lg py-3'>
          Z
        </th>
      )}
    </tr>
  )
  if (isElements) {
    headers = (
      <tr>
        <th scope='col' className='px-6 text-lg py-3' />
        {itemList[0].map((_, index) => (
          <th scope='col' key={index} className='px-6 text-lg py-3'>
            Node {index}
          </th>
        ))}
      </tr>
    )
  }
  const rowLabel = index => {
    return `${isElements ? 'Element' : 'Node'} ${index}`
  }
  return (
    <div className={`relative overflow-y-scroll ${styles}`}>
      <table className='w-full text-sm text-left text-gray-900 whitespace-nowrap dark:text-white'>
        <thead className='text-xs text-gray-700 uppercase font-bold bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
          {headers}
        </thead>
        <tbody className='font-medium'>
          {itemList.length > 0 &&
            itemList.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className='bg-white border-b dark:bg-gray-800 dark:border-gray-700'
              >
                <td className='px-6 py-4'>{rowLabel(rowIndex)}</td>
                {row.length > 0 &&
                  row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`${!isBaseMesh ? 'px-6 py-4' : ''}`}
                    >
                      {
                        /*  eslint-disable multiline-ternary, react/jsx-curly-newline */
                        isBaseMesh ? (
                          <NumericFormat
                            className='bg-white px-6 py-4 dark:bg-gray-600 h-full w-full border'
                            value={itemList[rowIndex][cellIndex]}
                            onValueChange={({ floatValue }) =>
                              cellSetter(rowIndex, cellIndex, floatValue)
                            }
                          />
                        ) : (
                          cell
                        )
                      }
                    </td>
                  ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
