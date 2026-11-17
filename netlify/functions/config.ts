export const messages = {
  // mongodb
  connectSuccess: 'Database connection successful.',
  connectConnected: 'The database is online.',
  connectError: 'Database connection failed.',
  selectSuccess: 'Data load successfully.',
  selectError: 'Failed to load data.',
  insertSuccess: 'Data saved successfully',
  insertError: 'Data saving failed',
  deleteSuccess: 'Data deleted successfully',
  deleteError: 'Data deletion failed',
  deleteNotFound: 'No matching document to delete.',
  updateSuccess: 'Data updated successfully',
  updateError: 'Data update failed',
  updateNotFound: 'No matching document to update.',
  invalidId: 'Invalid _id.',
  invalidPayload: 'Update payload must be a plain object of field values.',
  // cloudinary image
  uploadError: 'Upload failed',
  uploadSuccess: 'Upload successful',
  searchError: 'Search image failed',
  searchSuccess: 'Search image successful',
  removeError: 'Remove image or folder failed',
  removeSuccess: 'Remove image or folder successful',
  removeInvalidTarget: 'Invalid target: it does not name a single file or folder.',
  // authorization
  authNotConfigured: 'Auth0 verification is not configured on the server.',
  authMissing: 'Authorization header is missing.',
  authInvalid: 'Access token is invalid or expired.',
  authNoEmailClaim: 'Access token carries no email claim.',
  authEmailUnverified: 'Email is not verified.',
  authNoPermission: 'Permission denied.',
  collectionNotAllowed: 'Unknown collection.',
};

export const limit = '10mb';
