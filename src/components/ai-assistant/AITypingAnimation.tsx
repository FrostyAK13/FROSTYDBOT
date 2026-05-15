import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AITypingAnimationProps {
    text: string;
    speed?: number;
}

const AITypingAnimation: React.FC<AITypingAnimationProps> = ({ text, speed = 30 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setDisplayedText('');
        setIsComplete(false);

        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                setIsComplete(true);
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <div className='relative'>
            <p className='text-sm text-gray-300 leading-relaxed'>
                {displayedText}
                {!isComplete && (
                    <motion.span
                        className='inline-block w-1 h-4 ml-1 bg-green-400 rounded-sm'
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                    />
                )}
            </p>
        </div>
    );
};

export default AITypingAnimation;
