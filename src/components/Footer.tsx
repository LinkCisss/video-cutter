import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/footer.scss';

function Footer() {
  const availableLangs = ['en','cn','fr'];
  const [t, i18n] = useTranslation();
  function handleLangChange(lang: string) {
    if (i18n.language === lang) {
      return;
    }
    localStorage.setItem('vct_lang', lang);
    i18n.changeLanguage(lang);
  }

  return (
    <footer>
      <div className="credits footer-sec">
        {t('commons.madeBy')}{' '}
        <a href="http://linlin521283959913.wordpress.com/" rel="noopener noreferrer" target="_blank">
          刘振林
        </a>
      </div>
      <span className="footer-separator"></span>
      <a href="http://linlin521283959913.wordpress.com/">(●ˇ∀ˇ●)</a>
      <span className="footer-separator"></span>
      <div className="lang-manager footer-sec">
        <span>{`${t('commons.changeLanguage')} :`}</span>
        {availableLangs.map((lang, index) => {
          return (
            <button
              type="button"
              key={`lang-${index}`}
              onClick={() => {
                handleLangChange(lang);
              }}
            >
              <span>{t('lang.' + lang)}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}

export default Footer;
