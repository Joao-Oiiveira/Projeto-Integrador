import React from 'react';

const TextSpacingControls = ({ configuracoes, onChange, className = '' }) => {
  const configs = {
    espacamento_linhas: configuracoes?.espacamento_linhas || 'padrao',
    espacamento_letras: configuracoes?.espacamento_letras || 'padrao',
    espacamento_palavras: configuracoes?.espacamento_palavras || 'padrao',
  };

  const calcularPreset = () => {
    const { espacamento_linhas, espacamento_letras, espacamento_palavras } = configs;
    if (espacamento_linhas === 'ampliado' && espacamento_letras === 'ampliado' && espacamento_palavras === 'ampliado') {
      return 'ampliado';
    }
    if (espacamento_linhas === 'moderado' && espacamento_letras === 'moderado' && espacamento_palavras === 'moderado') {
      return 'moderado';
    }
    if (
      (!espacamento_linhas || espacamento_linhas === 'padrao') &&
      (!espacamento_letras || espacamento_letras === 'padrao') &&
      (!espacamento_palavras || espacamento_palavras === 'padrao')
    ) {
      return 'padrao';
    }
    return 'personalizado';
  };

  const handlePresetChange = (preset) => {
    if (preset === 'padrao') {
      onChange({
        espacamento_linhas: 'padrao',
        espacamento_letras: 'padrao',
        espacamento_palavras: 'padrao',
      });
    } else if (preset === 'moderado') {
      onChange({
        espacamento_linhas: 'moderado',
        espacamento_letras: 'moderado',
        espacamento_palavras: 'moderado',
      });
    } else if (preset === 'ampliado') {
      onChange({
        espacamento_linhas: 'ampliado',
        espacamento_letras: 'ampliado',
        espacamento_palavras: 'ampliado',
      });
    }
  };

  const lineHeightsMap = {
    padrao: 'normal',
    moderado: '1.8',
    ampliado: '2.2',
  };

  const letterSpacingsMap = {
    padrao: 'normal',
    moderado: '0.08em',
    ampliado: '0.16em',
  };

  const wordSpacingsMap = {
    padrao: 'normal',
    moderado: '0.16em',
    ampliado: '0.32em',
  };

  const currentLineHeight = lineHeightsMap[configs.espacamento_linhas] || 'normal';
  const currentLetterSpacing = letterSpacingsMap[configs.espacamento_letras] || 'normal';
  const currentWordSpacing = wordSpacingsMap[configs.espacamento_palavras] || 'normal';

  return (
    <div className={`flex flex-col gap-3.5 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/60 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 dark:border-gray-700/60 pb-2.5">
        <div>
          <label htmlFor="espacamento_preset" className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Espaçamento de Texto
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Ajuste o espaço entre linhas, letras e palavras para melhorar a legibilidade.
          </p>
        </div>

        {/* Seletor rápido de predefinição */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:inline">Predefinição:</span>
          <select
            id="espacamento_preset"
            className="text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none cursor-pointer shadow-sm font-medium"
            value={calcularPreset()}
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            <option value="padrao">Padrão</option>
            <option value="moderado">Moderado</option>
            <option value="ampliado">Ampliado</option>
            {calcularPreset() === 'personalizado' && (
              <option value="personalizado" disabled>Personalizado</option>
            )}
          </select>
        </div>
      </div>

      {/* Grid com os 3 seletores detalhados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Entre Linhas */}
        <div className="flex flex-col gap-1">
          <label htmlFor="espacamento_linhas" className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Entre Linhas
          </label>
          <select
            id="espacamento_linhas"
            className="text-xs sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none cursor-pointer shadow-sm"
            value={configs.espacamento_linhas}
            onChange={(e) => onChange({ espacamento_linhas: e.target.value })}
          >
            <option value="padrao">Padrão (Normal)</option>
            <option value="moderado">Moderado (1.8x)</option>
            <option value="ampliado">Ampliado (2.2x)</option>
          </select>
        </div>

        {/* Entre Letras */}
        <div className="flex flex-col gap-1">
          <label htmlFor="espacamento_letras" className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Entre Letras
          </label>
          <select
            id="espacamento_letras"
            className="text-xs sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none cursor-pointer shadow-sm"
            value={configs.espacamento_letras}
            onChange={(e) => onChange({ espacamento_letras: e.target.value })}
          >
            <option value="padrao">Padrão (Normal)</option>
            <option value="moderado">Moderado (+0.08em)</option>
            <option value="ampliado">Ampliado (+0.16em)</option>
          </select>
        </div>

        {/* Entre Palavras */}
        <div className="flex flex-col gap-1">
          <label htmlFor="espacamento_palavras" className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Entre Palavras
          </label>
          <select
            id="espacamento_palavras"
            className="text-xs sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none cursor-pointer shadow-sm"
            value={configs.espacamento_palavras}
            onChange={(e) => onChange({ espacamento_palavras: e.target.value })}
          >
            <option value="padrao">Padrão (Normal)</option>
            <option value="moderado">Moderado (+0.16em)</option>
            <option value="ampliado">Ampliado (+0.32em)</option>
          </select>
        </div>
      </div>

      {/* Caixa de Pré-visualização ao vivo */}
      <div
        className="p-3 bg-white dark:bg-gray-900/90 rounded-lg border border-purple-100 dark:border-purple-900/40 text-xs text-gray-700 dark:text-gray-300 transition-all shadow-inner"
        style={{
          lineHeight: currentLineHeight,
          letterSpacing: currentLetterSpacing,
          wordSpacing: currentWordSpacing,
        }}
      >
        <span className="font-semibold text-purple-600 dark:text-purple-400 block mb-0.5 text-[11px] tracking-normal">
          Prévia do espaçamento:
        </span>
        O EduAcess adapta o espaçamento do texto para tornar seu aprendizado muito mais confortável e acessível.
      </div>
    </div>
  );
};

export default TextSpacingControls;
