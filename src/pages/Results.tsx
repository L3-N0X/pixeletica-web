import {
  downloadAllFiles,
  downloadFile,
  downloadSelectedFiles,
  FileInfo,
  formatFileSize,
  getConversionStatus,
  getTaskFiles,
} from '@/api/conversion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { H1, P } from '@/components/ui/typography';
import {
  ArchiveIcon,
  DownloadIcon,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  LayoutIcon,
} from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function Results() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  // State for files and loading
  const [loading, setLoading] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [fileListResponse, setFileListResponse] = useState<{ [category: string]: FileInfo[] }>({});

  // State for file selection
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  // Get main files (rendered image and schematic)
  const mainRenderedImage = files.find(
    (file) => file.category === 'rendered' && !file.filename.includes('thumbnail')
  );
  const schematicFile = files.find((file) => file.category === 'schematic');

  // Group files by category
  const imageFiles = files.filter(
    (file) =>
      (file.category === 'dithered' || file.category === 'rendered' || file.category === 'split') &&
      !(file === mainRenderedImage)
  );

  const webFiles = files.filter((file) => file.category === 'web');
  const otherFiles = files.filter(
    (file) =>
      file !== mainRenderedImage &&
      file !== schematicFile &&
      !imageFiles.includes(file) &&
      !webFiles.includes(file)
  );

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set<string>(files.map((file) => file.fileId));
      setSelectedFileIds(allIds);
    } else {
      setSelectedFileIds(new Set());
    }
  };

  // Handle individual file selection
  const handleSelectFile = (fileId: string, checked: boolean) => {
    const newSelection = new Set(selectedFileIds);
    if (checked) {
      newSelection.add(fileId);
    } else {
      newSelection.delete(fileId);
    }
    setSelectedFileIds(newSelection);
  };

  // Handle download of selected files
  const handleDownloadSelected = async () => {
    if (selectedFileIds.size === 0 || !taskId) {
      toast.error('No files selected');
      return;
    }

    setIsDownloading(true);
    try {
      await downloadSelectedFiles(taskId, Array.from(selectedFileIds));
      toast.success('Files downloaded successfully');
    } catch (error) {
      console.error('Error downloading files:', error);
      toast.error('Failed to download files');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle download of all files
  const handleDownloadAll = () => {
    if (!taskId) return;

    try {
      downloadAllFiles(taskId);
      toast.success('All files download started');
    } catch (error) {
      console.error('Error downloading all files:', error);
      toast.error('Failed to download all files');
    }
  };

  // Handle individual file download
  const handleDownloadSingle = (fileId: string, filename: string) => {
    if (!taskId) return;

    try {
      downloadFile(taskId, fileId, filename);
      toast.success(`Downloading ${filename}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(`Failed to download ${filename}`);
    }
  };

  // Get icon based on file type
  const getFileIcon = (file: FileInfo) => {
    if (file.type.includes('image')) {
      return <ImageIcon className="h-5 w-5" />;
    } else if (file.category === 'schematic') {
      return <LayoutIcon className="h-5 w-5" />;
    } else if (file.type.includes('text')) {
      return <FileTextIcon className="h-5 w-5" />;
    } else if (file.type.includes('zip')) {
      return <ArchiveIcon className="h-5 w-5" />;
    }
    return <FileIcon className="h-5 w-5" />;
  };

  useEffect(() => {
    if (!taskId) {
      setError('No task ID provided');
      setLoading(false);
      return;
    }

    // Fetch initial task status to confirm it exists and is completed
    const fetchTaskStatus = async () => {
      try {
        const response = await getConversionStatus(taskId);

        if (response.status === 'failed') {
          setError(`Conversion failed: ${response.error || 'Unknown error'}`);
          setLoading(false);
        } else if (response.status !== 'completed') {
          // If not completed yet, redirect back to the create page
          // where the loading overlay and polling should be shown
          navigate('/create');
          return;
        } else {
          // Status is completed, now fetch the files
          setLoadingFiles(true);
          try {
            const filesResponse = await getTaskFiles(taskId, { includeWeb: false });
            // Store the categorized files response
            setFileListResponse(filesResponse.categories);

            // Convert the categorized structure to a flat array for compatibility with existing code
            const allFiles: FileInfo[] = [];
            Object.values(filesResponse.categories).forEach((categoryFiles) => {
              allFiles.push(...categoryFiles);
            });
            setFiles(allFiles);
          } catch (err) {
            toast.error('Could not load file list');
            console.error('Error loading file list:', err);
          } finally {
            setLoadingFiles(false);
            setLoading(false);
          }
        }
      } catch (err) {
        setError('Failed to load task information');
        setLoading(false);
        toast.error('Could not load conversion results');
      }
    };

    fetchTaskStatus();
  }, [taskId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Results</CardTitle>
            <CardDescription>Retrieving your conversion results...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" onClick={() => navigate('/create')}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center">
        <div>
          <H1 className="mb-2">Conversion Results</H1>
          <P className="text-muted-foreground">Task ID: {taskId}</P>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Button
            variant="default"
            onClick={() => navigate(`/mapviewer/${taskId}`)}
            className="flex items-center gap-2"
          >
            <LayoutIcon /> Open Map Viewer
          </Button>
          <Button variant="default" onClick={handleDownloadAll} className="flex items-center gap-2">
            <DownloadIcon /> Download All Files
          </Button>
          <Button variant="outline" onClick={() => navigate('/create')}>
            Convert Another Image
          </Button>
        </div>
      </div>

      {/* Selection controls */}
      <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
        <CardHeader className="bg-muted/50 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id="selectAll"
                checked={selectedFileIds.size === files.length && files.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="selectAll" className="text-sm font-medium cursor-pointer">
                Select All Files
              </label>
            </div>
            <Button
              onClick={handleDownloadSelected}
              disabled={selectedFileIds.size === 0 || isDownloading}
              variant="secondary"
              className="flex items-center gap-2"
              size="sm"
            >
              <DownloadIcon /> Download Selected ({selectedFileIds.size})
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loadingFiles ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading Files</CardTitle>
            <CardDescription>Retrieving available files...</CardDescription>
          </CardHeader>
        </Card>
      ) : files.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Files Available</CardTitle>
            <CardDescription>No files were found for this conversion.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {/* Main Download Options */}
          <div className="grid gap-4 md:grid-cols-2">
            {mainRenderedImage && (
              <Card className="overflow-hidden border-2 border-primary/10 shadow-md flex flex-col">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-start">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <ImageIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Full Rendered Image</CardTitle>
                        <CardDescription>
                          High quality rendered Minecraft block image
                        </CardDescription>
                      </div>
                    </div>
                    <Checkbox
                      id={`file-${mainRenderedImage.fileId}`}
                      checked={selectedFileIds.has(mainRenderedImage.fileId)}
                      onCheckedChange={(checked) =>
                        handleSelectFile(mainRenderedImage.fileId, checked === true)
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-4 flex-grow">
                  <div className="bg-muted/30 rounded-lg p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{mainRenderedImage.filename}</span>
                      <span className="text-muted-foreground  whitespace-nowrap">
                        ({formatFileSize(mainRenderedImage.size)})
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 pt-1 pb-6 mt-auto">
                  <Button
                    variant="default"
                    className="w-full flex gap-2 items-center"
                    onClick={() =>
                      handleDownloadSingle(mainRenderedImage.fileId, mainRenderedImage.filename)
                    }
                  >
                    <DownloadIcon /> Download Image
                  </Button>
                </CardFooter>
              </Card>
            )}

            {schematicFile && (
              <Card className="overflow-hidden border-2 border-primary/10 shadow-md flex flex-col">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-start">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <LayoutIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Schematic File</CardTitle>
                        <CardDescription>Build your image in Minecraft</CardDescription>
                      </div>
                    </div>
                    <Checkbox
                      id={`file-${schematicFile.fileId}`}
                      checked={selectedFileIds.has(schematicFile.fileId)}
                      onCheckedChange={(checked) =>
                        handleSelectFile(schematicFile.fileId, checked === true)
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-4 flex-grow">
                  <div className="bg-muted/30 rounded-lg p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{schematicFile.filename}</span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        ({formatFileSize(schematicFile.size)})
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 pt-1 pb-6 mt-auto">
                  <Button
                    variant="default"
                    className="w-full flex gap-2 items-center"
                    onClick={() =>
                      handleDownloadSingle(schematicFile.fileId, schematicFile.filename)
                    }
                  >
                    <DownloadIcon /> Download Schematic
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Additional Image Files Section */}
          {imageFiles.length > 0 && (
            <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
              <CardHeader className="pb-4 border-b border-primary/30">
                <CardTitle className="flex gap-2 items-center">
                  <ImageIcon className="h-5 w-5" /> Additional Image Files
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Here you can download additional image files generated during the conversion.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-primary/10">
                  {imageFiles.map((file) => (
                    <div key={file.fileId} className="flex items-center p-3 hover:bg-muted/30">
                      <Checkbox
                        id={`file-${file.fileId}`}
                        checked={selectedFileIds.has(file.fileId)}
                        onCheckedChange={(checked) =>
                          handleSelectFile(file.fileId, checked === true)
                        }
                        className="mr-3"
                      />
                      <div className="flex-1 flex items-center">
                        {getFileIcon(file)}
                        <span className="ml-2">{file.filename}</span>
                        <span className="ml-2 text-muted-foreground text-sm">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button
                        onClick={() => handleDownloadSingle(file.fileId, file.filename)}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Web Files Section */}
          {webFiles.length > 0 && (
            <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex gap-2 items-center">
                  <FileTextIcon className="h-5 w-5" /> Web Files
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {webFiles.map((file) => (
                    <div key={file.fileId} className="flex items-center p-3 hover:bg-muted/30">
                      <Checkbox
                        id={`file-${file.fileId}`}
                        checked={selectedFileIds.has(file.fileId)}
                        onCheckedChange={(checked) =>
                          handleSelectFile(file.fileId, checked === true)
                        }
                        className="mr-3"
                      />
                      <div className="flex-1 flex items-center">
                        {getFileIcon(file)}
                        <span className="ml-2">{file.filename}</span>
                        <span className="ml-2 text-muted-foreground text-sm">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button
                        onClick={() => handleDownloadSingle(file.fileId, file.filename)}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other Files */}
          {otherFiles.length > 0 && (
            <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex gap-2 items-center">
                  <FileIcon className="h-5 w-5" /> Other Files
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {otherFiles.map((file) => (
                    <div key={file.fileId} className="flex items-center p-3 hover:bg-muted/30">
                      <Checkbox
                        id={`file-${file.fileId}`}
                        checked={selectedFileIds.has(file.fileId)}
                        onCheckedChange={(checked) =>
                          handleSelectFile(file.fileId, checked === true)
                        }
                        className="mr-3"
                      />
                      <div className="flex-1 flex items-center">
                        {getFileIcon(file)}
                        <span className="ml-2">{file.filename}</span>
                        <span className="ml-2 text-muted-foreground text-sm">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button
                        onClick={() => handleDownloadSingle(file.fileId, file.filename)}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/maps')}
              className="flex items-center gap-2 mt-4"
            >
              View All Maps
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
