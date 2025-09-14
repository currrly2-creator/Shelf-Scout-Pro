import React from 'react';
import { useState } from 'react';

// --- Helper Icons ---
const BookIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> );
const FilmIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg> );
const DiceIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M16 8h.01"/><path d="M8 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/></svg> );
const GamepadIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><rect x="13" y="8" width="5" height="2" rx="1"/><rect x="14" y="14" width="5" height="2" rx="1"/><path d="M17.5 22a2.5 2.5 0 0 0 2.5-2.5V18a2.5 2.5 0 0 0-2.5-2.5h-5A2.5 2.5 0 0 0 10 18v1.5A2.5 2.5 0 0 0 12.5 22Z"/><path d="M6.5 22a2.5 2.5 0 0 1-2.5-2.5V18a2.5 2.5 0 0 1 2.5-2.5h5A2.5 2.5 0 0 1 14 18v1.5a2.5 2.5 0 0 1-2.5 2.5Z"/><path d="M14 2.5a2.5 2.5 0 0 0-2.5-2.5h-5A2.5 2.5 0 0 0 4 2.5V6a2.5 2.5 0 0 0 2.5 2.5h5A2.5 2.5 0 0 0 14 6Z"/></svg> );
const CameraIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}> <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /> </svg> );
const CheckCircleIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> );

