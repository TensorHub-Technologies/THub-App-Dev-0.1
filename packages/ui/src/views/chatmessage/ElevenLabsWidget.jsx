import { useEffect } from 'react'

const ElevenLabsWidget = () => {
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://elevenlabs.io/convai-widget/index.js'
        script.async = true
        script.type = 'text/javascript'
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    return (
        <div>
            <elevenlabs-convai agent-id='iJ32Ot1aiTs8ctutzGhd'></elevenlabs-convai>
        </div>
    )
}

export default ElevenLabsWidget
