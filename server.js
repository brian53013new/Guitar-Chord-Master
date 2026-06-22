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
           triads: "三和弦系列", sixths: "六和弦系列", sevenths: "七和弦系列", dom_plus: "進階屬七和弦",
           ninths: "九和弦系列", elevenths: "十一和弦系列", thirteenths: "十三和弦系列", tenths: "第十音系列",
           added: "加音和弦系列", no35: "省略音和弦", special: "特殊風格系列",
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
           triads: "Triads", sixths: "Sixths", sevenths: "Sevenths", dom_plus: "Dom. Altered",
           ninths: "Ninths", elevenths: "Elevenths", thirteenths: "Thirteenths", tenths: "Tenths",
           added: "Add Chords", no35: "No 3/5", special: "Special Styles",
           basic: "Basic & Penta", modes: "Modes", jazz: "Jazz & Melodic",
           sym: "Symmetric", exotic: "Exotic"
        }
    }
};

const mk = (id, label, zh, formula, intervals) => {
    return { id, label, zh, en:zh, formula, intervals };
};

const CHORD_TYPES = [
    mk("Maj","Maj","大三和弦","1-3-5",[0,4,7]), mk("m","m","小三和弦","1-b3-5",[0,3,7]),
    mk("dim","dim","減三和弦","1-b3-b5",[0,3,6]), mk("aug","aug","增三和弦","1-3-#5",[0,4,8]),
    mk("sus2","sus2","掛二和弦","1-2-5",[0,2,7]), mk("sus4","sus4","掛四和弦","1-4-5",[0,5,7]),
    mk("6","6","大六和弦","1-3-5-6",[0,4,7,9]), mk("m6","m6","小六和弦","1-b3-5-6",[0,3,7,9]),
    mk("69","6/9","六九和弦","1-3-5-6-9",[0,4,7,9,2]), mk("m69","m6/9","小六九","1-b3-5-6-9",[0,3,7,9,2]),
    mk("Maj7","Maj7","大七和弦","1-3-5-7",[0,4,7,11]), mk("7","7","屬七和弦","1-3-5-b7",[0,4,7,10]),
    mk("m7","m7","小七和弦","1-b3-5-b7",[0,3,7,10]), mk("mMaj7","m(maj7)","小大七和弦","1-b3-5-7",[0,3,7,11]),
    mk("m7b5","m7b5","半減七和弦","1-b3-b5-b7",[0,3,6,10]), mk("dim7","dim7","減七和弦","1-b3-b5-bb7",[0,3,6,9]),
    mk("aug7","+7","增屬七和弦","1-3-#5-b7",[0,4,8,10]), mk("7alt","7alt","變化屬七","1-3-b7-alt",[0,4,10,1,3,8]),
    mk("7sus4","7sus4","屬七掛四","1-4-5-b7",[0,5,7,10]), mk("9","9","屬九和弦","1-3-5-b7-9",[0,4,7,10,2]),
    mk("Maj9","Maj9","大九和弦","1-3-5-7-9",[0,4,7,11,2]), mk("m9","m9","小九和弦","1-b3-5-b7-9",[0,3,7,10,2]),
    mk("11","11","屬十一和弦","1-3-5-b7-9-11",[0,4,7,10,2,5]), mk("13","13","屬十三和弦","1-3-5-b7-9-13",[0,4,7,10,2,9]),
    mk("add9","add9","加九和弦","1-3-5-9",[0,4,7,2]), mk("sus2sus4","雙掛留","1-2-4-5",[0,2,5,7])
];

const CHORD_CATEGORIES = [
    {id:"triads", key:"triads", list:["Maj","m","dim","aug","sus2","sus4"]},
    {id:"sixths", key:"sixths", list:["6","m6","69","m69"]},
    {id:"sevenths", key:"sevenths", list:["Maj7","7","m7","mMaj7","m7b5","dim7","aug7"]},
    {id:"dom_plus", key:"dom_plus", list:["7alt","7sus4"]},
    {id:"ninths", key:"ninths", list:["9","Maj9","m9"]},
    {id:"elevenths", key:"elevenths", list:["11"]},
    {id:"thirteenths", key:"thirteenths", list:["13"]},
    {id:"added", key:"added", list:["add9"]},
    {id:"special", key:"special", list:["sus2sus4"]}
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
