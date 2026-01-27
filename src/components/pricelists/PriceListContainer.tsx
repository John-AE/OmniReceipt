import React from 'react';

interface PriceListContainerProps {
    children: React.ReactNode;
}

const PriceListContainer: React.FC<PriceListContainerProps> = ({ children }) => {
    return (
        <div className="w-full h-full overflow-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-8 flex items-start justify-center">
            <div className="min-w-fit shadow-2xl rounded-sm overflow-hidden bg-white">
                {children}
            </div>
        </div>
    );
};

export default PriceListContainer;


