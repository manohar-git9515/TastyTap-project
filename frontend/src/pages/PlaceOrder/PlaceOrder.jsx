import React, {useState, useContext, useEffect} from 'react';
import axios from 'axios';
import './PlaceOrder.css';
import { StoreContext } from '../../context/storeContext';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    console.log("=== PLACE ORDER DEBUG ===");
    console.log("Token:", token);
    console.log("Cart items:", cartItems);
    console.log("Form data:", data);
    
    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });
    
    console.log("Order items:", orderItems);
    
    // Prepare order data
    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
    };
    
    console.log("Order data being sent:", orderData);
    
    try {
      console.log("Making API call to:", url + "/api/order/place");
      
      let response = await axios.post(
        url + "/api/order/place",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("API response:", response.data);
      
      if (response.data.success) {
        const { session_url } = response.data;
        console.log("Session URL:", session_url);
        
        if (session_url) {
          console.log("Redirecting to Stripe session...");
          window.location.replace(session_url);
        } else {
          console.error("No session URL received");
          alert("Payment session could not be created. Please try again.");
        }
      } else {
        console.error("Order placement failed:", response.data.message);
        alert("Something went wrong: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error during order placement:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error headers:", err.response?.headers);
      
      if (err.response?.status === 404) {
        alert("Order endpoint not found. Please check if the server is running.");
      } else if (err.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
      } else {
        alert("Order failed: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token, getTotalCartAmount, navigate]);

  return (
    <form onSubmit={handlePlaceOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' required />
          <input name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' required />
        </div>
        <input name="email" onChange={onChangeHandler} value={data.email} type="text" placeholder='Email Adress' required />
        <input name="street" onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' required />
        <div className="multi-fields">
          <input name="city" onChange={onChangeHandler} value={data.city} type="text" placeholder='City' required />
          <input name="state" onChange={onChangeHandler} value={data.state} type="text" placeholder='State' required />
        </div>
        <div className="multi-fields">
          <input name="zipcode" onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip Code' required />
          <input name="country" onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' required />
        </div>
        <input name="phone" onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' required />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button type='submit' disabled={loading}>{loading ? "PROCESSING..." : "PROCEED TO PAYMENT"}</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
