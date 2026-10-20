// =============================================================================
// 動物王國互動拖曳測驗系統 (純白背景 + 上方各選項獨立圖片 + 下方文字拖曳選項)
// 依照需求：上方各選項皆包含專屬動物圖片，且上方除選項外無其他贅飾元素
// 本程式每一行指令均包含詳細繁體中文註解，便於教學與自學閱讀
// =============================================================================

// 宣告儲存六隻動物圖片物件的陣列
let animalImageList = [];

// 宣告儲存上方六個動物題目放置格資料的陣列（每一格均含圖片與放置區）
let animalQuestionSlots = [];

// 宣告儲存下方六個可拖曳動物文字選項卡片資料的陣列
let animalDraggableCards = [];

// 宣告目前正在被滑鼠游標或手指拖曳中的卡片物件（無拖曳時為 null）
let activeDraggingCard = null;

// 宣告紀錄拖曳開始時游標與卡片左上角之 X 軸相對偏移量
let mouseOffsetX = 0;

// 宣告紀錄拖曳開始時游標與卡片左上角之 Y 軸相對偏移量
let mouseOffsetY = 0;

// 宣告紀錄使用者是否已經點擊交卷按鈕的測驗完成狀態變數
let isQuizEvaluated = false;

// 宣告計算後的測驗總成績百分比分數變數（0 ~ 100）
let finalScorePercentage = 0;

// 宣告紀錄目前答對的題目總數量變數
let correctCountValue = 0;

// 宣告控制純白畫布上是否播放慶祝彩帶效果的布林變數
let isRibbonShowerActive = false;

// 宣告儲存所有彩色彩帶粒子實例物件的陣列
let ribbonShowerParticles = [];

// 宣告交卷看成績按鈕之幾何邊界物件（包含 x, y, w, h）
let submitBtnRect = { x: 0, y: 0, w: 160, h: 40 };

// 宣告重新測驗按鈕之幾何邊界物件（包含 x, y, w, h）
let retryBtnRect = { x: 0, y: 0, w: 140, h: 40 };

// 宣告集中管理全螢幕響應式排版座標之物件
let responsiveQuizLayout = {
  slotsTopY: 20, // 上方動物圖片選項區起始 Y 座標（頂部直接展示選項）
  statusAreaY: 0, // 成績看板與提示文字起始 Y 座標
  buttonsAreaY: 0, // 按鈕列區域起始 Y 座標
  cardsPoolY: 0 // 下方拖曳文字選項池起始 Y 座標
};

// 資源預載函式：在 setup 執行前由 p5.js 自動呼叫，預載六張動物圖片
function preload() {
  // 迴圈載入專案資料夾內的 animal_1.png 到 animal_6.png 圖片檔案
  for (let i = 0; i < 6; i++) {
    // 取得圖片編號（1 至 6）
    const imageNumber = i + 1;

    // 載入對應之動物圖片並推入陣列儲存
    animalImageList[i] = loadImage('animal_' + imageNumber + '.png');
  } // 結束 for 迴圈
} // 結束 preload 函式

// 初始化設定函式：在網頁載入時僅執行一次
function setup() {
  // 根據使用者瀏覽器視窗寬高建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  // 設定繪製文字時預設為水平置中與垂直置中
  textAlign(CENTER, CENTER);

  // 設定繪製矩形時的錨點模式為左上角 CORNER 模式
  rectMode(CORNER);

  // 初始化六個動物題目定義與卡片物件資料
  initializeAnimalQuizData();

  // 計算並套用符合當前全螢幕解析度的響應式排版位置
  updateResponsiveQuizLayout();

  // 初始化彩帶粒子系統（預備 150 根繽紛彩帶）
  setupRibbonShowerParticles(150);

  // 檢查網址參數是否包含 autoSubmit=100 以便於自動化測試彩帶特效
  if (typeof window !== 'undefined' && window.location.search.includes('autoSubmit=100')) {
    autoCompleteAllCorrectAnswers(); // 自動填入六題正確答案
    evaluateUserSubmission(); // 自動交卷觸發及格與彩帶效果
  } // 結束 if
} // 結束 setup 函式

// 視窗尺寸變更監聽函式：當瀏覽器視窗被調整大小時自動執行
function windowResized() {
  // 動態調整畫布尺寸以符合全新視窗大小
  resizeCanvas(windowWidth, windowHeight);

  // 重新計算所有元件在全螢幕響應式配置下的新座標與尺寸
  updateResponsiveQuizLayout();
} // 結束 windowResized 函式

