import { useEffect, useRef, useState } from 'react'
import { PanelGroup, Panel } from 'react-resizable-panels'
import ResizeHandle from '../../components/ResizeHandle'
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
      try {
        const response = await fetch(`http://127.0.0.1:3000/poll/${id}`, {
          signal: AbortSignal.timeout(10000)
        })
        window.sessionStorage.setItem(
          `${id}-refetchCount`,
          parseInt(refetchCount) + 1
        )
        return await response.json()
      } catch (e) {
        if (e.message.includes('aborted')) {
          setErrorMessage(
            'There was an error retreiving your mesh. Please check your internet connection and try again.'
          )
          window.sessionStorage.setItem(`${id}-refetchCount`, MAX_REFETCH)
        }
        return false
      }
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
  //  TODO: add loading state
  return (
    <>
      <div className='w-full flex h-full pb-14'>
        {
          /*  eslint-disable multiline-ternary */
          resultsReady ? (
            <PanelGroup direction='horizontal' className='h-full'>
              {meshReady && (
                <>
                  <Panel
                    defaultSize={20}
                    minSize={20}
                    collapsible
                    className='h-full'
                  >
                    <h1 className='text-2xl font-bold'>Coordinates</h1>
                    <Table
                      is3D={mesh.coordinates[0].length > 2}
                      itemList={mesh.coordinates}
                      styles='h-1/2'
                    />
                    <h1 className='text-2xl font-bold'>Elements</h1>
                    <Table isElements itemList={mesh.elements} styles='h-1/2' />
                  </Panel>
                  <ResizeHandle />

                  <Panel defaultSize={70} minSize={50}>
                    <Viz
                      elements={mesh.elements}
                      coordinates={mesh.coordinates}
                      parent={vizParent}
                      is3D={
                        mesh.coordinates.length > 0 &&
                        mesh.coordinates[0].length === 3
                      }
                    />
                  </Panel>
                </>
              )}
            </PanelGroup>
          ) : canRefetch() ? (
            <h1 className='text-xl font-medium'>Fetching Mesh...</h1>
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
