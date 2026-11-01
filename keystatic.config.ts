import { config, collection, singleton, fields } from '@keystatic/core';

// Текст на двух языках: в админке это пара полей «RU» и «EN»
const t = (label: string, opts: { multiline?: boolean; description?: string } = {}) =>
  fields.object(
    {
      ru: fields.text({ label: `${label} — RU`, multiline: opts.multiline }),
      en: fields.text({ label: `${label} — EN`, multiline: opts.multiline }),
    },
    { label, description: opts.description }
  );

const img = (label: string, dir: string, description?: string) =>
  fields.image({ label, description, directory: `public/images/${dir}`, publicPath: `/images/${dir}/` });

const card = (dir: string, withImage = false) =>
  fields.object({
    title: t('Заголовок', { multiline: true, description: 'Перенос строки — Enter' }),
    text: t('Текст', { multiline: true }),
    ...(withImage ? { image: img('Картинка', dir) } : {}),
  });

const link = fields.object({
  label: t('Подпись'),
  url: fields.url({ label: 'Ссылка' }),
});

const repo = import.meta.env.PUBLIC_GITHUB_REPO as string | undefined;

export default config({
  storage: repo
    ? { kind: 'github', repo: repo as `${string}/${string}` }
    : { kind: 'local' },
  ui: {
    brand: { name: 'Kasta Design' },
    navigation: {
      'Главная страница': ['home', 'services', 'reviews'],
      'Проекты и статьи': ['projects', 'articles'],
      'Настройки': ['settings'],
    },
  },
  collections: {
    projects: collection({
      label: 'Проекты (кейсы и работы)',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { data: 'yaml' },
      columns: ['title', 'group', 'order'],
      schema: {
        title: fields.slug({
          name: { label: 'Название проекта', description: 'Например: My Lux. Из него же строится адрес страницы' },
        }),
        titleEn: fields.text({ label: 'Название проекта — EN', description: 'Если пусто, используется название выше' }),
        group: fields.select({
          label: 'Где показывать',
          options: [
            { label: 'Блок «На каком этапе твоё дело» (крупная карточка)', value: 'stage' },
            { label: 'Сетка «Ещё больше работ»', value: 'work' },
          ],
          defaultValue: 'work',
        }),
        order: fields.integer({ label: 'Порядок', description: 'Меньше — выше', defaultValue: 10 }),
        stageQuestion: t('Вопрос над карточкой', { description: 'Только для блока «На каком этапе». Например: Готовишься к открытию?' }),
        type: t('Тип работы', { description: 'Для сетки работ. Например: Упаковка' }),
        tag: t('Тег на странице проекта', { description: 'Например: Бренд к открытию' }),
        summary: t('Короткое описание для карточки', { multiline: true }),
        cover: img('Обложка карточки', 'projects'),
        gallery: fields.array(
          fields.object({
            image: img('Фото', 'projects'),
            alt: t('Описание фото (для поисковиков и незрячих)'),
          }),
          { label: 'Галерея на странице проекта', description: 'Сколько угодно фото, порядок можно менять перетаскиванием', itemLabel: (p) => p.fields.alt.fields.ru.value || 'Фото' }
        ),
        task: t('Задача', { multiline: true }),
        done: fields.array(t('Пункт'), {
          label: 'Что я сделала',
          itemLabel: (p) => p.fields.ru.value || 'Пункт',
        }),
        duration: t('Срок проекта', { description: 'Например: 3 недели' }),
        priceUsd: fields.integer({ label: 'Ориентировочная цена сегодня, $' }),
        priceRub: fields.integer({ label: 'Ориентировочная цена сегодня, ₽', description: 'Показывается только в русской версии' }),
      },
    }),
    services: collection({
      label: 'Услуги и цены',
      slugField: 'name',
      path: 'src/content/services/*',
      format: { data: 'yaml' },
      columns: ['name', 'order'],
      schema: {
        name: fields.slug({ name: { label: 'Услуга — RU' } }),
        nameEn: fields.text({ label: 'Услуга — EN' }),
        description: t('Описание', { multiline: true }),
        priceUsd: fields.integer({ label: 'Цена от, $' }),
        priceRub: fields.integer({ label: 'Цена от, ₽', description: 'Показывается только в русской версии' }),
        order: fields.integer({ label: 'Порядок', defaultValue: 10 }),
      },
    }),
    reviews: collection({
      label: 'Отзывы',
      slugField: 'name',
      path: 'src/content/reviews/*',
      format: { data: 'yaml' },
      columns: ['name', 'order'],
      schema: {
        name: fields.slug({ name: { label: 'Название (видно только в админке)', description: 'Например: Отзыв про сертификаты' } }),
        text: t('Текст отзыва', { multiline: true }),
        time: fields.text({ label: 'Время сообщения', description: 'Например: 19:48' }),
        column: fields.select({
          label: 'Колонка на компьютере',
          options: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
          ],
          defaultValue: '1',
        }),
        order: fields.integer({ label: 'Порядок', defaultValue: 10 }),
      },
    }),
    articles: collection({
      label: 'Статьи «Полезное»',
      slugField: 'title',
      path: 'src/content/articles/*',
      format: { data: 'yaml' },
      columns: ['title', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Заголовок — RU' } }),
        titleEn: fields.text({ label: 'Заголовок — EN' }),
        excerpt: t('Короткое описание для карточки', { multiline: true }),
        cover: img('Обложка', 'articles'),
        body: t('Текст статьи', { multiline: true, description: 'Абзацы разделяйте пустой строкой. Пока статья пустая, на сайте показывается «Статья скоро появится»' }),
        order: fields.integer({ label: 'Порядок', defaultValue: 10 }),
      },
    }),
  },
  singletons: {
    home: singleton({
      label: 'Тексты и фото главной',
      path: 'src/content/home',
      format: { data: 'yaml' },
      schema: {
        hero: fields.object(
          {
            eyebrow: t('Подзаголовок над H1', { multiline: true }),
            slogan: t('Слоган'),
            title: t('Главный заголовок (H1)', { multiline: true }),
            titleAccent: t('Выделенная голубым часть заголовка', { description: 'Точный кусок текста из заголовка' }),
            text: t('Текст под заголовком', { multiline: true }),
            primaryButton: t('Тёмная кнопка'),
            secondaryButton: t('Светлая кнопка'),
            image: img('Фото', 'home'),
          },
          { label: 'Первый экран' }
        ),
        cases: fields.object(
          {
            title: t('Заголовок'),
            titleAccent: t('Выделенная часть заголовка'),
          },
          { label: 'Блок «На каком этапе твоё дело»' }
        ),
        services: fields.object(
          {
            title: t('Заголовок'),
            note: t('Сноска под таблицей'),
            button: t('Кнопка'),
          },
          { label: 'Блок «С чем ещё могу помочь»' }
        ),
        process: fields.object(
          {
            title: t('Заголовок'),
            steps: fields.array(card('home', true), { label: 'Шаги', itemLabel: (p) => p.fields.title.fields.ru.value || 'Шаг' }),
          },
          { label: 'Блок «Рабочий процесс»' }
        ),
        about: fields.object(
          {
            title: t('Заголовок'),
            photo: img('Фото', 'home'),
            cards: fields.array(card('home'), { label: 'Карточки', itemLabel: (p) => p.fields.title.fields.ru.value || 'Карточка' }),
          },
          { label: 'Блок «Кстати, я Катя»' }
        ),
        reviews: fields.object({ title: t('Заголовок') }, { label: 'Блок «Отзывы»' }),
        community: fields.object(
          {
            title: t('Заголовок'),
            subtitle: t('Подзаголовок'),
            text: t('Текст в большой карточке', { multiline: true }),
            image: img('Иллюстрация', 'home'),
            cards: fields.array(card('home'), { label: 'Карточки', itemLabel: (p) => p.fields.title.fields.ru.value || 'Карточка' }),
          },
          { label: 'Блок «Комьюнити»' }
        ),
        articles: fields.object(
          {
            title: t('Заголовок'),
            titleAccent: t('Выделенная часть заголовка'),
          },
          { label: 'Блок «Полезное»' }
        ),
        contacts: fields.object(
          {
            directTitle: t('Заголовок карточки со связью'),
            socialTitle: t('Заголовок карточки с соцсетями'),
          },
          { label: 'Блок «Контакты»' }
        ),
      },
    }),
    settings: singleton({
      label: 'Ссылки, логотип и счётчик',
      path: 'src/content/settings',
      format: { data: 'yaml' },
      schema: {
        directLinks: fields.array(link, { label: 'Формат связи', itemLabel: (p) => p.fields.label.fields.ru.value || 'Ссылка' }),
        socialLinks: fields.array(link, { label: 'Соцсети', itemLabel: (p) => p.fields.label.fields.ru.value || 'Ссылка' }),
        signature: img('Подпись в футере (SVG или PNG)', 'brand', 'Если пусто — показывается временная текстовая подпись'),
        ogImage: img('Картинка для превью в соцсетях (1200×630)', 'brand'),
        metrikaId: fields.text({ label: 'Номер счётчика Яндекс Метрики', description: 'Только цифры. Пока пусто — Метрика не подключается' }),
      },
    }),
  },
});
