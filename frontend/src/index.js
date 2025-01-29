import React from 'react';
import ReactDOM from 'react-dom/client'; // Notice the import change here
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App';
import { TaskProvider } from './context/TaskContext';

const root = ReactDOM.createRoot(document.getElementById('root')); // createRoot instead of render

root.render(
  <TaskProvider>
  <BrowserRouter> {/* Wrap your app with BrowserRouter */}
    <App />
  </BrowserRouter>
  </TaskProvider>
);
