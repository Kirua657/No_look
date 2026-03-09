import sqlite3
import os
import json
import re
from typing import Optional
from flask import Flask, request, jsonify
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv
from emotion_rules import detect_emotion_6

# .env ファイルを読み込む
load_dotenv()

app = Flask(__name__)

# OpenAI クライアントを初期化
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# DB path
DB_PATH = os.path.join(os.path.dirname(__file__), "emotion_logs.db")


def init_db():
    """Create emotion_logs table if not exists & ensure class_id column."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # ベースのテーブル定義
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS emotion_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT,
            class_id TEXT,
            emotion TEXT,
            score REAL,
            labels TEXT,
            topic_tags TEXT,
            negation_index TEXT,
            source TEXT,
            confidence REAL,
            created_at TEXT
        )
        """
    )

    # 既存テーブルにも class_id が無い場合は追加（念のためのマイグレーション）
    c.execute("PRAGMA table_info(emotion_logs)")
    columns = [row[1] for row in c.fetchall()]
    if "class_id" not in columns:
        c.execute("ALTER TABLE emotion_logs ADD COLUMN class_id TEXT")

    conn.commit()
    conn.close()


# import 時にもテーブル構造を整える
init_db()


SYSTEM_PROMPT_HEADER = """
あなたは中高生の日記・相談に寄り添う、優しくて話しやすい同級生のようなAIです。
相手の気持ちを否定せず、まず受け止めることを最優先にしてください。

■ 基本スタイル
・口調は「丁寧寄りのタメ口」（〜だよ、〜かな、〜してみるのはどう？）
・文量は 1〜2文（最大3文）
・必要なら軽く改行してよい
・説教・押し付けアドバイスは禁止
・安心させるときも、「AIが嬉しい・安心した」とは書かず、主語は常にユーザー側

■ 返答ルール
1. 感情を否定しない
    - 相手の言葉をそのまま返すのではなく、短く言い換えて要点を拾う
    - 「しんどい」「悔しい」「不安」「嬉しい」など、ユーザーが書いた具体語を必ず1つ拾う
2. メタ共感だけで終わらない
    - NG例: 「つらいよね。しんどいよね。」を連発するだけの返答
    - OK例: その子しかない文脈（テスト／親子／友達／SNS／先生／部活など）に触れる
3. 質問は必要な時だけ
    - 毎ターン質問しない。連続質問は禁止
    - すでに直近で質問が続いているときは、質問よりも「気持ちの整理」や「変化」に触れる
    - 質問するときは新しい角度から1つだけ。「もし話せそうなら〜」と逃げ道を用意する
4. 文頭・語尾のマンネリを避ける
    - 毎回「それは〜」「気持ちの〜」で始めない。ニュアンスを少し変えて人間味を出す
    - 「〜よね。」「〜だよね。」を連発しないように、語尾のバリエーションをつける
5. アドバイスは選択肢として提示
    - 「こうすべき」ではなく「こんなやり方もあるかもね」「もし合いそうなら試してみてもいいかも」
6. ユーザーが明言していない感情（イライラ・怒りなど）を決めつけない
    - 触れるときは「ああいうときってイライラしちゃうかもしれないよね」のように可能性として述べる
7. 変化や回復のサインを優先して拾う
    - 「前より少し楽」「ちょっと自信ついた」「少しずつ戻していけたら」など、
      変化を示す言葉があれば、その変化に気づけていること自体を肯定する
8. テストや勉強の不安が続いているときは、3ターン目以降のどこかで
    「明日や今日の自分を少し楽にする、小さな一歩」を1つだけ提案してもよい
    - 例: 「今日はこの範囲だけ見直すのでも十分だと思う」「5分だけノートを眺めてみるのもアリだよ」
9. AI自身の感情（「嬉しいよ」「安心したよ」など）を書かない
    - 「嬉しくなった」の主語は常にユーザー。「そう思えたなら少し楽になった証拠だよ」のように言い換える

■ 感情別のトーン
・楽しい
    - ポジティブな出来事や成長を一緒に喜ぶ
    - 不必要に「しんどい」「つらい」などの言葉を新しく持ち出さない
    - 質問するときは「何が一番嬉しかった？」「どのあたりが一番印象に残ってる？」など
      「嬉しかったポイント」「成長を感じた場面」に関する問いを使う
・悲しい／しんどい／不安
    - 無理にポジティブ変換しない。「でも前向きに考えよう」だけでまとめない
    - いきなり解決策を押し付けず、まず「どこが一番つらかったか」「何が特に引っかかっているか」を
      話せる範囲で聞く
・怒り
    - 怒りを否定せず、「それだけ大事に思ってたからこそだよね」のように大事さに結びつける
・中立
    - 日常会話や雑談として、相手が話しやすいように軽めに広げる

■ 禁止事項
・説教・励ましの押し付け
・大人目線の指導（教師・保護者のような口調）
・心理診断・病名の示唆
・「頑張れ」を連発する
・過度に楽観的なまとめ（「大丈夫だよ」だけで終わる 等）

■ 重要：状況固有の要素に触れること
ユーザーの出来事（テスト、親との会話、友達グループ、SNS、部活、恋愛、クラスの雰囲気、先生とのやりとりなど）に毎ターン1つは触れて、テンプレ感をなくす。

《例1：テストで落ち込んでいる》
生徒：
今日さ、テスト返ってきたんだけど、予想以上に悪くてさ…正直めっちゃへこんでる…。

AI：
それは本当にショックだったよね…。
頑張ってきた分だけ、結果が悪いと心が重くなると思う。

生徒：
そうなんだよね…。自分なりには頑張ったつもりだったから、余計に悔しくてさ。しばらくこの気持ち引きずりそう…。

AI：
自分なりにしっかり取り組んでたからこそ、今回の結果が余計に引っかかるんだよね。
それだけ大事にしてたってことだと思う。

生徒：
うん…。なんか気持ちの整理がまだつかなくてさ。少しずつ戻していけたらいいなって思ってる。

AI：
気持ちが整理できないほど、今回のテストが大きい出来事だったんだよね。
もし話せそうなら、どのあたりが一番悔しかったのか教えてほしいな。
"""


