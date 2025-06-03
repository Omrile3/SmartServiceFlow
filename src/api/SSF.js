export const createClient = (config) => {
  return {
    integrations: {
      Core: {
        InvokeLLM: () => "Invoking LLM...",
        SendEmail: () => "Sending Email...",
        SendSMS: () => "Sending SMS...",
        UploadFile: () => "Uploading File...",
        GenerateImage: () => "Generating Image...",
        ExtractDataFromUploadedFile: () => "Extracting Data...",
      },
    },
    entities: {
      Restaurant: "Restaurant Entity",
      MenuItem: "MenuItem Entity",
      ServiceRequest: "ServiceRequest Entity",
      Order: "Order Entity",
      ServiceType: "ServiceType Entity",
    },
    auth: "User Authentication",
  };
};
