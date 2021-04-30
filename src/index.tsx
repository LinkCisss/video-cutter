import React from 'react';
import ReactDOM from 'react-dom';
import './style.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import halfmoon from 'halfmoon';
import { BrowserRouter as Router } from 'react-router-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// locales 语言文件
import frLocales from './locales/fr.json';
import enLocales from './locales/en.json';
import cnLocales from './locales/cn.json';
import { RecoilRoot } from 'recoil';

/**
 * npm install react-i18next i18next -- save
 * to set language file
 */


const userLang = localStorage.getItem('vct_lang') || navigator.language;

/**
 * language包配置
 * 一会改回来
 */

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enLocales,
      },
      cn: {
        translation: cnLocales,
      },
      fr: {
        translation: frLocales,
      },
    },
    lng: userLang,
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false,
    },
  });

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <Router>
        <App />
      </Router>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById('root')
);

halfmoon.onDOMContentLoaded();
halfmoon.toggleDarkMode();

// 如果您想让您的应用离线运行并更快地加载
// change unregister() to register() below
// 有点小问题
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
serviceWorker.register();