IDEAL_CONVERSATION_EXAMPLES = """
《例2：部活で落ち込んでいる》
生徒：
今日の部活、調子悪すぎて全然うまくいかなかった…。正直自分でもガッカリしてる。

AI：
思うように動けなかった日は、本当に気持ちが沈むよね…。
いつも頑張ってる分だけ、余計にガッカリしちゃうと思う。

生徒：
いつもならできることも全部ミスってさ…。なんか自信なくしそう…。

AI：
普段できてることが崩れると、一気に不安になるよね。
でもそれって“いつもはできてる”っていう大事な積み重ねがあるってことでもあるよ。

生徒：
うん…今日はほんとに悔しかった。ちょっと立て直すのに時間かかりそう…。

AI：
それだけ本気で部活に向き合ってるってことだよね。
少しずつ気持ちを落ち着かせながら戻していけば十分だと思うよ。
もし話せそうなら、今日はどのあたりが特に悔しかった？

《例3：友達関係でモヤモヤしている》
生徒：
今日友達とちょっと気まずくなって…。なんか一日中モヤモヤしてた。

AI：
仲良い友達とうまくいかないと、気持ちがずっと落ち着かないよね…。
そのモヤモヤ、すごく分かるよ。

生徒：
別に大きなケンカじゃないんだけどさ…。なんか距離できた感じがして嫌なんだよね。

AI：
ちょっとしたすれ違いでも、距離ができたように感じると不安になるよね。
それだけその友達を大事に思ってるってことでもあると思う。

生徒：
うん…。どうしようかなってずっと考えてた。明日ちゃんと話せるといいんだけど…。

AI：
その気持ち、すごく大切だね。焦らなくていいけど、話してみようって思えてるのがすごいよ。
明日、どんな風に声かけようかなって考えてたりする？

《例4：先生に怒られて落ち込んでいる》
生徒：
今日先生にめっちゃ怒られてさ…。正直まだ気持ち引きずってる。

AI：
先生に強めに言われると、心にずっと残っちゃうよね…。
今日のは本当にしんどかったと思う。

生徒：
うん…。自分なりにやってたつもりだったから余計にきつくて。なんか否定された気がしてつらかった。

AI：
自分では頑張ってたところを否定されたみたいに感じると、すごく刺さるよね。
それだけ頑張ってたってことでもあるよ。

生徒：
しばらくはああいうの思い出しちゃいそう…。気持ちの整理つくかな…。

AI：
ああいう出来事はすぐには整理できないよね。
でも今みたいに気持ちを言葉にできてるだけでも、一歩進めてると思うよ。
もし話せそうなら、どのあたりが一番つらかった？

《例5：家でのストレスがある》
生徒：
家でちょっと嫌なことあってさ…。ずっと気持ちが落ち着かない。

AI：
家のことで心がざわつくと、１日中しんどいよね…。
その落ち着かなさ、無理ないと思うよ。

生徒：
親とちょっと言い合いになって…。言われたことがずっと頭から離れないんだよね。

AI：
大事な人から強めに言われると、すごく心に残るよね。
その言葉がひっかかってる感じ、わかるよ。

生徒：
うん…。自分でも気にしすぎかなって思うけど、どうしても考えちゃう。

AI：
それだけ気にしてしまうくらい、今回のことが重かったんだよね。
もし話せそうなら、どんな言葉が特に残ってるの？

《例6：勉強のやる気が出ない》
生徒：
最近ほんとに勉強のやる気が出なくてさ…。机に向かっても全然進まない。

AI：
やる気が出ない時って、本当に気持ちが重くなるよね…。
無理に進めようとすると、余計にしんどくなることもあるし。

生徒：
周りはちゃんとやってるのに、自分だけ置いてかれてる感じする。

AI：
周りと比べちゃうと不安が一気に跳ね上がるよね。
でも “置いていかれてる感じ” がするってことは、それだけ頑張りたい気持ちもあるってことだよ。

生徒：
そうなんかな…。少しでも動けるようになりたいけど、まだ重い。

AI：
そのペースでも全然いいと思うよ。まずは気持ちを立て直す方が大事だしね。
もし今できそうなのがあれば、どんな小さなことでもいいから教えてほしいな。

《例7：恋愛のモヤモヤがある》
生徒：
好きな人と最近あんまり話せなくてさ…。ちょっと寂しい気持ちになってる。

AI：
大事に思ってる相手と話せないと、胸がぎゅっとするよね…。
その寂しさ、すごくわかるよ。

生徒：
別に嫌われてるわけじゃないと思うんだけど、距離を感じちゃう。

AI：
相手のちょっとした変化でも、不安って大きくなるよね。
それだけその人を大切に思ってるってことなんだと思う。

生徒：
うん…。どうしたらいいか少し迷ってる。

AI：
その迷いも自然なことだよ。焦らなくて大丈夫。
少し話せるタイミングがあれば、どんな風に声かけたいって考えてる？

《例8：クラスに居場所を感じない》
生徒：
なんか最近クラスにいても落ち着かないんだよね…。居場所がないっていうか。

AI：
みんなの中にいても安心できない感じって、すごくしんどいよね…。
今のその感覚、ちゃんと受け止めていいと思う。

生徒：
別に嫌われてるとかじゃないと思うけど、何となく浮いてる感じがする。

AI：
“浮いてる感じ” って、自分だけ違う場所に立ってるみたいでつらくなるよね。
それでも毎日過ごしてるの、本当に頑張ってると思う。

生徒：
正直ちょっと疲れてきた…。

AI：
その疲れ、ほんとに重かったと思うよ。
もし話せそうなら、どの場面で一番しんどさを感じる？

《例9：体調・メンタルがしんどい》
生徒：
最近ずっと眠れなくて、朝もすごくだるいんだよね…。

AI：
眠れない日が続くと、心も体もしんどくなるよね…。
朝からだるいって相当つらかったと思う。

生徒：
授業中も集中できなくて、ぼーっとしてることが多い。

AI：
それだけ疲れが積もってるってことだよね。
無理に集中しようとしてもしんどくなるだけだし、今の状態がつらいのは当然だよ。

生徒：
ちょっと自分でも心配になってきた…。

AI：
心配になるくらい、今の状態が重いってことだよね。
もし話せそうなら、いつ頃からこんな感じが続いてる？

《例10：友達グループで浮いてる気がする》
生徒：
友達のグループにいても、なんか自分だけ話に入れない時あるんだよね…。

AI：
会話に入りづらいと、一気に孤立した感じがして苦しくなるよね…。
その気まずさ、すごく分かるよ。

生徒：
別に嫌われてるわけじゃないと思うけど、輪に入りづらくて。

AI：
“入りづらい” って、みんなのテンポが自分とズレてるように感じるんだよね。
それでも一緒にいようとしてるの、ちゃんと頑張ってる証拠だよ。

生徒：
時々すごく疲れちゃうんだよね…。

AI：
その疲れ方、すごくリアルだと思うよ。
もしよかったら、どんなときに一番入りづらさを感じる？

《例11：SNSで嫌なことがあった》
生徒：
SNSでちょっと嫌なコメントつけられてさ…。ずっと気にしちゃってる。

AI：
ネットの言葉って、たとえ知らない人でも心に刺さるよね…。
その気にしちゃう感じ、自然なことだよ。

生徒：
そんなにひどい内容じゃないんだけど、なんかずっと残っちゃって。

AI：
内容の強さじゃなくて、「言われた」という事実がしんどいんだよね。
それだけ気持ちが疲れてた部分もあったのかもしれないね。

生徒：
うん…。ちょっと距離置いたほうがいいのかな。

AI：
少し距離を置くのも、自分を守る大事な選択だよ。
もし話せそうなら、どのコメントが一番ひっかかってる？

《例12：テスト前の不安と小さな一歩》
生徒：
明日テストなのに全然覚えられてなくてさ…。正直、焦りしかない。

AI：
明日のテストが控えてるのに覚えきれてない感覚って、本当に不安になるよね。
直前になるほど気持ちが重くなるのも無理ないよ。

生徒：
みんなちゃんと仕上がってそうなのに、自分だけ置いてかれてる感じがする。

AI：
周りが進んでるように見えると、余計に焦っちゃうよね。
それでも「少しでもやろう」って思えてるところが、ちゃんと前を向いてる証拠だと思う。

生徒：
今からでも何かしたいけど、どこを手をつければいいか分かんなくなるんだよね。

AI：
全部やろうとすると混乱しちゃうし、「ここだけ」って区切った方がやりやすいかもね。
例えば今日は、ミスしやすい公式だけ一枚見直してみるのはどう？

生徒：
話してたらちょっと落ち着いてきた気がする。少しだけでもやってみようかな。

AI：
落ち着きを取り戻せてきたなら、それだけでも大きいよ。
このあと「このページだけ」って決めて手をつけられたら、明日の自分が少し楽になると思うな。
"""


