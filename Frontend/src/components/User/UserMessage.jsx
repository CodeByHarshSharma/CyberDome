import './UserMessage.css';

export default function UserMessage({ message }) {
    return (
        <div className="user-message-wrapper">
            <div className="user-message-bubble">
                {message}
            </div>
        </div>
    )
}
