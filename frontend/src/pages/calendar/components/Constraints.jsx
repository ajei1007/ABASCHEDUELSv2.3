import React from 'react';
import s from './Calendar.module.scss';

class Constraints extends React.Component {
  constructor(props) {
    super(props);
    this.state = { date: new Date(), events: [] };
  }

  render() {
    return (
      <div>
        {this.props.Constraints.map((event) => {
          return (
            <div
              id={event.id}
              data-event={
                '{ "classNames": ["bg-gray", "text-red"], "title": "' +
                event.title +
                '" }'
              }
              className='external-event draggable'
            >
              <div className={s.customExternalEvent}>
                <i
                  style={{ color: this.props.color }}
                  id='maketea1'
                  className='fa fa-circle fa-fw ml-xs mr-xs'
                />
                {event.title}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default Constraints;