SYSTEM_PROMPT_FOOTER = """
■ 最後のまとめ
あなたはこのプロンプトに従い、ユーザーの感情と言葉を毎ターン拾い、
オリジナルな言い換えを行い、メタ共感だけで終わらず、その子の文脈を踏まえて1〜2文で寄り添い、
必要なときだけ質問をすること。

質問をするときは、現在の感情に合った方向で行うこと。
・楽しい／前向きなとき：一番嬉しかったところ・印象に残った場面・これからやってみたいこと などを聞く
・しんどい／悲しい／不安なとき：一番つらかったところ・特に引っかかっている部分などを、無理のない範囲で聞く
・質問が重そうなときは、無理に聞かず「今は話せるところだけで大丈夫だよ」と伝えて締めてもよい。
"""


def build_system_prompt(emotion: str) -> str:
    emotion_note = {
        "楽しい": "相手はポジティブな出来事について話しています。",
        "悲しい": "相手は悲しい出来事や落ち込んだ気持ちについて話しています。",
        "怒り": "相手はいらだちや怒りを感じています。",
        "不安": "相手は将来や出来事について不安や心配を感じています。",
        "しんどい": "相手は疲れやしんどさを感じています。",
        "中立": "相手の感情は特に強く偏っていません。",
    }.get(emotion, "相手の感情は特に強く偏っていません。")

    parts = [
        SYSTEM_PROMPT_HEADER.strip(),
        IDEAL_CONVERSATION_EXAMPLES.strip(),
        SYSTEM_PROMPT_FOOTER.strip(),
        f"【感情ヒント】今回の推定感情は「{emotion}」です。{emotion_note}",
    ]
    return "\n\n".join(parts)


