export function generateRandomText(size = 300) {
  const words = [
    "casa", "tempo", "aluno", "professor", "computador",
    "cidade", "energia", "aprender", "digitação", "rápido",
    "teclado", "internet", "jogo", "história", "projeto",
    "código", "função", "variável", "tecnologia", "sistema"
  ];

  let text = [];
  while (text.length < size) {
    const word = words[Math.floor(Math.random() * words.length)];
    text.push(word);
  }
  return text.join(" ");
}
