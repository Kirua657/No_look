"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerWithEmail } from "../../lib/firebase/auth";

const RegisterForm = () => {
  const [nickname, setNickname] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [years, setYears] = useState("");
  const [classValue, setClassValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  // バリデーション関数
  const validateField = (field: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    switch(field) {
      case 'nickname':
        if (!value.trim()) errors.nickname = 'ニックネームを入力してください';
        else if (value.length < 2) errors.nickname = 'ニックネームは2文字以上で入力してください';
        else if (value.length > 20) errors.nickname = 'ニックネームは20文字以内で入力してください';
        break;
      case 'schoolName':
        if (!value.trim()) errors.schoolName = '学校名を入力してください';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) errors.email = 'メールアドレスを入力してください';
        else if (!emailRegex.test(value)) errors.email = '有効なメールアドレスを入力してください';
        break;
      case 'password':
        if (!value) errors.password = 'パスワードを入力してください';
        else if (value.length < 6) errors.password = 'パスワードは6文字以上で入力してください';
        break;
      case 'confirmPassword':
        if (!value) errors.confirmPassword = 'パスワードを再入力してください';
        else if (value !== password) errors.confirmPassword = 'パスワードが一致しません';
        break;
    }
    
    setFieldErrors(prev => ({...prev, [field]: errors[field] || ''}));
    return !errors[field];
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const nicknameValid = validateField('nickname', nickname);
      const schoolValid = validateField('schoolName', schoolName);
      if (nicknameValid && schoolValid) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (years && classValue) setCurrentStep(3);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 最終バリデーション
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);
    
    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      setError('入力内容を確認してください');
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const user = await registerWithEmail(email, password, {
        nickname,
        schoolName,
        years,
        class: classValue
      });
      
      if (user) {
        console.log('新規登録成功:', user);
        
        // ログイン状態を設定
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('loginTimestamp', Date.now().toString());
        
        // 登録成功時のリダイレクト
        router.push("/student/home");
      }
    } catch (err: any) {
      setError(err.message || "登録に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 450, 
      margin: "20px auto", 
      padding: 32, 
      background: "rgba(255, 255, 255, 0.95)", 
      borderRadius: 16, 
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      color: "#333",
      width: "100%"
    }}>
      {/* ヘッダー */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ 
          fontSize: 28, 
          fontWeight: "bold", 
          marginBottom: 8,
          color: "#333"
        }}>
          🎓 新規登録
        </h2>
        <p style={{ fontSize: 16, color: "#666", margin: 0 }}>
          アカウントを作成してサービスを始めましょう
        </p>
      </div>

      {/* プログレスバー */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          {[1, 2, 3].map((step) => (
            <div key={step} style={{
              width: "30%",
              height: 4,
              background: currentStep >= step ? "#2196f3" : "rgba(180,180,180,0.5)",
              borderRadius: 2,
              transition: "all 0.3s ease"
            }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          ステップ {currentStep} / 3: {
            currentStep === 1 ? "基本情報" :
            currentStep === 2 ? "学習情報" : "アカウント情報"
          }
        </div>
      </div>
      
      {error && (
        <div style={{
          background: "rgba(244,67,54,0.1)",
          color: "#d32f2f",
          padding: "12px 16px",
          borderRadius: "10px",
          marginBottom: "20px",
          fontSize: "14px",
          textAlign: "center",
          border: "1px solid rgba(244,67,54,0.3)"
        }}>
          ⚠️ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* ステップ 1: 基本情報 */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 14, 
                fontWeight: '600',
                opacity: 0.9
              }}>
                🙋‍♂️ ニックネーム
              </label>
              <input 
                value={nickname} 
                onChange={e => {
                  setNickname(e.target.value);
                  validateField('nickname', e.target.value);
                }}
                placeholder="あなたのニックネームを入力"
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: 12, 
                  border: fieldErrors.nickname ? '2px solid #ff5252' : '2px solid #ddd',
                  fontSize: 16,
                  background: '#fff',
                  color: '#333',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }} 
              />
              {fieldErrors.nickname && (
                <div style={{ color: '#ffcdd2', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.nickname}
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: 32 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 14, 
                fontWeight: '600',
                opacity: 0.9
              }}>
                🏠 学校名
              </label>
              <input 
                value={schoolName} 
                onChange={e => {
                  setSchoolName(e.target.value);
                  validateField('schoolName', e.target.value);
                }}
                placeholder="例: ノールック中学校"
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: 12, 
                  border: fieldErrors.schoolName ? '2px solid #ff5252' : '2px solid #ddd',
                  fontSize: 16,
                  background: '#fff',
                  color: '#333',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }} 
              />
              {fieldErrors.schoolName && (
                <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.schoolName}
                </div>
              )}
            </div>
            
            <button 
              type="button"
              onClick={nextStep}
              style={{ 
                width: '100%', 
                padding: '16px 0', 
                fontSize: 18, 
                background: (nickname && schoolName && !fieldErrors.nickname && !fieldErrors.schoolName) 
                  ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderRadius: 12, 
                fontWeight: 'bold', 
                cursor: (nickname && schoolName) ? 'pointer' : 'not-allowed',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              disabled={!nickname || !schoolName || !!fieldErrors.nickname || !!fieldErrors.schoolName}
            >
              次へ →
            </button>
          </div>
        )}
        
        {/* ステップ 2: 学習情報 */}
        {currentStep === 2 && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 14, 
                  fontWeight: '600',
                  color: '#333'
                }}>
                  📚 学年
                </label>
                <select 
                  value={years} 
                  onChange={e => setYears(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: '14px 16px', 
                    borderRadius: 12, 
                    border: '2px solid #ddd',
                    fontSize: 16,
                    background: '#fff',
                    color: '#333',
                    outline: 'none'
                  }}
                >
                  <option value="" style={{ color: '#333' }}>選択してください</option>
                  <option value="1年" style={{ color: '#333' }}>1年</option>
                  <option value="2年" style={{ color: '#333' }}>2年</option>
                  <option value="3年" style={{ color: '#333' }}>3年</option>
                  <option value="4年" style={{ color: '#333' }}>4年</option>
                  <option value="5年" style={{ color: '#333' }}>5年</option>
                  <option value="6年" style={{ color: '#333' }}>6年</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 14, 
                  fontWeight: '600',
                  color: '#333'
                }}>
                  🏢 クラス
                </label>
                <select 
                  value={classValue} 
                  onChange={e => setClassValue(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: '14px 16px', 
                    borderRadius: 12, 
                    border: '2px solid #ddd',
                    fontSize: 16,
                    background: '#fff',
                    color: '#333',
                    outline: 'none'
                  }}
                >
                  <option value="" style={{ color: '#333' }}>選択してください</option>
                  <option value="1組" style={{ color: '#333' }}>1組</option>
                  <option value="2組" style={{ color: '#333' }}>2組</option>
                  <option value="3組" style={{ color: '#333' }}>3組</option>
                  <option value="4組" style={{ color: '#333' }}>4組</option>
                  <option value="5組" style={{ color: '#333' }}>5組</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                type="button"
                onClick={prevStep}
                style={{ 
                  flex: 1,
                  padding: '16px 0', 
                  fontSize: 16, 
                  background: 'rgba(255,255,255,0.1)', 
                  color: '#fff', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderRadius: 12, 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                ← 戻る
              </button>
              <button 
                type="button"
                onClick={nextStep}
                style={{ 
                  flex: 2,
                  padding: '16px 0', 
                  fontSize: 16, 
                  background: (years && classValue) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', 
                  color: '#fff', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderRadius: 12, 
                  fontWeight: 'bold', 
                  cursor: (years && classValue) ? 'pointer' : 'not-allowed',
                  backdropFilter: 'blur(10px)'
                }}
                disabled={!years || !classValue}
              >
                次へ →
              </button>
            </div>
          </div>
        )}

        {/* ステップ 3: アカウント情報 */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 14, 
                fontWeight: '600',
                opacity: 0.9
              }}>
                📧 メールアドレス
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={e => {
                  setEmail(e.target.value);
                  validateField('email', e.target.value);
                }}
                placeholder="your-email@example.com"
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: 12, 
                  border: fieldErrors.email ? '2px solid #ff5252' : '2px solid #ddd',
                  fontSize: 16,
                  background: '#fff',
                  color: '#333',
                  outline: 'none'
                }} 
              />
              {fieldErrors.email && (
                <div style={{ color: '#ffcdd2', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.email}
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 14, 
                fontWeight: '600',
                opacity: 0.9
              }}>
                🔐 パスワード
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={e => {
                    setPassword(e.target.value);
                    validateField('password', e.target.value);
                  }}
                  placeholder="6文字以上で入力してください"
                  style={{ 
                    width: '100%', 
                    padding: '14px 50px 14px 16px', 
                    borderRadius: 12, 
                    border: fieldErrors.password ? '2px solid #ff5252' : '2px solid rgba(255,255,255,0.3)',
                    fontSize: 16,
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                    パスワード強度: 
                    {getPasswordStrength(password) < 2 && '弱'}
                    {getPasswordStrength(password) >= 2 && getPasswordStrength(password) < 4 && '中'}
                    {getPasswordStrength(password) >= 4 && '強'}
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{
                        flex: 1,
                        height: 3,
                        background: i <= getPasswordStrength(password) 
                          ? (getPasswordStrength(password) < 2 ? '#ff5252' : getPasswordStrength(password) < 4 ? '#ffa726' : '#4caf50')
                          : 'rgba(255,255,255,0.2)',
                        borderRadius: 1
                      }} />
                    ))}
                  </div>
                </div>
              )}
              {fieldErrors.password && (
                <div style={{ color: '#ffcdd2', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.password}
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: 32 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 14, 
                fontWeight: '600',
                opacity: 0.9
              }}>
                🔄 パスワード確認
              </label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  validateField('confirmPassword', e.target.value);
                }}
                placeholder="パスワードを再入力してください"
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: 12, 
                  border: fieldErrors.confirmPassword ? '2px solid #ff5252' : '2px solid rgba(255,255,255,0.3)',
                  fontSize: 16,
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }} 
              />
              {fieldErrors.confirmPassword && (
                <div style={{ color: '#ffcdd2', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.confirmPassword}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                type="button"
                onClick={prevStep}
                style={{ 
                  flex: 1,
                  padding: '16px 0', 
                  fontSize: 16, 
                  background: 'rgba(255,255,255,0.1)', 
                  color: '#fff', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderRadius: 12, 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                ← 戻る
              </button>
              <button 
                type="submit" 
                disabled={isLoading || !email || !password || !confirmPassword || password !== confirmPassword}
                style={{ 
                  flex: 2,
                  padding: '16px 0', 
                  fontSize: 18, 
                  background: isLoading || !email || !password || !confirmPassword || password !== confirmPassword 
                    ? 'rgba(255,255,255,0.1)' : 'rgba(76,175,80,0.8)', 
                  color: '#fff', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderRadius: 12, 
                  fontWeight: 'bold', 
                  cursor: isLoading || !email || !password || !confirmPassword || password !== confirmPassword ? 'not-allowed' : 'pointer',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 15px rgba(76,175,80,0.3)'
                }}
              >
                {isLoading ? '🔄 登録中...' : '✨ 登録完了'}
              </button>
            </div>
          </div>
        )}
      </form>
      
      {/* フッター */}
      <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#666' }}>
        すでにアカウントをお持ちですか？ 
        <span 
          onClick={() => router.push('/login')} 
          style={{ color: '#2196f3', textDecoration: 'underline', cursor: 'pointer' }}
        >
          ログイン
        </span>
      </div>
    </div>
  );
};

export default RegisterForm;
