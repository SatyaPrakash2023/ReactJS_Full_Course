
  const Chatbot = {
    defaultResponses: {
      // === Static Text Responses ===
      'hello hi hey': `Hey there! 👋 How are you doing today?`,
      'how are you': `I'm doing great! How can I help you today?`,
      'your name': `I'm a simple JavaScript chatbot built with ❤️ by you!`,
      'bye goodbye see you': `Goodbye! 👋 Have a wonderful day!`,

      // === Dynamic Responses ===
      'flip a coin': function () {
        return Math.random() < 0.5 ? '🪙 You got heads!' : '🪙 You got tails!';
      },

      'roll a dice': function () {
        const diceResult = Math.floor(Math.random() * 6) + 1;
        return `🎲 You rolled a ${diceResult}`;
      },

      'what is the date today': function () {
        const now = new Date();
        const months = [
          'January','February','March','April','May','June',
          'July','August','September','October','November','December'
        ];
        return `📅 Today is ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
      },

      'what time is it': function () {
        const now = new Date();
        return `⏰ It's ${now.toLocaleTimeString()}`;
      },

      // === Dynamic Async Responses ===
      'tell me a joke': async function () {
        // Example of a dynamic async response using an API
        try {
          const res = await fetch('https://official-joke-api.appspot.com/random_joke');
          const data = await res.json();
          return `😂 Here's a joke:\n${data.setup}\n${data.punchline}`;
        } catch (e) {
          return "Hmm... I couldn't fetch a joke right now 😅";
        }
      },

      'quote': async function () {
        try {
          const res = await fetch('https://api.quotable.io/random');
          const data = await res.json();
          return `💬 "${data.content}" — ${data.author}`;
        } catch (e) {
          return 'I tried to get a quote, but something went wrong.';
        }
      },

      // === Help ===
      'help': `You can try:
      • "hello" / "hi"
      • "flip a coin"
      • "roll a dice"
      • "what is the date today"
      • "what time is it"
      • "tell me a joke"
      • "quote"
      • "bye"`,

      // === Default ===
      'default': function (userText) {
        return `🤔 I didn't quite get "${userText}". Try typing "help" for ideas.`;
      }
    },

    normalize(text) {
      return String(text).toLowerCase().replace(/[^\w\s']/g, '').trim();
    },

    async getReply(userText) {
      const norm = this.normalize(userText);
      const keys = Object.keys(this.defaultResponses).filter(k => k !== 'default');

      // Exact or partial match
      for (let k of keys) {
        const tokens = k.split(/\s+/);
        for (let t of tokens) {
          if (t && norm.includes(t)) {
            const val = this.defaultResponses[k];
            return (typeof val === 'function') ? await val(userText) : val;
          }
        }
      }

      // Default
      const fallback = this.defaultResponses['default'];
      return (typeof fallback === 'function') ? fallback(userText) : fallback;
    }
  };

  // === UI wiring (same as before) ===
  const chat = document.getElementById('chat');
  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');

  function appendMessage(text, who = 'bot') {
    const div = document.createElement('div');
    div.className = 'msg ' + (who === 'bot' ? 'bot' : 'user');
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function botTypingThenReply(replyText, delay = 600) {
    const typing = document.createElement('div');
    typing.className = 'msg bot';
    typing.textContent = '...';
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
      if (typing.parentNode) {
        chat.removeChild(typing);
      }
      appendMessage(replyText, 'bot');
    }, delay);
  }

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    input.value = '';
    input.focus();

    try {
      const reply = await Chatbot.getReply(text);
      botTypingThenReply(reply, 700);
    } catch (err) {
      console.error(err);
      botTypingThenReply('⚠️ Something went wrong.');
    }
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSend();
  });

  window.addEventListener('load', function () {
    appendMessage("👋 Hi! I'm your friendly chatbot. Type 'help' to see what I can do.", 'bot');
    input.focus();
  });

