import sqlite3
import uuid
from flask import Flask, request, jsonify
from datetime import datetime
import os

DB_PATH = "database.db"
app = Flask(__name__)

# ========= DB 初期化＆ユーティリティ =========

def init_db():
    """データベースを初期化し、テーブルを作成します。"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # ユーザーテーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
           id TEXT PRIMARY KEY,
           nickname TEXT,
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

    # クラス情報テーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS classes (
            class_id VARCHAR(20) PRIMARY KEY,
            grade INTEGER NOT NULL,
            name TEXT
        )
    ''')

    # 生徒情報テーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS students (
            student_id CHAR(36) PRIMARY KEY,
            class_id VARCHAR(20),
            name TEXT,
            gender TEXT,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (class_id) REFERENCES classes (class_id)
        )
    ''')

    # 感情ログテーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS emotion_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            student_id CHAR(36),
            emotion TEXT NOT NULL,
            score REAL,
            labels TEXT,
            topic_tags TEXT,
            negation_index INTEGER,
            source TEXT CHECK(source IN ('text', 'ai', 'manual')),
            confidence REAL,
            FOREIGN KEY (student_id) REFERENCES students (student_id)
        )
    ''')

    # 集計キャッシュテーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS emotion_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id VARCHAR(20) NOT NULL,
            period_start DATE NOT NULL,
            period_end DATE NOT NULL,
            emotion TEXT NOT NULL,
            count INTEGER DEFAULT 0,
            avg_score REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()


def add_user(nickname: str) -> str:
    """新しいユーザーを追加し、ユーザーIDを返します。"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    user_id = str(uuid.uuid4())
    c.execute(
        "INSERT INTO users (id, nickname) VALUES (?, ?)",
        (user_id, nickname),
    )
    conn.commit()
    conn.close()
    return user_id


def add_post(user_id: str, content: str, mood_tag: str) -> int:
    """新しい投稿を追加し、post_id を返します。"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO posts (user_id, content, mood_tag) VALUES (?, ?, ?)",
        (user_id, content, mood_tag),
    )
    post_id = c.lastrowid
    conn.commit()
    conn.close()
    return post_id


def add_post_emotion(post_id: int, emotion_type: str, confidence: float) -> None:
    """投稿の感情を追加します。"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO post_emotions (post_id, emotion_type, confidence) VALUES (?, ?, ?)",
        (post_id, emotion_type, confidence),
    )
    conn.commit()
    conn.close()


def add_post_response(post_id: int, response_text: str) -> None:
    """投稿に対するAIの返信を追加します。"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO post_responses (post_id, response_text) VALUES (?, ?)",
        (post_id, response_text),
    )
    conn.commit()
    conn.close()


def add_or_update_user_preferences(user_id: str, bg_color: str, bgm_type: str) -> None:
    """ユーザーの設定を追加または更新します。"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT 1 FROM user_preferences WHERE user_id = ?", (user_id,))
    if c.fetchone():
        c.execute(
            """
            UPDATE user_preferences
               SET bg_color = ?, bgm_type = ?, last_updated = CURRENT_TIMESTAMP
             WHERE user_id = ?
            """,
            (bg_color, bgm_type, user_id),
        )
    else:
        c.execute(
            "INSERT INTO user_preferences (user_id, bg_color, bgm_type) VALUES (?, ?, ?)",
            (user_id, bg_color, bgm_type),
        )
    conn.commit()
    conn.close()


def get_posts():
    """投稿一覧を結合して取得します。"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
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
        """
    )
    posts = c.fetchall()
    conn.close()
    return posts


# ========= Flask API =========

@app.route("/")
def root():
    return {
        "message": "backend alive",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.route("/api/analyze", methods=["POST"])
def analyze_api():
    """
    NO LOOK フロント用の簡易 感情分析API（ローカル版）
    """
    try:
        body = request.get_json() or {}
        text = body.get("text", "")
        user_id = body.get("user_id") or "local-test-user"

        if not text:
            return jsonify({
                "status": "error",
                "message": "text が空です",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }), 400

        # めちゃくちゃ単純なダミー感情判定
        if any(k in text for k in ["死にたい", "しんどい", "つらい", "無理"]):
            emotion = "しんどい"
            confidence = 0.9
        elif any(k in text for k in ["楽しい", "嬉しい", "最高"]):
            emotion = "楽しい"
            confidence = 0.9
        else:
            emotion = "中立"
            confidence = 0.5

        # ここで必要なら emotion_logs などに保存してもOK

        return jsonify({
            "status": "success",
            "message": "analyzed locally",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": {
                "emotion": emotion,
                "confidence": confidence,
            },
            "entry_id": "local-test-entry",
            "user_id": user_id,
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 500


if __name__ == "__main__":
    # 起動前に必ずDBを初期化
    init_db()
    print("データベースが初期化されました。")

    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=True)
