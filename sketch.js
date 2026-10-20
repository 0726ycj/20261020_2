// ===================================================
// PBL 專題：韓文單詞多媒體測驗 - 學習二（一題一頁語音）
// 檔案：sketch.js
// ===================================================

let currentQuestionIndex = 0;
let score = 0;
let selectedOption = -1;
let isAnswerChecked = false;
let quizFinished = false;

let audioCtx = null;
let synth = window.speechSynthesis;

const multiQuizData = [
  {
    question: "1. 韓文的「蘋果」應該怎麼說？",
    options: ["사과 (sagwa)", "물 (mul)", "우유 (uyu)", "고양이 (goyangi)"],
    correct: 0,
    explanation: "사과 (sagwa) 是韓文的蘋果。"
  },
  {
    question: "2. 韓文的「水」應該怎麼說？",
    options: ["사과", "물 (mul)", "감사합니다", "안녕하세요"],
    correct: 1,
    explanation: "물 (mul) 是韓文的水。"
  },
  {
    question: "3. 韓文的「謝謝」應該怎麼說？",
    options: ["안녕하세요", "우유", "감사합니다 (gamsahamnida)", "고양이"],
    correct: 2,
    explanation: "감사합니다 (gamsahamnida) 是韓文禮貌的謝謝。"
  },
  {
    question: "4. 韓文的「貓咪」應該怎麼說？",
    options: ["우유", "물", "사과", "고양이 (goyangi)"],
    correct: 3,
    explanation: "고양이 (goyangi) 是韓文的貓咪。"
  }
];

let optionButtons = [];
let audioSpeechButton = null;
let nextButton = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  initAudioContext();
  createQuizUI();
}

function draw() {
  background(255, 248, 245);
  if (!quizFinished) {
    drawHeader();
    drawMediaAnimation();
    drawQuestionContent();
  } else {
    drawResultScreen();
  }
}

function drawHeader() {
  fill(60, 40, 40); noStroke(); textSize(20); textStyle(BOLD);
  text("🎧 學習二：韓文一題一頁多媒體測驗", width / 2, 35);
  textSize(13); fill(130, 100, 100); textStyle(NORMAL);
  text(`第 ${currentQuestionIndex + 1} 題 / 共 ${multiQuizData.length} 題`, width / 2, 62);
  
  stroke(255, 200, 200); strokeWeight(6);
  line(width * 0.2, 80, width * 0.8, 80);
  let pW = (width * 0.6) * ((currentQuestionIndex + 1) / multiQuizData.length);
  stroke(229, 115, 115);
  line(width * 0.2, 80, width * 0.2 + pW, 80);
  noStroke();
}

function drawMediaAnimation() {
  let boxW = min(width * 0.6, 380), boxH = 110;
  let boxX = width / 2 - boxW / 2, boxY = 95;
  fill(255); stroke(255, 200, 200); strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, 12);

  fill(216, 67, 21); noStroke(); textSize(14); textStyle(BOLD);
  text("🇰🇷 韓文單詞語音學習區", width / 2, boxY + boxH / 2);
}

function drawQuestionContent() {
  let q = multiQuizData[currentQuestionIndex];
  fill(60, 40, 40); textSize(15); textStyle(BOLD); textAlign(CENTER, CENTER);
  text(q.question, width / 2, 230);

  if (isAnswerChecked) {
    let isCorrect = (selectedOption === q.correct);
    let boxW = min(width * 0.8, 580), boxH = 80;
    let boxX = width / 2 - boxW / 2, boxY = height - 145;

    fill(isCorrect ? color(232, 245, 233) : color(255, 235, 238));
    stroke(isCorrect ? color(76, 175, 80) : color(244, 67, 54)); strokeWeight(2);
    rect(boxX, boxY, boxW, boxH, 10);

    noStroke(); textAlign(LEFT, TOP); textSize(13); textStyle(BOLD);
    fill(isCorrect ? color(46, 125, 50) : color(198, 40, 40));
    text(isCorrect ? "🎉 答對了！" : "❌ 答錯了！正確答案是 (" + (q.correct + 1) + ")", boxX + 15, boxY + 12);
    textSize(11); textStyle(NORMAL); fill(60);
    text("💡 解析：" + q.explanation, boxX + 15, boxY + 35, boxW - 30);
  }
}

function createQuizUI() {
  updateQuestionUI();
}

