from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'geyporno'  # замени на свой секретный ключ

# Настройка базы данных SQLite
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Модель пользователя
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nick = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    login_count = db.Column(db.Integer, default=0)

# Создать таблицы (запусти один раз)
def create_tables():
    db.create_all()

# Регистрация
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    nick = data.get('nick')
    email = data.get('email')
    password = data.get('password')

    if not nick or not email or not password:
        return jsonify({'error': 'Заполните все поля'}), 400

    if User.query.filter_by(nick=nick).first():
        return jsonify({'error': 'Никнейм уже занят'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email уже зарегистрирован'}), 400

    password_hash = generate_password_hash(password)
    new_user = User(nick=nick, email=email, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Пользователь зарегистрирован'})

# Вход
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    nick = data.get('nick')
    password = data.get('password')

    user = User.query.filter_by(nick=nick).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Неверный ник или пароль'}), 400

    user.login_count += 1
    db.session.commit()

    session['user_id'] = user.id  # Для сессий
    return jsonify({
        'message': 'Успешный вход',
        'user': {
            'id': user.id,
            'nick': user.nick,
            'email': user.email,
            'login_count': user.login_count
        }
    })

# Выход
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Вы вышли'})

if __name__ == '__main__':
    app.run(debug=True)
