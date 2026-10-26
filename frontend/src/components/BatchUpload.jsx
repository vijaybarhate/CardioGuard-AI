import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet, X, Users, AlertTriangle } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const REQUIRED_COLS = ['Age', 'Sex', 'ChestPainType', 'RestingBP', 'Cholesterol', 'FastingBS', 'RestingECG', 'MaxHR', 'ExerciseAngina', 'Oldpeak', 'ST_Slope'];
const LIMITS = { 'Age': [1, 120], 'RestingBP': [60, 250], 'Cholesterol': [80, 600], 'MaxHR': [50, 220], 'Oldpeak': [-5, 10] };

const normalizeDetail = (detail) => {
  if (Array.isArray(detail)) return detail.map(d => d?.msg || JSON.stringify(d)).join(' ');
  if (detail && typeof detail === 'object') return JSON.stringify(detail);
  return String(detail ?? 'Request failed.');
};

const BatchUpload = ({ selectedModel }) => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setResults(null);
    setError(null);
  }, [selectedModel]);
  const inputRef = useRef(null);

  const setChosenFile = (f) => {
    if (!f) return;
    const ok = f.type === 'text/csv' || /\.csv$/i.test(f.name || '');
    if (ok) { setFile(f); setError(null); setResults(null); }
    else { setError('Please upload a valid CSV file.'); setFile(null); }
  };

  const handleFileChange = (e) => {
    setChosenFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setChosenFile(e.dataTransfer?.files?.[0]);
  };

  const loadSample = async () => {
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await fetch('/sample_patients.csv');
      if (!res.ok) throw new Error('sample not found');
      const blob = await res.blob();
      const f = new File([blob], 'sample_patients.csv', { type: 'text/csv' });
      setFile(f);
    } catch (e) {
      setError('Could not load sample file.');
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setLoading(true); setError(null); setResults(null);
    const reader = new FileReader();
    reader.onerror = () => { setError('Could not read the file.'); setLoading(false); };
    reader.onload = async (e) => {
      try {
        const text = String(e.target.result || '').replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
        if (lines.length < 2) { setError('CSV file is empty or missing data.'); setLoading(false); return; }
        const headers = lines[0].split(',').map(h => h.trim());
        const missing = REQUIRED_COLS.filter(h => !headers.includes(h));
        if (missing.length > 0) { setError(`Missing required columns: ${missing.join(', ')}`); setLoading(false); return; }

        // Validate all rows (cap at 2000 to avoid huge uploads).
        const MAX_ROWS = 2000;
        if (lines.length - 1 > MAX_ROWS) { setError(`Too many rows (max ${MAX_ROWS}).`); setLoading(false); return; }

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length !== headers.length) {
            setError(`Row ${i} has ${values.length} columns, expected ${headers.length}.`);
            setLoading(false); return;
          }
          const row = {};
          headers.forEach((h, idx) => { row[h] = values[idx]; });
          for (const [col, lim] of Object.entries(LIMITS)) {
            const val = parseFloat(row[col]);
            if (isNaN(val) || val < lim[0] || val > lim[1]) {
              setError(`Validation Error: ${col} in Row ${i} is ${row[col]}. Must be between ${lim[0]}-${lim[1]}.`);
              setLoading(false); return;
            }
          }
        }

        const formData = new FormData();
        formData.append('file', file);
        // Let the browser set the multipart boundary - do NOT set Content-Type manually.
        const response = await axios.post(
          `${API_URL}/predict/batch?model_name=${encodeURIComponent(selectedModel)}`,
          formData);
        setResults(response.data);
      } catch (err) {
        setError(normalizeDetail(err.response?.data?.detail || 'Upload failed. If deployed, backend may be waking up - retry in ~30s.'));
      } finally { setLoading(false); }
    };
    reader.readAsText(file);
  };

  const resultList = results?.results ?? [];

  return (
    <div>
      <div className="card">
        <div className="card-title"><Upload size={18} aria-hidden="true" /> Batch Analysis (CSV)</div>
        <div className="card-sub">
          Upload a CSV with columns: Age, Sex, ChestPainType, RestingBP, Cholesterol, FastingBS, RestingECG, MaxHR, ExerciseAngina, Oldpeak, ST_Slope.
          Backend validates, imputes missing values, scales (for SVM/LR) and predicts for all rows.
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.1rem' }} aria-live="polite">
          <span className="meta-pill">Active model: <strong>{selectedModel}</strong></span>
        </div>

        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <strong style={{ fontSize: '0.9rem' }}>Sample CSV (try it)</strong>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', minHeight: 36, fontSize: '0.82rem' }}
                href="/sample_patients.csv" download="sample_patients.csv">Download</a>
              <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', minHeight: 36, fontSize: '0.82rem' }}
                onClick={loadSample} disabled={loading}>Use sample</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table style={{ fontSize: '0.78rem', minWidth: '720px' }}>
              <thead><tr>
                {['Age','Sex','ChestPainType','RestingBP','Cholesterol','MaxHR','Oldpeak','ST_Slope'].map(c => <th key={c} scope="col">{c}</th>)}
              </tr></thead>
              <tbody>
                <tr>{['40','M','ATA','140','289','172','0','Up'].map((v,i)=><td key={i}>{v}</td>)}</tr>
                <tr>{['49','F','NAP','160','180','156','1','Flat'].map((v,i)=><td key={i}>{v}</td>)}</tr>
                <tr>{['37','M','ATA','130','283','98','0','Up'].map((v,i)=><td key={i}>{v}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-mute)', marginTop: '0.5rem' }}>
            Showing 8 of 11 columns. Download it and drop it below - or click Use sample to run it instantly.
          </p>
        </div>

        {!results ? (
          <>
            <div className={`batch-drop${dragging ? ' dragging' : ''}`} role="button" tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={handleKeyDown}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              aria-label="Upload CSV file - click to browse or drag and drop">
              <input ref={inputRef} type="file" id="csvInput" hidden accept=".csv,text/csv"
                onChange={handleFileChange} />
              <Upload size={44} color="var(--accent)" style={{ marginBottom: '1rem' }} aria-hidden="true" />
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: '0.4rem' }}>
                {file ? file.name : 'Drop CSV file here'}
              </h3>
              <p style={{ color: 'var(--text-mute)', fontSize: '0.85rem' }}>
                Drag and drop, or click / press Enter to browse - must be .csv
              </p>
            </div>
            {file && (
              <div className="file-chip">
                <FileSpreadsheet size={18} color="var(--accent)" aria-hidden="true" />
                <span className="file-name">{file.name}</span>
                <span className="file-size">{file.size != null ? `${(file.size / 1024).toFixed(1)} KB` : ''}</span>
                <button className="file-remove" onClick={() => { setFile(null); setResults(null); setError(null); }}
                  aria-label="Remove selected file"><X size={15} /></button>
              </div>
            )}
            {file && (
              <button className="btn btn-primary btn-submit" onClick={handleUpload} disabled={loading}
                aria-disabled={loading}>
                {loading ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Processing...</> : 'Start Analysis'}
              </button>
            )}
            {loading && !file && (
              <div className="skeleton" role="status">Loading sample file...</div>
            )}
          </>
        ) : (
          <div className="anim">
            <div className="batch-stats">
              <div className="stat">
                <div className="label"><Users size={12} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} />Total Patients</div>
                <div className="value" style={{ color: 'var(--accent)' }}>{results.total_patients ?? resultList.length}</div>
              </div>
              <div className="stat">
                <div className="label"><AlertTriangle size={12} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} />High Risk</div>
                <div className="value" style={{ color: 'var(--danger)' }}>{results.high_risk_count ?? 0}</div>
              </div>
              <div className="stat">
                <div className="label"><CheckCircle2 size={12} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} />Low Risk</div>
                <div className="value" style={{ color: 'var(--success)' }}>
                  {(results.total_patients ?? resultList.length) - (results.high_risk_count ?? 0)}
                </div>
              </div>
            </div>
            <div className="table-wrap table-sticky" style={{ maxHeight: '420px', overflow: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <table>
                <caption className="sr-only">Batch prediction results</caption>
                <thead>
                  <tr>
                    <th scope="col">Patient #</th>
                    <th scope="col">Risk Level</th>
                    <th scope="col">Confidence</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resultList.map((res, idx) => (
                    <tr key={`${res.patient_index}-${idx}`}>
                      <td>Patient {res.patient_index + 1}</td>
                      <td><span className={`pill ${res.prediction === 1 ? 'pill-high' : 'pill-low'}`}>{res.risk}</span></td>
                      <td>{res.probability != null ? `${(res.probability * 100).toFixed(1)}%` : 'N/A'}</td>
                      <td>{res.prediction === 1
                        ? <AlertCircle size={16} color="var(--danger)" aria-label="high risk" />
                        : <CheckCircle2 size={16} color="var(--success)" aria-label="low risk" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={() => setResults(null)}>
              Analyze another file
            </button>
          </div>
        )}
        {error && (
          <div className="result-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginTop: '1rem' }} role="alert" aria-live="assertive">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchUpload;
