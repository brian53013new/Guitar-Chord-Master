import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(__dirname));

const TEXT = {
    zh: {
        title: "吉他顧問", edition: "典藏版", chord: "和弦", scale: "音階",
        bassPos: "低把位", highPos: "高把位", categories: "返回類別", back: "返回",
        formula: "結構", position: "把位", notes: "音符數", root: "根音",
        chordTone: "組成音", scaleNote: "音階音", string: "弦", fret: "品",
        note: "音名", degree: "度數", copy: "複製座標", copied: "已複製！",
        topStr: "上方為第 1 弦 (高音)", dispNote: "顯示音名", dispDeg: "顯示度數", play: "播放試聽",
        cat: {
           triads: "三和弦系列", sixths: "六和弦系列", sevenths: "七和弦系列", dom_plus: "變化與掛留屬和弦",
           ninths: "九和弦系列", elevenths: "十一和弦系列", thirteenths: "十三和弦系列", tenths: "第十音系列",
           no35: "省略音和弦", special: "特殊風格系列",
           basic: "基礎與五聲音階", modes: "自然調式系列", jazz: "爵士與旋律小調",
           sym: "對稱音階系列", exotic: "異國風情系列"
        }
    },
    en: {
        title: "Guitar Advisor", edition: "Collector's Ed.", chord: "Chords", scale: "Scales",
        bassPos: "Bass Pos.", highPos: "High Pos.", categories: "Categories", back: "Back",
        formula: "Formula", position: "Pos.", notes: "Notes", root: "Root",
        chordTone: "Tones", scaleNote: "Notes", string: "Str", fret: "Fret",
        note: "Note", degree: "Degree", copy: "Copy", copied: "Copied!",
        topStr: "Top is 1st String", dispNote: "Show Notes", dispDeg: "Show Degrees", play: "Play",
        cat: {
           triads: "Triads", sixths: "Sixth Chords", sevenths: "Sevenths", dom_plus: "Altered & Suspended Dominants",
           ninths: "Ninths", elevenths: "Elevenths", thirteenths: "Thirteenths", tenths: "Tenths",
           no35: "No 3/5", special: "Special Styles",
           basic: "Basic & Penta", modes: "Modes", jazz: "Jazz & Melodic",
           sym: "Symmetric", exotic: "Exotic"
        }
    }
};

const mk = (id, label, zh, en, formula, intervals) => ({ id, label, zh, en, formula, intervals });

