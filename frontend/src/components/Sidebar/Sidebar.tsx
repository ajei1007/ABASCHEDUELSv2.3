import { useMemo, useRef, lazy, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import styles from './Sidebar.module.scss';
import LinksGroup from './LinksGroup/LinksGroup';
import { fetchSubgroups } from 'store/slices/calendar/thunks';
import { changeActiveSidebarItem } from '../../store/actions/navigationActions';
import role_permissions from 'helpers/role_permissions';
// Side bar link Icons
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EventIcon from '@mui/icons-material/Event';
import classnames from 'classnames';
import config from 'config';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import frontendRoles from 'constants/frontendRoles';
import checkCompanyPlanFeature from 'utils/checkCompanyPlanFeature';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import isRoleOrHigher from 'helpers/roleHierarchy';

const OnboardingChecklistProgress = lazy(
  () =>
    import(
      '@/features/OnboardingChecklistProgress/OnboardingChecklistProgress'
    ),
);

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const navEl: any = useRef(null);
  const sidebarOpened = useAppSelector(
    (store) => store.navigation.sidebarOpened,
  );
  const activeItem = useAppSelector((store) => store.navigation.activeItem);
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const storeSubgroups = useAppSelector((store) => store.calendar.subgroups);
  const membership = useAppSelector(
    (state) => state.settings.settingsCompany.company.membership,
  );
  const { companyLabel, companyLogo } = config;

  const constraintsLinks = useMemo(() => {
    const arr = [
      //{header:'Match', link: '/admin/matches'},
      //{header:'Data', link: '/admin/dataconstraints'},
      //{ header: 'Capacity', link: '/admin/capacityconstraints' },
      // { header: 'Priorities', link: '/admin/priorities' },
      { header: 'Totals', link: '/admin/totaltypes' },
      // { header: 'Tags Custom', link: '/admin/tags' },
      //{header:'Distance', link: '/admin/distanceconstraints'},
      //{header:'Time', link: '/admin/timeconstraints'},
      //{header:'Time - Employee', link: '/admin/employees_timeconstraints'},
      //{header:'Time - Client', link: '/admin/clients_timeconstraints'},
    ];
    if (checkCompanyPlanFeature(membership, 'customConstraintBuilder')) {
      arr.push({ header: 'Custom', link: '/admin/custom' });
    }
    return arr;
  }, [membership, currentUser?.internalAdmin]);

  return (
    <nav
      ref={navEl}
      className={classnames(styles.root, {
        [styles.rootOpened]: sidebarOpened,
      })}
      // style={{ padding: sidebarOpened ? '0 8px' : 0 }}
    >
      <header className={styles.header}>
        <h4 style={{ paddingLeft: '0.5rem' }}>{companyLabel}</h4>
      </header>
      <div className={styles.logo}>
        <img src={companyLogo} width={120} height={120} alt={companyLabel} />
      </div>

      <Suspense>
        <OnboardingChecklistProgress />
      </Suspense>

      <ul className={styles.nav}>
        <LinksGroup
          key={'dashboard'}
          onActiveSidebarItemChange={(activeItem) =>
            dispatch(changeActiveSidebarItem(activeItem))
          }
          activeItem={activeItem}
          header='Dashboard'
          isHeader
          iconName={<DashboardOutlinedIcon />}
          link='/app/dashboard'
          index='dashboard'
          dataQa='navbar-home'
        />
        {currentUser && isRoleOrHigher(currentUser.role, 'admin') && (
          <LinksGroup
            key={'scheduler'}
            onActiveSidebarItemChange={(activeItem) =>
              dispatch(changeActiveSidebarItem(activeItem))
            }
            activeItem={activeItem}
            header='Scheduler'
            link='/admin/scheduler'
            isHeader
            iconName={<CalendarMonthOutlinedIcon />}
            index='scheduler'
            dataQa='navbar-scheduler'
          />
        )}
        {/* Statistics Service */}
        {currentUser &&
          isRoleOrHigher(currentUser.role, 'admin') &&
          role_permissions(currentUser, 'viewReport') && (
            <LinksGroup
              key='reports'
              onActiveSidebarItemChange={(activeItem) =>
                dispatch(changeActiveSidebarItem(activeItem))
              }
              activeItem={activeItem}
              header='Reports'
              link='/admin/reports'
              isHeader
              iconName={<InsightsOutlinedIcon />}
              index='reports'
              dataQa='reports-container'
              childrenLinks={[
                {
                  header: 'Statistics',
                  link: '/admin/statistics',
                  isHeader: true,
                  index: 'cancellations',
                  iconName: <InsertChartOutlinedIcon />,
                  dataQa: 'reports-statistics-tab',
                },
                {
                  header: 'Events',
                  link: '/admin/events',
                  isHeader: true,
                  index: 'cancellations',
                  iconName: <EventIcon />,
                },
                {
                  header: 'Cancellations',
                  link: '/admin/cancellations',
                  isHeader: true,
                  index: 'cancellations',
                  iconName: <EventBusyIcon />,
                  childrenLinks: [
                    { header: 'Data', link: '/admin/cancellations' },
                    { header: 'Types', link: '/admin/cancellationtypes' },
                  ],
                },
              ]}
            />
          )}
        {/* Distance Matrix */}
        {false && currentUser && isRoleOrHigher(currentUser.role, 'admin') && (
          <LinksGroup
            // key='distanceMatrix'
            onActiveSidebarItemChange={(activeItem) => {
              console.log(activeItem);
              dispatch(changeActiveSidebarItem(activeItem));
            }}
            activeItem={activeItem}
            header='Distance Matrix'
            link='/admin/distancematrix'
            isHeader
            iconName={<ExploreOutlinedIcon />}
            index='distance'
            childrenLinks={[
              {
                header: 'Data',
                link: '/admin/distancematrix',
              },
            ]}
          />
        )}

        {currentUser &&
          currentUser &&
          isRoleOrHigher(currentUser.role, 'admin') &&
          role_permissions(currentUser, 'viewBranch') && (
            <LinksGroup
              onActiveSidebarItemChange={(activeItem) => {
                console.log(activeItem);
                dispatch(changeActiveSidebarItem(activeItem));
              }}
              activeItem={activeItem}
              header='Branches'
              link='/admin/branches'
              isHeader
              iconName={<HomeOutlinedIcon />}
              index='branches'
              childrenLinks={[
                {
                  header: 'Data',
                  link: '/admin/branches',
                },
                ...(currentUser?.internalAdmin
                  ? [
                      {
                        header: 'Types',
                        link: '/admin/branchtype',
                      },
                    ]
                  : []),
              ]}
            />
          )}
        {currentUser &&
          currentUser &&
          isRoleOrHigher(currentUser.role, 'admin') &&
          role_permissions(currentUser, 'viewConstraint') && (
            <LinksGroup
              key={'constraints'}
              onActiveSidebarItemChange={(activeItem) =>
                dispatch(changeActiveSidebarItem(activeItem))
              }
              activeItem={activeItem}
              header='Constraints'
              link='/admin/groupings'
              isHeader
              iconName={<BoltOutlinedIcon />}
              index='constraints'
              childrenLinks={constraintsLinks}
            />
          )}

        {currentUser &&
          currentUser &&
          isRoleOrHigher(currentUser.role, 'admin') &&
          role_permissions(currentUser, 'viewSubgroup') &&
          role_permissions(currentUser, 'viewReport') && (
            <LinksGroup
              key={'groupings'}
              onActiveSidebarItemChange={(activeItem) =>
                dispatch(changeActiveSidebarItem(activeItem))
              }
              activeItem={activeItem}
              header='Groups'
              link='/admin/groupings'
              isHeader
              iconName={<Inventory2OutlinedIcon />}
              index='groups'
              onClickSidebarItemChange={() => {
                if (Object.keys(storeSubgroups).length === 0) {
                  dispatch(fetchSubgroups());
                }
              }}
              childrenLinks={[
                {
                  header: 'Data',
                  link: '/admin/groupings',
                },
                {
                  header: 'Tags',
                  isHeader: true,
                  link: '/admin/tags',
                  index: 'tags',
                  iconName: <LabelOutlinedIcon />,
                  childrenLinks: Object.keys(storeSubgroups)
                    .sort((a: any, b: any) => a.localeCompare(b))
                    .filter(
                      (f: any) =>
                        f !== 'Funders' && f !== 'Funder' && f !== 'Matching',
                    )
                    .map((s: any) => {
                      return {
                        header: s,
                        link: `/admin/subgroups/groupings/${s}`,
                      };
                    }),
                },
              ]}
            />
          )}
        {currentUser &&
          currentUser &&
          isRoleOrHigher(currentUser.role, 'admin') &&
          frontendRoles.map((roles: any) => {
            const role = roles.name;
            const icon = roles.icon;

            let children_arr = [];
            if (role_permissions(currentUser, 'viewUser')) {
              children_arr.push({
                header: 'Data',
                link: `/admin/users/resources/${role}`,
              });
            }
            if (role_permissions(currentUser, 'viewAvailability')) {
              children_arr.push({
                header: 'Availability',
                link: `/admin/availabilities/resources/${role}`,
              });
            }
            if (
              role_permissions(currentUser, 'viewRole') &&
              (role === 'Employee' || role === 'Client' || role === 'Location')
            ) {
              children_arr.push({
                header: 'Roles',
                link: `/admin/roles/resources/${role}`,
              });
            }
            if (children_arr.length === 0) return null;
            return (
              <LinksGroup
                key={`roles${role}`}
                onActiveSidebarItemChange={(activeItem) => {
                  dispatch(changeActiveSidebarItem(activeItem));
                }}
                activeItem={activeItem}
                header={`${role}`}
                link={`/admin/users/resources/${role}`}
                isHeader
                iconName={icon ? icon : <PeopleAltOutlinedIcon />}
                index='employees'
                childrenLinks={children_arr}
                dataQa={`navbar-${role.toLowerCase()}s`}
              />
            );
          })}
      </ul>
    </nav>
  );
};

export default Sidebar;
