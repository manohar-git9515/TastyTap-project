import { createContext,useState,useEffect } from "react";
import axios from "axios";

export const StoreContext = createContext(null)
const StoreContextProvider = (props) => {
    
    const [cartItems, setCartItems] = useState({});
    const url = "http://localhost:4002";
    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([]);

    const addToCart = async (itemId) => {
        try {
            setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
            
            // Also update backend
            if (token) {
                try {
                    await axios.post(
                        url + "/api/cart/add",
                        { itemId },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                } catch (error) {
                    console.log("Error updating cart in backend:", error);
                }
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
            // Optionally, show a user-friendly message here
        }
    }
    const removeFromCart = async (itemId)=> {
        setCartItems((prev) => {
            const newCart = { ...prev };
            if (newCart[itemId] > 0) {
                newCart[itemId] -= 1;
                if (newCart[itemId] === 0) {
                    delete newCart[itemId];
                }
            }
            return newCart;
        });
        
        // Also update backend
        if (token) {
            try {
                await axios.post(
                    url + "/api/cart/remove",
                    { itemId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.log("Error updating cart in backend:", error);
            }
        }
    }
   
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item]>0) {
                let itemInfo = food_list.find((product) => product._id === item)
                totalAmount += itemInfo.price * cartItems[item];   
            }
           
        }
        return totalAmount;
    }

    const fetchFoodList = async () => { 
        const response = await axios.get(url + "/api/food/list");
        setFoodList(response.data.data);
    }

    const loadCartData = async (token) => { 
        const response = await axios.post(url + "/api/cart/get", {}, { headers: { Authorization: `Bearer ${token}` } })
        setCartItems(response.data.cartData);
    }
    useEffect(() => {
        
        async function loadData() { 
            await fetchFoodList();
            if(localStorage.getItem("token")){
                setToken(localStorage.getItem("token"));
                await loadCartData(localStorage.getItem("token"));
            }
        }
        loadData();
    },[])
    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken
        
    };
    
    return (
        < StoreContext.Provider value = { contextValue } >
        { props.children }
    </StoreContext.Provider >
    )
}

export default StoreContextProvider;