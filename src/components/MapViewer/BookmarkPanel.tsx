import React, { useState, useEffect } from 'react';
import { Dialog, Pane, IconButton, Table } from 'evergreen-ui';
import EmptyState from '../EmptyState';

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

interface BookmarkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mapId: string;
}

const BookmarkPanel: React.FC<BookmarkPanelProps> = ({ isOpen, onClose, mapId }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load bookmarks from localStorage when the panel opens
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
    <Dialog
      isShown={isOpen}
      title="Map Bookmarks"
      onCloseComplete={onClose}
      hasFooter={false}
      width={600}
    >
      <Pane>
        {bookmarks.length > 0 ? (
          <Table>
            <Table.Head>
              <Table.TextHeaderCell>Name</Table.TextHeaderCell>
              <Table.TextHeaderCell>Created</Table.TextHeaderCell>
              <Table.TextHeaderCell>Coordinates</Table.TextHeaderCell>
              <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
            </Table.Head>
            <Table.Body>
              {bookmarks.map((bookmark, index) => (
                <Table.Row key={index}>
                  <Table.TextCell>{bookmark.name}</Table.TextCell>
                  <Table.TextCell>{formatDate(bookmark.date)}</Table.TextCell>
                  <Table.TextCell>
                    X: {Math.round(bookmark.state.x)}, Y: {Math.round(bookmark.state.y)}, Zoom:{' '}
                    {bookmark.state.zoom.toFixed(1)}
                  </Table.TextCell>
                  <Table.Cell>
                    <Pane display="flex">
                      <IconButton
                        icon="map-marker"
                        appearance="minimal"
                        onClick={() => handleGoToBookmark(bookmark)}
                        marginRight={8}
                        title="Go to bookmark"
                      />
                      <IconButton
                        icon="trash"
                        appearance="minimal"
                        intent="danger"
                        onClick={() => handleDeleteBookmark(index)}
                        title="Delete bookmark"
                      />
                    </Pane>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <EmptyState
            title="No bookmarks yet"
            orientation="horizontal"
            iconBgColor="#EDEFF5"
            icon="bookmark"
            description="You haven't saved any bookmarks for this map. Use the bookmark button in the map controls to save interesting views."
          />
        )}
      </Pane>
    </Dialog>
  );
};

export default BookmarkPanel;
