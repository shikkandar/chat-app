import React, { useState } from 'react'
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const useLogout = () => {
 const [loding,setLoading]=useState(false);
 const {setAuthUser} = useAuthContext();

 const logout = async () => {
    try {
     setLoading(true);
     const res=await fetch('/api/auth/logout', {
      method: 'POST'
     });

     const data=await res.json();

     if (!res.ok) {
        throw new Error(data.message);
     }
     setAuthUser(null);
    } catch (error:any) {
     console.log(error);
     toast.error(error.message)
    } finally {
     setLoading(false);
    }
 }

 return {
  logout,
  loding
 }
}

export default useLogout
