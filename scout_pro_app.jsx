import React from 'react';
import { useState, useEffect } from 'react';

// --- Helper Icons ---
const BookIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> );
const FilmIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg> );
const DiceIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M16 8h.01"/><path d="M8 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/></svg> );
const GamepadIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><rect x="13" y="8" width="5" height="2" rx="1"/><rect x="14" y="14" width="5" height="2" rx="1"/><path d="M17.5 22a2.5 2.5 0 0 0 2.5-2.5V18a2.5 2.5 0 0 0-2.5-2.5h-5A2.5 2.5 0 0 0 10 18v1.5A2.5 2.5 0 0 0 12.5 22Z"/><path d="M6.5 22a2.5 2.5 0 0 1-2.5-2.5V18a2.5 2.5 0 0 1 2.5-2.5h5A2.5 2.5 0 0 1 14 18v1.5a2.5 2.5 0 0 1-2.5 2.5Z"/><path d="M14 2.5a2.5 2.5 0 0 0-2.5-2.5h-5A2.5 2.5 0 0 0 4 2.5V6a2.5 2.5 0 0 0 2.5 2.5h5A2.5 2.5 0 0 0 14 6Z"/></svg> );

// --- Main App Component ---
export default function App() {
    const [category, setCategory] = useState('books');
    const [shelfImage, setShelfImage] = useState(null);
    const [hitList, setHitList] = useState([]);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [analysisStatus, setAnalysisStatus] = useState('');
    const [analysisError, setAnalysisError] = useState(null);
    const [showEbay, setShowEbay] = useState(true);
    const [showAmazon, setShowAmazon] = useState(true);
    const [imageDataForAnalysis, setImageDataForAnalysis] = useState(null);

    const categoryConfig = {
        books: { icon: BookIcon, plural: "Books", aiPrompt: "You are a book identification expert..." },
        media: { icon: FilmIcon, plural: "DVD/VHS/Blu-ray", aiPrompt: "You are a media identification expert..." },
        videoGames: { icon: GamepadIcon, plural: "Video Games", aiPrompt: "You are a video game identification expert..." },
        boardGames: { icon: DiceIcon, plural: "Board Games", aiPrompt: "You are a board game identification expert..." }
    };

    useEffect(() => {
        if (imageDataForAnalysis) {
            analyzeImageWithAI(imageDataForAnalysis);
        }
    }, [imageDataForAnalysis, category, showEbay, showAmazon]);

    const analyzeImageWithAI = async (base64ImageData) => {
        setLoadingAnalysis(true); setAnalysisStatus('Analyzing spines for details...'); setHitList([]); setAnalysisError(null);
        const apiKey = ""; const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [ { text: categoryConfig[category].aiPrompt }, { inlineData: { mimeType: "image/jpeg", data: base64ImageData } } ] }] };
        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const result = await response.json(); const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                const lines = [...new Set(text.split('\n').map(t => t.trim()).filter(t => t.length > 3 && t.includes('|')))];
                if (lines.length === 0) throw new Error("AI could not identify any clear items.");
                setAnalysisStatus(`Found ${lines.length} items. Fetching market comps...`);
                let items = [];
                for (const line of lines) { const parts = line.split('|').map(p => p.trim()); if (parts[0]) items.push({ title: parts[0], field2: parts[1] || '', details: parts[2] || '' }); }
                const compPromises = items.map(item => {
                    const searchQuery = `${item.title} ${item.field2} ${item.details}`;
                    const ebayPromise = showEbay ? fetchEbaySoldComps(searchQuery) : Promise.resolve({ count: 0, medianPrice: 0 });
                    const amazonPromise = showAmazon ? fetchAmazonComps(searchQuery) : Promise.resolve({ bsr: null, buyBoxPrice: null, lowestUsedPrice: null, offers: 0 });
                    return Promise.all([ebayPromise, amazonPromise]).then(([ebayComps, amazonComps]) => ({...item, ebayComps, amazonComps, searchQuery }));
                });
                const settledResults = await Promise.all(compPromises);
                const validResults = settledResults.filter(item => item.ebayComps.count > 0 || item.amazonComps.bsr);
                validResults.sort((a, b) => (b.ebayComps.medianPrice || 0) - (a.ebayComps.medianPrice || 0));
                setHitList(validResults);
            } else { throw new Error("No items were identified by the AI."); }
        } catch (error) { console.error("AI Analysis Error:", error); setAnalysisError("Failed to analyze image. Try a clearer picture.");
        } finally { setLoadingAnalysis(false); setAnalysisStatus(''); }
    };
    
    const fetchEbaySoldComps = async (searchQuery) => {
        const proxyUrl = `/api/ebay-proxy?keywords=${encodeURIComponent(searchQuery)}`;
        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`eBay API proxy request failed: ${errorBody}`);
            }
            const data = await response.json();
            return { count: data.soldCount, medianPrice: data.medianPrice };
        } catch (error) {
            console.error("Failed to fetch from eBay API proxy:", error);
            return { count: 0, medianPrice: 0 };
        }
    };
    
    const fetchAmazonComps = async (searchQuery) => {
        const proxyUrl = `/api/canopy-proxy?search_term=${encodeURIComponent(searchQuery)}`;
        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Canopy API proxy request failed');
            const data = await response.json();
            const firstResult = data?.search_results?.[0];
            if (!firstResult) return { bsr: null, buyBoxPrice: null, lowestUsedPrice: null, offers: 0 };
            return {
                bsr: firstResult.product?.sales_rank || null,
                buyBoxPrice: firstResult.offers?.primary?.price || null,
                lowestUsedPrice: firstResult.offers?.used?.price || null,
                offers: firstResult.offers?.total_offers || 0
            };
        } catch (error) {
            console.error("Failed to fetch from Canopy API proxy:", error);
            return { bsr: null, buyBoxPrice: null, lowestUsedPrice: null, offers: 0 };
        }
    };
    
    const handleImageUpload = (event) => { const file = event.target.files[0]; if (file) { setLoadingAnalysis(true); setAnalysisStatus('Reading image...'); setShelfImage(null); setHitList([]); setAnalysisError(null); const reader = new FileReader(); reader.onloadend = () => { setShelfImage(reader.result); const base64Data = reader.result.split(',')[1]; setImageDataForAnalysis(base64Data); }; reader.onerror = () => { setLoadingAnalysis(false); setAnalysisError("Failed to read file."); }; reader.readAsDataURL(file); } };
    const getValueColor = (value) => { if (value > 40) return 'text-green-400'; if (value > 15) return 'text-yellow-400'; return 'text-neutral-400'; };
    const getBsrColor = (bsr) => { if(!bsr) return 'text-neutral-500'; if (bsr < 50000) return 'text-green-400'; if (bsr < 150000) return 'text-yellow-400'; return 'text-neutral-400'; };
    const FormatTag = ({ format }) => { const styles = { DVD: 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/50', VHS: 'bg-yellow-800/50 text-yellow-300 border-yellow-500/50', 'BLU-RAY': 'bg-sky-800/50 text-sky-300 border-sky-500/50' }; return <span className={`text-xs align-middle font-semibold px-2 py-1 rounded-full ${styles[format] || 'bg-neutral-700 text-neutral-300'}`}>{format}</span>; };
    const Toggle = ({ label, enabled, onChange }) => (<label className="flex items-center cursor-pointer"><div className="relative"><input type="checkbox" className="sr-only" checked={enabled} onChange={onChange} /><div className={`block ${enabled ? 'bg-green-500' : 'bg-neutral-600'} w-14 h-8 rounded-full`}></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div></div><span className="ml-3 text-white font-medium">{label}</span></label>);
    
    const Header = () => {
        let headerGradient = "from-amber-400 to-orange-500";
        if (category === 'media') headerGradient = "from-cyan-400 to-blue-500";
        else if (category === 'videoGames') headerGradient = "from-lime-400 to-green-600";
        else if (category === 'boardGames') headerGradient = "from-rose-400 to-red-500";
        return <h1 className="text-5xl font-extrabold text-white">Scout <span className={`text-transparent bg-clip-text bg-gradient-to-r ${headerGradient}`}>{categoryConfig[category].plural}</span></h1>;
    };

    const Spinner = () => {
        const spinnerBorders = {books: 'border-amber-500', media: 'border-cyan-500', videoGames: 'border-lime-500', boardGames: 'border-rose-500'};
        return <div className={`w-8 h-8 border-4 ${spinnerBorders[category]} border-t-transparent rounded-full animate-spin`}></div>
    };
    
    const ResultCard = ({item}) => {
        const { title, field2, details, ebayComps, amazonComps, searchQuery } = item;
        return (<li className={`bg-neutral-800 p-4 rounded-2xl shadow-lg border border-neutral-700 transition-all animate-fade-in
            ${category === 'books' ? "hover:border-amber-500/50 hover:shadow-amber-500/10" : ""}
            ${category === 'media' ? "hover:border-cyan-500/50 hover:shadow-cyan-500/10" : ""}
            ${category === 'videoGames' ? "hover:border-lime-500/50 hover:shadow-lime-500/10" : ""}
            ${category === 'boardGames' ? "hover:border-rose-500/50 hover:shadow-rose-500/10" : ""}
        `}>
            <div><h4 className="font-bold text-white text-lg">{title}</h4>{category === 'books' && field2 && <p className="text-sm text-neutral-400 -mt-1">by {field2}</p>}{category === 'media' && field2 && <FormatTag format={field2} /> }{category === 'boardGames' && field2 && <p className="text-sm text-neutral-400 -mt-1">{field2}</p>}{category === 'videoGames' && field2 && <p className="text-sm font-bold mt-1 text-lime-400">{field2}</p>}{details && <p className="text-xs text-yellow-400 mt-2 font-semibold bg-yellow-900/50 px-2 py-1 rounded-md inline-block">{details}</p>}</div><div className="border-t border-neutral-700 my-4"></div><div className={`grid gap-4 ${showEbay && showAmazon ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {showEbay && <div className="bg-neutral-900/50 p-3 rounded-lg flex flex-col"><div className="flex justify-between items-center"><h5 className="font-bold text-white">eBay</h5><span className="text-xs text-neutral-400">{ebayComps.count} sold</span></div><div className="flex-grow flex items-center justify-center"><div className="text-center"><div className={`text-4xl font-bold ${getValueColor(ebayComps.medianPrice)}`}>${ebayComps.medianPrice.toFixed(2)}</div><p className="text-xs text-neutral-500">Median Sale</p></div></div><a href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}&_sacat=0&LH_Complete=1&LH_Sold=1`} target="_blank" rel="noopener noreferrer" className={`block text-center mt-2 text-sm ${category === 'books' ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" : category === 'media' ? "bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : category === 'videoGames' ? "bg-lime-500/10 text-lime-300 hover:bg-lime-500/20" : "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"} font-bold py-2 px-3 rounded-lg transition-colors`}>Research eBay</a></div>}
                {showAmazon && <div className="bg-neutral-900/50 p-3 rounded-lg flex flex-col"><div className="flex justify-between items-center"><h5 className="font-bold text-white">Amazon</h5>{amazonComps.bsr && <span className="text-xs text-neutral-400">{amazonComps.offers} offers</span>}</div>{amazonComps.bsr ? <><div className="flex-grow flex items-center justify-center"><div className="text-center"><div className={`text-4xl font-bold ${getBsrColor(amazonComps.bsr)}`}>{amazonComps.bsr.toLocaleString()}</div><p className="text-xs text-neutral-500">Sales Rank</p></div></div><div className="border-t border-neutral-700 my-2"></div><div className="text-center"><p className="text-xs text-neutral-400">Buy Box / Lowest Used</p><p className="font-bold text-lg text-white">${amazonComps.buyBoxPrice ? amazonComps.buyBoxPrice.toFixed(2) : 'N/A'} <span className="text-neutral-400">/</span> <span className="text-yellow-400">${amazonComps.lowestUsedPrice ? amazonComps.lowestUsedPrice.toFixed(2) : 'N/A'}</span></p></div><a href={`https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`} target="_blank" rel="noopener noreferrer" className={`block text-center mt-2 text-sm ${category === 'books' ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" : category === 'media' ? "bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : category === 'videoGames' ? "bg-lime-500/10 text-lime-300 hover:bg-lime-500/20" : "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"} font-bold py-2 px-3 rounded-lg transition-colors`}>Research Amazon</a></> : <div className="flex-grow flex items-center justify-center text-center text-neutral-500">No data</div>}</div>}
            </div>
        </li>);
    };

    const ScoutView = () => {
        const CurrentCategoryIcon = categoryConfig[category].icon;
        return <div className="space-y-6">{!shelfImage && (<div className={`bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-8 text-center flex flex-col items-center shadow-2xl`}><div className={`w-20 h-20 rounded-full bg-gradient-to-br ${category === 'books' ? 'from-amber-500 to-orange-600' : category === 'media' ? 'from-cyan-500 to-blue-600' : category === 'videoGames' ? 'from-lime-500 to-green-600' : 'from-rose-500 to-red-600'} flex items-center justify-center mb-6 shadow-lg`}><CurrentCategoryIcon className="w-10 h-10 text-white"/></div><h2 className="text-2xl font-bold text-white mb-2">Scan for {categoryConfig[category].plural}</h2><p className="text-neutral-400 mb-8 max-w-sm">Use your camera to scan entire rows to get an instant, value-ranked hit list !</p><div className="w-full flex flex-col sm:flex-row gap-4"><label htmlFor="image-capture" className={`flex-1 w-full text-white font-bold py-3 px-5 rounded-xl cursor-pointer transition-all shadow-md transform hover:scale-105 text-center ${category === 'books' ? 'bg-amber-500 hover:bg-amber-600' : category === 'media' ? 'bg-cyan-500 hover:bg-cyan-600' : category === 'videoGames' ? 'bg-lime-500 hover:bg-lime-600' : 'bg-rose-500 hover:bg-rose-600'}`}>Take Photo</label><input id="image-capture" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} /><label htmlFor="image-upload" className="flex-1 w-full bg-neutral-700 text-white font-bold py-3 px-5 rounded-xl cursor-pointer hover:bg-neutral-600 transition-all text-center">Select from Library</label><input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></div></div>)}{shelfImage && (<button onClick={() => {setShelfImage(null); setHitList([]); setAnalysisError(null);}} className="w-full bg-neutral-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-neutral-600 transition-all">Start New Scan</button>)}{(loadingAnalysis || hitList.length > 0) && (<div className="space-y-4">{loadingAnalysis && (<div className="flex flex-col items-center text-center p-8 bg-neutral-800/50 rounded-xl"><Spinner /><p className={`mt-4 ${category === 'books' ? 'text-amber-400' : category === 'media' ? 'text-cyan-400' : category === 'videoGames' ? 'text-lime-400' : 'text-rose-400'} font-semibold`}>{analysisStatus}</p></div>)}{analysisError && <p className="text-red-400 text-center p-4 font-semibold bg-red-900/50 rounded-lg">{analysisError}</p>}{hitList.length > 0 && (<div><div className="text-center mb-4"><h3 className="text-2xl font-bold text-white">Analysis Results</h3><p className="text-sm text-neutral-500">Prices are simulated. Always check live comps.</p></div><ul className="space-y-4">{hitList.map((item, index) => (<ResultCard key={index} item={item} />))}</ul></div>)}</div>)}</div>;
    };
    
    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'); body { font-family: 'Inter', sans-serif; } .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; opacity: 0; } @keyframes fadeIn { to { opacity: 1; } }`}</style>
            <div className="bg-neutral-900 text-white min-h-screen font-sans p-4">
                <div className="max-w-lg mx-auto">
                    <header className="text-center my-8"><Header /></header>
                    <div className="flex justify-center bg-neutral-800 p-1.5 rounded-full mb-8 shadow-lg">
                        <button onClick={() => setCategory('books')} className={`w-1/4 py-2 px-2 rounded-full font-bold transition-all flex items-center justify-center text-xs ${category === 'books' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-700/50'}`}><BookIcon className="mr-2 w-5 h-5 text-amber-400" />Books</button>
                        <button onClick={() => setCategory('media')} className={`w-1/4 py-2 px-2 rounded-full font-bold transition-all flex items-center justify-center text-xs ${category === 'media' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-700/50'}`}><FilmIcon className="mr-2 w-5 h-5 text-cyan-400" />Media</button>
                        <button onClick={() => setCategory('videoGames')} className={`w-1/4 py-2 px-2 rounded-full font-bold transition-all flex items-center justify-center text-xs ${category === 'videoGames' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-700/50'}`}><GamepadIcon className="mr-2 w-5 h-5 text-lime-400" />Games</button>
                        <button onClick={() => setCategory('boardGames')} className={`w-1/4 py-2 px-2 rounded-full font-bold transition-all flex items-center justify-center text-xs ${category === 'boardGames' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-700/50'}`}><DiceIcon className="mr-2 w-5 h-5 text-rose-400" />Board Games</button>
                    </div>
                    <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 mb-8 flex justify-center items-center gap-8">
                        <Toggle label="eBay" enabled={showEbay} onChange={() => setShowEbay(!showEbay)} />
                        <Toggle label="Amazon" enabled={showAmazon} onChange={() => setShowAmazon(!showAmazon)} />
                    </div>
                    <ScoutView />
                </div>
            </div>
        </>
    );
}
