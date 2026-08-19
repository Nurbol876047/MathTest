import React, { useState } from 'react';
import { FileText, CheckCircle2, RefreshCw, Calendar, ArrowLeft, Wand2, PlusCircle, BookOpen, Search, Download, Edit2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun } from 'docx';
import { saveAs } from 'file-saver';

async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export default function KtjGenerationView({ setActiveView, onSaveTest, setExplanationQuestion, onNavigateToKmj }) {
  const [viewMode, setViewMode] = useState('upload'); // 'upload' or 'build'
  const [step, setStep] = useState(1);
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [lessons, setLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Барлығы');
  
  // Build form state
  const [buildClass, setBuildClass] = useState('8 сынып');
  const [buildQuarter, setBuildQuarter] = useState('1 тоқсан');
  const [buildHours, setBuildHours] = useState(3);
  const [buildFeatures, setBuildFeatures] = useState('');
  const [builtKtjContext, setBuiltKtjContext] = useState(null);

  // Test generation state
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Орташа');
  const [questionType, setQuestionType] = useState('тест с вариантами ответов');

  const handleFileUpload = async (file) => {
    setIsParsing(true);
    setErrorMsg('');
    setLoadingStage('Құжат талдануда...');
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      const filePart = await fileToGenerativePart(file);
      
      const prompt = `Ты — эксперт по казахстанским учебным программам. Тебе дан текст, извлечённый из документа КТЖ (календарно-тематический план) учителя математики.
Твоя задача — найти в тексте все уроки и извлечь для каждого:
- lesson_number (номер урока)
- date (дату, если указана)
- topic (тему урока)
- hours (количество часов, если указано)
- lesson_type: "Қалыпты", "БЖБ" (СОР) или "ТЖБ" (СОЧ)

Верни строго JSON:
{
  "lessons": [
    {"lesson_number": "1", "date": "02.09", "topic": "Мәтін", "hours": "1", "lesson_type": "Қалыпты"}
  ]
}`;
      const result = await model.generateContent([prompt, filePart]);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && parsed.lessons) {
        setLessons(parsed.lessons);
        setStep(2);
      } else {
        throw new Error('Сабақтар табылмады');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(`Қате шықты: ${e.message}`);
    } finally {
      setIsParsing(false);
      setLoadingStage('');
    }
  };

  const handleBuildKtj = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      setLoadingStage('Жасанды интеллект КТЖ жоспарын құрастыруда...');
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      
      const prompt = `Сен — қазақстандық мектептің тәжірибелі математика пәні мұғалімі-әдіскерісің. Саған берілген сынып пен тоқсан үшін Күнтізбелік-тақырыптық жоспар (КТЖ) құру керек, ҚР Білім министрлігінің үлгілік оқу бағдарламасына сәйкес.

Кіріс деректер:
Пән: Математика
Сынып: ${buildClass}
Тоқсан: ${buildQuarter}
Аптадағы сабақ саны: ${buildHours}
Бағдарлама ерекшеліктері: ${buildFeatures}

Тапсырма: осы тоқсанға арналған барлық сабақтардың тізімін құра. БЖБ (СОР) сабақтарын әр бөлімнің соңында, ТЖБ (СОЧ) сабағын тоқсанның соңында орналастыр.

Нәтижені қатаң JSON форматында қайтар:
{
  "grade": "${buildClass}",
  "quarter": "${buildQuarter}",
  "lessons": [
    {"lesson_number": 1, "topic": "Натурал сандарды қосу", "hours": 1, "lesson_type": "Қалыпты"}
  ]
}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      setBuiltKtjContext(parsed);
      setLessons(parsed.lessons);
      setStep(2);
    } catch (e) {
      console.error(e);
      setErrorMsg(`КТЖ генерациясында қате: ${e.message}`);
    } finally {
      setIsGenerating(false);
      setLoadingStage('');
    }
  };

  const exportToWord = async () => {
    try {
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "№", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Күні", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Тақырыбы", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Сағат", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Түрі", bold: true })] })] }),
          ]
        }),
        ...lessons.map((lesson, idx) => 
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(lesson.lesson_number?.toString() || (idx + 1).toString())] }),
              new TableCell({ children: [new Paragraph(lesson.date || "")] }),
              new TableCell({ children: [new Paragraph(lesson.topic || "")] }),
              new TableCell({ children: [new Paragraph(lesson.hours?.toString() || "1")] }),
              new TableCell({ children: [new Paragraph(lesson.lesson_type || "Қалыпты")] }),
            ]
          })
        )
      ];

      const doc = new Document({
        sections: [{
          properties: {
            page: { size: { orientation: "landscape" } }
          },
          children: [
            new Paragraph({ children: [new TextRun({ text: "Күнтізбелік-тақырыптық жоспар (КТЖ)", bold: true, size: 32 })] }),
            new Paragraph({ text: "" }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "KTJ_Plan.docx");
    } catch (e) {
      console.error("Export error", e);
      alert("Экспорт кезінде қате шықты.");
    }
  };

  const handleCreateTest = (lesson) => {
    setSelectedLesson(lesson);
    if (lesson.lesson_type === 'БЖБ' || lesson.lesson_type?.includes('СОР')) {
      setQuestionType('смешанный'); setDifficulty('Орташа'); setQuestionCount(5);
    } else if (lesson.lesson_type === 'ТЖБ' || lesson.lesson_type?.includes('СОЧ')) {
      setQuestionType('смешанный'); setDifficulty('Күрделі'); setQuestionCount(15);
    } else {
      setQuestionType('тест с вариантами ответов'); setDifficulty('Орташа'); setQuestionCount(10);
    }
    setStep(3);
  };

  const handleGenerateTest = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      setLoadingStage('Тапсырмаларды генерациялаудамыз...');
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      
      const prompt = `Ты — эксперт по математике. Сгенерируй ${questionCount} заданий по теме "${selectedLesson.topic}".
Сложность: ${difficulty}. Формат: ${questionType}.
Если это "тест с вариантами ответов" или "смешанный", каждый тестовый вопрос должен иметь ровно 5 вариантов ответа (A, B, C, D, E), по стандарту ЕНТ.
Для математических формул обязательно используй LaTeX: $...$ для строчных и $$...$$ для блочных.
Если урок БЖБ/ТЖБ, сбалансируй задания по уровням мышления.
Верни строго JSON:
{
  "topic": "${selectedLesson.topic}",
  "questions": [
    { "question": "...", "options": ["...","..."], "correct_answer": "...", "explanation": "..." }
  ]
}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      const standardQuestions = parsed.questions.map((q, idx) => ({
        id: 'ktj_q' + Date.now() + idx,
        type: (q.options && q.options.length >= 2) ? 'multiple_choice' : 'open',
        text: q.question,
        options: q.options || [],
        correctAnswer: q.correct_answer,
        explanation: q.explanation || ''
      }));
      
      onSaveTest({
        title: `${parsed.topic} (КТЖ)`,
        subject: 'Математика',
        grade: buildClass,
        difficulty,
        tags: ['КТЖ'],
        questions: standardQuestions,
        createdAt: new Date().toISOString()
      }, true);
    } catch (e) {
      console.error(e);
      setErrorMsg(`Генерация қатесі: ${e.message}`);
    } finally {
      setIsGenerating(false);
      setLoadingStage('');
    }
  };

  const filteredLessons = lessons.filter(l => {
    const matchSearch = l.topic?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'Барлығы' || l.lesson_type?.includes(filterType);
    return matchSearch && matchType;
  });

  return (
    <div className="page-wrapper" style={{ maxWidth: '1000px' }}>
      <header className="page-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 'var(--radius-full)', marginBottom: '16px' }}>
            <Calendar size={32} />
          </div>
          <h1 className="page-title">КТЖ бойынша тест құру</h1>
          <p className="page-subtitle">Күнтізбелік-тақырыптық жоспар жасаңыз немесе жүктеп, барлық сабақтарды басқарыңыз</p>
        </div>
      </header>

      {errorMsg && <div style={{ color: 'var(--error)', marginBottom: '24px', background: 'var(--error-bg)', padding: '16px', borderRadius: 'var(--radius-md)' }}>{errorMsg}</div>}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', justifyContent: 'center' }}>
        <button className={`btn ${viewMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setViewMode('upload'); setStep(1); setLessons([]); }}>
          <FileText size={18} /> Файлдан оқу (Дайын КТЖ)
        </button>
        <button className={`btn ${viewMode === 'build' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setViewMode('build'); setStep(1); setLessons([]); }}>
          <PlusCircle size={18} /> Жаңа КТЖ құрастыру (AI)
        </button>
      </div>

      {viewMode === 'upload' && step === 1 && (
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <div className="card-body">
            <div 
              style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px', textAlign: 'center', background: 'var(--bg-main)', cursor: 'pointer' }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('ktj-upload').click()}
            >
              <FileText size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>КТЖ файлын осында сүйреңіз немесе басыңыз</h3>
              <p style={{ color: 'var(--text-muted)' }}>DOCX, XLSX, PDF қолдау көрсетіледі</p>
              <input type="file" id="ktj-upload" style={{ display: 'none' }} accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg" onChange={(e) => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); }} />
              <button className="btn btn-primary btn-lg" disabled={isParsing} style={{ marginTop: '24px' }}>
                {isParsing ? <RefreshCw size={20} className="spinner" /> : <FileText size={20} />}
                {isParsing ? 'Оқудамыз...' : 'Файлды таңдау'}
              </button>
              {loadingStage && <div style={{ marginTop: '16px', color: 'var(--primary)' }}>{loadingStage}</div>}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'build' && step === 1 && (
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)', maxWidth: '700px', margin: '0 auto' }}>
          <div className="card-header"><h2 className="card-title">КТЖ параметрлері</h2></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Пән</label>
              <input type="text" className="form-control" value="Математика" disabled />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Сынып</label>
                <select className="form-control select-control" value={buildClass} onChange={e => setBuildClass(e.target.value)}>
                  {[5, 6, 7, 8, 9, 10, 11].map(c => <option key={c} value={c + ' сынып'}>{c} сынып</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Тоқсан</label>
                <select className="form-control select-control" value={buildQuarter} onChange={e => setBuildQuarter(e.target.value)}>
                  {[1, 2, 3, 4].map(q => <option key={q} value={q + ' тоқсан'}>{q} тоқсан</option>)}
                  <option value="Толық оқу жылы">Толық оқу жылы</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Аптадағы сабақ саны</label>
              <input type="number" className="form-control" value={buildHours} onChange={e => setBuildHours(e.target.value)} min={1} max={10} />
            </div>
            <div className="form-group">
              <label className="form-label">Бағдарлама ерекшеліктері (міндетті емес)</label>
              <input type="text" className="form-control" placeholder="Мысалы: гимназия сыныбына арналған тереңдетілген" value={buildFeatures} onChange={e => setBuildFeatures(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-lg btn-block" onClick={handleBuildKtj} disabled={isGenerating}>
              {isGenerating ? <RefreshCw size={20} className="spinner" /> : <Wand2 size={20} />} 
              {isGenerating ? loadingStage : "КТЖ жасау"}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="card-title">Сабақтар тізімі</h2>
              <p style={{ color: 'var(--text-muted)' }}>Барлығы {lessons.length} сабақ</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-accent" onClick={exportToWord}><Download size={18} /> Word форматында жүктеу</button>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Артқа</button>
            </div>
          </div>
          <div className="card-body" style={{ background: 'var(--bg-main)', padding: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input type="text" className="form-control" placeholder="Тақырып бойынша іздеу..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '40px' }} />
              </div>
              <select className="form-control select-control" style={{ width: '200px' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="Барлығы">Барлық сабақтар</option>
                <option value="БЖБ">БЖБ (СОР)</option>
                <option value="ТЖБ">ТЖБ (СОЧ)</option>
                <option value="Қалыпты">Қалыпты сабақтар</option>
              </select>
            </div>
            <div className="table-wrapper" style={{ maxHeight: '600px', overflowY: 'auto', background: 'white', borderRadius: 'var(--radius-lg)' }}>
              <table className="table">
                <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                  <tr>
                    <th style={{ width: '60px' }}>№</th>
                    <th>Тақырып</th>
                    <th style={{ width: '80px' }}>Сағат</th>
                    <th style={{ width: '120px' }}>Түрі</th>
                    <th style={{ width: '250px' }}>Әрекет</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLessons.map((lesson, idx) => (
                    <tr key={idx} style={{ transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--primary-light)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td>{lesson.lesson_number || idx + 1}</td>
                      <td>
                        <input type="text" value={lesson.topic} onChange={e => { const newL = [...lessons]; newL[lessons.indexOf(lesson)].topic = e.target.value; setLessons(newL); }} style={{ border: 'none', background: 'transparent', width: '100%', fontWeight: 500 }} />
                      </td>
                      <td>{lesson.hours || 1}</td>
                      <td>
                        <span className="badge" style={{ background: lesson.lesson_type?.includes('БЖБ') ? 'var(--warning-bg)' : lesson.lesson_type?.includes('ТЖБ') ? 'var(--error-bg)' : 'var(--bg-main)' }}>
                          {lesson.lesson_type || 'Қалыпты'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleCreateTest(lesson)}>Тест құру</button>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => { if(onNavigateToKmj) onNavigateToKmj({ topic: lesson.topic, cls: buildClass, type: lesson.lesson_type }); }}>КМЖ құру</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {step === 3 && selectedLesson && (
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="icon-btn" onClick={() => setStep(2)}><ArrowLeft size={20} /></button>
            <div><h2 className="card-title">Тест генерациясы: {selectedLesson.topic}</h2></div>
          </div>
          <div className="card-body">
             <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Сұрақтар саны</label>
                  <input type="number" className="form-control" value={questionCount} onChange={e => setQuestionCount(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Қиындығы</label>
                  <select className="form-control select-control" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option>Оңай</option>
                    <option>Орташа</option>
                    <option>Күрделі</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Формат</label>
                  <select className="form-control select-control" value={questionType} onChange={e => setQuestionType(e.target.value)}>
                    <option value="тест с вариантами ответов">Тест (A-E)</option>
                    <option value="открытые вопросы">Ашық сұрақтар</option>
                    <option value="смешанный">Аралас</option>
                  </select>
                </div>
             </div>
             <button className="btn btn-accent btn-lg btn-block" onClick={handleGenerateTest} disabled={isGenerating}>
               {isGenerating ? <RefreshCw className="spinner" size={20} /> : <Wand2 size={20} />}
               {isGenerating ? loadingStage : "Тестті генерациялау"}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
