import { useState, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";

function App() {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "history",
      JSON.stringify(history)
    );
  }, [history]);

  const analyzeKeyword = async () => {
    if (!keyword.trim()) return;

    try {
      setLoading(true);
      setTyping(true);

      const response = await fetch(
        "https://ai-market-97r6.onrender.com/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keyword,
          }),
        }
      );

      const data = await response.json();

      if (!history.includes(keyword)) {
        setHistory((prev) => [
          keyword,
          ...prev,
        ]);
      }

      setTimeout(() => {
        setResult(data);
        setTyping(false);
      }, 1200);

    } catch (error) {
      console.error(error);
      alert("Backend connection failed");
      setTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setKeyword("");
    setResult(null);
    setTyping(false);
  };

  const downloadPDF = () => {
    if (!result?.ai_report) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(
      "InfraBeat AI Report",
      10,
      10
    );

    const lines =
      doc.splitTextToSize(
        result.ai_report,
        180
      );

    doc.text(
      lines,
      10,
      25
    );

    doc.save(
      `${result.keyword}-report.pdf`
    );
  };

  return (
    <div className="app-layout">

      <Sidebar
        history={history}
        onNewChat={newChat}
      />

      <main className="main-content">

        {typing && (
          <div className="typing">
            🤖 InfraBeat AI is thinking...
          </div>
        )}

        {!result && !typing ? (
          <ChatArea
            keyword={keyword}
            setKeyword={setKeyword}
            loading={loading}
            analyzeKeyword={analyzeKeyword}
          />
        ) : null}

        {result && !typing && (
          <div className="chat-container">

            <div className="user-row">
              <div className="user-bubble">
                {result.keyword}
              </div>
            </div>

            <div className="assistant-row">

              <div className="assistant-avatar">
                🤖
              </div>

              <div className="assistant-message">

                <h2>
                  InfraBeat AI
                </h2>

                <div className="ai-report-text">
                  
                  <ReactMarkdown>
                    {result.ai_report}
                  </ReactMarkdown>
                </div>

                <div className="report-actions">

                  <button
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        result.ai_report
                      );

                      alert(
                        "Report copied!"
                      );
                    }}
                  >
                    📋 Copy Report
                  </button>

                  <button
                    className="pdf-btn"
                    onClick={downloadPDF}
                  >
                    📄 Download PDF
                  </button>

                </div>

                <h3>
                  📊 Market Statistics
                </h3>

                <div className="stats-grid">

                  <div className="stat-card">
                    <span>GitHub</span>
                    <h2>
                      {result.github_projects}
                    </h2>
                  </div>

                  <div className="stat-card">
                    <span>News</span>
                    <h2>
                      {result.news_articles}
                    </h2>
                  </div>

                  <div className="stat-card">
                    <span>Demand</span>
                    <h2>
                      {result.demand_score}
                    </h2>
                  </div>

                  <div className="stat-card">
                    <span>Competition</span>
                    <h2>
                      {result.competition_score}
                    </h2>
                  </div>

                </div>

                <h3>
                  🔥 Top GitHub Projects
                </h3>

                {result.top_projects?.map(
                  (project, index) => (
                    <div
                      key={index}
                      className="project-card"
                    >
                      <div>
                        <strong>
                          {project.name}
                        </strong>

                        <div>
                          ⭐ {project.stars}
                        </div>
                      </div>

                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    </div>
                  )
                )}

                <div className="verdict-box">
                  {result.verdict}
                </div>

                <button
                  className="new-analysis-btn"
                  onClick={newChat}
                >
                  New Analysis
                </button>

              </div>

            </div>

          </div>
        )}

        <div className="bottom-bar">

          <div className="bottom-inner">

            <input
              type="text"
              value={keyword}
              placeholder="Ask about any startup idea..."
              onChange={(e) =>
                setKeyword(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  analyzeKeyword();
                }
              }}
            />

            <button
              onClick={analyzeKeyword}
            >
              ➤
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default App;
