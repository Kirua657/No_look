
import sqlite3
import uuid

def init_db():
    """データベースを初期化し、テーブルを作成します。"""
    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    # ユーザーテーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
           id TEXT PRIMARY KEY,
           nickname TEXT,database
           email TEXT,
           password TEXT,
           years TEXT,
           class TEXT,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       )
    ''')

    # 投稿テーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            content TEXT,
            mood_tag TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
       )
    ''')

    # 投稿の感情テーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS post_emotions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            emotion_type TEXT,
            confidence REAL,
            FOREIGN KEY (post_id) REFERENCES posts (id)
       )
    ''')

    # AIからの返信テーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS post_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            response_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts (id)
       )
    ''')

    # ユーザー設定テーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            bg_color TEXT,
            bgm_type TEXT,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
       )
    ''')

    conn.commit()
    conn.close()

def add_user(nickname):
    """新しいユーザーをデータベースに追加し、ユーザーIDを返します。"""
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    user_id = str(uuid.uuid4())
    c.execute("INSERT INTO users (id, nickname) VALUES (?, ?)", (user_id, nickname))
    conn.commit()
    conn.close()
    return user_id

def add_post(user_id, content, mood_tag):
    """新しい投稿をデータベースに追加します。"""
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("INSERT INTO posts (user_id, content, mood_tag) VALUES (?, ?, ?)", (user_id, content, mood_tag))
    post_id = c.lastrowid
    conn.commit()
    conn.close()
    return post_id

def add_post_emotion(post_id, emotion_type, confidence):
    """新しい投稿の感情をデータベースに追加します。"""
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("INSERT INTO post_emotions (post_id, emotion_type, confidence) VALUES (?, ?, ?)",
              (post_id, emotion_type, confidence))
    conn.commit()
    conn.close()

def add_post_response(post_id, response_text):
    """投稿に対するAIの返信をデータベースに追加します。"""
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("INSERT INTO post_responses (post_id, response_text) VALUES (?, ?)",
              (post_id, response_text))
    conn.commit()
    conn.close()

def add_or_update_user_preferences(user_id, bg_color, bgm_type):
    """ユーザーの設定を追加または更新します。"""
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,))
    if c.fetchone():
        c.execute("UPDATE user_preferences SET bg_color = ?, bgm_type = ?, last_updated = CURRENT_TIMESTAMP WHERE user_id = ?",
                  (bg_color, bgm_type, user_id))
    else:
        c.execute("INSERT INTO user_preferences (user_id, bg_color, bgm_type) VALUES (?, ?, ?)",
                  (user_id, bg_color, bgm_type))
    conn.commit()
    conn.close()

def get_posts():
    """データベースからすべての投稿を取得します。"""
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("""
        SELECT
            p.id,
            u.nickname,
            p.content,
            p.mood_tag,
            p.created_at,
            pe.emotion_type,
            pe.confidence,
            pr.response_text,
            up.bg_color,
            up.bgm_type
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN post_emotions pe ON p.id = pe.post_id
        LEFT JOIN post_responses pr ON p.id = pr.post_id
        LEFT JOIN user_preferences up ON p.user_id = up.user_id
        ORDER BY p.created_at DESC
    """)
    posts = c.fetchall()
    conn.close()
    return posts

if __name__ == '__main__':
    init_db()
    print("データベースが初期化されました。")

def add_emotion_log(
    student_id,
    emotion,
    score,
    labels=None,
    topic_tags=None,
    source="ai",
    confidence=None,
):
    """感情ログを emotion_logs テーブルに追加し、IDを返す。"""
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute(
        """
        INSERT INTO emotion_logs
        (student_id, emotion, score, labels, topic_tags, source, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (student_id, emotion, score, labels, topic_tags, source, confidence),
    )
    log_id = c.lastrowid
    conn.commit()
    conn.close()
    return log_id
