
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFileById, updateFile, deleteFile } from '@/utils/file-storage';
import { FileDetail } from '@/components/file-detail';
import { FilePreview } from '@/components/file-preview';
import { FileToolbar } from '@/components/file-toolbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { downloadFile } from '@/utils/file-storage';
import { logInfo, LogCategory } from '@/utils/audit-logger';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { EncryptionData } from '@/utils/encryption';
import { Badge } from '@/components/ui/badge';

export default function FileDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  
  // Added state for decryption
  const [isDecryptDialogOpen, setIsDecryptDialogOpen] = useState(false);
  const [decryptPassword, setDecryptPassword] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  useEffect(() => {
    loadFile();
  }, [id]);

  const loadFile = async () => {
    if (!id) {
      setError('File ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fileData = getFileById(id);
      
      if (!fileData) {
        setError('File not found');
        setLoading(false);
        return;
      }
      
      setFile(fileData);
      setNewFileName(fileData.name);
      setLoading(false);
    } catch (err) {
      console.error('Error loading file:', err);
      setError('Failed to load file details');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!file) return;
    
    try {
      downloadFile(file.id);
      logInfo(LogCategory.FILE, `File downloaded: ${file.name}`, { fileId: file.id });
      toast.success('File download started');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file');
    }
  };

  const handleToggleFavorite = () => {
    if (!file) return;
    
    try {
      const updatedFile = { ...file, isFavorite: !file.isFavorite };
      updateFile(updatedFile);
      setFile(updatedFile);
      
      logInfo(
        LogCategory.FILE, 
        `File ${updatedFile.isFavorite ? 'marked as favorite' : 'removed from favorites'}: ${file.name}`,
        { fileId: file.id }
      );
      
      toast.success(
        updatedFile.isFavorite 
          ? 'Added to favorites' 
          : 'Removed from favorites'
      );
    } catch (err) {
      console.error('Error updating favorite status:', err);
      toast.error('Failed to update favorite status');
    }
  };

  const handleDeleteFile = async () => {
    if (!file) return;
    
    try {
      setIsDeleting(true);
      deleteFile(file.id);
      
      logInfo(LogCategory.FILE, `File deleted: ${file.name}`, { fileId: file.id });
      
      toast.success('File deleted successfully');
      setIsDeleteDialogOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error('Failed to delete file');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameFile = async () => {
    if (!file || !newFileName.trim()) return;
    
    try {
      setIsRenaming(true);
      
      const updatedFile = { 
        ...file, 
        name: newFileName.trim(),
        modified: new Date().toISOString()
      };
      
      updateFile(updatedFile);
      setFile(updatedFile);
      
      logInfo(LogCategory.FILE, `File renamed: ${file.name} → ${newFileName}`, { 
        fileId: file.id,
        oldName: file.name,
        newName: newFileName
      });
      
      toast.success('File renamed successfully');
      setIsRenameDialogOpen(false);
    } catch (err) {
      console.error('Error renaming file:', err);
      toast.error('Failed to rename file');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDecryptFile = async () => {
    if (!file) return;
    
    try {
      setIsDecrypting(true);
      setDecryptError(null);
      
      if (!file.isEncrypted) {
        setDecryptError('This file is not encrypted');
        return;
      }
      
      if (!file.encryptionData) {
        setDecryptError('Encryption data is missing');
        return;
      }
      
      // For demo purposes, we're just checking if password is not empty
      // In a real app, this would validate against the actual encryption key
      if (!decryptPassword.trim()) {
        setDecryptError('Password is required');
        return;
      }
      
      // Simulate decryption success
      toast.success('File decrypted successfully');
      setIsDecryptDialogOpen(false);
      
      // Log the decryption attempt
      logInfo(LogCategory.SECURITY, `File decrypted: ${file.name}`, { fileId: file.id });
      
    } catch (err) {
      console.error('Decryption error:', err);
      setDecryptError('Failed to decrypt file');
    } finally {
      setIsDecrypting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading file details...</p>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading File</h2>
          <p className="text-muted-foreground mb-4">{error || 'File not found'}</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Format the date string for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold truncate">{file.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - File preview */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-[500px]">
            <FilePreview 
              file={file} 
              className="w-full h-full object-contain" 
            />
          </Card>
        </div>
        
        {/* Right column - File details and tools */}
        <div className="space-y-6">
          {/* Toolbar */}
          <FileToolbar 
            file={file}
            onDownload={handleDownload}
            onToggleFavorite={handleToggleFavorite}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onRename={() => setIsRenameDialogOpen(true)}
            onDecrypt={file.isEncrypted ? () => setIsDecryptDialogOpen(true) : undefined}
          />
          
          {/* File details */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">File Details</h3>
            
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {file.tags && file.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
                {file.isEncrypted && <Badge variant="destructive">Encrypted</Badge>}
              </div>
              
              <FileDetail label="File Type" value={file.type || 'Unknown'} />
              <FileDetail label="Size" value={file.size || 'Unknown'} />
              <FileDetail label="Created" value={formatDate(file.created || null)} />
              <FileDetail label="Modified" value={formatDate(file.modified || null)} />
              <FileDetail label="Created By" value={file.createdBy || 'Unknown'} />
              
              {file.isEncrypted && (
                <div className="border-t pt-3 mt-3">
                  <h4 className="text-sm font-medium mb-2">Encryption Information</h4>
                  <FileDetail label="Algorithm" value={file.encryptionData?.algorithm || 'AES'} />
                  <FileDetail label="Checksum" value={file.checksum || 'Not available'} />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Delete dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{file.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteFile}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rename dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Enter a new name for "{file.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="file-name">File name</Label>
            <Input
              id="file-name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleRenameFile}
              disabled={isRenaming || !newFileName.trim() || newFileName === file.name}
            >
              {isRenaming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                'Rename'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Decrypt dialog */}
      <Dialog open={isDecryptDialogOpen} onOpenChange={setIsDecryptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decrypt File</DialogTitle>
            <DialogDescription>
              Enter the password to decrypt "{file.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="decrypt-password">Decryption password</Label>
            <Input
              id="decrypt-password"
              type="password"
              value={decryptPassword}
              onChange={(e) => setDecryptPassword(e.target.value)}
              className="mt-1"
            />
            {decryptError && (
              <p className="text-sm text-destructive mt-2">{decryptError}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDecryptDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleDecryptFile}
              disabled={isDecrypting || !decryptPassword.trim()}
            >
              {isDecrypting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Decrypting...
                </>
              ) : (
                'Decrypt'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
