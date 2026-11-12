import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import UserMessage from '../User/UserMessage';
import ArenaResponse from '../Response/ArenaResponse';
import './ChatInterface.css';



const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
    timeout: 180000
})

export default function ChatInterface() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false)

    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const updateMessage = (id, patch) => {
        setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
        );
    };

    const handleSend = async (e) => {
        e.preventDefault();

        const problem = inputValue.trim();
        if (!problem || isLoading) return;

        const id = Date.now();

        setMessages((prev) => [...prev, { id, problem, status: 'loading' }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const { data } = await api.post('/invoke', { input: problem });
            updateMessage(id, { ...data.result, status: 'done' });
        } catch (err) {
            const error =
                err.response?.data?.message ||
                (err.code === 'ECONNABORTED'
                    ? 'The request timed out. Please try again.'
                    : 'Something went wrong. Please try again.');
            updateMessage(id, { status: 'error', error });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-interface">
            <header className="chat-header">
                <h1 className="chat-title">AI CyberDome</h1>
            </header>

            <main className="chat-main">
                {messages.length === 0 ? (
                    <div className="welcome-screen">
                        <div className="welcome-content">
                            <h2 className="welcome-title">Welcome to the Arena</h2>
                            <p className="welcome-description">
                                Type a problem below to see two AI solutions
                                go head-to-head.
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div className="message-group" key={msg.id}>
                            <UserMessage message={msg.problem} />

                            <ArenaResponse
                                status={msg.status}
                                error={msg.error}
                                solution1={msg.solution_1}
                                solution2={msg.solution_2}
                                judge={msg.judge_recommendation}
                            />
                        </div>
                    ))
                )}

                <div ref={endOfMessagesRef} />
            </main>

            <footer className="chat-footer">
                <div className="chat-input-container">
                    <form onSubmit={handleSend} className="chat-form">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={
                                isLoading
                                    ? 'Waiting for the arena...'
                                    : 'Ask a coding question...'
                            }
                            className="chat-input"
                            disabled={isLoading}
                            maxLength={4000}
                        />

                        <button
                            type="submit"
                            className="chat-send-button"
                            disabled={!inputValue.trim() || isLoading}
                            aria-label="Send message"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="send-icon"
                                aria-hidden="true"
                            >
                                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    );
}
