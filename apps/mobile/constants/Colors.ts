// Brand palette (from apps/web/public/lpadmvLogo.PNG)
const lpa = {
  primary: '#72206E',
  secondary: '#885E2A',
  accent: '#FDC72A',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export default {
  light: {
    text: lpa.black,
    background: lpa.white,
    tint: lpa.primary,
    tabIconDefault: '#8A8A8A',
    tabIconSelected: lpa.primary,
  },
  dark: {
    text: lpa.white,
    background: lpa.black,
    tint: lpa.accent,
    tabIconDefault: '#8A8A8A',
    tabIconSelected: lpa.accent,
  },
  lpa,
};
