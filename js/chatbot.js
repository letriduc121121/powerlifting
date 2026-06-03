// js/chatbot.js — Chatbot assistant interface and dynamic bot responses

import { appData } from './api.js';

export function toggleChat() {
  const box = document.getElementById('chatBox');
  const btn = document.getElementById('chatToggle');
  if (!box || !btn) return;
  const isOpen = box.classList.toggle('open');
  btn.classList.toggle('open', isOpen);
}

export function getBotReply(message) {
  const q = message.toLowerCase();
  
  const botAnswers = {
    'lịch thi đấu': `Giải đấu diễn ra ngày <strong>${appData.heroDate}</strong> tại <strong>${appData.heroLocation}</strong>. Bắt đầu cân đo từ 7:00 sáng.`,
    'địa điểm': `Giải đấu được tổ chức tại <strong>Nhà thi đấu tỉnh, ${appData.heroLocation}</strong>. Bạn hãy xem thêm bản đồ để chuẩn bị lộ trình di chuyển.`,
    'đăng ký': `Bạn có thể đăng ký trực tuyến bằng cách nhấn vào nút <a href="${appData.regLink}" target="_blank" style="color: var(--yellow); font-weight:700;">Đăng Ký Ngay</a> tại mục giải đấu. BTC sẽ liên hệ lại qua điện thoại/email để xác nhận lệ phí thi đấu.`,
    'hạng cân': `Giải đấu chia làm nhiều phân khúc: Nam gồm 59kg, 66kg, 74kg, 83kg, 93kg, 105kg, 120kg và trên 120kg. Nữ gồm 47kg, 52kg, 57kg, 63kg, 69kg, 76kg, 84kg và trên 84kg.`,
    'powerlifting là gì': `Powerlifting là môn thể thao thử thách sức mạnh tối đa ở 3 bài thi nâng tạ cơ bản: <strong>Squat</strong> (Gánh tạ), <strong>Bench Press</strong> (Đẩy tạ nằm) và <strong>Deadlift</strong> (Kéo tạ). VĐV sẽ có 3 lượt nâng ở mỗi bài để tìm ra mức tạ cao nhất của mình.`,
    'giải thưởng': `Cơ cấu giải thưởng giải đấu vô cùng hấp dẫn:<br>🥇 Giải Vàng (Vô địch): <strong>${appData.prizes?.gold?.amount || '5.000.000đ'}</strong> (${appData.prizes?.gold?.desc || 'Mỗi hạng cân'})<br>🥈 Giải Bạc (Á quan): <strong>${appData.prizes?.silver?.amount || '3.000.000đ'}</strong> (${appData.prizes?.silver?.desc || 'Mỗi hạng cân'})<br>🥉 Giải Đồng (Hạng ba): <strong>${appData.prizes?.bronze?.amount || '1.500.000đ'}</strong> (${appData.prizes?.bronze?.desc || 'Mỗi hạng cân'})`,
    'mặc gì': `VĐV bắt buộc phải mặc <strong>Singlet (áo liền quần ôm sát)</strong> đúng tiêu chuẩn thi đấu, mang giày đế bằng chuyên dụng. Có thể sử dụng các trang thiết bị bảo vệ khớp như đai lưng đầu mềm (belt), băng quấn cổ tay (wrist wraps) và băng gối (knee sleeves) nằm trong danh mục luật raw.`,
    'liên hệ': `Ban tổ chức giải Powerlifting Championship 2026:<br>📧 Email: <strong>plchampionship2026@gmail.com</strong><br>📞 Hotline: <strong>0901 234 567</strong>`
  };

  if (q.includes('lịch') || q.includes('ngày') || q.includes('thời gian')) return botAnswers['lịch thi đấu'];
  if (q.includes('địa điểm') || q.includes('đâu') || q.includes('chỗ nào')) return botAnswers['địa điểm'];
  if (q.includes('đăng ký') || q.includes('tham gia') || q.includes('form')) return botAnswers['đăng ký'];
  if (q.includes('hạng cân') || q.includes('nặng') || q.includes('bao nhiêu ký')) return botAnswers['hạng cân'];
  if (q.includes('thưởng') || q.includes('tiền') || q.includes('huy chương') || q.includes('cơ cấu')) return botAnswers['giải thưởng'];
  if (q.includes('mặc') || q.includes('trang phục') || q.includes('đai') || q.includes('giáp')) return botAnswers['mặc gì'];
  if (q.includes('luật') || q.includes('powerlifting') || q.includes('là gì')) return botAnswers['powerlifting là gì'];
  if (q.includes('liên hệ') || q.includes('hotline') || q.includes('điện thoại') || q.includes('email')) return botAnswers['liên hệ'];

  return 'Trợ lý ảo chưa hiểu rõ câu hỏi này. Bạn vui lòng gửi email về <strong>plchampionship2026@gmail.com</strong> hoặc gọi hotline <strong>0901 234 567</strong> để được tư vấn trực tiếp nhé! 😊';
}

export function appendChatMessage(text, role) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const bubble = document.createElement('div');
  bubble.className = `msg ${role}`;
  bubble.innerHTML = text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

export function sendChatMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  appendChatMessage(text, 'user');
  input.value = '';

  setTimeout(() => {
    const reply = getBotReply(text);
    appendChatMessage(reply, 'bot');
  }, 400);
}

export function sendQuickReply(text) {
  appendChatMessage(text, 'user');
  const qrBox = document.getElementById('quickReplies');
  if (qrBox) qrBox.style.display = 'none';
  
  setTimeout(() => {
    const reply = getBotReply(text);
    appendChatMessage(reply, 'bot');
  }, 400);
}
