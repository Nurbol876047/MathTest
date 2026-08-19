import React, { useState } from 'react';
import { 
  LayoutDashboard, FileText, Library, BarChart3, PlusCircle, Wand2, 
  GraduationCap, Award, TrendingUp, Bookmark, Settings, BrainCircuit,
  Users, CheckCircle2, MoreVertical, Search, Bell, Clock, ArrowLeft, ArrowRight,
  Edit2, Trash2, RefreshCw, AlertTriangle, Menu, Download, Camera, BookOpen, Lightbulb, X,
  Volume2, Mic, MicOff, Play, Pause, Square, Calendar, User
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { GoogleGenerativeAI } from '@google/generative-ai';
import KmjGenerationView from './KmjGenerationView';
import KtjGenerationView from './KtjGenerationView';
import MathBackground3D from './MathBackground3D';

const mathTopics = {
  "1 сынып": ["20-ға дейін санау", "Қосу және азайту", "Сандарды салыстыру"],
  "2 сынып": ["100-ге дейін қосу және азайту", "Көбейту негіздері", "Қарапайым есептер"],
  "3 сынып": ["Көбейту кестесі", "Бөлу", "Өлшем бірліктері"],
  "4 сынып": ["Көптаңбалы сандар", "Бөлшектер (негіздері)", "Қозғалысқа берілген есептер"],
  "5 сынып": ["Жай бөлшектер", "Ондық бөлшектер", "Пайыз", "Бұрыштар мен көпбұрыштар"],
  "6 сынып": ["Теріс сандар", "Пропорция", "Рационал сандар", "Координаталық осьтер"],
  "7 сынып": ["Сызықтық теңдеулер", "Дәреже", "Көпмүшелер", "Үшбұрыштар", "Функциялар (негіздері)"],
  "8 сынып": ["Квадрат теңдеулер", "Теңсіздіктер", "Пифагор теоремасы", "Төртбұрыштар"],
  "9 сынып": ["Квадраттық функция", "Прогрессиялар", "Теңдеулер жүйесі", "Векторлар", "Тригонометрия (негіздері)"],
  "10 сынып": ["Тригонометриялық теңдеулер", "Туынды", "Стереометрия", "Ықтималдықтар теориясы"],
  "11 сынып": ["Интегралдар", "Логарифмдер", "Көрсеткіштік теңдеулер", "Күрделі стереометрия"]
};
const classKeys = Object.keys(mathTopics);

const initialBankData = [
  { classLabel: "8 сынып", text: "Теңдеудің түбірлерін табыңыз: x² − 5x + 6 = 0", topic: "Квадрат теңдеулер", difficulty: "Орташа", options: ["A) x=1; 6", "B) x=2; 3", "C) x=-2; -3", "D) x=3; 5"], correctIndex: 1 },
  { classLabel: "8 сынып", text: "Теңдеуді шешіңіз: 2x² − 7x + 3 = 0", topic: "Квадрат теңдеулер", difficulty: "Күрделі", options: ["A) x=0.5; 3", "B) x=-0.5; -3", "C) x=1; 1.5", "D) x=2; 1.5"], correctIndex: 0 },
  { classLabel: "1 сынып", text: "Машада 5 алма болды, ол Петяға 2 алма берді. Машада неше алма қалды?", topic: "Қосу және азайту", difficulty: "Оңай", options: ["A) 1", "B) 2", "C) 3", "D) 4"], correctIndex: 2 },
  { classLabel: "3 сынып", text: "7 × 8 көбейтіндісі неге тең?", topic: "Көбейту кестесі", difficulty: "Орташа", options: ["A) 54", "B) 56", "C) 64", "D) 49"], correctIndex: 1 },
  { classLabel: "4 сынып", text: "Пойыз 60 км/сағ жылдамдықпен жүреді. Ол 3 сағатта қандай қашықтықты жүріп өтеді?", topic: "Қозғалысқа берілген есептер", difficulty: "Орташа", options: ["A) 120 км", "B) 150 км", "C) 180 км", "D) 210 км"], correctIndex: 2 },
  { classLabel: "5 сынып", text: "Сыныпта 30 оқушы бар, олардың 20%-ы озаттар. Сыныпта неше озат оқушы бар?", topic: "Пайыз", difficulty: "Күрделі", options: ["A) 5", "B) 6", "C) 8", "D) 10"], correctIndex: 1 },
  { classLabel: "6 сынып", text: "Есептеңіз: -15 + 8", topic: "Теріс сандар", difficulty: "Орташа", options: ["A) -7", "B) 7", "C) -23", "D) 23"], correctIndex: 0 },
  { classLabel: "7 сынып", text: "Теңдеуді шешіңіз: 3x - 4 = 11", topic: "Сызықтық теңдеулер", difficulty: "Оңай", options: ["A) x=4", "B) x=5", "C) x=6", "D) x=7"], correctIndex: 1 },
  { classLabel: "9 сынып", text: "Теңдеулер жүйесін шешіңіз: x + y = 5, x - y = 1", topic: "Теңдеулер жүйесі", difficulty: "Орташа", options: ["A) (2; 3)", "B) (3; 2)", "C) (4; 1)", "D) (1; 4)"], correctIndex: 1 },
  { classLabel: "10 сынып", text: "Қыры 4 см кубтың көлемін табыңыз.", topic: "Стереометрия", difficulty: "Орташа", options: ["A) 16 см³", "B) 24 см³", "C) 64 см³", "D) 128 см³"], correctIndex: 2 },
  { classLabel: "11 сынып", text: "∫ 2x dx интегралын есептеңіз", topic: "Интегралдар", difficulty: "Күрделі", options: ["A) x² + C", "B) 2x² + C", "C) x + C", "D) x³ + C"], correctIndex: 0 },
  { classLabel: "11 сынып", text: "Есептеңіз: log₂ 16", topic: "Логарифмдер", difficulty: "Оңай", options: ["A) 2", "B) 3", "C) 4", "D) 8"], correctIndex: 2 }
];

const chartData = [
  { name: '1 Окт', score: 65 }, { name: '5 Окт', score: 68 }, { name: '10 Окт', score: 72 },
  { name: '15 Окт', score: 70 }, { name: '20 Окт', score: 75 }, { name: '25 Окт', score: 82 },
  { name: '30 Окт', score: 78 },
];

const COLORS = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    <Icon size={18} />
    <span>{label}</span>
  </div>
);

function VoicePlayButton({ textToRead, autoPlay }) {
  const [status, setStatus] = useState('idle'); // idle, loading, playing, paused
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioObj, setAudioObj] = useState(null);
  
  const hasAutoPlayed = React.useRef(false);
  
  const handlePlayPause = async () => {
    if (status === 'playing') {
      audioObj.pause();
      setStatus('paused');
      return;
    }
    if (status === 'paused' && audioObj) {
      audioObj.play();
      setStatus('playing');
      return;
    }
    
    // need to generate
    setStatus('loading');
    try {
      const res = await fetch('http://localhost:3001/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead })
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      const audio = new Audio(url);
      setAudioObj(audio);
      
      audio.onended = () => {
        setStatus('idle');
      };
      
      audio.play();
      setStatus('playing');
    } catch(e) {
      console.error(e);
      alert('Аудио генерациялау мүмкін болмады, кейінірек қайталап көріңіз.');
      setStatus('idle');
    }
  };

  React.useEffect(() => {
    if (autoPlay && textToRead && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      handlePlayPause();
    }
  }, [autoPlay, textToRead]);

  React.useEffect(() => {
    return () => {
      if (audioObj) {
        audioObj.pause();
        audioObj.currentTime = 0;
      }
    };
  }, [audioObj]);

  return (
    <button 
      onClick={handlePlayPause}
      title="Тыңдау"
      style={{ 
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)',
        background: status === 'playing' ? 'var(--primary-light)' : 'white',
        color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s',
        flexShrink: 0
      }}
    >
      {status === 'loading' && <RefreshCw size={18} className="spinner" />}
      {(status === 'idle' || status === 'paused') && <Volume2 size={18} />}
      {status === 'playing' && <Pause size={18} />}
    </button>
  );
}

