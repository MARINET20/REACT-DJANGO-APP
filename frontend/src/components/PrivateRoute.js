import React, {useContext} from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';

const PrivateRoute = ({ element: Element, ...rest }) => {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" />;
  }

 
  return <Route {...rest} element={<Element />} />;
  
};

export default PrivateRoute