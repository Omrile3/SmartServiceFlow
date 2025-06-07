import { createClient } from './SSF';

const SSF = createClient({
  appId: "67f254a6ecd95f1fd2dae77f", 
  requiresAuth: true
});

export const Core = SSF.integrations.Core;
export const UploadFile = SSF.integrations.Core.UploadFile;
export const ExtractDataFromUploadedFile = SSF.integrations.Core.ExtractDataFromUploadedFile;
