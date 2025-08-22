
import { useContext } from 'react';
import { AuthContext } from '../context/context.js'; 

export const useAuth = () => {
  return useContext(AuthContext);
};