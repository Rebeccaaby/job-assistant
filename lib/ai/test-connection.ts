import { AzureOpenAI } from "openai";

export async function testAzureConnection() {
  const client = new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: "2024-05-01-preview",
  });

  try {
    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'Connection successful!' if you can read this." }
      ],
      max_tokens: 50,
    });

    console.log("Azure OpenAI Connection Successful!");
    console.log("Response:", response.choices[0].message.content);
    return true;
  } 
  catch (error) {
    console.error("Connection failed:", error);
    return false;
  }
}