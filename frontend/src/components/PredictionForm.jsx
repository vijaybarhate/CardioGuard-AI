import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, AlertCircle, CheckCircle2, Loader2, Dices } from 'lucide-react';
import RiskGauge from './RiskGauge';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const FIELDS = [
  { name: 'Age', label: 'Age', type: 'number', hint: 'years (1-120)', min: 1, max: 120, step: 1 },
  { name: 'Sex', label: 'Sex', type: 'select', options: [['M','Male'],['F','Female']] },
  { name: 'ChestPainType', label: 'Chest Pain Type', type: 'select', options: [['ATA','Atypical Angina'],['NAP','Non-Anginal Pain'],['ASY','Asymptomatic'],['TA','Typical Angina']] },
  { name: 'RestingBP', label: 'Resting BP', type: 'number', hint: 'mm Hg (60-250)', min: 60, max: 250 },
  { name: 'Cholesterol', label: 'Cholesterol', type: 'number', hint: 'mg/dl (80-600)', min: 80, max: 600 },
  { name: 'FastingBS', label: 'Fasting BS > 120', type: 'select', options: [['0','No'],['1','Yes']] },
  { name: 'RestingECG', label: 'Resting ECG', type: 'select', options: [['Normal','Normal'],['ST','ST-T Abnormality'],['LVH','LV Hypertrophy']] },
  { name: 'MaxHR', label: 'Max Heart Rate', type: 'number', hint: 'bpm (50-220)', min: 50, max: 220 },
  { name: 'ExerciseAngina', label: 'Exercise Angina', type: 'select', options: [['N','No'],['Y','Yes']] },
  { name: 'Oldpeak', label: 'ST Depression (Oldpeak)', type: 'number', hint: 'mm (-5 to 10)', min: -5, max: 10, step: 0.1 },
  { name: 'ST_Slope', label: 'ST Slope', type: 'select', options: [['Up','Upward'],['Flat','Flat'],['Down','Downward']] },
];

const NUMERIC_FIELDS = ['Age', 'RestingBP', 'Cholesterol', 'FastingBS', 'MaxHR', 'Oldpeak'];

const FEATURE_INFO = [
  ['Age', 'Patient age in years. Risk generally rises with age.'],
  ['Sex', 'M is male, F is female. The model encodes it as 1/0.'],
  ['ChestPainType', 'Type of chest pain. TA is typical angina, ATA atypical angina, NAP non-anginal pain, ASY means no symptoms on exertion (carries higher risk).'],
  ['RestingBP', 'Resting blood pressure in mm Hg. Around 120 is normal.'],
  ['Cholesterol', 'Serum cholesterol in mg/dl. Higher values push risk up.'],
  ['FastingBS', 'Fasting blood sugar above 120 mg/dl. 1 means yes (diabetic range), 0 means no.'],
  ['RestingECG', 'Resting ECG result. Normal, ST for ST-T wave abnormality, LVH for thickened heart wall.'],
  ['MaxHR', 'Maximum heart rate reached during exercise. An unusually low max can signal trouble.'],
  ['ExerciseAngina', 'Chest pain during exercise. Y means yes, N means no.'],
  ['Oldpeak', 'ST depression during exercise in mm. Higher means worse.'],
  ['ST_Slope', 'Slope of the ST segment at peak exercise. Up is healthy, Flat is borderline, Down is worrisome.'],
];

const RI = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const normalizeDetail = (detail) => {
  if (Array.isArray(detail)) return detail.map(d => d?.msg || JSON.stringify(d)).join(' ');
  if (detail && typeof detail === 'object') return JSON.stringify(detail);
  return String(detail ?? 'Request failed.');
};

