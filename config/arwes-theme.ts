import { createThemeUnit, createThemeMultiplier, createThemeColor } from '@arwes/react';

export const theme = {
  space: createThemeUnit((index) => `${index * 0.25}rem`),
  spacen: createThemeMultiplier((index) => index * 4),
  colors: {
    background: 'hsla(180, 100%, 3%)',
    primary: createThemeColor((i) => [180, 100, 100 - i * 10]),
    secondary: createThemeColor((i) => [60, 100, 100 - i * 10])
  },
  fontFamily: '"Tomorrow", sans-serif'
};

export const globalStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    font-family: ${theme.fontFamily};
    background: ${theme.colors.background};
  }
`;
