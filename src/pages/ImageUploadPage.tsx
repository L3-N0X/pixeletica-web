import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Stack,
  Heading,
  Button,
  Text,
  Input,
  Image,
  Container,
  Grid,
  Switch,
  Card,
  NumberInput,
  Field,
  Select,
  Fieldset,
  Portal,
  createListCollection,
} from '@chakra-ui/react';

import { startConversion } from '@services/conversionService';
import type { ConversionSettings } from '@/types';
import { toaster } from '@/components/ui/toaster';

const ImageUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState<ConversionSettings>({
    algorithm: 'floyd_steinberg',
    exportSettings: {
      exportTypes: ['png', 'html'],
      originX: 0,
      originY: 0,
      originZ: 0,
      drawChunkLines: true,
      chunkLineColor: '#FF0000',
      drawBlockLines: true,
      blockLineColor: '#000000',
      splitCount: 1,
    },
    schematicSettings: {
      generateSchematic: true,
      author: '',
      name: '',
      description: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      setFile(null);
      setImagePreview(null);
      return;
    }

    const selectedFile = event.target.files[0];
    if (!selectedFile.type.startsWith('image/')) {
      toaster.create({
        title: 'Invalid file type',
        description: 'Please select a valid image file.',
        type: 'warning',
        duration: 5000,
        closable: true,
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toaster.create({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        type: 'warning',
        duration: 5000,
        closable: true,
      });
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);

      // Auto-set name if not already set
      if (!settings.schematicSettings.name) {
        const filename = selectedFile.name.split('.')[0];
        setSettings({
          ...settings,
          schematicSettings: {
            ...settings.schematicSettings,
            name: filename,
          },
        });
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !imagePreview) {
      toaster.create({
        title: 'No file selected',
        description: 'Please select an image file to convert.',
        type: 'warning',
        duration: 5000,
        closable: true,
      });

      return;
    }

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1]; // Remove data URL prefix

        const response = await startConversion({
          image: base64Data,
          filename: file.name,
          ...settings,
        });

        toaster.create({
          title: 'Image uploaded successfully',
          description: 'Your image is being processed.',
          type: 'success',
          duration: 5000,
          closable: true,
        });

        // Redirect to results page
        navigate(`/results/${response.taskId}`);
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      toaster.create({
        title: 'Error uploading image',
        description: 'There was an error processing your image. Please try again.',
        type: 'error',
        duration: 5000,
        closable: true,
      });

      setLoading(false);
    }
  };

  return (
    <>
      <Container maxW="container.xl" py={8}>
        <Heading size="lg" mb={6}>
          Convert Image to Pixel Art
        </Heading>

        <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
          {/* Left side - Image preview */}
          <Box w={{ base: '100%', md: '40%' }} minW="300px">
            <Box
              h="400px"
              border="1px dashed"
              borderColor="gray.500"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={4}
              bg="gray.800"
              position="relative"
              onClick={() => fileInputRef.current?.click()}
              cursor="pointer"
              _hover={{ borderColor: 'blue.400' }}
              transition="all 0.2s"
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  maxW="100%"
                  maxH="100%"
                  objectFit="contain"
                />
              ) : (
                <VStack gap={2}>
                  <Text fontSize="lg" color="gray.500">
                    Drag & Drop your image here
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    or click to browse
                  </Text>
                </VStack>
              )}
            </Box>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
              disabled={loading}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              w="100%"
              colorScheme="blue"
              variant="outline"
              disabled={loading}
            >
              Select Image
            </Button>

            {file && (
              <Text mt={2} fontSize="sm" color="gray.400">
                Selected: {file.name} ({Math.round(file.size / 1024)}KB)
              </Text>
            )}
          </Box>

          {/* Right side - Conversion settings */}
          <Box w={{ base: '100%', md: '60%' }} as="form" onSubmit={handleSubmit}>
            <Card.Root variant="outline" mb={6}>
              <Card.Header pb={0}>
                <Heading size="md">Image Settings</Heading>
              </Card.Header>
              <Card.Body>
                <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
                  <Field.Root>
                    <Field.Label>Width (optional)</Field.Label>
                    <NumberInput.Root
                      min={1}
                      value={settings.width !== undefined ? String(settings.width) : ''}
                      onChange={(e: React.FormEvent<HTMLDivElement>) => {
                        const valueString = (e.target as HTMLInputElement).value;
                        const value = parseInt(valueString);
                        setSettings({
                          ...settings,
                          width: isNaN(value) ? undefined : value,
                        });
                      }}
                      disabled={loading}
                    >
                      <NumberInput.Input placeholder="Original width" />
                    </NumberInput.Root>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Height (optional)</Field.Label>
                    <NumberInput.Root
                      min={1}
                      value={settings.height !== undefined ? String(settings.height) : ''}
                      onChange={(e: React.FormEvent<HTMLDivElement>) => {
                        const valueString = (e.target as HTMLInputElement).value;
                        const value = parseInt(valueString);
                        setSettings({
                          ...settings,
                          height: isNaN(value) ? undefined : value,
                        });
                      }}
                      disabled={loading}
                    >
                      <NumberInput.Input placeholder="Original height" />
                    </NumberInput.Root>
                  </Field.Root>
                </Grid>

                <Field.Root mb={4}>
                  <Field.Label>Dithering Algorithm</Field.Label>
                  <Select.Root
                    value={[settings.algorithm]}
                    collection={createListCollection({
                      items: [
                        { value: 'floyd_steinberg', label: 'Floyd-Steinberg (Default)' },
                        { value: 'ordered', label: 'Ordered' },
                        { value: 'random', label: 'Random' },
                      ],
                    })}
                    onValueChange={(details) =>
                      setSettings({
                        ...settings,
                        algorithm: details.value[0] as ConversionSettings['algorithm'],
                      })
                    }
                  >
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select algorithm" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          <Select.Item item="floyd_steinberg">
                            Floyd-Steinberg (Default)
                          </Select.Item>
                          <Select.Item item="ordered">Ordered</Select.Item>
                          <Select.Item item="random">Random</Select.Item>
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Field.Root>
              </Card.Body>
            </Card.Root>

            <Card.Root variant="outline" mb={6}>
              <Card.Header pb={0}>
                <Heading size="md">Display Settings</Heading>
              </Card.Header>
              <Card.Body>
                <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={4}>
                  <Field.Root>
                    <Field.Label>Origin X</Field.Label>
                    <NumberInput.Root
                      value={settings.exportSettings.originX.toString()}
                      onChange={(e: React.FormEvent<HTMLDivElement>) => {
                        const valueString = (e.target as HTMLInputElement).value;
                        const value = parseInt(valueString);
                        setSettings({
                          ...settings,
                          exportSettings: {
                            ...settings.exportSettings,
                            originX: isNaN(value) ? 0 : value,
                          },
                        });
                      }}
                      disabled={loading}
                    >
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Origin Y</Field.Label>
                    <NumberInput.Root
                      value={settings.exportSettings.originY.toString()}
                      onChange={(e: React.FormEvent<HTMLDivElement>) => {
                        const valueString = (e.target as HTMLInputElement).value;
                        const value = parseInt(valueString);
                        setSettings({
                          ...settings,
                          exportSettings: {
                            ...settings.exportSettings,
                            originY: isNaN(value) ? 0 : value,
                          },
                        });
                      }}
                      disabled={loading}
                    >
                      <NumberInput.Input />
                    </NumberInput.Root>
                    {/* </Field.Root> */}
                    <NumberInput.Root
                      value={settings.exportSettings.originZ.toString()}
                      onChange={(e: React.FormEvent<HTMLDivElement>) => {
                        const valueString = (e.target as HTMLInputElement).value;
                        const value = parseInt(valueString);
                        setSettings({
                          ...settings,
                          exportSettings: {
                            ...settings.exportSettings,
                            originZ: isNaN(value) ? 0 : value,
                          },
                        });
                      }}
                      disabled={loading}
                    >
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Field.Root>
                </Grid>

                <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={4}>
                  <Box>
                    <Fieldset.Root display="flex" alignItems="center" mb={2}>
                      <Fieldset.Legend mb="0">Draw Chunk Lines</Fieldset.Legend>
                      <Switch.Root
                        id="draw-chunk-lines"
                        checked={settings.exportSettings.drawChunkLines}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            exportSettings: {
                              ...settings.exportSettings,
                              drawChunkLines: (event.target as HTMLInputElement).checked,
                            },
                          })
                        }
                        disabled={loading}
                      />
                    </Fieldset.Root>
                    {settings.exportSettings.drawChunkLines && (
                      <Field.Root mt={4}>
                        <Field.Label>Chunk Line Color</Field.Label>
                        <Input
                          type="text"
                          value={settings.exportSettings.chunkLineColor}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSettings({
                              ...settings,
                              exportSettings: {
                                ...settings.exportSettings,
                                chunkLineColor: e.target.value,
                              },
                            })
                          }
                          disabled={loading}
                        />
                      </Field.Root>
                    )}
                  </Box>

                  <Box>
                    <Fieldset.Root display="flex" alignItems="center" mb={2}>
                      <Fieldset.Legend mb="0">Draw Block Lines</Fieldset.Legend>
                      <Switch.Root
                        id="draw-block-lines"
                        checked={settings.exportSettings.drawBlockLines}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            exportSettings: {
                              ...settings.exportSettings,
                              drawBlockLines: (event.target as HTMLInputElement).checked,
                            },
                          })
                        }
                        disabled={loading}
                      />
                    </Fieldset.Root>
                    <Field.Root mt={4}>
                      <Field.Label>Block Line Color</Field.Label>
                      <Input
                        type="text"
                        value={settings.exportSettings.blockLineColor}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSettings({
                            ...settings,
                            exportSettings: {
                              ...settings.exportSettings,
                              blockLineColor: e.target.value,
                            },
                          })
                        }
                        disabled={loading}
                      />
                    </Field.Root>
                  </Box>
                </Grid>

                <Field.Root mb={4}>
                  <Field.Label>Export Formats</Field.Label>
                  <Stack gap={2}>
                    {[
                      { label: 'PNG', value: 'png' as const },
                      { label: 'JPG', value: 'jpg' as const },
                      { label: 'WebP', value: 'webp' as const },
                      { label: 'HTML', value: 'html' as const },
                    ].map((option) => (
                      <Fieldset.Root key={option.value} display="flex" alignItems="center">
                        <Fieldset.Legend mb="0">{option.label}</Fieldset.Legend>
                        <Switch.Root
                          id={`format-${option.value}`}
                          checked={settings.exportSettings.exportTypes.includes(option.value)}
                          onChange={(event) => {
                            const updatedExportTypes = (event.target as HTMLInputElement).checked
                              ? [...settings.exportSettings.exportTypes, option.value]
                              : settings.exportSettings.exportTypes.filter(
                                  (type) => type !== option.value
                                );
                            setSettings({
                              ...settings,
                              exportSettings: {
                                ...settings.exportSettings,
                                exportTypes: updatedExportTypes as (
                                  | 'html'
                                  | 'png'
                                  | 'jpg'
                                  | 'webp'
                                )[],
                              },
                            });
                          }}
                          disabled={loading}
                        />
                      </Fieldset.Root>
                    ))}
                  </Stack>
                </Field.Root>
              </Card.Body>
            </Card.Root>

            <Card.Root variant="outline" mb={6}>
              <Card.Header pb={0}>
                <Fieldset.Root display="flex" alignItems="center">
                  <Fieldset.Legend mb="0">Generate Schematic</Fieldset.Legend>
                  <Switch.Root
                    id="generate-schematic"
                    checked={settings.schematicSettings.generateSchematic}
                    onChange={(event) => {
                      const checked = (event.target as HTMLInputElement).checked;
                      setSettings({
                        ...settings,
                        schematicSettings: {
                          ...settings.schematicSettings,
                          generateSchematic: checked,
                        },
                      });
                    }}
                    disabled={loading}
                  />
                </Fieldset.Root>
              </Card.Header>
              {settings.schematicSettings.generateSchematic && (
                <Card.Body>
                  <Stack gap={4}>
                    <Field.Root>
                      <Field.Label>Schematic Name</Field.Label>
                      <Input
                        value={settings.schematicSettings.name || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSettings({
                            ...settings,
                            schematicSettings: {
                              ...settings.schematicSettings,
                              name: e.target.value,
                            },
                          })
                        }
                        disabled={loading}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Author</Field.Label>
                      <Input
                        value={settings.schematicSettings.author || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSettings({
                            ...settings,
                            schematicSettings: {
                              ...settings.schematicSettings,
                              author: e.target.value,
                            },
                          })
                        }
                        placeholder="Pixeletica User"
                        disabled={loading}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Description</Field.Label>
                      <Input
                        value={settings.schematicSettings.description || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSettings({
                            ...settings,
                            schematicSettings: {
                              ...settings.schematicSettings,
                              description: e.target.value,
                            },
                          })
                        }
                        disabled={loading}
                      />
                    </Field.Root>
                  </Stack>
                </Card.Body>
              )}
            </Card.Root>

            <Button
              colorScheme="blue"
              type="submit"
              size="lg"
              width="100%"
              disabled={!file || loading}
              loading={loading}
              loadingText="Converting..."
            >
              Convert Image
            </Button>
          </Box>
        </Flex>
      </Container>
    </>
  );
};

export default ImageUploadPage;
