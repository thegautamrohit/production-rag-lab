import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { OllamaEmbeddings } from "@langchain/ollama";
import { OpenAIEmbeddings } from "@langchain/openai";

export const getVectorStore = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

  return await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({
      apiKey: process.env.OPEN_AI_SECRET,
      batchSize: 2048,
      model: "text-embedding-3-large",
      dimensions: 1024,
    }),
    { pineconeIndex }
  );
};
