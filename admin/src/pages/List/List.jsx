import React, {useEffect,useState} from 'react';
import "./List.css"
import axios from "axios"
import {toast} from "react-toastify"
import assets from '../../assets/assets';
const List = ({url}) => {

    
    const [list, setList] = useState([]);
    const [image, setImage] = useState(null);
    const [data, setData] = useState({
      name: "",
      description: "",
      category: "Salad",
      price: ""
    });

    const onChangeHandler = (e) => {
      setData({ ...data, [e.target.name]: e.target.value });
    };
    

    const fetchList = async () => {
        const response = await axios.get(`${url}/api/food/list`);
        console.log("API response:", response.data);
        if (response.data.success) {
            console.log("Setting list to:", response.data.data);
            setList(response.data.data);
        } else {
            toast.error("Error");
        }
    }

    const removeFood = async (foodId) => {
        const response = await axios.delete(`${url}/api/food/remove`, { data: { id: foodId } })
        await fetchList();
        if (response.data.success) {
            toast.success(response.data.message)
        }
        else {
            toast.error("Error");
        }

    }

    useEffect(() => {
        fetchList();
    }, []);

    const onSubmitHandler = (e) => {
        e.preventDefault();
    };
  return (
    <div className='list add flex-col'>
          <p>All Foods List</p>
          <div className="list-table">
              <div className="list-table-format title">
                  <b>Image</b>
                  <b>Name</b>
                  <b>Category</b>
                  <b>Price</b>
                  <b>Action</b>                  
              </div>
              {Array.isArray(list) && list.map((item, index) => (
                  <div key={index} className='list-table-format'>
                      <img src={`${url}/uploads/` + item.image} alt="" />
                      <p>{item.name}</p>
                      <p>{item.category}</p>
                      <p>₹{item.price}</p>
                      <p onClick={()=>removeFood(item._id)}>x</p>
                  </div>
              ))}            
          </div>
    </div>
  );
};
export default List;