// 初始化動物測驗題目與選項資料函式
function initializeAnimalQuizData() {
  // 定義六大動物名稱、圖片索引與分類特徵資料
  const animalDataSet = [
    {
      id: 1, // 動物編號 1
      animalTitle: "🦁 獅子 (Lion)", // 動物名稱與 Emoji 圖標
      classification: "貓科 / 萬獸之王", // 分類小標籤
      imageIndex: 0 // 對應 animal_1.png 索引
    },
    {
      id: 2, // 動物編號 2
      animalTitle: "🐘 大象 (Elephant)", // 動物名稱與 Emoji 圖標
      classification: "象科 / 陸地最大", // 分類小標籤
      imageIndex: 1 // 對應 animal_2.png 索引
    },
    {
      id: 3, // 動物編號 3
      animalTitle: "🐼 大貓熊 (Panda)", // 動物名稱與 Emoji 圖標
      classification: "熊科 / 國寶萌獸", // 分類小標籤
      imageIndex: 2 // 對應 animal_3.png 索引
    },
    {
      id: 4, // 動物編號 4
      animalTitle: "🐧 企鵝 (Penguin)", // 動物名稱與 Emoji 圖標
      classification: "企鵝科 / 極地潛將", // 分類小標籤
      imageIndex: 3 // 對應 animal_4.png 索引
    },
    {
      id: 5, // 動物編號 5
      animalTitle: "🦒 長頸鹿 (Giraffe)", // 動物名稱與 Emoji 圖標
      classification: "長頸鹿科 / 世界最高", // 分類小標籤
      imageIndex: 4 // 對應 animal_5.png 索引
    },
    {
      id: 6, // 動物編號 6
      animalTitle: "🦘 袋鼠 (Kangaroo)", // 動物名稱與 Emoji 圖標
      classification: "袋鼠科 / 跳躍大師", // 分類小標籤
      imageIndex: 5 // 對應 animal_6.png 索引
    }
  ]; // 結束題目定義陣列

  // 清空目前的目標放置槽陣列
  animalQuestionSlots = [];

  // 遍歷定義資料，產生上方六個獨立包含圖片的選項格
  for (let i = 0; i < animalDataSet.length; i++) {
    animalQuestionSlots.push({
      slotIndex: i, // 放置槽索引編號
      correctId: animalDataSet[i].id, // 該槽對應的正確答案 ID
      expectedTitle: animalDataSet[i].animalTitle, // 正確解答文字
      classification: animalDataSet[i].classification, // 分類標籤
      imageRef: animalImageList[animalDataSet[i].imageIndex], // 該選項對應的動物圖片物件
      x: 0, // 格子左上角 X 座標
      y: 0, // 格子左上角 Y 座標
      w: 0, // 格子寬度
      h: 0, // 格子高度
      placedCard: null, // 目前放入該槽的文字卡片參照
      isCorrect: false // 交卷後紀錄該槽是否答對的布林值
    }); // 結束 animalQuestionSlots.push
  } // 結束 for 迴圈

  // 清空拖曳選項卡片陣列
  animalDraggableCards = [];

  // 建立隨機洗牌索引陣列
  let randomOrder = [0, 1, 2, 3, 4, 5];

  // 執行隨機打亂演算法，確保下方文字選項每次開啟皆隨機排列
  randomOrder.sort(() => Math.random() - 0.5);

  // 依打亂後的順序產生下方六個可拖曳的文字選項卡片物件
  for (let i = 0; i < randomOrder.length; i++) {
    const item = animalDataSet[randomOrder[i]];
    animalDraggableCards.push({
      id: item.id, // 卡片對應的動物 ID
      nameText: item.animalTitle, // 卡片顯示的動物名稱文字
      subText: item.classification, // 卡片輔助顯示的分類標籤
      currentX: 0, // 卡片當前即時渲染的 X 座標
      currentY: 0, // 卡片當前即時渲染的 Y 座標
      targetX: 0, // 卡片目標平滑移動抵達的 X 座標
      targetY: 0, // 卡片目標平滑移動抵達的 Y 座標
      homeX: 0, // 卡片在下方選項池中的原始預設 X 座標
      homeY: 0, // 卡片在下方選項池中的原始預設 Y 座標
      w: 0, // 卡片寬度
      h: 0, // 卡片高度
      assignedSlot: null // 目前所放置的目標槽物件參照
    }); // 結束 animalDraggableCards.push
  } // 結束 for 迴圈
} // 結束 initializeAnimalQuizData 函式