// Keep the public data API aligned with the browser catalogue.
const CHORD_TYPES = [
    mk("Maj","","大三和弦","Major triad","1-3-5",[0,4,7]), mk("m","m","小三和弦","Minor triad","1-b3-5",[0,3,7]),
    mk("dim","dim","減三和弦","Diminished triad","1-b3-b5",[0,3,6]), mk("aug","aug","增三和弦","Augmented triad","1-3-#5",[0,4,8]),
    mk("sus2","sus2","掛二和弦","Suspended 2nd","1-2-5",[0,2,7]), mk("sus4","sus4","掛四和弦","Suspended 4th","1-4-5",[0,5,7]), mk("5","5","強力和弦（五度）","Power chord","1-5",[0,7]),
    mk("6","6","大六和弦","Major 6th","1-3-5-6",[0,4,7,9]), mk("m6","m6","小六和弦","Minor 6th","1-b3-5-6",[0,3,7,9]),
    mk("69","6/9","六九和弦","Major 6/9","1-3-5-6-9",[0,4,7,9,2]), mk("m69","m6/9","小六九和弦","Minor 6/9","1-b3-5-6-9",[0,3,7,9,2]),
    mk("69#11","6/9#11","六九升十一和弦","Major 6/9 sharp 11","1-3-5-6-9-#11",[0,4,7,9,2,6]),
    mk("Maj7","maj7","大七和弦","Major 7th","1-3-5-7",[0,4,7,11]), mk("7","7","屬七和弦","Dominant 7th","1-3-5-b7",[0,4,7,10]), mk("m7","m7","小七和弦","Minor 7th","1-b3-5-b7",[0,3,7,10]),
    mk("mMaj7","m(maj7)","小大七和弦","Minor-major 7th","1-b3-5-7",[0,3,7,11]), mk("m7b5","m7b5","半減七和弦","Half-diminished 7th","1-b3-b5-b7",[0,3,6,10]),
    mk("dim7","dim7","減七和弦","Diminished 7th","1-b3-b5-bb7",[0,3,6,9]), mk("aug7","7#5","增屬七和弦","Augmented dominant 7th","1-3-#5-b7",[0,4,8,10]),
    mk("7alt","7alt","變化屬七和弦","Altered dominant 7th","1-3-b7-b9-#9-b5-#5",[0,4,10,1,3,6,8]), mk("7sus4","7sus4","屬七掛四和弦","Dominant 7sus4","1-4-5-b7",[0,5,7,10]),
    mk("Maj7#5","maj7#5","大七升五和弦","Major 7 sharp 5","1-3-#5-7",[0,4,8,11]), mk("dimMaj7","dim(maj7)","減大七和弦","Diminished-major 7th","1-b3-b5-7",[0,3,6,11]),
    mk("7b9","7b9","屬七降九和弦","Dominant 7 flat 9","1-3-5-b7-b9",[0,4,7,10,1]), mk("7#9","7#9","屬七升九和弦","Dominant 7 sharp 9","1-3-5-b7-#9",[0,4,7,10,3]),
    mk("7b13","7b13","屬七降十三和弦","Dominant 7 flat 13","1-3-5-b7-b13",[0,4,7,10,8]), mk("7#11","7#11","屬七升十一和弦","Dominant 7 sharp 11","1-3-5-b7-#11",[0,4,7,10,6]), mk("7b5","7b5","屬七降五和弦","Dominant 7 flat 5","1-3-b5-b7",[0,4,6,10]),
    mk("7b9#11","7b9#11","屬七降九升十一和弦","Dominant 7 flat 9 sharp 11","1-3-5-b7-b9-#11",[0,4,7,10,1,6]), mk("7#9b13","7#9b13","屬七升九降十三和弦","Dominant 7 sharp 9 flat 13","1-3-5-b7-#9-b13",[0,4,7,10,3,8]), mk("7b9b13","7b9b13","屬七降九降十三和弦","Dominant 7 flat 9 flat 13","1-3-5-b7-b9-b13",[0,4,7,10,1,8]),
    mk("9","9","屬九和弦","Dominant 9th","1-3-5-b7-9",[0,4,7,10,2]), mk("Maj9","maj9","大九和弦","Major 9th","1-3-5-7-9",[0,4,7,11,2]), mk("m9","m9","小九和弦","Minor 9th","1-b3-5-b7-9",[0,3,7,10,2]),
    mk("mMaj9","m(maj9)","小大九和弦","Minor-major 9th","1-b3-5-7-9",[0,3,7,11,2]), mk("m9b5","m9b5","半減九和弦","Half-diminished 9th","1-b3-b5-b7-9",[0,3,6,10,2]), mk("9sus4","9sus4","屬九掛四和弦","Dominant 9sus4","1-4-5-b7-9",[0,5,7,10,2]),
    mk("9#11","9#11","屬九升十一和弦","Dominant 9 sharp 11","1-3-5-b7-9-#11",[0,4,7,10,2,6]), mk("9b13","9b13","屬九降十三和弦","Dominant 9 flat 13","1-3-5-b7-9-b13",[0,4,7,10,2,8]),
    mk("Maj9#11","maj9#11","大九升十一和弦","Major 9 sharp 11","1-3-5-7-9-#11",[0,4,7,11,2,6]), mk("Maj9#5","maj9#5","大九升五和弦","Major 9 sharp 5","1-3-#5-7-9",[0,4,8,11,2]),
    mk("11","11","屬十一和弦","Dominant 11th","1-3-5-b7-9-11",[0,4,7,10,2,5]), mk("m11","m11","小十一和弦","Minor 11th","1-b3-5-b7-9-11",[0,3,7,10,2,5]), mk("mMaj11","m(maj11)","小大十一和弦","Minor-major 11th","1-b3-5-7-9-11",[0,3,7,11,2,5]), mk("Maj7#11","maj7#11","大七升十一和弦","Major 7 sharp 11","1-3-5-7-#11",[0,4,7,11,6]),
    mk("13","13","屬十三和弦","Dominant 13th","1-3-5-b7-9-13",[0,4,7,10,2,9]), mk("Maj13","maj13","大十三和弦","Major 13th","1-3-5-7-9-13",[0,4,7,11,2,9]), mk("m13","m13","小十三和弦","Minor 13th","1-b3-5-b7-9-13",[0,3,7,10,2,9]), mk("mMaj13","m(maj13)","小大十三和弦","Minor-major 13th","1-b3-5-7-9-11-13",[0,3,7,11,2,5,9]),
    mk("13sus4","13sus4","屬十三掛四和弦","Dominant 13sus4","1-4-5-b7-9-13",[0,5,7,10,2,9]), mk("13b9","13b9","十三降九和弦","Dominant 13 flat 9","1-3-5-b7-b9-13",[0,4,7,10,1,9]), mk("13#11","13#11","屬十三升十一和弦","Dominant 13 sharp 11","1-3-5-b7-9-#11-13",[0,4,7,10,2,6,9]),
    mk("sus2sus4","sus2/4","雙掛留和弦","Double suspended chord","1-2-4-5",[0,2,5,7]), mk("quartal","quartal","四度堆疊和弦","Quartal chord","1-4-b7-b3",[0,5,10,3]), mk("soWhat","So What","So What chord","1-4-b7-b3-5",[0,5,10,3,7])
];

