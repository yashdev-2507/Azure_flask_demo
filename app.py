from flask import Flask, render_template_string

app = Flask(__name__)

HTML_PAGE = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Emoji Catch Game - Azure Demo</title>
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #ff9966, #ff5e62);
      font-family: Arial, sans-serif;
    }
    canvas {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }
    #score {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 24px;
      color: white;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div id="score">Score: 0</div>
  <canvas id="gameCanvas" width="400" height="600"></canvas>

  <script>
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let basket = { x: 160, y: 550, width: 80, height: 20 };
    let emojis = ["🍕","🎩","🚀","🐱","🍔","⚡","🌈","🎮"];
    let falling = [];
    let score = 0;

    function drawBasket() {
      ctx.fillStyle = "#0078D4";
      ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
    }

    function drawEmojis() {
      ctx.font = "28px Arial";
      falling.forEach(e => {
        ctx.fillText(e.emoji, e.x, e.y);
      });
    }

    function updateEmojis() {
      falling.forEach(e => e.y += 3);
      falling = falling.filter(e => {
        if (e.y > basket.y && e.x > basket.x && e.x < basket.x + basket.width) {
          score += 10;
          document.getElementById("score").innerText = "Score: " + score;
          return false;
        }
        return e.y < 600;
      });
      if (Math.random() < 0.03) {
        falling.push({ emoji: emojis[Math.floor(Math.random()*emojis.length)], x: Math.random()*370, y: 0 });
      }
    }

    function gameLoop() {
      ctx.clearRect(0, 0, 400, 600);
      drawBasket();
      drawEmojis();
      updateEmojis();
      requestAnimationFrame(gameLoop);
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" && basket.x > 0) basket.x -= 20;
      if (e.key === "ArrowRight" && basket.x < 320) basket.x += 20;
    });

    gameLoop();
  </script>
</body>
</html>
"""

@app.route("/")
def home():
    return render_template_string(HTML_PAGE)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