// 更新響應式排版尺寸與座標函式（上方各選項含獨立圖片，除選項外無其他贅飾）
function updateResponsiveQuizLayout() {
  // 取得畫布目前總寬度
  const fullWidth = width;

  // 取得畫布目前總高度
  const fullHeight = height;

  // 判斷是否為手機或窄螢幕（寬度小於 768px）
  const isNarrowScreen = fullWidth < 768;

  // 寬螢幕採 3 欄 2 列，窄螢幕採 2 欄 3 列
  const slotCols = isNarrowScreen ? 2 : 3;

  // 設定放置槽的列數
  const slotRows = isNarrowScreen ? 3 : 2;

  // 上方選項區域直接由頂部起始（設定適度邊界 18px）
  responsiveQuizLayout.slotsTopY = Math.max(fullHeight * 0.025, 18);

  // 計算上方選項區域最大可用寬度
  const maxSlotAreaW = Math.min(fullWidth * 0.94, 980);

  // 計算單一選項格的寬度
  const slotW = (maxSlotAreaW - (slotCols - 1) * 12) / slotCols;

  // 計算單一選項格的高度（充分容納上方動物圖片與下方拖曳放置底座）
  const slotH = Math.min(Math.max(fullHeight * 0.22, 145), 180);

  // 計算上方選項區域整體置中的起始 X 座標
  const slotStartX = (fullWidth - maxSlotAreaW) / 2;

  // 指派各放置槽之幾何屬性
  for (let i = 0; i < animalQuestionSlots.length; i++) {
    const colIndex = i % slotCols;
    const rowIndex = Math.floor(i / slotCols);
    animalQuestionSlots[i].x = slotStartX + colIndex * (slotW + 12);
    animalQuestionSlots[i].y = responsiveQuizLayout.slotsTopY + rowIndex * (slotH + 10);
    animalQuestionSlots[i].w = slotW;
    animalQuestionSlots[i].h = slotH;
  } // 結束 for 迴圈

  // 計算上方選項格最底緣的 Y 座標
  const slotsBottomY = responsiveQuizLayout.slotsTopY + slotRows * (slotH + 10);

  // 設定成績看板區域之 Y 座標
  responsiveQuizLayout.statusAreaY = slotsBottomY + 12;

  // 設定按鈕區域的起始 Y 座標（置於成績看板下方）
  responsiveQuizLayout.buttonsAreaY = responsiveQuizLayout.statusAreaY + 30;

  // 設定交卷按鈕尺寸
  submitBtnRect.w = Math.min(fullWidth * 0.22, 160);
  submitBtnRect.h = 38;
  submitBtnRect.x = fullWidth / 2 - submitBtnRect.w - 10;
  submitBtnRect.y = responsiveQuizLayout.buttonsAreaY;

  // 設定重新測驗按鈕尺寸
  retryBtnRect.w = Math.min(fullWidth * 0.2, 140);
  retryBtnRect.h = 38;
  retryBtnRect.x = fullWidth / 2 + 10;
  retryBtnRect.y = responsiveQuizLayout.buttonsAreaY;

  // 計算下方動物文字選項池的起始 Y 座標（保留充足垂直空間確保提示文字不重疊）
  responsiveQuizLayout.cardsPoolY = responsiveQuizLayout.buttonsAreaY + submitBtnRect.h + 38;

  // 下方文字選項同樣根據螢幕寬度分配欄數
  const cardCols = isNarrowScreen ? 2 : 3;

  // 計算卡片最大可用排列寬度
  const maxPoolAreaW = Math.min(fullWidth * 0.94, 980);

  // 計算單張卡片寬度（微縮 8px 完美吸附於槽底座）
  const cardW = (maxPoolAreaW - (cardCols - 1) * 12) / cardCols - 8;

  // 計算單張卡片高度（精準 40px）
  const cardH = 40;

  // 計算卡片池整體置中的起始 X 座標
  const poolStartX = (fullWidth - maxPoolAreaW) / 2 + 4;

  // 計算並指派每張選項卡片的座標與尺寸
  for (let i = 0; i < animalDraggableCards.length; i++) {
    const card = animalDraggableCards[i];
    const colIndex = i % cardCols;
    const rowIndex = Math.floor(i / cardCols);
    card.w = cardW;
    card.h = cardH;
    card.homeX = poolStartX + colIndex * ((maxPoolAreaW - (cardCols - 1) * 12) / cardCols);
    card.homeY = responsiveQuizLayout.cardsPoolY + rowIndex * (cardH + 8);

    // 若卡片尚未被放入目標槽，目標位置為池中原始位置
    if (card.assignedSlot === null) {
      card.targetX = card.homeX;
      card.targetY = card.homeY;
      if (card.currentX === 0 && card.currentY === 0) {
        card.currentX = card.homeX;
        card.currentY = card.homeY;
      } // 結束 if
    } else {
      // 若已被放入目標槽，吸附於該動物圖片下方的放置座精準位置
      const slot = card.assignedSlot;
      card.targetX = slot.x + (slot.w - card.w) / 2;
      card.targetY = slot.y + slot.h - card.h - 6;
    } // 結束 else
  } // 結束 for 迴圈
} // 結束 updateResponsiveQuizLayout 函式

// 主繪圖迴圈函式：每秒由 p5.js 重複呼叫以繪製純白畫布幀畫面
function draw() {
  // 每一幀以乾淨明亮的純白色塗滿畫布背景（依需求設定純白背景）
  background(255);

  // 繪製上方六個獨立包含動物圖片的題目選項格（依需求：除上方選項外無其他贅飾）
  drawTopAnimalPictureSlots();

  // 繪製交卷看成績、重新測驗按鈕與分數統計資訊
  drawActionButtonsAndScore();

  // 繪製下方動物文字拖曳選項卡片池區域
  drawDraggableAnimalOptionsArea();

  // 當成績高於 60% 時，在純白畫布上持續更新並播放鮮豔彩帶飄落效果
  if (isRibbonShowerActive) {
    updateAndRenderRibbonShower();
  } // 結束 if

  // 繪製正在被拖曳中的卡片於最頂層（確保不被其他元件遮擋）
  renderActiveFloatingCardOnTop();
} // 結束 draw 函式

