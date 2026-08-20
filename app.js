const DB_NAME = "jalsaarthi_sih";
const STORE = "requests";

let db;

// ===============================
// DATABASE — LOCAL PRIVACY STORAGE
// ===============================

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, {
          keyPath: "id"
        });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

function getStore(mode = "readonly") {
  return db.transaction(STORE, mode).objectStore(STORE);
}

function getAllRequests() {
  return new Promise((resolve, reject) => {
    const request = getStore().getAll();

    request.onsuccess = () => {
      const data = request.result.sort(
        (a, b) => b.createdAt - a.createdAt
      );

      resolve(data);
    };

    request.onerror = () => reject(request.error);
  });
}

function saveRequest(item) {
  return new Promise((resolve, reject) => {
    const request = getStore("readwrite").put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function deleteAllRequests() {
  return new Promise((resolve, reject) => {
    const request = getStore("readwrite").clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}


// ===============================
// CHATBOT
// ===============================

const chat = document.querySelector("#chat");

function addMessage(text, type = "bot") {

  const bubble = document.createElement("div");

  bubble.className = `bubble ${type}`;

  bubble.textContent = text;

  chat.appendChild(bubble);

  chat.scrollTop = chat.scrollHeight;
}


// ===============================
// AUTO-FILL REQUEST FORM
// ===============================

function prepareRequest(category, description, priority = "Normal") {

  document.querySelector("#category").value = category;

  if (description) {
    document.querySelector("#description").value = description;
  }

  document.querySelector("#priority").value = priority;
}


// ===============================
// INTENT DETECTION
// ===============================

function detectIntent(message) {

  const text = message.toLowerCase();


  // WATER
  if (
    /water|water supply|pipeline|pipe|leak|tap|drinking water|\
thanni|தண்ணி|தண்ணீர்|குடிநீர்|குழாய்|கசிவு|தண்ணீர் வர|தண்ணி வர/
      .test(text)
  ) {
    return "water";
  }


  // COMPLAINT TRACKING
  if (
    /track|tracking|status|complaint status|request status|\
புகார் நிலை|நிலை|கம்ப்ளைன்ட்|complaint/
      .test(text)
  ) {
    return "track";
  }


  // ROADS / INFRASTRUCTURE
  if (
    /road|street|pothole|drain|garbage|waste|street light|\
road damage|சாலை|ரோடு|குப்பை|கழிவு|விளக்கு|சாக்கடை/
      .test(text)
  ) {
    return "infrastructure";
  }


  // GOVERNMENT SERVICES
  if (
    /certificate|license|ration|pension|birth|death|\
government service|service|சான்றிதழ்|ரேஷன்|ஓய்வூதியம்|அரசு சேவை/
      .test(text)
  ) {
    return "service";
  }


  // EMERGENCY
  if (
    /emergency|danger|accident|fire|urgent|\
அவசரம்|ஆபத்து|விபத்து|தீ/
      .test(text)
  ) {
    return "urgent";
  }


  // GREETING
  if (
    /hello|hi|hey|vanakkam|வணக்கம்|ஹலோ|hai/
      .test(text)
  ) {
    return "greeting";
  }


  // PRIVACY
  if (
    /privacy|private|data|delete|security|\
பாதுகாப்பு|தனியுரிமை|தரவு/
      .test(text)
  ) {
    return "privacy";
  }


  // THANKS
  if (
    /thank|thanks|நன்றி/
      .test(text)
  ) {
    return "thanks";
  }


  return "general";
}


// ===============================
// BOT RESPONSE
// ===============================

function generateResponse(message) {

  const intent = detectIntent(message);


  switch (intent) {


    // GREETING
    case "greeting":

      return `
Vanakkam! 👋

I am JalSaarthi AI.

I can help you with:

💧 Water supply problems
🛣️ Roads and infrastructure
🏛️ Government services
📋 Complaint tracking
🚨 Urgent civic issues
🔒 Privacy and data protection

You can type in English or Tamil, or use the microphone.
`;


    // WATER
    case "water":

      prepareRequest(
        "Water supply",
        message,
        "High"
      );

      return `
💧 Water Supply Issue Detected

I understood that your request is related to water supply.

I have automatically prepared the service-request form.

Please provide:

📍 Area / village / ward
📷 Optional photo evidence

Then click:

"Create private demo request"

Your prototype data stays locally in this browser.
`;


    // TRACKING
    case "track":

      return `
📋 Complaint Tracking

I can help you track a complaint.

In this prototype, your locally stored requests appear in the Officer View below.

In the production version:

Citizen
↓
Authenticated account
↓
Secure backend
↓
Complaint database
↓
Live status

Users would only be allowed to see their own requests.
`;


    // INFRASTRUCTURE
    case "infrastructure":

      prepareRequest(
        "Public infrastructure",
        message,
        "High"
      );

      return `
🛣️ Infrastructure Issue Detected

I identified this as a public-infrastructure problem.

The request form has been prepared.

Please provide:

📍 Exact location
📷 Optional photo evidence
📝 Additional details

Then create the request.
`;


    // GOVERNMENT SERVICE
    case "service":

      prepareRequest(
        "Government service",
        message,
        "Normal"
      );

      return `
🏛️ Government Service Request

I understand that you need help with a government service.

I have prepared the request form.

Please provide the service name and any relevant details.

For the production version, JalSaarthi would retrieve verified government procedures using a secure knowledge base.
`;


    // URGENT
    case "urgent":

      prepareRequest(
        "Other",
        message,
        "Urgent"
      );

      return `
⚠️ Potential Urgent Issue

I detected that this may be urgent.

The request has been marked as:

URGENT

For a real emergency, please contact the appropriate official emergency service.

JalSaarthi should not replace emergency services.
`;


    // PRIVACY
    case "privacy":

      return `
🔒 JalSaarthi Privacy Protection

This GitHub Pages prototype uses local browser storage.

Your request records are stored using:

IndexedDB
↓
Your browser
↓
Your device

They are NOT uploaded by this prototype.

Do NOT enter:

❌ Aadhaar numbers
❌ Passwords
❌ Banking information
❌ Unnecessary sensitive information

The production system should use:

🔐 Authentication
🔐 HTTPS
🔐 Server-side authorization
🔐 Row Level Security
🔐 Encrypted storage
🔐 Audit logs
🔐 Data retention rules
🔐 Data deletion controls
`;


    // THANKS
    case "thanks":

      return `
You're welcome! 😊

You can tell me another issue naturally.

For example:

"எங்கள் பகுதியில் மூன்று நாட்களாக தண்ணீர் வரவில்லை"

or

"There is a broken street light near my house."
`;


    // UNKNOWN
    default:

      return `
I want to understand your request correctly.

Please tell me:

1️⃣ What happened?
2️⃣ Where did it happen?
3️⃣ What help do you need?

For example:

"There is no water in my village for three days."

"There is a large pothole near my college."

"How can I track my complaint?"

You can also speak in Tamil.
`;
  }
}


// ===============================
// SEND MESSAGE
// ===============================

function sendMessage(message) {

  if (!message.trim()) return;

  addMessage(message, "user");

  setTimeout(() => {

    const response = generateResponse(message);

    addMessage(response, "bot");

  }, 300);
}


// ===============================
// CHAT FORM
// ===============================

document
  .querySelector("#chatForm")
  .addEventListener("submit", (event) => {

    event.preventDefault();

    const input =
      document.querySelector("#message");

    const message = input.value;

    input.value = "";

    sendMessage(message);
  });


// ===============================
// QUICK BUTTONS
// ===============================

document
  .querySelectorAll(".quick button")
  .forEach(button => {

    button.onclick = () => {

      sendMessage(button.dataset.msg);

    };

  });


// ===============================
// CREATE REQUEST
// ===============================

document
  .querySelector("#requestForm")
  .addEventListener("submit", async (event) => {

    event.preventDefault();

    const evidence =
      document.querySelector("#evidence").files[0];

    const request = {

      id:
        "JS-" +
        Date.now()
          .toString(36)
          .toUpperCase(),

      category:
        document.querySelector("#category").value,

      description:
        document
          .querySelector("#description")
          .value
          .trim(),

      location:
        document
          .querySelector("#location")
          .value
          .trim(),

      priority:
        document.querySelector("#priority").value,

      evidenceName:
        evidence
          ? evidence.name
          : "",

      status:
        "New",

      createdAt:
        Date.now()
    };


    if (!request.description) {

      showToast(
        "Please enter a description."
      );

      return;
    }


    await saveRequest(request);


    event.target.reset();


    await renderRequests();


    showToast(
      "Private demo request created successfully."
    );

  });


// ===============================
// DISPLAY REQUESTS
// ===============================

async function renderRequests() {

  const requests =
    await getAllRequests();


  document
    .querySelector("#requestCount")
    .textContent =
    requests.length;


  const list =
    document.querySelector("#requestList");


  if (!requests.length) {

    list.innerHTML =
      "<p class='muted'>No requests yet. Create one from the Request Builder.</p>";

    return;
  }


  list.innerHTML = "";


  requests.forEach(request => {

    const element =
      document.createElement("div");

    element.className =
      "request";


    element.innerHTML = `

      <div>

        <strong>
          ${escapeHTML(request.id)}
          ·
          ${escapeHTML(request.category)}
        </strong>

        <p>
          ${escapeHTML(request.description)}
          ·
          ${escapeHTML(
            request.location || "No location"
          )}
        </p>

        <span class="muted">

          ${new Date(
            request.createdAt
          ).toLocaleString()}

          ${
            request.evidenceName
              ? " · Evidence: " +
                escapeHTML(
                  request.evidenceName
                )
              : ""
          }

        </span>

      </div>


      <span class="badge">

        ${escapeHTML(
          request.priority
        )}

        ·

        ${escapeHTML(
          request.status
        )}

      </span>

    `;


    list.appendChild(element);

  });

}


// ===============================
// SECURITY — ESCAPE HTML
// ===============================

function escapeHTML(value) {

  return String(value)
    .replace(
      /[&<>"']/g,
      character => {

        const entities = {

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        };

        return entities[character];

      }
    );
}


// ===============================
// TOAST
// ===============================

function showToast(message) {

  const toast =
    document.querySelector("#toast");

  toast.textContent =
    message;

  toast.style.display =
    "block";


  setTimeout(() => {

    toast.style.display =
      "none";

  }, 2500);

}


// ===============================
// CLEAR LOCAL DATA
// ===============================

document
  .querySelector("#clearBtn")
  .onclick = async () => {

    const confirmed =
      confirm(
        "Delete all locally stored JalSaarthi requests from this browser?"
      );


    if (!confirmed) return;


    await deleteAllRequests();

    await renderRequests();


    showToast(
      "All local data has been deleted."
    );

  };


// ===============================
// PRIVACY BUTTON
// ===============================

document
  .querySelector("#privacyBtn")
  .onclick = () => {

    document
      .querySelector("#privacy")
      .scrollIntoView({
        behavior: "smooth"
      });

  };


// ===============================
// EXPORT DATA
// ===============================

document
  .querySelector("#exportBtn")
  .onclick = async () => {

    const requests =
      await getAllRequests();


    const blob =
      new Blob(
        [
          JSON.stringify(
            requests,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );


    const link =
      document.createElement("a");


    link.href =
      URL.createObjectURL(blob);


    link.download =
      "jalsaarthi-local-requests.json";


    link.click();


    URL.revokeObjectURL(
      link.href
    );

  };


// ===============================
// VOICE INPUT
// ===============================

document
  .querySelector("#micBtn")
  .onclick = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      showToast(
        "Voice input is not supported in this browser."
      );

      return;
    }


    const recognition =
      new SpeechRecognition();


    recognition.lang =
      "ta-IN";


    recognition.interimResults =
      false;


    recognition.onresult =
      event => {

        const text =
          event
            .results[0][0]
            .transcript;


        document
          .querySelector("#message")
          .value = text;


        sendMessage(text);


        document
          .querySelector("#message")
          .value = "";

      };


    recognition.onerror =
      () => {

        showToast(
          "Voice input failed."
        );

      };


    recognition.start();

  };


// ===============================
// START APPLICATION
// ===============================

(async () => {

  await openDB();


  addMessage(
    `Vanakkam! 👋

I am JalSaarthi AI.

Tell me about a government service or civic issue you need help with.

You can type in English or Tamil.`,
    "bot"
  );


  await renderRequests();

})();
