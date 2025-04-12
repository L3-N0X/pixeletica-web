import React, { useState, useEffect } from 'react';
import EmptyState from '../EmptyState';
import { IconButton, Dialog, Box, Table } from '@chakra-ui/react';
import { LuMapPin, LuTrash } from 'react-icons/lu';

interface Bookmark {
  name: string;
  date: string;
  url: string;
  state: {
    x: number;
    y: number;
    zoom: number;
    selectedBlockId?: string;
    selectedChunk?: { x: number; z: number };
  };
}

interface BookmarkBoxlProps {
  isOpen: boolean;
  onClose: () => void;
  mapId: string;
}

const BookmarkBox: React.FC<BookmarkBoxlProps> = ({ isOpen, onClose, mapId }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load bookmarks from localStorage when the Boxl opens
  useEffect(() => {
    if (isOpen) {
      const allBookmarks = JSON.parse(localStorage.getItem('mapBookmarks') || '{}');
      setBookmarks(allBookmarks[mapId] || []);
    }
  }, [isOpen, mapId]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  // Go to a bookmark
  const handleGoToBookmark = (bookmark: Bookmark) => {
    window.location.href = bookmark.url;
  };

  // Delete a bookmark
  const handleDeleteBookmark = (index: number) => {
    const allBookmarks = JSON.parse(localStorage.getItem('mapBookmarks') || '{}');
    const updatedMapBookmarks = [...(allBookmarks[mapId] || [])];
    updatedMapBookmarks.splice(index, 1);

    allBookmarks[mapId] = updatedMapBookmarks;
    localStorage.setItem('mapBookmarks', JSON.stringify(allBookmarks));
    setBookmarks(updatedMapBookmarks);
  };

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Body>
        <Dialog.Header title="Bookmarks" />
        <Dialog.CloseTrigger onClick={onClose} />
        <Box>
          {bookmarks.length > 0 ? (
            <Table.Root>
              <Table.Header>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Created</Table.ColumnHeader>
                <Table.ColumnHeader>Coordinates</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Header>
              <Table.Body>
                {bookmarks.map((bookmark, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{bookmark.name}</Table.Cell>
                    <Table.Cell>{formatDate(bookmark.date)}</Table.Cell>
                    <Table.Cell>
                      X: {Math.round(bookmark.state.x)}, Y: {Math.round(bookmark.state.y)}, Zoom:{' '}
                      {bookmark.state.zoom.toFixed(1)}
                    </Table.Cell>
                    <Table.Cell>
                      <Box display="flex">
                        <IconButton
                          appearance="minimal"
                          onClick={() => handleGoToBookmark(bookmark)}
                          marginRight={8}
                          title="Go to bookmark"
                        >
                          <LuMapPin />
                        </IconButton>

                        <IconButton
                          appearance="minimal"
                          onClick={() => handleDeleteBookmark(index)}
                          title="Delete bookmark"
                          colorScheme="red"
                        >
                          <LuTrash />
                        </IconButton>
                      </Box>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          ) : (
            <EmptyState
              title="No bookmarks yet"
              orientation="horizontal"
              icon="bookmark"
              description="You haven't saved any bookmarks for this map. Use the bookmark button in the map controls to save interesting views."
            />
          )}
        </Box>
      </Dialog.Body>
    </Dialog.Root>
  );
};

export default BookmarkBox;
