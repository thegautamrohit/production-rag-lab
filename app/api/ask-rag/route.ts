import { NextRequest, NextResponse } from "next/server";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { getVectorStore } from "@/lib/vectorStore";
import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";
import { createRetrievalChain } from "@langchain/classic/chains/retrieval";

export async function POST(request: NextRequest) {
  try {
    const jsonRequest = await request.json();
    const { query } = jsonRequest;

    // Get Vector Store
    const vectorStore = await getVectorStore();

    // Create Retriever
    const retriever = vectorStore.asRetriever({
      searchType: "mmr",
      k: 4,
    });

    // Initialise LLM
    const LLM = new ChatOpenAI({
      apiKey: process.env.OPEN_AI_SECRET,
      model: "gpt-4",
      temperature: 0.7,
    });

    // Create Prompt
    const prompt = ChatPromptTemplate.fromTemplate(
      `You are a helpful assistant.

        Answer the question using ONLY the context below.
        If the answer is not present in the context, say:
        "I don't have enough information in the provided document."

        Context:
        {context}

        Question:
        {input}

        Answer briefly and clearly.`
    );

    // Document-combining chain
    const combineDocsChain = await createStuffDocumentsChain({
      llm: LLM,
      prompt,
    });

    // Retrieval chain
    const retrievalChain = await createRetrievalChain({
      retriever,
      combineDocsChain,
    });

    const response = await retrievalChain.invoke({ input: query });

    return NextResponse.json({
      response: response.answer,
      sources: response.context.map((doc) => doc.metadata),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
