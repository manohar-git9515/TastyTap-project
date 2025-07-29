import React from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets.js'
import  { useState,useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/storeContext';
import { useNavigate } from 'react-router-dom';



const Navbar = ({setShowLogin}) => {
  const [menu, setMenu] = useState("home");
  
  const { getTotalCartAmount, token, setToken, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();
  const logout = () => { 
    localStorage.removeItem("token");
    setToken("");
    setCartItems({}); // Clear cart in UI on logout
    navigate("/");
  }
  return (
    <div className='navbar'>
      <Link to='/'><img src={assets.logo} className='logo'  /></Link>
          <ul className="navbar-menu">
        <Link to="/" onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>home</Link>
        <a href="#explore-menu" onClick={() => setMenu("menu")} className={menu==="menu"?"active":""}>menu</a>
        <a  href="#app-download" onClick={() => setMenu("mobile-app")} className={menu==="mobile-app"?"active":""}>mobile-app</a>
        <a href="#footer" onClick={() => setMenu("contact-us")} className={menu==="contact-us"?"active":""}>contact us</a>
          </ul>
          <div className="navbar-right">
        <img src={assets.search} alt="" className='search' />
        <div className="navbar-search-icon">
          <Link to='/Cart'> <img src={assets.basket} alt="" /></Link>
          <div className={getTotalCartAmount()===0?"":"dot"}></div>
        </div>
        {!token ? <button onClick={() => { setShowLogin(true) }}>sign in</button> :
          <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="" />
            <ul className='nav-profile-dropdown'>
              <li onClick={()=>navigate("/myOrders")}><img src={assets.bag_icon} alt="" /> <p>Orders</p></li>
              <hr />
              <li onClick={logout}><img src={assets.logout_icon} alt="" /> <p>LogOut</p></li>
            </ul>
          </div>}
      </div>

    </div>
  )
}

export default Navbar

