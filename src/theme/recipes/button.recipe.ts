import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  className: 'btn',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontWeight: 'medium',
    transition: 'all 0.2s',
    _focus: {
      boxShadow: '0 0 0 2px {colors.primary.500}',
    },
  },
  variants: {
    visual: {
      solid: {
        bg: 'primary.500',
        color: 'gray.50',
        _hover: { bg: 'primary.400' },
        _active: { bg: 'primary.600' },
      },
      outline: {
        bg: 'transparent',
        borderWidth: '1px',
        borderColor: 'gray.100',
        color: 'text',
        _hover: { bg: 'gray.75' },
      },
      secondary: {
        bg: 'secondary.200',
        color: 'text',
        _hover: { bg: 'secondary.100' },
        _active: { bg: 'secondary.300' },
      },
      minimal: {
        bg: 'transparent',
        color: 'text',
        _hover: { bg: 'gray.75' },
      },
      success: {
        bg: 'secondary.300',
        color: 'gray.50',
        _hover: { bg: 'secondary.400' },
      },
      warning: {
        bg: 'accent.400',
        color: 'gray.50',
        _hover: { bg: 'accent.500' },
      },
      danger: {
        bg: 'accent.400',
        color: 'gray.50',
        _hover: { bg: 'accent.500' },
      },
    },
    size: {
      sm: { px: 3, py: 1, fontSize: 'sm', h: 8 },
      md: { px: 4, py: 2, fontSize: 'md', h: 10 },
      lg: { px: 6, py: 3, fontSize: 'lg', h: 12 },
    },
    isFullWidth: {
      true: { width: '100%' },
    },
  },
  defaultVariants: {
    visual: 'solid',
    size: 'md',
    isFullWidth: false,
  },
});
