import React from 'react';
import { Heading, Text, Button, Table, Badge, IconButton, Strong, Box } from '@chakra-ui/react';
import { Tooltip } from './ui/tooltip';
import type { BlockDetails } from '@/types';
import { LuClipboard, LuDownload, LuX } from 'react-icons/lu';

interface DetailsBoxlProps {
  block: BlockDetails;
  onClose: () => void;
}

const DetailsBoxl: React.FC<DetailsBoxlProps> = ({ block, onClose }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box
      width={350}
      height="100%"
      padding={16}
      display="flex"
      flexDirection="column"
      animation="slideInRight 0.2s ease-out"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={16}>
        <Heading size="xl">Block Details</Heading>
        <IconButton appearance="minimal" onClick={onClose}>
          <LuX size={24} />
        </IconButton>
      </Box>

      <Box padding={16} borderRadius={4} marginBottom={16} display="flex" alignItems="center">
        <Box
          width={48}
          height={48}
          backgroundColor={block.color}
          marginRight={16}
          borderRadius={4}
        />
        <Box>
          <Heading size="xl">{block.name}</Heading>
          <Badge>{block.id}</Badge>
        </Box>
      </Box>

      <Heading size="md" marginBottom={8}>
        Block Information
      </Heading>
      <Table.Root marginBottom={16}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>X Coordinate</Table.Cell>
            <Table.Cell>
              <Strong>{block.x}</Strong>
              <Tooltip content="Copy to clipboard">
                <IconButton
                  appearance="minimal"
                  size="sm"
                  marginLeft={8}
                  onClick={() => copyToClipboard(block.x.toString())}
                >
                  <LuClipboard />
                </IconButton>
              </Tooltip>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Y Coordinate</Table.Cell>
            <Table.Cell>
              <Strong>{block.y}</Strong>
              <Tooltip content="Copy to clipboard">
                <IconButton
                  appearance="minimal"
                  size="sm"
                  marginLeft={8}
                  onClick={() => copyToClipboard(block.y.toString())}
                >
                  <LuClipboard />
                </IconButton>
              </Tooltip>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Z Coordinate</Table.Cell>
            <Table.Cell>
              <Strong>{block.z}</Strong>
              <Tooltip content="Copy to clipboard">
                <IconButton
                  appearance="minimal"
                  size="sm"
                  marginLeft={8}
                  onClick={() => copyToClipboard(block.z.toString())}
                >
                  <LuClipboard />
                </IconButton>
              </Tooltip>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>

      <Heading size="md" marginBottom={8}>
        Chunk Information
      </Heading>
      <Table.Root marginBottom={16}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Chunk X</Table.Cell>
            <Table.Cell>{block.chunkX}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Chunk Z</Table.Cell>
            <Table.Cell>{block.chunkZ}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Block Position in Chunk</Table.Cell>
            <Table.Cell>
              {block.x % 16}, {block.y % 16}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>

      <Heading size="md" marginBottom={8}>
        Commands
      </Heading>
      <Box backgroundColor="#2e2e2e" padding={8} borderRadius={4} marginBottom={8}>
        <Text fontFamily="mono" fontSize={12}>
          /tp {block.x} {block.y} {block.z}
        </Text>
        <Tooltip content="Copy command">
          <IconButton
            appearance="minimal"
            size="sm"
            position="absolute"
            right={24}
            onClick={() => copyToClipboard(`/tp ${block.x} ${block.y} ${block.z}`)}
          >
            <LuClipboard />
          </IconButton>
        </Tooltip>
      </Box>
      <Box backgroundColor="#2e2e2e" padding={8} borderRadius={4}>
        <Text fontFamily="mono" fontSize={12}>
          /setblock {block.x} {block.y} {block.z} {block.id}
        </Text>
        <Tooltip content="Copy command">
          <IconButton
            appearance="minimal"
            size="sm"
            position="absolute"
            right={24}
            onClick={() =>
              copyToClipboard(`/setblock ${block.x} ${block.y} ${block.z} ${block.id}`)
            }
          />
        </Tooltip>
      </Box>

      <Box marginTop="auto">
        <Button appearance="primary" width="100%" marginTop={16}>
          <LuDownload size={16} style={{ marginRight: 8 }} />
          Download Schematic for This Chunk
        </Button>
      </Box>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </Box>
  );
};

export default DetailsBoxl;
