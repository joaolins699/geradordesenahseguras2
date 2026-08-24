// ============================================================
//  CONFIGURAÇÕES
// ============================================================

const CHARACTER_SETS = {
    emoji: ['😀', '😎', '🚀', '🔒', '💎', '🔥', '🌟', '🍀', '👾', '🎨', '🦁', '🦊', '🌈', '⭐', '🎯', '🏆'],
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
    symbol: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
};

const AMBIGUOUS_CHARS = 'il1Lo0O';

// ============================================================
//  DOM REFERÊNCIAS
// ============================================================

const elements = {
    passwordDisplay: document.getElementById('passwordOutput'),
    lengthSlider: document.getElementById('lengthSlider'),
    lengthDisplay: document.getElementById('lengthDisplay'),
    generateBtn: document.getElementById('generateBtn'),
    copyBtn: document.getElementById('copyBtn'),
    progressBar: document.getElementById('progressBar'),
    strengthText: document.getElementById('strengthText'),
    toggleBtns: document.querySelectorAll('.toggle-btn[data-option]'),
};

// ============================================================
//  ESTADO
// ============================================================

let state = {
    length: 12,
    options: {
        emoji: true,
        upper: true,
        lower: true,
        number: true,
        symbol: true,
        exclude: false,
    },
};

// ============================================================
//  INICIALIZAÇÃO
// ============================================================

function init() {
    // Sincroniza UI com estado inicial
    elements.lengthDisplay.textContent = state.length;
    elements.lengthSlider.value = state.length;

    // Atualiza os toggles
    elements.toggleBtns.forEach((btn) => {
        const option = btn.dataset.option;
        if (state.options[option]) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Event Listeners
    elements.lengthSlider.addEventListener('input', handleLengthChange);
    elements.generateBtn.addEventListener('click', generatePassword);
    elements.copyBtn.addEventListener('click', copyPassword);

    elements.toggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => handleToggle(btn));
    });

    // Gera uma senha inicial
    generatePassword();
}

// ============================================================
//  HANDLERS
// ============================================================

function handleLengthChange(e) {
    const value = parseInt(e.target.value, 10);
    state.length = value;
    elements.lengthDisplay.textContent = value;
    generatePassword();
}

function handleToggle(btn) {
    const option = btn.dataset.option;
    state.options[option] = !state.options[option];
    btn.classList.toggle('active');
    generatePassword();
}

// ============================================================
//  GERADOR DE SENHA
// ============================================================

function generatePassword() {
    const { length, options } = state;

    // Verifica se pelo menos uma opção está ativa
    const hasAnyOption = Object.values(options).some((v) => v === true);
    if (!hasAnyOption) {
        elements.passwordDisplay.innerHTML = '<span class="placeholder">Selecione pelo menos uma opção!</span>';
        updateStrength(0, 0);
        return;
    }

    // Constrói o pool de caracteres
    let pool = '';
    let usedTypes = [];

    if (options.emoji) {
        pool += CHARACTER_SETS.emoji.join('');
        usedTypes.push('emoji');
    }
    if (options.upper) {
        pool += CHARACTER_SETS.upper;
        usedTypes.push('upper');
    }
    if (options.lower) {
        pool += CHARACTER_SETS.lower;
        usedTypes.push('lower');
    }
    if (options.number) {
        pool += CHARACTER_SETS.number;
        usedTypes.push('number');
    }
    if (options.symbol) {
        pool += CHARACTER_SETS.symbol;
        usedTypes.push('symbol');
    }

    // Remove caracteres ambíguos se ativado
    let finalPool = pool;
    if (options.exclude) {
        const removeSet = new Set(AMBIGUOUS_CHARS);
        finalPool = [...pool].filter((ch) => !removeSet.has(ch)).join('');
    }

    // Se o pool ficou vazio após remoção de ambíguos, usa o pool original
    if (finalPool.length === 0) {
        finalPool = pool;
    }

    // Gera a senha
    let password = '';
    const poolArray = [...finalPool];

    // Garante pelo menos um caractere de cada tipo selecionado
    const guaranteedChars = [];
    if (options.upper && !options.exclude) {
        guaranteedChars.push(getRandomChar(CHARACTER_SETS.upper));
    }
    if (options.lower && !options.exclude) {
        guaranteedChars.push(getRandomChar(CHARACTER_SETS.lower));
    }
    if (options.number && !options.exclude) {
        guaranteedChars.push(getRandomChar(CHARACTER_SETS.number));
    }
    if (options.symbol && !options.exclude) {
        guaranteedChars.push(getRandomChar(CHARACTER_SETS.symbol));
    }
    if (options.emoji) {
        guaranteedChars.push(getRandomChar(CHARACTER_SETS.emoji));
    }

    // Se temos caracteres garantidos, coloca eles no início
    let passwordArray = [...guaranteedChars];

    // Preenche o resto
    while (passwordArray.length < length) {
        passwordArray.push(getRandomChar(poolArray));
    }

    // Embaralha
    shuffleArray(passwordArray);

    password = passwordArray.join('');

    // Exibe
    elements.passwordDisplay.innerHTML = password;

    // Atualiza força
    updateStrength(password.length, usedTypes.length);
}

