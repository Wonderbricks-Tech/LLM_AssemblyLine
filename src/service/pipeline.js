const { Configuration, OpenAIApi } = require('openai')

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export async function postTextToLLM(data) {
    try {
        const completions = await openai.createChatCompletion({
            model: process.env.MODEL_NAME,
            messages: [
                {
                    role: 'system',
                    content: data.prompt,
                },
                {
                    role: 'user',
                    content: data.input,
                },
            ],
        })
        return {
            success: true,
            ...completions.data.choices[0].message,
        }
    } catch (err) {
        console.error(err)
        return {
            success: false,
            message: 'please check the error message in console log',
        }
    }
}
