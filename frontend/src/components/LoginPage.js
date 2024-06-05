import React, {useContext} from 'react'
import {
  BrowserRouter as Router,
  Navigate ,
} from "react-router-dom";
import AuthContext from './AuthContext'
import ProfilePage from './ProfilePage'

const LoginPage = () => {

    let {loginUser} = useContext(AuthContext)
    let { user, removeItem } = useContext(AuthContext)
    
    return (
        <div>
            {user ? <Navigate to="/profile" /> : (
                <div className="container">
                    <div className='pt-30'>
                        <h1 className="m-0" style={{color: '#00AEEF'}}>Вход в личный кабинет</h1>
                    </div>
                    <form onSubmit={loginUser}>
                        <input type="text" name="email" className="form-control" placeholder="Почта" />
                        <input type="password" name="password" className="form-control mt-3" placeholder="Пароль" />
                        <button type="submit" className="btn btn-primary mt-3">Войти</button>
                    </form>
                    <a href='/registration' style={{ marginTop: "5px", textDecorationLine: 'none' }}>
                        <p className="m-0" style={{ color: "#00aeef", cursor: 'pointer' }} onClick={removeItem}><small>Забыли пароль? Перейти к восстановлению пароля</small></p>
                    </a>
                </div>
            )}
            {user ? <ProfilePage /> : <Navigate to="/login" />}
        </div>
  );
}

export default LoginPage
