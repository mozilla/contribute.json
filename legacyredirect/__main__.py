#!/usr/bin/env python

import os

from flask import Flask, redirect

app = Flask(__name__)


@app.route('/')
def index_html():
    return redirect('https://www.contributejson.org/', code=301)


@app.route('/<path:path>')
def catch_all(path):
    return redirect('https://www.contributejson.org/' + path, code=301)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    app.run(host=host, port=port)
