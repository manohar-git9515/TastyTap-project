import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/storeContext'
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrders = () => {
    const { url, token, setToken } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const fetchOrders = async () => {
        try {
            console.log("=== FETCH ORDERS DEBUG ===");
            console.log("Token from context:", token);
            console.log("Token from localStorage:", localStorage.getItem("token"));
            
            // Get token from localStorage if not available in context
            let currentToken = token;
            if (!currentToken) {
                currentToken = localStorage.getItem("token");
                if (currentToken) {
                    setToken(currentToken);
                    console.log("Token loaded from localStorage");
                }
            }
            
            if (!currentToken) {
                console.error("No token found for fetching orders");
                setError("Authentication required. Please log in again.");
                setLoading(false);
                return;
            }

            console.log("Making orders request with token:", currentToken);
            const response = await axios.post(
                url + "/api/order/userorders",
                {},
                { headers: { Authorization: `Bearer ${currentToken}` } }
            );
            
            console.log("Orders response:", response.data);
            
            if (response.data.success) {
                setData(response.data.data);
                setError(null);
                setRetryCount(0);
            } else {
                setError(response.data.message || "Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            
            if (error.response?.status === 401) {
                console.log("Authentication failed, clearing token and redirecting");
                localStorage.removeItem("token");
                setToken("");
                setError("Session expired. Please log in again.");
            } else if (retryCount < 3) {
                console.log(`Retrying fetch orders (attempt ${retryCount + 1}/3)...`);
                setRetryCount(prev => prev + 1);
                setTimeout(() => fetchOrders(), 2000);
                return;
            } else {
                setError("Failed to load orders. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        } else {
            // Check localStorage for token
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
                console.log("Token found in localStorage, setting in context");
            } else {
                console.log("No token available, setting loading to false");
                setLoading(false);
            }
        }
    }, [token])

    if (loading) {
        return (
            <div className='my-orders'>
                <h2>My Orders</h2>
                <div className="container">
                    <p>Loading your orders...</p>
                    {retryCount > 0 && <p>Retry attempt: {retryCount}/3</p>}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='my-orders'>
                <h2>My Orders</h2>
                <div className="container">
                    <p style={{ color: 'red' }}>{error}</p>
                    <button onClick={() => {
                        setRetryCount(0);
                        setLoading(true);
                        fetchOrders();
                    }}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            <div className="container">
                {data.length === 0 ? (
                    <p>No orders found. Start shopping to see your orders here!</p>
                ) : (
                    data.map((order, index) => {
                        return (
                            <div key={index} className='my-orders-order'>
                                <img src={assets.parcel_icon} alt="" />
                                <p>{order.items.map((item, index) => {
                                    if (index === order.items.length - 1) {
                                        return item.name + " x " + item.quantity
                                    }
                                    else {
                                        return item.name + " x " + item.quantity + ", "
                                    }
                                })}</p>
                                <p>₹{order.amount}.00</p>
                                <p>Items: {order.items.length}</p>
                                <p><span>&#x25cf;</span><b>{order.status}</b></p>
                                <button onClick={fetchOrders}>Track Order</button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default MyOrders