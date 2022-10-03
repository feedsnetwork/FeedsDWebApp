import ReactDOM from 'react-dom';
// import { HelmetProvider } from 'react-helmet';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './redux/store';

import 'nprogress/nprogress.css';
import App from 'src/App';
import { SidebarProvider } from 'src/contexts/SidebarContext';
import { OverPageProvider } from 'src/contexts/OverPageContext';
import * as serviceWorker from 'src/serviceWorker';

ReactDOM.render(
  // <HelmetProvider>
  <ReduxProvider store={store}>
    <SidebarProvider>
      <OverPageProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </OverPageProvider>
    </SidebarProvider>
  </ReduxProvider>,
  // </HelmetProvider>,
  document.getElementById('root')
);

serviceWorker.unregister();
