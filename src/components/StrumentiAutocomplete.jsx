import React, { useState, useEffect, useRef } from 'react';
import { getStrumentiByType } from '../utils/storage';
import { vibrateShort } from '../utils/feedback';

function StrumentiAutocomplete({ 
  tipo, // 'multimetro' o 'densimetro'
  value, 
  scadenza,
  onChangeId, 
  onChangeScadenza,
  placeholder = 'ID-xxxxxx'
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [strumentiSalvati, setStrumentiSalvati] = useState([]);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    loadStrumenti();
  }, [tipo]);

  useEffect(() => {
    // Chiudi suggerimenti quando si clicca fuori
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStrumenti = async () => {
    const strumenti = await getStrumentiByType(tipo);
    setStrumentiSalvati(strumenti);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value.toUpperCase();
    onChangeId(inputValue);

    // Filtra suggerimenti
    if (inputValue.length >= 2 && strumentiSalvati.length > 0) {
      const filtered = strumentiSalvati.filter(s => 
        s.idStrumento.toLowerCase().includes(inputValue.toLowerCase()) ||
        (s.nome && s.nome.toLowerCase().includes(inputValue.toLowerCase()))
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    // Mostra tutti i suggerimenti al focus se ce ne sono
    if (strumentiSalvati.length > 0) {
      setSuggestions(strumentiSalvati);
      setShowSuggestions(true);
    }
  };

  const handleSelectSuggestion = (strumento) => {
    vibrateShort();
    onChangeId(strumento.idStrumento);
    onChangeScadenza(strumento.scadenza);
    setShowSuggestions(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-header">💡 Suggerimenti:</div>
          {suggestions.map((strumento) => (
            <div
              key={strumento.id}
              className="autocomplete-item"
              onClick={() => handleSelectSuggestion(strumento)}
            >
              <span className="autocomplete-name">
                {strumento.nome || (tipo === 'multimetro' ? 'Multimetro' : 'Densimetro')}
              </span>
              <span className="autocomplete-id">({strumento.idStrumento})</span>
              <span className="autocomplete-scad">Scad: {formatDate(strumento.scadenza)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StrumentiAutocomplete;
