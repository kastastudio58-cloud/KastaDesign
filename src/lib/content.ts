import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

export type Lang = 'ru' | 'en';
type Localized = { ru: string; en: string } | null | undefined;

export const reader = createReader(process.cwd(), keystaticConfig);

/** Текст на нужном языке; если английского нет — русский */
export const tr = (value: Localized, lang: Lang): string => (value?.[lang] || value?.ru || '').trim();

/**
 * Неразрывные пробелы: короткие слова (предлоги, союзы) не остаются в конце строки,
 * тире не переносится в начало новой строки.
 */
export function typo(text: string): string {
  if (!text) return '';
  let out = text.replace(/ — /g, ' — ');
  for (let i = 0; i < 2; i++) {
    out = out.replace(/(^|[\s(«"])([A-Za-zА-Яа-яЁё]{1,2})[ ]/gm, '$1$2 ');
  }
  return out;
}

/** Разбивает заголовок на части, чтобы покрасить выделенный кусок */
export function splitAccent(title: string, accent: string): { text: string; accent: boolean }[] {
  const i = accent ? title.indexOf(accent) : -1;
  if (i < 0) return [{ text: title, accent: false }];
  return [
    { text: title.slice(0, i), accent: false },
    { text: accent, accent: true },
    { text: title.slice(i + accent.length), accent: false },
  ].filter((p) => p.text);
}

export const formatNumber = (n: number) => n.toLocaleString('ru-RU').replace(/\s/g, ' ');

export const byOrder = <T extends { entry: { order: number | null } }>(a: T, b: T) =>
  (a.entry.order ?? 0) - (b.entry.order ?? 0);

export async function getHome() {
  const home = await reader.singletons.home.readOrThrow();
  return home;
}

export async function getSettings() {
  return reader.singletons.settings.readOrThrow();
}

export async function getProjects() {
  return (await reader.collections.projects.all()).sort(byOrder);
}

export async function getServices() {
  return (await reader.collections.services.all()).sort(byOrder);
}

export async function getReviews() {
  return (await reader.collections.reviews.all()).sort(byOrder);
}

export async function getArticles() {
  return (await reader.collections.articles.all()).sort(byOrder);
}

export const projectTitle = (entry: { title: string; titleEn: string }, lang: Lang) =>
  lang === 'en' && entry.titleEn ? entry.titleEn : entry.title;
