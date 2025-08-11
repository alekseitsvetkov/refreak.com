import {defineRouting} from 'next-intl/routing';

export default defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'always'
});