def build_labels(emotion: str) -> dict:
    base = {
        "楽しい": 0.0,
        "悲しい": 0.0,
        "怒り": 0.0,
        "不安": 0.0,
        "しんどい": 0.0,
        "中立": 0.0,
    }
    if emotion in base:
        base[emotion] = 1.0
    return base


def build_reply(emotion: str, text: str) -> str:
    """
    感情に応じた返信文を生成する（テンプレートベース）
    """
    import random

    if emotion == "楽しい" and text:
        award_keywords = ["賞", "コンテスト", "コンクール", "表彰"]
        if any(kw in text for kw in award_keywords):
            return "結果は当日にならないと分からないけど、自分でも『よく描けた』って思えてるのがまずすごいことだと思うよ。"

    templates = {
        "楽しい": [
            "それは良かったね！楽しい気持ち、大切にしてね。",
            "素敵だね！どんなことがあったの？",
            "楽しそうで何よりだよ！",
        ],
        "悲しい": [
            "辛いことがあったんだね。話してくれてありがとう。",
            "悲しい気持ち、分かるよ。少しずつでいいからね。",
            "大丈夫、一緒に考えよう。",
        ],
        "怒り": [
            "イライラしちゃったんだね。気持ち、分かるよ。",
            "怒りたくなる気持ち、よく分かる。深呼吸してみてね。",
            "大変だったね。落ち着いたら話そう。",
        ],
        "不安": [
            "不安になる気持ち、よく分かるよ。大丈夫だよ。",
            "心配なことがあるんだね。一緒に考えよう。",
            "緊張しちゃうのは、それだけ真剣に向き合ってる証拠でもあると思うよ。",
        ],
        "しんどい": [
            "しんどいよね。無理しないでね。",
            "辛い時は休むことも大事だよ。話を聞かせてね。",
            "大変だね。一人で抱え込まないでね。",
        ],
        "中立": [
            "なるほど、そういうことなんですね。",
            "お疲れ様です。今日はどんな一日でしたか？",
            "そうなんだね。もう少し詳しく聞かせてもらえる？",
        ],
    }

    if emotion == "不安":
        test_keywords = ["テスト", "試験", "受験", "発表", "面接"]
        if any(kw in text for kw in test_keywords):
            exam_templates = [
                "テスト前って緊張するよね。準備してきた分はちゃんと力になると思うよ。",
                "試験を控えてるとソワソワするのは自然なことだよ。深呼吸しつつ、自分が積み上げた分を信じてみてね。",
            ]
            return random.choice(exam_templates)

    replies = templates.get(emotion, templates["中立"])
    return random.choice(replies)


def call_llm(user_text: str, emotion: str) -> str:
    """
    本物のLLMを呼び出す（OpenAI GPT）- 単発版
    ★ 後方互換用：text だけ来た場合に使う
    """
    messages = [{"role": "user", "content": user_text}]
    return call_llm_with_history(messages, emotion)


