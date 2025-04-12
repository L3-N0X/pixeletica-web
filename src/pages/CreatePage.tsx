import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pane,
  Heading,
  FileUploader,
  TextInputField,
  FormField,
  Checkbox,
  Button,
  Spinner,
  toaster,
  Label,
  Alert,
  Text,
  Card,
  Paragraph,
  MimeType,
  Strong,
} from 'evergreen-ui';
import { DitherAlgorithm, ConversionRequest } from '../types/api';
import { conversionApi } from '../services/api';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const MAX_FILE_SIZE_MB = 10;

// Custom SegmentedControl component as a replacement
interface SegmentedControlProps {
  id?: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
  width?: string | number;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange, width }) => {
  return (
    <Pane
      display="flex"
      width={width || 'auto'}
      border="1px solid rgba(81, 123, 102, 0.4)"
      borderRadius={4}
      overflow="hidden"
      background="rgba(5, 10, 7, 0.4)"
    >
      {options.map((option) => (
        <Pane
          key={option.value}
          flex={1}
          padding={12}
          textAlign="center"
          cursor="pointer"
          backgroundColor={value === option.value ? 'rgba(146, 232, 184, 0.2)' : 'transparent'}
          color={value === option.value ? '#92e8b8' : '#dde9e3'}
          onClick={() => onChange(option.value)}
          transition="all 0.2s ease"
          borderBottom={value === option.value ? '2px solid #92e8b8' : '2px solid transparent'}
          _hover={{
            backgroundColor:
              value === option.value ? 'rgba(146, 232, 184, 0.25)' : 'rgba(81, 123, 102, 0.2)',
          }}
          fontSize={14}
        >
          {option.label}
        </Pane>
      ))}
    </Pane>
  );
};

