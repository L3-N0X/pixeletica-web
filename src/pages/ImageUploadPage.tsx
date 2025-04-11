import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pane,
  Heading,
  FileUploader,
  TextInputField,
  Button,
  SelectField,
  Switch,
  FormField,
  Label,
  Spinner,
  toaster,
} from 'evergreen-ui';
import { startConversion, getConversionStatus } from '@services/conversionService';
import type { ConversionSettings } from '@types';

const ImageUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

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

  const handleFileChange = (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      setImagePreview(null);
      return;
    }

    const selectedFile = files[0];
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
      toaster.warning('Please select an image to upload');
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

        toaster.success('Image uploaded successfully! Processing started.');

        // Redirect to results page
        navigate(`/results/${response.taskId}`);
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      toaster.danger('Failed to upload image. Please try again.');
      setLoading(false);
    }
  };

  const startStatusPolling = async (id: string) => {
    // Poll for status updates every 2 seconds
    const interval = setInterval(async () => {
      try {
        const status = await getConversionStatus(id);

        if (status.status === 'completed') {
          clearInterval(interval);
          toaster.success('Conversion completed! Redirecting to results...');
          // TODO: Redirect to results page
        } else if (status.status === 'failed') {
          clearInterval(interval);
          toaster.danger(`Conversion failed: ${status.error || 'Unknown error'}`);
        }
        // Update progress display if needed
      } catch (error) {
        console.error('Error checking status:', error);
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <Pane>
      <Heading size={700} marginBottom={24}>
        Convert Image to Pixel Art
      </Heading>

      <Pane display="flex" gap={32}>
        {/* Left side - Image preview */}
        <Pane width="40%" minWidth={300}>
          <Pane
            height={400}
            border="1px dashed #666"
            borderRadius={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
            marginBottom={16}
            backgroundColor="#1e1e1e"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Heading size={400} color="#666">
                Image Preview
              </Heading>
            )}
          </Pane>

          <FileUploader
            onChange={(files: File[]) => {
              const validFiles = files.filter((file) => file.type.startsWith('image/'));
              if (validFiles.length !== files.length) {
                toaster.warning('Only image files are allowed.');
              }
              handleFileChange(validFiles);
            }}
            maxSizeInBytes={5 * 1024 * 1024}
            maxFiles={1}
            width="100%"
            disabled={loading}
          />
        </Pane>

        {/* Right side - Conversion settings */}
        <Pane width="60%" is="form" onSubmit={handleSubmit}>
          <Pane marginBottom={24}>
            <Heading size={500} marginBottom={8}>
              Image Settings
            </Heading>
            <Pane display="flex" gap={16}>
              <TextInputField
                label="Width (optional)"
                placeholder="Original width"
                type="number"
                min={1}
                width="50%"
                value={settings.width || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings({
                    ...settings,
                    width: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                disabled={loading}
              />
              <TextInputField
                label="Height (optional)"
                placeholder="Original height"
                type="number"
                min={1}
                width="50%"
                value={settings.height || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings({
                    ...settings,
                    height: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                disabled={loading}
              />
            </Pane>

            <SelectField
              label="Dithering Algorithm"
              value={settings.algorithm}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSettings({
                  ...settings,
                  algorithm: e.target.value as 'floyd_steinberg' | 'ordered' | 'random',
                })
              }
              disabled={loading}
            >
              <option value="floyd_steinberg">Floyd-Steinberg (Default)</option>
              <option value="ordered">Ordered</option>
              <option value="random">Random</option>
            </SelectField>
          </Pane>

          <Pane marginBottom={24}>
            <Heading size={500} marginBottom={8}>
              Display Settings
            </Heading>

            <Pane display="flex" gap={16} marginBottom={8}>
              <TextInputField
                label="Origin X"
                type="number"
                width="33%"
                value={settings.exportSettings.originX}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings({
                    ...settings,
                    exportSettings: {
                      ...settings.exportSettings,
                      originX: parseInt(e.target.value) || 0,
                    },
                  })
                }
                disabled={loading}
              />
              <TextInputField
                label="Origin Y"
                type="number"
                width="33%"
                value={settings.exportSettings.originY}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings({
                    ...settings,
                    exportSettings: {
                      ...settings.exportSettings,
                      originY: parseInt(e.target.value) || 0,
                    },
                  })
                }
                disabled={loading}
              />
              <TextInputField
                label="Origin Z"
                type="number"
                width="33%"
                value={settings.exportSettings.originZ}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings({
                    ...settings,
                    exportSettings: {
                      ...settings.exportSettings,
                      originZ: parseInt(e.target.value) || 0,
                    },
                  })
                }
                disabled={loading}
              />
            </Pane>

            <Pane display="flex" gap={16} marginBottom={8}>
              <Pane width="50%">
                <Label>
                  Draw Chunk Lines
                  <Switch
                    checked={settings.exportSettings.drawChunkLines}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSettings({
                        ...settings,
                        exportSettings: {
                          ...settings.exportSettings,
                          drawChunkLines: e.target.checked,
                        },
                      })
                    }
                    disabled={loading}
                  />
                </Label>
                {settings.exportSettings.drawChunkLines && (
                  <FormField label="Chunk Line Color" marginTop={8}>
                    <TextInputField
                      label="Chunk Line Color"
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
                  </FormField>
                )}
              </Pane>

              <Pane width="50%">
                <Label>
                  Draw Block Lines
                  <Switch
                    checked={settings.exportSettings.drawBlockLines}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSettings({
                        ...settings,
                        exportSettings: {
                          ...settings.exportSettings,
                          drawBlockLines: e.target.checked,
                        },
                      })
                    }
                    disabled={loading}
                  />
                </Label>
                <TextInputField
                  label="Block Line Color"
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
              </Pane>
            </Pane>

            <FormField label="Export Formats" marginBottom={16}>
              <Pane>
                {[
                  { label: 'PNG', value: 'png' },
                  { label: 'JPG', value: 'jpg' },
                  { label: 'WebP', value: 'webp' },
                  { label: 'HTML', value: 'html' },
                ].map((option) => (
                  <Label key={option.value} display="block" marginBottom={8}>
                    <Switch
                      checked={settings.exportSettings.exportTypes.includes(option.value)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const updatedExportTypes = e.target.checked
                          ? [...settings.exportSettings.exportTypes, option.value]
                          : settings.exportSettings.exportTypes.filter(
                              (type: string) => type !== option.value
                            );
                        setSettings({
                          ...settings,
                          exportSettings: {
                            ...settings.exportSettings,
                            exportTypes: updatedExportTypes,
                          },
                        });
                      }}
                      disabled={loading}
                    />
                    {option.label}
                  </Label>
                ))}
              </Pane>
            </FormField>
          </Pane>

          <Pane marginBottom={24}>
            <Heading size={500} marginBottom={8}>
              <Label>
                <Switch
                  checked={settings.schematicSettings.generateSchematic}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      schematicSettings: {
                        ...settings.schematicSettings,
                        generateSchematic: e.target.checked,
                      },
                    })
                  }
                  disabled={loading}
                />
                Generate Schematic
              </Label>
            </Heading>

            {settings.schematicSettings.generateSchematic && (
              <>
                <TextInputField
                  label="Schematic Name"
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
                <TextInputField
                  label="Author"
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
                <TextInputField
                  label="Description"
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
              </>
            )}
          </Pane>

          <Button
            appearance="primary"
            type="submit"
            size="large"
            width="100%"
            disabled={!file || loading}
            iconBefore={loading ? undefined : undefined}
          >
            {loading ? <Spinner size={16} /> : 'Convert Image'}
          </Button>
        </Pane>
      </Pane>
    </Pane>
  );
};

export default ImageUploadPage;
