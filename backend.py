from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

if __name__ == "__main__": # if you use flask.run I think you dont need this
    app.run(debug=True)