// src/Translate.js
import { useTranslation } from 'react-i18next';

const Translate = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return { t, changeLanguage, currentLanguage: i18n.language };
};

export default Translate;
