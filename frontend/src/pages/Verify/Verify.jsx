import React, { useContext, useEffect, useState } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/storeContext';
import axios from 'axios';

const Verify = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const sessionId = searchParams.get("sessionId");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const { url, setCartItems, token, setToken } = useContext(StoreContext);
    const navigate = useNavigate();

    const verifyPayment = async () => {
        try {
            console.log("=== VERIFY PAYMENT DEBUG ===");
            console.log("Success:", success);
            console.log("OrderId:", orderId);
            console.log("SessionId:", sessionId);
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
                console.error("No token found, redirecting to home");
                setError("Authentication required. Please log in again.");
                setTimeout(() => navigate("/"), 3000);
                return;
            }

            console.log("Making verification request with token:", currentToken);
            const response = await axios.post(
                url + "/api/order/verify", 
                { success, orderId, sessionId },
                { headers: { Authorization: `Bearer ${currentToken}` } }
            );
            console.log("Verify response:", response.data);
            
            if (response.data.success) {
                setCartItems({});
                console.log("Payment verified successfully, navigating to MyOrders");
                navigate("/myorders");
            } else {
                console.log("Payment verification failed, redirecting to home");
                setError(response.data.message || "Payment verification failed");
                setTimeout(() => navigate("/"), 3000);
            }
        } catch (error) {
            console.error("Error during payment verification:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            
            if (error.response?.status === 401) {
                console.log("Authentication failed, clearing token and redirecting");
                localStorage.removeItem("token");
                setToken("");
                setError("Session expired. Please log in again.");
                setTimeout(() => navigate("/"), 3000);
            } else if (retryCount < 3) {
                console.log(`Retrying verification (attempt ${retryCount + 1}/3)...`);
                setRetryCount(prev => prev + 1);
                setTimeout(() => verifyPayment(), 2000);
            } else {
                setError("Payment verification failed. Please contact support.");
                setTimeout(() => navigate("/"), 5000);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (success && orderId) {
            // Add a small delay to ensure context is loaded
            setTimeout(() => verifyPayment(), 500);
        } else {
            console.log("Missing success or orderId parameters");
            setError("Invalid payment verification parameters");
            setTimeout(() => navigate("/"), 2000);
        }
    }, [success, orderId])

    return (
        <div className='verify'>
            {loading ? (
                <div className="spinner">
                    <p>Verifying your payment...</p>
                    {retryCount > 0 && <p>Retry attempt: {retryCount}/3</p>}
                </div>
            ) : error ? (
                <div className="error">
                    <p>{error}</p>
                    <p>Redirecting to home page...</p>
                </div>
            ) : (
                <div className="spinner">
                    <p>Processing...</p>
                </div>
            )}
        </div>
    )
}

export default Verify
