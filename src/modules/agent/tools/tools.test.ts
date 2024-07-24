import { ChatOpenAI } from "@langchain/openai";
import initTools from ".";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { OpenAIEmbeddings } from "@langchain/openai";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";

describe("Tool Chain", () => {
  it("should return two tools", async () => {
    const graph = await Neo4jGraph.initialize({
      url: process.env.NEO4J_URI as string,
      username: process.env.NEO4J_USERNAME as string,
      password: process.env.NEO4J_PASSWORD as string,
      database: process.env.NEO4J_DATABASE as string | undefined,
    });

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
    const tools = await initTools(llm, embeddings, graph);

    expect(tools).toBeDefined();
    expect(tools.length).toBeGreaterThanOrEqual(2);

    await graph.close();
  });
});
