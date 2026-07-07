import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import '@/styles/globals.css';
import '@/styles/animation.css';
import { store } from './store/store.js';
import '@/styles/utilities.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Add a class to body for initial setup
document.body.classList.add('is-loaded');

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);