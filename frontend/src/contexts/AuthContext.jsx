import { createContext, useContext, useMemo, useState } from 'react'
import axios from 'axios'
import server from '../environment'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? `${server}/api/v1/users`;

const client = axios.create({
  baseURL: API_BASE_URL,
})

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [username, setUsername] = useState(localStorage.getItem('username') || '')

  async function register(name, userNameInput, password) {
    const response = await client.post('/register', {
      name,
      username: userNameInput,
      password,
    })
    return response.data?.message ?? 'Registered'
  }

  async function login(userNameInput, password) {
    const response = await client.post('/login', {
      username: userNameInput,
      password,
    })

    const authToken = response.data?.token
    if (!authToken) {
      throw new Error('Token missing in login response')
    }

    localStorage.setItem('token', authToken)
    localStorage.setItem('username', userNameInput)
    setToken(authToken)
    setUsername(userNameInput)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken('')
    setUsername('')
  }

  const getHistoryOfUser=async()=>{
    try{
      let request=await client.get("/get_all_activity",{
        params:{
          token:localStorage.getItem("token")
        }
      });
      return request.data;
    } catch (e){
      throw e;
    }
  }

  const addToUserHistory = async (meetingCode) => {
  try {
    const response = await client.post("/add_to_activity", {
      token: localStorage.getItem("token"),
      meetingCode: meetingCode,
    });

    return response.data;
  } catch (err) {
    console.error("Error adding history:", err);
    throw err;
  }
};

  const value = useMemo(
  () => ({
    token,
    username,
    isAuthenticated: Boolean(token),
    register,
    login,
    logout,
    getHistoryOfUser,
    addToUserHistory,
    apiBaseUrl: API_BASE_URL,
  }),
  [token, username]
)

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
