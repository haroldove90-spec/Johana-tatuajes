import React, { useState, useCallback, useRef, useEffect } from 'react';
import { askAiConsultant } from '../services/geminiService';
import { Spinner, UserIcon, BotIcon, SendIcon } from './Icons';

interface ConversationTurn {
    role: 'user' | 'model';
    content: string;
}

const HISTORY_STORAGE_KEY = 'aiConsultantHistory';

const ModelResponse: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    // Fix: Changed JSX.Element[] to React.ReactNode[] to resolve the "Cannot find namespace 'JSX'" error.
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
                    {listItems.map((item, idx) => {
                        const itemParts = item.split(/(\*\*.*?\*\*)/g);
                        return (
                           <li key={idx}>
                                {itemParts.map((part, i) =>
                                    part.startsWith('**') && part.endsWith('**') ? (
                                        <strong key={i}>{part.slice(2, -2)}</strong>
                                    ) : (
                                        part
                                    )
                                )}
                            </li>
                        );
                    })}
                </ul>
            );
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            listItems.push(line.trim().substring(2));
        } else {
            flushList();
            if (line.trim() !== '') {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                elements.push(
                    <p key={`p-${index}`} className="text-sm">
                        {parts.map((part, i) =>
                            part.startsWith('**') && part.endsWith('**') ? (
                                <strong key={i}>{part.slice(2, -2)}</strong>
                            ) : (
                                part
                            )
                        )}
                    </p>
                );
            }
        }
    });

    flushList(); // Flush any remaining list items at the end

    return <div className="space-y-2">{elements}</div>;
};

export const AiConsultant: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const conversationEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load history from localStorage on component mount
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (savedHistory) {
                setConversation(JSON.parse(savedHistory));
            }
        } catch (err) {
            console.error("Error al cargar el historial desde localStorage:", err);
            localStorage.removeItem(HISTORY_STORAGE_KEY);
        }
    }, []);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(conversation));
        } catch (err) {
            console.error("Error al guardar el historial en localStorage:", err);
        }
    }, [conversation]);


    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [prompt]);

    const handleAsk = useCallback(async () => {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt) {
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setConversation(current => [...current, { role: 'user', content: trimmedPrompt }]);
        setPrompt('');

        try {
            const answer = await askAiConsultant(trimmedPrompt);
            setConversation(current => [...current, { role: 'model', content: answer }]);
        } catch (err) {
            setError('Hubo un error al contactar al asistente. Inténtalo de nuevo.');
            console.error(err);
            setConversation(current => current.slice(0, -1));
            setPrompt(trimmedPrompt);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAsk();
        }
    };

    const handleClearHistory = () => {
        setConversation([]);
    };

    return (
        <div className="flex flex-col h-[calc(100dvh-260px)]">
            <div className="flex-grow overflow-y-auto pr-4 space-y-6 mb-4 bg-gray-200/50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                {conversation.length === 0 && !isLoading && (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center">
                        <p>Haz una pregunta sobre técnicas o materiales. <br/> Tu historial se guardará aquí.</p>
                    </div>
                )}
                {conversation.map((turn, index) => (
                    <div key={index} className={`flex items-end gap-3 ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {turn.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <BotIcon className="w-5 h-5 text-gray-700 dark:text-gray-300"/>
                            </div>
                        )}
                        <div className={`max-w-[80%] p-3 rounded-2xl ${turn.role === 'user' ? 'bg-purple-600 text-white rounded-br-lg' : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-bl-lg'}`}>
                             {turn.role === 'model' 
                                ? <ModelResponse content={turn.content} />
                                : <p className="whitespace-pre-wrap text-sm">{turn.content}</p>
                            }
                        </div>
                         {turn.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-5 h-5 text-white"/>
                            </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-end gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <BotIcon className="w-5 h-5 text-gray-700 dark:text-gray-300"/>
                        </div>
                        <div className="p-3 rounded-2xl bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-bl-lg inline-flex items-center">
                           <Spinner />
                           <span className="ml-2 text-sm">Pensando...</span>
                        </div>
                    </div>
                )}
                <div ref={conversationEndRef} />
            </div>

            {error && <p className="text-red-500 text-center mb-2">{error}</p>}
            
            <div className="flex-shrink-0 relative">
                <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={1}
                    style={{ maxHeight: '150px' }}
                    className="w-full p-3 pr-14 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none overflow-y-auto"
                    placeholder="Escribe tu pregunta aquí..."
                    disabled={isLoading}
                />
                <button
                    onClick={handleAsk}
                    disabled={isLoading || !prompt.trim()}
                    aria-label="Enviar"
                    className="absolute right-3 bottom-2.5 p-2 flex-shrink-0 border border-transparent rounded-lg text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    <SendIcon className="w-6 h-6" />
                </button>
            </div>

            {conversation.length > 0 && (
                 <div className="text-center mt-4">
                    <button
                        onClick={handleClearHistory}
                        className="text-sm text-gray-500 hover:text-red-500 hover:underline transition-colors"
                    >
                        Borrar Historial
                    </button>
                </div>
            )}
        </div>
    );
};