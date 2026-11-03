import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import 'highlight.js/styles/atom-one-dark.css';
import './ArenaResponse.css';

const markdownComponents = {
    h1: ({ node, ...props }) => <h1 className="markdown-h1" {...props} />,
    h2: ({ node, ...props }) => <h2 className="markdown-h2" {...props} />,
    h3: ({ node, ...props }) => <h3 className="markdown-h3" {...props} />,
    p:  ({ node, ...props }) => <p className="markdown-paragraph" {...props} />,
    ul: ({ node, ...props }) => <ul className="markdown-list" {...props} />,
    ol: ({ node, ...props }) => <ol className="markdown-ordered-list" {...props} />,
    a:  ({ node, ...props }) => (
        <a className="markdown-link" target="_blank" rel="noreferrer" {...props} />
    ),

    code: ({ node, className, children, ...props }) => {
        const isBlock =
            /language-/.test(className || '') || String(children).includes('\n');
        return isBlock ? (
            <div className="code-block">
                <pre>
                    <code className={className} {...props}>{children}</code>
                </pre>
            </div>
        ) : (
            <code className="inline-code" {...props}>{children}</code>
        );
    },
};

function SolutionCard({ number, solution, variant }) {
    return (
        <div className={`solution-card ${variant}`}>
            <h3 className="solution-heading">
                <span className="solution-indicator" />
                Solution {number}
            </h3>

            <div className="solution-content">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={markdownComponents}
                >
                    {solution || ''}
                </ReactMarkdown>
            </div>
        </div>
    );
}

function SkeletonCard({ number, variant }) {
    return (
        <div className={`solution-card ${variant}`} aria-busy="true">
            <h3 className="solution-heading">
                <span className="solution-indicator" />
                Solution {number}
            </h3>
            <div className="skeleton-line" style={{ width: '90%' }} />
            <div className="skeleton-line" style={{ width: '75%' }} />
            <div className="skeleton-line" style={{ width: '82%' }} />
            <div className="skeleton-block" />
            <div className="skeleton-line" style={{ width: '60%' }} />
        </div>
    );
}

function JudgePanel({ judge }) {
    if (!judge) return null;

    return (
        <div className="judge-panel">
            <h3 className="judge-heading">
                <span className="judge-icon">⚖️</span>
                Judge Recommendations
            </h3>

            <div className="judge-grid">
                <div className="judge-result">
                    <div className="judge-score-card">
                        <span className="judge-score-label">Solution 1 Score</span>
                        <span className="judge-score score-one">
                            {judge.solution_1_score}/10
                        </span>
                    </div>
                    <p className="judge-reasoning">{judge.solution_1_reasoning}</p>
                </div>

                <div className="judge-result">
                    <div className="judge-score-card">
                        <span className="judge-score-label">Solution 2 Score</span>
                        <span className="judge-score score-two">
                            {judge.solution_2_score}/10
                        </span>
                    </div>
                    <p className="judge-reasoning">{judge.solution_2_reasoning}</p>
                </div>
            </div>
        </div>
    );
}

export default function ArenaResponse({
    status = 'done',
    error,
    solution1,
    solution2,
    judge,
}) {
    if (status === 'loading') {
        return (
            <div className="arena-response">
                <div className="solutions-grid">
                    <SkeletonCard number={1} variant="solution-one" />
                    <SkeletonCard number={2} variant="solution-two" />
                </div>
                <p className="arena-status">Both models are working, then the judge will decide</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="arena-response">
                <div className="arena-error" role="alert">{error}</div>
            </div>
        );
    }

    return (
        <div className="arena-response">
            <div className="solutions-grid">
                <SolutionCard number={1} solution={solution1} variant="solution-one" />
                <SolutionCard number={2} solution={solution2} variant="solution-two" />
            </div>

            <JudgePanel judge={judge} />
        </div>
    );
}