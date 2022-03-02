import React, { createContext, useState, useContext, useEffect } from 'react';
import { handleResponse } from '../helpers/handle-response';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import { ResponseHandler } from '../helpers/response-handler';

const AuthContextData = {
  signed: null,
  user: null,
  Login: (user) => { },
  Logout: () => { },
}

const AuthContext = createContext(AuthContextData);

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(null);
  const uniqueId = DeviceInfo.getUniqueId();
  const { errorHandler } = ResponseHandler();

  useEffect(() => {
    getStoragedUser();
  }, [])

  const getStoragedUser = async () => {
    const u = await getUser();
    
    if (u && u.token) 
      setUser(u);
  }

  async function Login(data = {}) {

    return axios
      .post(`${API_URL}login`, data, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'REQUEST-X-AUTH-TOKEN': uniqueId
        }
      })
      .then(function (response) {
        let result = response.data;

        if (result.token) {
          setUser(result);
          storeUser(result);
        }

        return result;
        
      }.bind(this))
      .catch(errorHandler.bind(this));

  }

  async function Logout() {
    storeUser(null);
    setUser(null);
  }

  async function storeUser(value) {
    try {
      const jsonValue = value == null ? '' : JSON.stringify(value)
      await AsyncStorage.setItem('@storage_User', jsonValue)
    } catch (e) {
      console.log(e)
    }
  }

  async function getUser() {
    try {
      const jsonValue = await AsyncStorage.getItem('@storage_User')
      let v = jsonValue !== null ? JSON.parse(jsonValue) : null
      return v;
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <AuthContext.Provider
      value={{ signed: Boolean(user), user, Login, Logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  return context;
}