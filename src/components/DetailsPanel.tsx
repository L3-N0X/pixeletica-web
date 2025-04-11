import React from 'react';
import {
  Pane,
  Heading,
  Text,
  Button,
  Table,
  Badge,
  IconButton,
  Tooltip,
  ClipboardIcon,
  Strong,
  CrossIcon,
  DownloadIcon,
} from 'evergreen-ui';
import type { BlockDetails } from '@types';
import { getChunkBoundaries } from '@utils/tileUtils';

interface DetailsPanelProps {
  block: BlockDetails;
  onClose: () => void;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ block, onClose }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Pane
      width={350}
      height="100%"
      backgroundColor="#1e1e1e"
      borderLeft="1px solid #2e2e2e"
      padding={16}
      display="flex"
      flexDirection="column"
      animation="slideInRight 0.2s ease-out"
    >
      <Pane display="flex" justifyContent="space-between" alignItems="center" marginBottom={16}>
        <Heading size={500}>Block Details</Heading>
        <Button iconBefore={<CrossIcon />} appearance="minimal" onClick={onClose} />
      </Pane>

      <Pane
        padding={16}
        backgroundColor="#2e2e2e"
        borderRadius={4}
        marginBottom={16}
        display="flex"
        alignItems="center"
      >
        <Pane
          width={48}
          height={48}
          backgroundColor={block.color}
          marginRight={16}
          borderRadius={4}
          border="1px solid rgba(255, 255, 255, 0.2)"
        />
        <Pane>
          <Heading size={400}>{block.name}</Heading>
          <Badge>{block.id}</Badge>
        </Pane>
      </Pane>

      <Heading size={300} marginBottom={8}>
        Block Information
      </Heading>
      <Table marginBottom={16}>
        <Table.Body>
          <Table.Row>
            <Table.TextCell>X Coordinate</Table.TextCell>
            <Table.TextCell isNumber>
              <Strong>{block.x}</Strong>
              <Tooltip content="Copy to clipboard">
                <IconButton
                  icon={<ClipboardIcon />}
                  appearance="minimal"
                  size="small"
                  marginLeft={8}
                  onClick={() => copyToClipboard(block.x.toString())}
                />
              </Tooltip>
            </Table.TextCell>
          </Table.Row>
          <Table.Row>
            <Table.TextCell>Y Coordinate</Table.TextCell>
            <Table.TextCell isNumber>
              <Strong>{block.y}</Strong>
              <Tooltip content="Copy to clipboard">
                <IconButton
                  icon={<CrossIcon />}
                  appearance="minimal"
                  size="small"
                  marginLeft={8}
                  onClick={() => copyToClipboard(block.y.toString())}
                />
              </Tooltip>
            </Table.TextCell>
          </Table.Row>
          <Table.Row>
            <Table.TextCell>Z Coordinate</Table.TextCell>
            <Table.TextCell isNumber>
              <Strong>{block.z}</Strong>
              <Tooltip content="Copy to clipboard">
                <IconButton
                  icon={<ClipboardIcon />}
                  appearance="minimal"
                  size="small"
                  marginLeft={8}
                  onClick={() => copyToClipboard(block.z.toString())}
                />
              </Tooltip>
            </Table.TextCell>
          </Table.Row>
        </Table.Body>
      </Table>

      <Heading size={300} marginBottom={8}>
        Chunk Information
      </Heading>
      <Table marginBottom={16}>
        <Table.Body>
          <Table.Row>
            <Table.TextCell>Chunk X</Table.TextCell>
            <Table.TextCell isNumber>{block.chunkX}</Table.TextCell>
          </Table.Row>
          <Table.Row>
            <Table.TextCell>Chunk Z</Table.TextCell>
            <Table.TextCell isNumber>{block.chunkZ}</Table.TextCell>
          </Table.Row>
          <Table.Row>
            <Table.TextCell>Block Position in Chunk</Table.TextCell>
            <Table.TextCell>
              {block.x % 16}, {block.y % 16}
            </Table.TextCell>
          </Table.Row>
        </Table.Body>
      </Table>

      <Heading size={300} marginBottom={8}>
        Commands
      </Heading>
      <Pane backgroundColor="#2e2e2e" padding={8} borderRadius={4} marginBottom={8}>
        <Text fontFamily="mono" fontSize={12}>
          /tp {block.x} {block.y} {block.z}
        </Text>
        <Tooltip content="Copy command">
          <IconButton
            icon={<ClipboardIcon />}
            appearance="minimal"
            size="small"
            position="absolute"
            right={24}
            onClick={() => copyToClipboard(`/tp ${block.x} ${block.y} ${block.z}`)}
          />
        </Tooltip>
      </Pane>
      <Pane backgroundColor="#2e2e2e" padding={8} borderRadius={4}>
        <Text fontFamily="mono" fontSize={12}>
          /setblock {block.x} {block.y} {block.z} {block.id}
        </Text>
        <Tooltip content="Copy command">
          <IconButton
            icon={<ClipboardIcon />}
            appearance="minimal"
            size="small"
            position="absolute"
            right={24}
            onClick={() =>
              copyToClipboard(`/setblock ${block.x} ${block.y} ${block.z} ${block.id}`)
            }
          />
        </Tooltip>
      </Pane>

      <Pane marginTop="auto">
        <Button appearance="primary" width="100%" iconBefore={<DownloadIcon />} marginTop={16}>
          Download Schematic for This Chunk
        </Button>
      </Pane>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </Pane>
  );
};

export default DetailsPanel;
