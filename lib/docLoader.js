import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "./vectorStore";

const loadData = async () => {
  try {
    // 1. Load the PDF
    const loader = new PDFLoader("./data/cricket_rules.pdf");
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} pages from PDF.`);

    // 2. Split into chunks
    // No need to loop manually! The splitter handles the array of docs for you.
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200, // it signifies the overlap between the chunks
    });

    const allSplits = await splitter.splitDocuments(docs);
    console.log(`Split into ${JSON.stringify(allSplits[0])} chunks.`);

    // 3. Connect to Pinecone
    const vectorStore = await getVectorStore();

    // 4. Index documents
    // The vector store handles embedding generation automatically using the model defined in getVectorStore
    console.log("Adding documents to Pinecone...");
    await vectorStore.addDocuments(allSplits);

    console.log("Successfully ingrained PDF into Pinecone!");
  } catch (error) {
    console.log(error);
  }
};

loadData();
