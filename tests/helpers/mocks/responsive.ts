type ResponsiveTheme = {
  breakpoints: { values: Record<string, number> };
  spacing: (...args: unknown[]) => number;
  palette: { text: { primary: string } };
};

export const createResponsiveMock = (
  overrides?: Partial<{
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isXLarge: boolean;
    theme: Partial<ResponsiveTheme>;
  }>
) => ({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isXLarge: false,
  theme: {
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
    spacing: () => 8,
    palette: { text: { primary: "#111111" } },
    ...(overrides?.theme ?? {}),
  },
  ...(overrides ?? {}),
});
