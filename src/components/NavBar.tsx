import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useJob from '../hooks/useJob';
import logo from '../logo.png';
import { defaultJobState } from '../interfaces/Job.interface';
import '../styles/nav-bar.scss';

function NavBar() {
  const [t] = useTranslation();
  const { job, setJob } = useJob();
  // const twitterLink = encodeURI(`https://twitter.com/intent/tweet?text=${t('commons.title')}\n\nhttps://video-cutter.tools`);
  const twitterLink = encodeURI(`https://twitter.com/LinkCisss/tweet?text=${t('commons.title')}\n\nhttps://video-cutter.tools`);
  // const facebookLink = encodeURI(`https://www.facebook.com/sharer/sharer.php?u=https://video-cutter.tools`);
  const facebookLink = encodeURI(`  https://www.facebook.com/profile.php?id=100020215650627?u=https://video-cutter.tools`);

  function goToMain() {
    setJob({ ...job, ...defaultJobState });
  }
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={goToMain}>
        <img src={logo} alt="logo" /> {t('title')}
      </Link>

      <span className="navbar-text text-monospace d-none d-md-block">{t('commons.descriptionShort')}</span>

      <ul className="navbar-nav ml-auto">
        <li className="nav-item d-flex align-items-center">
          <a className="btn btn-link btn-lg" href={twitterLink} rel="noopener noreferrer" target="_blank">
            <i className="fab fa-twitter"></i>
          </a>
        </li>

        <li className="nav-item d-flex align-items-center">
          <a className="btn btn-link btn-lg" href={facebookLink} rel="noopener noreferrer" target="_blank">
            <i className="fab fa-facebook"></i>
          </a>
        </li>

        <li className="nav-item d-flex align-items-center">
          <a className="btn btn-link btn-lg" href={facebookLink} rel="noopener noreferrer" target="_blank">
            <i className="fab fa-qq"></i>
          </a>
        </li>

        <li className="nav-item d-flex align-items-center">
          <a className="btn btn-link btn-lg" href={facebookLink} rel="noopener noreferrer" target="_blank">
            <i className="fab fa-weibo"></i>
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
