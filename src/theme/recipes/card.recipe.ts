import { defineRecipe } from '@chakra-ui/react';

export const cardRecipe = defineRecipe({
  className: 'card',
  base: {
    bg: 'gray.75',
    borderColor: 'gray.100',
    borderRadius: '4px',
    borderWidth: '1px',
    boxShadow: '0 0 1px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
  },
  variants: {
    variant: {
      elevated: {
        bg: 'gray.75',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      outline: {
        bg: 'transparent',
      },
      filled: {
        bg: 'gray.75',
      },
    },
    size: {
      sm: { p: 3 },
      md: { p: 5 },
      lg: { p: 7 },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
});
