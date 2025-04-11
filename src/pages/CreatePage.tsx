import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pane,
  Heading,
  FileUploader,
  TextInputField,
  FormField,
  SegmentedControl,
  Checkbox,
  Button,
  Spinner,
  toaster,
  Label,
  Alert,
  Text,
  Card,
  NumberInputField,
  Paragraph,
} from 'evergreen-ui';
import { DitherAlgorithm, ConversionRequest } from '../types/api';
import { conversionApi } from '../services/api';

const MAX_FILE_SIZE_MB = 10;

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [targetWidth, setTargetWidth] = useState<number | undefined>(undefined);
  const [targetHeight, setTargetHeight] = useState<number | undefined>(undefined);
  const [generateSchematic, setGenerateSchematic] = useState(true);
  const [drawChunkLines, setDrawChunkLines] = useState(true);
  const [drawBlockLines, setDrawBlockLines] = useState(true);

  // Handle file selection
  const handleFileAccepted = useCallback((files: File[]) => {
    const file = files[0];
    setUploadedFile(file);
    setError(null);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        setTargetWidth(img.width);
        setTargetHeight(img.height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileRejected = useCallback((fileRejections: any) => {
    const { message } = fileRejections[0].errors[0];
    setError(message);
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

      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Extract the base64 part only (remove data:image/jpeg;base64, prefix)
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(uploadedFile);
      });

      // Prepare request payload
      const request: ConversionRequest = {
        image: base64,
        filename: uploadedFile.name,
        width: targetWidth || null,
        height: targetHeight || null,
        algorithm,
        exportSettings: {
          exportTypes: ['png', 'jpg', 'webp', 'html'],
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

      // Navigate to status page
      toaster.success('Conversion started successfully!');
      navigate(`/status/${response.taskId}`);
    } catch (err) {
      console.error('Conversion failed:', err);
      setError('Failed to start conversion. Please try again later.');
      toaster.danger('Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pane maxWidth={800} marginX="auto">
      <Heading size={700} marginBottom={24}>
        Create New Pixel Art
      </Heading>

      {error && (
        <Alert intent="danger" title="Error" marginBottom={16}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Pane marginBottom={24}>
          <FormField label="Upload Image" labelFor="image-upload">
            <FileUploader
              label="Select image file"
              description="Image will be converted to Minecraft blocks"
              maxSizeInBytes={MAX_FILE_SIZE_MB * 1024 * 1024}
              acceptedMimeTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
              disabled={loading}
              onChange={handleFileAccepted}
              onRejected={handleFileRejected}
              ref={fileInputRef}
            />
          </FormField>

          {preview && (
            <Card elevation={1} background="tint2" padding={16} marginTop={16} display="flex">
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxHeight: '200px',
                  maxWidth: '200px',
                  objectFit: 'contain',
                  marginRight: '16px',
                  border: '1px solid #444',
                }}
              />
              <Pane>
                <Heading size={400} marginBottom={8}>
                  Image Information
                </Heading>
                {imageDimensions && (
                  <Paragraph>
                    Original size: {imageDimensions.width} × {imageDimensions.height} pixels
                  </Paragraph>
                )}
                <Paragraph>File: {uploadedFile?.name}</Paragraph>
                <Paragraph>
                  Size:{' '}
                  {(uploadedFile?.size || 0) / 1024 / 1024 < 1
                    ? `${Math.round((uploadedFile?.size || 0) / 1024)} KB`
                    : `${((uploadedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB`}
                </Paragraph>
              </Pane>
            </Card>
          )}
        </Pane>

        <Pane display="flex" gap={16} marginBottom={24}>
          <Pane flex={1}>
            <NumberInputField
              label="Target Width"
              placeholder={imageDimensions?.width.toString() || 'Auto'}
              value={targetWidth || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTargetWidth(e.target.value ? parseInt(e.target.value) : undefined)
              }
              min={1}
              max={10000}
              width="100%"
            />
          </Pane>
          <Pane flex={1}>
            <NumberInputField
              label="Target Height"
              placeholder={imageDimensions?.height.toString() || 'Auto'}
              value={targetHeight || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTargetHeight(e.target.value ? parseInt(e.target.value) : undefined)
              }
              min={1}
              max={10000}
              width="100%"
            />
          </Pane>
        </Pane>

        <Pane marginBottom={24}>
          <Label htmlFor="algorithm" marginBottom={4} display="block">
            Dithering Algorithm
          </Label>
          <SegmentedControl
            id="algorithm"
            options={[
              { label: 'Floyd-Steinberg', value: 'floyd_steinberg' },
              { label: 'Ordered', value: 'ordered' },
              { label: 'Random', value: 'random' },
            ]}
            value={algorithm}
            onChange={(value) => setAlgorithm(value as DitherAlgorithm)}
            width="100%"
          />
          <Text size={300} color="muted" marginTop={4}>
            Different algorithms produce different visual effects when converting the image to
            Minecraft blocks.
          </Text>
        </Pane>

        <Pane marginBottom={24} background="tint2" padding={16} borderRadius={4}>
          <Heading size={500} marginBottom={16}>
            Optional Metadata
          </Heading>
          <TextInputField
            label="Name"
            placeholder="My Awesome Pixel Art"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            marginBottom={12}
          />
          <TextInputField
            label="Author"
            placeholder="Your Name"
            value={author}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthor(e.target.value)}
            marginBottom={12}
          />
          <TextInputField
            label="Description"
            placeholder="Description of your pixel art"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          />
        </Pane>

        <Pane marginBottom={24}>
          <Heading size={500} marginBottom={16}>
            Export Options
          </Heading>
          <Pane display="flex" flexDirection="column" gap={8}>
            <Checkbox
              label="Generate Minecraft schematic file"
              checked={generateSchematic}
              onChange={(e) => setGenerateSchematic(e.target.checked)}
            />
            <Checkbox
              label="Draw chunk lines (16×16 blocks)"
              checked={drawChunkLines}
              onChange={(e) => setDrawChunkLines(e.target.checked)}
            />
            <Checkbox
              label="Draw block lines"
              checked={drawBlockLines}
              onChange={(e) => setDrawBlockLines(e.target.checked)}
            />
          </Pane>
        </Pane>

        <Pane display="flex" justifyContent="flex-end" marginTop={32}>
          <Button
            appearance="primary"
            intent="success"
            height={40}
            type="submit"
            disabled={!uploadedFile || loading}
            iconBefore={loading ? Spinner : undefined}
          >
            {loading ? 'Starting conversion...' : 'Start Conversion'}
          </Button>
        </Pane>
      </form>
    </Pane>
  );
};

export default CreatePage;