// 繪製上方六個獨立包含動物圖片的選項格函式
function drawTopAnimalPictureSlots() {
  push(); // 儲存繪圖狀態
  for (let i = 0; i < animalQuestionSlots.length; i++) {
    const slot = animalQuestionSlots[i]; // 取得當前選項格物件
    const isHovered = checkPointInRectangle(mouseX, mouseY, slot.x, slot.y, slot.w, slot.h); // 檢查滑鼠懸停
    const isDraggedOver = activeDraggingCard !== null && isHovered; // 檢查是否有卡片正懸空於上方

    // 繪製選項格外圍微立體柔和投影
    noStroke(); // 關閉邊框
    fill(0, 0, 0, 12); // 柔和微投影
    rect(slot.x + 2, slot.y + 3, slot.w, slot.h, 8); // 繪製投影矩形

    // 依據是否交卷及答對情況決定外框與背景色彩
    if (isQuizEvaluated) {
      if (slot.isCorrect) {
        stroke(16, 185, 129); // 答對時翡翠綠外框
        strokeWeight(2); // 邊框寬度 2px
        fill(240, 253, 244); // 答對時清爽淺薄荷綠底色
      } else {
        stroke(239, 68, 68); // 答錯時珊瑚紅警示外框
        strokeWeight(2); // 邊框寬度 2px
        fill(254, 242, 242); // 答錯時淡粉紅底色
      } // 結束 else
    } else {
      if (isDraggedOver) {
        stroke(245, 158, 11); // 拖曳卡片靠近時耀眼琥珀金吸附外框
        strokeWeight(2.2); // 加粗外框
        fill(255, 251, 235); // 溫暖微黃底色
      } else {
        stroke(226, 232, 240); // 預設白底主題邊框灰
        strokeWeight(1.2); // 標準邊框寬度
        fill(250, 250, 252); // 預設極淡潔淨底色
      } // 結束 else
    } // 結束 else

    rect(slot.x, slot.y, slot.w, slot.h, 8); // 繪製選項格外框本體

    // 計算選項格內上半部動物圖片的繪製區域
    const dockH = 40; // 下方放置座高度
    const imageAreaH = slot.h - dockH - 16; // 上半部圖片區域高度
    const imgW = Math.min(slot.w - 16, imageAreaH * 1.35); // 圖片自適應寬度
    const imgH = imageAreaH; // 圖片高度
    const imgX = slot.x + (slot.w - imgW) / 2; // 圖片水平置中 X 座標
    const imgY = slot.y + 6; // 圖片頂部 Y 座標

    // 繪製選項專屬動物圖片（依需求：上方每一個選項都要有圖片）
    if (slot.imageRef) {
      image(slot.imageRef, imgX, imgY, imgW, imgH); // 繪製動物圖片
    } else {
      // 備用繪製：若圖片載入延遲，呼叫幾何向量小動物圖示
      renderFallbackAnimalVector(slot.correctId, imgX, imgY, imgW, imgH);
    } // 結束 else

    // 計算動物圖片下方的拖曳放置座位置
    const dockY = slot.y + slot.h - dockH - 6; // 放置座 Y 座標

    // 若該槽尚未放置任何文字選項卡片，繪製提示放置底座
    if (slot.placedCard === null) {
      stroke(203, 213, 225); // 淡灰虛線感邊框
      strokeWeight(1); // 粗細 1px
      fill(255); // 純白內凹底
      rect(slot.x + 8, dockY, slot.w - 16, dockH, 4); // 繪製底座矩形

      noStroke(); // 關閉邊框
      fill(148, 163, 184); // 提示文字顏色
      textSize(10.5); // 提示字體大小
      text("⇲ 請將動物名稱拖曳至此", slot.x + slot.w / 2, dockY + dockH / 2); // 繪製提示文字
    } // 結束 if

    // 若交卷後此槽答錯，在右上角繪製紅色藥丸徽章提示正確解答
    if (isQuizEvaluated && !slot.isCorrect) {
      fill(239, 68, 68); // 紅色底塊
      noStroke(); // 關閉邊框
      rect(slot.x + slot.w - 122, slot.y + 6, 114, 20, 4); // 繪製錯誤徽章膠囊
      fill(255); // 白色文字
      textSize(10); // 字體大小
      textStyle(BOLD); // 粗體
      text("✗ 應為: " + slot.expectedTitle, slot.x + slot.w - 65, slot.y + 16); // 繪製正確解答
    } else if (isQuizEvaluated && slot.isCorrect) {
      fill(16, 185, 129); // 綠色底塊
      noStroke(); // 關閉邊框
      rect(slot.x + slot.w - 64, slot.y + 6, 56, 20, 4); // 繪製正確徽章膠囊
      fill(255); // 白色文字
      textSize(11); // 字體大小
      textStyle(BOLD); // 粗體
      text("✓ 正確", slot.x + slot.w - 36, slot.y + 16); // 繪製正確勾勾
    } // 結束 else if
  } // 結束 for 迴圈
  pop(); // 還原繪圖狀態
} // 結束 drawTopAnimalPictureSlots 函式

// 備用幾何動物向量圖示繪製函式（確保圖片未載入完成時亦能正確顯示）
function renderFallbackAnimalVector(id, x, y, w, h) {
  push(); // 儲存繪圖狀態
  const cx = x + w / 2; // 中心 X
  const cy = y + h / 2; // 中心 Y
  noStroke(); // 關閉邊框
  fill(245, 158, 11); // 暖黃動物底色
  ellipse(cx, cy, 50, 45); // 繪製小動物面部輪廓
  fill(15, 23, 42); // 眼睛深色
  ellipse(cx - 10, cy - 4, 6, 8); // 左眼
  ellipse(cx + 10, cy - 4, 6, 8); // 右眼
  fill(254, 205, 211); // 腮紅
  ellipse(cx - 16, cy + 6, 8, 5); // 左腮紅
  ellipse(cx + 16, cy + 6, 8, 5); // 右腮紅
  pop(); // 還原繪圖狀態
} // 結束 renderFallbackAnimalVector 函式

