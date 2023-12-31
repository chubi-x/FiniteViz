export default function Error () {
  return (
    <div
      id='alert-additional-content-2'
      className='p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800'
      role='alert'
    >
      <div className='flex items-center'>
        <svg
          className='flex-shrink-0 w-4 h-4 mr-2'
          aria-hidden='true'
          xmlns='http://www.w3.org/2000/svg'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path d='M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z' />
        </svg>
        <span className='sr-only'>Info</span>
        <h3 className='text-lg font-medium'>Oh no! an error occured.</h3>
      </div>
      <div className='mt-2 mb-4 text-sm'>
        Please refresh your browser tab to dismiss the error.
      </div>
      <div className='flex'>
        <button
          onClick={() => window.location.reload()}
          className='text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800'
        >
          Refresh Tab
        </button>
      </div>
    </div>
  )
}
