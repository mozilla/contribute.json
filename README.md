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
        "type": "git",
        "url": "https://github.com/mozilla/bedrock",
        "license": "MPL2",
        // optional
        "tests": "https://ci.mozilla.org/job/bedrock/",
        "clone": "https://github.com/mozilla/bedrock.git"
    },
    "participate": {
        "home": "https://wiki.mozilla.org/Mozilla.org",
        "docs": "http://bedrock.readthedocs.org/",
        // optional
        "mailing-list": "https://www.mozilla.org/about/forums/#dev-mozilla-org",
        "irc": "irc://irc.mozilla.org/#www"
    },

    // optional
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
standard and we publish our our schema at
[schema.json](https://github.com/mozilla/contribute.json/blob/master/schema.json).

You can, for example, use the [json-schema-validator](https://json-schema-validator.herokuapp.com/)
to validate your own `contribute.json` against this schema.