// 繪製交卷按鈕、重測按鈕與總成績資訊函式
function drawActionButtonsAndScore() {
  push(); // 儲存繪圖狀態

  // 1. 繪製成績顯示看板或操作提示：符合題目「交卷看成績按鈕後，才顯示出總成績」之規範
  if (isQuizEvaluated) {
    const isPassed = finalScorePercentage >= 60; // 判斷總成績是否高於等於 60%
    const scoreY = responsiveQuizLayout.statusAreaY + 10; // 成績看板 Y 座標

    fill(isPassed ? color(220, 252, 231) : color(255, 237, 213)); // 及格淺綠底，未達標淺橘底
    stroke(isPassed ? color(34, 197, 94) : color(249, 115, 22)); // 及格綠框，未達標橘框
    strokeWeight(1.5); // 邊框寬度 1.5px
    rect(width / 2 - 225, scoreY - 14, 450, 27, 13); // 繪製膠囊型看板外框

    noStroke(); // 關閉邊框
    fill(isPassed ? color(21, 128, 61) : color(194, 65, 12)); // 深綠或深橘文字
    textSize(13); // 字體大小 13px
    textStyle(BOLD); // 粗體字

    // 格式化總成績字串
    const resultText = isPassed
      ? `🎉 總成績：${finalScorePercentage} 分（答對 ${correctCountValue}/6 題）- 達到60%！施放彩帶慶祝！`
      : `📝 總成績：${finalScorePercentage} 分（答對 ${correctCountValue}/6 題）- 未達60%，點擊重新測驗再試一次！`;

    text(resultText, width / 2, scoreY); // 繪製成績文字
  } else {
    noStroke(); // 關閉邊框
    fill(100, 116, 139); // 提示字深灰色
    textSize(11.5); // 字體大小 11.5px
    textStyle(NORMAL); // 標準體
    text("提示：請用滑鼠或手指將下方動物名稱拖曳至上方對應動物圖片下方，完成後點擊『交卷看成績』！", width / 2, responsiveQuizLayout.statusAreaY + 10); // 繪製操作提示
  } // 結束 else

  // 2. 繪製「交卷看成績」按鈕
  const isHoverSubmit = checkPointInRectangle(mouseX, mouseY, submitBtnRect.x, submitBtnRect.y, submitBtnRect.w, submitBtnRect.h); // 檢查交卷懸停
  fill(isHoverSubmit ? color(29, 78, 216) : color(37, 99, 235)); // 經典皇家藍底色
  stroke(96, 165, 250); // 藍白高光外框
  strokeWeight(isHoverSubmit ? 2 : 1); // 懸停加粗
  rect(submitBtnRect.x, submitBtnRect.y, submitBtnRect.w, submitBtnRect.h, 6); // 繪製按鈕矩形

  fill(255); // 白色文字
  noStroke(); // 關閉邊框
  textSize(13.5); // 字體大小 13.5px
  textStyle(BOLD); // 粗體
  text("✓ 交卷看成績", submitBtnRect.x + submitBtnRect.w / 2, submitBtnRect.y + submitBtnRect.h / 2); // 繪製按鈕標籤

  // 3. 繪製「重新測驗」按鈕
  const isHoverRetry = checkPointInRectangle(mouseX, mouseY, retryBtnRect.x, retryBtnRect.y, retryBtnRect.w, retryBtnRect.h); // 檢查重測懸停
  fill(isHoverRetry ? color(71, 85, 105) : color(100, 116, 139)); // 優雅石板灰底色
  stroke(148, 163, 184); // 灰白邊框
  strokeWeight(isHoverRetry ? 2 : 1); // 懸停加粗
  rect(retryBtnRect.x, retryBtnRect.y, retryBtnRect.w, retryBtnRect.h, 6); // 繪製按鈕矩形

  fill(255); // 純白文字
  noStroke(); // 關閉邊框
  textSize(13); // 字體大小 13px
  textStyle(BOLD); // 粗體
  text("↺ 重新測驗", retryBtnRect.x + retryBtnRect.w / 2, retryBtnRect.y + retryBtnRect.h / 2); // 繪製重測標籤

  pop(); // 還原繪圖狀態
} // 結束 drawActionButtonsAndScore 函式

// 繪製下方動物拖曳選項卡片池區域函式
function drawDraggableAnimalOptionsArea() {
  push(); // 儲存繪圖狀態

  // 遍歷所有選項卡片
  for (let i = 0; i < animalDraggableCards.length; i++) {
    const card = animalDraggableCards[i];

    // 若該卡片正在被拖曳中，跳過此處，由 renderActiveFloatingCardOnTop 在最頂層繪製
    if (card === activeDraggingCard) {
      continue;
    } // 結束 if

    // 使用 lerp 內插法實現滑順彈性歸位動畫效果
    card.currentX = lerp(card.currentX, card.targetX, 0.22);
    card.currentY = lerp(card.currentY, card.targetY, 0.22);

    // 繪製單張卡片外觀
    renderDraggableCard(card, false);
  } // 結束 for 迴圈
  pop(); // 還原繪圖狀態
} // 結束 drawDraggableAnimalOptionsArea 函式

// 繪製單一動物選項卡片外觀細節函式（白底精緻卡片風格）
function renderDraggableCard(card, isFloatingOnTop) {
  push(); // 儲存繪圖狀態
  const isHover = checkPointInRectangle(mouseX, mouseY, card.currentX, card.currentY, card.w, card.h); // 檢查滑鼠懸停
  const isPlacedInSlot = card.assignedSlot !== null; // 檢查是否已置入目標槽

  if (isFloatingOnTop) {
    noStroke(); // 關閉邊框
    fill(0, 0, 0, 35); // 懸空柔和立體投影
    rect(card.currentX + 3, card.currentY + 5, card.w, card.h, 6); // 繪製陰影矩形

    stroke(245, 158, 11); // 拖曳中卡片耀眼金黃外框
    strokeWeight(2.5); // 粗外框 2.5px
    fill(255, 251, 235); // 拖曳中卡片溫暖米白底色
  } else if (isPlacedInSlot) {
    stroke(148, 163, 184); // 置入槽內之低調石板灰外框
    strokeWeight(1.2); // 邊框寬度 1.2px
    fill(255); // 置入槽內純白底色
  } else {
    stroke(isHover ? color(59, 130, 246) : color(203, 213, 225)); // 懸停時高亮天藍邊框
    strokeWeight(isHover ? 2 : 1.2); // 懸停時加粗
    fill(isHover ? color(248, 250, 252) : color(255)); // 懸停時極淡灰底色
  } // 結束 else

  rect(card.currentX, card.currentY, card.w, card.h, 6); // 繪製卡片圓角矩形

  noStroke(); // 關閉邊框
  fill(isFloatingOnTop ? color(245, 158, 11) : color(2, 132, 199)); // 卡片左側裝飾條色彩
  rect(card.currentX + 2, card.currentY + 2, 4, card.h - 4, 3); // 繪製卡片左側裝飾直條

  fill(isFloatingOnTop ? color(180, 83, 9) : color(15, 23, 42)); // 動物名稱深色文字
  textSize(card.w < 200 ? 12 : 13); // 依卡片寬度自適應字體大小
  textStyle(BOLD); // 粗體字
  textAlign(CENTER, CENTER); // 置中對齊
  text(card.nameText, card.currentX + card.w / 2 + 3, card.currentY + card.h * 0.38); // 繪製動物名稱與 Emoji

  fill(100, 116, 139); // 中文提示文字填色
  textSize(9.5); // 字體大小 9.5px
  textStyle(NORMAL); // 標準體
  text(card.subText, card.currentX + card.w / 2 + 3, card.currentY + card.h * 0.74); // 繪製分類標籤
  pop(); // 還原繪圖狀態
} // 結束 renderDraggableCard 函式