// Custom NumberInputField component
interface NumberInputFieldProps {
  label: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  width?: string | number;
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  width,
}) => {
  return (
    <TextInputField
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type="number"
      min={min}
      max={max}
      width={width}
    />
  );
};

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useResponsiveLayout();

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
    <Pane maxWidth={isMobile ? '100%' : 900} marginX="auto">
      <Card
        elevation={1}
        background="rgba(17, 34, 24, 0.5)"
        padding={isMobile ? 16 : 24}
        marginBottom={32}
        borderRadius={8}
      >
        <Heading size={700} marginBottom={24} fontFamily="'Merriweather', serif">
          Create New Pixel Art
        </Heading>

        <Text size={400} color="muted" marginBottom={32}>
          Upload an image to convert it into Minecraft blocks. You can configure the conversion
          process below.
        </Text>

        {error && (
          <Alert intent="danger" title="Error" marginBottom={24} appearance="card">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Upload Image */}
          <Card
            background="rgba(17, 34, 24, 0.7)"
            borderRadius={8}
            padding={isMobile ? 16 : 24}
            marginBottom={24}
            border="1px solid rgba(81, 123, 102, 0.3)"
          >
            <Heading size={500} marginBottom={16} fontFamily="'Source Serif Pro', serif">
              Step 1: Upload Image
            </Heading>

            <FormField
              label="Upload Image"
              labelFor="image-upload"
              description="Select an image file to convert to Minecraft blocks"
            >
              <FileUploader
                label="Select image file or drag and drop"
                description={`Supported formats: JPG, PNG, GIF (max ${MAX_FILE_SIZE_MB}MB)`}
                maxSizeInBytes={MAX_FILE_SIZE_MB * 1024 * 1024}
                acceptedMimeTypes={[MimeType.jpeg, MimeType.png, MimeType.gif]}
                disabled={loading}
                onChange={handleFileAccepted}
                onRejected={handleFileRejected}
                ref={fileInputRef}
                height={120}
                background="#050a07"
                border="1px dashed rgba(81, 123, 102, 0.6)"
                borderRadius={8}
              />
            </FormField>

            {preview && (
              <Card
                elevation={0}
                background="rgba(5, 10, 7, 0.4)"
                padding={16}
                marginTop={16}
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                alignItems={isMobile ? 'center' : 'flex-start'}
              >
                <Pane
                  width={isMobile ? '100%' : 200}
                  marginBottom={isMobile ? 16 : 0}
                  marginRight={isMobile ? 0 : 16}
                  borderRadius={8}
                  overflow="hidden"
                  border="1px solid rgba(81, 123, 102, 0.4)"
                >
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    loading="lazy"
                  />
                </Pane>
                <Pane flex={1}>
                  <Heading size={400} marginBottom={8} fontFamily="'Source Serif Pro', serif">
                    Image Information
                  </Heading>
                  {imageDimensions && (
                    <Paragraph>
                      <Strong>Original size:</Strong> {imageDimensions.width} ×{' '}
                      {imageDimensions.height} pixels
                    </Paragraph>
                  )}
                  <Paragraph>
                    <Strong>File:</Strong> {uploadedFile?.name}
                  </Paragraph>
                  <Paragraph>
                    <Strong>Size:</Strong>{' '}
                    {(uploadedFile?.size || 0) / 1024 / 1024 < 1
                      ? `${Math.round((uploadedFile?.size || 0) / 1024)} KB`
                      : `${((uploadedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB`}
                  </Paragraph>
                </Pane>
              </Card>
            )}
          </Card>

          {/* Step 2: Configure Output Size */}
          <Card
            background="rgba(17, 34, 24, 0.7)"
            borderRadius={8}
            padding={isMobile ? 16 : 24}
            marginBottom={24}
            border="1px solid rgba(81, 123, 102, 0.3)"
          >
            <Heading size={500} marginBottom={16} fontFamily="'Source Serif Pro', serif">
              Step 2: Configure Output Size
            </Heading>

            <Pane
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              gap={isMobile ? 12 : 16}
              marginBottom={24}
            >
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

            <Pane>
              <Label htmlFor="algorithm" marginBottom={8} display="block" fontWeight={600}>
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
                onChange={(value: string) => setAlgorithm(value as DitherAlgorithm)}
                width="100%"
              />
              <Text size={300} color="muted" marginTop={8}>
                Different algorithms produce different visual effects when converting the image to
                Minecraft blocks.
              </Text>
            </Pane>
          </Card>

          {/* Step 3: Metadata and Export Options */}
          <Card
            background="rgba(17, 34, 24, 0.7)"
            borderRadius={8}
            padding={isMobile ? 16 : 24}
            marginBottom={32}
            border="1px solid rgba(81, 123, 102, 0.3)"
          >
            <Heading size={500} marginBottom={16} fontFamily="'Source Serif Pro', serif">
              Step 3: Metadata and Export Options
            </Heading>

            <Pane
              marginBottom={24}
              background="rgba(5, 10, 7, 0.3)"
              padding={16}
              borderRadius={8}
              border="1px solid rgba(81, 123, 102, 0.2)"
            >
              <Heading size={400} marginBottom={16} fontFamily="'Source Serif Pro', serif">
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDescription(e.target.value)
                }
              />
            </Pane>

            <Pane>
              <Heading size={400} marginBottom={16} fontFamily="'Source Serif Pro', serif">
                Export Options
              </Heading>
              <Pane
                display="flex"
                flexDirection="column"
                gap={12}
                background="rgba(5, 10, 7, 0.3)"
                padding={16}
                borderRadius={8}
                border="1px solid rgba(81, 123, 102, 0.2)"
              >
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
          </Card>

          {/* Submit Button */}
          <Pane
            display="flex"
            justifyContent="center"
            marginTop={32}
            paddingTop={24}
            borderTop="1px solid rgba(81, 123, 102, 0.3)"
          >
            <Button
              appearance="primary"
              intent="success"
              height={48}
              paddingX={32}
              type="submit"
              disabled={!uploadedFile || loading}
              iconBefore={loading ? Spinner : undefined}
              fontSize={16}
            >
              {loading ? 'Starting conversion...' : 'Start Conversion'}
            </Button>
          </Pane>
        </form>
      </Card>
    </Pane>
  );
};

export default CreatePage;
