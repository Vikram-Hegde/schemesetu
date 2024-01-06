import { Message, StreamingTextResponse } from 'ai'
import { LLMChain } from 'langchain/chains'
import { CloudflareWorkersAI } from 'langchain/llms/cloudflare_workersai'
import { HuggingFaceInference } from 'langchain/llms/hf'
import { PromptTemplate } from 'langchain/prompts'
import { BytesOutputParser } from 'langchain/schema/output_parser'
import { formatDocumentsAsString } from 'langchain/util/document'
import { vectorRetriever } from '../retriever'

const formatMessage = (message: Message) => {
	return `<|${message.role}|>: ${message.content}</s>`
}

const questionPrompt = PromptTemplate.fromTemplate(
	`
<|system|>
You are a helpful and enthusiastic support bot named "SchemeSetu" who can answer a given question about Indian government schemes. 
Try to find the answer in the context and chat history. 
If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@india.com. 
Don't try to make up an answer. 
Always speak as if you were chatting to a friend.
------------------
CONTEXT: {context}
------------------
CHAT HISTORY: {chat_history}
------------------
</s>
<|user|>
{question}</s>
<|assistant|>
`,
)

const basicAnswerPrompt = PromptTemplate.fromTemplate(`
<|system|>
You are a helpful chatbot named SchemeSetu.
Based on the question asked answer in context to Indian government schemes.
If its a greeting or a wish, greet them back and ask if they have any questions regarding schemes.
Do not generate further inputs.
Chat History:
{chat_history}
</s>
<|user|>
{question}</s>
<|assistant|>
`)

const determine_prompt = PromptTemplate.fromTemplate(`
Answer the following yes/no question, is the following sentence a question about government schemes
Sentence: {sentence}
Your Answer: 
`)
const determine = new HuggingFaceInference({
	model: 'google/flan-t5-xxl',
	apiKey: process.env.HUGGINGFACEHUB_API_KEY,
	temperature: 0.001,
})

const determine_chain = new LLMChain({
	llm: determine,
	prompt: determine_prompt,
})

const model = new CloudflareWorkersAI({
	cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
	cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
	model: '@hf/thebloke/zephyr-7b-beta-awq',
	baseUrl: `https://gateway.ai.cloudflare.com/v1/${process.env.CLOUDFLARE_ACCOUNT_ID}/schemesetu/workers-ai`,
	cache: true,
	streaming: true,
	maxRetries: 3,
	// verbose: true,
})

const outputParser = new BytesOutputParser()
const chainBasic = basicAnswerPrompt.pipe(model).pipe(outputParser)
const chainWithContext = questionPrompt.pipe(model).pipe(outputParser)

const performQuestionAnswering = async (
	question: string,
	chatHistory: string,
) => {
	const { text } = await determine_chain.invoke({
		sentence: question,
	})

	if (text.toLowerCase().includes('no')) {
		console.log('Basic answering')
		return chainBasic.stream({
			chat_history: chatHistory ?? '',
			question: question,
		})
	}

	const retriever = await vectorRetriever()
	const context = await retriever.getRelevantDocuments(question)
	const serializedDocs = formatDocumentsAsString(context)

	return chainWithContext.stream({
		context: serializedDocs,
		chat_history: chatHistory,
		question,
	})
}

export async function POST(req: Request, res: Response) {
	const { messages }: { messages: Message[] } = await req.json()
	const previousMessages = messages
		.slice(0, -1)
		.slice(-3)
		.map(formatMessage)
		.join('')

	const currentPrompt = messages.at(-1)!.content
	const stream = await performQuestionAnswering(currentPrompt, previousMessages)
	return new StreamingTextResponse(stream, { status: 200 })
}