const PredictionForm = ({ selectedModel }) => {
  const [formData, setFormData] = useState({
    Age: 50, Sex: 'M', ChestPainType: 'ASY', RestingBP: 120, Cholesterol: 200,
    FastingBS: 0, RestingECG: 'Normal', MaxHR: 150, ExerciseAngina: 'N',
    Oldpeak: 0.0, ST_Slope: 'Flat'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setResult(null);
    setError(null);
  }, [selectedModel]);

  const fillRandom = () => {
    setFormData({
      Age: RI(28, 78),
      Sex: pick(['M', 'F']),
      ChestPainType: pick(['ATA', 'NAP', 'ASY', 'TA']),
      RestingBP: RI(94, 200),
      Cholesterol: RI(126, 400),
      FastingBS: pick([0, 1]),
      RestingECG: pick(['Normal', 'ST', 'LVH']),
      MaxHR: RI(90, 200),
      ExerciseAngina: pick(['N', 'Y']),
      Oldpeak: Math.round(Math.random() * 40) / 10,
      ST_Slope: pick(['Up', 'Flat', 'Down']),
    });
    setResult(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResult(null);
    setError(null);
    setFormData(prev => ({
      ...prev,
      [name]: NUMERIC_FIELDS.includes(name)
        ? (value === '' ? '' : (Number.isFinite(Number(value)) ? Number(value) : prev[name]))
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    // Validate finite numbers.
    for (const k of NUMERIC_FIELDS) {
      if (formData[k] === '' || !Number.isFinite(Number(formData[k]))) {
        setError(`Please enter a valid number for ${k}.`);
        setLoading(false);
        return;
      }
    }
    try {
      const payload = { ...formData };
      NUMERIC_FIELDS.forEach(k => { payload[k] = Number(payload[k]); });
      const response = await axios.post(
        `${API_URL}/predict?model_name=${encodeURIComponent(selectedModel)}`, payload);
      setResult(response.data);
    } catch (err) {
      setError(normalizeDetail(err.response?.data?.detail || 'Backend not reachable. If deployed, Render free tier may be waking up - retry in ~30s.'));
    } finally { setLoading(false); }
  };

  const prob = result?.probability;
  const hasProb = prob != null && Number.isFinite(prob);

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.8rem' }}>
          <div>
            <div className="card-title"><Activity size={18} aria-hidden="true" /> Single Patient Assessment</div>
            <div className="card-sub">Enter the 11 clinical features. The active model returns a risk label + confidence.</div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={fillRandom}
            title="Fill the form with random realistic values"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem', minHeight: 44, flexShrink: 0, whiteSpace: 'nowrap' }}>
            <Dices size={15} aria-hidden="true" /> Random patient
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.1rem' }} aria-live="polite">
          <span className="meta-pill">Active model: <strong>{selectedModel}</strong></span>
        </div>
        <form onSubmit={handleSubmit} aria-busy={loading}>
          <div className="grid">
            {FIELDS.map(f => (
              <div className="form-group" key={f.name}>
                <label htmlFor={f.name}>{f.label}</label>
                {f.type === 'select' ? (
                  <select id={f.name} name={f.name} value={formData[f.name]} onChange={handleChange}>
                    {f.options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ) : (
                  <input id={f.name} type={f.type} name={f.name} value={formData[f.name]} onChange={handleChange}
                    min={f.min} max={f.max} step={f.step || 'any'} required />
                )}
                {f.hint && <div className="hint">{f.hint}</div>}
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-primary btn-submit" disabled={loading}
            aria-disabled={loading}>
            {loading ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Predicting...</> : 'Predict risk'}
          </button>
        </form>

        {loading && (
          <div className="skeleton" role="status" aria-live="polite">
            <Loader2 size={20} className="animate-spin" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Scoring with {selectedModel} - preprocessing, scaling check, inference...
          </div>
        )}

        {error && (
          <div className="result-card" style={{ borderColor: 'var(--danger)' }} role="alert" aria-live="assertive">
            <AlertCircle size={32} color="var(--danger)" style={{ marginBottom: '0.5rem' }} aria-hidden="true" />
            <p style={{ color: "var(--danger-soft)" }}>{error}</p>
          </div>
        )}

        {result && (
          <div className={`result-card anim ${result.prediction === 1 ? 'result-high' : 'result-low'}`} role="status" aria-live="polite">
            {hasProb ? (
              <RiskGauge probability={prob} risk={result.risk} />
            ) : (
              <>
                {result.prediction === 1
                  ? <AlertCircle size={40} color="var(--danger)" style={{ marginBottom: '0.5rem' }} aria-hidden="true" />
                  : <CheckCircle2 size={40} color="var(--success)" style={{ marginBottom: '0.5rem' }} aria-hidden="true" />}
                <div className="result-risk" style={{ color: result.prediction === 1 ? 'var(--danger)' : 'var(--success)' }}>
                  {result.risk} Risk
                </div>
              </>
            )}
            <div className="result-meta">
              <span className="result-chip">Model <strong>{result.model}</strong></span>
              {hasProb && <span className="result-chip">Threshold <strong>0.50</strong></span>}
              <span className="result-chip">Input <strong>11 features</strong></span>
            </div>
            <div className="callout" style={{ textAlign: 'left', marginTop: '1rem' }}>
              <strong>How to read:</strong> High risk means the model thinks this patient profile resembles
              heart-disease cases in the training data. Confidence is the probability of the positive class.
              This is a research demo, not a medical diagnosis.{result.prediction === 1 && ' If it shows High risk, consider discussing the result with a clinician.'}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">What these 11 features mean</div>
        <div className="card-sub">Quick reference for viva / explanation.</div>
        <dl className="glossary">
          {FEATURE_INFO.map(([name, desc]) => (
            <div key={name}><dt>{name}</dt><dd>{desc}</dd></div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default PredictionForm;
