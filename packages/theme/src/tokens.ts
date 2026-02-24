// Brand colors extracted from apps/web/public/lpadmvLogo.PNG
export const lpaColors = {
  primary: '#72206E',
  secondary: '#885E2A',
  accent: '#FDC72A',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export const lpaSemanticColors = {
  background: lpaColors.black,
  foreground: lpaColors.white,
  mutedForeground: 'rgba(255, 255, 255, 0.78)',
  card: 'rgba(255, 255, 255, 0.06)',
  cardBorder: 'rgba(255, 255, 255, 0.12)',

  primary: lpaColors.primary,
  primaryForeground: lpaColors.white,
  accent: lpaColors.accent,
  accentForeground: lpaColors.black,
} as const;

export const lpaRadii = {
  sm: 10,
  md: 14,
  lg: 18,
} as const;

export const lpaTypography = {
  // Implemented via next/font on web and font loading on mobile.
  displayFontName: 'Bebas Neue',
  bodyFontName: 'Inter',
} as const;

export type LpaTheme = {
  colors: typeof lpaColors;
  semantic: typeof lpaSemanticColors;
  radii: typeof lpaRadii;
  typography: typeof lpaTypography;
};

export const lpaTheme: LpaTheme = {
  colors: lpaColors,
  semantic: lpaSemanticColors,
  radii: lpaRadii,
  typography: lpaTypography,
};