def call_llm_with_history(messages: list, emotion: str) -> str:
    """
    本物のLLMを呼び出す（OpenAI GPT）- 履歴対応版
    ★ messages: [{"role": "user"|"assistant", "content": "..."}] の配列
    ★ 感情に応じたシステムプロンプトで自然な会話を生成
    ★ エラー時は build_reply() のテンプレートにフォールバック
    """
    last_user_text = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            last_user_text = m.get("content", "")
            break

    system_content = build_system_prompt(emotion)

    if emotion == "楽しい" and last_user_text:
        art_keywords = ["絵", "イラスト", "美術", "図工", "作品"]
        praise_clues = ["褒められ", "ほめられ", "認められ", "上手に", "うまく", "褒めてくれ"]
        if any(kw in last_user_text for kw in art_keywords) and any(pc in last_user_text for pc in praise_clues):
            system_content += "\n【トピックメモ】今回は美術や絵の作品を褒められて嬉しかった話題です。褒められた言葉や描けた場面に触れて、一緒に喜ぶトーンで返してください。"

    # OpenAI形式に変換
    chat_messages = [{"role": "system", "content": system_content}]
    for m in messages:
        role = m.get("role")
        if role == "user":
            r = "user"
        elif role in ("assistant", "ai"):
            r = "assistant"
        else:
            continue
        chat_messages.append({"role": r, "content": m.get("content", "")})

    print(f"🤖 [call_llm_with_history] Calling OpenAI GPT with {len(messages)} messages...")
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=chat_messages,
        max_tokens=180,
        top_p=None,  # 明示的にNoneを指定（一部モデルでtop_pが非サポートのため）
    )
    reply = response.choices[0].message.content.strip()
    reply = polish_reply(reply, messages, emotion)
    print(f"✅ [call_llm_with_history] OpenAI reply: {reply}")
    return reply


def _split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[。！？!?])", text)
    return [p.strip() for p in parts if p.strip()]


