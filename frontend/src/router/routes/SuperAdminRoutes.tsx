import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router';
import lazyWithRetry from '../../utils/lazyWithRetry';
import Loader from 'components/Loader/Loader';
import FallbackComponent from 'components/FallbackComponent/FallbackComponent';

const CompaniesTablePage = lazy(
  () => import('pages/CRUD/Companies/table/CompaniesTablePage'),
);
const CompaniesViewPage = lazy(
  () => import('pages/CRUD/Companies/page/CompaniesViewPage'),
);
const CompaniesFormPage = lazy(
  () => import('pages/CRUD/Companies/form/CompaniesFormPage'),
);
const NpsStatisticsWrapperPage = lazyWithRetry(
  () => import('pages/nps-statistics/_wrapper/NpsStatisticsWrapperPage'),
);
const NpsStatisticsPage = lazyWithRetry(
  () => import('pages/nps-statistics/index/NpsStatisticsPage'),
);
const NpsStatisticsResponsesPage = lazyWithRetry(
  () => import('pages/nps-statistics/responses/NpsStatisticsResponsesPage'),
);

const OptimizerActionLogsPage = lazyWithRetry(
  () => import('pages/optimizer/action-logs/OptimizerActionLogsPage'),
);

export default function SuperAdminRoutes() {
  return (
    <Routes>
      <Route
        path='nps-statistics'
        errorElement={<FallbackComponent />}
        element={
          <Suspense fallback={<Loader />}>
            <NpsStatisticsWrapperPage>
              <Outlet />
            </NpsStatisticsWrapperPage>
          </Suspense>
        }
      >
        <Route path={''} element={<NpsStatisticsPage />} />
        <Route path={'responses'} element={<NpsStatisticsResponsesPage />} />
      </Route>

      <Route path={'companies'} element={<CompaniesTablePage />} />
      <Route path={'companies/new'} element={<CompaniesFormPage />} />
      <Route path={'companies/:id/edit'} element={<CompaniesFormPage />} />
      <Route path={'companies/:id'} element={<CompaniesViewPage />} />

      <Route
        path={'optimizer/action-logs'}
        element={<OptimizerActionLogsPage />}
      />
    </Routes>
  );
}