function updateQuestionUI() {
  removeElements();
  let q = multiQuizData[currentQuestionIndex];
  let btnW = min(width * 0.75, 480), btnH = 42;

  audioSpeechButton = createButton("🔊 點我聽韓文發音朗讀");
  audioSpeechButton.position(width / 2 - 100, 250);
  audioSpeechButton.size(200, 30);
  styleSpeechButton(audioSpeechButton);
  audioSpeechButton.mousePressed(() => { speakQuestionText(q); });

  for (let i = 0; i < q.options.length; i++) {
    let btn = createButton(`(${i + 1}) ${q.options[i]}`);
    let posY = 270 + i * (btnH + 10);
    btn.position(width / 2 - btnW / 2, posY);
    btn.size(btnW, btnH);
    styleOptionButton(btn);

    let optIdx = i;
    btn.mousePressed(() => {
      if (!isAnswerChecked) handleOptionSelect(optIdx);
    });
    optionButtons.push(btn);
  }

  if (isAnswerChecked) {
    nextButton = createButton(currentQuestionIndex < multiQuizData.length - 1 ? "下一題 ➔" : "查看總成績 🏆");
    nextButton.position(width / 2 - 80, height - 55);
    nextButton.size(160, 42);
    styleNextButton(nextButton);
    nextButton.mousePressed(() => { stopSpeech(); goToNextQuestion(); });
  }
}

function handleOptionSelect(idx) {
  selectedOption = idx;
  isAnswerChecked = true;
  let q = multiQuizData[currentQuestionIndex];
  if (selectedOption === q.correct) {
    score++;
    playTone(587.33, 0.15);
    setTimeout(() => playTone(880, 0.2), 120);
  } else {
    playTone(220, 0.25);
  }
  updateQuestionUI();
}

function goToNextQuestion() {
  playTone(440, 0.1);
  if (currentQuestionIndex < multiQuizData.length - 1) {
    currentQuestionIndex++;
    selectedOption = -1;
    isAnswerChecked = false;
    updateQuestionUI();
  } else {
    quizFinished = true;
    removeElements();
  }
}

function speakQuestionText(q) {
  if (!synth) return;
  synth.cancel();
  let textToSpeak = `${q.question}。選項一：${q.options[0]}。選項二：${q.options[1]}。選項三：${q.options[2]}。選項四：${q.options[3]}`;
  let utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = "ko-KR"; // 韓文 TTS
  synth.speak(utterance);
}

function stopSpeech() {
  if (synth) synth.cancel();
}

function initAudioContext() {
  try { window.AudioContext = window.AudioContext || window.webkitAudioContext; } catch (e) {}
}

function playTone(freq, duration) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function drawResultScreen() {
  let w = min(width * 0.8, 400), h = 260, x = width / 2 - w / 2, y = height / 2 - h / 2;
  fill(255); stroke(255, 200, 200); strokeWeight(2); rect(x, y, w, h, 16);
  textAlign(CENTER, CENTER); fill(60, 40, 40); textSize(22); textStyle(BOLD);
  text("🏆 韓文多媒體測驗完成！", width / 2, y + 45);
  let percent = Math.round((score / multiQuizData.length) * 100);
  textSize(44); fill(percent >= 60 ? color(76, 175, 80) : color(244, 67, 54));
  text(`${score} / ${multiQuizData.length} 題`, width / 2, y + 110);
  textSize(14); fill(120, 100, 100); textStyle(NORMAL);
  text(`總得分：${percent} 分`, width / 2, y + 155);
  textSize(12); fill(150, 130, 130);
  text("（點擊畫布任意處可重新測驗）", width / 2, y + 215);
}

function mousePressed() {
  if (quizFinished) {
    currentQuestionIndex = 0; score = 0; selectedOption = -1; isAnswerChecked = false; quizFinished = false;
    updateQuestionUI();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateQuestionUI();
}

function styleOptionButton(b) {
  b.style("background-color", "#FFFFFF"); b.style("color", "#604040"); b.style("font-size", "14px");
  b.style("font-weight", "600"); b.style("border", "2px solid #FFCCBC"); b.style("border-radius", "8px");
  b.style("cursor", "pointer"); b.style("text-align", "left"); b.style("padding-left", "18px");
}
function styleSpeechButton(b) {
  b.style("background-color", "#FFEBEE"); b.style("color", "#D84315"); b.style("font-size", "12px");
  b.style("font-weight", "bold"); b.style("border", "1px solid #FFCCBC"); b.style("border-radius", "15px"); b.style("cursor", "pointer");
}
function styleNextButton(b) {
  b.style("background-color", "#E57373"); b.style("color", "#FFFFFF"); b.style("font-size", "14px");
  b.style("font-weight", "bold"); b.style("border", "none"); b.style("border-radius", "25px");
  b.style("cursor", "pointer");
}