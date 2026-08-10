import { useState } from 'react';
import { useGameStore } from '../store';
import { TERM_QUESTIONS } from '../data/quiz';

export function Intro() {
  const completeIntro = useGameStore((s) => s.completeIntro);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [correct, setCorrect] = useState<Record<string, boolean>>({});

  function choose(questionId: string, optionId: string, correctId: string) {
    setSelected((prev) => ({ ...prev, [questionId]: optionId }));
    setCorrect((prev) => ({ ...prev, [questionId]: optionId === correctId }));
  }

  const allCorrect = TERM_QUESTIONS.every((q) => correct[q.id]);
  const correctCount = TERM_QUESTIONS.filter((q) => correct[q.id]).length;

  return (
    <div className="stack" style={{ gap: '1.6rem' }}>
      <div className="page-head">
        <span className="eyebrow">Orientation</span>
        <h1>Before you take the job</h1>
        <p className="page-lede">
          Every PM career starts with the vocabulary. Get all six right to move on. Pick an answer, and if
          it's wrong, you'll see why before trying again.
        </p>
      </div>

      {TERM_QUESTIONS.map((q, i) => {
        const chosen = selected[q.id];
        const isCorrect = correct[q.id];
        return (
          <div className="panel stack" key={q.id}>
            <div className="row-between">
              <span className="eyebrow">
                {i + 1} / {TERM_QUESTIONS.length} &middot; {q.term}
              </span>
              {chosen && (
                <span className={`pill ${isCorrect ? 'good' : 'risk'}`}>{isCorrect ? 'Correct' : 'Not quite'}</span>
              )}
            </div>
            <p style={{ fontWeight: 600 }}>{q.question}</p>
            {q.options.map((opt) => {
              const isChosen = chosen === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`choice-btn ${isChosen ? (isCorrect ? 'quiz-correct' : 'quiz-incorrect') : ''}`}
                  onClick={() => choose(q.id, opt.id, q.correctId)}
                >
                  <div className="clabel">{opt.label}</div>
                </button>
              );
            })}
            {chosen && (
              <p className="quiz-explain">{isCorrect ? q.explanation : 'Have another look at the options above.'}</p>
            )}
          </div>
        );
      })}

      <div className="action-bar">
        <div className="action-bar-inner">
          <span className="action-bar-meta">{correctCount} / {TERM_QUESTIONS.length} correct</span>
          <button type="button" className="btn btn-primary" disabled={!allCorrect} onClick={completeIntro}>
            {allCorrect ? 'Continue' : 'Get them all right to continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
