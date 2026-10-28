import { useState, useRef, useEffect } from 'react';
import UserMessage from '../User/UserMessage';
import ArenaResponse from '../Response/ArenaResponse';
import './ChatInterface.css';

const MOCK_RESPONSE = {
    solution_1: `Here is a clean Python solution using modern syntax:

\`\`\`python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
\`\`\`

This approach has O(n) time complexity and O(1) space.`,

    solution_2: `A recursive solution can be elegant but less efficient:

\`\`\`python
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)
\`\`\`

Note: this has O(2^n) time complexity.`,

    judge: {
        solution_1_score: 10,
        solution_2_score: 5,
        solution_1_reasoning:
            'Excellent, optimal solution. Space complexity is O(1) which is perfect for this problem.',
        solution_2_reasoning:
            'The recursive approach without memoization is extremely slow for large inputs.',
    },
};

export default function ChatInterface() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const endOfMessagesRef = useRef(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();

        if (!inputValue.trim()) return;

        const newMessage = {
            id: Date.now(),
            problem: inputValue.trim(),
            ...MOCK_RESPONSE,
        };

        setMessages((previousMessages) => [
            ...previousMessages,
            newMessage,
        ]);

        setInputValue('');
    };

    return (
        <div className="chat-interface">
            <header className="chat-header">
                <h1 className="chat-title">AI Chat Arena</h1>
            </header>

            <main className="chat-main">
                {messages.length === 0 ? (
                    <div className="welcome-screen">
                        <div className="welcome-content">
                            <h2 className="welcome-title">
                                Welcome to the Arena
                            </h2>

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
                                solution1={msg.solution_1}
                                solution2={msg.solution_2}
                                judge={msg.judge}
                            />
                        </div>
                    ))
                )}

                <div ref={endOfMessagesRef} />
            </main>

            <footer className="chat-footer">
                <div className="chat-input-container">
                    <form
                        onSubmit={handleSend}
                        className="chat-form"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask a coding question..."
                            className="chat-input"
                        />

                        <button
                            type="submit"
                            className="chat-send-button"
                            disabled={!inputValue.trim()}
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
