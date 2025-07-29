import React from 'react'
import './footer.css'
import {assets} from "../../assets/assets"
const Footer = () => {
  return (
      <div className='footer' id="footer">
          <div className='footer-content'>
              <div className="footer-content-left">
              <img src={assets.logo} alt="" className='footer-logo'/>
                  <p>TastyTap is your go-to destination for delicious food from the best local restaurants. Our mission is to bring you a fast, fresh, and delightful dining experience right to your doorstep.
                      Explore our diverse menu and enjoy a world of flavors with just a tap.</p>
              <div className="footer-social-icons">
              <img src={assets.facebook_icon} alt="" />
              <img src={assets.twitter_icon} alt="" />
              <img src={assets.linkedin_icon} alt="" />
                </div>
              </div>
              <div className="footer-content-center">
                  <h2>COMPANY</h2>
                  <ul>
                  <li>Home</li>
                  <li>About Us</li>
                  <li>Delivery</li>
                  <li>Privacy policy</li>
                  </ul>
              </div>  
              <div className="footer-content-right">
                  <h2>GET IN TOUCH</h2>
                  <ul>
                      <li>+91-223-234-9854</li>
                      <li>contact@tastytap.com</li>
                  </ul>
              </div> 
            
          </div>
          <hr />
          <p className="footer-copyright">Copyright 2025 © TastyTap.com - All Rights Reserved.</p>
    </div>
  )
}

export default Footer
