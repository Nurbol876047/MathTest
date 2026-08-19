import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, RefreshCw, Calendar, ArrowLeft, Wand2, PlusCircle, BookOpen } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Convert file to base64
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

export default function KmjGenerationView({ setActiveView, onSaveTest, setExplanationQuestion, preFillContext }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Select Lesson, 3: Generate
  const [selectedFile, setSelectedFile] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Build mode state
  const [viewMode, setViewMode] = useState(preFillContext ? 'build' : 'upload'); // 'upload' or 'build'
  const [buildTopic, setBuildTopic] = useState(preFillContext ? preFillContext.topic : '');
  const [buildClass, setBuildClass] = useState(preFillContext ? preFillContext.cls : '8 сынып');
  const [builtKmj, setBuiltKmj] = useState(null);
  
  // Generation parameters
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Орташа');
  const [questionType, setQuestionType] = useState('тест с вариантами ответов');

  const handleFileUpload = async (file) => {
    setSelectedFile(file);
    setIsParsing(true);
    setErrorMsg('');
    setLoadingStage('Құжат құрылымын талдаудамыз...');
    
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      
      const filePart = await fileToGenerativePart(file);
      
      const prompt = `Ты — эксперт по казахстанским учебным программам. Тебе дан файл (изображение/документ), содержащий КМЖ (календарно-содержательный план) учителя.

Твоя задача — найти в документе все уроки и извлечь для каждого следующие поля:
- lesson_number: номер урока (если указан)
- date: дата (если указана)
- topic: тема урока
- learning_objectives: список целей обучения (включая код цели, если есть, например "9.1.2.5")
- assessment_criteria: критерии оценивания (если указаны отдельно)
- lesson_type: тип урока ("обычный", "СОР", или "СОЧ")

Если какое-то поле не удалось найти для урока — оставь его пустым, не придумывай данные.

Верни результат строго в формате JSON:
{
  "lessons": [
    {
      "lesson_number": "...",
      "date": "...",
      "topic": "...",
      "learning_objectives": ["код: текст цели", "..."],
      "assessment_criteria": "...",
      "lesson_type": "обычный | СОР | СОЧ"
    }
  ]
}`;
      
      const result = await model.generateContent([prompt, filePart]);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(cleaned);
      if (parsed && parsed.lessons && parsed.lessons.length > 0) {
        setLessons(parsed.lessons);
        setStep(2);
      } else {
        throw new Error('Уроки не найдены');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(`Құжатты тану мүмкін болмады: ${e.message}. Автоматты түрде тану мүмкін болмады, "Мәтін бойынша (AI)" бөлімін пайдаланыңыз.`);
    } finally {
      setIsParsing(false);
      setLoadingStage('');
    }
  };

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    if (lesson.lesson_type === 'СОР' || lesson.lesson_type === 'БЖБ') {
      setQuestionType('смешанный');
      setDifficulty('Орташа');
      setQuestionCount(5);
    } else if (lesson.lesson_type === 'СОЧ' || lesson.lesson_type === 'ТЖБ') {
      setQuestionType('смешанный');
      setDifficulty('Күрделі');
      setQuestionCount(15);
    } else {
      setQuestionType('тест с вариантами ответов');
      setDifficulty('Орташа');
    }
    setStep(3);
  };

  const handleBuildKmj = async () => {
    if (!buildTopic.trim()) {
      setErrorMsg('Тақырыпты енгізіңіз');
      return;
    }
    setIsGenerating(true);
    setErrorMsg('');
    try {
      setLoadingStage('Сабақ жоспарын (КМЖ) құрастырудамыз...');
      
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      
      const prompt = `Ты — опытный учитель математики из Казахстана. Составь детализированный план урока (КМЖ) по теме "${buildTopic}" для учеников класса: ${buildClass}.

Верни результат строго в формате JSON со следующей структурой:
{
  "topic": "Тема урока",
  "lesson_type": "Қалыпты",
  "learning_objectives": ["Код: Описание цели 1", "Код: Описание цели 2"],
  "assessment_criteria": "Критерии оценивания текстом",
  "stages": [
    { "name": "Кіріспе", "description": "...", "time": "5 мин" },
    { "name": "Негізгі бөлім", "description": "...", "time": "25 мин" },
    { "name": "Бекіту", "description": "...", "time": "10 мин" },
    { "name": "Қорытынды", "description": "...", "time": "5 мин" }
  ]
}
Барлық мәтіндерді қазақ тілінде қайтар.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      setBuiltKmj(parsed);
      
      // Also pre-fill for test generation
      setSelectedLesson({
        topic: parsed.topic,
        lesson_type: parsed.lesson_type,
        learning_objectives: parsed.learning_objectives || [],
        assessment_criteria: parsed.assessment_criteria || ''
      });
      
    } catch (e) {
      console.error(e);
      setErrorMsg(`КМЖ құрастыру кезінде қате шықты: ${e.message}`);
    } finally {
      setIsGenerating(false);
      setLoadingStage('');
    }
  };

  const handleGenerate = async () => {
    if (!selectedLesson.topic || selectedLesson.learning_objectives.length === 0) {
      if (!window.confirm('Сабақтың мақсаттары көрсетілмеген. Тест тек тақырыпқа негізделіп жасалады. Жалғастырамыз ба?')) {
        return;
      }
    }
    
    setIsGenerating(true);
    setErrorMsg('');
    try {
      setLoadingStage('Құжатты оқудамыз...');
      await new Promise(r => setTimeout(r, 800));
      setLoadingStage('Сабақ мақсаттарын талдаудамыз...');
      await new Promise(r => setTimeout(r, 1200));
      setLoadingStage('Тапсырмаларды генерациялаудамыз...');

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      
      const prompt = `Ты — эксперт по методике преподавания математики в казахстанских школах, работающий строго по типовой учебной программе.

Тебе даны данные урока из календарно-содержательного плана (КМЖ):
Тема урока: ${selectedLesson.topic}
Цели обучения: ${selectedLesson.learning_objectives.join('; ')}
Критерии оценивания: ${selectedLesson.assessment_criteria}
Тип урока: ${selectedLesson.lesson_type}

Твоя задача:
1. Сгенерируй ${questionCount} заданий теста, которые проверяют именно указанные цели обучения и соответствуют критериям оценивания.
2. Каждое задание должно быть привязано к конкретной цели обучения (укажи, к какой именно).
3. Уровень сложности заданий: ${difficulty}.
4. Формат заданий: ${questionType}. Если это "тест с вариантами ответов", каждый вопрос должен строго иметь 5 вариантов ответа (A, B, C, D, E) по стандарту ЕНТ, где только один правильный.
5. Для математических формул обязательно используй LaTeX: $...$ для строчных и $$...$$ для блочных.
6. Если тип урока "СОР" или "СОЧ" — структурируй задания по уровням мышления (навыки низкого/среднего/высокого порядка).

Для каждого задания укажи:
- условие задачи;
- к какой цели обучения относится (код);
- 5 вариантов ответов (если это тест), с одним правильным и 4 правдоподобными неправильными;
- правильный ответ;
- краткое решение/пояснение.

Не выходи за рамки указанных целей обучения и критериев оценивания.

Верни результат строго в формате JSON:
{
  "topic": "${selectedLesson.topic}",
  "lesson_type": "${selectedLesson.lesson_type}",
  "questions": [
    {
      "question": "...",
      "related_objective": "...",
      "options": ["...", "...", "...", "..."],
      "correct_answer": "...",
      "explanation": "..."
    }
  ]
}
Егер пайдаланушы сұрағында басқа тілді көрсетпесе, барлық мәтіндерді қазақ тілінде бер.`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      // format to standard questions
      const standardQuestions = parsed.questions.map((q, idx) => {
        let qType = 'multiple_choice';
        if (!q.options || q.options.length < 2) {
            qType = 'open';
        }
        return {
          id: 'kmj_q' + Date.now() + idx,
          type: qType,
          text: q.question,
          options: q.options || [],
          correctAnswer: q.correct_answer,
          explanation: q.explanation || '',
          objective: q.related_objective || ''
        };
      });
      
      const test = {
        title: `${parsed.topic} (${parsed.lesson_type || 'КМЖ бойынша'})`,
        subject: 'Математика',
        grade: 'Жалпы',
        difficulty: difficulty,
        tags: [parsed.lesson_type === 'СОР' || parsed.lesson_type === 'БЖБ' ? 'БЖБ' : 'КМЖ'],
        questions: standardQuestions,
        createdAt: new Date().toISOString()
      };
      
      onSaveTest(test, true); // true to open in editor
    } catch (e) {
      console.error(e);
      setErrorMsg(`Генерация кезінде қате шықты: ${e.message}`);
    } finally {
      setIsGenerating(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '1000px' }}>
      <header className="page-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 'var(--radius-full)', marginBottom: '16px' }}>
            <Calendar size={32} />
          </div>
          <h1 className="page-title">КМЖ бойынша тест құру</h1>
          <p className="page-subtitle">Күнтізбелік-тақырыптық жоспарды жүктеп, сабақ мақсаттарына негізделген тест жасаңыз</p>
        </div>
      </header>

      {errorMsg && <div style={{ color: 'var(--error)', marginBottom: '24px', background: 'var(--error-bg)', padding: '16px', borderRadius: 'var(--radius-md)' }}>{errorMsg}</div>}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', justifyContent: 'center' }}>
        <button 
          className={`btn ${viewMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => { setViewMode('upload'); setStep(1); setBuiltKmj(null); }}
        >
          <FileText size={18} /> Файлдан оқу (Дайын КМЖ)
        </button>
        <button 
          className={`btn ${viewMode === 'build' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => { setViewMode('build'); setStep(1); setBuiltKmj(null); }}
        >
          <PlusCircle size={18} /> Жаңа КМЖ құрастыру (AI)
        </button>
      </div>

      {viewMode === 'upload' && step === 1 && (
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <div className="card-body">
            <div 
              style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px', textAlign: 'center', background: 'var(--bg-main)', transition: 'all 0.2s', cursor: 'pointer' }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => document.getElementById('kmj-upload').click()}
            >
              <FileText size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>КМЖ файлын осында сүйреңіз немесе басыңыз</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>Қолдау көрсетілетін форматтар: DOCX, XLSX, PDF, PNG, JPG</p>
              
              <input type="file" id="kmj-upload" style={{ display: 'none' }} accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg" onChange={(e) => {
                  if (e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
              }} />
              
              <button className="btn btn-primary btn-lg" disabled={isParsing}>
                {isParsing ? <RefreshCw size={20} className="spinner" /> : <FileText size={20} />}
                {isParsing ? 'Оқудамыз...' : 'Файлды таңдау'}
              </button>
              {isParsing && loadingStage && <div style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 500 }}>{loadingStage}</div>}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'build' && !builtKmj && (
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)', maxWidth: '700px', margin: '0 auto' }}>
          <div className="card-header">
            <h2 className="card-title">Сабақтың тақырыбын енгізіңіз</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Тақырып</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="мысалы: Квадрат теңдеулерді шешу" 
                value={buildTopic}
                onChange={(e) => setBuildTopic(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Сынып</label>
              <div className="select-wrapper">
                <select className="form-control select-control" value={buildClass} onChange={(e) => setBuildClass(e.target.value)}>
                  {["1 сынып", "2 сынып", "3 сынып", "4 сынып", "5 сынып", "6 сынып", "7 сынып", "8 сынып", "9 сынып", "10 сынып", "11 сынып"].map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button className="btn btn-primary btn-lg btn-block" onClick={handleBuildKmj} disabled={isGenerating}>
              {isGenerating ? <RefreshCw size={20} className="spinner" /> : <Wand2 size={20} />} 
              {isGenerating ? loadingStage : "КМЖ жоспарын құрастыру"}
            </button>
          </div>
        </div>
      )}

      {viewMode === 'build' && builtKmj && step === 1 && (
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Жасалған КМЖ жоспары</h2>
            <button className="btn btn-secondary" onClick={() => setBuiltKmj(null)}>Басқа тақырып</button>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: '8px' }}>{builtKmj.topic}</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{buildClass}</span>
                <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{builtKmj.lesson_type}</span>
              </div>
              
              <h4 style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>Оқу мақсаттары:</h4>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-main)' }}>
                {builtKmj.learning_objectives.map((obj, i) => <li key={i}>{obj}</li>)}
              </ul>
              
              <h4 style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>Бағалау критерийлері:</h4>
              <p style={{ color: 'var(--text-main)' }}>{builtKmj.assessment_criteria}</p>
            </div>
            
            <h4 style={{ fontWeight: 600, marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Сабақ кезеңдері:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {builtKmj.stages?.map((stage, idx) => (
                <div key={idx} style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{stage.name}</div>
                    <div className="badge" style={{ background: 'white' }}>{stage.time}</div>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{stage.description}</div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-accent btn-lg" onClick={() => setStep(3)}>
                <BookOpen size={20} /> Осы КМЖ негізінде тест жасау
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'upload' && step === 2 && (
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="card-title">Сабақты таңдаңыз</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Файлдан {lessons.length} сабақ табылды</p>
            </div>
            <button className="btn btn-secondary" onClick={() => { setStep(1); setLessons([]); setSelectedFile(null); }}>
              Басқа файл жүктеу
            </button>
          </div>
          <div className="table-wrapper" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="table">
              <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                <tr>
                  <th style={{ width: '60px' }}>№</th>
                  <th style={{ width: '100px' }}>Күні</th>
                  <th>Тақырып</th>
                  <th>Мақсаттар</th>
                  <th style={{ width: '120px' }}>Түрі</th>
                  <th style={{ width: '100px' }}></th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson, idx) => (
                  <tr key={idx} style={{ cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => handleSelectLesson(lesson)} onMouseOver={e => e.currentTarget.style.background = 'var(--primary-light)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{lesson.lesson_number || idx + 1}</td>
                    <td>{lesson.date || '-'}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{lesson.topic}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {lesson.learning_objectives && lesson.learning_objectives.length > 0 ? 
                          lesson.learning_objectives.map((obj, i) => (
                            <span key={i} className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.7rem' }}>
                              {obj.split(':')[0] || 'Мақсат'}
                            </span>
                          )) : <span style={{ color: 'var(--text-muted)' }}>-</span>
                        }
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ 
                        background: lesson.lesson_type?.includes('СОР') || lesson.lesson_type?.includes('БЖБ') ? 'var(--warning-bg)' : lesson.lesson_type?.includes('СОЧ') || lesson.lesson_type?.includes('ТЖБ') ? 'var(--error-bg)' : 'var(--bg-main)',
                        color: lesson.lesson_type?.includes('СОР') || lesson.lesson_type?.includes('БЖБ') ? 'var(--warning)' : lesson.lesson_type?.includes('СОЧ') || lesson.lesson_type?.includes('ТЖБ') ? 'var(--error)' : 'var(--text-secondary)'
                      }}>
                        {lesson.lesson_type || 'Қалыпты'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Таңдау</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === 3 && selectedLesson && (
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--accent-light)' }}>
            <button className="icon-btn" style={{ background: 'white' }} onClick={() => setStep(2)}>
              <ArrowLeft size={20} color="var(--primary)" />
            </button>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', margin: 0 }}>Тест параметрлерін баптау</h2>
              <p style={{ color: 'var(--primary)', margin: '4px 0 0 0', fontSize: '0.875rem' }}>{selectedLesson.topic}</p>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Сабақ мәліметтері (өңдеуге болады)</h3>
                
                <div className="form-group">
                  <label className="form-label">Тақырып</label>
                  <input type="text" className="form-control" value={selectedLesson.topic} onChange={e => setSelectedLesson({...selectedLesson, topic: e.target.value})} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Оқу мақсаттары</label>
                  <textarea className="form-control ai-textarea" style={{ minHeight: '120px' }} value={selectedLesson.learning_objectives.join('\n')} onChange={e => setSelectedLesson({...selectedLesson, learning_objectives: e.target.value.split('\n')})} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Бағалау критерийлері</label>
                  <textarea className="form-control ai-textarea" style={{ minHeight: '120px' }} value={selectedLesson.assessment_criteria || ''} onChange={e => setSelectedLesson({...selectedLesson, assessment_criteria: e.target.value})} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Сабақ түрі</label>
                  <input type="text" className="form-control" value={selectedLesson.lesson_type || ''} onChange={e => setSelectedLesson({...selectedLesson, lesson_type: e.target.value})} />
                </div>
              </div>

              <div style={{ flex: '1 1 300px' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Генерация параметрлері</h3>
                
                <div className="form-group">
                  <label className="form-label">Тапсырма түрі</label>
                  <div className="select-wrapper">
                    <select className="form-control select-control" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                      <option value="тест с вариантами ответов">Нұсқалармен</option>
                      <option value="открытые вопросы">Ашық</option>
                      <option value="смешанный">Аралас</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Қиындығы</label>
                  <div className="select-wrapper">
                    <select className="form-control select-control" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                      <option>Оңай</option>
                      <option>Орташа</option>
                      <option>Күрделі</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Сұрақтар саны</label>
                  <input type="number" className="form-control" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} min="1" max="50" />
                </div>

                <button className="btn btn-accent btn-lg btn-block" style={{ marginTop: '32px' }} onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating && loadingStage && <div style={{ fontSize: '0.875rem', fontWeight: 500, marginRight: '8px' }}>{loadingStage}</div>}
                  {isGenerating ? <RefreshCw size={20} className="spinner" /> : <Wand2 size={20} />} 
                  {isGenerating ? "" : "Тестті генерациялау"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
