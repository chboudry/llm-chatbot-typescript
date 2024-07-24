import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import initAgent from "./agent";
import { initGraph } from "../graph";
import { sleep } from "@/utils";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";

// tag::function[]
export async function call(input: string, sessionId: string): Promise<string> {
  // tag::model[]
  const llm = new AzureChatOpenAI({
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_LLM_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: "2024-06-01",
  });
  
  // end::model[]
  // tag::embeddings[]
  const embeddings = new AzureOpenAIEmbeddings({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY, // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME, 
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDING_DEPLOYMENT_NAME, 
    azureOpenAIApiVersion: "2024-06-01", // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
  });
  // end::embeddings[]
  // tag::graph[]
  // Get Graph Singleton
  const graph = await initGraph();
  // end::graph[]

  // tag::call[]
  const agent = await initAgent(llm, embeddings, graph);
  const res = await agent.invoke({ input }, { configurable: { sessionId } });

  return res;
  // end::call[]
}
// end::function[]
