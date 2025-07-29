import { StrictMode } from 'react'
import React from 'react'
import ReactDom from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import  StoreContextProvider  from './context/storeContext.jsx'
ReactDom.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StoreContextProvider>
      <App />
      </StoreContextProvider >
    
  </BrowserRouter>
)
