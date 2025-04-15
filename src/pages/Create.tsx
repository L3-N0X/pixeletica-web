import {
  rgbaToHex,
  startConversion,
  StartConversionParams,
  calculatePollingInterval,
  pollTaskStatus,
  getConversionPreview,
  PreviewConversionParams,
} from '@/api/conversion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { H1, P } from '@/components/ui/typography';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPicker } from '@/components/ui/color-picker';
import { FileDropZone } from '@/components/ui/file-drop-zone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FiUpload } from 'react-icons/fi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export interface FormValues {
  imageFiles: File[];
  width: number;
  height: number;
  keepAspectRatio: boolean;
  ditheringAlgorithm: 'floydSteinberg' | 'ordered' | 'random';
  originX: number;
  originY: number;
  originZ: number;
  chunkLineColor: string;
  chunkLineOpacity: number;
  blockGridLineColor: string;
  blockGridLineOpacity: number;
  exportOptions: {
    noLines: boolean;
    onlyBlockGrid: boolean;
    onlyChunkLines: boolean;
    bothLines: boolean;
  };
  exportParts: 1 | 2 | 4 | 9;
  schematicOptions: {
    generate: boolean;
    name?: string;
    author?: string;
    description?: string;
  };
}

export default function Create() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [imageDimensions, setImageDimensions] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const [keepAspectRatio, setKeepAspectRatio] = React.useState<boolean>(true);

  // Loading & conversion state
  const [isLoading, setIsLoading] = React.useState(false);
  const [taskProgress, setTaskProgress] = React.useState<number | undefined>(undefined);
  const [loadingMessage, setLoadingMessage] = React.useState('Processing your image...');

  // Conversion preview state
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | null>(null);
  // Track the last preview request parameters to avoid redundant requests
  const lastPreviewParamsRef = React.useRef<{
    width: number;
    height: number;
    algorithm: string;
  } | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      imageFiles: [],
      width: imageDimensions?.width || 0,
      height: imageDimensions?.height || 0,
      keepAspectRatio: true,
      ditheringAlgorithm: 'floydSteinberg',
      originX: 0,
      originY: 100,
      originZ: 0,
      chunkLineColor: '#ff0000',
      chunkLineOpacity: 1,
      blockGridLineColor: '#cccccc',
      blockGridLineOpacity: 0.5,
      exportOptions: {
        noLines: false,
        onlyBlockGrid: false,
        onlyChunkLines: true,
        bothLines: false,
      },
      exportParts: 1,
      schematicOptions: {
        generate: false,
        name: '',
        author: 'Pixeletica API',
        description: '',
      },
    },
  });

  const handleFilesDrop = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({
          width: img.width,
          height: img.height,
        });
        form.setValue('width', img.width);
        form.setValue('height', img.height);
      };
      img.src = objectUrl;

      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value);
    form.setValue('width', newWidth);

    if (keepAspectRatio && imageDimensions && imageDimensions.width > 0) {
      const aspectRatio = imageDimensions.height / imageDimensions.width;
      const newHeight = Math.round(newWidth * aspectRatio);
      form.setValue('height', newHeight);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value);
    form.setValue('height', newHeight);

    if (keepAspectRatio && imageDimensions && imageDimensions.width > 0) {
      const aspectRatio = imageDimensions.width / imageDimensions.height;
      const newWidth = Math.round(newHeight * aspectRatio);
      form.setValue('width', newWidth);
    }
  };

  const handleChunkLineColorChange = (color: string, opacity: number) => {
    form.setValue('chunkLineColor', color);
    form.setValue('chunkLineOpacity', opacity);
  };

  const handleBlockGridLineColorChange = (color: string, opacity: number) => {
    form.setValue('blockGridLineColor', color);
    form.setValue('blockGridLineOpacity', opacity);
  };

  // React to changes in algorithm, width, or height
  React.useEffect(() => {
    if (selectedFile && form.getValues('width') && form.getValues('height')) {
      const algorithm = form.watch('ditheringAlgorithm');
      if (algorithm) {
        // Update preview when algorithm changes
        generatePreview();
      }
    }
  }, [form.watch('ditheringAlgorithm')]);

  // Update dimensions inputs to use the refs
  React.useEffect(() => {
    // Handle blur events to update preview when input loses focus
    const handleWidthBlur = () => {
      if (selectedFile && form.getValues('width') > 0 && form.getValues('height') > 0) {
        generatePreview();
      }
    };

    const handleHeightBlur = () => {
      if (selectedFile && form.getValues('width') > 0 && form.getValues('height') > 0) {
        generatePreview();
      }
    };

    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');

    if (widthInput) {
      widthInput.addEventListener('blur', handleWidthBlur);
    }

    if (heightInput) {
      heightInput.addEventListener('blur', handleHeightBlur);
    }

    return () => {
      if (widthInput) {
        widthInput.removeEventListener('blur', handleWidthBlur);
      }
      if (heightInput) {
        heightInput.removeEventListener('blur', handleHeightBlur);
      }
    };
  }, [selectedFile]);

  // Generate preview when file is uploaded
  React.useEffect(() => {
    if (selectedFile && form.getValues('width') && form.getValues('height')) {
      generatePreview();
    }
  }, [selectedFile]);

  // Function to generate a preview of the conversion
  const generatePreview = async () => {
    if (!selectedFile || !form.getValues('width') || !form.getValues('height')) {
      return;
    }

    const width = form.getValues('width');
    const height = form.getValues('height');

    // Skip preview for large images (> 512x512)
    if (width * height > 512 * 512) {
      setPreviewError(
        'Image dimensions too large for preview. Preview available for images up to 512x512 pixels.'
      );
      return;
    }

    const algorithm =
      form.getValues('ditheringAlgorithm') === 'floydSteinberg'
        ? 'floyd_steinberg'
        : form.getValues('ditheringAlgorithm');

    // Check if the parameters haven't changed since the last preview
    const currentParams = { width, height, algorithm };
    if (
      lastPreviewParamsRef.current &&
      lastPreviewParamsRef.current.width === currentParams.width &&
      lastPreviewParamsRef.current.height === currentParams.height &&
      lastPreviewParamsRef.current.algorithm === currentParams.algorithm
    ) {
      return; // Skip if nothing has changed
    }

    // Update ref with current parameters
    lastPreviewParamsRef.current = currentParams;

    setPreviewError(null);
    setIsPreviewLoading(true);

    try {
      const previewParams: PreviewConversionParams = {
        imageFile: selectedFile,
        width,
        height,
        algorithm: algorithm as any,
      };

      const previewBlob = await getConversionPreview(previewParams);

      // Create URL for the preview image
      if (previewBlob instanceof Blob) {
        const imageUrl = URL.createObjectURL(previewBlob);
        setPreviewImage(imageUrl);
        setPreviewError(null);
      } else {
        setPreviewError('Failed to generate preview');
      }
    } catch (error) {
      console.error('Preview generation error:', error);
      setPreviewError(
        error instanceof Error
          ? error.message
          : 'Failed to generate preview. The server may be busy or the image is too complex.'
      );
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!selectedFile) {
      console.error('No image file selected.');
      toast.error('Please upload an image file before submitting.');
      return;
    }
    console.log('Form submitted:', data);

    try {
      // Show loading overlay immediately
      setIsLoading(true);
      setTaskProgress(0);
      setLoadingMessage('Starting conversion...');

      const params: StartConversionParams = {
        imageFile: selectedFile,
        width: data.width,
        height: data.height,
        ditheringAlgorithm:
          data.ditheringAlgorithm === 'floydSteinberg'
            ? 'floyd_steinberg'
            : data.ditheringAlgorithm,
        originX: data.originX,
        originY: data.originY,
        originZ: data.originZ,
        chunkLineColor: rgbaToHex(data.chunkLineColor, data.chunkLineOpacity),
        blockGridLineColor: rgbaToHex(data.blockGridLineColor, data.blockGridLineOpacity),
        imageDivision: data.exportParts,
        lineVisibilities: getSelectedLineVisibilities(data.exportOptions),
        generateSchematic: data.schematicOptions.generate,
        ...(data.schematicOptions.name && { schematicName: data.schematicOptions.name }),
        ...(data.schematicOptions.author && { schematicAuthor: data.schematicOptions.author }),
        ...(data.schematicOptions.description && {
          schematicDescription: data.schematicOptions.description,
        }),
        generateWebFiles: true,
      };

      const taskResponse = await startConversion(params);
      console.log('Conversion started:', taskResponse);
      setLoadingMessage('Converting your image...');

      // Calculate polling interval based on image size
      const pollingInterval = calculatePollingInterval(data.width, data.height);

      // Start polling for status
      try {
        const completedTask = await pollTaskStatus(
          taskResponse.taskId,
          (status) => {
            // Update progress in the UI
            setTaskProgress(status.progress || undefined);

            if (status.status === 'processing') {
              setLoadingMessage(`Converting your image... ${status.progress || 0}% complete`);
            }
          },
          pollingInterval
        );

        // When task is completed, redirect to results page
        navigate(`/results/${completedTask.taskId}`);
      } catch (pollingError) {
        console.error('Error during conversion:', pollingError);
        setIsLoading(false);
        toast.error('Conversion failed. Please try again.');
      }
    } catch (error) {
      console.error('Failed to start conversion:', error);
      setIsLoading(false);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start conversion. Please try again.'
      );
    }
  };

  // Helper function to get selected line visibilities
  const getSelectedLineVisibilities = (
    exportOptions: FormValues['exportOptions']
  ): ('no_lines' | 'block_grid_only' | 'chunk_lines_only' | 'both')[] => {
    const visibilities: ('no_lines' | 'block_grid_only' | 'chunk_lines_only' | 'both')[] = [];
    if (exportOptions.noLines) visibilities.push('no_lines');
    if (exportOptions.onlyBlockGrid) visibilities.push('block_grid_only');
    if (exportOptions.onlyChunkLines) visibilities.push('chunk_lines_only');
    if (exportOptions.bothLines) visibilities.push('both');
    return visibilities.length > 0 ? visibilities : ['chunk_lines_only'];
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Loading overlay */}
      <LoadingOverlay isOpen={isLoading} message={loadingMessage} progress={taskProgress} />
      <div>
        <H1 className="mb-2">Create Map Art</H1>
        <P className="text-muted-foreground">Upload an image for conversion</P>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Image Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <FileDropZone
              onFilesDrop={handleFilesDrop}
              acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
              className="min-h-64"
            >
              {previewUrl ? (
                <div className="flex items-center justify-center h-full w-full">
                  <img src={previewUrl} alt="Image preview" className="h-full w-full" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <FiUpload className="h-10 w-10 mb-3 text-muted-foreground" />
                  <div className="font-medium mb-1">Drag & drop your image here</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    or click to select a file from your computer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPEG, PNG, GIF, WEBP
                  </p>
                </div>
              )}
            </FileDropZone>
          </CardContent>
        </Card>

        {/* Dimension Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Dimension Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set the dimensions for the image. The width and height are in pixels.
              <br />
              <strong>Note:</strong> The image will be resized to fit these dimensions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (pixels)</Label>
                <Input
                  id="width"
                  type="number"
                  value={form.watch('width') || ''}
                  onChange={handleWidthChange}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (pixels)</Label>
                <Input
                  id="height"
                  type="number"
                  value={form.watch('height') || ''}
                  onChange={handleHeightChange}
                  min={1}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="keepAspectRatio"
                checked={keepAspectRatio}
                onCheckedChange={(checked) => setKeepAspectRatio(checked === true)}
              />
              <Label htmlFor="keepAspectRatio" className="text-sm font-normal cursor-pointer">
                Keep aspect ratio
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Dithering Algorithm Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Dithering Algorithm</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Dithering algorithms affect how pixel colors are represented in Minecraft blocks.
              <br />
              <strong>Floyd-Steinberg</strong> is the recommended option for most images, as it
              provides the best quality for most images as it distributes the error to neighboring
              pixels.
              <br />
              <strong> Ordered dithering</strong> creates a more patterned look that might be
              preferable for pixel art.
              <br />
              <strong> Random dithering</strong> creates a noisy texture that can work well for
              specific styles, but is generally less predictable.
            </p>
            <RadioGroup
              defaultValue="floydSteinberg"
              onValueChange={(value) => form.setValue('ditheringAlgorithm', value as any)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="floydSteinberg" id="floydSteinberg" />
                <Label htmlFor="floydSteinberg" className="text-base font-normal cursor-pointer">
                  Floyd-Steinberg (Recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ordered" id="ordered" />
                <Label htmlFor="ordered" className="text-base font-normal cursor-pointer">
                  Ordered Dithering
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="random" id="random" />
                <Label htmlFor="random" className="text-base font-normal cursor-pointer">
                  Random Dithering
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Conversion Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This is a preview of how your image will look after conversion with the selected
              algorithm.
              <br />
              <strong>Note:</strong> Preview is only available for images up to 512x512 pixels.
            </p>
            <div
              className="border rounded-md overflow-hidden p-2 flex flex-col bg-card"
              style={{ minHeight: '300px' }}
            >
              {isPreviewLoading ? (
                <div className="flex flex-col items-center justify-center text-center p-6 flex-grow">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-sm text-muted-foreground">Generating preview...</p>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center text-center p-6 flex-grow">
                  <p className="text-red-500 mb-2">⚠️ Preview not available</p>
                  <p className="text-sm text-muted-foreground">{previewError}</p>
                  <Button
                    onClick={() => generatePreview()}
                    className="mt-4"
                    disabled={!selectedFile}
                  >
                    Retry Conversion
                  </Button>
                </div>
              ) : previewImage ? (
                <div className="py-4 px-2 flex justify-center" style={{ minHeight: '280px' }}>
                  <img
                    src={previewImage}
                    className="h-full w-full object-fill"
                    alt="Conversion Preview"
                    style={{
                      imageRendering: 'pixelated', // Prevent anti-aliasing/interpolation
                    }}
                  />
                </div>
              ) : selectedFile ? (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <Button
                    onClick={() => generatePreview()}
                    className="mb-2"
                    disabled={!selectedFile}
                  >
                    Generate Preview
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Click to see how your image will look in Minecraft
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Upload an image and adjust settings to see a preview
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Minecraft Coordinates */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Minecraft Origin Coordinates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These coordinates determine the top left corner position of the image in Minecraft. Y
              is the height coordinate. The origin is used for correctly rendering chunk lines and
              positioning the schematic.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="originX">X Coordinate</Label>
                <Input
                  id="originX"
                  type="number"
                  {...form.register('originX', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originZ">Z Coordinate</Label>
                <Input
                  id="originZ"
                  type="number"
                  {...form.register('originZ', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originY">Y Coordinate (Height)</Label>
                <Input
                  id="originY"
                  type="number"
                  {...form.register('originY', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schematic Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Schematic Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure settings for generating a Litematica schematic file. This will create a
              schematic that you can use to build the pixel art in Minecraft.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generateSchematic"
                  checked={form.watch('schematicOptions.generate')}
                  onCheckedChange={(checked) =>
                    form.setValue('schematicOptions.generate', checked === true)
                  }
                />
                <Label htmlFor="generateSchematic" className="text-sm font-normal cursor-pointer">
                  Generate Litematica Schematic
                </Label>
              </div>

              {form.watch('schematicOptions.generate') && (
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="schematicName">Name</Label>
                    <Input
                      id="schematicName"
                      {...form.register('schematicOptions.name')}
                      placeholder="My Pixel Art"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schematicAuthor">Author</Label>
                    <Input
                      id="schematicAuthor"
                      {...form.register('schematicOptions.author')}
                      placeholder="Pixeletica API"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schematicDescription">Description</Label>
                    <Input
                      id="schematicDescription"
                      {...form.register('schematicOptions.description')}
                      placeholder="Description of your pixel art"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Line Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Line Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Customize the colors and opacities of chunk lines and block grid lines. These lines
              help visualize the pixel art in the exported images and make placing the art easier.
              <br />
              <strong>Chunk lines</strong> are the lines that separate chunks in Minecraft, while
              <strong>block grid lines</strong> are the lines that separate individual blocks.
              <br />
              <strong>Note:</strong> The lines do not appear in the preview!
            </p>
            <ColorPicker
              label="Chunk Line Color"
              color={form.watch('chunkLineColor')}
              opacity={form.watch('chunkLineOpacity')}
              onChange={handleChunkLineColorChange}
            />
            <div className="mt-4" />
            <ColorPicker
              label="Block Grid Line Color"
              color={form.watch('blockGridLineColor')}
              opacity={form.watch('blockGridLineOpacity')}
              onChange={handleBlockGridLineColorChange}
            />
          </CardContent>
        </Card>

        {/* Export Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Select multiple options to export separate images with different line settings.
            </p>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Line Visibility Options</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noLines"
                      checked={form.watch('exportOptions.noLines')}
                      onCheckedChange={(checked) =>
                        form.setValue('exportOptions.noLines', checked === true)
                      }
                    />
                    <Label htmlFor="noLines" className="text-sm font-normal cursor-pointer">
                      No lines
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onlyBlockGrid"
                      checked={form.watch('exportOptions.onlyBlockGrid')}
                      onCheckedChange={(checked) =>
                        form.setValue('exportOptions.onlyBlockGrid', checked === true)
                      }
                    />
                    <Label htmlFor="onlyBlockGrid" className="text-sm font-normal cursor-pointer">
                      Only block grid lines
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onlyChunkLines"
                      checked={form.watch('exportOptions.onlyChunkLines')}
                      onCheckedChange={(checked) =>
                        form.setValue('exportOptions.onlyChunkLines', checked === true)
                      }
                    />
                    <Label htmlFor="onlyChunkLines" className="text-sm font-normal cursor-pointer">
                      Only chunk lines
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bothLines"
                      checked={form.watch('exportOptions.bothLines')}
                      onCheckedChange={(checked) =>
                        form.setValue('exportOptions.bothLines', checked === true)
                      }
                    />
                    <Label htmlFor="bothLines" className="text-sm font-normal cursor-pointer">
                      Both lines
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label>Image Division</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Split the image into smaller parts for easier handling and printing, only needed
                  for really large images.
                  <br />
                </p>
                <RadioGroup
                  defaultValue="1"
                  onValueChange={(value) =>
                    form.setValue('exportParts', parseInt(value) as 1 | 2 | 4 | 9)
                  }
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="parts1" />
                    <Label htmlFor="parts1" className="text-sm font-normal cursor-pointer">
                      Single image
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="parts2" />
                    <Label htmlFor="parts2" className="text-sm font-normal cursor-pointer">
                      2 parts
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="parts4" />
                    <Label htmlFor="parts4" className="text-sm font-normal cursor-pointer">
                      4 parts
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="9" id="parts9" />
                    <Label htmlFor="parts9" className="text-sm font-normal cursor-pointer">
                      9 parts
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          Process Image
        </Button>
      </form>
    </div>
  );
}