// 繪製頂層懸浮之被拖曳動物卡片函式
function renderActiveFloatingCardOnTop() {
  if (!activeDraggingCard) {
    return; // 若當前無卡片拖曳，立即返回
  } // 結束 if
  renderDraggableCard(activeDraggingCard, true); // 呼叫卡片渲染函式並設定頂層浮起為 true
} // 結束 renderActiveFloatingCardOnTop 函式

// 滑鼠按下事件監聽函式
function mousePressed() {
  processPointerDownAction(mouseX, mouseY); // 呼叫通用指標按下處理函式
} // 結束 mousePressed 函式

// 行動裝置觸控按下事件監聽函式
function touchStarted() {
  if (touches.length > 0) {
    processPointerDownAction(touches[0].x, touches[0].y); // 取得第一觸控點並呼叫處理函式
  } // 結束 if
  return false; // 阻止瀏覽器預設手勢行為
} // 結束 touchStarted 函式

// 通用指標按下邏輯處理函式
function processPointerDownAction(px, py) {
  // 1. 檢查是否點擊「交卷看成績」按鈕
  if (checkPointInRectangle(px, py, submitBtnRect.x, submitBtnRect.y, submitBtnRect.w, submitBtnRect.h)) {
    evaluateUserSubmission(); // 執行交卷評分
    return; // 結束處理
  } // 結束 if

  // 2. 檢查是否點擊「重新測驗」按鈕
  if (checkPointInRectangle(px, py, retryBtnRect.x, retryBtnRect.y, retryBtnRect.w, retryBtnRect.h)) {
    resetQuizToInitialState(); // 執行測驗狀態重置
    return; // 結束處理
  } // 結束 if

  // 3. 檢查是否點擊了六個動物拖曳選項卡片中的任一張
  for (let i = animalDraggableCards.length - 1; i >= 0; i--) {
    const card = animalDraggableCards[i];
    if (checkPointInRectangle(px, py, card.currentX, card.currentY, card.w, card.h)) {
      activeDraggingCard = card; // 設定被拖曳的目標卡片
      mouseOffsetX = px - card.currentX; // 計算滑鼠與卡片 X 軸偏移量
      mouseOffsetY = py - card.currentY; // 計算滑鼠與卡片 Y 軸偏移量

      // 若卡片原本已在某目標槽內，先將該槽騰空解綁
      if (card.assignedSlot !== null) {
        card.assignedSlot.placedCard = null; // 解除槽對卡片之參照
        card.assignedSlot = null; // 解除卡片對槽之參照
      } // 結束 if

      animalDraggableCards.splice(i, 1); // 將卡片從原位置移除
      animalDraggableCards.push(card); // 推至陣列最末端以保證繪製於最頂層
      break; // 結束檢查迴圈
    } // 結束 if
  } // 結束 for 迴圈
} // 結束 processPointerDownAction 函式

// 滑鼠移動拖曳事件監聽函式
function mouseDragged() {
  processPointerMoveAction(mouseX, mouseY); // 呼叫通用指標移動處理函式
} // 結束 mouseDragged 函式

// 行動裝置觸控移動事件監聽函式
function touchMoved() {
  if (touches.length > 0) {
    processPointerMoveAction(touches[0].x, touches[0].y); // 取得第一觸控點並呼叫處理函式
  } // 結束 if
  return false; // 阻止瀏覽器預設捲動行為
} // 結束 touchMoved 函式

// 通用指標移動邏輯處理函式
function processPointerMoveAction(px, py) {
  if (activeDraggingCard) {
    activeDraggingCard.currentX = px - mouseOffsetX; // 即時更新卡片 X 座標
    activeDraggingCard.currentY = py - mouseOffsetY; // 即時更新卡片 Y 座標
    activeDraggingCard.targetX = activeDraggingCard.currentX; // 同步目標 X 座標
    activeDraggingCard.targetY = activeDraggingCard.currentY; // 同步目標 Y 座標
  } // 結束 if
} // 結束 processPointerMoveAction 函式

// 滑鼠放開事件監聽函式
function mouseReleased() {
  processPointerUpAction(mouseX, mouseY); // 呼叫通用指標放開處理函式
} // 結束 mouseReleased 函式

// 行動裝置觸控放開事件監聽函式
function touchEnded() {
  processPointerUpAction(mouseX, mouseY); // 呼叫通用指標放開處理函式
  return false; // 阻止瀏覽器預設行為
} // 結束 touchEnded 函式

