export const fetchAIResponse = async (text) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer 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`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: text }]
            })
        })
        const data = await response.json()
        return data.choices[0].message.content.trim()
    } catch (error) {
        console.error('Error fetching AI response:', error)
        return "I'm sorry, something went wrong."
    }
}
