import { lazy, Suspense } from 'react';
import { Route, Navigate, Outlet } from 'react-router';
import {
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import {
  RequireNonAuth,
  RequireSuperAdmin,
  RequireAdmin,
  RequireUser,
} from './guards';
import { SuperAdminRoutes, AdminRoutes, UserRoutes } from './routes';
import LayoutComponent from 'components/Layout/Layout';
import Sidebar from 'components/Sidebar/Sidebar';
import SuperAdminSidebar from 'components/Sidebar/SuperAdminSidebar';
import Loader from 'components/Loader/Loader';
import FallbackComponent from 'components/FallbackComponent/FallbackComponent';

const Login = lazy(() => import('pages/auth/login/Login'));
const Starter = lazy(() => import('pages/starter/Starter'));
const ForgotPassword = lazy(
  () => import('pages/auth/forgot-password/ForgotPassword'),
);
const ResetPassword = lazy(
  () => import('pages/auth/reset-password/ResetPassword'),
);
const Register = lazy(() => import('pages/auth/register/Register'));
const CreateCompany = lazy(
  () => import('pages/auth/create-company/CreateCompany'),
);
const SchedulerConfirmation = lazy(
  () => import('pages/verifications/SchedulerConfirmation'),
);
const ErrorPage = lazy(() => import('pages/error/ErrorPage'));

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      errorElement={<FallbackComponent />}
      element={
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      }
    >
      <Route
        path=''
        errorElement={<FallbackComponent />}
        element={
          <LayoutComponent sidebarElement={<Sidebar />}>
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          </LayoutComponent>
        }
      >
        <Route path='' element={<Navigate to='/admin/scheduler' replace />} />
        <Route path='app' element={<Navigate to='/app/dashboard' replace />} />
        <Route
          path='app/*'
          errorElement={<FallbackComponent />}
          element={
            <RequireUser>
              <UserRoutes />
            </RequireUser>
          }
        />
        <Route
          path='admin/*'
          errorElement={<FallbackComponent />}
          element={
            <RequireAdmin>
              <AdminRoutes />
            </RequireAdmin>
          }
        />
      </Route>
      <Route
        path='superadmin'
        errorElement={<FallbackComponent />}
        element={
          <RequireSuperAdmin>
            <LayoutComponent
              sidebarElement={<SuperAdminSidebar />}
              disableNpsSurvey={true}
            >
              <Suspense fallback={<Loader />}>
                <Outlet />
              </Suspense>
            </LayoutComponent>
          </RequireSuperAdmin>
        }
      >
        <Route path='' element={<Navigate to='companies' replace />} />
        <Route
          path='*'
          errorElement={<FallbackComponent />}
          element={<SuperAdminRoutes />}
        />
      </Route>
      <Route
        path='starter'
        errorElement={<FallbackComponent />}
        element={
          <RequireNonAuth>
            <Starter />
          </RequireNonAuth>
        }
      />
      <Route
        path='login'
        errorElement={<FallbackComponent />}
        element={
          <RequireNonAuth>
            <Login />
          </RequireNonAuth>
        }
      />
      <Route
        path='register'
        errorElement={<FallbackComponent />}
        element={
          <RequireNonAuth>
            <Register />
          </RequireNonAuth>
        }
      />
      <Route
        path='create-company'
        errorElement={<FallbackComponent />}
        element={
          <RequireNonAuth>
            <CreateCompany />
          </RequireNonAuth>
        }
      />
      <Route
        path='forgot-password'
        errorElement={<FallbackComponent />}
        element={
          <RequireNonAuth>
            <ForgotPassword />
          </RequireNonAuth>
        }
      />
      <Route
        path='password-reset'
        errorElement={<FallbackComponent />}
        element={
          <RequireNonAuth>
            <ResetPassword />
          </RequireNonAuth>
        }
      />
      {/* TODO Make them protected */}
      <Route
        path='confirmation'
        errorElement={<FallbackComponent />}
        element={<SchedulerConfirmation />}
      />
      <Route path='error' element={<ErrorPage />} />
      <Route path='*' element={<Navigate to='/app/dashboard' replace />} />
      <Route path='*' element={<Navigate to='/error' replace />} />
    </Route>,
  ),
);
