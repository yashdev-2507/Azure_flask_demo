from flask import Flask, render_template_string
import random

app = Flask(__name__)

HTML_PAGE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rock Paper Scissors - Azure Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            color: #fff;
        }
        .game {
            text-align: center;
            background: rgba(0,0,0,0.5);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }
        h1 {
            margin-bottom: 20px;
        }
        .choices button {
            margin: 10px;
            padding: 10px 20px;
            border: none;
            background: #ff9800;
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: 0.3s;
        }
        .choices button:hover {
            background: #e68900;
        }
        #result {
            margin-top: 20px;
            font-size: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="game">
        <h1>✊ ✋ ✌ Rock Paper Scissors</h1>
        <p>Choose one:</p>
        <div class="choices">
            <button onclick="play('rock')">Rock</button>
            <button onclick="play('paper')">Paper</button>
            <button onclick="play('scissors')">Scissors</button>
        </div>
        <div id="result"></div>
    </div>

    <script>
        function play(choice) {
            fetch(`/play?choice=${choice}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById("result").innerHTML = 
                  "You chose: " + data.user + "<br>" +
                  "Computer chose: " + data.computer + "<br><br>" +
                  "<b>" + data.result + "</b>";
            });
        }
    </script>
</body>
</html>
"""

@app.route("/")
def home():
    return render_template_string(HTML_PAGE)

@app.route("/play")
def play():
    from flask import request, jsonify
    user_choice = request.args.get("choice")
    choices = ["rock", "paper", "scissors"]
    comp_choice = random.choice(choices)

    if user_choice == comp_choice:
        result = "It's a Tie!"
    elif (user_choice == "rock" and comp_choice == "scissors") or \
         (user_choice == "paper" and comp_choice == "rock") or \
         (user_choice == "scissors" and comp_choice == "paper"):
        result = "🎉 You Win!"
    else:
        result = "😢 You Lose!"

    return jsonify({"user": user_choice, "computer": comp_choice, "result": result})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

