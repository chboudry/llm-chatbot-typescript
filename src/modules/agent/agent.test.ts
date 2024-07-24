import initAgent from "./agent";
import { config } from "dotenv";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Embeddings } from "langchain/embeddings/base";
import { BaseChatModel } from "langchain/chat_models/base";
import { Runnable } from "@langchain/core/runnables";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";

describe("Langchain Agent", () => {
  let llm: any;
  let embeddings: any;
  let graph: Neo4jGraph;
  let executor: Runnable;

  beforeAll(async () => {
    config({ path: ".env.local" });

    graph = await Neo4jGraph.initialize({
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

    executor = await initAgent(llm, embeddings, graph);
  });

  afterAll(() => graph.close());

  describe("Vector Retrieval", () => {
    it("should perform RAG using the neo4j vector retriever", async () => {
      const sessionId = "agent-rag-1";
      const input = "Recommend me a movie about ghosts";

      const output = await executor.invoke(
        {
          input,
        },
        {
          configurable: {
            sessionId,
          },
        }
      );

      // Check database
      const sessionRes = await graph.query(
        `
        MATCH (s:Session {id: $sessionId })-[:LAST_RESPONSE]->(r)
        RETURN r.input AS input, r.output AS output, r.source AS source,
          count { (r)-[:CONTEXT]->() } AS context,
          [ (r)-[:CONTEXT]->(m) | m.title ] AS movies
      `,
        { sessionId }
      );

      expect(sessionRes).toBeDefined();
      if (sessionRes) {
        expect(sessionRes.length).toBe(1);
        expect(sessionRes[0].input).toBe(input);

        let found = false;

        for (const movie of sessionRes[0].movies) {
          if (output.toLowerCase().includes(movie.toLowerCase())) {
            found = true;
          }
        }

        expect(found).toBe(true);
      }
    });
  });
});
