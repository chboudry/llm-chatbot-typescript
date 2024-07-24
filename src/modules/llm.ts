import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { DefaultAzureCredential } from "@azure/identity";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";



/*export const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4",
  temperature: 0,
});*/

/*export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY as string,
});*/


const credentials = new DefaultAzureCredential();

const llm = new AzureChatOpenAI({
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_LLM_DEPLOYMENT_NAME,
  azureOpenAIApiVersion: "2024-06-01",
});


const embeddings = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY, // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME, 
  azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDING_DEPLOYMENT_NAME, 
  azureOpenAIApiVersion: "2024-06-01", // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
});