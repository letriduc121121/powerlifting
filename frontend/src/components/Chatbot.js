import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Chatbot() {
  const { state } = useApp();
  const { images } = state;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Xin chào! 👋 Tôi có thể giúp bạn về thông tin giải đấu Powerlifting 2026. Bạn muốn hỏi gì?",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickRepliesVisible] = useState(true);
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

  const sendMessage = async (text) => {
    const msg = (text || inputVal).trim();
    if (!msg || isLoading) return;

    const currentMessages = [...messages, { role: "user", text: msg }];
    setMessages(currentMessages);
    setInputVal("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-6),
        }),
      });
      const data = await res.json();
      const reply = data.reply || "Đã có lỗi xảy ra, vui lòng thử lại.";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Không thể kết nối đến server. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
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

      {isOpen && (
        <div className="chatbot-box open" id="chatBox">
          <div className="chatbot-header">
            <div
              className="ch-avatar"
              style={{ overflow: "hidden", width: 36, height: 36, borderRadius: "50%" }}
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
            {isLoading && (
              <div className="msg bot">
                <span className="typing-indicator">
                  <span /><span /><span />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {quickRepliesVisible && (
            <div className="quick-replies" id="quickReplies">
              {quickReplies.map((qr) => (
                <button
                  key={qr.text}
                  className="qr-btn"
                  onClick={() => sendMessage(qr.text)}
                  disabled={isLoading}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input">
            <input
              type="text"
              id="chatInput"
              placeholder="Nhập câu hỏi..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button onClick={() => sendMessage()} disabled={isLoading}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}