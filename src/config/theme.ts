const colors = {
  primary: '#FF385C',
  primaryVariant: '#E0002D',
  secondary: '#A0A0A0',
  secondaryVariant: '#808080',
  background: '#121212',
  surface: '#333333',
  error: '#B00020',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onError: '#FFFFFF',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
};

const typography = {
  h1: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  h2: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0,
  },
  h4: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  h5: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  h6: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.25,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};

const layout = {
  screenPadding: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
  layout,
};
