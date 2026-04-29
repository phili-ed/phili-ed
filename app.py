import os
import re
import random
from flask import Flask , request , render_template ,send_from_directory, url_for , redirect , flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import desc
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from supabase import create_client
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)

db_folder = os.path.join(os.getcwd(),"database")
db_path = os.path.join(db_folder,"database.db")
os.makedirs(db_folder,exist_ok=True)
db_uri=os.environ.get("DATABASE_URL")
url = os.environ.get("SUPABASE_URL")
key=os.environ.get("SUPABASE_KEY")
# admin_pw = generate_password_hash(os.environ.get("ADMIN_Q"),method='pbkdf2:sha256')
# owner_pw = generate_password_hash(os.environ.get("OWNER_K"),method='pbkdf2:sha256')
UPLOAD_FOLDER='uploads'

app.config['UPLOAD_FOLDER']=UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER,exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
# = f"sqlite:///{db_path}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-local')
supabase = create_client(url, key)

login_manager=LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits = ["100 per days","20 per hour"],
    storage_uri="memory://",
)


practice_topic=db.Table('practice_topic',
    db.Column('practice_id', db.Integer,db.ForeignKey('practices.id'),primary_key=True),
    db.Column('topic_id', db.Integer,db.ForeignKey('topics.id'),primary_key=True)
    )

class Topics(db.Model):
    __tablename__='topics'
    id=db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(50),nullable=False,unique=True)
    practices=db.relationship('Practices',secondary=practice_topic, back_populates='topics')

class Practices(db.Model):
    __tablename__='practices'
    id=db.Column(db.Integer,primary_key=True)
    questionLink = db.Column(db.String(300),nullable=False)
    answerLink = db.Column(db.String(300),nullable=False)
    questionLink_C = db.Column(db.String(300))
    answerLink_C = db.Column(db.String(300))
    level = db.Column(db.Integer)
    topics=db.relationship('Topics',secondary=practice_topic, back_populates='practices')

class User(db.Model, UserMixin):
    __tablename__='users'
    id=db.Column(db.Integer,primary_key=True)
    username=db.Column(db.String(50),unique=True,nullable=False)
    password=db.Column(db.Text,nullable=False)
    # role level 1=pupil  2=premium  3=inhouse tutor  4=web admin   5 = owner
    role_level=db.Column(db.Integer, default=1)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

from functools import wraps
from flask import abort
from flask_login import current_user

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # If the user isn't logged in OR is not an admin, block them
        if not current_user.is_authenticated or not current_user.role_level>=4:
            abort(403) # "Forbidden" error
        return f(*args, **kwargs)
    return decorated_function


def preload():
    with app.app_context():
        '''
        if Practices.query.first() is None:
            practices_all = [
            Practices(questionLink='DSE2026P2Q18.jpg' , answerLink='DSE2026P2Q18-ans.jpg'),
            Practices(questionLink='DSE2026P2Q21.jpg' ,  answerLink='DSE2026P2Q21-ans.jpg'),
            Practices(questionLink='DSE2026P2Q25.jpg' ,  answerLink='DSE2026P2Q25-ans.jpg') 
            ]
            db.session.bulk_save_objects(practices_all)
            db.session.commit()
            print("good practices preload")
        '''
        if Topics.query.first() is None:
            topics_all = [
                Topics(id=101,name='Temperature'),
                Topics(id=102,name='Transfer processes'),
                Topics(id=103,name='Specific heat capacity'),
                Topics(id=104,name='Latent heat and Evaporation'),
                Topics(id=105,name='Gas laws'),
                Topics(id=106,name='Kinetic theory'),
                Topics(id=201,name=' Quantities in motion'),
                Topics(id=202,name=' Relation of motion quantity '),
                Topics(id=203,name=' Force '),
                Topics(id=204,name=' Mechanical energy '),
                Topics(id=205,name=' Momentum '),
                Topics(id=206,name=' Moment '),
                Topics(id=207,name=' Projectile motion '),
                Topics(id=208,name=' Circular motion '),
                Topics(id=209,name=' Gravitation '),

                Topics(id=301,name=' Reflection '),
                Topics(id=302,name=' Refraction '),
                Topics(id=303,name=' Total internal reflection '),
                Topics(id=304,name=' Lens '),
                Topics(id=305,name=' Electromagnetic spectrum '),
                Topics(id=311,name=' Basic properties of Transverse wave '),
                Topics(id=312,name=' Longitudinal wave '),
                Topics(id=313,name=' Wave phenomena'),
                Topics(id=314,name=' Interference '),
                Topics(id=315,name=' Stationary wave '),
                Topics(id=316,name=' Light wave '),
                Topics(id=317,name=' Sound '),
                Topics(id=401,name=' Electric field '),
                Topics(id=402,name=' Circuit electricity '),
                Topics(id=403,name=' Domestic electricity '),
                Topics(id=404,name=' Magnetic field '),
                Topics(id=405,name=' Magnetic force '),
                Topics(id=406,name=' Electromagnet induction '),
                Topics(id=407,name=' Alternating current '),
                Topics(id=501,name=' Radiation '),
                Topics(id=502,name=' Nucleus and Rate of Radioactivity '),
                Topics(id=503,name=' Application of Radioactivity '),
                Topics(id=601,name=' The Universe as seen in different scale '),
                Topics(id=602,name=' Astronomy through history '),
                Topics(id=603,name=' Orbital motion under gravity '),
                Topics(id=604,name=' Stars and universe '),
                Topics(id=701,name=' Classical atomic model '),
                Topics(id=702,name=' Modern atomic model '),
                Topics(id=703,name=' Nanotechnology '),
                Topics(id=801,name=' Electricity at home '),
                Topics(id=802,name=' Electricity in building and transportation '),
                Topics(id=803,name=' Energy sources '),
                Topics(id=901,name=' Sense of eyes and ear '),
                Topics(id=902,name=' Medical imaging by non-ionizing radiation '),
                Topics(id=903,name=' Medical imaging by ionizing radiation '),
            ]
            db.session.bulk_save_objects(topics_all)
            db.session.commit()
            print('good topics preload')
        
        #for preload practice-topic relationship if needed
        def add_link(practice,topic):
            if topic not in practice.topics:
                practice.topics.append(topic)
        
        #db.session.commit() 
        #print("good relationships preload")

        
            

