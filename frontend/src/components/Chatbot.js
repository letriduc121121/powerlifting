import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";

export default function Chatbot() {
  const { state } = useApp();
  const { config, images } = state;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Xin chào! 👋 Tôi có thể giúp bạn về thông tin giải đấu Powerlifting 2026. Bạn muốn hỏi gì?",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [quickRepliesVisible, setQuickRepliesVisible] = useState(true);
  const messagesEndRef = useRef(null);

  const chatbotLogoSrc = images?.chatbotLogo || "/images/chatbot-logo.png";

  const quickReplies = [
    { label: "📅 Lịch thi đấu", text: "Lịch thi đấu?" },
    { label: "📝 Đăng ký", text: "Đăng ký như thế nào?" },
    { label: "❓ PL là gì", text: "Powerlifting là gì?" },
    { label: "⚖️ Hạng cân", text: "Hạng cân nào có thể tham gia?" },
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const getBotReply = (userText) => {
    const t = userText.toLowerCase();
    const date = config?.heroDate || "20/08/2026 – 21/08/2026";
    const location = config?.heroLocation || "Thành phố Hà Nội";

    if (t.includes("lịch") || t.includes("thời gian") || t.includes("ngày"))
      return `📅 Giải đấu diễn ra vào **${date}** tại ${location}. Thời gian thi đấu từ 07:00 – 18:00 mỗi ngày.`;
    if (t.includes("đăng ký") || t.includes("tham gia") || t.includes("tham dự"))
      return "📝 Để đăng ký tham gia, hãy click nút **Đăng Ký Ngay** ở phần Giải Đấu. Bạn cần điền đầy đủ thông tin cá nhân và hạng cân thi đấu.";
    if (t.includes("powerlifting") || t.includes("pl là gì") || t.includes("môn gì"))
      return "🏋️ Powerlifting là bộ môn thể thao sức mạnh tối đa với 3 bài nâng: **Squat** (Gánh tạ), **Bench Press** (Đẩy ngực) và **Deadlift** (Kéo tạ). Mỗi VĐV có 3 lượt thực hiện mỗi bài để đạt mức tạ 1RM cao nhất.";
    if (t.includes("hạng cân") || t.includes("cân nặng") || t.includes("weight"))
      return "⚖️ **Nam:** 59, 66, 74, 83, 93, 105, 120, +120kg\n**Nữ:** 47, 52, 57, 63, 69, 76, 84, +84kg";
    if (t.includes("địa điểm") || t.includes("ở đâu") || t.includes("nơi"))
      return `📍 Giải đấu tổ chức tại **${location}**. Địa điểm cụ thể sẽ được thông báo sớm.`;
    if (t.includes("giải thưởng") || t.includes("tiền thưởng") || t.includes("prize"))
      return "🏆 Cơ cấu giải thưởng đang được cập nhật. Hãy theo dõi mục **Giải Đấu** để biết thông tin mới nhất!";
    if (t.includes("xin chào") || t.includes("hello") || t.includes("hi"))
      return "👋 Xin chào! Tôi là PL Assistant – trợ lý của giải Powerlifting 2026. Bạn cần hỏi thông tin gì?";
    return "🤔 Cảm ơn câu hỏi của bạn! Tôi chưa có thông tin về vấn đề này. Hãy liên hệ BTC qua mạng xã hội của chúng tôi để được hỗ trợ tốt nhất nhé!";
  };

  const sendMessage = (text) => {
    const msg = (text || inputVal).trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInputVal("");

    setTimeout(() => {
      const reply = getBotReply(msg);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`chatbot-toggle${isOpen ? " open" : ""}`}
        id="chatToggle"
        onClick={() => setIsOpen((v) => !v)}
      >
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <img
            id="chatToggleMascot"
            src={chatbotLogoSrc}
            className="chat-icon chatbot-mascot-img"
            alt="Mascot"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "50%",
            }}
          />
        )}
      </button>

      {/* Chatbox */}
      {isOpen && (
        <div className="chatbot-box open" id="chatBox">
          {/* Header */}
          <div className="chatbot-header">
            <div
              className="ch-avatar"
              style={{
                overflow: "hidden",
                width: 36,
                height: 36,
                borderRadius: "50%",
              }}
            >
              <img
                id="chatHeaderMascot"
                src={chatbotLogoSrc}
                alt="Mascot Avatar"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div className="ch-info">
              <h4>PL Assistant</h4>
              <p>Hỏi về Powerlifting &amp; Giải đấu</p>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" id="chatMessages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                {m.text.split("\n").map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < m.text.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {quickRepliesVisible && (
            <div className="quick-replies" id="quickReplies">
              {quickReplies.map((qr) => (
                <button
                  key={qr.text}
                  className="qr-btn"
                  onClick={() => sendMessage(qr.text)}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input">
            <input
              type="text"
              id="chatInput"
              placeholder="Nhập câu hỏi..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={() => sendMessage()}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}