// 通用指標放開邏輯處理函式（包含吸附、交換與彈回機制）
function processPointerUpAction(px, py) {
  if (!activeDraggingCard) {
    return; // 若當前無卡片拖曳，立即返回
  } // 結束 if

  const releasedCard = activeDraggingCard; // 取得被釋放的卡片
  const cardCenterX = releasedCard.currentX + releasedCard.w / 2; // 計算卡片中心點 X 座標
  const cardCenterY = releasedCard.currentY + releasedCard.h / 2; // 計算卡片中心點 Y 座標
  let placedInAnySlot = false; // 標記是否成功放入某個目標槽

  // 遍歷六個目標放置槽，判定是否釋放於該槽內
  for (let i = 0; i < animalQuestionSlots.length; i++) {
    const slot = animalQuestionSlots[i];
    if (checkPointInRectangle(cardCenterX, cardCenterY, slot.x, slot.y, slot.w, slot.h)) {
      placedInAnySlot = true; // 標記成功放入槽

      // 若該槽原本已有其他卡片，將原卡片踢回下方選項池
      if (slot.placedCard !== null && slot.placedCard !== releasedCard) {
        const oldCard = slot.placedCard;
        oldCard.assignedSlot = null; // 解除舊卡片與槽之綁定
        oldCard.targetX = oldCard.homeX; // 讓舊卡片飛回選項池原始位置
        oldCard.targetY = oldCard.homeY;
      } // 結束 if

      slot.placedCard = releasedCard; // 槽綁定當前卡片
      releasedCard.assignedSlot = slot; // 卡片綁定當前槽

      // 設定卡片精準吸附於目標動物圖片下方的放置座上
      releasedCard.targetX = slot.x + (slot.w - releasedCard.w) / 2;
      releasedCard.targetY = slot.y + slot.h - releasedCard.h - 6;
      break; // 結束巡訪迴圈
    } // 結束 if
  } // 結束 for 迴圈

  // 若未放入任何目標槽，自動平滑飛回下方選項池原始位置
  if (!placedInAnySlot) {
    releasedCard.assignedSlot = null; // 解除槽綁定
    releasedCard.targetX = releasedCard.homeX; // 目標設為池中家目錄 X
    releasedCard.targetY = releasedCard.homeY; // 目標設為池中家目錄 Y
  } // 結束 if

  activeDraggingCard = null; // 清空當前拖曳物件
} // 結束 processPointerUpAction 函式

// 交卷並計算測驗成績函式
function evaluateUserSubmission() {
  correctCountValue = 0; // 重設答對計數為 0

  // 遍歷所有六個目標放置槽進行答案比對
  for (let i = 0; i < animalQuestionSlots.length; i++) {
    const slot = animalQuestionSlots[i];
    if (slot.placedCard !== null && slot.placedCard.id === slot.correctId) {
      slot.isCorrect = true; // 答對標記為 true
      correctCountValue++; // 答對題數加 1
    } else {
      slot.isCorrect = false; // 答錯標記為 false
    } // 結束 else
  } // 結束 for 迴圈

  // 計算四捨五入後的百分比總成績
  finalScorePercentage = Math.round((correctCountValue / animalQuestionSlots.length) * 100);

  // 標記測驗已交卷（畫面立即揭曉總成績）
  isQuizEvaluated = true;

  // 依據題目嚴格規定：當成績高於 60%（>= 60%）時，啟動畫布彩帶特效！
  if (finalScorePercentage >= 60) {
    isRibbonShowerActive = true; // 啟動彩帶效果
    triggerRibbonShowerBurst(); // 觸發全螢幕彩帶爆發飄落
  } else {
    isRibbonShowerActive = false; // 未達 60% 則不啟動彩帶效果
  } // 結束 else
} // 結束 evaluateUserSubmission 函式

// 重新測驗狀態重置函式
function resetQuizToInitialState() {
  // 清空所有六個放置槽之內容
  for (let i = 0; i < animalQuestionSlots.length; i++) {
    animalQuestionSlots[i].placedCard = null;
    animalQuestionSlots[i].isCorrect = false;
  } // 結束 for 迴圈

  // 將所有選項卡片解除綁定並送回選項池
  for (let i = 0; i < animalDraggableCards.length; i++) {
    animalDraggableCards[i].assignedSlot = null;
    animalDraggableCards[i].targetX = animalDraggableCards[i].homeX;
    animalDraggableCards[i].targetY = animalDraggableCards[i].homeY;
  } // 結束 for 迴圈

  isQuizEvaluated = false; // 重設為未交卷
  finalScorePercentage = 0; // 重設總分為 0
  correctCountValue = 0; // 重設答對數為 0
  isRibbonShowerActive = false; // 關閉彩帶特效
} // 結束 resetQuizToInitialState 函式

// 鍵盤按下事件監聽函式：提供展示與教學檢測便利快捷鍵
function keyPressed() {
  if (key === '1') {
    // 按鍵 '1'：自動填入 6 題全部正確並交卷（測試高於60%成績與彩帶特效）
    autoCompleteAllCorrectAnswers();
    evaluateUserSubmission();
  } else if (key === '2') {
    // 按鍵 '2'：僅填入 3 題正確（測試 50% 未達 60% 成績之未放彩帶狀態）
    autoCompletePartialAnswers(3);
    evaluateUserSubmission();
  } else if (key === 'r' || key === 'R') {
    // 按鍵 'R'：重置測驗回到初始未作答狀態
    resetQuizToInitialState();
  } // 結束 else if
} // 結束 keyPressed 函式

// 自動填入所有六題正確答案的輔助教學函式
function autoCompleteAllCorrectAnswers() {
  autoCompletePartialAnswers(6); // 呼叫填入函式填入 6 題
} // 結束 autoCompleteAllCorrectAnswers 函式

// 自動填入指定數量正確答案的輔助教學函式
function autoCompletePartialAnswers(targetCount) {
  resetQuizToInitialState(); // 先重置當前狀態
  for (let i = 0; i < targetCount; i++) {
    const slot = animalQuestionSlots[i]; // 取得目標選項槽
    const matchingCard = animalDraggableCards.find(c => c.id === slot.correctId); // 尋找對應之正確卡片
    if (matchingCard) {
      slot.placedCard = matchingCard; // 槽綁定該卡片
      matchingCard.assignedSlot = slot; // 卡片綁定該槽
      matchingCard.targetX = slot.x + (slot.w - matchingCard.w) / 2; // 定位至該槽底座
      matchingCard.targetY = slot.y + slot.h - matchingCard.h - 6; // 定位至該槽底座
      matchingCard.currentX = matchingCard.targetX; // 立即就位
      matchingCard.currentY = matchingCard.targetY; // 立即就位
    } // 結束 if
  } // 結束 for 迴圈
} // 結束 autoCompletePartialAnswers 函式