def create_tables():
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(username='choyuen').first():
            owner=User(username='choyuen',password = owner_pw, role_level = 5)
            db.session.add(owner)
            db.session.commit()
        preload()
        
create_tables()

def physics_books():
    all_topics = Topics.query.order_by(Topics.id).all()

    books = {
        "Heat and Gases" : [t for t in all_topics if 100<t.id<200],
        "Force and Motion" : [t for t in all_topics if 200<t.id<300],
        "Wave Motion" : [t for t in all_topics if 300<t.id<400 ],
        "Electricity and Magnetism" : [t for t in all_topics if 400<t.id<500],
        "Radioactivity and Nuclear energy" : [t for t in all_topics if 500<t.id<600],
        "Astronomy and Space science":[t for t in all_topics if 600<t.id<700],
        "Atomic world":[t for t in all_topics if 700<t.id<800],
        "Energy and Use of Energy":[t for t in all_topics if 800<t.id<900],
        "Medical Physics":[t for t in all_topics if 900<t.id<1000],      
    }
    return books


def filter_practices(allowed_topic_ids, levels):
    allowed_set=set(allowed_topic_ids)
    target_levels = [int(lvl) for lvl in levels] if levels else []
    all_practices = Practices.query.join(Practices.topics).filter(Topics.id.in_(allowed_topic_ids)).all()
    filtered = []
    for p in all_practices:
        p_topic_ids={t.id for t in p.topics}
        is_subset= len(p_topic_ids)>0 and p_topic_ids.issubset(allowed_set)
        is_correct_level = not target_levels or (p.level in target_levels)
        if is_subset and is_correct_level:
            filtered.append(p)
    return filtered


def get_search_limit():
    try:
        if current_user and current_user.is_authenticated:
            return "4 per hour"
    except Exception:
        pass # Fallback to guest limit if context isn't ready
    return "1 per day"


def is_search_engine():
    # Basic check for common bot names in User-Agent
    ua = request.headers.get('User-Agent', '').lower()
    return any(bot in ua for bot in ['googlebot', 'bingbot', 'slurp'])

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/tutor/<id>')
def tutor(id):
    return f'your id is {id}'

@app.route('/search')
def search():
    topicSearch = request.args.get('topic','nothing')
    return render_template('search.html',books=physics_books())


@app.route('/result')
@limiter.limit(get_search_limit, exempt_when=is_search_engine)
def result():
    # .getlist() retrieves all selected values for the name "topic"
    selected_topic_ids = request.args.getlist('topic')
    selected_levels = request.args.getlist('level')
    selected_lang = request.args.get('language')
    
    # Convert string IDs (e.g., "1") to integers (e.g., 1)
    topic_ids = [int(tid) for tid in selected_topic_ids]
    
    # Use your existing filter function
    all_filtered_practices = filter_practices(topic_ids,selected_levels)
    if not all_filtered_practices:
        return render_template('result.html', practices=[], lang=selected_lang)
    num_to_select = min(len(all_filtered_practices), 4)
    random_practices = random.sample(all_filtered_practices, num_to_select)
    return render_template('result.html', practices=random_practices , lang = selected_lang)

