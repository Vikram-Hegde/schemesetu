import { Pinecone } from '@pinecone-database/pinecone'
import { HuggingFaceTransformersEmbeddings } from 'langchain/embeddings/hf_transformers'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

export async function vectorRetriever() {
	const pinecone = new Pinecone()
	const pineconeIndex = pinecone.Index('chatbot')
	const vectorStore = await PineconeStore.fromExistingIndex(
		new HuggingFaceTransformersEmbeddings({
			modelName: 'Xenova/all-MiniLM-L6-v2',
		}),
		{ pineconeIndex }
	)
	const retriever = vectorStore.asRetriever()
	return retriever
}
