#!/usr/bin/env python3
"""
No_look バックエンドサーバー起動スクリプト
フロントエンドプロジェクトから簡単にバックエンドを起動できるように
"""

import sys
import os
import subprocess
from pathlib import Path

def main():
    # スクリプトの場所からバックエンドディレクトリを特定
    script_dir = Path(__file__).parent
    backend_dir = script_dir / "No_look"
    
    if not backend_dir.exists():
        print("エラー: バックエンドディレクトリ（No_look）が見つかりません")
        print(f"   期待する場所: {backend_dir}")
        return 1
    
    # 環境設定ファイルのチェック
    env_file = backend_dir / ".env"
    env_example = backend_dir / ".env.example"
    
    if not env_file.exists():
        print("警告: .envファイルが見つかりません")
        if env_example.exists():
            print(f"   .env.exampleをコピーして設定してください:")
            print(f"   copy \"{env_example}\" \"{env_file}\"")
            print("   その後、必要なAPIキーを設定してください")
        return 1
    
    # 必要なパッケージのチェック（requirements.txt）
    requirements_file = backend_dir / "requirements.txt"
    if not requirements_file.exists():
        print("❌ requirements.txtが見つかりません")
        return 1
    
    print("起動中: No_look バックエンドサーバーを起動しています...")
    print(f"   バックエンドディレクトリ: {backend_dir}")
    print(f"   環境設定ファイル: {env_file}")
    
    try:
        # バックエンドディレクトリに移動してサーバーを起動
        os.chdir(backend_dir)
        
        # Pythonパッケージのインストールを確認
        print("パッケージ: 必要なパッケージを確認中...")
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], check=True)
        
        # FastAPIサーバーの起動
        print("サーバー: FastAPIサーバーを起動中...")
        print("   URL: http://localhost:8000")
        print("   API docs: http://localhost:8000/docs")
        print("   停止するには Ctrl+C を押してください")
        
        subprocess.run([
            sys.executable, "-m", "uvicorn", "app.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ], check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"エラーが発生しました: {e}")
        return 1
    except KeyboardInterrupt:
        print("\nサーバーを停止しました")
        return 0
    
    return 0

if __name__ == "__main__":
    sys.exit(main())