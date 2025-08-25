import React, { useState, useEffect } from 'react';
import './App.css';

interface Personagem {
  id: string;
  nome: string;
  classe: string;
  nivel: number;
  atributos: {
    forca: number;
    destreza: number;
    constituicao: number;
    inteligencia: number;
    sabedoria: number;
    carisma: number;
  };
  vida: number;
  mana: number;
  dataCriacao: string;
  ultimaModificacao: string;
}

const classesRPG = [
  { nome: 'Guerreiro', descricao: 'Especialista em combate corpo a corpo', cor: '#8B4513' },
  { nome: 'Mago', descricao: 'Mestre das artes arcanas', cor: '#4B0082' },
  { nome: 'Arqueiro', descricao: 'Especialista em combate à distância', cor: '#228B22' },
  { nome: 'Clérigo', descricao: 'Canalizador de poderes divinos', cor: '#FFD700' },
  { nome: 'Ladino', descricao: 'Mestre da furtividade e agilidade', cor: '#696969' },
  { nome: 'Bárbaro', descricao: 'Guerreiro selvagem e feroz', cor: '#DC143C' }
];

// Funções do banco de dados
const DB_KEY = 'rpg_personagens';

const salvarPersonagem = (personagem: Personagem): void => {
  const personagens = carregarPersonagens();
  const index = personagens.findIndex(p => p.id === personagem.id);
  
  if (index >= 0) {
    personagens[index] = { ...personagem, ultimaModificacao: new Date().toISOString() };
  } else {
    personagens.push({ ...personagem, dataCriacao: new Date().toISOString(), ultimaModificacao: new Date().toISOString() });
  }
  
  localStorage.setItem(DB_KEY, JSON.stringify(personagens));
};