function DashboardView({ setActiveView }) {
  return (
    <div className="page-wrapper">
      <header className="page-header">
        <div>
          <h1 className="page-title">Қайырлы күн!</h1>
          <p className="page-subtitle">Математикалық тесттер жасаңыз және оқушылардың үлгерімін қадағалаңыз</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setActiveView('create')}>
            <PlusCircle size={16} /> Тест жасау
          </button>
          <button className="btn btn-accent" onClick={() => setActiveView('ai')}>
            <Wand2 size={16} /> AI генерациясы
          </button>
        </div>
      </header>

      <div className="grid-cols-4" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Жасалған тесттер</span>
            <span className="stat-value">24</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px' }}>+12% ай ішінде</span>
          </div>
          <div className="stat-icon primary"><FileText size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Өтілді</span>
            <span className="stat-value">486</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px' }}>+8% ай ішінде</span>
          </div>
          <div className="stat-icon success"><CheckCircle2 size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Орташа нәтиже</span>
            <span className="stat-value">78%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px' }}>+2.4% ай ішінде</span>
          </div>
          <div className="stat-icon accent"><Award size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Белсенді тесттер</span>
            <span className="stat-value">8</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Тұрақты</span>
          </div>
          <div className="stat-icon warning"><TrendingUp size={24} /></div>
        </div>
      </div>

      <div className="grid-layout-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Үлгерім динамикасы</h2>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Орташа нәтиже учеников
                </div>
              </div>
              <div className="tabs">
                <button className="tab-btn">7 күн</button>
                <button className="tab-btn active">30 күн</button>
                <button className="tab-btn">3 ай</button>
              </div>
            </div>
            <div className="card-body" style={{ height: '320px', display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
                    <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ width: '140px', paddingLeft: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid var(--border)', marginLeft: '16px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>+12,4%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>алдыңғы кезеңмен салыстырғанда.</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Соңғы тесттер</h2>
              <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>Барлығын көру</button>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Атауы</th>
                    <th>Сынып</th>
                    <th>Сұрақтар</th>
                    <th>Оқушылар</th>
                    <th>Орташа нәтиже</th>
                    <th>Статус</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 500 }}>Квадрат теңдеулер</td>
                    <td>8 класс</td>
                    <td>15</td>
                    <td>27</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>82%</td>
                    <td><span className="badge active">Белсенді</span></td>
                    <td><button className="btn-icon"><MoreVertical size={16} /></button></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 500 }}>Сызықтық функциялар</td>
                    <td>7 класс</td>
                    <td>12</td>
                    <td>31</td>
                    <td style={{ fontWeight: 600, color: 'var(--warning)' }}>76%</td>
                    <td><span className="badge active">Белсенді</span></td>
                    <td><button className="btn-icon"><MoreVertical size={16} /></button></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 500 }}>Пайыздар</td>
                    <td>6 класс</td>
                    <td>10</td>
                    <td>24</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>89%</td>
                    <td><span className="badge completed">Аяқталды</span></td>
                    <td><button className="btn-icon"><MoreVertical size={16} /></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <h2 className="card-title">Успеваемость по темам</h2>
          </div>
          <div className="card-body">
            {[
              { name: 'Алгебра', score: 84, color: 'var(--primary)' },
              { name: 'Уравнения', score: 76, color: 'var(--primary)' },
              { name: 'Функции', score: 68, color: 'var(--warning)' },
              { name: 'Геометрия', score: 61, color: 'var(--error)' },
              { name: 'Пайыздар', score: 89, color: 'var(--success)' },
            ].map(topic => (
              <div style={{ marginBottom: '16px' }} key={topic.name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '80px', fontSize: '0.875rem', fontWeight: 500 }}>{topic.name}</div>
                  <div className="progress-bar-bg" style={{ flex: 1, margin: 0, height: '8px' }}>
                    <div className="progress-bar-fill" style={{ width: `${topic.score}%`, backgroundColor: topic.color }}></div>
                  </div>
                  <div style={{ width: '40px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600 }}>{topic.score}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateTestView({ setActiveView, testQuestions, setTestQuestions, onSaveTest }) {
  const [selectedClass, setSelectedClass] = useState("8 сынып");
  const [selectedTopic, setSelectedTopic] = useState("Квадрат теңдеулер");
  const [testTitle, setTestTitle] = useState("Алгебра бойынша жаңа тест");
  const [difficulty, setDifficulty] = useState("Орташа");
  const [timeLimit, setTimeLimit] = useState(30);
  const [manualQuestionCount, setManualQuestionCount] = useState(15);
  const [questionTypes, setQuestionTypes] = useState(['Бір дұрыс жауап']);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");

  const handleGenerate = async () => {
    if (!manualQuestionCount || manualQuestionCount < 1) return alert("Сұрақтар санын көрсетіңіз");
    
    setIsGenerating(true);
    setLoadingStage("Тапсырмалар құрастырылуда...");
    
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      
      const prompt = `Ты профессиональный эксперт-составитель тестов по математике.
Сгенерируй математический тест.
- Сынып: ${selectedClass}
- Тақырып: ${selectedTopic}
- Қиындығы: ${difficulty}
- Сұрақтар саны: ${manualQuestionCount}
- Формат заданий: ${questionTypes.join(', ')}.

Верни результат СТРОГО в формате JSON:
{
  "questions": [
    {
      "question": "Текст вопроса",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "Текст правильного варианта",
      "explanation": "Решение"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      let cleanedText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      const questionsArray = parsed.questions || parsed || [];
      
      const mapped = questionsArray.map((q, i) => ({
        id: Date.now() + i,
        text: q.question,
        options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
        correctIndex: q.options ? Math.max(0, q.options.findIndex(opt => opt.includes(q.correct_answer) || q.correct_answer.includes(opt))) : 0,
        explanation: q.explanation || "",
        topic: selectedTopic,
        classLabel: selectedClass,
        difficulty: difficulty,
        type: questionTypes[0] || 'Бір дұрыс жауап'
      }));
      
      setTestQuestions(prev => [...prev, ...mapped]);
    } catch (e) {
      console.error(e);
      alert("Генерация кезінде қате кетті: " + e.message);
    }
    
    setIsGenerating(false);
    setLoadingStage("");
  };

  const handleToggleQuestionType = (type) => {
    if (questionTypes.includes(type)) {
      setQuestionTypes(questionTypes.filter(t => t !== type));
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const handleSaveDraft = () => {
    onSaveTest({ 
      title: testTitle, 
      classLabel: selectedClass, 
      topic: selectedTopic, 
      questionsCount: manualQuestionCount,
      questions: testQuestions,
      status: 'Қаралама'
    });
    setTestQuestions([]);
  };

  const handlePublish = () => {
    onSaveTest({ 
      title: testTitle, 
      classLabel: selectedClass, 
      topic: selectedTopic, 
      questionsCount: manualQuestionCount,
      questions: testQuestions,
      status: 'Белсенді'
    });
    setTestQuestions([]);
  };

  const handlePreview = () => {
    if(testQuestions.length === 0) return alert("Алдын ала қарау үшін алдымен сұрақтар қосыңыз!");
    setIsPreviewMode(true);
  };

  if (isPreviewMode) {
    const previewTest = {
      title: testTitle, 
      classLabel: selectedClass, 
      topic: selectedTopic, 
      questionsCount: testQuestions.length,
      questions: testQuestions
    };
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'var(--bg-main)', overflowY: 'auto' }}>
        <div style={{ padding: '20px 40px', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Алдын ала қарау режимі</h2>
          <button className="btn btn-secondary" onClick={() => setIsPreviewMode(false)}>Жабу</button>
        </div>
        <div style={{ padding: '20px' }}>
          <StudentTestView setActiveView={() => setIsPreviewMode(false)} test={previewTest} onFinishTest={(res) => {
            alert("Алдын ала қарау аяқталды. Нәтиже: " + res.score + " / " + res.total);
            setIsPreviewMode(false);
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Жаңа тест құру</div>
          <input type="text" className="form-control" placeholder="Тест атауы..." style={{ fontSize: '1.875rem', fontWeight: 700, padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }} value={testTitle} onChange={(e) => setTestTitle(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handlePublish}>Жариялау</button>
        </div>
      </header>

      <div className="grid-layout-main">
        <div className="card">
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Сынып</label>
                <div className="select-wrapper">
                  <select className="form-control select-control" value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedTopic(mathTopics[e.target.value][0] || "Любая тема"); }}>
                    {classKeys.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Тақырып</label>
                <div className="select-wrapper">
                  <select className="form-control select-control" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                    {(mathTopics[selectedClass] || []).map(topic => <option key={topic} value={topic}>{topic}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Қиындығы</label>
              <div className="options-group">
                <button className={`option-btn ${difficulty === 'Оңай' ? 'selected' : ''}`} onClick={() => setDifficulty('Оңай')}>Оңай</button>
                <button className={`option-btn ${difficulty === 'Орташа' ? 'selected' : ''}`} onClick={() => setDifficulty('Орташа')}>Орташа</button>
                <button className={`option-btn ${difficulty === 'Күрделі' ? 'selected' : ''}`} onClick={() => setDifficulty('Күрделі')}>Күрделі</button>
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Сұрақтар саны</label>
                <input type="number" className="form-control" value={manualQuestionCount} onChange={(e) => setManualQuestionCount(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Уақыт (минутпен)</label>
                <input type="number" className="form-control" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Сұрақ түрлері</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" checked={questionTypes.includes('Бір дұрыс жауап')} onChange={() => handleToggleQuestionType('Бір дұрыс жауап')} />
                  Бір дұрыс жауап
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" checked={questionTypes.includes('Бірнеше дұрыс жауап')} onChange={() => handleToggleQuestionType('Бірнеше дұрыс жауап')} />
                  Бірнеше дұрыс жауап
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" checked={questionTypes.includes('Сандық жауап')} onChange={() => handleToggleQuestionType('Сандық жауап')} />
                  Сандық жауап
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" checked={questionTypes.includes('Сәйкестендіру')} onChange={() => handleToggleQuestionType('Сәйкестендіру')} />
                  Сәйкестендіру
                </label>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <button className="btn btn-accent btn-lg btn-block" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating && loadingStage && <div style={{ fontSize: '0.875rem', fontWeight: 500, marginRight: '8px' }}>{loadingStage}</div>}
                {isGenerating ? <RefreshCw size={20} className="spinner" /> : <Wand2 size={20} />} 
                {isGenerating ? "" : "Осы параметрлермен тест құрастыру (AI)"}
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: '#fafafa' }}>
          <div className="card-header">
            <h2 className="card-title">Тест сұрақтары ({testQuestions.length})</h2>
          </div>
          <div className="card-body">
            {testQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--bg-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <FileText size={32} color="var(--border-dark)" />
                </div>
                <p style={{ marginBottom: '24px', fontSize: '1.05rem' }}>Бұл тестте әзірге сұрақтар жоқ. Қосу тәсілін таңдаңыз:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button className="btn btn-accent" onClick={() => setActiveView('ai-text')}>
                    <Wand2 size={18} /> Жасанды интеллект арқылы құрастыру
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveView('bank')}>
                    <Library size={18} /> Тапсырмалар банкінен таңдау
                  </button>

                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {testQuestions.map((q, idx) => (
                  <div className="question-card" key={idx} style={{ position: 'relative' }}>
                    <div className="question-number">Сұрақ {idx + 1}</div>
                    <button className="btn-icon" style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--error)' }} onClick={() => setTestQuestions(testQuestions.filter((_, i) => i !== idx))}>
                      <Trash2 size={16} />
                    </button>
                    <div className="question-text">{renderMathText(q.text)}</div>
                    <div className="answers-grid">
                      {Array.isArray(q.options) && q.options.map((opt, oIdx) => (
                        <div className={`answer-item ${oIdx === q.correctIndex ? 'correct' : ''}`} key={oIdx}>
                          {renderMathText(opt.replace(/^[A-H]\)\s*/, ''))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="btn btn-secondary" style={{ borderStyle: 'dashed', width: '100%', marginTop: '16px' }}>
                  + Добавить еще вопрос
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemExplanationModal({ questionData, onClose }) {
  const isErrorContext = typeof questionData === 'object' && questionData.isErrorContext;
  const questionText = isErrorContext ? questionData.text : questionData;
  const userAnswer = isErrorContext ? questionData.userAnswer : null;
  const correctAnswer = isErrorContext ? questionData.correctAnswer : null;

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  const handleExplain = async () => {
    if (!questionText) {
      setErrorMsg("Тапсырманың шартын жүктеу мүмкін болмады, қайталап көріңіз");
      return;
    }
    setErrorMsg("");
    setIsGenerating(true);
    
    try {
      setLoadingStage("Есепті талдаудамыз...");
      await new Promise(r => setTimeout(r, 1000));
      setLoadingStage("Түсініктеме қалыптастырудамыз...");
      
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      
      let systemPrompt = "";
      if (isErrorContext) {
        systemPrompt = `Сен — математика тақырыбын оқушыға барынша түсінікті әрі қолжетімді етіп, қадам-қадаммен түсіндіретін тәжірибелі математика мұғалімісің.

Саған берілген есеп:
${questionText}

Оқушы қате жауап берді: ${userAnswer}
Дұрыс жауап: ${correctAnswer}

Твоя задача — дать объяснение в следующей структуре:
1. О чём эта задача (кратко, простыми словами, какая тема/раздел математики).
2. Какой метод/формула нужна для решения.
3. Қадамдық шешім — каждый шаг с пояснением, почему делается именно так.
4. Итоговый ответ.
5. Қатені талдау ученика — в каком именно шаге и почему возникла ошибка, объясни это как частую и понятную ошибку, без осуждающего тона.
6. Кеңес: на что обратить внимание в следующий раз при решении подобных задач.

Пиши простым языком, избегай сложной терминологии без объяснения. Используй математическую нотацию корректно.

Нәтижені қатаң түрде JSON пішімінде қайтар:
{
  "topic": "...",
  "method": "...",
  "steps": [
    {"step_number": 1, "explanation": "..."},
    {"step_number": 2, "explanation": "..."}
  ],
  "final_answer": "...",
  "mistake_analysis": "...",
  "tip": "..."
}
Егер пайдаланушы сұрағында басқа тілді көрсетпесе, жауапты қазақ тілінде бер.`;
      } else {
        systemPrompt = `Ты — опытный учитель математики, объясняющий тему ученику максимально понятно и доступно, по шагам.

Тебе дана задача:
${questionText}

Твоя задача — дать объяснение в следующей структуре:
1. О чём эта задача (кратко, простыми словами, какая тема/раздел математики).
2. Какой метод/формула нужна для решения.
3. Қадамдық шешім — каждый шаг с пояснением, почему делается именно так.
4. Итоговый ответ.
5. Кеңес: на что обратить внимание в следующий раз при решении подобных задач.

Пиши простым языком, избегай сложной терминологии без объяснения. Используй математическую нотацию корректно.
Жолдық формулалар үшін $...$ және блоктық формулалар үшін $...$ қолдан.

Верни результат строго в формате JSON:
{
  "topic": "...",
  "method": "...",
  "steps": [
    {"step_number": 1, "explanation": "..."},
    {"step_number": 2, "explanation": "..."}
  ],
  "final_answer": "...",
  "tip": "..."
}
Егер пайдаланушы сұрағында басқа тілді көрсетпесе, жауапты қазақ тілінде бер.`;
      }

      const res = await model.generateContent(systemPrompt);
      const text = res.response.text();
      let cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      setResult(parsed);
    } catch (e) {
      console.error(e);
      setErrorMsg("Бұл тапсырмаға түсініктеме қалыптастыру мүмкін болмады");
    } finally {
      setIsGenerating(false);
      setLoadingStage("");
    }
  };

  return (
    <div className="mobile-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', background: 'rgba(0,0,0,0.6)', opacity: 1, visibility: 'visible' }}>
      <div className="card" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-main)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-light)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={24} /> {isErrorContext ? "Қатені талдау" : "Тапсырма бойынша түсініктеме"}
            </h2>
            {result && (
              <VoicePlayButton 
                autoPlay={true}
                textToRead={`${result.topic}. Шешу әдісі: ${result.method}. Қадамдық шешім: ${result.steps.map(s => s.explanation).join(' ')}. Жауап: ${result.final_answer}. ${result.mistake_analysis || ''} ${result.tip || ''}`}
              />
            )}
          </div>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="card-body" style={{ padding: '24px' }}>
          <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '1.125rem', color: 'var(--text-main)', fontWeight: 500 }}>
            {renderMathText(questionText)}
            {isErrorContext && (
               <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border)', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <div style={{ color: 'var(--error)' }}><strong>Сіздің жауабыңыз:</strong> {renderMathText(userAnswer)}</div>
                 <div style={{ color: 'var(--success)' }}><strong>Дұрыс жауап:</strong> {renderMathText(correctAnswer)}</div>
               </div>
            )}
          </div>
          
          {errorMsg && <div style={{ color: 'var(--error)', marginBottom: '16px', background: 'var(--error-bg)', padding: '12px', borderRadius: 'var(--radius-md)' }}>{errorMsg}</div>}
          
          {!result && !isGenerating && (
             <button className="btn btn-accent btn-lg btn-block" onClick={handleExplain}>
               <Wand2 size={20} /> Түсініктеме алу
             </button>
          )}
          
          {isGenerating && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
               <RefreshCw size={32} className="spinner" style={{ color: 'var(--accent)', marginBottom: '16px', display: 'block', margin: '0 auto' }} />
               <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>{loadingStage}</div>
            </div>
          )}
          
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <div>
                 <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>Тақырып</div>
                 <div style={{ color: 'var(--primary-dark)', fontSize: '1.125rem', fontWeight: 500 }}>{renderMathText(result.topic)}</div>
               </div>
               
               <div>
                 <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>Шешу әдісі</div>
                 <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)', color: 'var(--text-secondary)' }}>{renderMathText(result.method)}</div>
               </div>
               
               <div>
                 <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 600 }}>Қадамдық шешім</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {result.steps.map((step, idx) => (
                     <details key={idx} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }} open>
                       <summary style={{ padding: '16px', fontWeight: 600, cursor: 'pointer', outline: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text-main)' }}>Қадам {step.step_number}</summary>
                       <div style={{ padding: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{renderMathText(step.explanation)}</div>
                     </details>
                   ))}
                 </div>
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-lg)' }}>
                 <div style={{ fontWeight: 600, color: 'var(--success)', fontSize: '1.125rem' }}>Жауап:</div>
                 <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)' }}>{renderMathText(result.final_answer)}</div>
               </div>
               
               {result.mistake_analysis && (
                 <div style={{ padding: '16px', background: 'var(--error-bg)', borderLeft: '4px solid var(--error)', borderRadius: 'var(--radius-md)' }}>
                   <div style={{ fontWeight: 600, color: 'var(--error)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18}/> Қатені талдау:</div>
                   <div style={{ color: 'var(--text-secondary)' }}>{renderMathText(result.mistake_analysis)}</div>
                 </div>
               )}
               
               {result.tip && (
                 <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--warning)', borderRadius: 'var(--radius-md)' }}>
                   <div style={{ fontWeight: 600, color: '#d97706', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lightbulb size={18}/> Кеңес:</div>
                   <div style={{ color: 'var(--text-secondary)' }}>{renderMathText(result.tip)}</div>
                 </div>
               )}
               
               <MiniChat contextData={result} />
            </div>
          )}
        </div>
        
        {result && (
          <div className="card-footer" style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-main)' }}>
            <button className="btn btn-secondary" onClick={onClose}>Жабу</button>
            <button className="btn btn-primary"><Bookmark size={18} style={{ marginRight: '8px' }}/> Таңдаулыларға сақтау</button>
          </div>
        )}
      </div>
    </div>
  )
}

const renderMathText = (text) => {
  if (text === null || text === undefined) return null;
  const strText = String(text);
  const parts = strText.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return <BlockMath key={index} math={part.slice(2, -2)} />;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      return <InlineMath key={index} math={part.slice(1, -1)} />;
    } else {
      return <span key={index}>{part.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i !== part.split('\n').length - 1 && <br/>}</React.Fragment>)}</span>;
    }
  });
};

function MiniChat({ contextData }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const audioContextRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const silenceTimerRef = React.useRef(null);
  const streamRef = React.useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        clearInterval(silenceTimerRef.current);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 1000) {
          processAudio(audioBlob);
        }
      };

      // VAD
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      let silenceStart = null;
      silenceTimerRef.current = setInterval(() => {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for(let i=0; i<bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        if (average < 10) { // Silence threshold
          if (!silenceStart) silenceStart = Date.now();
          else if (Date.now() - silenceStart > 2000) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
          }
        } else {
          silenceStart = null;
        }
      }, 200);

      mediaRecorder.start();
      setIsRecording(true);
    } catch(err) {
      console.error(err);
      alert('Микрофонға рұқсат беріңіз, дауыспен сұрақ қою үшін');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const processAudio = async (blob) => {
    setIsRecognizing(true);
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');
    
    try {
      const res = await fetch('http://localhost:3001/api/speech-to-text', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('STT failed');
      const data = await res.json();
      if (data.text) {
        setChatInput(prev => prev + (prev ? ' ' : '') + data.text);
      }
    } catch(err) {
      console.error(err);
      alert('Дауысты тану кезінде қате кетті.');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      const prompt = `Сен — тәжірибелі математика мұғалімісің. Сен оқушыға/мұғалімге мына тақырыпты немесе есепті түсіндіріп қойдың:
${JSON.stringify(contextData)}

Енді пайдаланушы осы түсініктеме бойынша нақтылаушы сұрақ қойып отыр. Бастапқы түсініктеме контекстін пайдалана отырып, түсінікті, қысқа әрі нақты жауап бер. Егер сұрақ түсіндірілетін тақырыпқа қатысты болмаса — сұрақтың контексттен тыс екенін сыпайы түрде ескерт. Егер пайдаланушы сұрағында басқа тілді көрсетпесе, жауапты қазақ тілінде бер.

Хабарламалар тарихы:
${chatHistory.map(m => `${m.role === 'user' ? 'Оқушы' : 'Мұғалім'}: ${m.text}`).join('\n')}

Пайдаланушының жаңа сұрағы:
${userMsg}`;
      
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      setChatHistory(prev => [...prev, { role: 'assistant', text }]);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { role: 'assistant', text: "Жауап беру кезінде қате шықты. Қайталап көріңіз." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div style={{ marginTop: '32px', borderTop: '2px dashed var(--border)', paddingTop: '24px' }}>
      <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Түсініктеме бойынша сұрақ бар ма?
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {chatHistory.map((msg, idx) => (
          <div key={idx} style={{ 
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', 
            background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-main)', 
            color: msg.role === 'user' ? 'white' : 'var(--text-main)',
            border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
            padding: '12px 16px', borderRadius: '16px', maxWidth: '85%' 
          }}>
            {msg.role === 'assistant' ? renderMathText(msg.text) : msg.text}
          </div>
        ))}
        {isChatting && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '16px', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ display: 'inline-block', marginRight: '8px' }}><RefreshCw size={14}/></span> Мұғалім теруде...
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder={isRecognizing ? "Тану жүріп жатыр..." : "мысалы: басқа шешу жолын көрсет"}
          value={chatInput} 
          onChange={e => setChatInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleChat()}
          disabled={isRecognizing}
        />
        <button 
          className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`} 
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? "Жазуды тоқтату" : "Дауыспен сұрау"}
          style={{ width: '42px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}
        >
          {isRecording ? (
             <><Square size={18} />
             <span className="recording-ping" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--error)', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
             </>
          ) : <Mic size={18} />}
        </button>
        <button className="btn btn-primary" onClick={handleChat} disabled={isChatting || !chatInput.trim()}>Жіберу</button>
      </div>
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function TopicExplanationView({ setActiveView, setPreFillTopic, setPreFillClass }) {
  const [topic, setTopic] = useState("");
  const [selectedClass, setSelectedClass] = useState("8 сынып");
  const [depth, setDepth] = useState("Толық");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMsg("Тақырыпты енгізіңіз немесе ұсынылғандардың бірін таңдаңыз");
      return;
    }
    setErrorMsg("");
    setIsGenerating(true);
    
    try {
      setLoadingStage("Тақырыпты талдаудамыз...");
      await new Promise(r => setTimeout(r, 1000));
      setLoadingStage("Түсініктеме қалыптастырудамыз...");
      
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      
      const systemPrompt = `Ты — опытный учитель математики, объясняющий тему ученику максимально понятно и структурированно. Если тема не относится к математике, верни {"is_math": false}. Иначе верни {"is_math": true, ...}.

Тақырып для объяснения: ${topic}
Оқушының деңгейі: ${selectedClass}
Түсіндіру тереңдігі: ${depth}

Твоя задача — сгенерировать объяснение в следующей структуре:
1. Введение — что это за тема, зачем она нужна, где применяется.
2. Основная теория — определения, формулы, правила.
3. Если глубина "Толық" или "Мысалдармен": 2-3 примера решения задач по теме, от простого к сложному, с пошаговым разбором.
4. Жиі кездесетін қателер — что чаще всего путают ученики при изучении этой темы.
5. Қысқашае резюме — 3-4 предложения, суммирующих главное.

ОЧЕНЬ ВАЖНО ДЛЯ ФОРМУЛ:
Используй $...$ для строчных формул и $$...$$ для блочных формул.
Например: Функция $y = x^2$ имеет корни $$x_1 = 0$$.

Верни результат строго в формате JSON:
{
  "is_math": true,
  "topic": "название темы",
  "introduction": "Введение...",
  "theory": "Теория...",
  "formulas": ["$$x = y$$", "..."],
  "examples": [
    {"problem": "условие...", "solution_steps": ["шаг 1...", "шаг 2..."], "answer": "ответ..."}
  ],
  "common_mistakes": ["ошибка 1...", "ошибка 2..."],
  "summary": "резюме..."
}
Егер пайдаланушы сұрағында басқа тілді көрсетпесе, жауапты қазақ тілінде бер.`;
      const res = await model.generateContent(systemPrompt);
      const text = res.response.text();
      let cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      
      if (parsed.is_math === false) {
        setErrorMsg("Похоже, это не математическая тема, уточните запрос");
        setIsGenerating(false);
        return;
      }
      
      setResult(parsed);
    } catch (e) {
      console.error(e);
      setErrorMsg("Генерация кезінде қате шықты. Қайталап көріңіз.");
    } finally {
      setIsGenerating(false);
      setLoadingStage("");
    }
  };

  const suggestions = ["Квадрат теңдеулер", "Пифагор теоремасы", "Пайыз", "Дроби", "Логарифмдер", "Туынды"];

  if (result) {
    return (
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--accent-light)' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--accent-light)', padding: '24px', flexWrap: 'wrap' }}>
          <button className="icon-btn" style={{ background: 'white' }} onClick={() => setResult(null)}>
            <ArrowLeft size={20} color="var(--primary)" />
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', margin: 0 }}>{result.topic}</h2>
              <p style={{ color: 'var(--primary)', margin: '4px 0 0 0', fontSize: '0.875rem' }}>AI арқылы жасалған • {selectedClass} • {depth}</p>
            </div>
            {result && (
              <VoicePlayButton 
                autoPlay={true}
                textToRead={`${result.summary}. Кіріспе: ${result.introduction}. Теория: ${result.theory}. Мысалдар: ${result.examples ? result.examples.map(ex => `${ex.problem}. Шешуі: ${ex.solution_steps.join(' ')}. Жауабы: ${ex.answer}`).join(' ') : ''}`}
              />
            )}
          </div>
        </div>
        
        <div className="card-body" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '12px', borderBottom: '2px solid var(--border)', paddingBottom: '8px' }}>Введение</h3>
            <div style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>{renderMathText(result.introduction)}</div>
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '12px', borderBottom: '2px solid var(--border)', paddingBottom: '8px' }}>Теория және ережелер</h3>
            <div style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>{renderMathText(result.theory)}</div>
            {result.formulas && result.formulas.length > 0 && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '1rem', color: 'var(--text-main)' }}>Негізгі формулалар:</h4>
                {result.formulas.map((f, i) => (
                  <div key={i} style={{ marginBottom: '8px', fontSize: '1.1rem' }}>{renderMathText(f)}</div>
                ))}
              </div>
            )}
          </div>
          
          {result.examples && result.examples.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '16px', borderBottom: '2px solid var(--border)', paddingBottom: '8px' }}>Талданған мысалдар</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {result.examples.map((ex, i) => (
                  <div key={i} style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: '#fafafa' }}>
                    <div style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--primary-dark)' }}>Мысал {i+1}: {renderMathText(ex.problem)}</div>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>Шешімі:</span>
                      <ol style={{ marginTop: '8px', paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                        {ex.solution_steps.map((step, j) => (
                          <li key={j} style={{ marginBottom: '6px' }}>{renderMathText(step)}</li>
                        ))}
                      </ol>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--success)' }}>Жауап: {renderMathText(ex.answer)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {result.common_mistakes && result.common_mistakes.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--error)', marginBottom: '12px', borderBottom: '2px solid var(--border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Жиі кездесетін қателер
              </h3>
              <ul style={{ lineHeight: 1.6, color: 'var(--text-secondary)', paddingLeft: '20px' }}>
                {result.common_mistakes.map((m, i) => <li key={i} style={{ marginBottom: '8px' }}>{renderMathText(m)}</li>)}
              </ul>
            </div>
          )}
          
          <div style={{ padding: '20px', background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-dark)', marginBottom: '8px' }}>Түйіндеме</h3>
            <div style={{ lineHeight: 1.6, color: 'var(--primary)' }}>{renderMathText(result.summary)}</div>
          </div>
          
          <MiniChat contextData={result} />
        </div>
        
        <div className="card-footer" style={{ display: 'flex', gap: '16px', background: 'var(--bg-main)', borderTop: '1px solid var(--border)', padding: '24px' }}>
          <button className="btn btn-primary" style={{ flex: 1 }}><Bookmark size={18} style={{ marginRight: '8px' }}/> Таңдаулыларға сақтау</button>
          <button className="btn btn-secondary" style={{ flex: 1 }}><Download size={18} style={{ marginRight: '8px' }}/> PDF-ке экспорттау</button>
          <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => {
            setPreFillTopic(topic);
            setPreFillClass(selectedClass);
            setActiveView('ai-text');
          }}><Wand2 size={18} style={{ marginRight: '8px' }}/> Тест жасау</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: 'var(--radius-full)', background: 'var(--accent-light)', color: 'var(--accent)', marginBottom: '16px' }}>
          <BookOpen size={32} />
        </div>
        <h1 className="page-title" style={{ fontSize: '2rem' }}>Тақырыпты түсіндіру</h1>
        <p className="page-subtitle" style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>Жасанды интеллект кез келген математикалық тақырыпты теория, формулалар және мысалдармен түсінікті етіп түсіндіреді</p>
      </div>

      <div className="card" style={{ maxWidth: '700px', margin: '0 auto', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--accent-light)' }}>
        <div className="card-body" style={{ padding: '40px' }}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Қандай тақырыпты түсіндіру керек?</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="мысалы: дискриминант арқылы квадрат теңдеулер"
              style={{ fontSize: '1.125rem', padding: '16px 20px' }}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            
            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: '12px' }}>Танымал:</span>
              <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px' }}>
                {suggestions.map(s => (
                  <button key={s} className="badge" style={{ background: 'var(--bg-main)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setTopic(s)}
                  onMouseOver={(e) => e.target.style.background = 'var(--primary-light)'}
                  onMouseOut={(e) => e.target.style.background = 'var(--bg-main)'}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Оқушының деңгейі</label>
              <div className="select-wrapper">
                <select className="form-control select-control" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                  {classKeys.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Түсіндіру тереңдігі</label>
              <div className="select-wrapper">
                <select className="form-control select-control" value={depth} onChange={(e) => setDepth(e.target.value)}>
                  <option value="Қысқаша">Қысқаша</option>
                  <option value="Толық">Толық</option>
                  <option value="Мысалдармен">Мысалдармен</option>
                </select>
              </div>
            </div>
          </div>

          {errorMsg && <div style={{ color: 'var(--error)', marginBottom: '16px', background: 'var(--error-bg)', padding: '12px', borderRadius: 'var(--radius-md)' }}>{errorMsg}</div>}

          <button className="btn btn-accent btn-lg btn-block" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating && loadingStage && <div style={{ fontSize: '0.875rem', fontWeight: 500, marginRight: '8px' }}>{loadingStage}</div>}
            {isGenerating ? <RefreshCw size={20} className="spinner" /> : <Lightbulb size={20} />} 
            {isGenerating ? "" : "Түсіндіру"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AIGenerationView({ mode = "text", onSaveToBank, onSaveTest, onExplainQuestion, initialTopic = "", initialClass = "8 сынып" }) {
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptText, setPromptText] = useState(initialTopic);
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || "Квадрат теңдеулер");
  const [difficulty, setDifficulty] = useState("Орташа");
  const [questionCount, setQuestionCount] = useState(5);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [ocrStep, setOcrStep] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [loadingStage, setLoadingStage] = useState("");
  const [questionType, setQuestionType] = useState("тест с вариантами ответов");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg("");

    if (mode === 'doc' && !selectedFile) {
       setErrorMsg("Өтінеміз, құжат файлын жүктеңіз.");
       setIsGenerating(false);
       return;
    }
    if (mode === 'photo' && !ocrStep) {
       setErrorMsg("Алдымен фото жүктеп, мәтінді таныңыз.");
       setIsGenerating(false);
       return;
    }

    try {
      if (mode === 'doc') {
         setLoadingStage("Құжатты оқудамыз...");
         await new Promise(r => setTimeout(r, 1000));
         setLoadingStage("Мазмұнды талдаудамыз...");
         await new Promise(r => setTimeout(r, 1500));
      } else if (mode === 'photo') {
         setLoadingStage("Мәтінді (OCR) талдаудамыз...");
         await new Promise(r => setTimeout(r, 1000));
      }
      setLoadingStage("Тапсырмаларды генерациялаудамыз...");

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

      const basePromptText = mode === 'photo'
        ? `Сен — математиканы оқыту әдістемесі бойынша сарапшысың. Саған оқу материалының (оқулық, есептер жинағы, конспект немесе тақтадағы жазу) фотосуретінен танылған мәтін берілген. Мәтінде аздаған тану қателері болуы мүмкін — оларды математикалық контекст бойынша түсіндір.

Сенің міндетің:
1. Определи тему(ы), которые представлены в материале.
2. Определи обозначения, формулы и методы решения, использованные в тексте (используй ровно ту нотацию, что в материале).
3. Оцени уровень сложности материала по представленным примерам.
4. Сгенерируй ${questionCount} заданий теста, которые:
   - соответствуют содержанию и логике распознанного материала;
   - используют те же обозначения и терминологию;
   - охватывают типы задач, аналогичные примерам из материала;
   - имеют уровень сложности: ${difficulty};
   - оформлены в формате: ${questionType}.

Для каждого задания укажи:
- условие задачи;
- варианты ответов (если применимо), с одним правильным и правдоподобными неправильными;
- правильный ответ;
- краткое решение/пояснение.

Если из-за ошибок распознавания часть материала непонятна — игнорируй эти фрагменты и строй задания на основе уверенно распознанной части.

Распознанный материал:
"${ocrText}"`
        : mode === 'doc' 
        ? `Ты — эксперт по методике преподавания математики. Тебе дан извлеченный текст из загруженного PDF/документа.

Твоя задача:
1. Тщательно проанализируй текст. Найди реальные примеры задач, которые там приводятся.
2. Сгенерируй ${questionCount} заданий, которые БАЗИРУЮТСЯ ИМЕННО НА ПРИМЕРАХ ИЗ ДОКУМЕНТА. Бери реальные примеры из текста, слегка меняй в них числа или условия, чтобы получить новые задачи того же типа.
3. Используй строго те же обозначения, формулы и методы решения, что и в загруженном файле (например, если дискриминант обозначается как D, используй D).
4. Охватывай только те темы, которые реально есть в предоставленном тексте. Не выдумывай задачи на другие темы.
5. Задания должны иметь уровень сложности: ${difficulty}.
6. Формат заданий: ${questionType}.

Для каждого задания укажи:
- условие задачи (на основе реального примера из PDF);
- варианты ответов (если применимо), с одним правильным;
- правильный ответ;
- краткое решение/пояснение на основе методов из документа.

Исходный материал из PDF/документа:
"${promptText}"`
        : `Ты профессиональный эксперт-составитель тестов ЕНТ по математике.

Твоя задача — сгенерировать математический тест.
- Сынып/Уровень: ${selectedClass}
- Тақырып: ${selectedTopic}
- Қиындығы: ${difficulty}
- Сұрақтар саны: ${questionCount}
- Формат заданий: ${questionType}.

ВАЖНО: Обязательно учитывай следующий запрос пользователя при составлении заданий:
"${promptText}"`;

      const systemPrompt = `${basePromptText}

Верни результат СТРОГО в формате JSON, без дополнительных блоков markdown. Только чистый JSON объект:
{
  "topic": "Тақырып заданий",
  "questions": [
    {
      "question": "Текст вопроса",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "Текст правильного варианта, точно совпадающий с одним из вариантов",
      "explanation": "..."
    }
  ]
}`;

      const result = await model.generateContent(systemPrompt);
      const responseText = result.response.text();
      
      let cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      
      const questionsArray = parsed.questions ? parsed.questions : (Array.isArray(parsed) ? parsed : []);
      const mappedQuestions = questionsArray.map(q => {
        let idx = 0;
        if (q.options && q.correct_answer) {
           idx = q.options.findIndex(opt => opt === q.correct_answer || opt.includes(q.correct_answer) || q.correct_answer.includes(opt));
           if (idx === -1) idx = 0;
        }
        return {
           question: q.question,
           options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
           correctIndex: q.correctIndex !== undefined ? q.correctIndex : Math.max(0, idx),
           explanation: q.explanation
        };
      });

      setGeneratedQuestions(mappedQuestions);
      setGenerated(true);
      setLoadingStage("");
    } catch (err) {
      console.error(err);
      setErrorMsg(`Қате генерации: ${err.message || 'Проверьте ключ API или попробуйте позже.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '900px' }}>
      <header className="page-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 'var(--radius-full)', marginBottom: '16px' }}>
            <Wand2 size={32} />
          </div>
          <h1 className="page-title">AI көмегімен тест жасаңыз</h1>
          <p className="page-subtitle">Жасанды интеллект бірнеше секундта сапалы математикалық тапсырмалар жасайды</p>
        </div>
      </header>

      {!generated ? (
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)', border: '1px solid var(--accent-light)' }}>
          <div className="card-body">
            
            {mode === 'text' && (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '1.125rem' }}>Қандай тест керектігін сипаттаңыз</label>
                <textarea 
                  className="form-control ai-textarea" 
                  placeholder='Мысалы: 8 сыныпқа арналған "Квадрат теңдеулер" тақырыбына орташа қиындықтағы 15 сұрақтан тұратын тест жаса. Параметрлері бар бірнеше есеп қос.'
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                ></textarea>
              </div>
            )}

            {mode === 'doc' && (
              <div 
                style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px', textAlign: 'center', marginBottom: '24px', background: selectedFile ? 'var(--success-bg)' : 'var(--bg-main)', transition: 'all 0.2s' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    setSelectedFile(file);
                    setPromptText("Файлдан алынған мәтін " + file.name + ":\n\nБұл мәтінде математикалық тапсырмалардың шешу жолдары, формулалар мен анықтамалар бар...");
                  }
                }}
              >
                {!selectedFile ? (
                  <>
                    <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ marginBottom: '8px' }}>Файлды осында сүйреңіз немесе таңдау үшін басыңыз</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>Қолдау көрсетілетін форматтар: PDF, DOCX, TXT</p>
                    <input type="file" id="file-upload" style={{ display: 'none' }} accept=".pdf,.docx,.txt" onChange={(e) => {
                        if (e.target.files[0]) {
                          const file = e.target.files[0];
                          setSelectedFile(file);
                          setPromptText("Файлдан алынған мәтін " + file.name + ":\n\nБұл мәтінде математикалық тапсырмалардың шешу жолдары, формулалар мен анықтамалар бар...");
                        }
                    }} />
                    <button className="btn btn-primary" onClick={() => document.getElementById('file-upload').click()}>Файлды таңдау</button>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ marginBottom: '8px' }}>Файл жүктелді: {selectedFile.name}</h3>
                    <p style={{ color: 'var(--success)', fontSize: '0.875rem', marginBottom: '16px' }}>Мәтін сәтті танылды және генерацияға дайын</p>
                    <button className="btn btn-secondary" onClick={() => setSelectedFile(null)}>Басқасын жүктеу</button>
                  </>
                )}
              </div>
            )}

            {mode === 'photo' && !ocrStep && (
              <div 
                style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px', textAlign: 'center', marginBottom: '24px', background: 'var(--bg-main)', transition: 'all 0.2s' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setSelectedPhotos(Array.from(e.dataTransfer.files));
                  }
                }}
              >
                {selectedPhotos.length === 0 ? (
                  <>
                    <Camera size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ marginBottom: '8px' }}>Тапсырмалары бар беттің суретін жүктеңіз</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>Дәптер, тақта немесе оқулық суреттері қолдаулы (JPG, PNG, HEIC)</p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                      <input type="file" id="photo-upload" style={{ display: 'none' }} accept="image/*" multiple onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setSelectedPhotos(Array.from(e.target.files));
                          }
                      }} />
                      <button className="btn btn-primary" onClick={() => document.getElementById('photo-upload').click()}><Camera size={18} style={{ marginRight: '8px' }}/> Суретке түсіру немесе таңдау</button>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ marginBottom: '8px' }}>Таңдалған фото: {selectedPhotos.length} дана</h3>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                       {selectedPhotos.map((f, i) => <span key={i} className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{f.name}</span>)}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button className="btn btn-secondary" onClick={() => setSelectedPhotos([])}>Барлығын өшіру</button>
                      <button className="btn btn-primary" disabled={isGenerating} onClick={async () => {
                         setIsGenerating(true);
                         setLoadingStage("AI арқылы суретті тану...");
                         
                         try {
                           const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
                           const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
                           
                           const imageParts = await Promise.all(selectedPhotos.map(fileToGenerativePart));
                           const prompt = "Бұл суреттердегі барлық математикалық мәтінді, тапсырмаларды және формулаларды танып шық. Математикалық логика мен белгілерді сақтай отырып, тек танылған мәтінді шығар. Өз тарапыңнан артық сөздер қоспа.";
                           
                           const result = await model.generateContent([prompt, ...imageParts]);
                           const responseText = result.response.text();
                           
                           setOcrText(responseText);
                         } catch (error) {
                           console.error("OCR Error:", error);
                           setOcrText(`Суретті тану кезінде қате кетті: ${error.message || error}.\n\nҚосылымды тексеріп немесе басқа фото жүктеп көріңіз. Мәтінді қолмен енгізуіңізге болады.`);
                         }
                         
                         setOcrStep(true);
                         setIsGenerating(false);
                         setLoadingStage("");
                      }}>{isGenerating ? "Тану жүріп жатыр..." : "Мәтінді тану"}</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {mode === 'photo' && ocrStep && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>Проверка распознавания (OCR)</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.875rem' }}>Машинное зрение не всегда идеально распознает сложные математические формулы. Пожалуйста, внимательно проверьте и поправьте ошибки (если они есть) перед генерацией теста.</p>
                <textarea 
                  className="form-control ai-textarea" 
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  style={{ height: '150px', marginBottom: '16px', fontFamily: 'monospace' }}
                ></textarea>
                <button className="btn btn-secondary" onClick={() => setOcrStep(false)}>Назад к загрузке фото</button>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
              <div className="form-group" style={{ flex: '1 1 150px' }}>
                <label className="form-label">Сынып</label>
                <div className="select-wrapper">
                  <select className="form-control select-control" value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedTopic(mathTopics[e.target.value][0] || "Любая тема"); }}>
                    {classKeys.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ flex: '1 1 150px' }}>
                <label className="form-label">Тақырып</label>
                <div className="select-wrapper">
                  <select className="form-control select-control" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                    {(mathTopics[selectedClass] || []).map(topic => <option key={topic} value={topic}>{topic}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ flex: '1 1 150px' }}>
                <label className="form-label">Қиындығы</label>
                <div className="select-wrapper">
                  <select className="form-control select-control" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option>Оңай</option>
                    <option>Орташа</option>
                    <option>Күрделі</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ flex: '1 1 150px' }}>
                <label className="form-label">Тапсырма түрі</label>
                <div className="select-wrapper">
                  <select className="form-control select-control" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                    <option value="тест с вариантами ответов">Нұсқалармен</option>
                    <option value="открытые вопросы">Ашық</option>
                    <option value="смешанный">Аралас</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ flex: '1 1 100px' }}>
                <label className="form-label">Сұрақтар саны</label>
                <input type="number" className="form-control" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} min="1" max="50" />
              </div>
            </div>

            {errorMsg && <div style={{ color: 'var(--error)', marginBottom: '16px', background: 'var(--error-bg)', padding: '12px', borderRadius: 'var(--radius-md)' }}>{errorMsg}</div>}

            <button className="btn btn-accent btn-lg btn-block" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating && loadingStage && <div style={{ fontSize: '0.875rem', fontWeight: 500, marginRight: '8px' }}>{loadingStage}</div>}
              {isGenerating ? <RefreshCw size={20} className="spinner" /> : <Wand2 size={20} />} 
              {isGenerating ? "" : "Тестті генерациялау"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Сгенерированные вопросы ({generatedQuestions.length})</h2>
            <div>
              <button className="btn btn-secondary" style={{ marginRight: '12px' }} onClick={() => setGenerated(false)}>← Назад</button>
              <button className="btn btn-primary" onClick={() => {
                onSaveToBank(generatedQuestions.map(q => ({
                  text: q.question,
                  classLabel: selectedClass,
                  topic: selectedTopic,
                  difficulty: difficulty,
                  options: q.options,
                  correctIndex: q.correctIndex
                })));
                onSaveTest({
                  title: promptText ? `Тест: ${promptText.substring(0, 20)}...` : `Генерацияланған тест: ${selectedTopic}`,
                  classLabel: selectedClass,
                  topic: selectedTopic,
                  questionsCount: generatedQuestions.length,
                  questions: generatedQuestions.map(q => ({
                    text: q.question,
                    options: q.options,
                    correctIndex: q.correctIndex
                  }))
                });
              }}>Сақтау және жариялау</button>
            </div>
          </div>

          {generatedQuestions.map((q, idx) => (
            <div className="question-card" key={idx}>
              <div className="question-header">
                <div className="question-number">Сұрақ {idx + 1} <span className="badge warning" style={{ marginLeft: '12px' }}>{difficulty}</span></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-accent" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => onExplainQuestion(q.question)}>
                    <Lightbulb size={14} style={{ marginRight: '4px' }}/> Түсіндіру
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}><RefreshCw size={14} style={{ marginRight: '4px' }}/> Ауыстыру</button>
                  <button className="btn-icon"><Edit2 size={16} /></button>
                  <button className="btn-icon" style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="question-text">{q.question}</div>
              <div className="answers-grid">
                {Array.isArray(q.options) && q.options.map((opt, optIdx) => (
                  <div key={optIdx} className={`answer-item ${optIdx === q.correctIndex ? 'correct' : ''}`}>
                    {opt} {optIdx === q.correctIndex && <CheckCircle2 size={16} style={{ marginLeft: 'auto' }}/>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentTestView({ setActiveView, test, onFinishTest }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const initialTime = test?.timeLimit ? test.timeLimit * 60 : 45 * 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);

  React.useEffect(() => {
    if (!test || !test.questions || test.questions.length === 0) return;
    
    if (timeLeft <= 0) {
      handleComplete();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, test]);

  const handleComplete = () => {
    let correctCount = 0;
    test.questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) correctCount++;
    });
    onFinishTest({
      title: test.title,
      total: test.questions.length,
      correct: correctCount,
      percentage: Math.round((correctCount / test.questions.length) * 100),
      date: new Date().toLocaleString('ru-RU'),
      questions: test.questions,
      userAnswers: userAnswers
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <div style={{ background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Қате: Бұл тестте әлі тапсырмалар жоқ</h2>
        <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => setActiveView('tests')}>Тізімге оралу</button>
      </div>
    );
  }

  const q = test.questions[currentIdx];
  const progress = ((currentIdx + 1) / test.questions.length) * 100;

  const handleNext = () => {
    if (currentIdx < test.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-icon" onClick={() => setActiveView('tests')}><ArrowLeft size={20} /></button>
          <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{test.title}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Сұрақ {currentIdx + 1} / {test.questions.length}</div>
          <div className="timer-badge" style={{ color: timeLeft < 300 ? 'var(--error)' : 'var(--warning-dark)', background: timeLeft < 300 ? 'var(--error-bg)' : '#FEF3C7' }}>
            <Clock size={20} /> {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="progress-bar-bg" style={{ borderRadius: 0, height: '6px' }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%`, backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
      </div>

      <div className="student-test-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <div className="student-question-card" style={{ padding: '40px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', background: 'white', marginTop: '40px' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '24px', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
            Тапсырма {currentIdx + 1}
          </div>
          <div className="student-question-text" style={{ fontSize: '1.375rem', lineHeight: '1.6', color: '#1a1a2e', marginBottom: '40px', fontWeight: 500 }}>
            {renderMathText(q?.text)}
          </div>
          
          <div className="student-answers" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.isArray(q?.options) && q.options.map((opt, idx) => {
              const isSelected = userAnswers[currentIdx] === idx;
              return (
                <button 
                  key={idx}
                  className={`student-answer-btn ${isSelected ? 'selected' : ''}`} 
                  onClick={() => setUserAnswers({...userAnswers, [currentIdx]: idx})}
                  style={{ 
                    padding: '20px 24px', 
                    borderRadius: '16px',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--primary-light)' : 'white',
                    textAlign: 'left',
                    fontSize: '1.125rem',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', 
                    background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                    color: isSelected ? 'white' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, marginRight: '16px', flexShrink: 0
                  }}>
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][idx] || '?'}
                  </div>
                  <span style={{ fontWeight: isSelected ? 600 : 400, color: 'var(--text-main)' }}>
                    {renderMathText(String(opt).replace(/^[A-H]\)\s*/, ''))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="student-controls" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          <button 
            className="btn btn-secondary btn-lg" 
            onClick={() => {
              if (currentIdx === 0) setActiveView('tests');
              else setCurrentIdx(currentIdx - 1);
            }}
            style={{ padding: '14px 32px', borderRadius: '12px' }}
          >
            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> {currentIdx === 0 ? 'Выйти' : 'Назад'}
          </button>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleNext}
            style={{ padding: '14px 32px', borderRadius: '12px' }}
          >
            {currentIdx < test.questions.length - 1 ? (
              <>Дальше <ArrowRight size={18} style={{ marginLeft: '8px' }} /></>
            ) : (
              <>Аяқтау тест <CheckCircle2 size={18} style={{ marginLeft: '8px' }} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentResultsView({ setActiveView, resultsHistory = [], onExplainError }) {
  if (resultsHistory.length === 0) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <h2>Нәтижелер жоқ</h2>
        <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>Осы сессияда сіз әлі бірде-бір тест өтпедіңіз.</p>
        <button className="btn btn-primary" onClick={() => setActiveView('tests')}>Тесттерге өту</button>
      </div>
    );
  }

  const result = resultsHistory[0];
  let message = "Керемет нәтиже!";
  if (result.percentage < 50) message = "Көбірек жаттығу қажет";
  else if (result.percentage < 80) message = "Жақсы нәтиже";

  const graphData = [...resultsHistory].reverse().map((r, i) => ({
    name: `Тест ${i+1}`,
    score: r.percentage
  }));

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="btn btn-secondary" onClick={() => setActiveView('tests')} style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Қайту к тестам
      </button>

      <div className="card">
        <div className="card-body">
          <div className="result-hero">
            <div className="result-score-circle" style={{ borderColor: result.percentage >= 80 ? 'var(--success)' : result.percentage >= 50 ? 'var(--warning)' : 'var(--error)' }}>
              <div className="result-score-inner">
                <div className="result-percentage" style={{ color: result.percentage >= 80 ? 'var(--success)' : result.percentage >= 50 ? 'var(--warning)' : 'var(--error)' }}>{result.percentage}%</div>
                <div className="result-fraction">{result.correct} / {result.total} дұрыс</div>
              </div>
            </div>
            <h1 className="page-title">{message}</h1>
            <p className="page-subtitle">Тест: {result.title}</p>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-item-val" style={{ color: 'var(--success)' }}>{result.correct}</div>
              <div className="stat-item-lbl">Дұрыс</div>
            </div>
            <div className="stat-item">
              <div className="stat-item-val" style={{ color: 'var(--error)' }}>{result.total - result.correct}</div>
              <div className="stat-item-lbl">Қате</div>
            </div>
            <div className="stat-item">
              <div className="stat-item-val">--:--</div>
              <div className="stat-item-lbl">Уақыт</div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>Сіздің үлгеріміңіз</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '16px' }}>Өту тарихы</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {resultsHistory.map((hist, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{hist.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>{hist.date}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: hist.percentage >= 80 ? 'var(--success)' : hist.percentage >= 50 ? 'var(--warning)' : 'var(--error)' }}>
                    {hist.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>Жауаптарды талдау</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {result.questions && result.questions.map((q, idx) => {
                 const isCorrect = result.userAnswers[idx] === q.correctIndex;
                 return (
                   <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`, background: 'var(--bg-main)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                         <div style={{ fontWeight: 600 }}>Сұрақ {idx + 1}</div>
                         {isCorrect ? <span style={{ color: 'var(--success)' }}>Дұрыс</span> : <span style={{ color: 'var(--error)' }}>Қате</span>}
                      </div>
                      <div style={{ marginBottom: '12px', fontSize: '1.05rem', color: 'var(--text-main)' }}>{q.text}</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {Array.isArray(q.options) && q.options.map((opt, optIdx) => {
                          const isOptCorrect = optIdx === q.correctIndex;
                          const isUserOpt = optIdx === result.userAnswers[idx];
                          let optBg = 'transparent';
                          let optBorder = 'var(--border)';
                          if (isOptCorrect) {
                             optBg = 'var(--success-bg)';
                             optBorder = 'var(--success)';
                          } else if (isUserOpt) {
                             optBg = 'var(--error-bg)';
                             optBorder = 'var(--error)';
                          }
                          return (
                            <div key={optIdx} style={{ 
                              padding: '6px 10px', borderRadius: '6px', fontSize: '0.9rem',
                              background: optBg,
                              border: `1px solid ${optBorder}`
                            }}>
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                      {!isCorrect && (
                        <button className="btn btn-secondary" style={{ marginTop: '16px', fontSize: '0.875rem', padding: '6px 12px' }} 
                          onClick={() => onExplainError({ isErrorContext: true, text: q.text, userAnswer: q.options[result.userAnswers[idx]], correctAnswer: q.options[q.correctIndex] })}>
                          <Lightbulb size={14} style={{ marginRight: '6px' }} /> Түсіндіру ошибку
                        </button>
                      )}
                   </div>
                 )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherAnalyticsView({ results = [] }) {
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totalTests = results.length;
  let excellent = 0, good = 0, satisfactory = 0, bad = 0;
  let totalPercentage = 0;
  const questionStats = {};

  results.forEach(res => {
    totalPercentage += res.percentage;
    if (res.percentage >= 90) excellent++;
    else if (res.percentage >= 75) good++;
    else if (res.percentage >= 50) satisfactory++;
    else bad++;

    if (res.questions && res.userAnswers) {
      res.questions.forEach((q, idx) => {
        const textKey = q.text.substring(0, 100);
        if (!questionStats[textKey]) {
          questionStats[textKey] = { text: q.text, title: res.title, wrong: 0, total: 0 };
        }
        questionStats[textKey].total++;
        if (res.userAnswers[idx] !== q.correctIndex) {
          questionStats[textKey].wrong++;
        }
      });
    }
  });

  const avgPercentage = totalTests > 0 ? (totalPercentage / totalTests).toFixed(1) : 0;
  
  const rawPieData = [
    { name: 'Өте жақсы (90-100%)', value: totalTests > 0 ? Math.round((excellent / totalTests) * 100) : 0 },
    { name: 'Жақсы (75-89%)', value: totalTests > 0 ? Math.round((good / totalTests) * 100) : 0 },
    { name: 'Қанағатт. (50-74%)', value: totalTests > 0 ? Math.round((satisfactory / totalTests) * 100) : 0 },
    { name: 'Қанағатт. емес (<50%)', value: totalTests > 0 ? Math.round((bad / totalTests) * 100) : 0 },
  ];
  const pieData = rawPieData.filter(d => d.value > 0);

  const sortedQuestions = Object.values(questionStats)
    .filter(q => q.total > 0)
    .map(q => ({ ...q, errorRate: Math.round((q.wrong / q.total) * 100) }))
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 3);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      const prompt = `Ты — образовательный аналитик. Проанализируй эти данные тестов и дай краткий (1-2 предложения) профессиональный вывод на казахском языке об успеваемости и самых слабых темах.
      Средний балл: ${avgPercentage}%. 
      Слабые темы: ${sortedQuestions.map(q => q.text.slice(0, 30) + " (" + q.errorRate + "% қате)").join(', ')}
      Сделай вывод: какие темы нужно повторить.`;
      
      const result = await model.generateContent(prompt);
      setAiAnalysis(result.response.text());
    } catch (e) {
      console.error(e);
      setAiAnalysis("Талдау кезінде қате кетті. Интернет қосылымын тексеріңіз.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + "Ученик,Сынып,Тест,Баға,Пайыз\n"
      + "Ахметов Азамат,8 класс,Квадрат теңдеулер,5,90%\n"
      + "Оспанов Ерлан,8 класс,Квадрат теңдеулер,4,75%\n"
      + "Серіков Данияр,8 класс,Квадрат теңдеулер,3,60%";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <div>
          <h1 className="page-title">Аналитика и отчеты</h1>
          <p className="page-subtitle">Оқушылардың үлгерімін және тесттердің тиімділігін терең талдау</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Есепті экспорттау
          </button>
        </div>
      </header>

      <div className="ai-analysis-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ background: 'white', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--accent)', boxShadow: 'var(--shadow-sm)' }}>
            <BrainCircuit size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h3 style={{ marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Нәтижелерді AI-талдау
                <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>AI</span>
              </h3>
              {!aiAnalysis && (
                <button className="btn btn-primary" onClick={handleAiAnalysis} disabled={isAnalyzing || totalTests === 0}>
                  {isAnalyzing ? <RefreshCw className="spinner" size={16} /> : <Wand2 size={16} />}
                  {isAnalyzing ? "Талдау жүріп жатыр..." : "AI талдау жасау"}
                </button>
              )}
            </div>
            {aiAnalysis ? (
              <p style={{ color: 'var(--text-main)', lineHeight: 1.6, maxWidth: '800px', fontWeight: 500 }}>
                {renderMathText(aiAnalysis)}
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
                {totalTests > 0 ? "Оқушылардың нәтижелерін талдау және қиын тақырыптарды анықтау үшін AI қолданыңыз." : "Аналитика жасау үшін кемінде бір тест тапсырылуы қажет."}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid-layout-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header"><h2 className="card-title">Бағалардың үлестірімі</h2></div>
            <div className="card-body" style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {pieData.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS[i] }}></div>
                      <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header"><h2 className="card-title">Самые сложные вопросы (Топ 3)</h2></div>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Сұрақ</th><th>Тест</th><th>% Қате</th></tr></thead>
                <tbody>
                  {sortedQuestions.length > 0 ? sortedQuestions.map((q, i) => (
                    <tr key={i}>
                      <td><div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{renderMathText(q.text)}</div></td>
                      <td><div style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</div></td>
                      <td><span className={`badge ${q.errorRate >= 50 ? 'error' : 'warning'}`}>{q.errorRate}%</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Деректер жоқ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="stat-card" style={{ flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span className="stat-label">Орташа нәтиже</span>
              <div className="stat-icon primary" style={{ width: '32px', height: '32px' }}><Award size={16} /></div>
            </div>
            <div className="stat-value">{avgPercentage}%</div>
          </div>
          
          <div className="stat-card" style={{ flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span className="stat-label">Сынақтар саны</span>
              <div className="stat-icon success" style={{ width: '32px', height: '32px' }}><Users size={16} /></div>
            </div>
            <div className="stat-value">{totalTests}</div>
          </div>
          
          <div className="stat-card" style={{ flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span className="stat-label">Өтілген тесттер</span>
              <div className="stat-icon accent" style={{ width: '32px', height: '32px' }}><CheckCircle2 size={16} /></div>
            </div>
            <div className="stat-value">{totalTests}</div>
          </div>

          <div className="stat-card" style={{ flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span className="stat-label">Орташа уақыт</span>
              <div className="stat-icon warning" style={{ width: '32px', height: '32px' }}><Clock size={16} /></div>
            </div>
            <div className="stat-value">18m 40s</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestsListView({ setActiveView, testsList = [], onTakeTest }) {
  const handleDownloadDoc = (test) => {
    if (!test.questions || test.questions.length === 0) {
      alert("Бұл тестте жүктеп алуға арналған тапсырмалар жоқ.");
      return;
    }

    let content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${test.title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 14pt; }
            h1 { text-align: center; font-size: 18pt; }
            .question { margin-top: 20px; font-weight: bold; }
            .options { margin-top: 10px; margin-left: 20px; }
            .option { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>${test.title}</h1>
          <p><strong>Сынып:</strong> ${test.classLabel} | <strong>Тақырып:</strong> ${test.topic}</p>
          <hr/>
    `;

    test.questions.forEach((q, i) => {
      content += `<div class="question">${i + 1}. ${q.text}</div>`;
      if (q.options && q.options.length > 0) {
        content += `<div class="options">`;
        q.options.forEach(opt => {
          content += `<div class="option">${opt}</div>`;
        });
        content += `</div>`;
      }
    });

    content += `</body></html>`;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${test.title.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <div>
          <h1 className="page-title">Менің тесттерім</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveView('create')}>
          <PlusCircle size={16} /> Тест жасау
        </button>
      </header>
      
      <div className="card">
        <div className="card-header" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: '250px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input type="text" placeholder="Тесттерді іздеу..." />
          </div>
          <div className="select-wrapper">
            <select className="form-control select-control" style={{ width: '150px' }}>
              <option>Барлық сыныптар</option>
              <option>5 класс</option>
              <option>6 класс</option>
              <option>7 класс</option>
              <option>8 класс</option>
            </select>
          </div>
          <div className="select-wrapper">
            <select className="form-control select-control" style={{ width: '150px' }}>
              <option>Все темы</option>
              <option>Алгебра</option>
              <option>Геометрия</option>
            </select>
          </div>
          <div className="select-wrapper">
            <select className="form-control select-control" style={{ width: '150px' }}>
              <option>Барлық статустар</option>
              <option>Белсенді</option>
              <option>Аяқталды</option>
              <option>Қаралама</option>
            </select>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Атауы</th>
                <th>Сынып</th>
                <th>Тақырып</th>
                <th>Сұрақтар</th>
                <th>Өтілуі</th>
                <th>Орт. балл</th>
                <th>Статус</th>
                <th>Құрылды</th>
                <th>Әрекет</th>
              </tr>
            </thead>
            <tbody>
              {testsList.map((test) => (
                <tr key={test.id}>
                  <td style={{ fontWeight: 500 }}>{test.title}</td>
                  <td>{test.classLabel}</td>
                  <td>{test.topic}</td>
                  <td>{test.questionsCount}</td>
                  <td>{test.takes}</td>
                  <td style={{ fontWeight: 600, color: test.avgScore !== '-' ? 'var(--success)' : 'var(--text-muted)' }}>{test.avgScore}</td>
                  <td><span className={`badge ${test.status === 'Белсенді' ? 'active' : test.status === 'Аяқталды' ? 'completed' : 'draft'}`}>{test.status}</span></td>
                  <td>{test.date}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => onTakeTest(test)}>
                        Өту
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => handleDownloadDoc(test)} title="Word құжаты ретінде жүктеу">
                        <Download size={14} /> Жүктеу
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BankView({ questionBank = [], onAddToTest, currentTestQuestions = [], onUpdateQuestion, onExplainQuestion }) {
  const [editingQ, setEditingQ] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("Барлық сыныптар");
  const [selectedTopic, setSelectedTopic] = useState("Все темы");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Қиындығы");
  
  const availableTopics = selectedClass === "Барлық сыныптар" 
    ? Array.from(new Set(Object.values(mathTopics).flat()))
    : mathTopics[selectedClass] || [];

  const filteredBank = questionBank.filter(q => {
    const matchClass = selectedClass === "Барлық сыныптар" || q.classLabel === selectedClass;
    const matchTopic = selectedTopic === "Все темы" || q.topic === selectedTopic;
    const matchDiff = selectedDifficulty === "Қиындығы" || q.difficulty === selectedDifficulty;
    const matchSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchTopic && matchDiff && matchSearch;
  });
  return (
    <div className="page-wrapper">
      <header className="page-header">
        <div>
          <h1 className="page-title">Тапсырмалар банкі</h1>
          <p className="page-subtitle">Құрастырылған барлық сұрақтардың ортақ базасы</p>
        </div>
      </header>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', padding: '16px 24px' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: '250px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input type="text" placeholder="Поиск по заданиям..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="select-wrapper">
            <select className="form-control select-control" style={{ width: '140px' }} value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedTopic("Все темы"); }}>
              <option value="Барлық сыныптар">Барлық сыныптар</option>
              {classKeys.map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
          </div>
          <div className="select-wrapper">
            <select className="form-control select-control" style={{ width: '160px' }} value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
              <option value="Все темы">Все темы</option>
              {availableTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
            </select>
          </div>
          <div className="select-wrapper">
            <select className="form-control select-control" style={{ width: '140px' }} value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
              <option value="Қиындығы">Қиындығы</option>
              <option value="Оңай">Оңай</option>
              <option value="Орташа">Орташа</option>
              <option value="Күрделі">Күрделі</option>
            </select>
          </div>
          <div className="select-wrapper">
            <select className="form-control select-control" style={{ width: '140px' }}>
              <option>Түрі задания</option>
              <option>Один ответ</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredBank.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            По вашему запросу ничего не найдено. Измените фильтры.
          </div>
        ) : (
          filteredBank.map((q, idx) => (
            <div className="question-card" key={idx}>
              <div className="question-header" style={{ marginBottom: '8px' }}>
                <div className="question-number">Сұрақ {filteredBank.length - idx}</div>
                <div>
                  {q.classLabel && <span className="badge" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', marginRight: '8px' }}>{q.classLabel}</span>}
                  <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginRight: '8px' }}>{q.topic}</span>
                  <span className={`badge ${q.difficulty === 'Күрделі' ? 'error' : q.difficulty === 'Оңай' ? 'success' : 'warning'}`}>{q.difficulty}</span>
                </div>
              </div>
            {editingQ === q ? (
              <div style={{ marginTop: '16px', background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '12px' }}>Редактирование задания</h4>
                <textarea 
                  className="form-control" 
                  value={editForm.text} 
                  onChange={(e) => setEditForm({...editForm, text: e.target.value})}
                  rows={3}
                  style={{ marginBottom: '16px' }}
                />
                {editForm.options && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    {editForm.options.map((opt, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="radio" 
                          name={`edit-correct-${idx}`} 
                          checked={editForm.correctIndex === i}
                          onChange={() => setEditForm({...editForm, correctIndex: i})}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <input 
                          className="form-control" 
                          value={opt.replace(/^[A-D]\)\s*/, '')}
                          onChange={(e) => {
                            const newOpts = [...editForm.options];
                            newOpts[i] = `${['A', 'B', 'C', 'D'][i]}) ${e.target.value}`;
                            setEditForm({...editForm, options: newOpts});
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" onClick={() => {
                    onUpdateQuestion(q, editForm);
                    setEditingQ(null);
                  }}><CheckCircle2 size={16} /> Сохранить</button>
                  <button className="btn btn-secondary" onClick={() => setEditingQ(null)}>Отмена</button>
                </div>
              </div>
            ) : (
              <>
                <div className="question-text" style={{ fontSize: '1.25rem', padding: '16px 0' }}>{q.text}</div>
                
                {q.options && (
                  <div className="answers-grid" style={{ marginBottom: '16px' }}>
                    {Array.isArray(q.options) && q.options.map((opt, optIdx) => (
                      <div key={optIdx} className={`answer-item ${optIdx === q.correctIndex ? 'correct' : ''}`} style={{ padding: '8px 12px', fontSize: '0.9rem' }}>
                        {opt} {optIdx === q.correctIndex && <CheckCircle2 size={14} style={{ marginLeft: 'auto' }}/>}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <button className="btn btn-accent" onClick={() => onExplainQuestion(q.text)}>
                    <Lightbulb size={16} style={{ marginRight: '8px' }} /> Түсіндіру
                  </button>
                  <button className="btn btn-secondary" onClick={() => {
                    setEditingQ(q);
                    setEditForm({ ...q });
                  }}><Edit2 size={16} style={{ marginRight: '8px' }} /> Редактировать</button>
                  
                  <button 
                    className={`btn ${currentTestQuestions.includes(q) ? 'btn-success' : 'btn-primary'}`} 
                    onClick={() => {
                      if (!currentTestQuestions.includes(q)) onAddToTest(q);
                    }}
                    disabled={currentTestQuestions.includes(q)}
                  >
                    {currentTestQuestions.includes(q) ? <><CheckCircle2 size={16} /> В тесте</> : <><PlusCircle size={16} /> Добавить в тест</>}
                  </button>
                  
                  <button className="btn-icon" style={{ marginLeft: 'auto' }}><MoreVertical size={18} /></button>
                </div>
              </>
            )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [explanationQuestion, setExplanationQuestion] = useState(null);
  const [preFillTopic, setPreFillTopic] = useState("");
  const [preFillClass, setPreFillClass] = useState("8 сынып");
  const [preFillContext, setPreFillContext] = useState(null);
  const mockQuadEq = [
    { text: "Теңдеудің түбірлерін табыңыз: x² − 5x + 6 = 0", options: ["A) x=1; 6", "B) x=2; 3", "C) x=-2; -3", "D) x=3; 5"], correctIndex: 1 },
    { text: "Теңдеуді шешіңіз: 2x² − 7x + 3 = 0", options: ["A) x=0.5; 3", "B) x=-0.5; -3", "C) x=1; 1.5", "D) x=2; 1.5"], correctIndex: 0 },
    { text: "Дискриминантты табыңыз: x² + 4x + 4 = 0", options: ["A) 0", "B) 4", "C) 16", "D) -4"], correctIndex: 0 },
    { text: "p-ның қандай мәнінде теңдеудің x² - px + 9 = 0 бір түбірі болады?", options: ["A) 3", "B) 6 и -6", "C) 9", "D) 0"], correctIndex: 1 },
    { text: "Қай теңдеудің нақты түбірлері жоқ?", options: ["A) x² - x - 2 = 0", "B) x² + x + 1 = 0", "C) x² - 4 = 0", "D) x² = 0"], correctIndex: 1 },
    { text: "Теңдеу түбірлерінің қосындысы x² - 8x + 15 = 0 Виет теоремасы бойынша тең:", options: ["A) 15", "B) -8", "C) 8", "D) -15"], correctIndex: 2 },
    { text: "Теңдеу түбірлерінің көбейтіндісі x² + 5x + 6 = 0 тең:", options: ["A) 5", "B) -5", "C) 6", "D) -6"], correctIndex: 2 },
    { text: "Толымсыз квадрат теңдеуді шешіңіз: 3x² - 27 = 0", options: ["A) 3", "B) 9", "C) 3 и -3", "D) 9 и -9"], correctIndex: 2 },
    { text: "Решите: 5x² = 0", options: ["A) 5", "B) 1", "C) 0", "D) Түбірлері жоқ"], correctIndex: 2 },
    { text: "Егер D > 0 болса, теңдеудің неше түбірі болады?", options: ["A) 1", "B) 2", "C) 0", "D) Шексіз көп"], correctIndex: 1 },
    { text: "Дискриминант формуласы:", options: ["A) D = b² + 4ac", "B) D = a² - 4bc", "C) D = b² - 4ac", "D) D = 2a - b"], correctIndex: 2 },
    { text: "x² - 16 = 0 теңдеуінің түбірлері:", options: ["A) 4", "B) -4", "C) 16", "D) 4 и -4"], correctIndex: 3 },
    { text: "Егер a=1, b=0, c=-9 болса, теңдеудің түрі қандай:", options: ["A) x² - 9x = 0", "B) x² - 9 = 0", "C) x² + 9 = 0", "D) x - 9 = 0"], correctIndex: 1 },
    { text: "Теңдеудің түбірлері қандай (x-2)(x+3) = 0?", options: ["A) 2; -3", "B) -2; 3", "C) 2; 3", "D) -2; -3"], correctIndex: 0 },
    { text: "Келтірілген квадрат теңдеу дегеніміз не?", options: ["A) Мұнда b=0", "B) Мұнда c=0", "C) Мұнда a=1", "D) Мұнда D=0"], correctIndex: 2 }
  ];

  const mockCount20 = [
    { text: "Неше болады 5 + 3?", options: ["A) 7", "B) 8", "C) 9", "D) 10"], correctIndex: 1 },
    { text: "Петяда 10 алма болды, ол 2-еуін жеді. Неше қалды?", options: ["A) 8", "B) 7", "C) 12", "D) 6"], correctIndex: 0 },
    { text: "15-тен кейін қандай сан келеді?", options: ["A) 14", "B) 17", "C) 16", "D) 20"], correctIndex: 2 },
    { text: "Қосындыны тап: 12 + 7", options: ["A) 18", "B) 19", "C) 20", "D) 17"], correctIndex: 1 },
    { text: "Неше болады 20 - 5?", options: ["A) 15", "B) 10", "C) 25", "D) 14"], correctIndex: 0 }
  ];

  const initialTestsData = [
    { 
      id: 5, title: "Генерацияланған тест: 20-ға дейін санау", classLabel: "1 сынып", topic: "20-ға дейін санау", questionsCount: 5, takes: 0, avgScore: "-", status: "Белсенді", date: new Date().toLocaleDateString('ru-RU'),
      questions: mockCount20
    },
    { 
      id: 1, title: "Квадрат теңдеулер", classLabel: "8 сынып", topic: "Алгебра", questionsCount: 15, takes: 27, avgScore: "82%", status: "Белсенді", date: "12.10.2023",
      questions: mockQuadEq
    },
    { 
      id: 2, title: "Сызықтық функциялар", classLabel: "7 сынып", topic: "Алгебра", questionsCount: 2, takes: 31, avgScore: "76%", status: "Белсенді", date: "10.10.2023", 
      questions: [
        { text: "Түзудің бұрыштық коэффициентін табыңыз y = 3x - 5", options: ["A) -5", "B) 3", "C) 5", "D) 0"], correctIndex: 1 },
        { text: "Функциялардың қайсысы сызықтық?", options: ["A) y = x² + 1", "B) y = 2/x", "C) y = 4x + 7", "D) y = √x"], correctIndex: 2 }
      ] 
    },
    { 
      id: 3, title: "Пайыз", classLabel: "6 сынып", topic: "Алгебра", questionsCount: 2, takes: 24, avgScore: "89%", status: "Аяқталды", date: "05.10.2023", 
      questions: [
        { text: "150 санының 20%-ын табыңыз", options: ["A) 20", "B) 30", "C) 15", "D) 40"], correctIndex: 1 },
        { text: "Тауар 2000 тг тұрды, оның бағасы 10%-ға төмендеді. Жаңа бағасы қандай?", options: ["A) 1900 тг", "B) 1800 тг", "C) 2100 тг", "D) 1990 тг"], correctIndex: 1 }
      ] 
    },
    { 
      id: 4, title: "Пифагор теоремасы", classLabel: "8 сынып", topic: "Геометрия", questionsCount: 2, takes: 0, avgScore: "-", status: "Қаралама", date: "15.10.2023", 
      questions: [
        { text: "Катеттері 3 және 4 болатын тікбұрышты үшбұрыштың гипотенузасын табыңыз", options: ["A) 5", "B) 7", "C) 25", "D) 12"], correctIndex: 0 },
        { text: "Катеті 5-ке, гипотенузасы 13-ке тең. Екінші катетті табыңыз.", options: ["A) 10", "B) 8", "C) 12", "D) 18"], correctIndex: 2 }
      ] 
    }
  ];

  const [questionBank, setQuestionBank] = useState(() => {
    const saved = localStorage.getItem('mathTest_bank');
    return saved ? JSON.parse(saved) : initialBankData;
  });

  const [testsList, setTestsList] = useState(() => {
    const saved = localStorage.getItem('mathTest_tests');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(t => {
        if (!t.questions || t.questions.length === 0) {
          if (t.title.includes("Квадратные") || t.id === 1) {
            t.questions = mockQuadEq;
            t.questionsCount = mockQuadEq.length;
          } else if (t.title.includes("20-ға дейін санау")) {
            t.questions = mockCount20;
            t.questionsCount = mockCount20.length;
          } else {
             const fallback = initialTestsData.find(i => i.id === t.id);
             if (fallback) {
               t.questions = fallback.questions;
               t.questionsCount = fallback.questions.length;
             }
          }
        }
        return t;
      });
    }
    return initialTestsData;
  });

  React.useEffect(() => {
    localStorage.setItem('mathTest_bank', JSON.stringify(questionBank));
  }, [questionBank]);

  React.useEffect(() => {
    localStorage.setItem('mathTest_tests', JSON.stringify(testsList));
  }, [testsList]);

  const [currentTestQuestions, setCurrentTestQuestions] = useState([]);

  const [activeTestToTake, setActiveTestToTake] = useState(null);
  
  const [studentResults, setStudentResults] = useState(() => {
    const saved = localStorage.getItem('mathTest_studentResults');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('mathTest_studentResults', JSON.stringify(studentResults));
  }, [studentResults]);

  if (activeTab === 'student_take_test') return <StudentTestView setActiveView={setActiveTab} test={activeTestToTake} onFinishTest={(res) => { 
    const newResult = { ...res, date: new Date().toLocaleString('ru-RU', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) };
    setStudentResults([newResult, ...studentResults]); 
    setActiveTab('student_results'); 
  }} />;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleTakeTest = (test) => {
    setActiveTestToTake(test);
    setActiveTab('student_take_test');
  };

  const handleSaveToBank = (newQuestions) => {
    setQuestionBank([...newQuestions, ...questionBank]);
    setActiveTab('bank');
  };

  const handleAddToTest = (question) => {
    if (!currentTestQuestions.includes(question)) {
      setCurrentTestQuestions([...currentTestQuestions, question]);
    }
  };

  const handleUpdateQuestion = (oldQuestion, newQuestion) => {
    setQuestionBank(questionBank.map(q => q === oldQuestion ? newQuestion : q));
  };

  const handleSaveTest = (newTest) => {
    setTestsList([{
      id: Date.now(),
      title: newTest.title,
      classLabel: newTest.classLabel,
      topic: newTest.topic,
      questionsCount: newTest.questionsCount,
      questions: newTest.questions || [],
      takes: 0,
      avgScore: "-",
      status: newTest.status || "Белсенді",
    }, ...testsList]);
    setActiveTab('tests');
  };

  return (
    <div className="app-container">
      <MathBackground3D />
      <div className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon"><BrainCircuit size={20} /></div>
          <div className="logo-text">MathTest</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Негізгі</div>
            <SidebarItem icon={LayoutDashboard} label="Басты тақта" active={activeTab === 'dashboard'} onClick={() => handleTabClick('dashboard')} />
            <SidebarItem icon={FileText} label="Менің тесттерім" active={activeTab === 'tests'} onClick={() => handleTabClick('tests')} />
            <SidebarItem icon={Library} label="Тапсырмалар банкі" active={activeTab === 'bank'} onClick={() => handleTabClick('bank')} />
            <SidebarItem icon={BarChart3} label="Аналитика" active={activeTab === 'analytics'} onClick={() => handleTabClick('analytics')} />
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Жоспарлау</div>
            <SidebarItem icon={Calendar} label="КТЖ" active={activeTab === 'ai-ktj'} onClick={() => handleTabClick('ai-ktj')} />
            <SidebarItem icon={FileText} label="КМЖ" active={activeTab === 'ai-kmj'} onClick={() => handleTabClick('ai-kmj')} />
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Құру</div>
            <SidebarItem icon={PlusCircle} label="Тест жасау" active={activeTab === 'create'} onClick={() => handleTabClick('create')} />
            <SidebarItem icon={BookOpen} label="Тақырыпты түсіндіру" active={activeTab === 'topic-explain'} onClick={() => handleTabClick('topic-explain')} />
            <SidebarItem icon={Wand2} label="Мәтін бойынша (AI)" active={activeTab === 'ai-text'} onClick={() => handleTabClick('ai-text')} />
            <SidebarItem icon={Camera} label="Фото бойынша (AI)" active={activeTab === 'ai-photo'} onClick={() => handleTabClick('ai-photo')} />
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu size={20} />
            </button>
            <div className="search-bar" style={{ flex: 1 }}>
              <Search size={18} color="var(--text-muted)" />
              <input type="text" placeholder="Тесттерді, оқушыларды, тақырыптарды іздеу..." />
            </div>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <div className="user-avatar" style={{ width: '36px', height: '36px', cursor: 'pointer' }}>
              <User size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' && <DashboardView setActiveView={setActiveTab} />}
        {(activeTab === 'tests' || activeTab === 'student_tests') && <TestsListView setActiveView={setActiveTab} testsList={testsList} onTakeTest={handleTakeTest} />}
        {activeTab === 'bank' && <BankView questionBank={questionBank} onAddToTest={handleAddToTest} currentTestQuestions={currentTestQuestions} onUpdateQuestion={handleUpdateQuestion} onExplainQuestion={setExplanationQuestion} />}
        {activeTab === 'create' && <CreateTestView setActiveView={setActiveTab} testQuestions={currentTestQuestions} setTestQuestions={setCurrentTestQuestions} onSaveTest={handleSaveTest} />}
        {activeTab === 'topic-explain' && <TopicExplanationView setActiveView={setActiveTab} setPreFillTopic={setPreFillTopic} setPreFillClass={setPreFillClass} />}
        {activeTab === 'ai-text' && <AIGenerationView key="ai-text" mode="text" onSaveToBank={handleSaveToBank} onSaveTest={handleSaveTest} onExplainQuestion={setExplanationQuestion} initialTopic={preFillTopic} initialClass={preFillClass} />}
        {activeTab === 'ai-doc' && <AIGenerationView key="ai-doc" mode="doc" onSaveToBank={handleSaveToBank} onSaveTest={handleSaveTest} onExplainQuestion={setExplanationQuestion} initialTopic={preFillTopic} initialClass={preFillClass} />}
        {activeTab === 'ai-photo' && <AIGenerationView key="ai-photo" mode="photo" onSaveToBank={handleSaveToBank} onSaveTest={handleSaveTest} onExplainQuestion={setExplanationQuestion} initialTopic={preFillTopic} initialClass={preFillClass} />}
        {activeTab === 'ai-kmj' && <KmjGenerationView setActiveView={setActiveTab} onSaveTest={handleSaveTest} setExplanationQuestion={setExplanationQuestion} preFillContext={preFillContext} />}
        {activeTab === 'ai-ktj' && <KtjGenerationView setActiveView={setActiveTab} onSaveTest={handleSaveTest} setExplanationQuestion={setExplanationQuestion} onNavigateToKmj={(ctx) => { setPreFillContext(ctx); setActiveTab('ai-kmj'); }} />}
        {activeTab === 'student_results' && <StudentResultsView setActiveView={setActiveTab} resultsHistory={studentResults} onExplainError={setExplanationQuestion} />}
        {activeTab === 'analytics' && <TeacherAnalyticsView results={studentResults} />}
        
        {/* Fallback Empty States */}
        {['favorites', 'settings'].includes(activeTab) && (
          <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', background: 'white', padding: '64px 40px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px dashed var(--border)', maxWidth: '500px', width: '100%' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Library size={40} />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text-main)' }}>Бұл бөлім әзірге бос</h2>
              <p style={{ marginBottom: '32px', fontSize: '1rem', lineHeight: 1.6 }}>Мұнда платформаны пайдалану барысында сіздің деректеріңіз көрсетіледі.</p>
              <button className="btn btn-primary btn-lg" onClick={() => handleTabClick('create')}>
                <PlusCircle size={18} /> Өзіңіздің алғашқы тестіңізді жасаңыз
              </button>
            </div>
          </div>
        )}
      </main>
      {explanationQuestion && <ProblemExplanationModal questionData={explanationQuestion} onClose={() => setExplanationQuestion(null)} />}
    </div>
  );
}

export default App;
