import type { FC } from 'react';
import { Link } from 'react-router-dom';

import s from './Starter.module.scss';
import CustomButton from 'components/Button';
import config from 'config';

const Starter: FC = () => {
  const { companyLabel, companyLogo } = config;

  return (
    <div className={s.root}>
      <div className={s.starterBlock}>
        <img src={companyLogo} alt={companyLabel} />
        <h3 className='my-3 align-self-center'>Welcome to {companyLabel}!</h3>
        <div className={s.buttons}>
          <Link to={'/login'}>
            <CustomButton>Login</CustomButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Starter;
