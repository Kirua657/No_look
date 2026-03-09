"use client";
import { useState } from "react";
import "../../../styles/student-responsive.css";
import SmartphoneFrame from "../../../components/frame/SmartphoneFrame";
import Link from 'next/link';
import SmartphoneHeader from "../../../components/frame/SmartphoneHeader";
import StudentBell from "../../../components/student/StudentBell";
import StudentFooter from "../../../components/student/StudentFooter";

export default function QuestionPage() {
	const [form, setForm] = useState({
		category: "",
		school: "",
		tel: "",
		email: "",
		message: "",
	});
	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		alert("送信しました！\n" + JSON.stringify(form, null, 2));
	};
	return (
		<div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f5' }}>
			<SmartphoneFrame>
				<SmartphoneHeader />
				<div style={{ position: 'absolute', top: '25mm', right: '3mm', zIndex: 50 }}><StudentBell count={3} /></div>
				<main style={{ 
					flex: 1, 
					padding: '10px 16px 20px 16px', 
					overflow: 'auto',
					paddingTop: '80px', // ヘッダー分のスペース
					paddingBottom: '2cm' // フッター分のスペース
				}}>
					{/* 左上に設定へ戻るボタン（ヘルプページと同様の配置） */}
					<div style={{
						marginTop: 'calc(60px)',
						padding: '0 16px',
						display: 'flex',
						alignItems: 'center',
						gap: '12px'
					}}>
						<Link href="/student/setting">
							<button style={{
								background: 'none',
								border: 'none',
								fontSize: '16px',
								cursor: 'pointer',
								color: '#6b7280'
							}}>
								← 設定に戻る
							</button>
						</Link>
					</div>
					<div style={{ 
						background: '#FF9500',
						borderRadius: '16px',
						padding: '20px',
						marginBottom: '16px',
						marginTop: '18px',
						marginLeft: '12px',
						marginRight: '12px',
						textAlign: 'center'
					}}>
						<h1 style={{ 
							fontSize: '20px', 
							fontWeight: 'bold', 
							color: 'white',
							margin: '0 0 6px 0'
						}}>お問い合わせ</h1>
						<p style={{
							fontSize: '13px',
							color: 'rgba(255,255,255,0.9)',
							margin: '0'
						}}>ご質問やご要望をお聞かせください</p>
					</div>
					
					<form onSubmit={handleSubmit} style={{ 
						background: '#fff', 
						padding: '20px', 
						borderRadius: '12px', 
						boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
						marginBottom: '20px'
					}}>
						{/* カテゴリ選択 */}
						<div style={{ marginBottom: '16px' }}>
							<label style={{ 
								display: 'block', 
								marginBottom: '6px',
								fontSize: '13px',
								fontWeight: '600',
								color: '#374151'
							}}>カテゴリ</label>
							<select 
								name="category" 
								value={form.category} 
								onChange={handleChange} 
								required 
								style={{ 
									width: '100%', 
									padding: '10px', 
									borderRadius: '8px', 
									border: '2px solid #e5e7eb',
									fontSize: '14px',
									transition: 'border-color 0.2s'
								}}
								onFocus={(e) => e.target.style.borderColor = '#667eea'}
								onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
							>
								<option value="">選択してください</option>
								<option value="technical">技術的な問題</option>
								<option value="account">アカウント</option>
								<option value="feature">機能要望</option>
								<option value="general">一般質問</option>
								<option value="other">その他</option>
							</select>
						</div>

						<div style={{ marginBottom: '16px' }}>
							<label style={{ 
								display: 'block', 
								marginBottom: '6px',
								fontSize: '13px',
								fontWeight: '600',
								color: '#374151'
							}}>学校名</label>
							<input 
								name="school" 
								value={form.school} 
								onChange={handleChange} 
								placeholder="例: 東京高等学校"
								required 
								style={{ 
									width: '100%', 
									padding: '10px', 
									borderRadius: '8px', 
									border: '2px solid #e5e7eb',
									fontSize: '14px',
									transition: 'border-color 0.2s'
								}}
								onFocus={(e) => e.target.style.borderColor = '#667eea'}
								onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
							/>
						</div>
						<div style={{ marginBottom: '16px' }}>
							<label style={{ 
								display: 'block', 
								marginBottom: '6px',
								fontSize: '13px',
								fontWeight: '600',
								color: '#374151'
							}}>電話番号</label>
							<input 
								name="tel" 
								value={form.tel} 
								onChange={handleChange} 
								placeholder="例: 03-1234-5678"
								required 
								style={{ 
									width: '100%', 
									padding: '10px', 
									borderRadius: '8px', 
									border: '2px solid #e5e7eb',
									fontSize: '14px',
									transition: 'border-color 0.2s'
								}}
								onFocus={(e) => e.target.style.borderColor = '#667eea'}
								onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
							/>
						</div>
						<div style={{ marginBottom: '16px' }}>
							<label style={{ 
								display: 'block', 
								marginBottom: '6px',
								fontSize: '13px',
								fontWeight: '600',
								color: '#374151'
							}}>メールアドレス</label>
							<input 
								name="email" 
								type="email" 
								value={form.email} 
								onChange={handleChange} 
								placeholder="例: example@school.jp"
								required 
								style={{ 
									width: '100%', 
									padding: '10px', 
									borderRadius: '8px', 
									border: '2px solid #e5e7eb',
									fontSize: '14px',
									transition: 'border-color 0.2s'
								}}
								onFocus={(e) => e.target.style.borderColor = '#667eea'}
								onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
							/>
						</div>
						<div style={{ marginBottom: '20px' }}>
							<label style={{ 
								display: 'block', 
								marginBottom: '6px',
								fontSize: '13px',
								fontWeight: '600',
								color: '#374151'
							}}>お問い合わせ内容</label>
							<textarea 
								name="message" 
								value={form.message} 
								onChange={handleChange} 
								placeholder="詳細をお聞かせください..."
								required 
								rows={3} 
								style={{ 
									width: '100%', 
									padding: '10px', 
									borderRadius: '8px', 
									border: '2px solid #e5e7eb',
									fontSize: '14px',
									resize: 'vertical',
									minHeight: '80px',
									transition: 'border-color 0.2s',
									fontFamily: 'inherit'
								}}
								onFocus={(e) => e.target.style.borderColor = '#667eea'}
								onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
							/>
						</div>
						
						{/* 送信ボタン */}
						<button 
							type="submit" 
							style={{ 
								width: '100%', 
								padding: '14px 0', 
								fontSize: '16px',
								fontWeight: 'bold',
								background: '#007AFF', 
								color: '#fff', 
								border: 'none', 
								borderRadius: '10px',
								cursor: 'pointer',
								transition: 'transform 0.2s, box-shadow 0.2s',
								boxShadow: '0 4px 15px rgba(0, 122, 255, 0.4)'
							}}
							onMouseDown={(e) => {
								const target = e.target as HTMLElement;
								target.style.transform = 'scale(0.98)';
							}}
							onMouseUp={(e) => {
								const target = e.target as HTMLElement;
								target.style.transform = 'scale(1)';
							}}
							onMouseLeave={(e) => {
								const target = e.target as HTMLElement;
								target.style.transform = 'scale(1)';
							}}
						>送信</button>
					</form>
				</main>
				<StudentFooter />
			</SmartphoneFrame>
		</div>
	);
}
