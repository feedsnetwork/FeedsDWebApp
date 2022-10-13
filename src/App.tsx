import { useRoutes } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CssBaseline } from '@mui/material';
import { useWorker } from 'react-hooks-worker';

import router from './router';
import ThemeProvider from './theme/ThemeProvider';
import NotistackProvider from './components/NotistackProvider';

const createWorker = () => new Worker(new URL('./db.worker', import.meta.url));

function App() {
  const content = useRoutes(router);
  const { result, error } = useWorker(createWorker, 20);

  console.log(result)
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
