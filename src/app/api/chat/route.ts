import { HfInference } from '@huggingface/inference'
import { HuggingFaceStream, Message, StreamingTextResponse } from 'ai'
import { PromptTemplate } from 'langchain/prompts'
import { formatDocumentsAsString } from 'langchain/util/document'
import { vectorRetriever } from './retriever'
import { experimental_buildStarChatBetaPrompt } from 'ai/prompts'

export const runtime = 'edge';

const Hf = new HfInference(process.env.HUGGINGFACEHUB_API_KEY!)

const questionPrompt = PromptTemplate.fromTemplate(
	`
<|system|>
You are a helpful and enthusiastic support bot named "SchemeSetu" who can answer a given question about Indian government schemes. 
Try to find the answer in the CONTEXT and CHAT HISTORY. 
If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@schemesetu.com. 
Emphasize important words by wrapping *<important word>*. Format the point headings wrap with **<point heading>**
CONTEXT: 
{context}
CHAT HISTORY: 
{chat_history}
</s>
<|user|>
{question}</s>
<|assistant|>
`
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

const performQuestionAnswering = async (
	question: string,
	chatHistory: Message[]
) => {
	const { generated_text: determine } = await Hf.textGeneration({
		model: 'google/flan-t5-xxl',
		inputs: await determine_prompt.format({ sentence: question }),
	})

	let promptTemplate

	if (determine.toLowerCase().includes('no')) {
		console.log('Basic answering')
		promptTemplate = await basicAnswerPrompt.format({
			chat_history: experimental_buildStarChatBetaPrompt(chatHistory) ?? '',
			question: question,
		})
	} else {
		const retriever = await vectorRetriever()
		const context = await retriever.getRelevantDocuments(question)
		const serializedDocs = formatDocumentsAsString(context)

		promptTemplate = await questionPrompt.format({
			context: serializedDocs,
			chat_history: experimental_buildStarChatBetaPrompt(chatHistory) ?? '',
			question,
		})
	}

	// console.log(promptTemplate)

	return Hf.textGenerationStream({
		model: 'HuggingFaceH4/zephyr-7b-beta',
		inputs: promptTemplate ?? question,
		parameters: {
			temperature: 0.3,
			truncate: 1000,
			max_new_tokens: 2048,
		},
	})
}

export async function POST(req: Request) {
	const { messages }: { messages: Message[] } = await req.json()
	const previousMessages = messages.slice(-4, -1)
	const currentPrompt = messages.at(-1)!.content
	const stream = await performQuestionAnswering(currentPrompt, previousMessages)

	const output = HuggingFaceStream(stream)
	return new StreamingTextResponse(output, { status: 200 })
}
