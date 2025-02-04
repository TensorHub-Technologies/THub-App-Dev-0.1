import { useState, useEffect, useRef } from 'react'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { fetchAIResponse } from './FetchAIResponse'

export function SpeechToTextComponent() {
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [language, setLanguage] = useState('en-US')
    const speechConfig = useRef(null)
    const audioConfigForRecognization = useRef(null)
    const audioConfigForSynthesizer = useRef(null)
    const player = useRef(null)

    const recognizer = useRef(null)
    const synthesizer = useRef(null)
    const [conversations, setConversations] = useState([])

    const SPEECH_KEY = import.meta.env.VITE_APP_AZURE_SPEECH_KEY
    const SPEECH_REGION = import.meta.env.VITE_APP_AZURE_REGION

    const [myTranscript, setMyTranscript] = useState('')
    const [recognizingTranscript, setRecTranscript] = useState('')

    const languageOptions = [
        { code: 'en-US', name: 'English (US)' },
        { code: 'hi-IN', name: 'Hindi (India)' },
        { code: 'ta-IN', name: 'Tamil (India)' },
        { code: 'kn-IN', name: 'Kannada (India)' }
    ]

    useEffect(() => {
        speechConfig.current = sdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION)
        speechConfig.current.speechRecognitionLanguage = language

        audioConfigForRecognization.current = sdk.AudioConfig.fromDefaultMicrophoneInput()
        recognizer.current = new sdk.SpeechRecognizer(speechConfig.current, audioConfigForRecognization.current)

        const processRecognizedTranscript = async (event) => {
            if (!speechConfig.current) {
                return
            }
            const result = event.result

            console.log('Recognition result:', result)

            if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                const transcript = result.text
                console.log('Transcript: -->', transcript)

                setMyTranscript(transcript)

                setConversations((prev) => [...prev, { sender: 'User', text: transcript }])

                if (player.current) {
                    player.current.pause()
                }

                const aiResponse = await fetchAIResponse(transcript)

                setConversations((prev) => [...prev, { sender: 'AI', text: aiResponse }])

                player.current = new sdk.SpeakerAudioDestination()
                audioConfigForSynthesizer.current = sdk.AudioConfig.fromSpeakerOutput(player.current)
                synthesizer.current = new sdk.SpeechSynthesizer(speechConfig.current, audioConfigForSynthesizer.current)

                synthesizer.current?.speakTextAsync(aiResponse, () => {
                    console.log('Speech synthesis started.')
                    setIsSpeaking(true)
                })
            }
        }

        const processRecognizingTranscript = (event) => {
            const result = event.result
            console.log('Recognition result:', result)
            if (result.reason === sdk.ResultReason.RecognizingSpeech) {
                const transcript = result.text
                console.log('Transcript: -->', transcript)
                setRecTranscript(transcript)
                stopSpeaking()
            }
        }

        recognizer.current.recognized = (s, e) => processRecognizedTranscript(e)
        recognizer.current.recognizing = (s, e) => processRecognizingTranscript(e)

        return () => {
            if (recognizer.current)
                recognizer.current?.stopContinuousRecognitionAsync(() => {
                    setIsListening(false)
                })
        }
    }, [language])

    const pauseListening = () => {
        setIsListening(false)
        recognizer.current?.stopContinuousRecognitionAsync()
        console.log('Paused listening.')
    }

    const resumeListening = () => {
        if (!isListening) {
            setIsListening(true)
            recognizer.current?.startContinuousRecognitionAsync(() => {
                console.log('Resumed listening...')
            })
        }
    }

    const stopListening = () => {
        setIsListening(false)
        stopSpeaking()
        recognizer.current?.stopContinuousRecognitionAsync(() => {
            console.log('Speech recognition stopped.')
        })
    }

    const stopSpeaking = () => {
        setIsSpeaking(false)
        if (player.current) {
            player.current.pause()
        }
    }

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value)
    }
    return (
        <div>
            <button onClick={resumeListening}>Start Call</button>
            <button onClick={stopListening}>Stop call</button>
            <div>
                <label htmlFor='language-select'>Select Language: </label>
                <select id='language-select' value={language} onChange={handleLanguageChange}>
                    {languageOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}
