import FooterIcon from '../Icons/FooterIcon';
import s from './Footer.module.scss';
import config from 'config';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

const Footer = () => {
  const { companyLabel, companySlogan } = config;
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    getAppVersion();
  }, []);

  const getAppVersion = async () => {
    const response = await fetch('/meta.json');
    const { version } = await response.json();
    if (version) {
      setAppVersion(version);
    }
  };
  return (
    <div className={s.footer}>
      <div className={s.footerContainer}>
        <span className={s.footerLabel}>
          2024 &copy; {companyLabel} &#xae; {companySlogan}
        </span>
        <FooterIcon />
        {appVersion && (
          <Typography fontSize='.8rem' color='#6b859e' pl='4px'>
            v{appVersion}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default Footer;
