import { defaultTheme, ThemeProvider, mergeTheme } from 'evergreen-ui';

// Define custom colors
const colors = {
  ...defaultTheme.colors,
  darkBg: '#121212',
  darkElevated: '#1e1e1e',
  darkBorder: '#2e2e2e',
  primaryDark: '#00897b',  // Dark teal-greenish main accent
  primaryDarker: '#00695c',
  primaryLightest: '#b2dfdb',
  textDark: '#e0e0e0',
  textMuted: '#9e9e9e',
};

// Define the dark theme by modifying the default theme
const darkTheme = mergeTheme(defaultTheme, {
  colors,
  fontFamilies: {
    ...defaultTheme.fontFamilies,
    display: '"Merriweather", serif',
    ui: '"Roboto", sans-serif',
    mono: '"Fira Code", monospace',
  },
  components: {
    Button: {
      appearances: {
        primary: {
          backgroundColor: colors.primaryDark,
          color: 'white',
          _hover: {
            backgroundColor: colors.primaryDarker,
          },
        },
      },
      baseStyle: {
        borderRadius: 4,
      },
    },
    Pane: {
      baseStyle: {
        backgroundColor: colors.darkBg,
        borderRadius: 4,
      },
    },
    Card: {
      baseStyle: {
        backgroundColor: colors.darkElevated,
        borderRadius: 4,
        border: `1px solid ${colors.darkBorder}`,
      },
    },
    Heading: {
      baseStyle: {
        color: colors.textDark,
        fontFamily: '"Merriweather", serif',
      },
    },
    Text: {
      baseStyle: {
        color: colors.textDark,
      },
    },
    Link: {
      baseStyle: {
        color: colors.primaryLightest,
        textDecoration: 'none',
        _hover: {
          textDecoration: 'underline',
        },
      },
    },
    TableCell: {
      baseStyle: {
        backgroundColor: colors.darkElevated,
        borderBottom: `1px solid ${colors.darkBorder}`,
      },
    },
    TableRow: {
      baseStyle: {
        _hover: {
          backgroundColor: colors.darkBg,
        },
      },
    },
    Menu: {
      baseStyle: {
        backgroundColor: colors.darkElevated,
        borderRadius: 4,
        border: `1px solid ${colors.darkBorder}`,
      },
    },
    MenuItem: {
      baseStyle: {
        color: colors.textDark,
        _hover: {
          backgroundColor: colors.darkBg,
        },
        _active: {
          backgroundColor: colors.primaryDark,
          color: 'white',
        },
      },
    },
    Dialog: {
      baseStyle: {
        backgroundColor: colors.darkElevated,
        borderRadius: 4,
      },
    },
    Tooltip: {
      baseStyle: {
        backgroundColor: colors.darkElevated,
        color: colors.textDark,
      },
    },
  },
});

export { darkTheme, ThemeProvider };