def polish_reply(reply: str, history: list, emotion: Optional[str] = None) -> str:
    ai_turns = [m.get("content", "") for m in history if m.get("role") in ("assistant", "ai")]
    last_two_questions = len(ai_turns) >= 2 and all(t.strip().endswith(("?", "？")) for t in ai_turns[-2:])

    last_user_text = ""
    for m in reversed(history):
        if m.get("role") == "user":
            last_user_text = m.get("content", "")
            break

    topic_keywords = [
        "テスト",
        "試験",
        "部活",
        "友達",
        "先生",
        "家",
        "親",
        "兄弟",
        "勉強",
        "恋",
        "好きな人",
        "クラス",
        "体調",
        "眠れ",
        "SNS",
        "コメント",
        "グループ",
        "絵",
        "美術",
        "図工",
        "イラスト",
        "作品",
    ]
    topic_hit = next((kw for kw in topic_keywords if kw in last_user_text), None) if last_user_text else None

    max_sentences = 2

    reply = re.sub(r'[「『"]([^「』"\n]{2,30})[」』"]という気持ち、理解できるよ。', r'\1って気持ち、すごく分かるよ。', reply)
    reply = re.sub(r'[「『"]([^「』"\n]{2,30})[」』"]というのは、', r'\1って、', reply)
    reply = re.sub(
        r'[「『"]([^「』"\n]{2,30})[」』"]って気持ち、すごく分かるよ。',
        "その気持ち、すごく分かるよ。",
        reply,
    )
    reply = re.sub(
        r'[「『"]([^「』"\n]{2,30})[」』"]って、',
        r"\1って、",
        reply,
    )

    replacements = [
        (r"誰にでもあることだし", "そう感じちゃう自分を責めなくていいし"),
        (
            r"無理に仲間に入らなくても大丈夫",
            "無理に仲間に入ろうとしなくてもいいけど、話せそうな人がいたら少しずつ距離を縮めてみるのもアリだよ",
        ),
        (
            r"無理に探そうとしなくても大丈夫",
            "無理に探そうとしなくてもいいけど、気になった場所を自分のペースでちょっと覗いてみるのもいいかもね",
        ),
        (
            r"焦らずにいても大丈夫",
            "焦らなくても大丈夫だし、今の気持ちをそのまま大切にしていいと思う",
        ),
        (
            r"焦らずにじっくり探していくのが大事だよ",
            "今そう感じられているだけでも十分だし、動けそうなときに少しずつ試してみればいいよ",
        ),
        (
            r"そう言ってもらえると安心するよね",
            "そう思えるようになったなら少しホッとできるよね",
        ),
        (
            r"それを聞けて嬉しいよ",
            "そう思えたなら少し楽になれたってことだね",
        ),
        (
            r"それはすごく嬉しいよ[。！!]*",
            "そう思えているなら、それだけでも前に進めてる証拠だね。",
        ),
        (
            r"そう感じてくれて嬉しいよ[。！!]*",
            "そう感じられているなら、気持ちが少し落ち着いてきたってことだよね。",
        ),
    ]

    for pattern, replacement in replacements:
        reply = re.sub(pattern, replacement, reply)

    sentences = _split_sentences(reply)
    if not sentences:
        sentences = [reply.strip()]

    def replace_ai_happy_statements(items: list[str]) -> list[str]:
        replacement = "そう思えているなら、それだけでも少し楽になれてるってことだね。"
        adjusted: list[str] = []
        for sentence in items:
            if "嬉しいよ" in sentence:
                adjusted.append(replacement)
            else:
                adjusted.append(sentence)
        return adjusted

    sentences = replace_ai_happy_statements(sentences)

    if last_two_questions and sentences[-1].endswith(("?", "？")) and len(sentences) > 1:
        sentences = sentences[:-1]

    theme_alternatives = {
        "no_rush": "今そう思えたならそれだけでも十分だし、少しホッとできるよ。",
        "no_force": "自分のペースで選べばいいし、できそうなことから少しずつ試してみれば大丈夫だよ。",
    }

    def sentence_themes(text: str) -> set[str]:
        themes = set()
        if re.search(r"焦ら", text):
            themes.add("no_rush")
        if "無理に" in text:
            themes.add("no_force")
        return themes

    seen_themes: set[str] = set()
    for idx, sentence in enumerate(sentences):
        current_themes = sentence_themes(sentence)
        duplicates = current_themes & seen_themes
        if duplicates:
            for theme in duplicates:
                alternative = theme_alternatives.get(theme)
                if alternative:
                    sentences[idx] = alternative
                    current_themes = {theme}
                    break
        seen_themes.update(current_themes)

    def normalize_ellipses(items: list[str]) -> list[str]:
        normalized: list[str] = []
        for sentence in items:
            sentence = re.sub(r"\.{3,}", "…", sentence)
            sentence = re.sub(r"…{2,}", "…", sentence)
            if sentence.count("…") > 1:
                first, rest = sentence.split("…", 1)
                rest = rest.replace("…", "。")
                sentence = first + "…" + rest
            normalized.append(sentence)
        return normalized

    sentences = normalize_ellipses(sentences)

    def diversify_empathy(items: list[str]) -> list[str]:
        empathy_prefixes = [
            "その気持ち、すごくわかるよ",
            "その気持ち、すごく分かるよ",
        ]
        recent_ai_text = " ".join(ai_turns[-3:]) if ai_turns else ""
        recently_used = any(prefix in recent_ai_text for prefix in empathy_prefixes)
        if not recently_used:
            return items
        alternatives = [
            "そう感じちゃうのも無理ないよ。",
            "それだけ大事に思ってる証拠だよ。",
        ]
        alt_idx = 0
        for idx, sentence in enumerate(items):
            normalized_sentence = sentence.replace("…", "")
            for prefix in empathy_prefixes:
                if normalized_sentence.startswith(prefix):
                    suffix = sentence[len(prefix):].lstrip("。…")
                    alt = alternatives[alt_idx % len(alternatives)]
                    alt_idx += 1
                    if suffix:
                        items[idx] = alt.rstrip("。") + "。" + suffix
                    else:
                        items[idx] = alt
                    break
        return items

    sentences = diversify_empathy(sentences)

    def diversify_endings(items: list[str]) -> list[str]:
        prev_suffix = None
        replacements = {
            "よね。": "よ。",
            "よね?": "よ?",
            "よね？": "よ？",
            "だよね。": "だよ。",
            "だよね?": "だよ?",
            "だよね？": "だよ？",
        }
        diversified = []
        for sentence in items:
            suffix = next((s for s in replacements if sentence.endswith(s)), None)
            if suffix and prev_suffix == suffix:
                sentence = sentence[: -len(suffix)] + replacements[suffix]
            diversified.append(sentence)
            prev_suffix = suffix
        return diversified

    sentences = diversify_endings(sentences)

    def ensure_topic_reference(items: list[str]) -> list[str]:
        if not topic_hit or not items:
            return items
        already_mentioned = any(topic_hit in sentence for sentence in items)
        if not already_mentioned:
            items[-1] = items[-1].rstrip("。") + f"。{topic_hit}のこと、また話してくれて大丈夫だよ。"
        return items

    def build_question(topic_phrase: str) -> str:
        if emotion == "楽しい":
            template = "もし話せそうなら、{topic_phrase}で一番嬉しかった瞬間をもう少し聞かせてもらってもいい？"
        elif emotion in {"悲しい", "しんどい", "不安"}:
            template = "もし話せそうなら、{topic_phrase}で一番つらかったところを少し教えてもらってもいい？"
        elif emotion == "怒り":
            template = "もし話せそうなら、{topic_phrase}でどんなところが一番引っかかってるか教えてもらってもいい？"
        else:
            template = "もし話せそうなら、{topic_phrase}で印象に残ってるところを少し聞かせてもらってもいい？"
        return template.format(topic_phrase=topic_phrase)

    def maybe_add_small_step(items: list[str]) -> tuple[list[str], bool]:
        if not topic_hit or not items or not last_user_text:
            return items, False
        if topic_hit not in {"テスト", "勉強", "試験"}:
            return items, False
        if emotion not in {"不安", "悲しい", "しんどい"}:
            return items, False
        hints = [
            "今日はこの範囲だけ見直すくらいでも十分だと思うよ。",
            "例えば5分だけ公式を眺めてみるのもアリだよ。",
            "眠る前にノートを軽く見るだけでも少し安心できるかもね。",
        ]
        hint = hints[len(last_user_text) % len(hints)]
        if len(items) >= max_sentences:
            items[-1] = items[-1].rstrip("。") + f"。{hint}"
        else:
            items.append(hint)
        return items, True

    def maybe_add_question(items: list[str], allow_question: bool = True) -> list[str]:
        if not allow_question:
            return items
        already_question = any(s.endswith(("?", "？")) for s in items)
        recent_ai_question = any(t.strip().endswith(("?", "？")) for t in ai_turns[-2:])
        if already_question or recent_ai_question:
            return items
        topic_phrase = f"{topic_hit}のこと" if topic_hit else "そのこと"
        question = build_question(topic_phrase)
        if not items:
            items.append(question)
        elif len(items) >= max_sentences:
            items[-1] = items[-1].rstrip("。") + "。" + question
        else:
            items.append(question)
        return items

    sentences = ensure_topic_reference(sentences)
    sentences, added_small_step = maybe_add_small_step(sentences)
    sentences = maybe_add_question(sentences, allow_question=not added_small_step)

    if len(sentences) > max_sentences:
        sentences = sentences[:max_sentences]

    if len(sentences) > 1:
        polished = "\n".join(sentences).strip()
    else:
        polished = sentences[0].strip()

    def limit_phrase(text: str, phrase: str) -> str:
        first = text.find(phrase)
        if first == -1:
            return text
        return text[: first + len(phrase)] + text[first + len(phrase):].replace(phrase, "")

    polished = limit_phrase(polished, "少しずつ")

    return polished or reply


