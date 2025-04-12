import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  IconButton,
  Alert,
  Checkbox,
  Input,
  NumberInput,
  SegmentGroup,
  Card,
  Stack,
  VStack,
  Image,
  Field,
  FileUpload,
  useBreakpointValue,
  Center,
  Icon,
  Textarea,
} from '@chakra-ui/react';
// Import types from FileUpload namespace - Corrected names
import type { FileUploadFileAcceptDetails, FileUploadFileRejectDetails } from '@chakra-ui/react';
import { DitherAlgorithm, ConversionRequest } from '../types/api';
import { conversionApi } from '../services/api';
import { LuPlay, LuUpload, LuX } from 'react-icons/lu';
// No need for FileRejection from react-dropzone

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Form state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conversion options
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [algorithm, setAlgorithm] = useState<DitherAlgorithm>('floyd_steinberg');
  const [targetWidth, setTargetWidth] = useState<number | string>(''); // Use string for NumberInput
  const [targetHeight, setTargetHeight] = useState<number | string>(''); // Use string for NumberInput
  const [generateSchematic, setGenerateSchematic] = useState(true);
  const [drawChunkLines, setDrawChunkLines] = useState(true);
  const [drawBlockLines, setDrawBlockLines] = useState(true);

  // Handle file selection - Use correct types from @chakra-ui/react
  const handleFileAccepted = useCallback((details: FileUploadFileAcceptDetails) => {
    // Corrected type
    // Use namespaced type
    const file = details.files[0];
    if (file) {
      setUploadedFile(file);
      setError(null);

      // Generate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);

        // Get image dimensions
        const img = document.createElement('img');
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
          setTargetWidth(img.width); // Set initial target size to original
          setTargetHeight(img.height);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileRejected = useCallback((details: FileUploadFileRejectDetails) => {
    // Corrected type
    // Use details.rejectedFiles and error.code (based on previous errors)
    const firstError = details.files?.[0]?.errors?.[0]; // Use files and add optional chaining
    if (firstError) {
      setError(firstError || 'File rejected. Please check size and format.'); // Use message with fallback
    } else {
      setError('File rejected. Please check size and format.');
    }
    setUploadedFile(null);
    setPreview(null);
    setImageDimensions(null);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile) {
      setError('Please select an image to convert');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          if (base64Data) {
            resolve(base64Data);
          } else {
            reject(new Error('Failed to read file as base64.'));
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(uploadedFile);
      });

      // Prepare request payload
      const request: ConversionRequest = {
        image: base64,
        filename: uploadedFile.name,
        width: targetWidth ? parseInt(targetWidth.toString(), 10) : null,
        height: targetHeight ? parseInt(targetHeight.toString(), 10) : null,
        algorithm,
        exportSettings: {
          exportTypes: ['png', 'jpg', 'webp', 'html'], // Example export types
          drawChunkLines,
          drawBlockLines,
          originX: 0,
          originY: 0,
          originZ: 0,
        },
        schematicSettings: {
          generateSchematic,
          name: name || null,
          author: author || null,
          description: description || null,
        },
      };

      // Send request
      const response = await conversionApi.startConversion(request);

      navigate(`/status/${response.taskId}`);
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setError(err.message || 'Failed to start conversion. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box maxWidth="900px" marginX="auto" padding={isMobile ? 4 : 6}>
      {/* Use Card.Root */}
      <Card.Root variant="outline" mb={8}>
        <Card.Header>
          <Heading size="xl" fontFamily="'Merriweather', serif">
            Create New Pixel Art
          </Heading>
          <Text color="fg.muted" mt={2}>
            Upload an image to convert it into Minecraft blocks. You can configure the conversion
            process below.
          </Text>
        </Card.Header>

        <Card.Body>
          {error && (
            // Use Alert.Root
            <Alert.Root status="error" mb={6} variant="subtle">
              <Alert.Indicator />
              <Box>
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Box>
            </Alert.Root>
          )}

          <form onSubmit={handleSubmit}>
            {/* Use gap instead of spacing */}
            <VStack gap={6} align="stretch">
              {/* Step 1: Upload Image */}
              {/* Use Card.Root */}
              <Card.Root variant="outline">
                <Card.Header>
                  <Heading size="lg" fontFamily="'Source Serif Pro', serif">
                    Step 1: Upload Image
                  </Heading>
                </Card.Header>
                <Card.Body>
                  <Field.Root>
                    <Field.Label>Upload Image</Field.Label>
                    <FileUpload.Root
                      maxFiles={1}
                      maxFileSize={MAX_FILE_SIZE_BYTES} // Correct prop name
                      accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] }}
                      onFileAccept={handleFileAccepted}
                      onFileReject={handleFileRejected}
                      disabled={loading}
                    >
                      <FileUpload.HiddenInput ref={fileInputRef} />
                      <FileUpload.Dropzone>
                        <VStack>
                          <Icon as={LuUpload} boxSize={8} color="fg.muted" />
                          {/* Use FileUpload.Trigger */}
                          <FileUpload.Trigger asChild>
                            <Button size="sm" variant="ghost">
                              {' '}
                              {/* Use ghost or outline */}
                              Select image file or drag and drop
                            </Button>
                          </FileUpload.Trigger>
                          <Text textStyle="sm" color="fg.muted">
                            Supported formats: JPG, PNG, GIF (max {MAX_FILE_SIZE_MB}MB)
                          </Text>
                        </VStack>
                      </FileUpload.Dropzone>
                      {/* FileUpload.List doesn't take children function, use FileUpload.ItemGroup and map */}
                      <FileUpload.ItemGroup mt={4}>
                        <FileUpload.Context>
                          {({ acceptedFiles, rejectedFiles }) => (
                            <>
                              {acceptedFiles.map((file) => (
                                <FileUpload.Item key={file.name} file={file}>
                                  <FileUpload.ItemPreview>
                                    <FileUpload.ItemPreviewImage />
                                  </FileUpload.ItemPreview>
                                  <FileUpload.ItemName />
                                  <FileUpload.ItemSizeText />
                                  <FileUpload.ItemDeleteTrigger asChild>
                                    <IconButton size="xs" variant="ghost" aria-label="Remove file">
                                      <LuX />
                                    </IconButton>
                                  </FileUpload.ItemDeleteTrigger>
                                </FileUpload.Item>
                              ))}
                              {/* Optionally display rejected files */}
                              {rejectedFiles.map((rejectedFile) => (
                                <FileUpload.Item
                                  key={rejectedFile.file.name}
                                  file={rejectedFile.file}
                                  color="red.500"
                                >
                                  <FileUpload.ItemPreview>
                                    <FileUpload.ItemPreviewImage />
                                  </FileUpload.ItemPreview>
                                  <FileUpload.ItemName />
                                  <FileUpload.ItemSizeText />
                                  <Text fontSize="xs" color="red.500">
                                    Rejected: {rejectedFile.errors?.[0] || 'Invalid file'}{' '}
                                    {/* Display error code with fallback */}
                                  </Text>
                                  <FileUpload.ItemDeleteTrigger asChild>
                                    <IconButton size="xs" variant="ghost" aria-label="Remove file">
                                      <LuX />
                                    </IconButton>
                                  </FileUpload.ItemDeleteTrigger>
                                </FileUpload.Item>
                              ))}
                            </>
                          )}
                        </FileUpload.Context>
                      </FileUpload.ItemGroup>
                    </FileUpload.Root>

                    {/* Preview and File Info */}
                    {preview && uploadedFile && (
                      // Use Card.Root
                      <Card.Root variant="subtle" mt={4}>
                        <Card.Body>
                          {/* Use gap instead of spacing */}
                          <Stack direction={{ base: 'column', md: 'row' }} gap={4} align="start">
                            <Box
                              width={{ base: '100%', md: '200px' }}
                              flexShrink={0}
                              borderWidth="1px"
                              borderRadius="md"
                              overflow="hidden"
                            >
                              <Image
                                src={preview}
                                alt="Preview"
                                objectFit="contain"
                                width="100%"
                                maxHeight="200px"
                              />
                            </Box>
                            {/* Use gap instead of spacing */}
                            <VStack align="start" gap={1} flex={1}>
                              <Heading size="md" fontFamily="'Source Serif Pro', serif">
                                Image Information
                              </Heading>
                              {imageDimensions && (
                                <Text fontSize="sm">
                                  <Text as="span" fontWeight="semibold">
                                    Original size:
                                  </Text>{' '}
                                  {imageDimensions.width} × {imageDimensions.height} pixels
                                </Text>
                              )}
                              <Text fontSize="sm">
                                <Text as="span" fontWeight="semibold">
                                  File:
                                </Text>{' '}
                                {uploadedFile.name}
                              </Text>
                              <Text fontSize="sm">
                                <Text as="span" fontWeight="semibold">
                                  Size:
                                </Text>{' '}
                                {formatFileSize(uploadedFile.size)}
                              </Text>
                            </VStack>
                          </Stack>
                        </Card.Body>
                      </Card.Root>
                    )}
                  </Field.Root>
                </Card.Body>
              </Card.Root>

              {/* Step 2: Configure Output Size */}
              {/* Use Card.Root */}
              <Card.Root variant="outline">
                <Card.Header>
                  <Heading size="lg" fontFamily="'Source Serif Pro', serif">
                    Step 2: Configure Output Size
                  </Heading>
                </Card.Header>
                <Card.Body>
                  {/* Use gap instead of spacing */}
                  <Stack direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
                    <Field.Root flex={1}>
                      <Field.Label>Target Width (pixels)</Field.Label>
                      <NumberInput.Root
                        min={1}
                        max={10000} // Example max
                        value={targetWidth.toString()} // Ensure value is string
                        onValueChange={(details) => setTargetWidth(details.value)}
                        disabled={loading}
                      >
                        <NumberInput.Control>
                          <NumberInput.DecrementTrigger />
                          <NumberInput.IncrementTrigger />
                        </NumberInput.Control>
                        <NumberInput.Input
                          placeholder={imageDimensions?.width.toString() || 'Auto'}
                        />
                      </NumberInput.Root>
                      <Field.HelperText>Leave blank to use original width.</Field.HelperText>
                    </Field.Root>
                    <Field.Root flex={1}>
                      <Field.Label>Target Height (pixels)</Field.Label>
                      <NumberInput.Root
                        min={1}
                        max={10000} // Example max
                        value={targetHeight.toString()} // Ensure value is string
                        onValueChange={(details) => setTargetHeight(details.value)}
                        disabled={loading}
                      >
                        <NumberInput.Control>
                          <NumberInput.DecrementTrigger />
                          <NumberInput.IncrementTrigger />
                        </NumberInput.Control>
                        <NumberInput.Input
                          placeholder={imageDimensions?.height.toString() || 'Auto'}
                        />
                      </NumberInput.Root>
                      <Field.HelperText>Leave blank to use original height.</Field.HelperText>
                    </Field.Root>
                  </Stack>

                  <Field.Root>
                    <Field.Label>Dithering Algorithm</Field.Label>
                    <SegmentGroup.Root
                      value={algorithm}
                      onValueChange={(e) => setAlgorithm(e.value as DitherAlgorithm)}
                      disabled={loading}
                      size="md" // Adjust size as needed
                    >
                      <SegmentGroup.Indicator />
                      <SegmentGroup.Items
                        items={[
                          { label: 'Floyd-Steinberg', value: 'floyd_steinberg' },
                          { label: 'Ordered', value: 'ordered' },
                          { label: 'Random', value: 'random' },
                        ]}
                      />
                    </SegmentGroup.Root>
                    <Field.HelperText>
                      Different algorithms produce different visual effects.
                    </Field.HelperText>
                  </Field.Root>
                </Card.Body>
              </Card.Root>

              {/* Step 3: Metadata and Export Options */}
              {/* Use Card.Root */}
              <Card.Root variant="outline">
                <Card.Header>
                  <Heading size="lg" fontFamily="'Source Serif Pro', serif">
                    Step 3: Metadata and Export Options
                  </Heading>
                </Card.Header>
                <Card.Body>
                  {/* Use Card.Root */}
                  <Card.Root variant="subtle" mb={6}>
                    <Card.Header>
                      <Heading size="md" fontFamily="'Source Serif Pro', serif">
                        Optional Metadata (for Schematic)
                      </Heading>
                    </Card.Header>
                    <Card.Body>
                      {/* Use gap instead of spacing */}
                      <VStack gap={4} align="stretch">
                        <Field.Root>
                          <Field.Label>Name</Field.Label>
                          <Input
                            placeholder="My Awesome Pixel Art"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading || !generateSchematic}
                          />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Author</Field.Label>
                          <Input
                            placeholder="Your Name"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            disabled={loading || !generateSchematic}
                          />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Description</Field.Label>
                          <Textarea
                            placeholder="Description of your pixel art"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading || !generateSchematic}
                          />
                        </Field.Root>
                      </VStack>
                    </Card.Body>
                  </Card.Root>

                  {/* Use Card.Root */}
                  <Card.Root variant="subtle">
                    <Card.Header>
                      <Heading size="md" fontFamily="'Source Serif Pro', serif">
                        Export Options
                      </Heading>
                    </Card.Header>
                    <Card.Body>
                      {/* Use gap instead of spacing */}
                      <VStack gap={3} align="start">
                        <Checkbox.Root
                          checked={generateSchematic}
                          onCheckedChange={(e) => setGenerateSchematic(!!e.checked)}
                          disabled={loading}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>Generate Minecraft Schematic (.schem)</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root
                          checked={drawChunkLines}
                          onCheckedChange={(e) => setDrawChunkLines(!!e.checked)}
                          disabled={loading}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>Draw Chunk Lines on Exported Images</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root
                          checked={drawBlockLines}
                          onCheckedChange={(e) => setDrawBlockLines(!!e.checked)}
                          disabled={loading}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>Draw Block Lines on Exported Images</Checkbox.Label>
                        </Checkbox.Root>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                </Card.Body>
              </Card.Root>

              {/* Submit Button */}
              <Center mt={8} pt={6} borderTopWidth="1px">
                <Button
                  colorPalette="teal" // Use primary color from plan
                  size="lg" // Make button prominent
                  type="submit"
                  disabled={!uploadedFile || loading}
                  loading={loading} // Use loading prop
                  loadingText="Starting conversion..."
                  // Place icon directly inside Button
                >
                  <LuPlay /> Start Conversion
                </Button>
              </Center>
            </VStack>
          </form>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default CreatePage;
