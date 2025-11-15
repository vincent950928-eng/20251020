let circles = [];
const COLORS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
const NUM_CIRCLES = 20;

// 爆破系統
let particles = [];
let popRings = [];

// ***** 新增的計分和顯示設定 *****
let score = 0;
const SCORE_TEXT_COLOR = '#eb6424';
const TEXT_SIZE = 32;
const TARGET_COLOR = '#ffca3a'; // 目標得分顏色
// *********************************

// 音效變數
let popSound;

function preload() {
    // 載入音效檔案。請確保檔案名為 'pop_sound.mp3'
    popSound = loadSound('pop_sound.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    // 初始化圓
    circles = [];
    for (let i = 0; i < NUM_CIRCLES; i++) {
        circles.push({
            x: random(width),
            y: random(height),
            r: random(50, 200),
            color: color(random(COLORS)),
            alpha: random(80, 255),
            speed: random(1, 5)
        });
    }

    if (popSound) {
        popSound.setVolume(0.5); // 設定音量為 50%
    }
}

function draw() {
    background('#fcf6bd');
    noStroke();
    
    // ===================================
    // 繪製文字
    // ===================================
    fill(SCORE_TEXT_COLOR);
    textSize(TEXT_SIZE);
    
    // 1. 繪製左上角文字
    textAlign(LEFT, TOP);
    text('414730969', 10, 10);
    
    // 2. 繪製右上角得分
    textAlign(RIGHT, TOP);
    text('得分: ' + score, width - 10, 10);

    // 更新並繪製氣球
    for (let c of circles) {
        c.y -= c.speed;

        // 氣球移出畫面頂端時，從底部重新出現
        if (c.y + c.r / 2 < 0) { 
            c.y = height + c.r / 2;  
            c.x = random(width);
            c.r = random(50, 200);
            c.color = color(random(COLORS));
            c.alpha = random(80, 255);
            c.speed = random(1, 5);
        }

        c.color.setAlpha(c.alpha); // 設定透明度
        fill(c.color); // 使用設定的顏色
        circle(c.x, c.y, c.r); // 畫圓

        // 裝飾
        let squareSize = c.r / 6;
        let angle = -PI / 4; 
        let distance = c.r / 2 * 0.65;
        let squareCenterX = c.x + cos(angle) * distance;
        let squareCenterY = c.y + sin(angle) * distance;
        fill(255, 255, 255, 120); 
        noStroke();
        rectMode(CENTER);
        rect(squareCenterX, squareCenterY, squareSize, squareSize);
    }

    // 更新並繪製粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.vy += 0.08; 
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        fill(p.rgba);
        noStroke();
        circle(p.x, p.y, p.size);
        if (p.life <= 0 || p.size <= 0.2) {
            particles.splice(i, 1);
        }
    }

    // 更新並繪製擴散光環
    for (let i = popRings.length - 1; i >= 0; i--) {
        let r = popRings[i];
        noFill();
        strokeWeight(2);
        stroke(red(r.color), green(r.color), blue(r.color), r.alpha);
        circle(r.x, r.y, r.radius);
        r.radius += r.growth;
        r.alpha -= r.fade;
        if (r.alpha <= 0) popRings.splice(i, 1);
    }
}

// ===================================
// 處理滑鼠點擊 (氣球爆破和計分邏輯)
// ===================================
function mousePressed() {
    // 從後往前迭代，確保點擊到最上層的氣球
    for (let i = circles.length - 1; i >= 0; i--) {
        let c = circles[i];
        
        // 檢查滑鼠點擊位置是否在氣球的半徑範圍內
        let d = dist(mouseX, mouseY, c.x, c.y);
        
        if (d < c.r / 2) {
            // 氣球被點擊
            popBalloon(c); 
            
            // 顏色判斷與計分
            // 將 p5 color 物件轉換為 #RRGGBB 小寫字串進行比較
            let colorHex = c.color.toString('#rrggbb').toLowerCase();

            if (colorHex === TARGET_COLOR) {
                score += 1; // 顏色 ffca3a 加一分
            } else {
                score -= 1; // 其他顏色扣一分
            }
            
            // 重置氣球並從底部出現
            c.y = height + c.r / 2;
            c.x = random(width);
            c.r = random(50, 200);
            c.color = color(random(COLORS));
            c.alpha = random(80, 255);
            c.speed = random(1, 5);
            
            // 一次只爆破一個氣球
            return; 
        }
    }
}

// 對單一氣球產生爆破（飛散粒子 + 擴散光環 + 音效）
function popBalloon(c) {
    if (popSound && !popSound.isPlaying()) {
        popSound.play(); 
    }
    
    // 粒子數依氣球大小決定
    let count = floor(map(c.r, 50, 200, 12, 40));
    let baseR = color(red(c.color), green(c.color), blue(c.color), 255);
    for (let i = 0; i < count; i++) {
        let ang = random(TWO_PI);
        let spd = random(1.5, map(c.r, 50, 200, 3, 8));
        let vx = cos(ang) * spd + random(-0.6, 0.6);
        let vy = sin(ang) * spd + random(-0.6, 0.6);
        let size = random(2, map(c.r, 50, 200, 5, 12));
        let life = floor(random(30, 80));
        // rgba 字串方便直接填入 fill()
        let rgba = `rgba(${Math.floor(red(baseR))},${Math.floor(green(baseR))},${Math.floor(blue(baseR))},1)`;
        particles.push({ x: c.x, y: c.y, vx, vy, size, life, rgba });
    }

    // 擴散光環
    popRings.push({
        x: c.x,
        y: c.y,
        radius: c.r * 0.6,
        growth: map(c.r, 50, 200, 1.2, 4),
        alpha: 200,
        fade: map(c.r, 50, 200, 3, 8),
        color: color(red(baseR), green(baseR), blue(baseR))
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // 重新分布圓的位置
    for (let c of circles) {
        c.x = random(width);
        c.y = random(height);
    }
}
