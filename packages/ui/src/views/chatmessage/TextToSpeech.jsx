import Say from 'react-say'
import PropTypes from 'prop-types'

const TextToSpeech = ({ messages }) => {
    const { message } = messages
    return <Say pitch={0.1} rate={1.1} speak={message} volume={0.8} />
}

TextToSpeech.propTypes = {
    messages: PropTypes.object
}

export default TextToSpeech
