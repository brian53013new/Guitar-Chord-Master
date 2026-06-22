import React, { useState, useEffect, useMemo } from 'react';

/* ================= AUDIO ENGINE ================= */
const MIDI_OPEN = {6:40, 5:45, 4:50, 3:55, 2:59, 1:64};
let _audioCtx = null;
const getAudioCtx = () => {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
};

export const playNotes = (dots) => {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const notes = dots.map(d => ({...d, midi: MIDI_OPEN[d.string] + d.fret})).sort((a,b) => a.midi - b.midi);
    const now = ctx.currentTime;
    const strumSpeed = notes.length > 1 ? 0.04 : 0;
    notes.forEach((n, i) => {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator(); 
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        const freq = 440 * Math.pow(2, (n.midi - 69) / 12);
        osc.frequency.value = freq; osc.type = 'sawtooth'; 
        osc2.frequency.value = freq; osc2.detune.value = 5; osc2.type = 'triangle';
        filter.type = 'lowpass'; filter.Q.value = 0.5;
        osc.connect(filter); osc2.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        const start = now + (i * strumSpeed); 
        const duration = 2.5;
        filter.frequency.setValueAtTime(200, start); 
        filter.frequency.linearRampToValueAtTime(6000, start + 0.02); 
        filter.frequency.exponentialRampToValueAtTime(500, start + 0.5); 
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.1, start + 0.02); 
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration); 
        osc.start(start); osc2.start(start); osc.stop(start + duration); osc2.stop(start + duration);
    });
};

/* ================= DATA HELPERS ================= */
export const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const FLATS = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
const OPEN_STRINGS = {6:4, 5:9, 4:2, 3:7, 2:11, 1:4}; 
const DEGREE_LABELS = { 0: "R", 1: "b2", 2: "2", 3: "b3", 4: "3", 5: "4", 6: "b5", 7: "5", 8: "b6", 9: "6", 10: "b7", 11: "7" };
const FORMULA_MAP = { 0: "1", 1: "b2", 2: "2", 3: "b3", 4: "3", 5: "4", 6: "b5", 7: "5", 8: "b6", 9: "6", 10: "b7", 11: "7" };

export const pcOf = (n) => NOTES.indexOf(n.replace("♯","#").replace("♭","b"));
const toSharp = (pc) => NOTES[(pc+12)%12];
const toFlat = (pc) => FLATS[(pc+12)%12];
const preferFlat = (s, f) => (s.includes("#") ? f : s);
const getFretOn6 = (rootPc) => ((rootPc - 4) % 12 + 12) % 12;

export const buildChordData = (root, typeObj, group) => {
    const rootPc = pcOf(root);
    let strings = [];
    const shape = typeObj.shapes[group] || typeObj.shapes["6-4-3"];
    let baseFret;
    if (group.startsWith("6")) baseFret = getFretOn6(rootPc);
    else if (group.startsWith("5")) baseFret = ((rootPc - 9)%12+12)%12;
    else if (group.startsWith("4")) baseFret = ((rootPc - 2)%12+12)%12;
    else baseFret = ((rootPc - 7)%12+12)%12;
    const stringSet = group.split("-").map(Number);
    stringSet.forEach(str => {
        const offset = shape.offsets[str];
        if (offset !== undefined) {
            const fret = baseFret + offset;
            const openPc = OPEN_STRINGS[str];
            const currentPc = (openPc + fret) % 12;
            const interval = (currentPc - rootPc + 12) % 12;
            strings.push({ string: str, fret: fret, pc: currentPc, degree: DEGREE_LABELS[interval] || "R", note: preferFlat(toSharp(currentPc), toFlat(currentPc)), isRoot: interval === 0 });
        }
    });
    const frets = strings.map(s=>s.fret);
    return { root, type: typeObj, group, displayNameZh: root + " " + typeObj.zh, displayNameEn: root + " " + typeObj.en, dots: strings, span: [Math.min(...frets), Math.max(...frets)], formula: typeObj.formula };
};

export const buildScaleData = (root, scaleObj) => {
    const rootPc = pcOf(root);
    const scalePcs = scaleObj.intervals.map(i => (rootPc + i) % 12);
    const dots = [];
    for (let str=1; str<=6; str++) {
        const openPc = OPEN_STRINGS[str];
        for (let fret=0; fret<=24; fret++) {
            const pc = (openPc + fret) % 12;
            if (scalePcs.includes(pc)) {
                const interval = (pc - rootPc + 12) % 12;
                dots.push({ string: str, fret: fret, pc: pc, note: preferFlat(toSharp(pc), toFlat(pc)), degree: DEGREE_LABELS[interval] || "?", isRoot: interval === 0 });
            }
        }
    }
    return { root, type: scaleObj, displayNameZh: `${root} ${scaleObj.zh}`, displayNameEn: `${root} ${scaleObj.en}`, dots: dots, formula: scaleObj.intervals.map(i => FORMULA_MAP[i] || "?").join("-") };
};

/* ================= COMPONENTS ================= */

export const TextToggle = ({ options, value, onChange }) => (
    <div className="text-toggle">
        {options.map(o => (
            <button key={o.val} onClick={()=>onChange(o.val)} className={`text-toggle-btn ${value===o.val?'active':''}`}>{o.label}</button>
        ))}
    </div>
);

