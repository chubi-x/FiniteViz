import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Viz from '../BaseMesh/Viz'
import Table from '../../views/Table'

export function OutputMesh ({ id }) {
  const [resultsReady, setResultsReady] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [mesh, setMesh] = useState(Object.create({}))
  const MAX_REFETCH = 20
  const refetchCount = window.sessionStorage.getItem(`${id}-refetchCount`) ?? 0

  const canRefetch = () => parseInt(refetchCount) < MAX_REFETCH && !errorMessage
  // if (!canRefetch) window.localStorage.setItem(`${id}-refetchCount`, 0)
  const { isFetching, data, isSuccess } = useQuery(
    ['poll-mesh', id],
    async () => {
      const response = await fetch(`http://127.0.0.1:3000/poll/${id}`, {
        // signal: AbortSignal.timeout(5000)
      })
      window.sessionStorage.setItem(
        `${id}-refetchCount`,
        parseInt(refetchCount) + 1
      )
      return await response.json()
    },
    {
      enabled: !resultsReady,
      refetchInterval: canRefetch() ? 5000 : false
    }
  )

  const meshReady = Object.keys(mesh).length > 0
  useEffect(() => {
    if (data?.success && data?.status === 'SUCCESS') {
      setMesh(data?.data?.payload)
      window.sessionStorage.setItem(`${id}-refetchCount`, 0)
      setResultsReady(true)
    } else setErrorMessage(data?.message)
  }, [isSuccess, isFetching])

  const vizParent = useRef()
  //  show elements and coordinates (probably reusing components)
  return (
    <>
      <div className='w-full flex justify-between h-full gap-x-4'>
          ) : canRefetch() ? (
            <div>Fetching Mesh...</div>
          ) : (
            <h1 className='text-xl font-medium'>
              {errorMessage ||
                'There was an error fetching your mesh. Please try again later.'}
            </h1>
          )
        }
      </div>
    </>
  )
}
