import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';


// поменять api django
export const API_URL = "http://127.0.0.1:8000/api"
export const URL = "http://127.0.0.1:8000"
// export const API_URL = "http://172.20.10.21:8000/api"
// export const URL = "http://172.20.10.21:8000"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);

reportWebVitals();
