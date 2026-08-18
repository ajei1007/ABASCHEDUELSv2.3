import { useState } from 'react';
import { NavLink } from 'react-router-dom';
// @ts-ignore
import classnames from 'classnames';
import styles from './LinksGroup.module.scss';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Collapse } from '@mui/material';

type LinksGroupProps = {
  header?: string;
  link?: string;
  childrenLinks?: Array<{}>;
  iconName?: JSX.Element;
  className?: string;
  activeItem?: string;
  isHeader?: boolean;
  index?: string;
  deep?: number;
  onActiveSidebarItemChange?: (activeItem: string) => void;
  onClickSidebarItemChange?: (activeItem: string) => void;
  exact?: boolean;
  target?: string;
  dataQa?: string;
};

const LinksGroup = (props: LinksGroupProps) => {
  const {
    header,
    link = '',
    childrenLinks = null,
    iconName,
    className = '',
    activeItem = '',
    isHeader = false,
    index,
    deep = 0,
    onActiveSidebarItemChange,
    onClickSidebarItemChange,
    exact = true,
    target,
  } = props;
  const [headerLinkWasClicked, setHeaderLinkWasClicked] = useState(false);

  const togglePanelCollapse = (link: string) => {
    if (onActiveSidebarItemChange) {
      onActiveSidebarItemChange(link);
    }
    if (onClickSidebarItemChange) {
      onClickSidebarItemChange('l');
    }
    setHeaderLinkWasClicked(
      (prevState) =>
        !prevState || (!!activeItem && !activeItem.includes(index!)),
    );
  };

  const isOpen = index ? headerLinkWasClicked : false;

  if (!childrenLinks) {
    if (isHeader) {
      return (
        <li className={[styles.headerLink, className].join(' ')}>
          <NavLink
            to={link}
            className={({ isActive }) => {
              return isActive ? styles.headerLinkActive : undefined;
            }}
            end={exact}
            target={target}
            style={{
              marginLeft: `${deep * 8}px`,
            }}
            data-qa={props.dataQa}
          >
            <span className={styles.icon}>{iconName}</span>
            {header}
          </NavLink>
        </li>
      );
    }
    return (
      <li>
        <NavLink
          to={link}
          className={({ isActive }) => {
            return isActive ? styles.headerLinkActive : undefined;
          }}
          onClick={(e: any) => {
            if (link.includes('menu')) {
              e.preventDefault();
            }
          }}
          end={exact}
          style={{
            marginLeft: `${deep * 8}px`,
          }}
          data-qa={props.dataQa}
        >
          <FiberManualRecordIcon
            sx={{
              color: '#4d53e0',
              fontSize: '12px',
              mr: '.5rem',
              textAlign: 'center',
            }}
          />
          {header}
        </NavLink>
      </li>
    );
  }
  return (
    <li className={classnames({ [styles.headerLink]: isHeader }, className)}>
      <a
        className={classnames(
          styles.accordionToggle,
          { [styles.collapsed]: isOpen },
          'd-flex',
        )}
        style={{
          marginLeft: `${deep * 8}px`,
        }}
        onClick={() => togglePanelCollapse(link)}
        href='#top'
        data-qa={props.dataQa}
      >
        {isHeader ? <span className={styles.icon}>{iconName}</span> : null}
        {header}{' '}
        <ChevronRightRoundedIcon
          className={classnames([styles.caret, isOpen && styles.rotate])}
        />
      </a>
      <Collapse in={isOpen} timeout={250} className={styles.panel}>
        <ul>
          {childrenLinks &&
            childrenLinks.map(
              (child: LinksGroupProps, ind): JSX.Element | null => (
                <LinksGroup
                  onActiveSidebarItemChange={onActiveSidebarItemChange}
                  activeItem={activeItem}
                  header={child.header}
                  isHeader={child.isHeader}
                  iconName={child.iconName}
                  link={child.link}
                  index={child.index}
                  childrenLinks={child.childrenLinks}
                  deep={deep + 1}
                  key={ind}
                  dataQa={child.dataQa}
                />
              ),
            )}
        </ul>
      </Collapse>
      {/* <CustomCollapse isOpen={isOpen}></CustomCollapse> */}
    </li>
  );
};

export default LinksGroup;