export const FretboardBlueprint = ({ dots, isScale, displayMode, t }) => {
    return (
        <div className="fretboard-container animate-in">
            <div className="fret-grid-horizontal">
                {/* 弦的線條 1-6 (橫向) */}
                {[1,2,3,4,5,6].map(s => (
                    <React.Fragment key={s}>
                        <div className={`string-line str-${s}`} style={{gridRow: s}}></div>
                        <div className="string-label" style={{gridRow: s, alignSelf: 'center'}}>
                            {s === 1 ? '1st' : s === 6 ? '6th' : `${s}`}
                        </div>
                    </React.Fragment>
                ))}
                
                {/* 品格垂直線 & 琴枕 */}
                <div className="fret-vert-line nut" style={{gridColumn: 1, gridRow: "1 / -1"}}></div>
                {Array.from({length: 24}).map((_, i) => (
                    <div key={i} className="fret-vert-line" style={{gridColumn: i + 2, gridRow: "1 / -1", position: 'relative'}}>
                        {[3,5,7,9,12,15,17,19,21,24].includes(i+1) && (
                            <div className="fret-marker-dot"></div>
                        )}
                    </div>
                ))}

                {/* 音符圓點 */}
                {dots.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-center z-10" style={{gridColumn: d.fret + 1, gridRow: d.string}}>
                        <div className={`note-dot-horizontal ${d.isRoot ? 'is-root' : ''}`} onClick={(e) => { e.stopPropagation(); playNotes([d]); }}>
                            {displayMode === 'note' ? d.note : (d.degree || "")}
                        </div>
                    </div>
                ))}
            </div>
            {/* 品號標記 */}
            <div className="fret-num-container opacity-50">
                <div></div> {/* 琴枕佔位 */}
                {Array.from({length: 24}).map((_, i) => (
                    <div key={i} className="fret-num">{i+1}</div>
                ))}
            </div>
        </div>
    );
};


export const DetailSheet = ({ root, typeObj, mode, onClose, lang, t }) => {
    useEffect(() => { document.body.style.overflow='hidden'; return ()=>document.body.style.overflow=''; }, []);
    const [disp, setDisp] = useState('note'); 
    const [pos, setPos] = useState('bass');
    const [group, setGroup] = useState('6-4-3');
    useEffect(() => {
        if (mode === 'chord') {
            if (pos === 'bass' && !['6-4-3','5-4-3'].includes(group)) setGroup('6-4-3');
            if (pos === 'high' && !['4-3-2','1-2-3'].includes(group)) setGroup('4-3-2');
        }
    }, [pos, mode]);
    const data = useMemo(() => mode === 'chord' ? buildChordData(root, typeObj, group) : buildScaleData(root, typeObj), [root, typeObj, mode, group, pos]); 
    return (
        <div className="gallery-overlay animate-in">
            <div className="max-w-4xl mx-auto">
                <button onClick={onClose} className="mb-12 text-bronze text-[10px] uppercase tracking-[0.5em] flex items-center hover:opacity-60 transition">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mr-2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    {t.back}
                </button>
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <div className="catalog-label">{mode === 'chord' ? '結構定義' : '和弦音階系列'}</div>
                        <h2 className="text-5xl font-serif text-white">{lang === 'zh' ? data.displayNameZh : data.displayNameEn}</h2>
                    </div>
                    {mode === 'chord' && (
                        <div className="flex gap-12">
                            <div><div className="catalog-label">{t.position}</div><div className="catalog-value text-bronze">{data.span[0]}—{data.span[1]}</div></div>
                            <div><div className="catalog-label">{t.formula}</div><div className="catalog-value">{data.formula}</div></div>
                        </div>
                    )}
                </div>
                {mode === 'chord' && (
                    <div className="mb-12 flex justify-center border-y border-white/5 py-4">
                        <TextToggle value={pos} onChange={setPos} options={[{val:'bass',label:t.bassPos},{val:'high',label:t.highPos}]} />
                        <div className="mx-8 border-r border-white/10"></div>
                        <TextToggle value={group} onChange={setGroup} options={pos==='bass'?[{val:'6-4-3',label:'第 643 弦'},{val:'5-4-3',label:'第 543 弦'}]:[{val:'4-3-2',label:'第 432 弦'},{val:'1-2-3',label:'第 123 弦'}]} />
                    </div>
                )}
                <div className="flex justify-end mb-4">
                    <TextToggle value={disp} onChange={setDisp} options={[{val:'note',label:t.dispNote},{val:'deg',label:t.dispDeg}]} />
                </div>
                <FretboardBlueprint dots={data.dots} isScale={mode==='scale'} displayMode={disp} t={t} />
                <div className="mt-24 flex flex-col md:flex-row gap-12 items-center justify-between border-t border-white/10 pt-12">
                   <div className="text-[10px] text-zinc-500 max-w-sm italic">
                       每個音符都作為藍圖中的結構座標呈現，旨在實現和聲精準與極簡清晰。
                   </div>
                   <div className="flex gap-4">
                       <button onClick={() => playNotes(data.dots)} className="minimal-btn">{t.play}</button>
                       <button onClick={() => {
                           navigator.clipboard.writeText(data.dots.map(d=>`${d.string}-${d.fret}`).join(', '));
                           alert(t.copied);
                       }} className="minimal-btn">{t.copy}</button>
                   </div>
                </div>
            </div>
        </div>
    );
};
