import { HfInference } from '@huggingface/inference'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { PromptTemplate } from 'langchain/prompts'
import { formatDocumentsAsString } from 'langchain/util/document'
import OpenAI from 'openai'
import { vectorRetriever } from '../retriever'
import { log } from 'console'

const Hf = new HfInference(process.env.HUGGINGFACEHUB_API_KEY!)
const openai = new OpenAI({
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: process.env.OPENROUTER_API_KEY,
})

const determine_prompt = PromptTemplate.fromTemplate(`
Answer the following yes/no question, is the following sentence a question about government schemes
Question: {sentence}?
Your Answer: 
`)

export async function POST(req: Request) {
	const { messages } = await req.json()
	const previousMessages = messages.slice(-5, -1)
	const currentPrompt = messages.at(-1)!.content

	const { generated_text: determine } = await Hf.textGeneration({
		model: 'google/flan-t5-xxl',
		inputs: await determine_prompt.format({ sentence: currentPrompt }),
	})

	if (determine.toLowerCase().includes('no')) {
		log('basic answering')
		const response = await openai.chat.completions.create({
			model: 'huggingfaceh4/zephyr-7b-beta',
			stream: true,
			max_tokens: 1024,
			messages: [
				{
					role: 'system',
					content: `You are a helpful chatbot named SchemeSetu.
Based on the question asked answer in context to Indian government schemes.
If its a greeting or a wish, greet them back and ask if they have any questions regarding schemes.
Emphasize important words by wrapping *<important word>*. Format the point headings wrap with **<point heading>**
			`,
				},
				...messages.slice(-5),
			],
		})
		const output = OpenAIStream(response)
		return new StreamingTextResponse(output, { status: 200 })
	} else {
		const retriever = await vectorRetriever()
		const context = await retriever.getRelevantDocuments(currentPrompt)
		const serializedDocs = formatDocumentsAsString(context)

		const response = await openai.chat.completions.create({
			model: 'huggingfaceh4/zephyr-7b-beta',
			stream: true,
			max_tokens: 2048,
			messages: [
				{
					role: 'system',
					content: `You are a helpful and enthusiastic support bot named "SchemeSetu" who can answer a given question about Indian government schemes. 
If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@schemesetu.com. 
Respond by making important words by wrapping *<important word>* and point headings wrap with **<point heading>**`,
				},
				...previousMessages,
				{
					role: 'system',
					content: serializedDocs,
				},
				{ role: 'user', content: currentPrompt },
			],
		})

		const output = OpenAIStream(response)
		return new StreamingTextResponse(output, { status: 200 })
	}
}