// 初始化彩帶粒子系統函式（白底高對比鮮豔調色盤）
function setupRibbonShowerParticles(count) {
  ribbonShowerParticles = []; // 清空彩帶陣列

  // 定義鮮豔明亮的慶祝彩帶色彩陣列（適合白底高對比）
  const brightFestiveColors = [
    color(239, 68, 68), // 鮮紅彩帶
    color(245, 158, 11), // 金黃彩帶
    color(16, 185, 129), // 翠綠彩帶
    color(37, 99, 235), // 寶藍彩帶
    color(168, 85, 247), // 炫紫彩帶
    color(236, 72, 153) // 亮粉彩帶
  ]; // 結束調色盤陣列

  // 產生指定數量的彩帶粒子物件
  for (let i = 0; i < count; i++) {
    ribbonShowerParticles.push({
      x: random(0, width), // 隨機水平起始 X 座標
      y: random(-height, 0), // 隨機垂直起始天花板外 Y 座標
      w: random(8, 14), // 彩帶寬度
      h: random(18, 28), // 彩帶長度
      vx: random(-2, 2), // 水平飄動速度
      vy: random(2.5, 5.5), // 下墜速度
      rotationAngle: random(0, TWO_PI), // 旋轉角度
      vRotation: random(-0.08, 0.08), // 旋轉角速度
      wavePhase: random(0, TWO_PI), // 3D 翻轉正弦波動相位
      vWave: random(0.04, 0.09), // 翻轉波動速度
      color: brightFestiveColors[i % brightFestiveColors.length] // 指定鮮豔顏色
    }); // 結束 push
  } // 結束 for 迴圈
} // 結束 setupRibbonShowerParticles 函式

// 觸發彩帶慶祝爆發函式
function triggerRibbonShowerBurst() {
  // 將所有彩帶重新均勻散佈於畫布上方空中，營造壯麗瀑布飄落感
  for (let i = 0; i < ribbonShowerParticles.length; i++) {
    const p = ribbonShowerParticles[i];
    p.x = random(0, width);
    p.y = random(-height * 0.7, height * 0.2);
    p.vy = random(3, 6);
  } // 結束 for 迴圈
} // 結束 triggerRibbonShowerBurst 函式

// 更新並繪製慶祝彩帶效果函式
function updateAndRenderRibbonShower() {
  push(); // 儲存繪圖狀態
  noStroke(); // 關閉邊框
  for (let i = 0; i < ribbonShowerParticles.length; i++) {
    const p = ribbonShowerParticles[i];
    p.y += p.vy; // 垂直受重力下落
    p.x += p.vx + sin(p.wavePhase) * 1.5; // 水平受微風左右飄動
    p.rotationAngle += p.vRotation; // 旋轉角度累加
    p.wavePhase += p.vWave; // 翻轉相位累加

    // 若彩帶飄落至螢幕底部外，循環返回頂部持續飄落
    if (p.y > height + 30) {
      p.y = random(-50, -10);
      p.x = random(0, width);
      p.vy = random(2.5, 5.5);
    } // 結束 if

    // 透過 3D 平面投影模擬彩帶空中翻轉透視
    push();
    translate(p.x, p.y); // 平移原點至彩帶中心
    rotate(p.rotationAngle); // 旋轉彩帶
    scale(cos(p.wavePhase), 1); // 透過 cos 函數縮放 X 軸呈現 3D 翻面動態
    fill(p.color); // 設定彩帶顏色
    rectMode(CENTER); // 置中模式
    rect(0, 0, p.w, p.h, 2); // 繪製圓角小彩帶長條
    pop();
  } // 結束 for 迴圈
  pop(); // 還原繪圖狀態
} // 結束 updateAndRenderRibbonShower 函式

// 輔助幾何工具函式：判定點是否落於矩形範圍內
function checkPointInRectangle(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh; // 回傳判定布林值
} // 結束 checkPointInRectangle 函式

// 定義六大海洋生物名稱、圖片索引與分類特徵資料（海洋生物篇）
  const animalDataSet = [
    {
      id: 1, // 海洋生物編號 1
      animalTitle: "🐳 藍鯨 (Blue Whale)", // 名稱與 Emoji
      classification: "哺乳綱 / 地球最大動物", // 分類小標籤
      imageIndex: 0 // 對應 animal_1.png 索引
    },
    {
      id: 2, // 海洋生物編號 2
      animalTitle: "🦈 大白鯊 (Great White Shark)", // 名稱與 Emoji
      classification: "軟骨魚綱 / 海洋頂級掠食者", // 分類小標籤
      imageIndex: 1 // 對應 animal_2.png 索引
    },
    {
      id: 3, // 海洋生物編號 3
      animalTitle: "🐬 海豚 (Dolphin)", // 名稱與 Emoji
      classification: "哺乳綱 / 海洋高智商靈獸", // 分類小標籤
      imageIndex: 2 // 對應 animal_3.png 索引
    },
    {
      id: 4, // 海洋生物編號 4
      animalTitle: "🐙 章魚 (Octopus)", // 名稱與 Emoji
      classification: "頭足綱 / 三心臟八爪大師", // 分類小標籤
      imageIndex: 3 // 對應 animal_4.png 索引
    },
    {
      id: 5, // 海洋生物編號 5
      animalTitle: "🐢 海龜 (Sea Turtle)", // 名稱與 Emoji
      classification: "爬行綱 / 海洋深潛漫遊者", // 分類小標籤
      imageIndex: 4 // 對應 animal_5.png 索引
    },
    {
      id: 6, // 海洋生物編號 6
      animalTitle: "🦀 帝王蟹 (King Crab)", // 名稱與 Emoji
      classification: "軟甲綱 / 深海甲殼巨無霸", // 分類小標籤
      imageIndex: 5 // 對應 animal_6.png 索引
    }
  ]; // 結束海洋生物題庫陣列