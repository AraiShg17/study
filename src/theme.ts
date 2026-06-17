// アプリ共通のカラー・スペーシング。ダーク基調で目に優しく。

export const colors = {
  bg: '#0f1115',
  surface: '#1a1d24',
  surfaceAlt: '#232730',
  border: '#2c313c',
  text: '#f2f4f8',
  textMuted: '#9aa3b2',
  primary: '#5b8cff',
  primaryText: '#ffffff',
  correct: '#2fbf71',
  correctBg: '#16341f',
  wrong: '#ff5a6a',
  wrongBg: '#3a1820',
  accent: '#ffc857',
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
};

export const spacing = (n: number) => n * 8;
