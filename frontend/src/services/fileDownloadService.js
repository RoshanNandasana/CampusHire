import api from './api';

/**
 * Robust file download service with retry logic and proper error handling
 * Handles blob downloads for PDFs, images, documents across all panels
 */

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;
const BLOB_REVOKE_TIMEOUT_MS = 60000;

function inferMimeTypeFromFilename(filename = '') {
  const ext = String(filename).toLowerCase().split('.').pop();
  const mimeMap = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    html: 'text/html',
  };
  return mimeMap[ext] || '';
}

/**
 * Downloads a blob with automatic retries
 * @param {Function} downloadFn - Async function that returns a blob response
 * @param {string} errorMessage - Custom error message to show on final failure
 * @param {number} retries - Current retry attempt
 * @returns {Promise<Blob>} The downloaded blob
 */
async function downloadWithRetry(downloadFn, errorMessage = 'Failed to download file', retries = 0) {
  try {
    const response = await downloadFn();
    
    // Check if response is valid
    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    // Don't retry on auth errors or not found errors
    if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
      const statusMessage = {
        401: 'You do not have permission to access this file',
        403: 'Access denied to this file',
        404: 'File not found on server',
      };
      throw new Error(statusMessage[error.response.status] || errorMessage);
    }
    
    // Retry on network errors and server errors
    if (retries < MAX_RETRIES) {
      console.warn(`Download attempt ${retries + 1} failed, retrying in ${RETRY_DELAY_MS}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return downloadWithRetry(downloadFn, errorMessage, retries + 1);
    }
    
    console.error(`Download failed after ${MAX_RETRIES} retries:`, error);
    throw new Error(errorMessage);
  }
}

/**
 * Opens a file (blob) in a new tab
 * @param {Blob} blob - The file blob to open
 * @param {string} filename - Optional filename for download
 */
export function openBlobInNewTab(blob, filename = 'download') {
  try {
    let viewBlob = blob;

    // If backend returns generic octet-stream, infer a better MIME type for inline viewing.
    if (blob instanceof Blob && (!blob.type || blob.type === 'application/octet-stream')) {
      const inferredType = inferMimeTypeFromFilename(filename);
      if (inferredType) {
        viewBlob = new Blob([blob], { type: inferredType });
      }
    }

    const blobUrl = window.URL.createObjectURL(viewBlob);
    const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');

    // Fallback for browsers blocking popup/open operation.
    if (!opened) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Revoke object URL after a delay to allow the browser to handle the file
    setTimeout(() => {
      try {
        window.URL.revokeObjectURL(blobUrl);
      } catch (e) {
        console.warn('Could not revoke blob URL:', e);
      }
    }, BLOB_REVOKE_TIMEOUT_MS);
  } catch (error) {
    console.error('Error opening blob:', error);
    throw new Error('Could not open file');
  }
}

/**
 * Student - View profile document
 */
export async function viewStudentDocument(documentUrl, filename) {
  try {
    const blob = await downloadWithRetry(
      () => api.get('/student/profile/document-view', {
        params: { url: documentUrl },
        responseType: 'blob',
      }),
      'Failed to load student document'
    );
    
    openBlobInNewTab(blob, filename);
  } catch (error) {
    console.error('Error viewing student document:', error);
    throw error;
  }
}

/**
 * Student - View study material file
 */
export async function viewStudentMaterial(materialId, filename) {
  try {
    const blob = await downloadWithRetry(
      () => api.get(`/student/materials/${materialId}/file`, {
        responseType: 'blob',
      }),
      'Failed to load study material'
    );
    
    openBlobInNewTab(blob, filename);
  } catch (error) {
    console.error('Error viewing student material:', error);
    throw error;
  }
}

/**
 * TPO - View material file
 */
export async function viewTPOMaterial(materialId, filename) {
  try {
    const blob = await downloadWithRetry(
      () => api.get(`/tpo/materials/${materialId}/file`, {
        responseType: 'blob',
      }),
      'Failed to load material'
    );
    
    openBlobInNewTab(blob, filename);
  } catch (error) {
    console.error('Error viewing TPO material:', error);
    throw error;
  }
}

/**
 * Recruiter - View applicant document
 */
export async function viewApplicantDocument(applicationId, documentUrl, filename) {
  try {
    const blob = await downloadWithRetry(
      () => api.get(`/recruiter/applications/${applicationId}/document`, {
        params: { url: documentUrl },
        responseType: 'blob',
      }),
      'Failed to load applicant document'
    );
    
    openBlobInNewTab(blob, filename);
  } catch (error) {
    console.error('Error viewing applicant document:', error);
    throw error;
  }
}

/**
 * Generic file download handler
 * @param {Function} apiCall - The axios API call function
 * @param {string} filename - Filename to use for download
 */
export async function downloadFile(apiCall, filename = 'download') {
  try {
    const blob = await downloadWithRetry(
      () => apiCall(),
      'Failed to download file'
    );
    
    // For download, always use the filename
    const link = document.createElement('a');
    const blobUrl = window.URL.createObjectURL(blob);
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      try {
        window.URL.revokeObjectURL(blobUrl);
      } catch (e) {
        console.warn('Could not revoke blob URL:', e);
      }
    }, BLOB_REVOKE_TIMEOUT_MS);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

const fileDownloadService = {
  viewStudentDocument,
  viewStudentMaterial,
  viewTPOMaterial,
  viewApplicantDocument,
  downloadFile,
  openBlobInNewTab,
  downloadWithRetry,
};

export default fileDownloadService;
