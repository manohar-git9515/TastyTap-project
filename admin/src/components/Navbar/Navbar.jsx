import React from 'react'
import './Navbar.css'
import {assets} from "../../assets/assets"

const Navbar = () => {
  const handleLogoClick = () => {
    // Navigate to the frontend application
    // Admin is on 5173, frontend is on 5174
    window.location.href = 'http://localhost:5174';
  };

  const handleProfileClick = () => {
    // Navigate to the frontend application when profile is clicked
    window.location.href = 'http://localhost:5174';
  };

  return (
    <div className="navbar">
      <img 
        className="logo" 
        src={assets.logo} 
        alt="" 
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      />
      <img 
        className="profile" 
        src={assets.profile_image} 
        alt="" 
        onClick={handleProfileClick}
        style={{ cursor: 'pointer' }}
      />  
    </div>
  )
}

export default Navbar