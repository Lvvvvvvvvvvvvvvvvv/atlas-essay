// Atlas theme token generator
// Usage: const t = essayTokens({ theme: 'cream', accent: 'red' });

export function essayTokens({ theme = 'cream', accent = 'red' }) {
  const accents = {
    red:          { hex: '#e5251d', soft: '#fde4e2', name: 'SIGNAL RED' },
    amber:        { hex: '#c2540a', soft: '#fbe7d2', name: 'CINNABAR' },
    forest:       { hex: '#1f6f44', soft: '#daece1', name: 'EDITORIAL SAGE' },
    cobalt:       { hex: '#1d4ed8', soft: '#dee5fb', name: 'PRESS BLUE' },
    rose:         { hex: '#e11d48', soft: '#ffe1eb', name: 'ROSE BLUSH' },
    violet:       { hex: '#7c3aed', soft: '#ede9fe', name: 'VIOLET MIST' },
    teal:         { hex: '#0d9488', soft: '#d1faf5', name: 'ATLAS TEAL' },
    gold:         { hex: '#b45309', soft: '#fef3c7', name: 'ATLAS GOLD' },
    grad_sunset:  { hex: '#dc4e0c', soft: '#fbe7d2', gradient: 'linear-gradient(135deg, #f97316 0%, #e11d48 100%)', name: 'SUNSET' },
    grad_aurora:  { hex: '#0f7855', soft: '#daece1', gradient: 'linear-gradient(135deg, #0d9488 0%, #7c3aed 100%)', name: 'AURORA' },
    grad_ocean:   { hex: '#1a55c0', soft: '#dee5fb', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #4338ca 100%)', name: 'OCEAN DEEP' },
  };
  const a = accents[accent] || accents.red;

  const themes = {
    cream: {
      paper:    '#fbf9f4',
      paperAlt: '#f5f1e8',
      ink:      '#0f0f0f',
      inkSoft:  '#1f1d1a',
      mute:     '#767368',
      muteSoft: '#a8a395',
      rule:     '#d8d4ca',
      faint:    '#efebe1',
      cardOn:   '#ffffff',
    },
    slate: {
      paper:    '#15140f',
      paperAlt: '#1d1c17',
      ink:      '#f4f1e8',
      inkSoft:  '#e2dfd5',
      mute:     '#8c8778',
      muteSoft: '#5d5a4f',
      rule:     '#2a2823',
      faint:    '#1a1914',
      cardOn:   '#1d1c17',
    },
  };
  const palette = themes[theme] || themes.cream;

  return {
    ...palette,
    accent: a.hex,
    accentGradient: a.gradient || a.hex,
    accentSoft: a.soft,
    accentName: a.name,
    theme,
    fontDisplay: "'Archivo', 'Noto Sans SC', system-ui, sans-serif",
    fontBody:    "'Hanken Grotesk', 'Noto Sans SC', system-ui, sans-serif",
    fontSerif:   "'Newsreader', 'Noto Serif SC', Georgia, serif",
    fontMono:    "'JetBrains Mono', ui-monospace, monospace",
    fontCN:      "'Noto Sans SC', system-ui, sans-serif",
  };
}