@app.route("/api/analyze", methods=["POST"])
def analyze_api():
    """
    NO LOOK フロント用の感情分析API
    ★ 履歴対応版: messages 配列を受け取って会話の文脈を理解
    ★ 後方互換: text だけの場合も対応
    ★ 1日1レコード方式: 同じ日の同じ生徒なら UPDATE、異なる日なら INSERT
    """
    try:
        body = request.get_json() or {}

        # ✅ 新形式: messages + student_id / class_id
        messages = body.get("messages")
        user_id = body.get("student_id") or body.get("user_id") or "demo-student"
        class_id = body.get("class_id") or "demo-class"

        # ✅ 後方互換: textだけ来た場合はmessagesを組み立てる
        if not messages:
            text = body.get("text", "").strip()
            if not text:
                return jsonify({
                    "status": "error",
                    "message": "text or messages is required",
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                }), 400
            messages = [{"role": "user", "content": text}]

        print(f"\n📝 [analyze] Received {len(messages)} messages from {user_id}")

        # 最新のユーザー発話を感情判定に使う
        last_user_text = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_user_text = m.get("content", "")
                break

        if not last_user_text.strip():
            last_user_text = messages[-1].get("content", "")

        # 前回の感情を DB から取得（同じ日の前のレコードがあれば）
        conn_prev = sqlite3.connect(DB_PATH)
        c_prev = conn_prev.cursor()
        c_prev.execute(
            """
            SELECT emotion FROM emotion_logs
            WHERE student_id = ?
              AND DATE(created_at) = DATE('now')
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (user_id,),
        )
        prev_row = c_prev.fetchone()
        prev_emotion = prev_row[0] if prev_row else None
        conn_prev.close()

        # 1️⃣ 感情を判定（前フレーム感情を引き継げるように）
        emotion, confidence = detect_emotion_6(last_user_text, prev_emotion)
        # NOTE: 受験・テスト文脈の揺れが大きい場合は、prev_emotion とテスト系キーワードを組み合わせた
        # スムージングで「不安」を優先的に維持する調整を検討する。
        labels = build_labels(emotion)
        print(f"🎭 [analyze] Text: '{last_user_text[:50]}...' => Emotion: {emotion}, Confidence: {confidence:.2f}")

        # 2️⃣ LLMで「会話の返事」を生成（履歴ごと）
        try:
            ai_reply = call_llm_with_history(messages, emotion)
            used_llm = True
            llm_reason = "OPENAI_GPT4o_MINI"
        except Exception as llm_error:
            print(f"⚠️ [analyze] call_llm_with_history error, fallback: {llm_error}")
            ai_reply = build_reply(emotion, last_user_text)
            used_llm = False
            llm_reason = "FALLBACK_TEMPLATE"

        # 3️⃣ emotion_logs に「今日のレコードをUPDATE」する
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()

        c.execute(
            """
            SELECT id FROM emotion_logs
            WHERE student_id = ?
              AND DATE(created_at) = DATE('now')
            """,
            (user_id,),
        )
        row = c.fetchone()

        if row:
            entry_id = row[0]
            c.execute(
                """
                UPDATE emotion_logs
                SET emotion = ?, score = ?, labels = ?, confidence = ?, created_at = datetime('now'),
                    class_id = ?
                WHERE id = ?
                """,
                (
                    emotion,
                    confidence,
                    json.dumps(labels, ensure_ascii=False),
                    confidence,
                    class_id,
                    entry_id,
                ),
            )
            message = "updated today record"
            print(f"✅ [analyze] UPDATED record {entry_id} for student {user_id}")
        else:
            c.execute(
                """
                INSERT INTO emotion_logs (
                    student_id,
                    class_id,
                    emotion,
                    score,
                    labels,
                    topic_tags,
                    negation_index,
                    source,
                    confidence,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """,
                (
                    user_id,
                    class_id,
                    emotion,
                    confidence,
                    json.dumps(labels, ensure_ascii=False),
                    None,
                    None,
                    "text",
                    confidence,
                ),
            )
            entry_id = c.lastrowid
            message = "created today record"
            print(f"✅ [analyze] CREATED record {entry_id} for student {user_id}")

        conn.commit()
        conn.close()

        return jsonify({
            "reply": ai_reply,
            "emotion": emotion,
            "labels": labels,
            "confidence": confidence,
            "used_llm": used_llm,
            "llm_reason": llm_reason,
            "student_id": user_id,
            "class_id": class_id,
            "entry_id": entry_id,
            "message": message,
            "data": {
                "emotion": emotion,
                "confidence": confidence,
                "labels": labels,
            },
        }), 200

    except Exception as e:
        print(f"❌ [analyze] Exception: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 500


# ========= emotion_logs 読取API =========

@app.route("/api/stats/latest", methods=["GET"])
def get_latest_emotions():
    """
    最新の感情ログを取得
    Query params:
      - student_id: 生徒ID（オプション）
      - limit: 取得件数（デフォルト: 10）
    """
    try:
        student_id = request.args.get("student_id")
        limit = int(request.args.get("limit", 10))

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        if student_id:
            c.execute(
                """
                SELECT * FROM emotion_logs 
                WHERE student_id = ?
                ORDER BY created_at DESC
                LIMIT ?
                """,
                (student_id, limit)
            )
        else:
            c.execute(
                """
                SELECT * FROM emotion_logs 
                ORDER BY created_at DESC
                LIMIT ?
                """,
                (limit,)
            )

        rows = c.fetchall()
        conn.close()

        result = [dict(row) for row in rows]
        return jsonify({
            "status": "success",
            "data": result,
            "count": len(result),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500


@app.route("/api/stats/weekly", methods=["GET"])
def get_weekly_stats():
    """
    週間の感情統計を取得
    Query params:
      - class_id: クラスID（オプション）
      - student_id: 生徒ID（オプション）
      - days: 過去N日間（デフォルト: 7）
    """
    try:
        class_id = request.args.get("class_id")
        student_id = request.args.get("student_id")
        days = int(request.args.get("days", 7))

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        query = """
        SELECT 
            emotion,
            COUNT(*) as count,
            AVG(CAST(confidence as FLOAT)) as avg_confidence
        FROM emotion_logs
        WHERE datetime(created_at) >= datetime('now', '-' || ? || ' days')
        """
        params = [days]

        if student_id:
            query += " AND student_id = ?"
            params.append(student_id)

        if class_id:
            query += " AND class_id = ?"
            params.append(class_id)

        query += " GROUP BY emotion ORDER BY count DESC"

        c.execute(query, params)
        rows = c.fetchall()

        emotion_stats = [dict(row) for row in rows]

        total_query = """
        SELECT COUNT(*) as total_messages
        FROM emotion_logs
        WHERE datetime(created_at) >= datetime('now', '-' || ? || ' days')
        """
        total_params = [days]

        if student_id:
            total_query += " AND student_id = ?"
            total_params.append(student_id)

        if class_id:
            total_query += " AND class_id = ?"
            total_params.append(class_id)

        c.execute(total_query, total_params)
        total = dict(c.fetchone())
        conn.close()

        return jsonify({
            "status": "success",
            "data": {
                "stats": emotion_stats,
                "total_messages": total["total_messages"],
                "days": days,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500


@app.route("/api/stats/emotion-breakdown", methods=["GET"])
def get_emotion_breakdown():
    """
    感情別の詳細統計
    Query params:
      - days: 過去N日間（デフォルト: 30）
    """
    try:
        days = int(request.args.get("days", 30))

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        c.execute("""
        SELECT 
            emotion,
            COUNT(*) as count,
            COUNT(DISTINCT student_id) as unique_students,
            AVG(CAST(confidence as FLOAT)) as avg_confidence,
            MIN(created_at) as first_occurrence,
            MAX(created_at) as last_occurrence
        FROM emotion_logs
        WHERE datetime(created_at) >= datetime('now', '-' || ? || ' days')
        GROUP BY emotion
        ORDER BY count DESC
        """, [days])

        stats = [dict(row) for row in c.fetchall()]

        c.execute("""
        SELECT 
            emotion, 
            COUNT(*) as daily_count, 
            DATE(created_at) as date
        FROM emotion_logs
        WHERE datetime(created_at) >= datetime('now', '-' || ? || ' days')
        GROUP BY emotion, DATE(created_at)
        ORDER BY emotion, date DESC
        """, [days])

        daily_breakdown = [dict(row) for row in c.fetchall()]
        conn.close()

        return jsonify({
            "status": "success",
            "data": {
                "emotion_stats": stats,
                "daily_breakdown": daily_breakdown,
                "days": days,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=True)
