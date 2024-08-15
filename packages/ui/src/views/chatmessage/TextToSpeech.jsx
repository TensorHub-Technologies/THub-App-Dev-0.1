import Say from 'react-say'
import PropTypes from 'prop-types'

const TextToSpeech = ({ messages }) => {
    const { message } = messages
    return <Say pitch={1.1} rate={1.5} speak={message} volume={0.8} />
}

TextToSpeech.propTypes = {
    messages: PropTypes.object
}

export default TextToSpeech