// ============================================================
//  UTILITÁRIOS
// ============================================================

function getRandomChar(array) {
    if (!array || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ============================================================
//  AVALIADOR DE FORÇA
// ============================================================

function updateStrength(length, typesCount) {
    const { progressBar, strengthText } = elements;

    if (length === 0 || typesCount === 0) {
        progressBar.style.width = '0%';
        progressBar.style.backgroundColor = '#dce4ef';
        strengthText.textContent = '—';
        strengthText.style.color = '#7a8da6';
        return;
    }

    // Pontuação: comprimento + variedade
    let score = length * 2 + typesCount * 15;

    // Bônus se tiver mais de 3 tipos
    if (typesCount >= 4) score += 10;
    if (typesCount >= 5) score += 10;

    // Bônus por comprimento
    if (length >= 20) score += 10;
    if (length >= 28) score += 10;

    if (score < 30) {
        progressBar.style.width = '30%';
        progressBar.style.backgroundColor = '#ef4444';
        strengthText.textContent = '🔴 Fraca';
        strengthText.style.color = '#ef4444';
    } else if (score >= 30 && score < 55) {
        progressBar.style.width = '60%';
        progressBar.style.backgroundColor = '#f59e0b';
        strengthText.textContent = '🟡 Média';
        strengthText.style.color = '#f59e0b';
    } else if (score >= 55 && score < 80) {
        progressBar.style.width = '85%';
        progressBar.style.backgroundColor = '#3b82f6';
        strengthText.textContent = '🔵 Forte';
        strengthText.style.color = '#3b82f6';
    } else {
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = '#10b981';
        strengthText.textContent = '🟢 Muito Forte!';
        strengthText.style.color = '#10b981';
    }
}

// ============================================================
//  COPIAR SENHA
// ============================================================

function copyPassword() {
    const display = elements.passwordDisplay;
    const text = display.textContent;

    if (!text || text === 'Selecione pelo menos uma opção!' || text === 'Clique em "Gerar"') {
        showToast('⚠️ Gere uma senha primeiro!', '#f59e0b');
        return;
    }

    navigator.clipboard
        .writeText(text)
        .then(() => {
            showToast('✅ Senha copiada!', '#10b981');
        })
        .catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('✅ Senha copiada!', '#10b981');
        });
}

// ============================================================
//  TOAST (notificação simples)
// ============================================================

function showToast(message, color = '#10b981') {
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: color,
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '0.95rem',
        fontWeight: '600',
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        zIndex: '9999',
        opacity: '0',
        transition: 'opacity 0.3s, transform 0.3s',
        fontFamily: "'Segoe UI', sans-serif",
        maxWidth: '90%',
        textAlign: 'center',
    });

    document.body.appendChild(toast);

    // Anima entrada
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Remove após 2.5s
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// ============================================================
//  INICIA O APP
// ============================================================

document.addEventListener('DOMContentLoaded', init);
