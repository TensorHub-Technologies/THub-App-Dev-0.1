export const fetchAIResponse = async (text) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
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
