import React from 'react'
import MainRouter from './MainRouter'
import { BrowserRouter } from 'react-router-dom'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'

const App = () => {
    return (
        <BrowserRouter>
            <MainRouter />
        </BrowserRouter>
    )
}

export default App
