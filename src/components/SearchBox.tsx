import React, { useEffect, useRef } from 'react';
import { Box, Input, InputElement, Text, Flex, Kbd, useDisclosure } from '@chakra-ui/react';
import { BsSearch } from 'react-icons/bs';

// Import from our UI components
import { DialogRoot, DialogContent, DialogBody } from './ui/dialog';

interface SearchBoxProps {
  onSearch?: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const { open, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState('');

  // Handle keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        onOpen();
      }
      // Close on escape key
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpen, onClose]);

  // Focus the input when the modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query);
    }
    setQuery('');
    onClose();
  };

  return (
    <>
      {/* Search Trigger Button (optional - could be displayed in the header) */}
      <Box
        onClick={onOpen}
        display="none" // Hide by default since we're using the keyboard shortcut
      >
        <Box as={BsSearch} />
      </Box>

      {/* Search Dialog */}
      <DialogRoot open={open} onOpenChange={(isOpen) => (isOpen ? onOpen() : onClose())}>
        <DialogContent
          mt="20vh"
          bg="gray.800"
          boxShadow="xl"
          borderRadius="xl"
          overflow="hidden"
          maxW="600px"
          mx="auto"
        >
          <Box as="form" onSubmit={handleSearch}>
            <Input>
              <InputElement pointerEvents="none">
                <Box as={BsSearch} color="gray.400" />
              </InputElement>
              <Input
                ref={inputRef}
                placeholder="Search anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                border="none"
                _focus={{
                  boxShadow: 'none',
                  outline: 'none',
                }}
                fontSize="xl"
                pl="50px"
                height="72px"
              />
            </Input>
          </Box>

          {/* Optional: Search instructions or recent searches */}
          <DialogBody p={4} borderTop="1px solid" borderColor="gray.700">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="sm" color="gray.400">
                Press <Kbd>Enter</Kbd> to search
              </Text>
              <Text fontSize="sm" color="gray.400">
                Press <Kbd>Esc</Kbd> to close
              </Text>
            </Flex>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

// Export a hook to access the search functionality from other components
export const useSearchBox = () => {
  const disclosure = useDisclosure();

  return {
    open: disclosure.onOpen,
    close: disclosure.onClose,
    isOpen: disclosure.open, // Update to 'open' to match the hook's structure in the project
  };
};

export default SearchBox;
