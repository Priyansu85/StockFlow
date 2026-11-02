import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const login = async (username, password) => {
    const response = await api.post('/auth/login/', {
      username,
      password,
    })

    localStorage.setItem(
      'access_token',
      response.data.access
    )

    localStorage.setItem(
      'refresh_token',
      response.data.refresh
    )

    const userResponse = await api.get('/auth/me/')

    setUser(userResponse.data)

    return userResponse.data
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token')

    if (!accessToken) {
      setLoading(false)
      return
    }

    api.get('/auth/me/')
      .then((response) => {
        setUser(response.data)
      })
      .catch(() => {
        logout()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}