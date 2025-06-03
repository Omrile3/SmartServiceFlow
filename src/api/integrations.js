import { createClient } from './SSF';

const SSF = createClient({
  appId: "67f254a6ecd95f1fd2dae77f", 
  requiresAuth: true
});

export const Core = SSF.integrations.Core;

export const InvokeLLM = SSF.integrations.Core.InvokeLLM;

export const SendEmail = SSF.integrations.Core.SendEmail;

export const SendSMS = SSF.integrations.Core.SendSMS;

export const UploadFile = SSF.integrations.Core.UploadFile;

export const GenerateImage = SSF.integrations.Core.GenerateImage;

export const ExtractDataFromUploadedFile = SSF.integrations.Core.ExtractDataFromUploadedFile;
