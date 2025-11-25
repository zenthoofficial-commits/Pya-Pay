
import React, { useState, useRef, useCallback } from 'react';
import { LatLngLiteral } from '../types';
import { CloseIcon } from './Icons';

interface NominatimResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
}

interface DestinationInputProps {
    onDestinationSet: (destination: { address: string; location: LatLngLiteral } | null) => void;
}

const DestinationInput: React.FC<DestinationInputProps> = ({ onDestinationSet }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [selectedDestination, setSelectedDestination] = useState<{ address: string; location: LatLngLiteral } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimeout = useRef<number | null>(null);

    const handleSearch = async (searchQuery: string) => {
        if (searchQuery.length < 3) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=mm&limit=5`);
            if (!response.ok) throw new Error('Search request failed');
            const data: NominatimResult[] = await response.json();
            setResults(data);
        } catch (error) {
            console.error("Error searching for destination:", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedSearch = useCallback((searchQuery: string) => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = window.setTimeout(() => {
            handleSearch(searchQuery);
        }, 500);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        if (newQuery === '') {
            setResults([]);
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        } else {
            debouncedSearch(newQuery);
        }
    };

    const handleSelectResult = (result: NominatimResult) => {
        const destination = {
            address: result.display_name,
            location: {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
            }
        };
        setSelectedDestination(destination);
        onDestinationSet(destination);
        setQuery('');
        setResults([]);
    };

    const handleClear = () => {
        setSelectedDestination(null);
        onDestinationSet(null);
    };

    if (selectedDestination) {
        return (
            <div className="bg-gray-800 border border-green-500 rounded-full flex items-center justify-between p-2 shadow-md w-full">
                <p className="text-white text-sm truncate pl-3 flex-1">
                    To: <span className="font-semibold">{selectedDestination.address}</span>
                </p>
                <button onClick={handleClear} className="bg-gray-600 rounded-full p-1 ml-2 hover:bg-gray-500">
                    <CloseIcon className="w-5 h-5 text-white" />
                </button>
            </div>
        );
    }
    
    return (
        <div className="relative w-full">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="သွားလိုသောနေရာကို သတ်မှတ်ပါ"
                className="w-full bg-gray-800 border border-gray-600 rounded-full py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition shadow-md"
            />
            {(isLoading || results.length > 0 || (query.length >=3 && !isLoading)) && (
                <ul className="absolute bottom-full mb-2 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                    {isLoading && <li className="text-gray-400 p-3 text-center">ရှာဖွေနေသည်...</li>}
                    {!isLoading && results.map(result => (
                        <li key={result.place_id} onClick={() => handleSelectResult(result)} className="p-3 text-sm text-white hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0">
                            {result.display_name}
                        </li>
                    ))}
                     {!isLoading && results.length === 0 && query.length >=3 && <li className="text-gray-400 p-3 text-center">ရလဒ်မရှိပါ</li>}
                </ul>
            )}
        </div>
    );
};

export default DestinationInput;