const carregarPersonagens = (): Personagem[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

const deletarPersonagem = (id: string): void => {
  const personagens = carregarPersonagens();
  const personagensFiltrados = personagens.filter(p => p.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(personagensFiltrados));
};

const gerarId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

function Header() {
  return (
    <div className="header">
      <div className="header-content">
        <h1>🎲 RPG Character Creator</h1>
        <p>Forje seu herói e embarque em aventuras épicas!</p>
        <div className="header-decoration">
          <span>⚔️</span>
          <span>🛡️</span>
          <span>🔮</span>
        </div>
      </div>
    </div>
  );
}

function ListaPersonagens({ personagens, onSelecionar, onEditar, onDeletar }: {
  personagens: Personagem[];
  onSelecionar: (personagem: Personagem) => void;
  onEditar: (personagem: Personagem) => void;
  onDeletar: (id: string) => void;
}) {
  const [confirmarDeletar, setConfirmarDeletar] = useState<string | null>(null);

  const handleDeletar = (id: string) => {
    if (confirmarDeletar === id) {
      onDeletar(id);
      setConfirmarDeletar(null);
    } else {
      setConfirmarDeletar(id);
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="lista-personagens">
      <h2>🎭 Seus Personagens</h2>
      
      {personagens.length === 0 ? (
        <div className="sem-personagens">
          <p>Nenhum personagem criado ainda.</p>
          <p>Crie seu primeiro herói para começar a aventura!</p>
        </div>
      ) : (
        <div className="personagens-grid">
          {personagens.map(personagem => {
            const classeInfo = classesRPG.find(c => c.nome === personagem.classe);
            return (
              <div key={personagem.id} className="personagem-card">
                <div className="personagem-header" style={{ borderColor: classeInfo?.cor }}>
                  <h3>{personagem.nome}</h3>
                  <span className="classe-badge" style={{ backgroundColor: classeInfo?.cor }}>
                    {personagem.classe} - Nível {personagem.nivel}
                  </span>
                </div>
                
                <div className="personagem-stats">
                  <div className="stat">
                    <span>❤️ {personagem.vida}</span>
                  </div>
                  <div className="stat">
                    <span>🔮 {personagem.mana}</span>
                  </div>
                  <div className="stat">
                    <span>⚔️ {personagem.atributos.forca}</span>
                  </div>
                </div>
                
                <div className="personagem-dates">
                  <small>Criado em: {formatarData(personagem.dataCriacao)}</small>
                  <small>Modificado: {formatarData(personagem.ultimaModificacao)}</small>
                </div>
                
                <div className="personagem-acoes">
                  <button 
                    onClick={() => onSelecionar(personagem)}
                    className="btn-ver"
                  >
                    👁️ Ver
                  </button>
                  <button 
                    onClick={() => onEditar(personagem)}
                    className="btn-editar"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => handleDeletar(personagem.id)}
                    className={`btn-deletar ${confirmarDeletar === personagem.id ? 'confirmar' : ''}`}
                  >
                    {confirmarDeletar === personagem.id ? '🗑️ Confirmar' : '🗑️ Deletar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CriadorPersonagem({ onPersonagemCriado, personagemEditando }: { 
  onPersonagemCriado: (personagem: Personagem) => void;
  personagemEditando?: Personagem;
}) {
  const [etapa, setEtapa] = useState(1);
  const [personagem, setPersonagem] = useState<Personagem>(personagemEditando || {
    id: gerarId(),
    nome: '',
    classe: '',
    nivel: 1,
    atributos: {
      forca: 10,
      destreza: 10,
      constituicao: 10,
      inteligencia: 10,
      sabedoria: 10,
      carisma: 10
    },
    vida: 20,
    mana: 10,
    dataCriacao: '',
    ultimaModificacao: ''
  });

  const pontosDisponiveis = 20 - Object.values(personagem.atributos).reduce((sum, val) => sum + val, 0) + 60;

  const atualizarAtributo = (atributo: keyof Personagem['atributos'], valor: number) => {
    if (valor >= 3 && valor <= 18) {
      setPersonagem(prev => ({
        ...prev,
        atributos: {
          ...prev.atributos,
          [atributo]: valor
        }
      }));
    }
  };

  const selecionarClasse = (classe: string) => {
    setPersonagem(prev => ({ ...prev, classe }));
    setEtapa(3);
  };

  const finalizarCriacao = () => {
    const classeSelecionada = classesRPG.find(c => c.nome === personagem.classe);
    const vidaBase = classeSelecionada?.nome === 'Guerreiro' || classeSelecionada?.nome === 'Bárbaro' ? 30 : 20;
    const manaBase = classeSelecionada?.nome === 'Mago' || classeSelecionada?.nome === 'Clérigo' ? 30 : 10;
    
    const personagemFinal = {
      ...personagem,
      vida: vidaBase + Math.floor(personagem.atributos.constituicao / 2),
      mana: manaBase + Math.floor(personagem.atributos.inteligencia / 2)
    };
    
    onPersonagemCriado(personagemFinal);
  };

  return (
    <div className="criador-personagem">
      <div className="progress-bar">
        <div className={`progress-step ${etapa >= 1 ? 'active' : ''}`}>1. Nome</div>
        <div className={`progress-step ${etapa >= 2 ? 'active' : ''}`}>2. Classe</div>
        <div className={`progress-step ${etapa >= 3 ? 'active' : ''}`}>3. Atributos</div>
      </div>

      {etapa === 1 && (
        <div className="etapa">
          <h2>🎯 Nome do Herói</h2>
          <input
            type="text"
            placeholder="Digite o nome do seu personagem..."
            value={personagem.nome}
            onChange={(e) => setPersonagem(prev => ({ ...prev, nome: e.target.value }))}
            className="nome-input"
          />
          <button 
            onClick={() => setEtapa(2)}
            disabled={!personagem.nome.trim()}
            className="btn-next"
          >
            Próximo →
          </button>
        </div>
      )}

      {etapa === 2 && (
        <div className="etapa">
          <h2>⚔️ Escolha sua Classe</h2>
          <div className="classes-grid">
            {classesRPG.map(classe => (
              <div
                key={classe.nome}
                className="classe-card"
                onClick={() => selecionarClasse(classe.nome)}
                style={{ borderColor: classe.cor }}
              >
                <h3>{classe.nome}</h3>
                <p>{classe.descricao}</p>
                <div className="classe-icon" style={{ backgroundColor: classe.cor }}>
                  {classe.nome === 'Guerreiro' && '⚔️'}
                  {classe.nome === 'Mago' && '🔮'}
                  {classe.nome === 'Arqueiro' && '🏹'}
                  {classe.nome === 'Clérigo' && '⛪'}
                  {classe.nome === 'Ladino' && '🗡️'}
                  {classe.nome === 'Bárbaro' && '🪓'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {etapa === 3 && (
        <div className="etapa">
          <h2>📊 Distribua seus Atributos</h2>
          <p className="pontos-info">Pontos disponíveis: <span className="pontos">{pontosDisponiveis}</span></p>
          
          <div className="atributos-grid">
            {Object.entries(personagem.atributos).map(([atributo, valor]) => (
              <div key={atributo} className="atributo-item">
                <label>{atributo.charAt(0).toUpperCase() + atributo.slice(1)}</label>
                <div className="atributo-controles">
                  <button 
                    onClick={() => atualizarAtributo(atributo as keyof Personagem['atributos'], valor - 1)}
                    disabled={valor <= 3 || pontosDisponiveis <= 0}
                    className="btn-atributo"
                  >
                    -
                  </button>
                  <span className="valor-atributo">{valor}</span>
                  <button 
                    onClick={() => atualizarAtributo(atributo as keyof Personagem['atributos'], valor + 1)}
                    disabled={valor >= 18 || pontosDisponiveis <= 0}
                    className="btn-atributo"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="botoes-finais">
            <button onClick={() => setEtapa(2)} className="btn-back">
              ← Voltar
            </button>
            <button 
              onClick={finalizarCriacao}
              disabled={pontosDisponiveis !== 0}
              className="btn-finalizar"
            >
              {personagemEditando ? '💾 Salvar Alterações' : '🎉 Criar Personagem!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FichaPersonagem({ personagem, onVoltar }: { personagem: Personagem; onVoltar: () => void }) {
  const classeInfo = classesRPG.find(c => c.nome === personagem.classe);

  return (
    <div className="ficha-personagem">
      <div className="ficha-header">
        <h2>🎭 Ficha do Personagem</h2>
        <button onClick={onVoltar} className="btn-voltar">← Voltar</button>
      </div>

      <div className="ficha-content">
        <div className="info-principal">
          <div className="nome-classe">
            <h1>{personagem.nome}</h1>
            <span className="classe-badge" style={{ backgroundColor: classeInfo?.cor }}>
              {personagem.classe} - Nível {personagem.nivel}
            </span>
          </div>
          
          <div className="vida-mana">
            <div className="barra-vida">
              <span>❤️ Vida: {personagem.vida}</span>
              <div className="barra" style={{ width: '100%', backgroundColor: '#ff4444' }}></div>
            </div>
            <div className="barra-mana">
              <span>🔮 Mana: {personagem.mana}</span>
              <div className="barra" style={{ width: '100%', backgroundColor: '#4444ff' }}></div>
            </div>
          </div>
        </div>

        <div className="atributos-ficha">
          <h3>📊 Atributos</h3>
          <div className="atributos-grid-ficha">
            {Object.entries(personagem.atributos).map(([atributo, valor]) => (
              <div key={atributo} className="atributo-ficha">
                <span className="atributo-nome">{atributo.charAt(0).toUpperCase() + atributo.slice(1)}</span>
                <span className="atributo-valor">{valor}</span>
                <span className="atributo-mod">({valor >= 10 ? '+' : ''}{Math.floor((valor - 10) / 2)})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="acoes">
          <button className="btn-acao">⚔️ Atacar</button>
          <button className="btn-acao">🛡️ Defender</button>
          <button className="btn-acao">🔮 Conjurar</button>
          <button className="btn-acao">🏃 Fugir</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [personagens, setPersonagens] = useState<Personagem[]>([]);
  const [personagemCriado, setPersonagemCriado] = useState<Personagem | null>(null);
  const [mostrarCriador, setMostrarCriador] = useState(false);
  const [personagemEditando, setPersonagemEditando] = useState<Personagem | null>(null);

  // Carregar personagens do localStorage na inicialização
  useEffect(() => {
    setPersonagens(carregarPersonagens());
  }, []);

  const handlePersonagemCriado = (personagem: Personagem) => {
    salvarPersonagem(personagem);
    setPersonagens(carregarPersonagens());
    setPersonagemCriado(personagem);
    setMostrarCriador(false);
    setPersonagemEditando(null);
  };

  const handleEditarPersonagem = (personagem: Personagem) => {
    setPersonagemEditando(personagem);
    setMostrarCriador(true);
  };

  const handleDeletarPersonagem = (id: string) => {
    deletarPersonagem(id);
    setPersonagens(carregarPersonagens());
  };

  const voltarAoInicio = () => {
    setPersonagemCriado(null);
    setMostrarCriador(false);
    setPersonagemEditando(null);
  };

  if (personagemCriado) {
    return <FichaPersonagem personagem={personagemCriado} onVoltar={voltarAoInicio} />;
  }

  return (
    <div className="app">
      <Header />
      
      {!mostrarCriador ? (
        <div className="main-content">
          <div className="welcome-section">
            <h2>🚀 Bem-vindo ao seu RPG!</h2>
            <p>Crie personagens únicos e embarque em aventuras épicas</p>
            
            <div className="features">
              <div className="feature">
                <span>⚔️</span>
                <h3>6 Classes Únicas</h3>
                <p>Guerreiro, Mago, Arqueiro, Clérigo, Ladino e Bárbaro</p>
              </div>
              <div className="feature">
                <span>📊</span>
                <h3>Sistema de Atributos</h3>
                <p>Distribua pontos entre Força, Destreza, Constituição e mais</p>
              </div>
              <div className="feature">
                <span>💾</span>
                <h3>Salvamento Local</h3>
                <p>Seus personagens ficam salvos no navegador</p>
              </div>
            </div>

            <button 
              onClick={() => setMostrarCriador(true)}
              className="btn-criar"
            >
              🎲 Criar Novo Personagem
            </button>
          </div>

          {personagens.length > 0 && (
            <ListaPersonagens 
              personagens={personagens}
              onSelecionar={setPersonagemCriado}
              onEditar={handleEditarPersonagem}
              onDeletar={handleDeletarPersonagem}
            />
          )}
        </div>
      ) : (
        <CriadorPersonagem 
          onPersonagemCriado={handlePersonagemCriado}
          personagemEditando={personagemEditando || undefined}
        />
      )}
    </div>
  );
}

export default App;

