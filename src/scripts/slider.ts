/**
 * Листание карточек кнопками (и свайпом на сенсорных экранах) по одной карточке.
 * Свободной горизонтальной прокрутки нет: у ленты overflow: hidden.
 * Разметка: [data-slider] > [data-slider-track] > [data-slide]…, кнопки [data-slider-prev] / [data-slider-next].
 * Если все карточки помещаются (например, на компьютере), кнопки скрываются сами.
 */
const SWIPE_MIN = 40;

function initSlider(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-slider-track]');
  const prev = root.querySelector<HTMLButtonElement>('[data-slider-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-slider-next]');
  if (!track) return;
  const slides = () => [...track.querySelectorAll<HTMLElement>('[data-slide]')];

  const max = () => track.scrollWidth - track.clientWidth;
  const startOffset = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
  // Позиция карточки внутри ленты (offsetLeft считается от страницы, а не от ленты — с ним лента уезжала на ширину отступа)
  const positions = () => {
    const base = track.getBoundingClientRect().left - track.scrollLeft + startOffset();
    return slides().map((s) => Math.min(Math.max(s.getBoundingClientRect().left - base, 0), max()));
  };

  const update = () => {
    const static_ = max() <= 2;
    root.toggleAttribute('data-slider-static', static_);
    if (prev) prev.disabled = static_ || track.scrollLeft <= 2;
    if (next) next.disabled = static_ || track.scrollLeft >= max() - 2;
  };

  const go = (dir: 1 | -1) => {
    const pos = [...new Set(positions())];
    const x = track.scrollLeft;
    const target = dir > 0 ? pos.find((p) => p > x + 2) : [...pos].reverse().find((p) => p < x - 2);
    if (target === undefined) return;
    track.scrollTo({ left: target, behavior: 'smooth' });
  };

  prev?.addEventListener('click', () => go(-1));
  next?.addEventListener('click', () => go(1));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', () => {
    // после смены ширины выравниваем ленту по ближайшей карточке
    const pos = positions();
    const x = track.scrollLeft;
    const nearest = pos.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a), 0);
    track.scrollLeft = nearest;
    update();
  });

  // Свайп пальцем = нажатие на стрелку
  let sx = 0;
  let sy = 0;
  track.addEventListener('touchstart', (e) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  }, { passive: true });

  update();
}

document.querySelectorAll<HTMLElement>('[data-slider]').forEach(initSlider);
