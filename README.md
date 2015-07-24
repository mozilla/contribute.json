contribute.json
===============

A JSON schema for open-source project contribution data.

This is currently a proposal and is not yet stable. Suggestions and pull-requests welcome.

This is the current draft. I'm presenting the schema as an example instance using `mozilla/bedrock`
as the subject. Previous discussion can be found in the comments of [the original gist](https://gist.github.com/pmclanahan/a162224376ca110b4a40).

```json
{
    // required
    "name": "Bedrock",
    "description": "The app powering (most of) www.mozilla.org.",
    "repository": {
        "url": "https://github.com/mozilla/bedrock",
        "license": "MPL2",
        // optional
        "type": "git",
        "tests": "https://ci.mozilla.org/job/bedrock/",
        "clone": "https://github.com/mozilla/bedrock.git"
    },

    // optional
    "participate": {
        "home": "https://wiki.mozilla.org/Mozilla.org",
        "docs": "http://bedrock.readthedocs.org/",
        // optional
        "mailing-list": "https://www.mozilla.org/about/forums/#dev-mozilla-org",
        "irc": "irc://irc.mozilla.org/#www",
        "irc-contacts": [
            "pmac",
            "jgmize",
            "malexis",
            "cmore"
        ]
    },
    "bugs": {
        "list": "https://bugzilla.mozilla.org/buglist.cgi?query_format=advanced&bug_status=UNCONFIRMED&bug_status=NEW&product=www.mozilla.org",
        "report": "https://bugzilla.mozilla.org/enter_bug.cgi?product=www.mozilla.org&component=Bedrock",
        "mentored": "https://bugzilla.mozilla.org/buglist.cgi?f1=bug_mentor&o1=isnotempty&query_format=advanced&bug_status=NEW&product=www.mozilla.org&list_id=10866041"
    },
    "urls": {
        "prod": "https://www.mozilla.org",
        "stage": "https://www.allizom.org",
        "dev": "https://www-dev.allizom.org",
        "demo1": "https://www-demo1.allizom.org"
    },
    "keywords": [
        "python",
        "less-css",
        "django",
        "html5",
        "jquery"
    ]
}
```

Validation
----------

We're currently using the [JSON Schema](http://json-schema.org/)
standard and we publish our schema at
[schema.json](https://github.com/mozilla/contribute.json/blob/master/schema.json).

You can, for example, use the [json-schema-validator](https://json-schema-validator.herokuapp.com/)
to validate your own `contribute.json` against this schema.


Flask app
---------

There's a server-side app that is currently available on
https://www.contributejson.org

## Running the Flask app locally

```bash
# clone from the main repo
git clone https://github.com/mozilla/contribute.json.git

# go into the directory
cd contribute.json

# using virtualenv wrapper, create a new virtual environment for the project.
mkvirtualenv contribute.json

# intall the requirements
pip install -r requirements.txt

# install the npm dependencies
npm install

# generate the CSS files (use `grunt watch` to work on the LESS files)
grunt less

# Run the app with
DEBUG=true python app

open http://localhost:5000/
```

NB! Most of the functionality is built as an [AngularJS](https://angularjs.org/) app.
