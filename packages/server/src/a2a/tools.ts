import { ai, z } from './genkit.js'

export const searchMovies = ai.defineTool(
    {
        name: 'searchMovies',
        description: 'search TMDB for movies by title',
        inputSchema: z.object({
            query: z.string()
        })
    },
    async ({ query }) => {
        console.log('searchMovies called with query:', query)
        try {
            const data = 'searchMovies returned'
            return {
                data
            }
        } catch (error) {
            console.error('Error searching movies:', error)
            // Re-throwing allows Genkit/the caller to handle it appropriately
            throw error
        }
    }
)

export const searchPeople = ai.defineTool(
    {
        name: 'searchPeople',
        description: 'search TMDB for people by name',
        inputSchema: z.object({
            query: z.string()
        })
    },
    async ({ query }) => {
        console.log('searchPeople called with query:', query)
        try {
            const data = 'searchPeople returned'
            return {
                data
            }
        } catch (error) {
            console.error('Error searching people:', error)
            // Re-throwing allows Genkit/the caller to handle it appropriately
            throw error
        }
    }
)

export const calculator = ai.defineTool(
    {
        name: 'caliculator',
        description: 'perform mathematical calculations',
        inputSchema: z.object({
            query: z.string()
        })
    },
    async ({ query }) => {
        console.log('perform mathematical calculations:', query)
        try {
            const data = '2+2=4'
            return {
                data
            }
        } catch (error) {
            console.error('Error calculating:', error)
            // Re-throwing allows Genkit/the caller to handle it appropriately
            throw error
        }
    }
)
