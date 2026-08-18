/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Bounce, ToastContainer } from 'react-toastify';
import { router } from 'router';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  fetchCompanySettings,
  fetchUserSettings,
} from 'store/actions/settingsActions';
import { getNotifications } from 'store/actions/notifications';
import { useAppDispatch } from 'store/hooks';
import 'react-toastify/dist/ReactToastify.css';
import './styles/app.scss';
import RefreshBanner from 'components/RefreshBanner/RefreshBanner';
import { useVersionChecker } from 'hooks/useVersionChecker';
import { useAppCrash } from 'hooks/useAppCrash';

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: 'Poppins, sans-serif',
    },
  },
  components: {
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: '30px',
          fontFamily: 'Poppins, sans-serif',
          color: '#16365f',
          borderColor: '#c7d0d9',
        },
        deleteIcon: {
          color: '#c7d0d9',
          ':hover': {
            color: '#6b859e',
          },
        },
      },
    },
  },
});

const BANNER_HEIGHT = 52;

const App = () => {
  const { updateAvailable, dismiss } = useVersionChecker();
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const loadingInit = useTypedSelector((store) => store.auth.loadingInit);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchCompanySettings());
      dispatch(fetchUserSettings());
      dispatch(getNotifications());
    }
  }, [currentUser]);

  const refreshPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--banner-height',
      updateAvailable ? `${BANNER_HEIGHT}px` : '0px',
    );
  }, [updateAvailable]);

  // Crash hook for testing error boundaries,
  // NOTE: works only in dev or beta environments
  useAppCrash({
    crashFnName: 'crashApp',
    errorMessage: 'App crashed!',
  });

  if (loadingInit) return <div />;
  return (
    <ThemeProvider theme={theme}>
      <ToastContainer
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        transition={Bounce}
        stacked
      />
      <RefreshBanner
        open={updateAvailable}
        onRefresh={refreshPage}
        onClose={dismiss}
      />
      <RouterProvider router={router} />
      <div className='customTooltip'></div>
    </ThemeProvider>
  );
};

export default App;
