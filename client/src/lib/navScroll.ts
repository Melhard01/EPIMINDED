const SCROLL_THRESHOLD = 20;
const HERO_ENTER_OFFSET = 48;
const HERO_EXIT_OFFSET = 100;

export const HERO_IDS: Record<string, string> = {
  "/": "home-hero",
  "/founders": "for-founders",
  "/community-builders": "for-community-builders",
  "/enterprise": "for-organisations",
};

export function getHeroScrollThreshold(location: string) {
  const heroId = HERO_IDS[location];
  if (!heroId) return null;

  const hero = document.getElementById(heroId);
  if (!hero) return null;

  const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
  return {
    enter: heroBottom - HERO_ENTER_OFFSET,
    exit: heroBottom - HERO_EXIT_OFFSET,
  };
}

export function computeNavScrolled(location: string, wasScrolled: boolean) {
  const thresholds = getHeroScrollThreshold(location);
  if (!thresholds) return window.scrollY > SCROLL_THRESHOLD;

  const { enter, exit } = thresholds;
  return wasScrolled ? window.scrollY > exit : window.scrollY > enter;
}
