import React from 'react';
import { Box, Heading, Text, Card, Badge, Table } from '@chakra-ui/react';
import { MapMetadata, BlockInfo } from '../../hooks/useMapMetadata';

interface BlockInfoPanelProps {
  metadata: MapMetadata | null;
  position: { x: number; y: number } | null;
  blockSize: number;
  chunkSize: number;
}

const BlockInfoPanel: React.FC<BlockInfoPanelProps> = ({
  metadata,
  position,
  blockSize,
  chunkSize,
}) => {
  if (!position || !metadata) return null;

  // Calculate block coordinates
  const blockX = Math.floor(position.x / blockSize);
  const blockY = Math.floor(position.y / blockSize);

  // Calculate the chunk coordinates
  const chunkX = Math.floor(blockX / chunkSize);
  const chunkY = Math.floor(blockY / chunkSize);

  // Calculate coordinates relative to the origin
  const worldX = blockX + (metadata.originX || 0);
  const worldY = metadata.originY || 0;
  const worldZ = blockY + (metadata.originZ || 0);

  // Get the block info if available
  const blockKey = `${blockX},${blockY}`;
  const blockInfo: BlockInfo | undefined = metadata.blocks?.[blockKey];

  return (
    <Card.Root background="tint2" padding={16} borderRadius={8} width={300}>
      <Box display="flex" alignItems="center" marginBottom={16}>
        <Heading size="lg">Block Information</Heading>
        {blockInfo && (
          <Box
            width={24}
            height={24}
            marginLeft={8}
            backgroundColor={blockInfo.color}
            borderRadius={4}
            border="1px solid rgba(0,0,0,0.2)"
          />
        )}
      </Box>

      <Table.Root>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Block Position</Table.Cell>
            <Table.Cell>
              <Badge color="blue">{blockX}</Badge>, <Badge color="green">{blockY}</Badge>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Chunk Position</Table.Cell>
            <Table.Cell>
              <Badge color="purple">{chunkX}</Badge>, <Badge color="orange">{chunkY}</Badge>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>World Coordinates</Table.Cell>
            <Table.Cell>
              X: {worldX}, Y: {worldY}, Z: {worldZ}
            </Table.Cell>
          </Table.Row>
          {blockInfo && (
            <>
              <Table.Row>
                <Table.Cell>Block Type</Table.Cell>
                <Table.Cell>{blockInfo.name}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Block ID</Table.Cell>
                <Table.Cell>
                  <Text fontFamily="mono">{blockInfo.id}</Text>
                </Table.Cell>
              </Table.Row>
            </>
          )}
        </Table.Body>
      </Table.Root>

      {!blockInfo && (
        <Text color="muted" marginTop={8}>
          No detailed information available for this block
        </Text>
      )}
    </Card.Root>
  );
};

export default BlockInfoPanel;
