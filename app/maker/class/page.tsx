
"use client";



import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { FiSend } from 'react-icons/fi';
import DesktopFrame from '../../../components/frame/DesktopFrame';
import { classData, StudentComment } from '../../teacher/class/data';

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const thStyle: React.CSSProperties = { backgroundColor: '#f7f7f7', borderBottom: '2px solid #ccc', padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', borderRight: '1.5px solid #ccc' };
const tdStyle: React.CSSProperties = { borderBottom: '1px solid #eee', padding: '10px', verticalAlign: 'middle', borderRight: '1px solid #ccc' };
const buttonContainerStyle: React.CSSProperties = { display: 'flex', gap: '8px', justifyContent: 'flex-end' };
const buttonBaseStyle: React.CSSProperties = { width: '35px', height: '25px', borderRadius: '5px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' };
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalBaseStyle: React.CSSProperties = { background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)', position: 'relative', border: '4px solid' };
const closeButtonStyle: React.CSSProperties = {
	position: 'absolute',
	top: '16px',
	right: '16px',
	background: '#EF4444',
	color: '#fff',
	border: 'none',
	borderRadius: '8px',
	fontWeight: 'bold',
	fontSize: '16px',
	padding: '6px 18px',
	display: 'flex',
	alignItems: 'center',
	gap: '6px',
	cursor: 'pointer',
	zIndex: 1001
};
const gridContainerStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' };
const gridItemStyle: React.CSSProperties = { background: '#f5f5f5', padding: '15px', borderRadius: '5px' };
const textareaStyle: React.CSSProperties = { width: '100%', height: '150px', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', resize: 'none' };

const DetailModal: React.FC<{ isOpen: boolean, onClose: () => void, data: StudentComment }> = ({ isOpen, onClose, data }) => {
	if (!isOpen) return null;
	return (
		<div style={overlayStyle}>
			<div style={{ ...modalBaseStyle, borderColor: '#4CAF50' }}>
				<button style={closeButtonStyle} onClick={onClose}><FiX size={20} />閉じる</button>
				<div style={{ paddingTop: '10px' }}>
					<h3>ID: {data.id}</h3>
					<h3>抽出単語: {data.word}</h3>
					<div style={{ ...gridItemStyle, marginTop: '15px' }}>
						<h4>詳細情報</h4>
						<textarea readOnly style={{ ...textareaStyle, height: '200px' }} value={data.detail} />
					</div>
				</div>
			</div>
		</div>
	);
};

const AiControlModal: React.FC<{ isOpen: boolean, onClose: () => void, data: StudentComment }> = ({ isOpen, onClose, data }) => {
	if (!isOpen) return null;
	const emotionOrder = [
		{ key: 'joy', label: '喜び' },
		{ key: 'sadness', label: '悲しみ' },
		{ key: 'anger', label: '怒り' },
		{ key: 'surprise', label: '驚き' },
		{ key: 'neutral', label: '中立' },
		{ key: 'confusion', label: '困惑' },
	];
	const emotionStats = emotionOrder
		.map(({ key, label }) => `${label}: ${Math.round((data.emotion[key] ?? 0) * 100)}%`)
		.join('\n');
	return (
		<div style={overlayStyle}>
			<div style={{ ...modalBaseStyle, borderColor: '#FFC107' }}>
				<button style={closeButtonStyle} onClick={onClose}><FiX size={20} />閉じる</button>
				<div style={{ paddingTop: '10px' }}>
					<h3 style={{ borderBottom: '1px solid #ccc' }}>ID: {data.id}</h3>
					<div style={gridContainerStyle}>
						<div style={gridItemStyle}>
							<h4>AIに指示</h4>
							<textarea placeholder="AIへの指示を入力..." style={textareaStyle}></textarea>
							<button style={{ padding: '8px', marginTop: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
								<FiSend size={20} />
							</button>
						</div>
						<div style={gridItemStyle}>
							<h4>感情統計</h4>
							<textarea readOnly style={textareaStyle} value={emotionStats} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
	const StatusButtons: React.FC<{ item: StudentComment; onGreenClick: (item: StudentComment) => void; onYellowClick: (item: StudentComment) => void; }> = ({ item, onGreenClick, onYellowClick }) => (
		<div style={buttonContainerStyle}>
			<div style={{ ...buttonBaseStyle, backgroundColor: '#4CAF50' }} onClick={() => onGreenClick(item)}></div>
			<div style={{ ...buttonBaseStyle, backgroundColor: '#FFC107' }} onClick={() => onYellowClick(item)}></div>
		</div>
	);

	export default function MakerClassPage() {
		const [isDetailOpen, setIsDetailOpen] = useState(false);
		const [isAiOpen, setIsAiOpen] = useState(false);
		const [selectedItem, setSelectedItem] = useState<StudentComment | null>(null);

		const handleGreenClick = (item: StudentComment) => {
			setSelectedItem(item);
			setIsDetailOpen(true);
			setIsAiOpen(false);
		};

		const handleYellowClick = (item: StudentComment) => {
			setSelectedItem(item);
			setIsAiOpen(true);
			setIsDetailOpen(false);
		};

		return (
			<DesktopFrame>
				<div style={{ padding: '20px' }}>
					<table style={tableStyle}>
						<thead>
							<tr>
								<th style={{ ...thStyle, width: '100px' }}>ID</th>
								<th style={thStyle}>頻出単語</th>
								<th style={{ ...thStyle, width: '120px' }}></th>
							</tr>
						</thead>
						<tbody>
							{classData.map((item, index) => (
								<tr key={index}>
									<td style={tdStyle}>{item.id}</td>
									<td style={tdStyle}>{item.word}</td>
									<td style={tdStyle}>
										<StatusButtons item={item} onGreenClick={handleGreenClick} onYellowClick={handleYellowClick} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{selectedItem && (
						<>
							<DetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedItem} />
							<AiControlModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} data={selectedItem} />
						</>
					)}
				</div>
			</DesktopFrame>
		);
	}

