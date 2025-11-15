// This is a simple chatbot used for React practice.
// You can customize the responses by editing the
// defaultResponses and additionalResponses objects.

const Chatbot = {
  defaultResponses: {
    // === Static Text Responses ===
      'hello': `Hey there! 👋 How are you doing today?`,
      'Hello': `Hey there! 👋 How are you doing today?`,
      'Hi': `Hey there! 👋 How are you doing today?`,
      'Hey': `Hey there! 👋 How are you doing today?`,
      'hi': `Hey there! 👋 How are you doing today?`,
      'hey': `Hey there! 👋 How are you doing today?`,
      'how are you': `I'm doing great! How can I help you today?`,
      'your name': `I'm a simple JavaScript chatbot built with ❤️ by you!`,
      'bye goodbye see you': `Goodbye! 👋 Have a wonderful day!`,
    // === Dynamic Responses ===
    'flip a coin': function () {
      const randomNumber = Math.random();
      if (randomNumber < 0.5) {
        return 'Sure! You got heads';
      } else {
        return 'Sure! You got tails';
      }
    },
    'roll a dice': function() {
      const diceResult = Math.floor(Math.random() * 6) + 1;
      return `Sure! You got ${diceResult}`;
    },
    'what is the date today': function () {
      const now = new Date();
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = months[now.getMonth()];
      const day = now.getDate();

      return `Today is ${month} ${day}`;
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
      • "thank"
      • "quote"
      • "bye"`,
  
    'thank': 'No problem! Let me know if you need help with anything else!',
  },

  additionalResponses: {},

  unsuccessfulResponse: `Sorry, I didn't quite understand that. Currently, I only know how to flip a coin, roll a dice, or get today's date. Let me know how I can help!`,

  emptyMessageResponse: `Sorry, it looks like your message is empty. Please make sure you send a message and I will give you a response.`,

  addResponses: function (additionalResponses) {
    this.additionalResponses = {
      ...this.additionalResponses,
      ...additionalResponses
    };
  },

  getResponse: function (message) {
    if (!message) {
      return this.emptyMessageResponse;
    }

    // This spread operator (...) combines the 2 objects.
    const responses = {
      ...this.defaultResponses,
      ...this.additionalResponses,
    };

    const {
      ratings,
      bestMatchIndex,
    } = this.stringSimilarity(message, Object.keys(responses));

    const bestResponseRating = ratings[bestMatchIndex].rating;
    if (bestResponseRating <= 0.3) {
      return this.unsuccessfulResponse;
    }

    const bestResponseKey = ratings[bestMatchIndex].target;
    const response = responses[bestResponseKey];

    if (typeof response === 'function') {
      return response();
    } else {
      return response;
    }
  },

  getResponseAsync: function (message) {
    return new Promise((resolve) => {
      // Pretend it takes some time for the chatbot to response.
      // setTimeout(() => {
        resolve(this.getResponse(message));
      // }, 10000);
    });
  },

  compareTwoStrings: function (first, second) {
    first = first.replace(/\s+/g, '')
    second = second.replace(/\s+/g, '')

    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;

    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      const count = firstBigrams.has(bigram)
        ? firstBigrams.get(bigram) + 1
        : 1;

      firstBigrams.set(bigram, count);
    };

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.has(bigram)
        ? firstBigrams.get(bigram)
        : 0;

      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
  },

  stringSimilarity: function (mainString, targetStrings) {
    const ratings = [];
    let bestMatchIndex = 0;

    for (let i = 0; i < targetStrings.length; i++) {
      const currentTargetString = targetStrings[i];
      const currentRating = this.compareTwoStrings(mainString, currentTargetString)
      ratings.push({target: currentTargetString, rating: currentRating})
      if (currentRating > ratings[bestMatchIndex].rating) {
        bestMatchIndex = i
      }
    }

    const bestMatch = ratings[bestMatchIndex]

    return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex };
  },
};

// Define the randomUUID() function if it doesn't exist.
function uuidPolyfill() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
    const randomNumber = Math.random() * 16 | 0;
    const result = char === 'x' ? randomNumber : (randomNumber & 0x3 | 0x8);
    return result.toString(16);
  });
}

// This code allows Chatbot to be used in both the browser and
// in NodeJS. This is called UMD (Universal Module Definition).
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory();
  } else {
    // Create a fallback if window.crypto is undefined.
    if (typeof root.crypto === 'undefined') {
      try {
        root.crypto = {};
      } catch (e) {}
    }

    // Create a fallback crypto.randomUUID() function.
    if (root.crypto && typeof root.crypto.randomUUID !== 'function') {
      try {
        root.crypto.randomUUID = uuidPolyfill;
      } catch (e) {}
    }

    // Browser global
    root.Chatbot = factory();
    root.chatbot = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return Chatbot;
}));




































  // const ChatboIt = {
  //   defaultResponses: {
  //     // === Static Text Responses ===
  //     'hello hi hey': `Hey there! 👋 How are you doing today?`,
  //     'how are you': `I'm doing great! How can I help you today?`,
  //     'your name': `I'm a simple JavaScript chatbot built with ❤️ by you!`,
  //     'bye goodbye see you': `Goodbye! 👋 Have a wonderful day!`,

  //     // === Dynamic Responses ===
  //     'flip a coin': function () {
  //       return Math.random() < 0.5 ? '🪙 You got heads!' : '🪙 You got tails!';
  //     },

  //     'roll a dice': function () {
  //       const diceResult = Math.floor(Math.random() * 6) + 1;
  //       return `🎲 You rolled a ${diceResult}`;
  //     },

  //     'what is the date today': function () {
  //       const now = new Date();
  //       const months = [
  //         'January','February','March','April','May','June',
  //         'July','August','September','October','November','December'
  //       ];
  //       return `📅 Today is ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  //     },

  //     'what time is it': function () {
  //       const now = new Date();
  //       return `⏰ It's ${now.toLocaleTimeString()}`;
  //     },

  //     // === Dynamic Async Responses ===
  //     'tell me a joke': async function () {
  //       // Example of a dynamic async response using an API
  //       try {
  //         const res = await fetch('https://official-joke-api.appspot.com/random_joke');
  //         const data = await res.json();
  //         return `😂 Here's a joke:\n${data.setup}\n${data.punchline}`;
  //       } catch (e) {
  //         return "Hmm... I couldn't fetch a joke right now 😅";
  //       }
  //     },

  //     'quote': async function () {
  //       try {
  //         const res = await fetch('https://api.quotable.io/random');
  //         const data = await res.json();
  //         return `💬 "${data.content}" — ${data.author}`;
  //       } catch (e) {
  //         return 'I tried to get a quote, but something went wrong.';
  //       }
  //     },

  //     // === Help ===
  //     'help': `You can try:
  //     • "hello" / "hi"
  //     • "flip a coin"
  //     • "roll a dice"
  //     • "what is the date today"
  //     • "what time is it"
  //     • "tell me a joke"
  //     • "quote"
  //     • "bye"`,

  //     // === Default ===
  //     'default': function (userText) {
  //       return `🤔 I didn't quite get "${userText}". Try typing "help" for ideas.`;
  //     }
  //   },

  //   normalize(text) {
  //     return String(text).toLowerCase().replace(/[^\w\s']/g, '').trim();
  //   },

  //   async getReply(userText) {
  //     const norm = this.normalize(userText);
  //     const keys = Object.keys(this.defaultResponses).filter(k => k !== 'default');

  //     // Exact or partial match
  //     for (let k of keys) {
  //       const tokens = k.split(/\s+/);
  //       for (let t of tokens) {
  //         if (t && norm.includes(t)) {
  //           const val = this.defaultResponses[k];
  //           return (typeof val === 'function') ? await val(userText) : val;
  //         }
  //       }
  //     }

  //     // Default
  //     const fallback = this.defaultResponses['default'];
  //     return (typeof fallback === 'function') ? fallback(userText) : fallback;
  //   }
  // };

  // // === UI wiring (same as before) ===
  // const chat = document.getElementById('chat');
  // const input = document.getElementById('user-input');
  // const sendBtn = document.getElementById('send-btn');

  // function appendMessage(text, who = 'bot') {
  //   const div = document.createElement('div');
  //   div.className = 'msg ' + (who === 'bot' ? 'bot' : 'user');
  //   div.textContent = text;
  //   chat.appendChild(div);
  //   chat.scrollTop = chat.scrollHeight;
  // }

  // function botTypingThenReply(replyText, delay = 600) {
  //   const typing = document.createElement('div');
  //   typing.className = 'msg bot';
  //   typing.textContent = '...';
  //   chat.appendChild(typing);
  //   chat.scrollTop = chat.scrollHeight;

  //   setTimeout(() => {
  //     if (typing.parentNode) {
  //       chat.removeChild(typing);
  //     }
  //     appendMessage(replyText, 'bot');
  //   }, delay);
  // }

  // async function handleSend() {
  //   const text = input.value.trim();
  //   if (!text) return;
  //   appendMessage(text, 'user');
  //   input.value = '';
  //   input.focus();

  //   try {
  //     const reply = await Chatbot.getReply(text);
  //     botTypingThenReply(reply, 700);
  //   } catch (err) {
  //     console.error(err);
  //     botTypingThenReply('⚠️ Something went wrong.');
  //   }
  // }

  // sendBtn.addEventListener('click', handleSend);
  // input.addEventListener('keydown', function (e) {
  //   if (e.key === 'Enter') handleSend();
  // });

  // window.addEventListener('load', function () {
  //   appendMessage("👋 Hi! I'm your friendly chatbot. Type 'help' to see what I can do.", 'bot');
  //   input.focus();
  // });

