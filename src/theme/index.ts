import { createSystem, defaultBaseConfig } from '@chakra-ui/react';
import { customConfig } from './config';

export const system = createSystem(defaultBaseConfig, customConfig);
