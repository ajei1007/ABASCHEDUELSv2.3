import { lazy } from 'react';
import { Routes, Route } from 'react-router';
import lazyWithRetry from '../../utils/lazyWithRetry';

const UsersFormPage = lazyWithRetry(
  () => import('pages/CRUD/Users/form/UsersFormPage'),
);
const Dashboard = lazyWithRetry(() => import('pages/dashboard/Dashboard'));
const ChangePasswordFormPage = lazy(
  () => import('pages/users/change-password/ChangePasswordFormPage'),
);
const FaqViewPage = lazyWithRetry(() => import('pages/faq/FaqPage'));

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path={'dashboard'} element={<Dashboard />} />
      <Route path={'user'} element={<UsersFormPage />} />
      <Route path={'password'} element={<ChangePasswordFormPage />} />
      <Route path={'faq'} element={<FaqViewPage />} />
    </Routes>
  );
}
