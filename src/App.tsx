import { useRoutes } from 'react-router-dom';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { CssBaseline } from '@mui/material';

import router from 'router';
import ThemeProvider from './theme/ThemeProvider';
import NotistackProvider from './components/NotistackProvider';

function App() {
  const content = useRoutes(router);
  console.log(import.meta.url)
  return (
    <ThemeProvider>
      <NotistackProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          {content}
        </LocalizationProvider>
      </NotistackProvider>
    </ThemeProvider>
  );
}
export default App;
