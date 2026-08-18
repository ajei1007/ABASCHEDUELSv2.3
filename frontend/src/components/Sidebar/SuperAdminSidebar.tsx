import { useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import styles from './Sidebar.module.scss';
import LinksGroup from './LinksGroup/LinksGroup';
import { changeActiveSidebarItem } from '../../store/actions/navigationActions';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import classnames from 'classnames';
import config from 'config';
import BusinessIcon from '@mui/icons-material/Business';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

const SuperAdminSidebar = () => {
  const dispatch = useAppDispatch();
  const navEl: any = useRef(null);
  const sidebarOpened = useAppSelector(
    (store) => store.navigation.sidebarOpened,
  );
  const activeItem = useAppSelector((store) => store.navigation.activeItem);
  const { companyLabel, companyLogo } = config;

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

      <ul className={styles.nav}>
        <LinksGroup
          key={'companies'}
          onActiveSidebarItemChange={(activeItem) =>
            dispatch(changeActiveSidebarItem(activeItem))
          }
          activeItem={activeItem}
          header='Companies'
          link='/superadmin/companies'
          isHeader
          iconName={<BusinessIcon />}
          index='companies'
        />
        <LinksGroup
          key={'nps-statistics'}
          onActiveSidebarItemChange={(activeItem) =>
            dispatch(changeActiveSidebarItem(activeItem))
          }
          activeItem={activeItem}
          header='NPS Statistics'
          link='/superadmin/nps-statistics'
          isHeader
          iconName={<StackedLineChartIcon />}
          index='npsStatistics'
        />
        <LinksGroup
          key={'optimizerActionLogs'}
          onActiveSidebarItemChange={(activeItem) =>
            dispatch(changeActiveSidebarItem(activeItem))
          }
          activeItem={activeItem}
          header='Optimizer Action Logs'
          link='/superadmin/optimizer/action-logs'
          isHeader
          iconName={
            <FormatListBulletedIcon
              sx={{
                fontSize: '1.25rem!important',
              }}
            />
          }
          index='optimizerActionLogs'
        />
      </ul>
    </nav>
  );
};

export default SuperAdminSidebar;
