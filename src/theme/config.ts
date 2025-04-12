import { defineConfig } from '@chakra-ui/react';
import { colors } from './foundations/colors';
import { typography } from './foundations/typography';
import { buttonRecipe } from './recipes/button.recipe';
import { cardRecipe } from './recipes/card.recipe';

export const customConfig = defineConfig({
  // Apply CSS variables to root
  cssVarsRoot: ':where(:root, :host)',

  // Add global styles
  globalCss: {
    'html, body': {
      margin: 0,
      padding: 0,
      backgroundColor: 'colors.background',
      color: 'colors.text',
      fontFamily: 'body',
    },
  },

  // Define theme tokens and recipes
  theme: {
    // Define breakpoints
    breakpoints: {
      sm: '30em', // 480px
      md: '48em', // 768px
      lg: '62em', // 992px
      xl: '80em', // 1280px
      '2xl': '96em', // 1536px
    },

    // Define color tokens
    tokens: {
      colors,
      ...typography.tokens,
    },

    // Define semantic tokens
    semanticTokens: {
      colors: {
        text: { value: '{colors.gray.800}' },
        background: { value: '{colors.gray.50}' },
        primary: { value: '{colors.primary.500}' },
        secondary: { value: '{colors.secondary.200}' },
        accent: { value: '{colors.accent.500}' },
        muted: { value: '{colors.gray.200}' },
      },
    },

    // Define keyframe animations
    keyframes: {
      spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
    },

    // Define component recipes
    recipes: {
      button: buttonRecipe,
      card: cardRecipe,
    },

    // Define textStyles for typography
    textStyles: {
      h1: {
        fontFamily: 'heading',
        fontSize: { base: '2xl', md: '3xl', lg: '4xl' },
        fontWeight: 'bold',
        lineHeight: 'tight',
        letterSpacing: 'tight',
      },
      h2: {
        fontFamily: 'heading',
        fontSize: { base: 'xl', md: '2xl', lg: '3xl' },
        fontWeight: 'semibold',
        lineHeight: 'tight',
        letterSpacing: 'tight',
      },
      body: {
        fontFamily: 'body',
        fontSize: { base: 'md' },
        lineHeight: 'base',
      },
    },

    // Define layer styles for common visual patterns
    layerStyles: {
      card: {
        bg: 'gray.75',
        borderRadius: 'md',
        boxShadow: 'sm',
        p: { base: 4, md: 6 },
      },
      selected: {
        bg: 'rgba(146, 232, 184, 0.1)',
        borderColor: 'primary',
      },
    },
  },
});
