
import axios from "axios";

// const API_URL= process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const API_URL=  'http://localhost:5000/api'



const api= axios.create({
    baseURL: API_URL,
    withCredentials:true,
    headers:{
        'Content-Type':'application/json',
    }
})


api.interceptors.response.use(
    (response)=> response.data,
    (error)=>{
        // if(error.response?.status===401){
        //     window.location.href="/login";
        // }
        return Promise.reject(error);
    }
)

export default api;