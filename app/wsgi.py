import os.path

from whitenoise import WhiteNoise

from app import app


APP_ROOT = os.path.dirname(os.path.abspath(__file__))
app = WhiteNoise(app, root=os.path.join(APP_ROOT, 'static'), prefix='/static')
app.add_files(root=os.path.join(APP_ROOT, 'root_files'), prefix='')
