import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pollNewMesh } from '../../api'
import Viz from '../BaseMesh/Viz'
import Table from '../../views/Table'

export function OutputMesh ({ id }) {
  const [resultsReady, setResultsReady] = useState(false)
  const [mesh, setMesh] = useState(Object.create())
  const { isFetching, data, isSuccess } = useQuery(
    ['poll-mesh', id],
    () => pollNewMesh(id),
    { enabled: !resultsReady, refetchInterval: 3000 }
  )

  const meshReady = Object.keys(mesh).length > 0
  useEffect(() => {
    if (data?.success) setMesh(data?.data?.payload)
    if (data?.status === 'SUCCESS') setResultsReady(true)
  }, [isSuccess, isFetching])

  const vizParent = useRef()
  //  show elements and coordinates (probably reusing components)
  return (
    <>
      <div className='w-full flex justify-between h-full gap-x-4'>
        <div className='w-2/5 h-full'>
          <div className='h-full'>
            {meshReady && (
              <>
                <h1 className='text-2xl font-bold'>Coordinates</h1>
                <Table
                  is3D={mesh.coordinates[0].length > 2}
                  itemList={mesh.coordinates}
                  styles='h-1/2'
                />
                <h1 className='text-2xl font-bold'>Elements</h1>
                <Table isElements itemList={mesh.elements} styles='h-1/2' />
              </>
            )}
          </div>
        </div>
        <div className='w-1/2 grow'>
          Results
          {meshReady && (
            <Viz
              elements={mesh.elements}
              coordinates={mesh.coordinates}
              parent={vizParent}
            />
          )}
        </div>
      </div>
    </>
  )
}
