import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import { ReactQueryDevtools} from '@tanstack/react-query-devtools'
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx'
import { Provider } from 'react-redux';
import { store } from './assets/components/redux/store.js';

//!Create instance of client
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
      <App />
      </Provider>

      <ReactQueryDevtools initialIsOpen = {false}/>
    </QueryClientProvider>
    
  </StrictMode>,
)
