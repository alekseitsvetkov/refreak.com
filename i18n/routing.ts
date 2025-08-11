import {defineRouting} from 'next-intl/routing';

const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'never',
  domains: [
    {domain: 'refreak.com', defaultLocale: 'en', locales: ['en']},
    {domain: 'refreak.ru', defaultLocale: 'ru', locales: ['ru']},
    {domain: 'localhost', defaultLocale: 'en', locales: ['en']},
    {domain: '127.0.0.1', defaultLocale: 'en', locales: ['en']}
  ]
});

export default routing;


