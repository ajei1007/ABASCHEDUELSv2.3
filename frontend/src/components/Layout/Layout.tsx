import { useMemo, lazy, Suspense } from 'react';
import { useAppSelector } from 'store/hooks';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './Layout.module.scss';
import ErrorBoundary from 'components/ErrorBoundry';
import role_permissions from 'helpers/role_permissions';
import checkCompanyPlanFeature from 'utils/checkCompanyPlanFeature';

const ChatMessenger = lazy(
  () => import('@/features/ChatMessenger/ChatMessenger'),
);
const NpsSurvey = lazy(() => import('@/features/NpsSurvey/NpsSurvey'));

const Layout = ({
  sidebarElement,
  children,
  disableNpsSurvey = false,
}: {
  sidebarElement: React.ReactNode;
  children: React.ReactNode;
  disableNpsSurvey?: boolean;
}) => {
  const sidebarOpened = useAppSelector(
    (store) => store.navigation.sidebarOpened,
  );
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const membership = useAppSelector(
    (state) => state.settings?.settingsCompany?.company?.membership,
  );

  const hasAccessToChatMessenger = useMemo(
    () =>
      checkCompanyPlanFeature(membership, 'chat') &&
      role_permissions(currentUser, 'chatFeature') &&
      currentUser?.mattermostUser &&
      currentUser?.mattermostUser?.mattermostUserId,
    [currentUser, membership],
  );

  return (
    <div className={styles.root}>
      <div className={sidebarOpened ? styles.wrap : ''}>
        {sidebarElement}
        <Header />
        <ErrorBoundary>
          <main className={styles.content}>
            {children}
            <Footer />
          </main>
          {/* {role_permissions(currentUser, 'supportRequest') && (
            <ChatbotLLM />
          )} */}

          {hasAccessToChatMessenger && (
            <Suspense>
              <ChatMessenger />
            </Suspense>
          )}

          {!disableNpsSurvey && (
            <Suspense>
              <NpsSurvey />
            </Suspense>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Layout;
