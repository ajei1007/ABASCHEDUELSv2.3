import React from 'react';
import s from './Widget.module.scss';
// @ts-ignore
import classNames from 'classnames';

type WidgetTypes = {
  title?: string | JSX.Element | null,
  className?: string,
  headerClass?: string,
  sectionClass?: string,
  children?: any,
}

const Widget = (props: WidgetTypes) => {

  const {
    title = null,
    className = '',
    headerClass = '',
    sectionClass = '',
    children = [],
  } = props;

  return (
    <React.Fragment>
      <section className={classNames(s.widget, sectionClass)}>
        {title && (
          <div className={classNames(headerClass, s.title)}>
            {title}
          </div>)}
        <div className={className}>
          {children}
        </div>
      </section>
    </React.Fragment>
  )
}

export default Widget;
