import { NextRequest, NextResponse } from "next/server";
import { PromptTemplate } from "@langchain/core/prompts";
import { Ollama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { getVectorStore } from "@/lib/vectorStore";
import { StringOutputParser } from "@langchain/core/output_parsers";


export async function POST(request: NextRequest) {
  try {
    const jsonRequest = await request.json();
    const { query } = jsonRequest;

    const vectorStore = await getVectorStore();
    const parser = new StringOutputParser();

    const storeRetriever = vectorStore.asRetriever({
      searchType: "mmr",
      k: 4,
    });

    const result = await storeRetriever.invoke(query);

    // console.log("RESULT>>>>>>>:", result);

    const context = result.map((doc) => doc.pageContent).join("\n\n");
    // // console.log("context>>>>>>>:", context);

    const LLM = new ChatOpenAI({
      apiKey: process.env.OPEN_AI_SECRET,
      model: "gpt-4",
      temperature: 0.7,
    });

    const PromptTemp = new PromptTemplate({
      template: `You are a helpful assistant.
            Answer the question using ONLY the context below.
            If the answer is not present in the context, say:
            "I don't have enough information in the provided document."

            Context:
            {context}

            Question:
            {userQuery}

            Answer briefly and clearly.`,
      inputVariables: ["userQuery", "context"],
      validateTemplate: true,
    });

    const chain = PromptTemp.pipe(LLM).pipe(parser);
    const resultLLM = await chain.invoke({ userQuery: query, context });

    return NextResponse.json({ result: resultLLM });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
