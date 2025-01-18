import { XCircleIcon } from '@heroicons/react/20/solid'
import React from 'react';

interface ErrorAlertProps {
    title: string;
    messages: string[];
    variant?: 'error' | 'warning' | 'success' | 'info';
}

export function ErrorAlert({ title, messages, variant = 'error' }: ErrorAlertProps) {
    const variantStyles = {
        error: 'bg-[#1f1f1f] text-white border border-white/10',
        warning: 'bg-[#1f1f1f] text-white border border-white/10',
        success: 'bg-[#1f1f1f] text-white border border-white/10',
        info: 'bg-[#1f1f1f] text-white border border-white/10'
    }

    return (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-md p-4 ${variantStyles[variant]}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium">{title}</h3>
                    {messages.length > 0 && (
                        <div className="mt-2 text-sm">
                            <ul className="list-disc space-y-1 pl-5">
                                {messages.map((message, index) => (
                                    <li key={index}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 