export function generateRandomText(size = 300) {
  const subjects = [
    "O aluno", "A professora", "O computador", "A turma", "O sistema",
    "A escola", "O teclado", "A internet", "O projeto", "O desenvolvedor",
    "O servidor", "A equipe", "O coordenador", "A biblioteca", "O laboratório",
    "O dispositivo", "O aplicativo", "O site", "O conteúdo", "O material",
    "O pesquisador", "O técnico", "A diretoria", "O tablet", "O notebook",
    "O monitor", "O processador", "A rede", "O roteador", "O cabo",
    "O arquivo", "O aluno iniciante", "A turma avançada", "O programador",
    "O analista", "O engenheiro de software", "O instrutor", "A plataforma",
    "O sistema operacional", "O navegador", "O banco de dados",
    "O ambiente virtual", "O painel de controle", "A documentação",
    "O módulo de ensino", "A atividade", "A explicação", "A aula prática",
    "O exemplo", "A simulação", "O script", "O código-fonte",
    "O comando", "A função", "O algoritmo", "A lógica", "A variável",
    "O usuário", "A comunidade", "O painel administrativo",
    "O ambiente educativo", "O conteúdo didático", "O estudante dedicado",
    "O professor assistente", "A coordenação pedagógica",
    "O manual técnico", "A plataforma digital", "O ambiente colaborativo",
    "A sala de informática", "O sistema inteligente", "O componente eletrônico",
    "A ferramenta de edição", "O software educativo",
    "O painel interativo", "A atividade avaliativa",
    "O ambiente integrado", "O módulo digital", "O instrutor convidado",
    "O aluno veterano", "A máquina virtual", "O assistente virtual",
    "O console de comandos", "A interface gráfica",
    "O ambiente de testes", "O compilador", "O terminal",
    "O estudante curioso", "A plataforma de aprendizagem",
    "O ambiente remoto", "O repositório", "O servidor remoto",
    "O ambiente seguro", "O script automatizado", "O estudante avançado",
    "O painel de métricas", "O professor especialista",
    "O coordenador técnico", "A equipe de suporte",
    "O documento digital", "A nuvem de dados", "O backup automático",
    "O relatório de desempenho"
  ];

  const verbs = [
    "analisa", "cria", "aprende", "desenvolve", "executa",
    "utiliza", "organiza", "compartilha", "explica", "aprimora",
    "carrega", "processa", "armazenha", "transforma", "conecta",
    "integra", "otimiza", "configura", "personaliza", "testa",
    "consulta", "calcula", "simula", "classifica", "compara",
    "valida", "revisa", "corrige", "estrutura", "compila",
    "salva", "executa novamente", "produz", "modifica",
    "adiciona", "remove", "gera relatórios", "organiza dados",
    "sincroniza", "instala", "atualiza", "monitora",
    "depura", "implementa", "prototipa", "constrói",
    "documenta", "planeja", "instrui", "orienta",
    "reconstrói", "classifica registros", "exibe informações",
    "filtra resultados", "padroniza processos", "emula sistemas",
    "inicia procedimentos", "fabrica soluções", "compõe códigos",
    "emprega métodos", "fornece respostas", "aplica técnicas",
    "rastreia erros", "executa comandos", "desenha interfaces",
    "redesenha sistemas", "valida arquivos", "acessa recursos",
    "simplifica rotinas", "esquematiza ideias", "treina modelos",
    "mantém arquivos", "seleciona dados", "consulta tabelas",
    "cruza informações", "armazena registros", "recria ambientes",
    "elabora soluções", "clona estruturas", "compartilha conteúdo",
    "restaura dados", "codifica informações", "interpreta resultados",
    "administra redes", "cria ambientes", "verifica logs",
    "lê parâmetros", "configura rotinas", "opera equipamentos",
    "valida usuários", "ativa controles", "preenche formulários",
    "expande funções", "habilita ferramentas", "reexecuta tarefas",
    "realinha processos", "digitaliza documentos"
  ];

  const complements = [
    "novas tecnologias", "inúmeros desafios", "uma solução prática",
    "uma atividade importante", "um conteúdo essencial",
    "um processo digital", "melhores técnicas de estudo",
    "um ambiente colaborativo", "um conjunto de ferramentas",
    "um projeto inovador", "um sistema otimizado",
    "uma plataforma educativa", "uma interface eficiente",
    "um banco de dados seguro", "uma lista de comandos úteis",
    "uma revisão completa", "um relatório detalhado",
    "um fluxo de tarefas", "um exemplo real",
    "um recurso interativo", "um ambiente seguro",
    "uma coleção de arquivos", "uma lógica estruturada",
    "um manual digital", "um modelo funcional",
    "um exercício aplicado", "uma abordagem moderna",
    "um material atualizado", "um módulo de treinamento",
    "uma solução técnica", "um script automatizado",
    "um painel de informações", "um conjunto de registros",
    "um dispositivo conectado", "uma rede organizada",
    "um processo contínuo", "uma construção digital",
    "uma análise rigorosa", "um pacote de dados",
    "um sistema integrado", "uma função específica",
    "um algoritmo otimizado", "uma estrutura de código",
    "uma simulação prática", "um fluxo automatizado",
    "uma ferramenta robusta", "um ambiente remoto",
    "uma ação pedagógica", "um recurso tecnológico",
    "um processo lógico", "uma plataforma colaborativa",
    "uma atualização importante", "um documento digital",
    "um acesso remoto", "um painel interativo",
    "uma sequência de comandos", "um módulo adicional",
    "um ambiente testado", "uma estrutura modular",
    "um componente eletrônico", "um recurso essencial",
    "um espaço de aprendizagem", "um plano de estudos",
    "um relatório de métricas", "uma configuração avançada",
    "uma solução funcional", "uma técnica aplicada",
    "uma metodologia eficaz", "um conjunto de parâmetros",
    "um arquivo sincronizado", "uma revisão automática",
    "um processo inteligente", "um ambiente escalável",
    "um componente de segurança", "um backup restaurado",
    "um diagnóstico técnico", "uma prática computacional",
    "uma consulta ao servidor", "um teste de desempenho",
    "uma atualização de rotina", "um registro organizado",
    "um painel de controle", "uma unidade de armazenamento",
    "um conjunto estruturado", "um layout responsivo",
    "um design interativo", "uma tecnologia embarcada",
    "um processo automatizado", "um aprendizado significativo",
    "uma sequência prática", "uma lógica eficiente",
    "um estudo de caso", "uma avaliação técnica",
    "uma ferramenta avançada", "um modelo atualizado",
    "uma resposta imediata", "um ambiente digital robusto"
  ];

  const connectors = [
    "Além disso", "Enquanto isso", "Por outro lado", "Por isso",
    "De forma geral", "No entanto", "De maneira semelhante",
    "Apesar disso", "Em seguida", "Logo após",
    "Por consequência", "No mesmo sentido", "Ainda assim",
    "Como resultado", "Por fim", "Em contrapartida",
    "Ao mesmo tempo", "De forma complementar",
    "Sob essa perspectiva", "Em muitos casos",
    "De modo geral", "Acima de tudo", "Inclusive",
    "De certa forma", "Seja como for", "Ainda que",
    "Em paralelo", "De forma integrada", "Em síntese",
    "De modo simples", "De forma objetiva", "Dessa maneira",
    "Em outras palavras", "Em resumo", "Além do mais",
    "Na maioria das vezes", "Com isso", "Desse modo",
    "Com frequência", "Em especial", "Eventualmente",
    "De modo contínuo", "Na prática", "Por vezes",
    "Sem dúvida", "De todo modo", "Ao final",
    "Logo", "Portanto", "Sendo assim", "Consequentemente",
    "De repente", "Naturalmente", "Basicamente",
    "Tecnicamente", "Na realidade", "Por padrão",
    "Curiosamente", "Em muitos cenários", "Frequentemente",
    "Em raras situações", "De acordo com isso",
    "Desta vez", "No geral", "De tempos em tempos",
    "A partir disso", "Posteriormente", "Em seguida",
    "Mesmo assim", "Dado esse cenário", "Considerando isso",
    "Em diversas etapas", "Sem muita dificuldade",
    "Com clareza", "Com precisão", "De maneira eficiente",
    "Em alguns casos", "Em uma análise rápida",
    "Sob ponto técnico", "Em diferentes momentos",
    "De forma intencional", "A longo prazo", "A curto prazo",
    "De forma repetida", "De forma automática",
    "Em última análise", "Sob a ótica do usuário",
    "Tecnicamente falando", "Por definição",
    "Com isso em mente", "A partir daí", "Por esse motivo",
    "De forma estratégica", "Por hora", "Momentaneamente",
    "Com base nisso", "Em uma abordagem moderna",
    "Do ponto de vista técnico", "No contexto digital"
  ];

  function generateSentence() {
    const s = subjects[Math.floor(Math.random() * subjects.length)];
    const v = verbs[Math.floor(Math.random() * verbs.length)];
    const c = complements[Math.floor(Math.random() * complements.length)];
    return `${s} ${v} ${c}.`;
  }

  function generateConnectedSentence() {
    const connector = connectors[Math.floor(Math.random() * connectors.length)];
    const sentence = generateSentence();
    return `${connector}, ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
  }

  let text = "";
  while (text.length < size) {
    text += Math.random() > 0.6
      ? " " + generateConnectedSentence()
      : " " + generateSentence();
  }

  return text.trim();
}
