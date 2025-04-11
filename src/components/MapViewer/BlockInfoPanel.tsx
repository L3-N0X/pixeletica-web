import React from 'react';
import { Pane, Heading, Text, Card, Badge, Table } from 'evergreen-ui';
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
    <Card elevation={2} background="tint2" padding={16} borderRadius={8} width={300}>
      <Pane display="flex" alignItems="center" marginBottom={16}>
        <Heading size={500}>Block Information</Heading>
        {blockInfo && (
          <Pane
            width={24}
            height={24}
            marginLeft={8}
            backgroundColor={blockInfo.color}
            borderRadius={4}
            border="1px solid rgba(0,0,0,0.2)"
          />
        )}
      </Pane>

      <Table>
        <Table.Body>
          <Table.Row>
            <Table.TextCell>Block Position</Table.TextCell>
            <Table.TextCell>
              <Badge color="blue">{blockX}</Badge>, <Badge color="green">{blockY}</Badge>
            </Table.TextCell>
          </Table.Row>
          <Table.Row>
            <Table.TextCell>Chunk Position</Table.TextCell>
            <Table.TextCell>
              <Badge color="purple">{chunkX}</Badge>, <Badge color="orange">{chunkY}</Badge>
            </Table.TextCell>
          </Table.Row>
          <Table.Row>
            <Table.TextCell>World Coordinates</Table.TextCell>
            <Table.TextCell>
              X: {worldX}, Y: {worldY}, Z: {worldZ}
            </Table.TextCell>
          </Table.Row>
          {blockInfo && (
            <>
              <Table.Row>
                <Table.TextCell>Block Type</Table.TextCell>
                <Table.TextCell>{blockInfo.name}</Table.TextCell>
              </Table.Row>
              <Table.Row>
                <Table.TextCell>Block ID</Table.TextCell>
                <Table.TextCell>
                  <Text fontFamily="mono">{blockInfo.id}</Text>
                </Table.TextCell>
              </Table.Row>
            </>
          )}
        </Table.Body>
      </Table>

      {!blockInfo && (
        <Text color="muted" marginTop={8}>
          No detailed information available for this block
        </Text>
      )}
    </Card>
  );
};

export default BlockInfoPanel;