// --- Main App Component ---
export default function App() {
    const [category, setCategory] = useState('books');
    const [isProUser, setIsProUser] = useState(false);
    const [shelfImage, setShelfImage] = useState(null);
    const [hitList, setHitList] = useState([]);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [analysisStatus, setAnalysisStatus] = useState('');
    const [analysisError, setAnalysisError] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState('annual');
    const [showEbay, setShowEbay] = useState(true);
    const [showAmazon, setShowAmazon] = useState(true);

    const categoryConfig = {
        books: { icon: BookIcon, plural: "Books", aiPrompt: "You are a book identification expert. Analyze the spines in the image. For each book, extract the Title, Author, and any specific Details like 'First Edition', 'Signed', 'Book Club'. Format as: Title | Author | Details. Provide ONLY the list of items. Do not include any introductory text, summary, or preamble." },
        media: { icon: FilmIcon, plural: "DVD/VHS/Blu-ray", aiPrompt: "You are a media identification expert. Analyze the spines in the image. For each item, extract the Title, Format (DVD, VHS, Blu-ray), and Details like 'Collector's Edition', 'Steelbook'. Format as: Title | Format | Details. Provide ONLY the list of items. Do not include any introductory text, summary, or preamble." },
        videoGames: { icon: GamepadIcon, plural: "Video Games", aiPrompt: "You are a video game identification expert. Analyze the spines of the game cases. For each game, extract the Title and the Platform (e.g., PlayStation 2, Xbox, Nintendo Switch, etc.). Format as: Title | Platform. Provide ONLY the list of items. Do not include any introductory text, summary, or preamble." },
        boardGames: { icon: DiceIcon, plural: "Board Games", aiPrompt: "You are a board game identification expert. Analyze the sides of the boxes. Extract the Title and Publisher. Format as: Title | Publisher. Provide ONLY the list of items. Do not include any introductory text, summary, or preamble." }
    };
    
    const analyzeImageWithAI = async (base64ImageData) => {
        if (!showEbay && !showAmazon) { setAnalysisError("Please select at least one data source."); return; }
        setLoadingAnalysis(true); setAnalysisStatus('Analyzing spines for details...'); setHitList([]); setAnalysisError(null);
        const apiKey = ""; const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [ { text: categoryConfig[category].aiPrompt }, { inlineData: { mimeType: "image/jpeg", data: base64ImageData } } ] }] };
        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const result = await response.json(); const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                const filteredLines = text.split('\n').map(t => t.trim()).filter(t => t.includes('|') && t.length > 3);
                const uniqueLines = [...new Set(filteredLines)];
                if (uniqueLines.length === 0) throw new Error("AI could not identify any clear items.");
                setAnalysisStatus(`Found ${uniqueLines.length} items. Fetching market comps...`);
                let items = [];
                for (const line of uniqueLines) { const parts = line.split('|').map(p => p.trim()); if (parts[0]) items.push({ title: parts[0], field2: parts[1] || '', details: parts[2] || '' }); }
                const compPromises = items.map(item => {
                    const ebayPromise = showEbay ? fetchEbaySoldComps(category, item.title, item.field2, item.details) : Promise.resolve({ count: 0, medianPrice: 0, sellThrough: 0 });
                    const amazonPromise = showAmazon ? fetchAmazonComps() : Promise.resolve({ bsr: null, buyBoxPrice: null, lowestUsedPrice: null, offers: 0 });
                    return Promise.all([ebayPromise, amazonPromise]).then(([ebayComps, amazonComps]) => ({...item, ebayComps, amazonComps, searchQuery: `${item.title} ${item.field2} ${item.details}` }));
                });
                const settledResults = await Promise.all(compPromises);
                const validResults = settledResults.filter(item => item.ebayComps.count > 0 || item.amazonComps.bsr);
                validResults.sort((a, b) => (b.ebayComps.medianPrice || 0) - (a.ebayComps.medianPrice || 0));
                setHitList(validResults);
            } else { throw new Error("No items were identified by the AI."); }
        } catch (error) { console.error("AI Analysis Error:", error); setAnalysisError("Failed to analyze image. Try a clearer picture.");
        } finally { setLoadingAnalysis(false); setAnalysisStatus(''); }
    };
    
    const fetchEbaySoldComps = async (cat, title, field2, details) => new Promise(resolve => setTimeout(() => {
        let basePrice = 5;
        if(cat === 'books') { basePrice = Math.random() * 8 + 4; if (details.toLowerCase().includes('first edition')) basePrice = Math.random() * 80 + 30; }
        if(cat === 'media') { basePrice = Math.random() * 8 + 3; if (details.toLowerCase().includes('criterion')) basePrice = Math.random() * 30 + 15; }
        if(cat === 'boardGames') { basePrice = Math.random() * 15 + 10; if (field2.toLowerCase().includes('fantasy flight')) basePrice = Math.random() * 40 + 25; }
        if(cat === 'videoGames') { basePrice = Math.random() * 20 + 10; if (field2.toLowerCase().includes('nintendo') || field2.toLowerCase().includes('playstation 2')) basePrice = Math.random() * 60 + 20; }
        
        let prices = Array.from({length: Math.floor(Math.random() * 15) + 5}, () => basePrice * (0.8 + Math.random() * 0.4));
        if (Math.random() > 0.9) prices.push(basePrice * 5 + 50);
        prices.sort((a, b) => a - b);
        const mid = Math.floor(prices.length / 2);
        const medianPrice = prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;
        
        const soldCount = prices.length;
        const activeCount = Math.floor(Math.random() * (soldCount * 3)) + Math.floor(soldCount / 2);
        const sellThrough = Math.round((soldCount / (soldCount + activeCount)) * 100);

        resolve({ count: soldCount, medianPrice, sellThrough }); 
    }, 400 + Math.random() * 400));
    
    const fetchAmazonComps = async () => new Promise(resolve => { setTimeout(() => { if (Math.random() > 0.3) { const buyBox = Math.random() * 30 + 5; resolve({ bsr: Math.floor(Math.random() * 300000) + 1000, buyBoxPrice: buyBox, lowestUsedPrice: buyBox * (0.8 + Math.random() * 0.15), offers: Math.floor(Math.random() * 20) + 1 }); } else { resolve({ bsr: null, buyBoxPrice: null, lowestUsedPrice: null, offers: 0 }); } }, 400 + Math.random() * 400)});
    const handleImageUpload = (event) => { const file = event.target.files[0]; if (file) { setShelfImage(null); setHitList([]); setAnalysisError(null); const reader = new FileReader(); reader.onloadend = () => { setShelfImage(reader.result); const base64Data = reader.result.split(',')[1]; analyzeImageWithAI(base64Data); }; reader.readAsDataURL(file); } };
    const getValueColor = (value) => { if (value > 40) return 'text-green-400'; if (value > 15) return 'text-yellow-400'; return 'text-neutral-400'; };
    const getBsrColor = (bsr) => { if(!bsr) return 'text-neutral-500'; if (bsr < 50000) return 'text-green-400'; if (bsr < 150000) return 'text-yellow-400'; return 'text-neutral-400'; };
    const getSellThroughColor = (rate) => { if (rate > 65) return 'text-green-400'; if (rate > 35) return 'text-yellow-400'; return 'text-red-400'; };
    const FormatTag = ({ format }) => { const styles = { DVD: 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/50', VHS: 'bg-yellow-800/50 text-yellow-300 border-yellow-500/50', 'BLU-RAY': 'bg-sky-800/50 text-sky-300 border-sky-500/50' }; return <span className={`text-xs align-middle font-semibold px-2 py-1 rounded-full ${styles[format] || 'bg-neutral-700 text-neutral-300'}`}>{format}</span>; };
    const Toggle = ({ label, enabled, onChange }) => (<label className="flex items-center cursor-pointer"><div className="relative"><input type="checkbox" className="sr-only" checked={enabled} onChange={onChange} /><div className={`block ${enabled ? 'bg-green-500' : 'bg-neutral-600'} w-14 h-8 rounded-full`}></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div></div><span className="ml-3 text-white font-medium">{label}</span></label>);
    
    const getCategoryStyles = (cat) => {
        const styles = {
            books: { text: "text-amber-400", bg: "bg-amber-500", hoverBg: "hover:bg-amber-600", gradient: "from-amber-500 to-orange-600", border: "border-amber-500", shadow: "hover:shadow-amber-500/10", hoverBorder: "hover:border-amber-500/50", buttonText: "text-amber-300", buttonBg: "bg-amber-500/10", buttonHoverBg: "hover:bg-amber-500/20", headerGradient: "from-amber-400 to-orange-500"},
            media: { text: "text-cyan-400", bg: "bg-cyan-500", hoverBg: "hover:bg-cyan-600", gradient: "from-cyan-500 to-blue-600", border: "border-cyan-500", shadow: "hover:shadow-cyan-500/10", hoverBorder: "hover:border-cyan-500/50", buttonText: "text-cyan-300", buttonBg: "bg-cyan-500/10", buttonHoverBg: "hover:bg-cyan-500/20", headerGradient: "from-cyan-400 to-blue-500"},
            videoGames: { text: "text-lime-400", bg: "bg-lime-500", hoverBg: "hover:bg-lime-600", gradient: "from-lime-500 to-green-600", border: "border-lime-500", shadow: "hover:shadow-lime-500/10", hoverBorder: "hover:border-lime-500/50", buttonText: "text-lime-300", buttonBg: "bg-lime-500/10", buttonHoverBg: "hover:bg-lime-500/20", headerGradient: "from-lime-400 to-green-500"},
            boardGames: { text: "text-rose-400", bg: "bg-rose-500", hoverBg: "hover:bg-rose-600", gradient: "from-rose-500 to-red-600", border: "border-rose-500", shadow: "hover:shadow-rose-500/10", hoverBorder: "hover:border-rose-500/50", buttonText: "text-rose-300", buttonBg: "bg-rose-500/10", buttonHoverBg: "hover:bg-rose-500/20", headerGradient: "from-rose-400 to-red-500"}
        };
        return styles[cat] || styles.books;
    };
    
    const Header = () => {
        const styles = getCategoryStyles(category);
        const headerGradient = isProUser ? styles.headerGradient : "from-purple-400 to-indigo-500";
        const headerText = isProUser ? categoryConfig[category].plural : 'Scout Pro';
        return <h1 className="text-5xl font-extrabold text-white">Shelf <span className={`text-transparent bg-clip-text bg-gradient-to-r ${headerGradient}`}>{headerText}</span></h1>;
    };

    const Spinner = () => {
        const styles = getCategoryStyles(category);
        return <div className={`w-8 h-8 border-4 ${styles.border} border-t-transparent rounded-full animate-spin`}></div>
    };
    
    const ResultCard = ({item}) => {
        const { title, field2, details, ebayComps, amazonComps, searchQuery } = item;
        const styles = getCategoryStyles(category);
        const amazonSearchQuery = `${title} ${field2} ${details}`;
        return (<li className={`bg-neutral-800 p-4 rounded-2xl shadow-lg border border-neutral-700 transition-all ${styles.hoverBorder} ${styles.shadow} animate-fade-in`}><div><h4 className="font-bold text-white text-lg">{title}</h4>{category === 'books' && field2 && <p className="text-sm text-neutral-400 -mt-1">by {field2}</p>}{category === 'media' && field2 && <FormatTag format={field2} /> }{category === 'boardGames' && field2 && <p className="text-sm text-neutral-400 -mt-1">{field2}</p>}{category === 'videoGames' && field2 && <p className="text-sm font-bold mt-1 text-lime-400">{field2}</p>}{details && <p className="text-xs text-yellow-400 mt-2 font-semibold bg-yellow-900/50 px-2 py-1 rounded-md inline-block">{details}</p>}</div><div className="border-t border-neutral-700 my-4"></div><div className={`grid gap-4 ${showEbay && showAmazon ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {showEbay && <div className="bg-neutral-900/50 p-3 rounded-lg flex flex-col"><div className="flex justify-between items-center"><h5 className="font-bold text-white">eBay</h5><span className="text-xs text-neutral-400">{ebayComps.count} sold</span></div><div className="grid grid-cols-2 gap-2 items-center flex-grow"><div className="text-center"><div className={`text-2xl font-bold ${getValueColor(ebayComps.medianPrice)}`}>${ebayComps.medianPrice.toFixed(2)}</div><p className="text-xs text-neutral-500">Median Sale</p></div><div className="text-center"><div className={`text-2xl font-bold ${getSellThroughColor(ebayComps.sellThrough)}`}>{ebayComps.sellThrough}%</div><p className="text-xs text-neutral-500">Sell-Thru</p></div></div><a href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}&_sacat=0&LH_Complete=1&LH_Sold=1`} target="_blank" rel="noopener noreferrer" className={`col-span-2 block text-center mt-2 text-sm ${styles.buttonBg} ${styles.buttonText} font-bold py-2 px-3 rounded-lg ${styles.buttonHoverBg} transition-colors`}>Research eBay</a></div>}
            {showAmazon && <div className="bg-neutral-900/50 p-3 rounded-lg flex flex-col"><div className="flex justify-between items-center"><h5 className="font-bold text-white">Amazon</h5>{amazonComps.bsr && <span className="text-xs text-neutral-400">{amazonComps.offers} offers</span>}</div>{amazonComps.bsr ? <><div className="flex-grow flex items-center justify-center"><div className="text-center"><div className={`text-4xl font-bold ${getBsrColor(amazonComps.bsr)}`}>{amazonComps.bsr.toLocaleString()}</div><p className="text-xs text-neutral-500">Sales Rank</p></div></div><div className="border-t border-neutral-700 my-2"></div><div className="text-center"><p className="text-xs text-neutral-400">Buy Box / Lowest Used</p><p className="font-bold text-lg text-white">${amazonComps.buyBoxPrice.toFixed(2)} <span className="text-neutral-400">/</span> <span className="text-yellow-400">${amazonComps.lowestUsedPrice.toFixed(2)}</span></p></div><a href={`https://www.amazon.com/s?k=${encodeURIComponent(amazonSearchQuery)}`} target="_blank" rel="noopener noreferrer" className={`block text-center mt-2 text-sm ${styles.buttonBg} ${styles.buttonText} font-bold py-2 px-3 rounded-lg ${styles.buttonHoverBg} transition-colors`}>Research Amazon</a></> : <div className="flex-grow flex items-center justify-center text-center text-neutral-500">No data</div>}</div>}
        </div></li>);
    };

    const ScoutView = () => {
        const styles = getCategoryStyles(category);
        const CurrentCategoryIcon = categoryConfig[category].icon;
        return <div className="space-y-6">{!shelfImage && (<div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-8 text-center flex flex-col items-center shadow-2xl"><div className={`w-20 h-20 rounded-full bg-gradient-to-br ${styles.gradient} flex items-center justify-center mb-6 shadow-lg`}><CurrentCategoryIcon className="w-10 h-10 text-white"/></div><h2 className="text-2xl font-bold text-white mb-2">Scan for {categoryConfig[category].plural}</h2><p className="text-neutral-400 mb-8 max-w-sm">Use your camera to scan entire rows to get an instant, value-ranked hit list !</p><div className="w-full flex flex-col sm:flex-row gap-4"><label htmlFor="image-capture" className={`flex-1 w-full ${styles.bg} text-white font-bold py-3 px-5 rounded-xl cursor-pointer ${styles.hoverBg} transition-all shadow-md transform hover:scale-105 text-center`}>Take Photo</label><input id="image-capture" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} /><label htmlFor="image-upload" className="flex-1 w-full bg-neutral-700 text-white font-bold py-3 px-5 rounded-xl cursor-pointer hover:bg-neutral-600 transition-all text-center">Select from Library</label><input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></div></div>)}{shelfImage && (<button onClick={() => {setShelfImage(null); setHitList([]); setAnalysisError(null);}} className="w-full bg-neutral-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-neutral-600 transition-all">Start New Scan</button>)}{(loadingAnalysis || hitList.length > 0) && (<div className="space-y-4">{loadingAnalysis && (<div className="flex flex-col items-center text-center p-8 bg-neutral-800/50 rounded-xl"><Spinner /><p className={`mt-4 ${styles.text} font-semibold`}>{analysisStatus}</p></div>)}{analysisError && <p className="text-red-400 text-center p-4 font-semibold bg-red-900/50 rounded-lg">{analysisError}</p>}{hitList.length > 0 && (<div><div className="text-center mb-4"><h3 className="text-2xl font-bold text-white">Analysis Results</h3><p className="text-sm text-neutral-500">Prices are simulated. Always check live comps.</p></div><ul className="space-y-4">{hitList.map((item, index) => (<ResultCard key={index} item={item} />))}</ul></div>)}</div>)}</div>;
    };
    
    const SubscriptionView = () => (<div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 p-6 rounded-2xl shadow-2xl text-center"><div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"><CameraIcon className="w-10 h-10 text-white"/></div><h2 className="text-3xl font-bold text-white mb-2">Unlock Scout Pro</h2><p className="text-neutral-400 mb-6">Gain a powerful advantage. Instantly analyze shelves of books, media, and games.</p><ul className="text-left space-y-3 mb-8 text-lg"><li className="flex items-center"><CheckCircleIcon className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" /><span className="text-neutral-300">Unlimited Scans for All Categories</span></li><li className="flex items-center"><CheckCircleIcon className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" /><span className="text-neutral-300">Save hours of manual searching</span></li><li className="flex items-center"><CheckCircleIcon className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" /><span className="text-neutral-300">Make smarter buying decisions</span></li></ul><div className="space-y-4 mb-6">
        <button onClick={() => setSelectedPlan('annual')} className={`w-full p-4 rounded-xl border-2 transition-all ${selectedPlan === 'annual' ? 'border-purple-500 bg-purple-900/50' : 'border-neutral-700 bg-neutral-800/50'}`}><div className="flex justify-between items-center"><div className="text-left"><p className="font-bold text-white">Annual Plan</p><p className="text-sm text-neutral-400">$69.99 / year</p></div><div className="text-lg font-bold text-green-400">Save 25%</div></div></button>
        <button onClick={() => setSelectedPlan('monthly')} className={`w-full p-4 rounded-xl border-2 transition-all ${selectedPlan === 'monthly' ? 'border-purple-500 bg-purple-900/50' : 'border-neutral-700 bg-neutral-800/50'}`}><div className="text-left"><p className="font-bold text-white">Monthly Plan</p><p className="text-sm text-neutral-400">$7.99 / month</p></div></button>
    </div><button onClick={() => setIsProUser(true)} className="w-full bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold py-4 px-4 rounded-xl hover:from-green-600 hover:to-emerald-500 transition-all shadow-lg text-lg transform hover:scale-105">Start 7-Day Free Trial</button><p className="text-xs text-neutral-500 mt-4">Cancel anytime.</p></div>);

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'); body { font-family: 'Inter', sans-serif; } .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; opacity: 0; } @keyframes fadeIn { to { opacity: 1; } }`}</style>
            <div className="bg-neutral-900 text-white min-h-screen font-sans p-4">
                <div className="max-w-lg mx-auto">
                    <header className="text-center my-8"><Header /></header>
                    {isProUser ? (
                        <>
                            <div className="flex justify-center bg-neutral-800 p-1.5 rounded-full mb-8 shadow-lg">
                                {Object.keys(categoryConfig).map(catKey => {
                                    const Icon = categoryConfig[catKey].icon;
                                    const styles = getCategoryStyles(catKey);
                                    return (
                                        <button key={catKey} onClick={() => setCategory(catKey)} className={`w-1/4 py-2 px-2 rounded-full font-bold transition-all flex items-center justify-center text-xs ${category === catKey ? `bg-neutral-700 text-white` : 'text-neutral-400 hover:bg-neutral-700/50'}`}>
                                           <Icon className={`mr-2 w-5 h-5 ${styles.text}`} />
                                           {categoryConfig[catKey].plural}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 mb-8 flex justify-center items-center gap-8">
                                <Toggle label="eBay" enabled={showEbay} onChange={() => setShowEbay(!showEbay)} />
                                <Toggle label="Amazon" enabled={showAmazon} onChange={() => setShowAmazon(!showAmazon)} />
                            </div>
                            <ScoutView />
                        </>
                    ) : <SubscriptionView /> }
                </div>
            </div>
        </>
    );
}

