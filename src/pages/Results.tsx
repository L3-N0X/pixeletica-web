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
  GridIcon,
  ImageIcon,
  LayoutIcon,
} from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { LuCopy, LuPencil } from 'react-icons/lu';
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
  const [fileListResponse, setFileListResponse] = useState<any>({});

  // State for file selection
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  // Always show full rendered, original, and dithered images if present
  const mainRenderedImage = files.find(
    (file) => file.fileId?.includes('full') && file.fileId?.includes('render')
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

  // const getFileIcon = (file: FileInfo) => {
  //   if (file.type.includes('image')) {
  //     return <ImageIcon className="h-5 w-5" />;
  //   } else {
  //     return <FileIcon className="h-5 w-5" />;
  //   }
  // };

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
            // Fetch all files, excluding web files
            const filesResponse = await getTaskFiles(taskId, { includeWeb: false });
            // Store the categorized files response
            setFileListResponse(filesResponse.categories);

            // Recursively flatten all FileInfo objects from the nested structure
            function flattenFiles(categories: any): FileInfo[] {
              const collectedFiles: FileInfo[] = [];
              for (const category in categories) {
                if (categories.hasOwnProperty(category)) {
                  const value = categories[category];

                  if (Array.isArray(value)) {
                    // Handles cases where a category value is directly an array of files (currently not used in API response)
                    value.forEach((item: any) => {
                      if (item && typeof item === 'object' && item !== null && 'fileId' in item) {
                        collectedFiles.push(item);
                      }
                    });
                  } else if (typeof value === 'object' && value !== null) {
                    // Check if the value itself is a FileInfo object (e.g., input, dithered, schematic)
                    if ('fileId' in value) {
                      collectedFiles.push(value);
                    } else {
                      // Otherwise, check for nested structures (like 'rendered')
                      for (const subCategory in value) {
                        if (value.hasOwnProperty(subCategory)) {
                          const subValue = value[subCategory];
                          if (Array.isArray(subValue)) {
                            // Handles arrays within subcategories (e.g., rendered.no_lines)
                            subValue.forEach((item: any) => {
                              if (
                                item &&
                                typeof item === 'object' &&
                                item !== null &&
                                'fileId' in item
                              ) {
                                collectedFiles.push(item);
                              }
                            });
                          } else if (
                            typeof subValue === 'object' &&
                            subValue !== null &&
                            'fileId' in subValue
                          ) {
                            // Handles single files within subcategories (if API structure changes)
                            collectedFiles.push(subValue);
                          }
                        }
                      }
                    }
                  }
                }
              }
              return collectedFiles;
            }
            const flattened = flattenFiles(filesResponse.categories);
            setFiles(flattened);
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
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('URL copied to clipboard');
            }}
            className="flex items-center gap-2"
          >
            <LuCopy className="h-5 w-5" /> Copy URL
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/mapviewer/${taskId}`)}
            className="flex items-center gap-2"
          >
            <GridIcon className="h-5 w-5" /> Open Map Viewer
          </Button>
          <Button variant="outline" onClick={() => navigate('/create')}>
            <LuPencil className="h-5 w-5" />
            Convert Another Image
          </Button>
        </div>
      </div>

      {/* Map Preview Card */}
      {mainRenderedImage?.fileId && (
        <Card className="overflow-hidden border-2 border-primary/10 shadow-md flex flex-col mx-auto">
          <CardHeader className="pb-0">
            <div className="flex gap-2 items-center">
              <ImageIcon className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Generated Preview</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-4 flex-grow">
            <div className="flex justify-center items-center bg-muted/30 rounded-lg p-2 min-h-[200px]">
              <img
                src={`/api/conversion/${taskId}/files/${mainRenderedImage.fileId}`}
                alt="Map Preview"
                className="rounded shadow max-h-[400px] w-auto h-auto object-contain"
                style={{ maxWidth: '100%', maxHeight: 400, display: 'block' }}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 pt-1 pb-6 mt-auto flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full flex gap-2 items-center"
              onClick={() => navigate(`/mapviewer/${taskId}`)}
            >
              <GridIcon />
              Open Map Viewer
            </Button>
          </CardFooter>
        </Card>
      )}

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
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadSelected}
                disabled={selectedFileIds.size === 0 || isDownloading}
                variant="secondary"
                className="flex items-center gap-2"
                size="sm"
              >
                <DownloadIcon /> Download Selected ({selectedFileIds.size})
              </Button>
              <Button
                variant="default"
                onClick={handleDownloadAll}
                className="flex items-center gap-2"
                size="sm"
              >
                <DownloadIcon /> Download All Files
              </Button>
            </div>
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
          {/* Files Section - Custom Order */}
          <div className="space-y-6">
            {(() => {
              // Define the desired display order
              const displayOrder = [
                'rendered_main',
                'schematic',
                'dithered',
                'rendered_other',
                'input',
                'task_zip',
              ];

              // Helper to find the main rendered image (_rendered in no_lines)
              const mainRenderedFile = fileListResponse.rendered?.no_lines?.find((f: FileInfo) =>
                f.filename.includes('_rendered')
              );

              // Helper function to render a single file card
              const renderSingleFileCard = (
                category: string,
                file: FileInfo,
                title: string,
                icon: React.ReactNode
              ) => (
                <Card
                  key={category}
                  className="overflow-hidden border-2 border-primary/10 shadow-md"
                >
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="flex gap-2 items-center">
                      {icon} {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex items-center p-3 hover:bg-muted/30">
                      <Checkbox
                        id={`file-${file.fileId}`}
                        checked={selectedFileIds.has(file.fileId)}
                        onCheckedChange={(checked) =>
                          handleSelectFile(file.fileId, checked === true)
                        }
                        className="mr-3"
                      />
                      <div className="flex-1 flex items-center">
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
                  </CardContent>
                </Card>
              );

              // Helper function to render a file row within a card
              const renderFileRow = (file: FileInfo) => (
                <div key={file.fileId} className="flex items-center p-3 hover:bg-muted/30">
                  <Checkbox
                    id={`file-${file.fileId}`}
                    checked={selectedFileIds.has(file.fileId)}
                    onCheckedChange={(checked) => handleSelectFile(file.fileId, checked === true)}
                    className="mr-3"
                  />
                  <div className="flex-1 flex items-center">
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
              );

              return displayOrder.map((item) => {
                switch (item) {
                  case 'rendered_main':
                    return mainRenderedFile
                      ? renderSingleFileCard(
                          'rendered_main',
                          mainRenderedFile,
                          'Main Rendered Image',
                          <ImageIcon className="h-5 w-5" />
                        )
                      : null;
                  case 'schematic':
                    return fileListResponse.schematic
                      ? renderSingleFileCard(
                          'schematic',
                          fileListResponse.schematic,
                          'Schematic File',
                          <LayoutIcon className="h-5 w-5" />
                        )
                      : null;
                  case 'dithered':
                    return fileListResponse.dithered
                      ? renderSingleFileCard(
                          'dithered',
                          fileListResponse.dithered,
                          'Dithered Image',
                          <ImageIcon className="h-5 w-5" />
                        )
                      : null;
                  case 'rendered_other': {
                    const otherRenderedFilesExist = Object.entries(
                      fileListResponse.rendered || {}
                    ).some(([subcat, filesArr]) =>
                      Array.isArray(filesArr)
                        ? filesArr.some((f: FileInfo) => f.fileId !== mainRenderedFile?.fileId)
                        : false
                    );

                    if (!fileListResponse.rendered || !otherRenderedFilesExist) return null;

                    return (
                      <Card
                        key="rendered_other"
                        className="overflow-hidden border-2 border-primary/10 shadow-md"
                      >
                        <CardHeader className="pb-2 border-b">
                          <CardTitle className="flex gap-2 items-center">
                            <ImageIcon className="h-5 w-5" /> Other Rendered Images
                          </CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            Additional rendered images grouped by line type.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          {Object.entries(fileListResponse.rendered).map(([subcat, filesArr]) => {
                            if (!Array.isArray(filesArr) || filesArr.length === 0) return null;
                            const filteredFiles = filesArr.filter(
                              (f: FileInfo) => f.fileId !== mainRenderedFile?.fileId
                            );
                            if (filteredFiles.length === 0) return null;

                            return (
                              <div
                                key={subcat}
                                className="border-b border-primary/10 last:border-b-0"
                              >
                                <div className="px-4 py-2 bg-muted/30 font-semibold text-sm text-primary">
                                  {subcat
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </div>
                                <div className="divide-y divide-primary/10">
                                  {filteredFiles.map(renderFileRow)}
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  }
                  case 'input':
                    return fileListResponse.input
                      ? renderSingleFileCard(
                          'input',
                          fileListResponse.input,
                          'Input Image',
                          <FileIcon className="h-5 w-5" />
                        )
                      : null;
                  case 'task_zip':
                    return fileListResponse.task_zip
                      ? renderSingleFileCard(
                          'task_zip',
                          fileListResponse.task_zip,
                          'Task ZIP Archive',
                          <ArchiveIcon className="h-5 w-5" />
                        )
                      : null;
                  default:
                    return null;
                }
              });
            })()}
          </div>
        </>
      )}
    </div>
  );
}
