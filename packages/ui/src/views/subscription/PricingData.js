export const pricingData = {
    monthly: [
        {
            title: 'Free',
            prices: {
                USD: '$ 0',
                INR: '₹ 0',
                GBP: '£ 0',
                Euro: '€ 0'
            },
            planId: '',
            duration: 'monthly',
            description: 'For starters: one user, 3 agents, endless potential.',
            buttonInfo: 'Start for Free',
            list: [
                'Single User',
                '3 Agents',
                'API based access to LLM',
                'Embedding Model',
                ' Vector Database etc',
                'Shared or your own API keys',
                'Basic Analytics',
                'Standard Support'
            ]
        },
        {
            title: 'Pro',
            prices: {
                USD: '$ 199',
                INR: '₹ 19,999',
                GBP: '£ 159',
                Euro: '€ 189'
            },
            extraPrice: {
                USD: '$169',
                INR: '₹17,999',
                GBP: '£149',
                Euro: '€159'
            },
            // planId: 'plan_PhdG5GMrYCqm6Z',
            planId: 'plan_PguBI476fHCWGG',
            duration: 'monthly',
            description: 'For teams: 1 primary account with access for up to 5 users.',
            buttonInfo: 'Choose Plan',
            messagePopup: 'Loading Razorpay Payment Gateway',
            list: [
                'All Free Features',
                '5 Users',
                '10 Agents',
                'Team collaboration',
                'Train your own local LLM',
                'Fine Tune open source LLM',
                'Advanced Analytics',
                'Priority support'
            ]
        },
        {
            title: 'Enterprise',
            prices: {
                INR: 'Contact for Price',
                USD: 'Contact for Price',
                GBP: 'Contact for Price',
                Euro: 'Contact for Price'
            },
            duration: 'monthly',
            description: 'For giants: unlimited users, unlimited possibilities.',
            buttonInfo: 'Get in Touch',
            messagePopup: 'Form Is Loading',
            list: ['All Pro Features', 'Unlimited Users', 'Unlimited Agents']
        }
    ],
    yearly: [
        {
            title: 'Free',
            prices: {
                USD: '$ 0',
                INR: '₹ 0',
                GBP: '£ 0',
                Euro: '€ 0'
            },
            description: 'For starters: one user, 3 agents, endless potential.',
            buttonInfo: 'Start for Free',
            list: [
                'Single User',
                '5 Agents',
                'API based access to LLM',
                'Embedding Model',
                'Vector Database etc',
                'Shared or your own API keys',
                'Basic Analytics',
                'Standard Support'
            ]
        },
        {
            title: 'Pro',
            prices: {
                USD: '$ 2,199',
                INR: '₹ 2,19,999',
                GBP: '£ 1,699',
                Euro: '€ 2,099'
            },
            extraPrice: {
                USD: '$1,999',
                INR: '₹1,99,999',
                GBP: '£1,599',
                Euro: '€1,899'
            },
            planId: 'plan_PhdbTzJPTel2e3',
            duration: 'yearly',
            description: 'For teams: 5 users, 10 agents, tools to scale.',
            buttonInfo: 'Choose Plan',
            messagePopup: 'Loading Razorpay Payment Gateway',
            list: [
                'All Free Features',
                '5 Users',
                '25 Agents',
                '₹ 17,999/per Additional Agents',
                'Team collaboration',
                'Train your own local LLM',
                'Fine Tune open source LLM',
                'Advanced Analytics',
                'Priority support'
            ]
        },
        {
            title: 'Enterprise',
            prices: {
                INR: 'Contact for Price',
                USD: 'Contact for Price',
                GBP: 'Contact for Price',
                Euro: 'Contact for Price'
            },
            planId: 'YOUR_ENTERPRISE_PLAN_ID',
            duration: 'yearly',
            description: 'For giants: unlimited users, unlimited possibilities.',
            buttonInfo: 'Get in Touch',
            messagePopup: 'Form Is Loading',
            list: ['All Pro Features', 'Unlimited Users', 'Unlimited Agents']
        }
    ]
}
