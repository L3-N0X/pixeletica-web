import React, { ReactNode } from 'react';
import { Pane, Heading, Text, IconButton } from 'evergreen-ui';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: JSX.Element;
  action?: ReactNode;
  height?: number | string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  height = 300,
}) => {
  return (
    <Pane
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height={height}
      padding={32}
      textAlign="center"
      borderRadius={8}
      background="tint2"
    >
      {icon && <Pane marginBottom={16}>{icon}</Pane>}

      <Heading size={600} marginBottom={8}>
        {title}
      </Heading>

      {description && (
        <Text size={400} color="muted" marginBottom={16}>
          {description}
        </Text>
      )}

      {action && <Pane marginTop={8}>{action}</Pane>}
    </Pane>
  );
};

export default EmptyState;
