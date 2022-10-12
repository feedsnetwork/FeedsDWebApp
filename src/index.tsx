import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import 'nprogress/nprogress.css';

import App from './App';
import { SidebarProvider } from 'contexts/SidebarContext';
import { OverPageProvider } from 'contexts/OverPageContext';
import { store } from './redux/store';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <ReduxProvider store={store}>
    <SidebarProvider>
      <OverPageProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </OverPageProvider>
    </SidebarProvider>
  </ReduxProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
