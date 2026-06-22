import React, { useState, useEffect } from 'react';
import { fetchConfig, fetchChords, fetchScales } from './api';
import { TextToggle, DetailSheet, NOTES } from './components';
import './styles.css';

function App() {
    const [config, setConfig] = useState(null);
    const [chords, setChords] = useState(null);
    const [scales, setScales] = useState(null);
    const [lang, setLang] = useState('zh');
    const [mode, setMode] = useState('chord');
    const [catId, setCatId] = useState(null);
    const [typeObj, setTypeObj] = useState(null);
    const [detailDef, setDetailDef] = useState(null);

    useEffect(() => {
        const load = async () => {
            const [cfg, ch, sc] = await Promise.all([fetchConfig(), fetchChords(), fetchScales()]);
            setConfig(cfg); setChords(ch); setScales(sc);
        };
        load();
    }, []);

    if (!config || !chords || !scales) return <div className="flex items-center justify-center h-screen text-bronze uppercase tracking-[0.5em] text-[10px]">載入中...</div>;
    const t = config.TEXT[lang];

    const renderContent = () => {
        if (!catId) {
            const list = mode === 'chord' ? chords.CHORD_CATEGORIES : scales.SCALE_CATEGORIES;
            return (
                <div className="max-w-2xl mx-auto mt-12">
                    <div className="catalog-label mb-8 text-center">作品分類</div>
                    {list.map((c, i) => (
                        <div key={c.id} onClick={()=>setCatId(c.id)} className="gallery-list-item animate-in" style={{animationDelay: `${i*0.05}s`}}>
                            <h3>{t.cat[c.key]}</h3>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-bronze"><path d="M9 18l6-6-6-6"/></svg>
                        </div>
                    ))}
                </div>
            );
        }
        if (!typeObj) {
            const cat = (mode === 'chord' ? chords.CHORD_CATEGORIES : scales.SCALE_CATEGORIES).find(c=>c.id===catId);
            const items = mode === 'chord' ? chords.CHORD_TYPES.filter(it => cat.list.includes(it.id)) : scales.SCALES.filter(it => cat.list.includes(it.id));
            return (
                <div className="max-w-2xl mx-auto mt-12">
                    <button onClick={()=>setCatId(null)} className="mb-12 text-bronze text-[10px] uppercase tracking-[0.5em] flex items-center hover:opacity-60 transition">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mr-2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        {t.categories}
                    </button>
                    <div className="catalog-label mb-4">{t.cat[cat.key]}</div>
                    <div className="grid grid-cols-1 gap-2">
                        {items.map((item, idx) => (
                            <div key={idx} onClick={()=>setTypeObj(item)} className="gallery-list-item animate-in" style={{animationDelay: `${idx*0.03}s`}}>
                                <div className="flex flex-col">
                                    <span className="text-white text-lg font-serif">{lang==='zh' ? (item.zh.split(' ')[0]) : item.en}</span>
                                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">{item.label || item.en}</span>
                                </div>
                                <span className="text-[10px] text-bronze/40 font-mono">#{String(idx + 1).padStart(3, '0')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return (
            <div className="max-w-2xl mx-auto mt-12 text-center">
                <button onClick={()=>setTypeObj(null)} className="mb-12 text-bronze text-[10px] uppercase tracking-[0.5em] flex items-center justify-center hover:opacity-60 transition mx-auto">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mr-2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    {t.back}
                </button>
                <div className="catalog-label">{mode === 'chord' ? '結構系列' : '和弦音階'}</div>
                <h2 className="text-4xl text-white mb-16">{lang==='zh' ? typeObj.zh : typeObj.en}</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
                    {NOTES.map((n, i) => (
                        <button key={n} onClick={()=>setDetailDef({root:n, typeObj, mode})} className="border border-white/5 py-8 text-white font-serif text-xl hover:border-bronze hover:text-bronze transition-all animate-in" style={{animationDelay: `${i*0.02}s`}}>
                            {n}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            <header className="gallery-header">
                <div className="flex justify-between items-start max-w-6xl mx-auto">
                    <div className="flex gap-4">
                        <button onClick={()=>setLang('zh')} className={`text-[10px] tracking-widest ${lang==='zh'?'text-bronze':'text-zinc-600'}`}>中文</button>
                        <button onClick={()=>setLang('en')} className={`text-[10px] tracking-widest ${lang==='en'?'text-bronze':'text-zinc-600'}`}>EN</button>
                    </div>
                    <div>
                        <h1 className="gallery-title">{t.title}</h1>
                        <div className="edition-label">{t.edition} / 目錄編號 2024</div>
                    </div>
                    <div className="w-12"></div>
                </div>
                <div className="mt-16">
                     <TextToggle value={mode} onChange={(m)=>{setMode(m); setCatId(null); setTypeObj(null);}} options={[{val:'chord',label:t.chord},{val:'scale',label:t.scale}]} />
                </div>
            </header>
            <main className="p-8 pb-32">{renderContent()}</main>
            {detailDef && <DetailSheet {...detailDef} onClose={()=>setDetailDef(null)} lang={lang} t={t} />}
        </div>
    );
}

export default App;
