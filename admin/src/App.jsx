import React from 'react';
import Navbar from './components/Navbar/Navbar'
import Slidebar from './components/slidebar/Slidebar'
import Add from './pages/Add/Add.jsx'
import List from './pages/List/List.jsx'
import Orders from './pages/Order/Order.jsx'
import { Routes, Route } from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {

    const url = "http://localhost:4002"
    return (
        <div>
            <ToastContainer/>
            <Navbar /> 
            <hr />
            <div className="app-content">
                <Slidebar />
                <Routes>
                    <Route path="/" element={<List url={url} />} />                                              
                    <Route path="/add" element={<Add url={url} />} />
                    <Route path="/list" element={<List url={url} />} />
                    <Route path="/orders" element={<Orders url={url} />} />
            </Routes>
            </div>
            
        </div>
    );
};

export default App;
