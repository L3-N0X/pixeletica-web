import React, { useState, useEffect } from 'react';
import { Dialog, Pane, Table, IconButton, Text, Heading, EmptyState } from 'evergreen-ui';
import { useNavigate } from 'react-router-dom';

interface Bookmark {
  name: string;
  url: string;
  date: string;
  state: {
    x: number;
    y: number;
    zoom: number;
    selectedBlockId?: string;
    selectedChunk?: { x: number; z: number };
  };
}

interface BookmarksByMap {
  [mapId: string]: Bookmark[];
}

interface BookmarkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mapId: string;
}

const BookmarkPanel: React.FC<BookmarkPanelProps> = ({ isOpen, onClose, mapId }) => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load bookmarks from local storage
  useEffect(() => {
    if (isOpen) {
      const allBookmarks: BookmarksByMap = JSON.parse(localStorage.getItem('mapBookmarks') || '{}');
      setBookmarks(allBookmarks[mapId] || []);
    }
  }, [isOpen, mapId]);

  // Navigate to a bookmark
  const handleGoToBookmark = (bookmark: Bookmark) => {
    navigate(bookmark.url.replace(window.location.origin, ''));
    onClose();
  };

  // Delete a bookmark
  const handleDeleteBookmark = (index: number) => {
    const allBookmarks: BookmarksByMap = JSON.parse(localStorage.getItem('mapBookmarks') || '{}');
    const updatedMapBookmarks = [...(allBookmarks[mapId] || [])];

    updatedMapBookmarks.splice(index, 1);
    allBookmarks[mapId] = updatedMapBookmarks;

    localStorage.setItem('mapBookmarks', JSON.stringify(allBookmarks));
    setBookmarks(updatedMapBookmarks);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <Dialog
      isShown={isOpen}
      title="Bookmarked Views"
      onCloseComplete={onClose}
      hasFooter={false}
      width="600px"
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
            iconSrc=""
            icon="bookmark"
            description="You haven't saved any bookmarks for this map. Use the bookmark button in the map controls to save interesting views."
          />
        )}
      </Pane>
    </Dialog>
  );
};

export default BookmarkPanel;
