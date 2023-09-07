import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './style.css'
import App from './App'
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('app')).render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen position='top-right' />
  </QueryClientProvider>

  //  </React.StrictMode>
)
