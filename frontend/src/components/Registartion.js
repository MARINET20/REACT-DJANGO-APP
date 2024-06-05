import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { API_URL } from '..';
import AuthContext from './AuthContext'


function Registration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [message, setMessage] = useState('');
    

    const history = useNavigate();

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setIsValid(validatePassword(newPassword));
    };

    let handleVerifyCode = async (e) => {
        e.preventDefault();
                
        try {
            const response = await fetch(`${API_URL}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, verificationCode, password }),
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                history('/login');
            } else {
                const errorData = await response.json();
                alert(errorData.error);
            }
        } catch (error) {
            alert('Произошла ошибка при отправке запроса');
        }
    };

    let handleSendCode = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });
            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                setIsCodeSent(true);
            } else {
                const data = await response.json();
                alert(data.error);
            }         
        }
        catch (error) {
            if (error.response && error.response.status === 404) {
                alert('Такого пользователя нет в системе!');
            }
        }
    }

    
    return (
        <AuthContext.Consumer>
        {({ user }) => (
        <div className="container">
            { !user && (
            <div>
                <div className='pt-30'>
                    <h1 className="m-0" style={{color: '#00AEEF'}}>Восстановить пароль</h1>
                </div>
                <div className='form_tabs'>
                    <section >
                        <p className="form__paragraf">Укажите данные корпоративной учетной записи</p>
                            <div className="mt-3">
                                <label htmlFor="EMAIL_AUTH" className="form__label">Email (логин)<font color="red"><span className="form-required starrequired">* </span></font></label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="EMAIL_AUTH" 
                                    className="form-control mt-2" 
                                    placeholder="i.i.ivanov@yandex.ru" 
                                    value={email} onChange={(e) => setEmail(e.target.value)} required tabIndex="0"/>
                            </div>
                            <div className="mt-2">
                                <label htmlFor="PASSWORD_AUTH" className="form__label">Введите новый пароль<font color="red"><span className="form-required starrequired">*</span></font></label>
                                <input
                                    type="password"
                                    className="form-control mt-2"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    placeholder="Введите новый пароль"
                                />
                                {isValid ? null : <p style={{ color: 'red' }}>Пароль должен состоять не менее чем из 8 и не более 14 букв латинского алфавита и арабских цифр, включая символы </p>}
                            </div>
                            {isCodeSent ? (
                                <div className="mt-3">
                                    <label htmlFor="VERIFICATION_CODE" className="form__label">Код подтверждения<font color="red"><span className="form-required starrequired">* </span></font></label>
                                    <input type="text" name="VERIFICATION_CODE" id="VERIFICATION_CODE" className="form__input" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required tabIndex="0"/>
                                </div>
                            ) : null}
                            <div className="mt-2">
                                {isCodeSent ? (
                                    <button onClick={handleVerifyCode} className="btn btn-primary mt-2" type="submit">Подтвердить код</button>
                                ) : (
                                    <button onClick={handleSendCode} className="btn btn-primary mt-2" type="submit">Восстановить пароль</button>
                                )}
                            </div>
                            <a href='/login' style={{ marginTop: "5px", textDecorationLine: 'none' }}>
                                <p className="m-0" style={{ color: "#00aeef", cursor: 'pointer' }}><small>Перейти к авторизации</small></p>
                            </a>
                    </section>
                </div>
            </div>
            )}
        </div>
        )}
        </AuthContext.Consumer>
    )
}

export default Registration