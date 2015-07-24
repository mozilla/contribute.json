import os
import json
import hashlib

import jsonschema
import requests
from flask import (
    Flask, request, jsonify, send_from_directory, render_template, abort,
    send_file)
from flask.ext.cacheify import init_cacheify
from flask.views import MethodView


APP_ROOT = os.path.dirname(os.path.abspath(__file__))
DEBUG = os.environ.get('DEBUG', False) in ('true', '1', 'y', 'yes')

SCHEMA_URL = 'https://raw.githubusercontent.com/mozilla/contribute.json/master/schema.json'

KNOWN_URLS_URL = 'https://raw.githubusercontent.com/mozilla/contribute.json/master/knownurls.txt'

SAMPLE = """
{
  "name": "contribute.json",
  "description": "Standard to describe open source projects",
  "repository": {
    "url": "https://github.com/mozilla/contribute.json",
    "license": "MPL2"
  },
  "keywords": [
    "JSON",
    "Python",
    "Flask"
  ]
}
""".strip()

app = Flask(__name__)
cache = init_cacheify(app)
app.debug = DEBUG


def cache_set(key, value, *args, **options):
    if isinstance(value, (dict, list, bool)):
        value = json.dumps(value)
    cache.set(key, value, *args, **options)


def cache_get(key, default=None):
    value = cache.get(key)
    if value is None:
        value = default
    if value is not None and not isinstance(value, (dict, list, bool)):
        value = json.loads(value)
    return value


@app.route('/contribute.json')
def this_contribute_json():
    return send_file('root_files/contribute.json')


@app.route('/')
def index_html():
    return catch_all('index.html')


@app.route('/static/<path:path>')
def serve_static(path):
    # should only be used when run from __main__.py.
    send_from_directory('static', path)


@app.route('/<path:path>')
def catch_all(path):
    context = {
        'DEBUG': DEBUG,
        'SAMPLE': SAMPLE,
    }
    if path == 'partials/schema.html':
        # only this partial needs this
        context['SCHEMA'] = json.dumps(get_schema(), indent=4)
    # if path == 'favicon.ico':
    #     path = 'static/favicon.ico'
    _, ext = os.path.splitext(path)
    if path and ext in ('.png', '.gif', '.css', '.js'):
        # most likely something's gone wrong
        default = False
    else:
        path = path or 'index.html'
        default = True
    # print "PATH", path, os.path.isfile(path)
    if os.path.isfile(os.path.join(APP_ROOT, 'templates', path)):
        return render_template(path, **context)
    elif default:
        return render_template('index.html', **context)
    else:
        abort(404)


def get_schema():
    schema_content = cache_get('schema')
    if schema_content is None:
        schema = requests.get(SCHEMA_URL)
        schema_content = schema.json()
        cache_set('schema', schema_content, 60 * 60)
    return schema_content


class ValidationView(MethodView):

    def post(self):
        if 'url' in request.args:
            url = request.args['url']
            # We need to make an exception. We can't load this sites
            # /contribute.json because since this is running in a single-thread
            # single-worker, we're running into a strange chicken and egg
            # situation.
            if url == request.host_url + 'contribute.json':
                url = (
                    'https://raw.githubusercontent.com/mozilla/contribute.json'
                    '/master/contribute.json'
                )
            try:
                response = requests.get(url)
                content = response.json()
            except (ValueError, requests.exceptions.RequestException) as exp:
                return jsonify({'request_error': str(exp)})
        elif request.data:
            try:
                content = json.loads(request.data)
            except ValueError as exp:
                return jsonify({
                    'request_error': str(exp),
                    'response': request.data,
                })
            url = None

        schema_content = get_schema()

        context = {
            'schema': schema_content,
            'schema_url': SCHEMA_URL,
            'response': content,
        }
        if url:
            context['url'] = url

        try:
            jsonschema.validate(
                content,
                schema_content
            )
            context['errors'] = None
        except jsonschema.ValidationError as error:
            context['validation_error'] = error.message
        except jsonschema.SchemaError as error:
            context['schema_error'] = error.message

        previous_urls = cache_get('urls_submitted', [])
        if url in previous_urls:
            previous_urls.remove(url)
        previous_urls.insert(0, url)
        cache_set('urls_submitted', previous_urls, 60 * 60 * 24 * 10)

        return jsonify(context)


app.add_url_rule('/validate', view_func=ValidationView.as_view('validate'))


class ValidateUrlView(MethodView):

    def post(self):
        url = request.json['url']
        result = cache_get('validation-%s' % url)
        if result is None:
            result = {
                'url': url,
            }
            try:
                r = requests.get(url)
                result['status_code'] = r.status_code
            except requests.ConnectionError:
                result['status_code'] = 500

            if result['status_code'] >= 200 and result['status_code'] < 500:
                cache_set('validation-%s' % url, result, 60)
        return jsonify(result)


app.add_url_rule('/validateurl',
                 view_func=ValidateUrlView.as_view('validateurl'))


class ExamplesView(MethodView):

    def get(self):
        known_urls = cache_get('known_urls')
        if known_urls is None:
            response = requests.get(KNOWN_URLS_URL)
            assert response.status_code == 200, response.status_code
            known_urls = []
            for line in response.content.splitlines():
                line = line.strip()
                if line and not line.startswith('#'):
                    known_urls.append(line)
            cache_set('known_urls', known_urls, 60 * 60)
        return jsonify({'urls': known_urls})


app.add_url_rule('/examples.json', view_func=ExamplesView.as_view('examples'))


class LoadView(MethodView):

    def get(self):
        url = request.args['url']
        cache_key = 'project_%s' % hashlib.md5(url).hexdigest()
        project = cache_get(cache_key)
        if project is None:
            response = requests.get(url)
            if response.status_code == 200:
                project = response.json()
                project['_url'] = url
                project['links'] = []
                if project.get('urls'):
                    if project.get('urls').get('prod'):
                        project['links'].append({
                            'url': project['urls']['prod'],
                            'label': 'prod'
                        })
                    if project.get('repository').get('url'):
                        project['links'].append({
                            'url': project['repository']['url'],
                            'label': 'repository'
                        })
                cache_set(cache_key, project, 60 * 60)

        return jsonify({'project': project})


app.add_url_rule('/load-example', view_func=LoadView.as_view('load_example'))
