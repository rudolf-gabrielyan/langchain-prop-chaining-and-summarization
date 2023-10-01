const { OpenAI } = require('langchain/llms/openai');
const { PromptTemplate } = require('langchain/prompts');
const { 
    LLMChain, 
    SimpleSequentialChain 
} = require('langchain/chains');

const MODEL = new OpenAI({
    temperature: 0.7,
    openAIApiKey: process.env.OPEN_AI_API_KEY
})

module.exports = async (req, res) => {
    const synopsis_template = "Generate a prompt that AI LLM Model can use to generate a story outline based on the following topic: {topic}";

    const outline_template = "Generate an outline based on the following synopsis: {synopsis}";

    const story_template = "Generate a story based on the following outline: {outline}";

    const synopsis_prompt = new PromptTemplate({
        template: synopsis_template,
        inputVariables: ["topic"],
    });

    const outline_prompt = new PromptTemplate ({
        template: outline_template,
        inputVariables: ["synopsis"],
    });

    const story_prompt = new PromptTemplate ({
        template: story_template,
        inputVariables: ["outline"],
    });

    const generate_synopsis = new LLMChain({ llm: MODEL, prompt: synopsis_prompt });

    const generate_outline = new LLMChain({ llm: MODEL, prompt: outline_prompt });

    const generate_story = new LLMChain({ llm: MODEL, prompt: story_prompt });

    const overall_chain = new SimpleSequentialChain({
        chains: [generate_synopsis, generate_outline, generate_story],
        verbose: true,
    })

    const response = await overall_chain.run('Boy named Rudolf');

    res.json({ response });
}