
import React from 'react';

interface HeaderProps {
    onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={onHomeClick}
                >
                    <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.747-8.247l11.494 4.994M5.253 17.747l11.494-4.994" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">
                        <span className="text-primary">Belajar</span> Yuk
                    </h1>
                </div>
            </div>
        </header>
    );
};

export default Header;
