const fs = require("fs");
const path = require("path");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { TokenTextSplitter } = require("langchain/text_splitter");
const { loadSummarizationChain } = require("langchain/chains");
const { PromptTemplate } = require("langchain/prompts");
const { OpenAI } = require("langchain/llms/openai");

const content = `PODCAST TEXT HERE`;

const MODEL= new OpenAI({
    temperature: 0.7,
    openAIApiKey: process.env.OPEN_AI_API_KEY
})

module.exports = async (req, res) => {
    const filePath = path.join(__dirname, "data.txt")
    fs.writeFileSync(filePath, content);

    const loader = new TextLoader(filePath);

    const docs = await loader.load();

    const splitter = new TokenTextSplitter({
        chunkSize: 500, 
        chunkOverlap: 50,
    });

    const docsSummary = await splitter.splitDocuments(docs);

    const summaryTemplate = `
    You are an expert in summarizing YouTube videos.
    Your goal is to create a summary of a podcast.
    Below you find the transcript of a podcast:
    --------
    {text}
    --------

    The transcript of the podcast will also be used as the basis for a question and answer bot.
    Provide some examples questions and answers that could be asked about the podcast. Make these questions very specific.

    Total output will be a summary of the video and a list of example questions the user could ask of the video.

    SUMMARY AND QUESTIONS:
    `;

    const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);

    const summaryRefineTemplate = `
    You are an expert in summarizing YouTube videos.
    Your goal is to create a summary of a podcast.
    We have provided an existing summary up to a certain point: {existing_answer}

    Below you find the transcript of a podcast:
    --------
    {text}
    --------

    Given the new context, refine the summary and example questions.
    The transcript of the podcast will also be used as the basis for a question and answer bot.
    Provide some examples questions and answers that could be asked about the podcast. Make
    these questions very specific.
    If the context isn't useful, return the original summary and questions.
    Total output will be a summary of the video and a list of example questions the user could ask of the video.

    SUMMARY AND QUESTIONS:
    `;

    const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate(summaryRefineTemplate);

    const summarizeChain = loadSummarizationChain(MODEL, {
        type: "refine",
        verbose: true,
        questionPrompt: SUMMARY_PROMPT,
        refinePrompt: SUMMARY_REFINE_PROMPT,
    });
      
    const summary = await summarizeChain.run(docsSummary);
      
    res.json({ summary })
}