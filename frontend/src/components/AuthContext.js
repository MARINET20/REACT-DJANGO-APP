import React, { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '..';

const AuthContext = createContext()

export default AuthContext;

export const AuthProvider = ({children}) => {

    let [user, setUser] = useState(() => (localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')) : null))
    let [authTokens, setAuthTokens] = useState(() => (localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null))
    let [loading, setLoading] = useState(true)
    const [userData, setUserData] = useState(null)

    const history = useNavigate();
    
    let loginUser = async (e) => {
        e.preventDefault()
        const response = await fetch(`${API_URL}/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: e.target.email.value, password: e.target.password.value })
        });

        let res  = await response.json();

        if(res){
            localStorage.setItem('authTokens', JSON.stringify(res));
            setAuthTokens(res)
            const decodedUser = jwtDecode(res.access);
            setUser(decodedUser);
            

            history('/login');
        } else {
            localStorage.removeItem('authTokens')
            alert('Что-то пошло не так при входе в систему пользователя!')
        }
    }

    let logoutUser = (e) => {
        e.preventDefault()
        localStorage.removeItem('authTokens')
        setAuthTokens(null)
        setUser(null)
        setUserData(null)
        history('/login');
    }

    let removeItem = (e) => {
        e.preventDefault()
        localStorage.removeItem('authTokens')
        history('/registration')
    }

    let updateToken = async () => {
        const response = await fetch(`${API_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({refresh:authTokens?.refresh})
        })
       
        const data = await response.json()
        if (response.status === 200) {
            setAuthTokens(data)
            setUser(jwtDecode(data.access))
            localStorage.setItem('authTokens',JSON.stringify(data))

        } else {
            logoutUser()
        }

        if(loading){
            setLoading(false)
        }
    }

    let contextData = {
        user: user,
        userData: userData,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
        removeItem: removeItem,
    }

    // useEffect(()=>{
    //     if(loading){
    //         updateToken()
    //     }

    //     let REFRESH_INTERVAL = 1000 * 60 * 20// 20 minutes
    //     let interval = setInterval(()=>{
    //         if(authTokens){
    //             updateToken()
    //         }
    //     }, REFRESH_INTERVAL)
    //     return () => clearInterval(interval)

    // },[authTokens, loading])

    

    return(
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}