@app.route('/upload',methods=['GET','POST'])
@login_required
def upload():
    if request.method=='POST':
        q_file=request.files.get('question_file')
        a_file=request.files.get('answer_file')
        q_file_c=request.files.get('question_file_c')
        a_file_c=request.files.get('answer_file_c')
        if not q_file or not a_file:
            return "Missing files!", 400
        q_filename=secure_filename(q_file.filename)
        a_filename=secure_filename(a_file.filename)
        q_filename_c=secure_filename(q_file_c.filename)
        a_filename_c=secure_filename(a_file_c.filename)
        
        # q_file.save(os.path.join(app.config['UPLOAD_FOLDER'],q_filename))
        # a_file.save(os.path.join(app.config['UPLOAD_FOLDER'],a_filename))
        try:
            q_file.seek(0)
            supabase.storage.from_("practices").upload(
                path=q_filename,
                file=q_file.read() , 
                file_options={"content-type":q_file.content_type}
                )
            a_file.seek(0)
            supabase.storage.from_("practices").upload(
                path=a_filename,
                file=a_file.read() , 
                file_options={"content-type":a_file.content_type}
                )
            q_file_c.seek(0)
            supabase.storage.from_("practices").upload(
                path=q_filename_c,
                file=q_file_c.read() , 
                file_options={"content-type":q_file_c.content_type}
                )
            a_file_c.seek(0)
            supabase.storage.from_("practices").upload(
                path=a_filename_c,
                file=a_file_c.read() , 
                file_options={"content-type":a_file_c.content_type}
                )

            public_url_q = supabase.storage.from_("practices").get_public_url(q_filename)
            public_url_a = supabase.storage.from_("practices").get_public_url(a_filename)
            public_url_q_c = supabase.storage.from_("practices").get_public_url(q_filename_c)
            public_url_a_c = supabase.storage.from_("practices").get_public_url(a_filename_c)
            print(f"DEBUG: Question URL is {public_url_q}")
            selected_level = request.form.get('level')
            new_practice=Practices(questionLink=public_url_q,answerLink=public_url_a,questionLink_C=public_url_q_c,answerLink_C=public_url_a_c,level=selected_level)
            selected_topic_ids = request.form.getlist('topics')
            for tid in selected_topic_ids:
                topic = Topics.query.get(int(tid))
                new_practice.topics.append(topic)
            db.session.add(new_practice)
            db.session.commit()
            return "uploaded! <a href='/upload'>back</a>"   
        except Exception as e:
            print(f"Upload failed:{e}")
            return f"An error during upload: {e}" , 500     
    allTopics = Topics.query.all()
    return render_template('upload.html', all_topics=allTopics)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],filename)


'''
@app.route('/delete')
@login_required
def delete():
    practices = Practices.query.all()  
    return render_template('delete.html', practices=practices)
'''

@app.route('/admin/manage', methods=['GET', 'POST'])
@login_required
@admin_required
def manage_practices():
    if request.method == 'POST':
        search_id = request.form.get('search_id')
        # Find the specific practice to confirm before deleting
        practice = Practices.query.get(search_id)
    else:
        practice = Practices.query.order_by(desc(Practices.id)).first() 
    
    return render_template('manage.html', practice=practice)
    
@app.route('/delete/<int:id>', methods=['POST'])
@login_required
def delete_practice(id):
    practice_delete = Practices.query.get_or_404(id)   
    try:
        # 1. Clear the links in the association table
        # This assumes your relationship is named 'topics' in your Practices model
        practice_delete.topics = [] 
        db.session.flush() # Tells the DB to prepare this change

        # 2. Now delete the practice itself
        db.session.delete(practice_delete)
        db.session.commit()
        flash(f"Practice {id} and its topic links deleted.", "success")
    except Exception as e:
        db.session.rollback()
        flash(f"Error: {str(e)}", "danger")
    return redirect(url_for('manage_practices'))

@app.route('/login',methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user=User.query.filter_by(username = username).first()
        if user and check_password_hash(user.password , password):
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('upload'))
        else:
            return "invalid login"
    return render_template('login.html')

@app.route('/account')
@login_required
def account():
    return render_template('account.html')

@app.route('/change-password', methods=['GET', 'POST'])
@login_required
def change_password():
    if request.method == 'POST':
        new_pw = request.form.get('new_password')
        confirm_pw = request.form.get('confirm_password')

        # 1. Check if passwords match
        if new_pw != confirm_pw:
            flash("Passwords do not match!", "danger")
            return redirect(url_for('change_password'))

        # 2. Hash the new password
        # We use the modern default (scrypt/pbkdf2)
        hashed_pw = generate_password_hash(new_pw,method='pbkdf2:sha256')

        # 3. Update the current_user object and commit
        current_user.password = hashed_pw
        db.session.commit()

        flash("Password updated successfully!", "success")
        return redirect(url_for('home'))

    return render_template('account.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return "logged out!"

@app.route('/contact')
def contact():
    return render_template('contact.html')    

@app.errorhandler(429)
def ratelimit_handler(e):
    # This sends them to the page you built
    return redirect(url_for('limit_reached'))

@app.route('/join-pathway')
def limit_reached():
    return render_template('limit_reached.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
