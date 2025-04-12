import { createSystem, defaultConfig } from '@chakra-ui/react';
import { customConfig } from './config';

// Create and export the theme system
export const system = createSystem(defaultConfig, customConfig);

// CLI command to generate types:
// npx @chakra-ui/cli typegen ./src/theme/index.ts