const CHORD_CATEGORIES = [
    {id:"triads", key:"triads", list:["Maj","m","dim","aug","sus2","sus4","5"]},
    {id:"sixths", key:"sixths", list:["6","m6","69","m69","69#11"]},
    {id:"sevenths", key:"sevenths", list:["Maj7","7","m7","mMaj7","m7b5","dim7","aug7","Maj7#5","dimMaj7"]},
    {id:"dom_plus", key:"dom_plus", list:["7alt","7sus4","7b9","7#9","7b13","7#11","7b5","7b9#11","7#9b13","7b9b13"]},
    {id:"ninths", key:"ninths", list:["9","Maj9","m9","mMaj9","m9b5","9sus4","9#11","9b13","Maj9#11","Maj9#5"]},
    {id:"elevenths", key:"elevenths", list:["11","m11","mMaj11","Maj7#11"]},
    {id:"thirteenths", key:"thirteenths", list:["13","Maj13","m13","mMaj13","13sus4","13b9","13#11"]},
    {id:"special", key:"special", list:["sus2sus4","quartal","soWhat"]}
];

const SCALES = [
    {id:"major", zh:"大調音階 (Ionian)", en:"Major", intervals:[0,2,4,5,7,9,11]},
    {id:"minor", zh:"自然小調 (Aeolian)", en:"Natural Minor", intervals:[0,2,3,5,7,8,10]},
    {id:"h_minor", zh:"和聲小調", en:"Harmonic Minor", intervals:[0,2,3,5,7,8,11]},
    {id:"m_minor", zh:"旋律小調", en:"Melodic Minor", intervals:[0,2,3,5,7,9,11]},
    {id:"maj_penta", zh:"大調五聲", en:"Major Pentatonic", intervals:[0,2,4,7,9]},
    {id:"min_penta", zh:"小調五聲", en:"Minor Pentatonic", intervals:[0,3,5,7,10]},
    {id:"blues", zh:"藍調音階", en:"Blues", intervals:[0,3,5,6,7,10]},
    {id:"dorian", zh:"多利安調式", en:"Dorian", intervals:[0,2,3,5,7,9,10]},
    {id:"mixolydian", zh:"混合利底安", en:"Mixolydian", intervals:[0,2,4,5,7,9,10]},
    {id:"altered", zh:"超洛克里安", en:"Altered", intervals:[0,1,3,4,6,8,10]}
];

const SCALE_CATEGORIES = [
    {id:"basic", key:"basic", list:["major","minor","h_minor","m_minor","maj_penta","min_penta","blues"]},
    {id:"modes", key:"modes", list:["dorian","mixolydian"]},
    {id:"jazz", key:"jazz", list:["altered"]}
];

app.get('/api/config', (req, res) => res.json({ TEXT }));
app.get('/api/chords', (req, res) => res.json({ CHORD_TYPES, CHORD_CATEGORIES }));
app.get('/api/scales', (req, res) => res.json({ SCALES, SCALE_CATEGORIES }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
