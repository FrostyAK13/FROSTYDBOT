import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AIAssistantPanel from './AIAssistantPanel';

const AIAssistantWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    return (
        <AnimatePresence>
            {/* Floating AI Button */}
            <motion.div
                className='fixed bottom-8 right-8 z-50'
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
            >
                <motion.button
                    onClick={() => setIsOpen(true)}
                    className='relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300'
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 255, 127, 0.15) 100%)',
                        border: '2px solid',
                        borderImage: 'linear-gradient(135deg, #FFD700 0%, #00FF7F 100%) 1',
                        backdropFilter: 'blur(10px)',
                        boxShadow: isHovering
                            ? '0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(0, 255, 127, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                            : '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(0, 255, 127, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                    }}
                    animate={
                        isHovering
                            ? { boxShadow: '0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(0, 255, 127, 0.4)' }
                            : {}
                    }
                    transition={{ duration: 0.3 }}
                >
                    {/* Animated AI Icon */}
                    <motion.svg
                        width='32'
                        height='32'
                        viewBox='0 0 32 32'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        animate={isHovering ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
                    >
                        <circle cx='16' cy='16' r='14' stroke='#FFD700' strokeWidth='2' />
                        <circle cx='16' cy='16' r='10' stroke='#00FF7F' strokeWidth='1.5' opacity='0.7' />
                        <circle cx='16' cy='16' r='2' fill='#FFD700' />
                        <circle cx='10' cy='12' r='1.5' fill='#00FF7F' opacity='0.8' />
                        <circle cx='22' cy='12' r='1.5' fill='#00FF7F' opacity='0.8' />
                        <circle cx='16' cy='24' r='1.5' fill='#00FF7F' opacity='0.8' />
                    </motion.svg>

                    {/* Floating Animation */}
                    <motion.div
                        className='absolute inset-0 rounded-full'
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Pulse Ring Effect */}
                    {isHovering && (
                        <motion.div
                            className='absolute inset-0 rounded-full border-2'
                            initial={{ scale: 0.8, opacity: 1 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            style={{ borderColor: '#00FF7F' }}
                        />
                    )}
                </motion.button>
            </motion.div>

            {/* AI Assistant Panel */}
            {isOpen && <AIAssistantPanel onClose={() => setIsOpen(false)} />}
        </AnimatePresence>
    );
};

export default AIAssistantWidget;
